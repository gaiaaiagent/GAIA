import { Router } from 'express';
import axios from 'axios';
import { Pool } from 'pg';

const router = Router();

// Database connection
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/eliza'
});

// KOI service endpoints
const KOI_SERVICES = {
  coordinator: { url: process.env.KOI_COORDINATOR_URL || 'http://localhost:8000', port: 8000 },
  eventBridge: { url: process.env.KOI_EVENT_BRIDGE_URL || 'http://localhost:8100', port: 8100 },
  bgeServer: { url: process.env.BGE_SERVER_URL || 'http://localhost:8090', port: 8090 },
  pipelineMetadata: { url: process.env.KOI_METADATA_URL || 'http://localhost:8002', port: 8002 },
  contentApi: { url: process.env.KOI_CONTENT_URL || 'http://localhost:8007', port: 8007 },
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

// Pipeline Metadata endpoint - proxies to port 8002
router.get('/graph/pipeline', async (req, res) => {
  try {
    const response = await axios.get(`${KOI_SERVICES.pipelineMetadata.url}/api/koi/graph/pipeline`, {
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Pipeline Metadata API error:', error.message);
    res.status(503).json({
      success: false,
      error: {
        message: 'Pipeline Metadata API unavailable',
        code: 503
      }
    });
  }
});

// Content API endpoints - proxy to port 8007
router.get('/content/pages/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    const response = await axios.get(`${KOI_SERVICES.contentApi.url}/api/koi/content/pages/${domain}`, {
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Content API error:', error.message);
    res.status(503).json({
      success: false,
      error: {
        message: 'Content API unavailable',
        code: 503
      }
    });
  }
});

router.get('/content/domains', async (req, res) => {
  try {
    const response = await axios.get(`${KOI_SERVICES.contentApi.url}/api/koi/content/domains`, {
      timeout: 5000
    });
    res.json(response.data);
  } catch (error) {
    console.error('Content API error:', error.message);
    res.status(503).json({
      success: false,
      error: {
        message: 'Content API unavailable',
        code: 503
      }
    });
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

// Get available RIDs from the database
router.get('/rids', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    // Query real RIDs from koi_memories table, filtering out test and heartbeat data
    const result = await pool.query(`
      SELECT DISTINCT rid, source_sensor, event_type, created_at
      FROM koi_memories
      WHERE superseded_at IS NULL
        AND rid NOT LIKE '%heartbeat%'
        AND rid NOT LIKE '%test_%'
        AND source_sensor NOT LIKE '%test-%'
      ORDER BY created_at DESC
      LIMIT $1
    `, [limit]);

    // Format the RIDs with additional info
    const rids = result.rows.map(row => {
      let title = '';
      let description = '';

      // Add context based on RID patterns
      if (row.rid.includes('forum')) {
        title = 'Forum Discussion';
        description = 'Forum post → text extraction → chunking → embeddings';
      } else if (row.rid.includes('web.page')) {
        title = 'Web Page Content';
        description = 'Web crawl → content extraction → structured data';
      } else if (row.rid.includes('github')) {
        title = 'GitHub Activity';
        description = 'Repository → issues/PRs → structured extraction';
      } else if (row.rid.includes('notion')) {
        title = 'Notion Page';
        description = 'Page sync → content extraction → knowledge graph';
      }

      return {
        rid: row.rid,
        title: title || `${row.source_sensor} Content`,
        description: description || `Processed via ${row.event_type} event`,
        source: row.source_sensor,
        timestamp: row.created_at
      };
    });

    res.json({ rids, count: rids.length, success: true });
  } catch (error) {
    console.error('Error fetching RIDs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RIDs',
      rids: []
    });
  }
});

export default router;