#!/usr/bin/env node

/**
 * Grant Application Submission API
 * Handles REGEN IRL grant application submissions
 */

import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { createTransport } from 'nodemailer';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.GRANT_API_PORT || 3007;

// PostgreSQL connection
const pool = new pg.Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/eliza'
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple in-memory rate limiting
const submissionAttempts = new Map();

function rateLimitMiddleware(req, res, next) {
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || req.connection.remoteAddress;
  const now = Date.now();
  
  // Clean old entries (older than 1 hour)
  for (const [key, value] of submissionAttempts) {
    if (now - value.lastAttempt > 3600000) {
      submissionAttempts.delete(key);
    }
  }
  
  // Check rate limit
  const userAttempts = submissionAttempts.get(ip) || { count: 0, lastAttempt: 0 };
  const timeSinceLastAttempt = now - userAttempts.lastAttempt;
  
  // Reset count if it's been more than 10 minutes
  if (timeSinceLastAttempt > 600000) {
    userAttempts.count = 0;
  }
  
  // Check limits
  if (userAttempts.count >= 5 && timeSinceLastAttempt < 600000) {
    return res.status(429).json({
      error: 'Too many submission attempts. Please wait 10 minutes before trying again.',
      retryAfter: Math.ceil((600000 - timeSinceLastAttempt) / 1000)
    });
  }
  
  // Update attempts
  userAttempts.count++;
  userAttempts.lastAttempt = now;
  submissionAttempts.set(ip, userAttempts);
  
  next();
}

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Email configuration (optional - set SMTP_* env vars to enable)
let emailTransporter = null;
if (process.env.SMTP_HOST) {
  emailTransporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
  console.log('Email notifications enabled');
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', service: 'Grant Submission API' });
});

// Get application statistics
app.get('/api/grants/stats', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM grant_application_stats');
    res.json(result.rows[0] || {
      total_applications: 0,
      unique_applicants: 0,
      avg_confidence: 0,
      avg_importance: 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Submit grant application (with rate limiting)
app.post('/api/grants/submit', rateLimitMiddleware, async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Extract form data
    const {
      projectTitle,
      projectSummary,
      projectCategory,
      otherCategory,
      proiGeneration,
      projectStage,
      timeline,
      grantImportance,
      confidence,
      projectUrl,
      email,
      walletAddress,
      supportingDocs,
      chatSessionId
    } = req.body;
    
    // Only email is required
    if (!email) {
      return res.status(400).json({
        error: 'Email address is required',
        missingFields: ['email']
      });
    }
    
    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    
    // Validate wallet address format only if provided
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return res.status(400).json({ error: 'Invalid wallet address format' });
    }
    
    // Get client IP
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.connection.remoteAddress;
    
    // Insert application
    const insertQuery = `
      INSERT INTO grant_applications (
        project_title, project_summary, project_category, other_category,
        proi_generation, project_stage, timeline,
        grant_importance, confidence, project_url,
        email, wallet_address,
        supporting_docs, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      RETURNING id, submitted_at
    `;
    
    const values = [
      projectTitle || null, 
      projectSummary || null, 
      projectCategory || null, 
      otherCategory || null,
      proiGeneration || null, 
      projectStage || null, 
      timeline || null,
      grantImportance ? parseInt(grantImportance) : null, 
      confidence ? parseInt(confidence) : null,
      projectUrl || null,
      email.toLowerCase(), 
      walletAddress || null,
      supportingDocs ? JSON.stringify(supportingDocs) : null,
      ipAddress, 
      req.headers['user-agent']
    ];
    
    const result = await client.query(insertQuery, values);
    const application = result.rows[0];
    
    // Store chat history if provided
    if (chatSessionId) {
      // This would store chat messages if we track them
      // For now, we'll just note the session ID
      console.log(`Application ${application.id} associated with chat session ${chatSessionId}`);
    }
    
    await client.query('COMMIT');
    
    // Send confirmation email if configured
    if (emailTransporter) {
      try {
        await sendConfirmationEmail(email, projectTitle, application.id);
        console.log(`Confirmation email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the submission if email fails
      }
    }
    
    // Log successful submission
    console.log(`✅ Grant application submitted:`, {
      id: application.id,
      projectTitle,
      email,
      category: projectCategory,
      confidence,
      importance: grantImportance
    });
    
    res.json({
      success: true,
      applicationId: application.id,
      submittedAt: application.submitted_at,
      message: 'Your grant application has been successfully submitted!'
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error submitting application:', error);
    
    // Check for duplicate submission
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'An application with this email/wallet has already been submitted'
      });
    }
    
    res.status(500).json({
      error: 'Failed to submit application. Please try again.'
    });
  } finally {
    client.release();
  }
});

// Get all applications (admin endpoint - should be protected in production)
app.get('/api/grants/applications', async (req, res) => {
  try {
    // In production, add authentication here
    const { status, category, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM grant_applications WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (status) {
      query += ` AND status = $${++paramCount}`;
      params.push(status);
    }
    
    if (category) {
      query += ` AND project_category = $${++paramCount}`;
      params.push(category);
    }
    
    query += ` ORDER BY submitted_at DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, params);
    
    res.json({
      applications: result.rows,
      total: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get single application by ID
app.get('/api/grants/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM grant_applications WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update application status (admin endpoint)
app.patch('/api/grants/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, review_notes, score } = req.body;
    
    const updateQuery = `
      UPDATE grant_applications 
      SET status = COALESCE($1, status),
          review_notes = COALESCE($2, review_notes),
          score = COALESCE($3, score),
          reviewed_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [status, review_notes, score, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Helper function to send confirmation email
async function sendConfirmationEmail(email, projectTitle, applicationId) {
  if (!emailTransporter) return;
  
  const mailOptions = {
    from: process.env.SMTP_FROM || 'noreply@gaiaai.xyz',
    to: email,
    subject: 'REGEN IRL Grant Application Received',
    html: `
      <h2>Thank you for your grant application!</h2>
      <p>We have received your application for the REGEN IRL Grant Competition.</p>
      <p><strong>Project:</strong> ${projectTitle}</p>
      <p><strong>Application ID:</strong> ${applicationId}</p>
      <p>Our team will review your application and contact you if you are selected as a winner.</p>
      <p>All qualifying applicants will receive $10 in $REGEN tokens to the wallet address provided.</p>
      <br>
      <p>Best of luck!</p>
      <p>The REGEN IRL Team</p>
    `
  };
  
  return emailTransporter.sendMail(mailOptions);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Grant Submission API running on port ${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/health`);
  console.log(`   Submit endpoint: POST /api/grants/submit`);
  console.log(`   Stats endpoint: GET /api/grants/stats`);
  console.log(`   Applications: GET /api/grants/applications`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});