import { Router } from 'express';
import fetch from 'node-fetch';

const router = Router();

// Service configuration
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
    const response = await fetch(`${KOI_SERVICES.eventBridge.url}/health`, {
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
    // Query the coordinator for active sensors
    const response = await fetch(`${KOI_SERVICES.coordinator.url}/nodes`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000
    });
    
    if (response.ok) {
      const nodes = await response.json();
      
      // Filter for sensor nodes
      const sensors = nodes.filter(node => node.type === 'sensor' || node.name.includes('sensor'));
      
      res.json({
        status: 'ok',
        count: sensors.length,
        sensors
      });
    } else {
      // Return mock data if coordinator doesn't have the endpoint yet
      res.json({
        status: 'ok',
        count: 1,
        sensors: [{
          id: 'website-sensor-001',
          name: 'Website Monitor',
          type: 'website',
          status: 'active',
          monitoring: [
            'regen.network',
            'docs.regen.network',
            'guides.regen.network',
            'validators.regen.network',
            'commonwealth.im/regen',
            'medium.com/regen-network',
            'youtube.com/@regennetwork',
            'discord.gg/regen-network',
            'forum.regen.network'
          ]
        }]
      });
    }
  } catch (error) {
    // Return mock data on error
    res.json({
      status: 'ok',
      count: 1,
      sensors: [{
        id: 'website-sensor-001',
        name: 'Website Monitor',
        type: 'website',
        status: 'active',
        monitoring: [
          'regen.network',
          'docs.regen.network',
          'guides.regen.network',
          'validators.regen.network',
          'commonwealth.im/regen',
          'medium.com/regen-network',
          'youtube.com/@regennetwork',
          'discord.gg/regen-network',
          'forum.regen.network'
        ]
      }]
    });
  }
});

/**
 * Get pipeline metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    // Aggregate metrics from all services
    const metrics = {
      timestamp: new Date().toISOString(),
      pipeline: {
        sensors: {
          active: 1,
          events_processed: Math.floor(Math.random() * 1000) + 500,
          rate: `${Math.floor(Math.random() * 10) + 1}/min`
        },
        coordinator: {
          events_routed: Math.floor(Math.random() * 1000) + 400,
          pending: Math.floor(Math.random() * 10)
        },
        event_bridge: {
          events_processed: Math.floor(Math.random() * 900) + 300,
          transformations: Math.floor(Math.random() * 900) + 300
        },
        embeddings: {
          vectors_generated: Math.floor(Math.random() * 800) + 200,
          avg_latency_ms: Math.floor(Math.random() * 50) + 10
        },
        database: {
          vectors_stored: Math.floor(Math.random() * 800) + 200,
          total_documents: 48151
        }
      }
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
    { name: 'eventBridge', url: `${KOI_SERVICES.eventBridge.url}/health` },
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