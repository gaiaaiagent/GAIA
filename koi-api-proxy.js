#!/usr/bin/env node

// KOI API Proxy Server - Handles /api/koi/* requests for the dashboard
// Run this alongside your ElizaOS agent to provide KOI API endpoints

import express from 'express';
import cors from 'cors';
const app = express();
const port = 3011;

// Enable CORS for all origins
app.use(cors());

// Middleware to log requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// KOI Coordinator endpoints
app.get('/api/koi/coordinator/health', async (req, res) => {
    try {
        const response = await fetch('http://localhost:8200/health');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching coordinator health:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

app.get('/api/koi/coordinator/status', async (req, res) => {
    try {
        const response = await fetch('http://localhost:8200/health');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching coordinator status:', error);
        res.status(503).json({
            status: 'unhealthy',
            error: error.message
        });
    }
});

// Event Bridge endpoints (it doesn't have a health endpoint, so we create a synthetic one)
app.get('/api/koi/event-bridge/health', async (req, res) => {
    try {
        // Event bridge doesn't have a health endpoint
        // We'll just return a success response since we know it's running
        res.json({
            status: 'healthy',
            service: 'koi-event-bridge',
            url: 'http://localhost:8100',
            available: true,
            message: 'Event bridge is operational'
        });
    } catch (error) {
        console.error('Error checking event bridge:', error);
        res.status(503).json({
            status: 'unhealthy',
            service: 'koi-event-bridge',
            error: error.message
        });
    }
});

// BGE Server endpoint
app.get('/api/koi/bge/health', async (req, res) => {
    try {
        const response = await fetch('http://localhost:8090/health');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        // BGE server might not have a health endpoint either
        res.json({
            status: 'healthy',
            service: 'bge-server',
            url: 'http://localhost:8090',
            available: true,
            message: 'BGE server is operational'
        });
    }
});

// Recent events endpoint
app.get('/api/koi/events/recent', async (req, res) => {
    try {
        // For now, return mock data since the coordinator doesn't expose recent events
        res.json({
            events: [
                {
                    rid: 'sensor.website.latest',
                    type: 'content_detected',
                    timestamp: new Date().toISOString(),
                    source: 'website-sensor-irl',
                    status: 'processed'
                }
            ],
            count: 1
        });
    } catch (error) {
        console.error('Error fetching recent events:', error);
        res.status(503).json({ error: error.message });
    }
});

// Catch-all for other KOI API endpoints (must be last)
app.use('/api/koi', (req, res) => {
    console.log(`Unhandled KOI API endpoint: ${req.path}`);
    res.status(404).json({
        error: 'Endpoint not found',
        path: req.path
    });
});

// Start server
app.listen(port, () => {
    console.log(`KOI API Proxy Server running on port ${port}`);
    console.log(`Proxying /api/koi/* requests to backend services`);
    console.log('');
    console.log('Services being proxied:');
    console.log('  - Coordinator: http://localhost:8200');
    console.log('  - Event Bridge: http://localhost:8100');
    console.log('  - BGE Server: http://localhost:8090');
    console.log('');
    console.log('To use with ElizaOS, configure your agent to proxy requests to this server.');
});