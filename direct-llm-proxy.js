#!/usr/bin/env node

/**
 * Direct LLM Proxy for Grant Form
 * Provides direct OpenAI API access without character personalities
 */

import http from 'http';
import url from 'url';

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Accept',
  'Content-Type': 'application/json'
};

// OpenAI API configuration (uses environment variables)
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.TEXT_MODEL || 'gpt-4o-mini';

if (!OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY environment variable not set');
  console.error('Please set: export OPENAI_API_KEY=your-api-key');
  process.exit(1);
}

// Helper to make OpenAI API requests
async function callOpenAI(systemPrompt, userPrompt, maxTokens = 200, temperature = 0.3) {
  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    max_tokens: maxTokens,
    temperature: temperature
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  console.log(`${method} ${pathname}`);

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Route: GET /health - Health check
  if (pathname === '/health' && method === 'GET') {
    res.writeHead(200, corsHeaders);
    res.end(JSON.stringify({ 
      status: 'healthy',
      model: OPENAI_MODEL,
      apiKeySet: !!OPENAI_API_KEY
    }));
    return;
  }

  // Route: POST /direct-llm - Direct LLM call
  if (pathname === '/direct-llm' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        if (!body || body.trim() === '') {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ 
            success: false, 
            error: 'No request body provided' 
          }));
          return;
        }

        const data = JSON.parse(body);
        const { systemPrompt, userPrompt, maxTokens, temperature } = data;

        if (!systemPrompt || !userPrompt) {
          res.writeHead(400, corsHeaders);
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Missing systemPrompt or userPrompt' 
          }));
          return;
        }

        console.log('Processing LLM request...');
        console.log('System prompt:', systemPrompt.substring(0, 100) + '...');
        console.log('User prompt:', userPrompt.substring(0, 100) + '...');

        const response = await callOpenAI(
          systemPrompt,
          userPrompt,
          maxTokens || 200,
          temperature || 0.3
        );

        console.log('LLM response:', response.substring(0, 100) + '...');

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ 
          success: true,
          text: response,
          model: OPENAI_MODEL
        }));

      } catch (error) {
        console.error('Error processing request:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Failed to process LLM request',
          details: error.message
        }));
      }
    });
    return;
  }

  // Route: POST /api/direct-llm - Alternative path for nginx routing
  if (pathname === '/api/direct-llm' && method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { systemPrompt, userPrompt, maxTokens, temperature } = data;

        const response = await callOpenAI(
          systemPrompt,
          userPrompt,
          maxTokens || 200,
          temperature || 0.3
        );

        res.writeHead(200, corsHeaders);
        res.end(JSON.stringify({ 
          success: true,
          text: response,
          model: OPENAI_MODEL
        }));

      } catch (error) {
        console.error('Error:', error);
        res.writeHead(500, corsHeaders);
        res.end(JSON.stringify({ 
          success: false, 
          error: error.message
        }));
      }
    });
    return;
  }

  // 404 for unknown routes
  res.writeHead(404, corsHeaders);
  res.end(JSON.stringify({ 
    success: false, 
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET /health',
      'POST /direct-llm',
      'POST /api/direct-llm'
    ]
  }));
});

// Start server
const PORT = process.env.LLM_PORT || 3006;
server.listen(PORT, () => {
  console.log(`Direct LLM Proxy running on port ${PORT}`);
  console.log(`Model: ${OPENAI_MODEL}`);
  console.log(`API Key: ${OPENAI_API_KEY ? 'Set' : 'NOT SET'}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  http://localhost:${PORT}/health`);
  console.log(`  POST http://localhost:${PORT}/direct-llm`);
  console.log(`  POST http://localhost:${PORT}/api/direct-llm`);
});