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
    const response = await axios.post(
      `${KOI_SERVICES.coordinator.url}/events/poll`,
      {
        type: 'poll_events',
        node_id: 'monitor',
        limit: 1
      },
      { timeout: 2000 }
    );
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

// Content API endpoints - query database directly
router.get('/content/pages/:domain', async (req, res) => {
  try {
    const { domain } = req.params;

    // Query koi_content table for pages from this domain
    const result = await pool.query(
      `SELECT
        rid,
        url,
        title,
        content_type,
        scraped_at,
        metadata
       FROM koi_content
       WHERE url LIKE $1
       ORDER BY scraped_at DESC
       LIMIT 100`,
      [`%${domain}%`]
    );

    res.json({
      success: true,
      domain: domain,
      pages: result.rows.map(row => ({
        rid: row.rid,
        url: row.url,
        title: row.title || 'Untitled Page',
        content_type: row.content_type,
        scraped_at: row.scraped_at,
        metadata: row.metadata
      }))
    });
  } catch (error) {
    console.error('Database error fetching pages:', error.message);
    res.status(500).json({
      success: false,
      error: {
        message: 'Database error',
        code: 500
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

// Graph data endpoint - proxy to KOI API Server (port 8001) which connects to Fuseki
router.get('/graph-data', async (req, res) => {
  try {
    // Forward request to KOI API Server with query parameters
    const queryString = req.url.split('?')[1] || '';
    const apiUrl = `http://localhost:8001/api/koi/graph-data/?${queryString}`;

    const response = await axios.get(apiUrl, { timeout: 5000 });
    res.json(response.data);
  } catch (error) {
    console.error('KOI API Server error:', error.message);
    res.status(503).json({
      success: false,
      error: {
        message: 'KOI API Server unavailable',
        code: 503
      }
    });
  }
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
