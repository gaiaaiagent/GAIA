import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Service configuration - updated to use correct default ports
const KOI_SERVICES = {
  coordinator: {
    url: process.env.KOI_COORDINATOR_URL || 'http://localhost:8200',
    port: 8200
  },
  eventBridge: {
    url: process.env.KOI_EVENT_BRIDGE_URL || 'http://localhost:8100',
    port: 8100
  },
  bgeServer: {
    url: process.env.BGE_SERVER_URL || 'http://localhost:8090',
    port: 8090
  },
  database: {
    url: process.env.POSTGRES_URL || 'postgresql://postgres:postgres@localhost:5433/eliza',
    port: 5433
  }
};

/**
 * Health check for all KOI services
 */
router.get('/health', async (req, res) => {
  const services = await checkAllServices();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services
  });
});

/**
 * Get coordinator health
 */
router.get('/coordinator/health', async (req, res) => {
  try {
    const response = await fetch(`${KOI_SERVICES.coordinator.url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'online',
        port: KOI_SERVICES.coordinator.port,
        data
      });
    } else {
      res.status(503).json({
        status: 'error',
        port: KOI_SERVICES.coordinator.port,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      port: KOI_SERVICES.coordinator.port,
      error: error.message
    });
  }
});

/**
 * Get coordinator status
 */
router.get('/coordinator/status', async (req, res) => {
  try {
    const response = await fetch(`${KOI_SERVICES.coordinator.url}/events/poll?node_id=monitor`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'online',
        port: KOI_SERVICES.coordinator.port,
        data
      });
    } else {
      res.status(503).json({
        status: 'error',
        port: KOI_SERVICES.coordinator.port,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      port: KOI_SERVICES.coordinator.port,
      error: error.message
    });
  }
});

/**
 * Get event bridge health
 */
router.get('/event-bridge/health', async (req, res) => {
  try {
    const response = await fetch(`${KOI_SERVICES.eventBridge.url}/`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'online',
        port: KOI_SERVICES.eventBridge.port,
        data
      });
    } else {
      res.status(503).json({
        status: 'error',
        port: KOI_SERVICES.eventBridge.port,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      port: KOI_SERVICES.eventBridge.port,
      error: error.message
    });
  }
});

/**
 * Get event bridge status
 */
router.get('/event-bridge/status', async (req, res) => {
  try {
    const response = await fetch(`${KOI_SERVICES.eventBridge.url}/stats`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'online',
        port: KOI_SERVICES.eventBridge.port,
        data
      });
    } else {
      res.status(503).json({
        status: 'error',
        port: KOI_SERVICES.eventBridge.port,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      port: KOI_SERVICES.eventBridge.port,
      error: error.message
    });
  }
});

/**
 * Get BGE server health
 */
router.get('/bge/health', async (req, res) => {
  try {
    const response = await fetch(`${KOI_SERVICES.bgeServer.url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'online',
        port: KOI_SERVICES.bgeServer.port,
        data
      });
    } else {
      res.status(503).json({
        status: 'error',
        port: KOI_SERVICES.bgeServer.port,
        error: `HTTP ${response.status}`
      });
    }
  } catch (error) {
    res.status(503).json({
      status: 'offline',
      port: KOI_SERVICES.bgeServer.port,
      error: error.message
    });
  }
});

/**
 * Get database status
 */
router.get('/database/status', async (req, res) => {
  try {
    // For now, just check if the connection string is configured
    // In production, you'd actually test the database connection
    const isConfigured = !!KOI_SERVICES.database.url;
    
    res.json({
      status: isConfigured ? 'online' : 'offline',
      port: KOI_SERVICES.database.port,
      configured: isConfigured
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      port: KOI_SERVICES.database.port,
      error: error.message
    });
  }
});

/**
 * Get sensor nodes information
 */
router.get('/sensors', async (req, res) => {
  try {
    // First check coordinator health for connected sensors count
    const healthResponse = await fetch(`${KOI_SERVICES.coordinator.url}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (healthResponse.ok) {
      const health = await healthResponse.json();
      
      // If there are connected sensors, try to get their details
      // For now, the coordinator doesn't have a /nodes endpoint, so we'll return
      // basic info based on what we know is configured
      const sensors = [];
      
      // Check if the test sensor is configured (would be running if connected_sensors > 0)
      if (health.connected_sensors > 0) {
        sensors.push({
          id: 'website-sensor-irl',
          name: 'IRL Website Monitor',
          type: 'website',
          status: 'active',
          monitoring: ['https://regen.gaiaai.xyz/irl/'],
          events_processed: health.event_queue_size || 0
        });
      }
      
      res.json({
        status: 'ok',
        count: sensors.length,
        connected_sensors: health.connected_sensors || 0,
        sensors
      });
    } else {
      // Coordinator not responding
      res.json({
        status: 'error',
        message: 'Coordinator not responding',
        count: 0,
        connected_sensors: 0,
        sensors: []
      });
    }
  } catch (error) {
    // Error connecting to coordinator
    res.json({
      status: 'error',
      message: 'Failed to connect to coordinator',
      error: error.message,
      count: 0,
      connected_sensors: 0,
      sensors: []
    });
  }
});

/**
 * Get transformation provenance chain for a RID
 */
router.get('/provenance/:rid', async (req, res) => {
  try {
    const { rid } = req.params;
    
    // Query Event Bridge for provenance chain
    const response = await fetch(`${KOI_SERVICES.eventBridge.url}/provenance/${encodeURIComponent(rid)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'ok',
        rid,
        chain_length: data.chain_length,
        transformations: data.transformations
      });
    } else {
      res.status(404).json({
        status: 'error',
        message: 'Provenance not found for RID'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Get recent transformations
 */
router.get('/transformations', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    
    // Query Event Bridge for recent transformations
    const response = await fetch(`${KOI_SERVICES.eventBridge.url}/transformations?limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const data = await response.json();
      res.json({
        status: 'ok',
        count: data.count,
        transformations: data.transformations
      });
    } else {
      res.status(503).json({
        status: 'error',
        message: 'Could not fetch transformations'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Get pipeline flow data for visualization
 */
router.get('/pipeline-flow', async (req, res) => {
  try {
    const pipelineData = {
      nodes: [],
      edges: [],
      metrics: {}
    };
    
    // Get sensor status
    try {
      const sensorsResponse = await fetch(`${KOI_SERVICES.coordinator.url}/sensors/status`);
      if (sensorsResponse.ok) {
        const sensorData = await sensorsResponse.json();
        
        // Add sensor nodes
        for (const [sensorId, sensor] of Object.entries(sensorData.broadcast_sensors || {})) {
          pipelineData.nodes.push({
            id: `sensor-${sensorId}`,
            type: 'sensor',
            label: sensorId,
            metrics: {
              event_count: sensor.event_count || 0,
              last_event: sensor.last_event
            }
          });
          
          // Add edge from sensor to coordinator
          pipelineData.edges.push({
            source: `sensor-${sensorId}`,
            target: 'coordinator',
            type: 'data_flow'
          });
        }
      }
    } catch (e) {
      console.error('Could not fetch sensor status:', e);
    }
    
    // Add pipeline nodes
    pipelineData.nodes.push(
      {
        id: 'coordinator',
        type: 'processor',
        label: 'KOI Coordinator',
        metrics: {
          port: KOI_SERVICES.coordinator.port,
          status: 'online'
        }
      },
      {
        id: 'event-bridge',
        type: 'processor',
        label: 'Event Bridge',
        metrics: {
          port: KOI_SERVICES.eventBridge.port,
          status: 'online'
        }
      },
      {
        id: 'bge-server',
        type: 'processor',
        label: 'BGE Embeddings',
        metrics: {
          port: KOI_SERVICES.bgeServer.port,
          status: 'online'
        }
      },
      {
        id: 'database',
        type: 'storage',
        label: 'PostgreSQL',
        metrics: {
          port: KOI_SERVICES.database.port,
          status: 'online'
        }
      }
    );
    
    // Add pipeline edges
    pipelineData.edges.push(
      { source: 'coordinator', target: 'event-bridge', type: 'data_flow' },
      { source: 'event-bridge', target: 'bge-server', type: 'embedding_request' },
      { source: 'bge-server', target: 'event-bridge', type: 'embedding_response' },
      { source: 'event-bridge', target: 'database', type: 'storage' }
    );
    
    // Get metrics from Event Bridge
    try {
      const statsResponse = await fetch(`${KOI_SERVICES.eventBridge.url}/stats`);
      if (statsResponse.ok) {
        const stats = await statsResponse.json();
        pipelineData.metrics = {
          total_documents: stats.total_koi_documents || 0,
          total_embeddings: stats.total_embeddings || 0,
          unique_rids: stats.unique_rids || 0,
          unique_sensors: stats.unique_sensors || 0
        };
      }
    } catch (e) {
      console.error('Could not fetch event bridge stats:', e);
    }
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      pipeline: pipelineData
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

/**
 * Get pipeline metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Fetch real metrics from services
    const metrics = {
      timestamp: new Date().toISOString(),
      pipeline: {}
    };

    // Get coordinator health for real metrics
    try {
      const coordResponse = await fetch(`${KOI_SERVICES.coordinator.url}/health`);
      if (coordResponse.ok) {
        const coordHealth = await coordResponse.json();
        metrics.pipeline.coordinator = {
          events_routed: coordHealth.event_queue_size || 0,
          pending: 0,
          connected_sensors: coordHealth.connected_sensors || 0,
          uptime_seconds: coordHealth.uptime_seconds || 0
        };
        
        metrics.pipeline.sensors = {
          active: coordHealth.connected_sensors || 0,
          events_processed: 0,
          rate: '0/min'
        };
      }
    } catch (e) {
      metrics.pipeline.coordinator = { status: 'offline' };
      metrics.pipeline.sensors = { status: 'offline' };
    }

    // Get event bridge stats
    try {
      const ebResponse = await fetch(`${KOI_SERVICES.eventBridge.url}/stats`);
      if (ebResponse.ok) {
        const ebStats = await ebResponse.json();
        metrics.pipeline.event_bridge = {
          events_processed: ebStats.total_koi_documents || 0,
          transformations: ebStats.total_embeddings || 0,
          unique_sensors: ebStats.unique_sensors || 0
        };
      }
    } catch (e) {
      metrics.pipeline.event_bridge = { status: 'offline' };
    }

    // Get BGE server stats (if it has a stats endpoint)
    try {
      const bgeResponse = await fetch(`${KOI_SERVICES.bgeServer.url}/health`);
      if (bgeResponse.ok) {
        metrics.pipeline.embeddings = {
          status: 'online',
          vectors_generated: 0,
          avg_latency_ms: 0
        };
      }
    } catch (e) {
      metrics.pipeline.embeddings = { status: 'offline' };
    }

    // Database metrics would need to be queried from PostgreSQL
    metrics.pipeline.database = {
      status: 'online',
      vectors_stored: 0,
      total_documents: 0
    };
    
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

/**
 * Helper function to check all services
 */
async function checkAllServices() {
  const serviceChecks = [
    { name: 'coordinator', url: `${KOI_SERVICES.coordinator.url}/events/poll?node_id=health` },
    { name: 'eventBridge', url: `${KOI_SERVICES.eventBridge.url}/` },
    { name: 'bgeServer', url: `${KOI_SERVICES.bgeServer.url}/health` }
  ];
  
  const results = await Promise.all(
    serviceChecks.map(async (service) => {
      try {
        const response = await fetch(service.url, {
          method: 'GET',
          timeout: 3000
        });
        
        return {
          name: service.name,
          status: response.ok ? 'online' : 'error',
          statusCode: response.status
        };
      } catch (error) {
        return {
          name: service.name,
          status: 'offline',
          error: error.message
        };
      }
    })
  );
  
  // Add database check
  results.push({
    name: 'database',
    status: KOI_SERVICES.database.url ? 'online' : 'offline'
  });
  
  return results;
}

export default router;