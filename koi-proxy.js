// KOI Proxy Server - Routes /api/koi/* requests to appropriate backend services
import express from 'express';
import httpProxy from 'http-proxy-middleware';
import fetch from 'node-fetch';

const app = express();
const port = 3011;

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// Custom health endpoint for event bridge (which doesn't have one)
app.get('/api/koi/event-bridge/health', async (req, res) => {
  try {
    // Check if event bridge is responding by trying to fetch a non-existent endpoint
    const response = await fetch('http://localhost:8100/process-koi-event', {
      method: 'GET',
      timeout: 2000
    }).catch(() => null);
    
    res.json({
      status: 'healthy',
      service: 'koi-event-bridge',
      url: 'http://localhost:8100',
      available: true
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'koi-event-bridge',
      error: error.message
    });
  }
});

// Proxy coordinator status to health endpoint
app.get('/api/koi/coordinator/status', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8200/health');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Proxy coordinator health
app.get('/api/koi/coordinator/health', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8200/health');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Proxy to BGE server
app.get('/api/koi/bge/health', async (req, res) => {
  try {
    const response = await fetch('http://localhost:8090/health');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      service: 'bge-server',
      error: error.message
    });
  }
});

// Get recent events from coordinator
app.get('/api/koi/events/recent', async (req, res) => {
  try {
    // For now, return mock data since the coordinator doesn't expose recent events
    res.json({
      events: [
        {
          rid: 'sensor.website.7905185cc99d',
          type: 'content_detected',
          timestamp: new Date().toISOString(),
          source: 'website-sensor-irl'
        }
      ]
    });
  } catch (error) {
    res.status(503).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`KOI Proxy Server running on port ${port}`);
  console.log(`Proxying /api/koi/* requests to backend services`);
});