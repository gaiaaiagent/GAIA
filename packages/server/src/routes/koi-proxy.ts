import { Router } from 'express';
import axios from 'axios';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const router = Router();

// Service endpoints
const SERVICES = {
  coordinator: 'http://localhost:8005',
  eventBridge: 'http://localhost:8100',
  bge: 'http://localhost:8090',
  mcp: 'http://localhost:8200',
  jena: 'http://localhost:3030'
};

// KOI Coordinator health
router.get('/coordinator/health', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.coordinator}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Service unavailable' });
  }
});

// Event Bridge status
router.get('/event-bridge/status', async (req, res) => {
  try {
    // Check if the process is running
    const { stdout } = await execAsync('ps aux | grep -E "koi_event_bridge" | grep -v grep | wc -l');
    const isRunning = parseInt(stdout.trim()) > 0;

    if (isRunning) {
      res.json({
        status: 'operational',
        service: 'Event Bridge',
        database_connected: true
      });
    } else {
      res.status(503).json({ status: 'offline' });
    }
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Service check failed' });
  }
});

// BGE Server health
router.get('/bge/health', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.bge}/health`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Service unavailable' });
  }
});

// PostgreSQL status
router.get('/database/status', async (req, res) => {
  try {
    const { stdout } = await execAsync('docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT 1" 2>/dev/null | grep -c "1 row"');
    const isConnected = parseInt(stdout.trim()) > 0;

    if (isConnected) {
      res.json({
        status: 'connected',
        service: 'PostgreSQL',
        database: 'eliza',
        database_connected: true
      });
    } else {
      res.status(503).json({ status: 'offline' });
    }
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Database unavailable' });
  }
});

// Apache Jena ping
router.get('/jena/ping', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.jena}/$/ping`);
    res.json({
      status: 'connected',
      service: 'Apache Jena',
      timestamp: response.data
    });
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Service unavailable' });
  }
});

// MCP Server status
router.get('/mcp/', async (req, res) => {
  try {
    // Check if MCP server is running
    const { stdout } = await execAsync('ps aux | grep -E "bge.*mcp" | grep -v grep | wc -l');
    const isRunning = parseInt(stdout.trim()) > 0;

    if (isRunning) {
      res.json({
        status: 'operational',
        service: 'MCP Server'
      });
    } else {
      res.status(503).json({ status: 'offline' });
    }
  } catch (error) {
    res.status(503).json({ status: 'offline', error: 'Service check failed' });
  }
});

// Forward coordinator sensors endpoint
router.get('/coordinator/sensors', async (req, res) => {
  try {
    const response = await axios.get(`${SERVICES.coordinator}/sensors`);
    res.json(response.data);
  } catch (error) {
    res.status(503).json({ sensors: [] });
  }
});

export default router;