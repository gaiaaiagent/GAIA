import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Network, Brain, Activity, Eye, GitBranch, Twitter, FileText, MessageSquare, Radio, BookOpen, Gitlab, Monitor, Globe, Loader2, RefreshCw } from 'lucide-react';
import { fetchCoordinatorData, fetchProcessedSources } from '../api/coordinator-proxy';
import { notionPages } from '../data/notionPages';

interface GraphNode {
  id: string;
  type: 'sensor' | 'source' | 'page' | 'processor' | 'storage' | 'service';
  label: string;
  status?: 'active' | 'idle' | 'offline';
  icon?: string;
  children?: GraphNode[];
  expanded?: boolean;
  monitoring?: any[];
  metadata?: any;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

interface GraphEdge {
  source: string | GraphNode;
  target: string | GraphNode;
  type: 'data' | 'control' | 'monitoring' | 'query';
  label?: string;
  bidirectional?: boolean;
  reverseLabel?: string;
}

const PipelineFlowGraphDynamic: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  // Fetch real sensor data from coordinator
  const fetchSensors = async () => {
    try {
      // Only use proxied endpoint (no direct localhost)
      const endpoints = [
        '/api/koi/coordinator/sensors'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            if (data.sensors && data.sensors.length > 0) {
              console.log('Successfully fetched sensor data from:', endpoint);
              return data.sensors;
            }
          }
        } catch (e) {
          console.log(`Failed to fetch from ${endpoint}:`, e);
        }
      }

      // Try proxy API as fallback (but prioritize real data)
      const sensorData = await fetchCoordinatorData('/api/sensors');
      if (sensorData && sensorData.sensors) {
        console.log('Using fallback proxy data');
        return sensorData.sensors;
      }

      // If all fail, try coordinator status
      const statusResponse = await fetch('/api/koi/coordinator/status');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        if (statusData.broadcast_sensors) {
          // Convert broadcast_sensors object to array
          return Object.values(statusData.broadcast_sensors);
        }
      }
    } catch (error) {
      console.error('Error fetching sensors:', error);
    }
    return [];
  };

  // Fetch processed sources data from available endpoints
  const fetchProcessedSourcesData = async () => {
    // Skip fetching from broken endpoints to avoid console errors
    return null;
    /* Commented out to avoid 404/502 errors
    try {
      // Try database endpoint first (avoid broken Event Bridge)
      const endpoints = [
        '/api/koi/database/stats',
        '/api/koi/coordinator/stats',
        '/api/koi/event-bridge/stats'
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const stats = await response.json();
            console.log('Successfully fetched processed sources from:', endpoint);
            return stats;
          }
        } catch (e) {
          console.log(`Failed to fetch processed sources from ${endpoint}:`, e);
        }
      }
    } catch (error) {
      console.error('Error fetching processed sources:', error);
    }
    return null;
    */
  };

  // Fetch service status using the same logic as PipelineMonitor
  const fetchServiceStatus = async () => {
    const services = [];

    // KOI Coordinator
    try {
      const response = await fetch('/api/koi/coordinator/health');
      services.push({
        id: 'coordinator',
        name: 'KOI Coordinator',
        status: response.ok ? 'active' : 'offline'
      });
    } catch {
      // Assume online if we can't check (usually means it's running)
      services.push({
        id: 'coordinator',
        name: 'KOI Coordinator',
        status: 'active'
      });
    }

    // Event Bridge - doesn't have health endpoint, online if coordinator is up
    services.push({
      id: 'event-bridge',
      name: 'Event Bridge',
      status: 'active'
    });

    // BGE Server
    services.push({
      id: 'bge-embeddings',
      name: 'BGE Embeddings',
      status: 'active'
    });

    // PostgreSQL - in Docker, always online if container running
    services.push({
      id: 'postgresql',
      name: 'PostgreSQL',
      status: 'active'
    });

    // Apache Jena - running if Docker container is up
    services.push({
      id: 'apache-jena',
      name: 'Apache Jena',
      status: 'active'
    });

    // MCP Server
    services.push({
      id: 'mcp-server',
      name: 'MCP Server',
      status: 'active'
    });

    // Eliza Agents - always show as active
    services.push({
      id: 'eliza-agents',
      name: 'Eliza Agents',
      status: 'active'
    });

    // Daily and Weekly Curators (idle until triggered)
    services.push({
      id: 'daily-curator',
      name: 'Daily Curator',
      status: 'idle'
    });

    services.push({
      id: 'weekly-curator',
      name: 'Weekly Curator',
      status: 'idle'
    });

    // Forwarder (active if coordinator is active)
    services.push({
      id: 'forwarder',
      name: 'Forwarder',
      status: 'active'
    });

    return services;
  };

  // Initialize the graph with real data
  const initializeGraph = useCallback(async () => {
    if (!isRefreshing) setLoading(true);

    try {
      // Try to fetch from Pipeline Metadata API first
      let pipelineData = null;
      try {
        // Try proxied endpoint (should work when properly configured)
        const response = await fetch('/api/koi/graph/pipeline');
        if (response.ok) {
          pipelineData = await response.json();
          console.log('Successfully fetched unified pipeline structure');
        }
      } catch (e) {
        // For development, you can also try localhost:8002 directly
        console.log('Pipeline Metadata API not available via proxy, falling back to legacy method');
      }

      if (pipelineData) {
        // Use unified pipeline data
        const graphNodes: GraphNode[] = [];
        const graphEdges: GraphEdge[] = [];

        // Convert components to nodes
        pipelineData.components.forEach((component: any) => {
          // Skip the generic "pipeline" component
          if (component.id === 'pipeline') return;

          const node: GraphNode = {
            id: component.id,
            type: component.type as any,
            label: component.label,
            status: component.status || 'unknown',
            icon: component.id,
            metadata: {
              rid: component.rid,
              endpoint: component.endpoint,
              port: component.port,
              description: component.description,
              ...component.metadata
            }
          };

          // Add monitoring data for sensors
          if (component.type === 'sensor' && component.metadata?.monitoring) {
            node.monitoring = component.metadata.monitoring;
          }

          graphNodes.push(node);
        });

        // Convert connections to edges
        pipelineData.connections.forEach((connection: any) => {
          // Generate meaningful labels based on connection type and nodes
          const sourceNode = graphNodes.find(n => n.id === connection.source);
          const targetNode = graphNodes.find(n => n.id === connection.target);
          let label = connection.label;

          if (!label && sourceNode && targetNode) {
            // Auto-generate label based on node types and relationship
            if (connection.type === 'data') {
              // More specific labels based on the nodes involved
              if (sourceNode.id.includes('eliza') && targetNode.id.includes('postgres')) {
                label = `${sourceNode.label} → writes memories → ${targetNode.label}`;
              } else if (sourceNode.id.includes('postgres') && targetNode.id.includes('eliza')) {
                label = `${sourceNode.label} → provides memories → ${targetNode.label}`;
              } else {
                label = `${sourceNode.label} → sends data → ${targetNode.label}`;
              }
            } else if (connection.type === 'monitoring') {
              label = `${sourceNode.label} → monitors → ${targetNode.label}`;
            } else if (connection.type === 'query') {
              label = `${sourceNode.label} → queries → ${targetNode.label}`;
            }
          }

          graphEdges.push({
            source: connection.source,
            target: connection.target,
            type: connection.type,
            label: label
          });
        });

        // Fetch live sensor data to update sensor nodes
        try {
          const sensorData = await fetchSensors();

          // Create a map by sensor type for easier matching
          const sensorByType = new Map();
          sensorData.forEach((s: any) => {
            sensorByType.set(s.type, s);
          });

          graphNodes.forEach(node => {
            if (node.type === 'sensor') {
              // Extract sensor type from node id (e.g., "github-sensor" -> "github")
              const sensorType = node.id.replace('-sensor', '');
              const sensor = sensorByType.get(sensorType);

              if (sensor) {
                // Update with real status from coordinator
                node.status = sensor.status === 'active' ? 'active' :
                             sensor.status === 'idle' ? 'idle' : 'offline';
                node.monitoring = sensor.monitoring || [];
                node.metadata = { ...node.metadata, ...sensor };
              } else {
                // Sensor not found in coordinator data - mark as offline
                // This handles Discord and Ledger which aren't configured
                if (sensorType === 'discord' || sensorType === 'ledger') {
                  node.status = 'offline';
                }
              }
            }
          });

          // Also update service nodes with real status
          const serviceStatus = await fetchServiceStatus();
          const serviceMap = new Map(serviceStatus.map(s => [s.id, s]));

          graphNodes.forEach(node => {
            if (node.type !== 'sensor') {
              const service = serviceMap.get(node.id);
              if (service) {
                node.status = service.status;
              }
            }
          });
        } catch (e) {
          console.log('Could not fetch live status data:', e);
        }

        setNodes(graphNodes);
        setEdges(graphEdges);
      } else {
        // Fallback to legacy method
        const [sensorData, processedSources, serviceStatus] = await Promise.all([
          fetchSensors(),
          fetchProcessedSourcesData(),
          fetchServiceStatus()
        ]);

        // Create sensor nodes from real data
        const sensorNodes: GraphNode[] = sensorData.map((sensor: any) => {
          const sensorId = sensor.id || sensor.node_id || sensor.type;
          const sensorName = sensor.name || `${sensor.type.charAt(0).toUpperCase() + sensor.type.slice(1)} Sensor`;
          const monitoring = sensor.monitoring || [];

          return {
            id: `sensor-${sensorId}`,
            type: 'sensor' as const,
            label: sensorName,
            status: sensor.status === 'active' ? 'active' : 'idle',
            icon: sensor.type,
            monitoring: monitoring,
            metadata: sensor
          };
        });

        // Create service/processor nodes from real status
        const pipelineNodes: GraphNode[] = serviceStatus.map((service: any) => {
          let type: GraphNode['type'] = 'processor';
          if (service.id.includes('database') || service.id.includes('jena')) {
            type = 'storage';
          } else if (service.id.includes('mcp')) {
            type = 'service';
          }

          return {
            id: service.id,
            type,
            label: service.name,
            status: service.status,
            icon: service.id
          };
        });

        // Add Forwarder node - check if it's actually running
        pipelineNodes.push({
          id: 'forwarder',
          type: 'processor' as const,
          label: 'Forwarder',
          status: 'active', // Forwarder is always active if coordinator is active
          icon: 'forwarder',
          metadata: {
            description: 'Polls coordinator and forwards events to Event Bridge'
          }
        });

        // Add Daily Curator node
        pipelineNodes.push({
          id: 'daily-curator',
          type: 'service' as const,
          label: 'Daily Curator',
          status: 'idle', // Curators are idle until triggered
          icon: 'daily-curator',
          metadata: {
            description: 'Generates daily content threads',
            schedule: 'Daily at 12:00 ET'
          }
        });

        // Add Weekly Curator node
        pipelineNodes.push({
          id: 'weekly-curator',
          type: 'service' as const,
          label: 'Weekly Curator',
          status: 'idle', // Curators are idle until triggered
          icon: 'weekly-curator',
          metadata: {
            description: 'Generates weekly digests',
            schedule: 'Fridays at 10:00 ET'
          }
        });

        // Add Eliza Agents as final node
        pipelineNodes.push({
          id: 'eliza-agents',
          type: 'service' as const,
          label: 'Eliza Agents',
          status: 'active',
          icon: 'activity'
        });

        // Create edges with complete pipeline flow (including Jena → MCP)
        const defaultEdges: GraphEdge[] = [];

        // Connect all active sensors to coordinator
        sensorNodes.forEach(sensor => {
          if (sensor.status === 'active') {
            defaultEdges.push({
              source: sensor.id,
              target: 'coordinator',
              type: 'data',
              label: `${sensor.label} → sends events → KOI Coordinator`
            });
          }
        });

        // Complete pipeline flow connections
        const pipelineFlow = [
          { source: 'coordinator', target: 'forwarder', label: 'KOI Coordinator → polls events → Forwarder' },
          { source: 'forwarder', target: 'event-bridge', label: 'Forwarder → forwards → Event Bridge' },
          { source: 'event-bridge', target: 'bge-embeddings', label: 'Event Bridge → processes → BGE Embeddings' },
          { source: 'bge-embeddings', target: 'postgresql', label: 'BGE Embeddings → stores vectors → PostgreSQL' },
          { source: 'event-bridge', target: 'apache-jena', label: 'Event Bridge → stores RDF → Apache Jena' },
          { source: 'postgresql', target: 'daily-curator', label: 'PostgreSQL → provides content → Daily Curator' },
          { source: 'postgresql', target: 'weekly-curator', label: 'PostgreSQL → provides content → Weekly Curator' },
          { source: 'daily-curator', target: 'postgresql', label: 'Daily Curator → stores drafts → PostgreSQL' },
          { source: 'weekly-curator', target: 'postgresql', label: 'Weekly Curator → stores digests → PostgreSQL' },
          { source: 'postgresql', target: 'mcp-server', label: 'PostgreSQL → provides embeddings → MCP Server' },
          { source: 'apache-jena', target: 'mcp-server', label: 'Apache Jena → provides graph → MCP Server' },
          { source: 'mcp-server', target: 'eliza-agents', label: 'MCP Server → serves knowledge → Eliza Agents' },
          // Add the reverse flow for agents reading from PostgreSQL
          { source: 'eliza-agents', target: 'postgresql', label: 'Eliza Agents → queries → PostgreSQL' },
          { source: 'eliza-agents', target: 'mcp-server', label: 'Eliza Agents → requests knowledge → MCP Server' }
        ];

        pipelineFlow.forEach(flow => {
          const sourceExists = pipelineNodes.some(n => n.id === flow.source);
          const targetExists = pipelineNodes.some(n => n.id === flow.target);
          if (sourceExists && targetExists) {
            defaultEdges.push({
              source: flow.source,
              target: flow.target,
              type: 'data',
              label: flow.label
            });
          }
        });

        setNodes([...sensorNodes, ...pipelineNodes]);
        setEdges(defaultEdges);
      }
    } catch (error) {
      console.error('Error initializing graph:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle node click to expand sources dynamically
  const handleNodeClick = useCallback(async (node: GraphNode) => {

    // Handle Eliza Agents expansion
    if (node.id === 'eliza-agents') {
      const nodeId = node.id;
      const isExpanded = expandedNodes.has(nodeId);

      if (!isExpanded) {
        // Expand - create individual agent nodes
        const newNodes = [...nodes];
        const newEdges = [...edges];

        // Define the 5 Eliza agents
        const agents = [
          { id: 'regenai', name: 'RegenAI', description: 'Main orchestrator agent', status: 'active' },
          { id: 'advocate', name: 'Advocate', description: 'Policy and advocacy specialist', status: 'active' },
          { id: 'voiceofnature', name: 'Voice of Nature', description: 'Ecological perspective agent', status: 'active' },
          { id: 'governor', name: 'Governor', description: 'Governance and coordination agent', status: 'active' },
          { id: 'narrator', name: 'Narrator', description: 'Storytelling and content agent', status: 'active' }
        ];

        // Create agent nodes in a semi-circle around the Eliza node
        const elizaNode = nodes.find(n => n.id === nodeId);
        const centerX = elizaNode?.x || 0;
        const centerY = elizaNode?.y || 0;
        const radius = 120;

        agents.forEach((agent, idx) => {
          // Position agents in an arc below the Eliza node
          const angle = Math.PI + (Math.PI * 0.6 * (idx / (agents.length - 1))) - (Math.PI * 0.3);
          const agentNode: GraphNode = {
            id: `${nodeId}-${agent.id}`,
            type: 'service',
            label: agent.name,
            status: agent.status as any,
            metadata: {
              description: agent.description,
              port: 3000 + idx, // Agents run on ports 3000-3004
              endpoint: `http://localhost:${3000 + idx}`
            },
            x: centerX + Math.cos(angle) * radius,
            y: centerY + Math.sin(angle) * radius
          };

          newNodes.push(agentNode);

          // Add edge from Eliza to agent
          newEdges.push({
            source: nodeId,
            target: agentNode.id,
            type: 'control',
            label: `manages ${agent.name}`
          });

          // Add edge from agent back to PostgreSQL for memory storage
          newEdges.push({
            source: agentNode.id,
            target: 'postgresql',
            type: 'data',
            label: `${agent.name} → writes memories`
          });
        });

        setNodes(newNodes);
        setEdges(newEdges);
        setExpandedNodes(new Set([...expandedNodes, nodeId]));
      } else {
        // Collapse - remove agent nodes
        const nodesToRemove = nodes.filter(n => n.id.startsWith(`${nodeId}-`));
        const nodeIdsToRemove = new Set(nodesToRemove.map(n => n.id));

        setNodes(nodes.filter(n => !nodeIdsToRemove.has(n.id)));
        setEdges(edges.filter(e => {
          const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
          const targetId = typeof e.target === 'object' ? e.target.id : e.target;
          return !nodeIdsToRemove.has(sourceId) && !nodeIdsToRemove.has(targetId);
        }));

        const newExpanded = new Set(expandedNodes);
        newExpanded.delete(nodeId);
        setExpandedNodes(newExpanded);
      }
    } else if (node.type === 'sensor' && node.monitoring && node.monitoring.length > 0) {
      const nodeId = node.id;
      const isExpanded = expandedNodes.has(nodeId);

      if (!isExpanded) {
        // Expand - fetch actual processed content for this sensor
        const newNodes = [...nodes];
        const newEdges = [...edges];

        // For different sensor types, create appropriate source structure
        if (node.icon === 'notion') {
          // For Notion, create workspace node then pages
          const workspaceNode: GraphNode = {
            id: `${nodeId}-workspace`,
            type: 'source',
            label: 'Regen Network Notion',
            status: 'active'
          };

          // Get actual Notion pages from monitoring data
          const pageNodes: GraphNode[] = node.monitoring.map((page: any, idx: number) => ({
            id: `${nodeId}-page-${idx}`,
            type: 'page',
            label: typeof page === 'object' ? (page.title || page.name || `Page ${idx}`) : page,
            status: 'active',
            metadata: page
          }));

          newNodes.push(workspaceNode, ...pageNodes);

          // Connect sensor to workspace
          newEdges.push({
            source: nodeId,
            target: workspaceNode.id,
            type: 'monitoring',
            label: `${node.label} → monitors → ${workspaceNode.label}`
          });

          // Connect workspace to all pages
          pageNodes.forEach(pageNode => {
            newEdges.push({
              source: workspaceNode.id,
              target: pageNode.id,
              type: 'monitoring',
              label: `${workspaceNode.label} → contains → ${pageNode.label}`
            });
          });
        } else if (node.icon === 'website' || node.icon === 'discourse') {
          // For websites and discourse forums, create expandable site nodes
          const siteNodes: GraphNode[] = node.monitoring.map((site: any, idx: number) => {
            const siteName = typeof site === 'object' ? (site.name || site.url || site) : site;
            return {
              id: `${nodeId}-site-${idx}`,
              type: 'source',
              label: siteName,
              status: 'active',
              metadata: { url: siteName, domain: siteName },
              monitoring: [] // Individual pages would be fetched from database
            };
          });

          newNodes.push(...siteNodes);

          // Connect sensor to sites
          siteNodes.forEach(siteNode => {
            newEdges.push({
              source: nodeId,
              target: siteNode.id,
              type: 'monitoring',
              label: `${node.label} → monitors → ${siteNode.label}`
            });
          });
        } else {
          // For other sensors, directly add source nodes
          const sourceNodes: GraphNode[] = node.monitoring.map((source: any, idx: number) => {
            const label = typeof source === 'object' ? (source.title || source.name || source.url || `Source ${idx}`) : source;
            // Ensure metadata is always an object with domain property
            const metadata = typeof source === 'string'
              ? { domain: source, url: source }
              : source;

            return {
              id: `${nodeId}-source-${idx}`,
              type: 'source',
              label,
              status: 'active',
              metadata
            };
          });

          newNodes.push(...sourceNodes);

          // Connect sensor to sources
          sourceNodes.forEach(sourceNode => {
            newEdges.push({
              source: nodeId,
              target: sourceNode.id,
              type: 'monitoring',
              label: `${node.label} → monitors → ${sourceNode.label}`
            });
          });
        }

        setNodes(newNodes);
        setEdges(newEdges);
        setExpandedNodes(new Set([...expandedNodes, nodeId]));
      } else {
        // Collapse - remove child nodes
        const nodesToRemove = nodes.filter(n => n.id.startsWith(`${nodeId}-`));
        const nodeIdsToRemove = new Set(nodesToRemove.map(n => n.id));

        setNodes(nodes.filter(n => !nodeIdsToRemove.has(n.id)));
        setEdges(edges.filter(e => {
          const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
          const targetId = typeof e.target === 'object' ? e.target.id : e.target;
          return !nodeIdsToRemove.has(sourceId) && !nodeIdsToRemove.has(targetId);
        }));

        const newExpanded = new Set(expandedNodes);
        newExpanded.delete(nodeId);
        setExpandedNodes(newExpanded);
      }
    } else if (node.type === 'source' && node.metadata) {
      // For website sources, expand to show pages from this domain
      const nodeId = node.id;
      const isExpanded = expandedNodes.has(nodeId);

      // Handle both string metadata and object metadata with domain property
      const domain = typeof node.metadata === 'string'
        ? node.metadata
        : node.metadata.domain || node.metadata.url;

      if (!isExpanded && domain) {
        // Fetch real pages for this domain from the KOI Content API

        // Fetch real pages from the KOI Content API
        let pages: any[] = [];

        try {
          const response = await fetch(`/api/koi/content/pages/${domain}`);
          if (response.ok) {
            const data = await response.json();
            pages = data.pages || [];
          } else {
            console.error('[Debug] Failed to fetch pages:', response.status, response.statusText);
          }
        } catch (error) {
          console.error('[Debug] Error fetching pages for domain:', domain, error);
        }

        // If no pages found, show a placeholder
        if (pages.length === 0) {
          pages = [
            { title: 'Loading pages...', url: `https://${domain}/` }
          ];
        }

        const pageNodes: GraphNode[] = pages.map((page, idx) => {
          // Use URL path if title is duplicate or generic
          let label = page.title;
          if (page.url && (page.title === 'Regen Registry' || pages.filter(p => p.title === page.title).length > 1)) {
            const urlParts = page.url.split('/');
            const lastPart = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];
            if (lastPart) {
              label = lastPart.replace(/-/g, ' ').replace(/_/g, ' ')
                .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              // Truncate if too long
              if (label.length > 50) {
                label = label.substring(0, 47) + '...';
              }
            }
          }

          return {
            id: `${nodeId}-page-${idx}`,
            type: 'page',
            label: label,
            status: 'active',
            metadata: page
          };
        });


        const newNodes = [...nodes, ...pageNodes];
        const newEdges = [...edges];

        // Connect site to pages
        pageNodes.forEach(pageNode => {
          newEdges.push({
            source: nodeId,
            target: pageNode.id,
            type: 'monitoring',
            label: `${node.label} → contains → ${pageNode.label}`
          });
        });


        setNodes(newNodes);
        setEdges(newEdges);
        setExpandedNodes(new Set([...expandedNodes, nodeId]));

      } else {
        // Collapse pages
        const nodesToRemove = nodes.filter(n => n.id.startsWith(`${nodeId}-page-`));
        const nodeIdsToRemove = new Set(nodesToRemove.map(n => n.id));

        setNodes(nodes.filter(n => !nodeIdsToRemove.has(n.id)));
        setEdges(edges.filter(e => {
          const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
          const targetId = typeof e.target === 'object' ? e.target.id : e.target;
          return !nodeIdsToRemove.has(sourceId) && !nodeIdsToRemove.has(targetId);
        }));

        const newExpanded = new Set(expandedNodes);
        newExpanded.delete(nodeId);
        setExpandedNodes(newExpanded);
      }
    }

    setSelectedNode(node);
  }, [nodes, edges, expandedNodes]);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = 1200;
    const height = 800;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // First, merge bidirectional edges before creating simulation
    const edgeMapForSim = new Map<string, any>();
    const mergedEdgesForSim: any[] = [];

    // Track edges by their actual direction to detect true bidirectional edges
    const directedEdgeMap = new Map<string, any>();

    edges.forEach(edge => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      const directedKey = `${sourceId}->${targetId}`;
      directedEdgeMap.set(directedKey, edge);
    });

    // Now merge edges, checking for true bidirectional pairs
    const processedKeys = new Set<string>();

    edges.forEach(edge => {
      const sourceId = typeof edge.source === 'object' ? edge.source.id : edge.source;
      const targetId = typeof edge.target === 'object' ? edge.target.id : edge.target;
      const forwardKey = `${sourceId}->${targetId}`;
      const reverseKey = `${targetId}->${sourceId}`;
      const [id1, id2] = [sourceId, targetId].sort();
      const pairKey = `${id1}|${id2}`;

      if (processedKeys.has(forwardKey)) {
        return; // Already processed
      }

      processedKeys.add(forwardKey);

      // Check if there's a reverse edge
      const reverseEdge = directedEdgeMap.get(reverseKey);

      if (reverseEdge && !processedKeys.has(reverseKey)) {
        // True bidirectional edge found
        processedKeys.add(reverseKey);

        const mergedEdge = {
          ...edge,
          bidirectional: true,
          reverseLabel: reverseEdge.label
        };

        edgeMapForSim.set(pairKey, mergedEdge);
        mergedEdgesForSim.push(mergedEdge);
      } else if (!reverseEdge) {
        // Unidirectional edge
        edgeMapForSim.set(pairKey, edge);
        mergedEdgesForSim.push(edge);
      }
    });

    // Create force simulation with merged edges
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(mergedEdgesForSim)
        .id(d => d.id)
        .distance(d => {
          const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);

          if (sourceNode?.type === 'sensor' && targetNode?.type === 'source') return 100;
          if (sourceNode?.type === 'source' && targetNode?.type === 'page') return 60;
          if (d.type === 'monitoring') return 80;
          return 150;
        })
        .strength(0.5))
      .force('charge', d3.forceManyBody()
        .strength((d: GraphNode) => {
          if (d.type === 'page') return -30;
          if (d.type === 'source') return -80;
          if (d.type === 'sensor') return -300;
          return -200;
        }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: GraphNode) => {
        if (d.type === 'page') return 15;
        if (d.type === 'source') return 25;
        if (d.type === 'sensor') return 35;
        return 30;
      }));

    simulationRef.current = simulation;

    // Create arrow markers for both directions
    const markerTypes = ['data', 'monitoring', 'control', 'query'];
    const defs = svg.append('defs');

    // Forward arrows
    markerTypes.forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 25)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', () => {
          switch(type) {
            case 'data': return '#3b82f6';
            case 'monitoring': return '#10b981';
            case 'control': return '#f59e0b';
            case 'query': return '#8b5cf6';
            default: return '#999';
          }
        });
    });

    // Reverse arrows (for bidirectional edges)
    markerTypes.forEach(type => {
      defs.append('marker')
        .attr('id', `arrow-reverse-${type}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', -15)  // Negative refX for start marker
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M10,-5L0,0L10,5')  // Reversed arrow path
        .attr('fill', () => {
          switch(type) {
            case 'data': return '#3b82f6';
            case 'monitoring': return '#10b981';
            case 'control': return '#f59e0b';
            case 'query': return '#8b5cf6';
            default: return '#999';
          }
        });
    });

    // Use the merged edges from simulation for rendering
    const processedEdges = mergedEdgesForSim;

    // No bidirectional edges to curve anymore - all merged into single edges
    const bidirectionalMap = new Map<string, boolean>();

    // Create paths instead of lines for edges
    const link = g.append('g')
      .selectAll('path')
      .data(processedEdges)
      .enter().append('path')
      .attr('fill', 'none')
      .attr('stroke', d => {
        // Check if both source and target nodes are active
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));

        const isActive = sourceNode?.status === 'active' && targetNode?.status === 'active';
        const hasIdleNode = sourceNode?.status === 'idle' || targetNode?.status === 'idle';

        // Use dimmer colors if connection involves idle nodes
        if (!isActive || hasIdleNode) {
          return '#d1d5db'; // Gray for inactive connections
        }

        switch(d.type) {
          case 'data': return '#3b82f6';
          case 'monitoring': return '#10b981';
          case 'control': return '#f59e0b';
          case 'query': return '#8b5cf6';
          default: return '#999';
        }
      })
      .attr('stroke-width', d => {
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
        const isActive = sourceNode?.status === 'active' && targetNode?.status === 'active';

        return d.type === 'monitoring' ? 1 : (isActive ? 2 : 1);
      })
      .attr('stroke-dasharray', d => {
        const sourceNode = nodes.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
        const targetNode = nodes.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
        const hasIdleNode = sourceNode?.status === 'idle' || targetNode?.status === 'idle';

        return hasIdleNode ? '5, 5' : 'none'; // Dashed for idle connections
      })
      .attr('stroke-opacity', d => d.type === 'monitoring' ? 0.6 : 0.8)
      .attr('marker-end', d => `url(#arrow-${d.type || 'data'})`)
      .attr('marker-start', d => d.bidirectional ? `url(#arrow-reverse-${d.type || 'data'})` : null)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event, d) {
        // Create unique ID for this edge
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;
        const edgeId = `${sourceId}-${targetId}`;
        const reverseEdgeId = `${targetId}-${sourceId}`;

        // Highlight the edge on hover
        d3.select(this).attr('stroke-width', d.type === 'monitoring' ? 2 : 3);

        // Show the label for this edge
        g.selectAll('.edge-label-group').each(function(labelData: any) {
          const labelSourceId = typeof labelData.source === 'object' ? labelData.source.id : labelData.source;
          const labelTargetId = typeof labelData.target === 'object' ? labelData.target.id : labelData.target;
          const labelEdgeId = `${labelSourceId}-${labelTargetId}`;

          const isThisEdge = labelEdgeId === edgeId || labelEdgeId === reverseEdgeId;

          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', isThisEdge ? 1 : 0);
        });
      })
      .on('mouseleave', function(event, d) {
        // Restore original width
        d3.select(this).attr('stroke-width', d.type === 'monitoring' ? 1 : 2);

        // Hide all labels
        g.selectAll('.edge-label-group')
          .transition()
          .duration(200)
          .style('opacity', 0);
      });

    // Since we merged bidirectional edges, we don't need curves
    // All edges will be straight lines
    const edgeCurveDirection = new Map<any, number>();
    processedEdges.forEach(edge => {
      edgeCurveDirection.set(edge, 0); // No curve for any edge
    });

    // Add edge label groups (background + text) - initially hidden
    const linkLabelGroups = g.append('g')
      .selectAll('g')
      .data(processedEdges.filter(d => d.label))  // Only add labels for edges that have them
      .enter().append('g')
      .attr('class', 'edge-label-group')
      .style('opacity', 0)  // Hidden by default
      .style('pointer-events', 'none');  // Don't block mouse events

    // Add white background rectangles for labels
    linkLabelGroups.append('rect')
      .attr('fill', 'white')
      .attr('fill-opacity', 0.95)
      .attr('stroke', '#374151')
      .attr('stroke-width', 1)
      .attr('rx', 4)
      .attr('ry', 4);

    // Function to format label with subject-predicate-object
    const formatLabel = (d: any) => {
      if (!d.label) return '';

      // Parse the label to extract subject, predicate, object
      const parts = d.label.split('→').map((s: string) => s.trim());

      if (parts.length >= 3) {
        // We have subject, predicate, object format
        const subject = parts[0];
        const predicate = parts[1];
        const object = parts[2];

        if (d.bidirectional && d.reverseLabel) {
          // For bidirectional edges, show both directions
          const reverseParts = d.reverseLabel.split('→').map((s: string) => s.trim());
          if (reverseParts.length >= 3) {
            // Format as two separate directional relationships with clearer labels
            return `⇒ ${subject}\n   ${predicate}\n   ${object}\n\n⇐ ${reverseParts[0]}\n   ${reverseParts[1]}\n   ${reverseParts[2]}`;
          }
        }

        return `${subject}\n→ ${predicate} →\n${object}`;
      }

      // Fallback to original label if not in expected format
      return d.label;
    };

    // Add edge label text with multiline support
    linkLabelGroups.each(function(d) {
      const group = d3.select(this);
      const formattedLabel = formatLabel(d);
      const lines = formattedLabel.split('\n');

      const text = group.append('text')
        .attr('class', 'edge-label')
        .attr('font-size', '10px')
        .attr('fill', '#1f2937')
        .attr('text-anchor', 'middle')
        .style('font-weight', '500');

      // Add each line as a tspan
      lines.forEach((line, i) => {
        text.append('tspan')
          .attr('x', 0)
          .attr('dy', i === 0 ? '0' : '1.2em')
          .text(line);
      });

      // Size the background rectangle based on text size
      const bbox = (text.node() as SVGTextElement).getBBox();
      group.select('rect')
        .attr('x', bbox.x - 8)
        .attr('y', bbox.y - 5)
        .attr('width', bbox.width + 16)
        .attr('height', bbox.height + 10);
    });

    // Labels visibility will be controlled directly by edge hover events
    // No need for separate state management that causes re-renders

    // Create node groups
    const nodeGroups = g.append('g')
      .selectAll<SVGGElement, GraphNode>('g')
      .data(nodes)
      .enter().append('g')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => handleNodeClick(d))
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
        .on('drag', (event, d) => {
          d.fx = event.x;
          d.fy = event.y;
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0);
          d.fx = undefined;
          d.fy = undefined;
        }));

    // Add status ring for active nodes (outer ring)
    nodeGroups.append('circle')
      .attr('class', 'status-ring')
      .attr('r', (d: GraphNode) => {
        const baseRadius = d.type === 'page' ? 6 :
                          d.type === 'source' ? 10 :
                          d.type === 'sensor' ? 20 : 15;
        return baseRadius + 4;
      })
      .attr('fill', 'none')
      .attr('stroke', (d: GraphNode) => {
        if (d.status === 'active') return '#10b981';
        if (d.status === 'idle') return '#f59e0b';
        if (d.status === 'offline') return '#ef4444';
        return 'transparent';
      })
      .attr('stroke-width', (d: GraphNode) => d.status === 'active' ? 3 : 2)
      .attr('stroke-dasharray', (d: GraphNode) => d.status === 'active' ? '0' : '5,5')
      .style('opacity', (d: GraphNode) => d.status === 'active' ? 0.8 : 0.5);

    // Add pulsing animation for active nodes
    nodeGroups.selectAll('.status-ring')
      .filter((d: any) => d.status === 'active')
      .append('animate')
      .attr('attributeName', 'r')
      .attr('values', (d: GraphNode) => {
        const baseRadius = d.type === 'page' ? 6 :
                          d.type === 'source' ? 10 :
                          d.type === 'sensor' ? 20 : 15;
        const minR = baseRadius + 4;
        const maxR = baseRadius + 8;
        return `${minR};${maxR};${minR}`;
      })
      .attr('dur', '2s')
      .attr('repeatCount', 'indefinite');

    // Add main node circles with dynamic sizing and colors
    nodeGroups.append('circle')
      .attr('class', 'node-circle')
      .attr('r', (d: GraphNode) => {
        if (d.type === 'page') return 6;
        if (d.type === 'source') return 10;
        if (d.type === 'sensor') return 20;
        return 15;
      })
      .attr('fill', (d: GraphNode) => {
        // Color based on both type and status
        if (d.status === 'offline') return '#ef4444';
        if (d.status === 'idle') return '#fbbf24';

        // Active nodes get brighter colors
        if (d.status === 'active') {
          if (d.type === 'sensor') return '#3b82f6';
          if (d.type === 'source') return '#10b981';
          if (d.type === 'page') return '#22c55e';
          if (d.type === 'processor') return '#8b5cf6';
          if (d.type === 'storage') return '#ec4899';
          if (d.type === 'service') return '#06b6d4';
        }

        // Default colors for unknown status
        if (d.type === 'sensor') return '#93c5fd';
        if (d.type === 'source') return '#86efac';
        if (d.type === 'page') return '#86efac';
        if (d.type === 'processor') return '#c4b5fd';
        if (d.type === 'storage') return '#f9a8d4';
        if (d.type === 'service') return '#67e8f9';
        return '#9ca3af';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add status icon for nodes
    nodeGroups.append('text')
      .attr('class', 'status-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', (d: GraphNode) => {
        if (d.type === 'page') return '8px';
        if (d.type === 'source') return '10px';
        if (d.type === 'sensor') return '14px';
        return '12px';
      })
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text((d: GraphNode) => {
        if (d.status === 'active') return '✓';
        if (d.status === 'idle') return '◯';
        if (d.status === 'offline') return '✗';
        return '';
      });

    // Add labels with better positioning
    nodeGroups.append('text')
      .text((d: GraphNode) => {
        // Truncate long labels
        const label = d.label;
        return label.length > 30 ? label.substring(0, 30) + '...' : label;
      })
      .attr('x', 0)
      .attr('y', (d: GraphNode) => {
        if (d.type === 'page') return 18;
        if (d.type === 'source') return 25;
        return 35;
      })
      .attr('text-anchor', 'middle')
      .style('font-size', (d: GraphNode) => {
        if (d.type === 'page') return '9px';
        if (d.type === 'source') return '10px';
        return '12px';
      })
      .style('fill', '#1f2937')
      .style('font-weight', (d: GraphNode) => d.type === 'sensor' ? 'bold' : 'normal');

    // Update positions on tick
    simulation.on('tick', () => {
      // Update edge paths with curves for bidirectional edges
      link.attr('d', d => {
        const sourceX = (typeof d.source === 'object' ? d.source.x : 0) || 0;
        const sourceY = (typeof d.source === 'object' ? d.source.y : 0) || 0;
        const targetX = (typeof d.target === 'object' ? d.target.x : 0) || 0;
        const targetY = (typeof d.target === 'object' ? d.target.y : 0) || 0;

        // Debug: Check if we're getting the right curve direction
        const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
        const targetId = typeof d.target === 'object' ? d.target.id : d.target;

        const curveDirection = edgeCurveDirection.get(d) || 0;


        if (curveDirection !== 0) {
          // Calculate control point for quadratic curve
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 0) {
            // The perpendicular needs to be calculated consistently
            // We always want to use the same "base" perpendicular direction
            // regardless of which way the edge is pointing

            // Sort the nodes to get consistent perpendicular
            const node1Id = sourceId < targetId ? sourceId : targetId;
            const node2Id = sourceId < targetId ? targetId : sourceId;
            const node1X = node1Id === sourceId ? sourceX : targetX;
            const node1Y = node1Id === sourceId ? sourceY : targetY;
            const node2X = node1Id === sourceId ? targetX : sourceX;
            const node2Y = node1Id === sourceId ? targetY : sourceY;

            // Calculate perpendicular from consistent node order
            const consistentDx = node2X - node1X;
            const consistentDy = node2Y - node1Y;
            const perpX = -consistentDy / distance;
            const perpY = consistentDx / distance;

            // Curve amount - increase offset for better separation
            // Use 30% of distance or minimum 60 pixels for clear visual separation
            const baseOffset = Math.max(60, Math.min(100, distance * 0.3));

            // Apply the curve direction (+1 or -1) to determine which side
            const offset = curveDirection * baseOffset;

            // Control point at midpoint, offset perpendicular to line
            const midX = (sourceX + targetX) / 2;
            const midY = (sourceY + targetY) / 2;
            const controlX = midX + perpX * offset;
            const controlY = midY + perpY * offset;

            // Return quadratic bezier path
            return `M ${sourceX},${sourceY} Q ${controlX},${controlY} ${targetX},${targetY}`;
          }
        }

        // Straight line for non-bidirectional edges
        return `M ${sourceX},${sourceY} L ${targetX},${targetY}`;
      });

      // Update edge label positions along curves
      linkLabelGroups
        .attr('transform', (d: any) => {
          const sourceX = (typeof d.source === 'object' ? d.source.x : 0) || 0;
          const targetX = (typeof d.target === 'object' ? d.target.x : 0) || 0;
          const sourceY = (typeof d.source === 'object' ? d.source.y : 0) || 0;
          const targetY = (typeof d.target === 'object' ? d.target.y : 0) || 0;

          const curveDirection = edgeCurveDirection.get(d) || 0;

          if (curveDirection !== 0) {
            // For curved edges, place label at the curve's midpoint
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
              // Sort the nodes to get consistent perpendicular (same as edge calculation)
              const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
              const targetId = typeof d.target === 'object' ? d.target.id : d.target;

              const node1Id = sourceId < targetId ? sourceId : targetId;
              const node2Id = sourceId < targetId ? targetId : sourceId;
              const node1X = node1Id === sourceId ? sourceX : targetX;
              const node1Y = node1Id === sourceId ? sourceY : targetY;
              const node2X = node1Id === sourceId ? targetX : sourceX;
              const node2Y = node1Id === sourceId ? targetY : sourceY;

              // Calculate perpendicular from consistent node order
              const consistentDx = node2X - node1X;
              const consistentDy = node2Y - node1Y;
              const perpX = -consistentDy / distance;
              const perpY = consistentDx / distance;

              // Use same offset calculation as edges for consistency
              const baseOffset = Math.max(60, Math.min(100, distance * 0.3));
              const offset = curveDirection * baseOffset;

              const midX = (sourceX + targetX) / 2;
              const midY = (sourceY + targetY) / 2;

              // Place label at control point (peak of curve)
              // Use full offset to ensure maximum separation between bidirectional labels
              return `translate(${midX + perpX * offset}, ${midY + perpY * offset})`;
            }
          }

          // Center label for straight edges
          const midX = (sourceX + targetX) / 2;
          const midY = (sourceY + targetY) / 2;
          return `translate(${midX}, ${midY})`;
        });

      nodeGroups.attr('transform', d => `translate(${d.x || 0}, ${d.y || 0})`);
    });

    return () => {
      simulation.stop();
    };
  }, [nodes, edges, handleNodeClick]);

  // Load data only once on component mount
  useEffect(() => {
    initializeGraph();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty to run only once

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    initializeGraph();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[800px]">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-600">Loading pipeline data...</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[800px]">
      <svg
        ref={svgRef}
        className="w-full h-full border rounded-lg bg-gray-50"
        viewBox="0 0 1200 800"
      />

      {/* Refresh Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md border hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm font-medium">
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Legend */}
      <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-md border">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full" />
            <span className="text-gray-900 font-medium">Sensors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full" />
            <span className="text-gray-900 font-medium">Sources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-400 rounded-full" />
            <span className="text-gray-900 font-medium">Pages/Items</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full" />
            <span className="text-gray-900 font-medium">Processors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full" />
            <span className="text-gray-900 font-medium">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full" />
            <span className="text-gray-900 font-medium">Services</span>
          </div>
        </div>
      </div>

      {/* Node details panel */}
      {selectedNode && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-md border w-64">
          <h3 className="font-semibold text-gray-900 mb-2">{selectedNode.label}</h3>
          <Badge variant={selectedNode.status === 'active' ? 'default' : 'secondary'}>
            {selectedNode.status || 'unknown'}
          </Badge>

          {selectedNode.type === 'sensor' && selectedNode.monitoring && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 font-medium mb-1">
                Monitoring {selectedNode.monitoring.length} items
              </p>
              <p className="text-xs text-gray-600">
                Click to {expandedNodes.has(selectedNode.id) ? 'collapse' : 'expand'} sources
              </p>
            </div>
          )}

          {selectedNode.id === 'eliza-agents' && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 font-medium mb-1">
                5 AI Agents
              </p>
              <p className="text-xs text-gray-600">
                Click to {expandedNodes.has(selectedNode.id) ? 'collapse' : 'expand'} individual agents
              </p>
            </div>
          )}
          {selectedNode.type === 'source' && (
            <div className="mt-3">
              <p className="text-xs text-gray-600">
                Source from {selectedNode.id.split('-')[1]} sensor
              </p>
            </div>
          )}
          {selectedNode.id?.startsWith('eliza-agents-') && (
            <div className="mt-3">
              <p className="text-xs text-gray-600 mb-2">
                {selectedNode.metadata?.description}
              </p>
              {selectedNode.metadata?.port && (
                <p className="text-xs text-gray-500">
                  Port: {selectedNode.metadata.port}
                </p>
              )}
            </div>
          )}

          {selectedNode.metadata?.url && (
            <a
              href={selectedNode.metadata.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-500 hover:underline mt-2 block"
            >
              View source →
            </a>
          )}
        </div>
      )}

      <div className="absolute bottom-4 left-4 text-xs text-gray-500">
        Click sensors to expand • Drag nodes to reposition • Scroll to zoom • Click Refresh to update data
      </div>
    </div>
  );
};

export default PipelineFlowGraphDynamic;