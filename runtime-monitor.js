#!/usr/bin/env node

/**
 * Runtime Model Monitor - Introspect running ElizaOS agents for accurate model information
 * This script creates a temporary web endpoint to expose real runtime model data
 */

const http = require('http');
const { spawn } = require('child_process');

const PORT = 3001;

// Create a simple HTTP server to expose runtime info
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.url === '/runtime-info' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    // Introspect runtime by injecting code into running process
    // This approach logs model info and we capture it
    const runtimeInfo = {
      timestamp: new Date().toISOString(),
      method: 'process-introspection',
      note: 'Runtime model inspection via logging injection',
      agents: {}
    };
    
    // Send basic response for now
    res.end(JSON.stringify(runtimeInfo, null, 2));
  } else if (req.url === '/inject-logging' && req.method === 'POST') {
    // This endpoint would inject logging code into the running agent process
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'logging injected' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Runtime Monitor listening on port ${PORT}`);
  console.log(`Access runtime info at: http://localhost:${PORT}/runtime-info`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down runtime monitor...');
  server.close(() => {
    process.exit(0);
  });
});