// Simple Node.js server for REGEN IRL Grant Applications
const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3005;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Data storage directory
const DATA_DIR = path.join(__dirname, 'data');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');

// Initialize data directory and file
async function initStorage() {
    try {
        await fs.mkdir(DATA_DIR, { recursive: true });
        
        try {
            await fs.access(SUBMISSIONS_FILE);
        } catch {
            // File doesn't exist, create it with empty array
            await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify([], null, 2));
            console.log('Created submissions.json file');
        }
    } catch (error) {
        console.error('Error initializing storage:', error);
    }
}

// Load submissions from file
async function loadSubmissions() {
    try {
        const data = await fs.readFile(SUBMISSIONS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading submissions:', error);
        return [];
    }
}

// Save submissions to file
async function saveSubmissions(submissions) {
    try {
        await fs.writeFile(SUBMISSIONS_FILE, JSON.stringify(submissions, null, 2));
    } catch (error) {
        console.error('Error saving submissions:', error);
    }
}

// API Routes

// Submit new application
app.post('/api/grants/submit', async (req, res) => {
    try {
        const submission = {
            id: uuidv4(),
            ...req.body,
            status: 'pending',
            submitted_at: new Date().toISOString(),
            ip_address: req.ip
        };
        
        // Map field names to match dashboard expectations
        const mappedSubmission = {
            id: submission.id,
            project_title: submission.projectTitle,
            project_summary: submission.projectSummary,
            project_category: submission.projectCategory,
            other_category: submission.otherCategory,
            proi_generation: submission.proiGeneration,
            project_stage: submission.projectStage,
            timeline: submission.timeline,
            grant_importance: submission.grantImportance,
            confidence: submission.confidence,
            project_url: submission.projectUrl,
            email: submission.email,
            wallet_address: submission.walletAddress,
            status: submission.status,
            submitted_at: submission.submitted_at,
            chat_history: submission.chatHistory || []
        };
        
        const submissions = await loadSubmissions();
        submissions.push(mappedSubmission);
        await saveSubmissions(submissions);
        
        res.json({
            success: true,
            applicationId: submission.id,
            message: 'Application submitted successfully'
        });
        
        console.log(`New submission: ${submission.id} from ${submission.email}`);
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ error: 'Failed to submit application' });
    }
});

// Get all applications with filtering
app.get('/api/grants/applications', async (req, res) => {
    try {
        let submissions = await loadSubmissions();
        
        // Apply filters
        const { status, category, limit = 100 } = req.query;
        
        if (status) {
            submissions = submissions.filter(s => s.status === status);
        }
        
        if (category) {
            submissions = submissions.filter(s => s.project_category === category);
        }
        
        // Sort by newest first
        submissions.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
        
        // Limit results
        submissions = submissions.slice(0, parseInt(limit));
        
        res.json({ applications: submissions });
    } catch (error) {
        console.error('Error loading applications:', error);
        res.status(500).json({ error: 'Failed to load applications' });
    }
});

// Get statistics
app.get('/api/grants/stats', async (req, res) => {
    try {
        const submissions = await loadSubmissions();
        
        const stats = {
            total_applications: submissions.length,
            pending_count: submissions.filter(s => s.status === 'pending').length,
            approved_count: submissions.filter(s => s.status === 'approved').length,
            rejected_count: submissions.filter(s => s.status === 'rejected').length,
            avg_confidence: submissions.length > 0 
                ? (submissions.reduce((sum, s) => sum + (parseInt(s.confidence) || 0), 0) / submissions.length).toFixed(1)
                : 0,
            avg_importance: submissions.length > 0
                ? (submissions.reduce((sum, s) => sum + (parseInt(s.grant_importance) || 0), 0) / submissions.length).toFixed(1)
                : 0
        };
        
        res.json(stats);
    } catch (error) {
        console.error('Error calculating stats:', error);
        res.status(500).json({ error: 'Failed to calculate statistics' });
    }
});

// Update application status
app.patch('/api/grants/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status, review_notes } = req.body;
        
        const submissions = await loadSubmissions();
        const index = submissions.findIndex(s => s.id === id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        submissions[index].status = status || submissions[index].status;
        submissions[index].review_notes = review_notes || submissions[index].review_notes;
        submissions[index].reviewed_at = new Date().toISOString();
        
        await saveSubmissions(submissions);
        
        res.json({ success: true, application: submissions[index] });
    } catch (error) {
        console.error('Error updating application:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

// Delete application (admin only)
app.delete('/api/grants/applications/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        let submissions = await loadSubmissions();
        const initialLength = submissions.length;
        submissions = submissions.filter(s => s.id !== id);
        
        if (submissions.length === initialLength) {
            return res.status(404).json({ error: 'Application not found' });
        }
        
        await saveSubmissions(submissions);
        
        res.json({ success: true, message: 'Application deleted' });
    } catch (error) {
        console.error('Error deleting application:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

// LLM API proxy (for the chat functionality)
app.post('/api/llm', async (req, res) => {
    // This would connect to your actual LLM service
    // For now, return a mock response
    res.json({
        content: "This is a mock response. Connect to your actual LLM service here."
    });
});

// Direct LLM API for field suggestions
app.post('/api/direct-llm', async (req, res) => {
    // This would connect to your actual LLM service
    // For now, return a mock response
    const { systemPrompt, userPrompt } = req.body;
    
    res.json({
        text: "Mock suggestion based on user input",
        response: "Mock suggestion"
    });
});

// Initialize and start server
async function start() {
    await initStorage();
    
    app.listen(PORT, () => {
        console.log(`Grant application server running on http://localhost:${PORT}`);
        console.log(`Admin dashboard: http://localhost:${PORT}/grant-admin.html`);
        console.log(`Application form: http://localhost:${PORT}/index.html`);
    });
}

start();