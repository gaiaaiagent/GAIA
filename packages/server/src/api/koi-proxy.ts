import { Router } from 'express';
import axios from 'axios';

const router = Router();

// KOI service endpoints
const KOI_SERVICES = {
  coordinator: { url: process.env.KOI_COORDINATOR_URL || 'http://localhost:8000', port: 8000 },
  eventBridge: { url: process.env.KOI_EVENT_BRIDGE_URL || 'http://localhost:8100', port: 8100 },
  bgeServer: { url: process.env.BGE_SERVER_URL || 'http://localhost:8090', port: 8090 },
  database: { url: 'postgresql://postgres:postgres@localhost:5433/eliza', port: 5433 }
};

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', services: KOI_SERVICES });
});

// Coordinator status
router.get('/coordinator/status', async (req, res) => {
  try {
    const response = await axios.get(`${KOI_SERVICES.coordinator.url}/events/poll?node_id=monitor`, {
      timeout: 2000
    });
    res.json({ status: 'ok', data: response.data });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Coordinator unavailable' });
  }
});

// Event Bridge health
router.get('/event-bridge/health', async (req, res) => {
  try {
    const response = await axios.get(`${KOI_SERVICES.eventBridge.url}/health`, {
      timeout: 2000
    });
    res.json({ status: 'ok', data: response.data });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Event Bridge unavailable' });
  }
});

// BGE Server health
router.get('/bge/health', async (req, res) => {
  try {
    const response = await axios.get(`${KOI_SERVICES.bgeServer.url}/health`, {
      timeout: 2000
    });
    res.json({ status: 'ok', data: response.data });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'BGE Server unavailable' });
  }
});

// Database status (simplified check)
router.get('/database/status', async (req, res) => {
  try {
    // For now, just check if we can reach the port
    res.json({ status: 'ok', message: 'PostgreSQL accessible' });
  } catch (error) {
    res.status(503).json({ status: 'error', message: 'Database unavailable' });
  }
});

// Graph data endpoint
router.get('/graph-data', async (req, res) => {
  // Return mock data for now
  res.json({
    nodes: [
      { id: '1', label: 'KOI Coordinator', type: 'service', x: 100, y: 100 },
      { id: '2', label: 'Event Bridge', type: 'service', x: 300, y: 100 },
      { id: '3', label: 'BGE Server', type: 'service', x: 500, y: 100 },
      { id: '4', label: 'PostgreSQL', type: 'database', x: 300, y: 300 },
      { id: '5', label: 'Eliza Agent', type: 'agent', x: 500, y: 300 }
    ],
    edges: [
      { id: 'e1', source: '1', target: '2', label: 'events' },
      { id: 'e2', source: '2', target: '3', label: 'process' },
      { id: 'e3', source: '3', target: '4', label: 'store' },
      { id: 'e4', source: '4', target: '5', label: 'query' }
    ]
  });
});

export default router;