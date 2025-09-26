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
  type: 'data' | 'control' | 'monitoring';
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

  // Fetch service status
  const fetchServiceStatus = async () => {
    try {
      // Use proxy API to get pipeline status
      const statusData = await fetchCoordinatorData('/api/pipeline/status');
      if (statusData) {
        return [
          { id: 'coordinator', name: 'KOI Coordinator', status: statusData.coordinator?.status || 'offline' },
          { id: 'event-bridge', name: 'Event Bridge', status: statusData.event_bridge?.status || 'offline' },
          { id: 'bge-embeddings', name: 'BGE Embeddings', status: 'active' },
          { id: 'postgresql', name: 'PostgreSQL', status: statusData.postgres?.status || 'offline' },
          { id: 'apache-jena', name: 'Apache Jena', status: statusData.apache_jena?.status || 'offline' },
          { id: 'mcp-server', name: 'MCP Server', status: statusData.mcp_server?.status || 'offline' }
        ];
      }
    } catch (error) {
      console.error('Error fetching service status:', error);
    }

    // Fallback to individual checks
    const services = [];
    const serviceChecks = [
      { id: 'coordinator', name: 'KOI Coordinator', endpoint: '/api/koi/coordinator/health' },
      { id: 'event-bridge', name: 'Event Bridge', endpoint: '/api/koi/event-bridge/status' },
      { id: 'bge-embeddings', name: 'BGE Embeddings', endpoint: '/api/koi/bge/health' },
      { id: 'postgresql', name: 'PostgreSQL', endpoint: '/api/koi/database/status' },
      { id: 'apache-jena', name: 'Apache Jena', endpoint: '/api/koi/jena/ping' },
      { id: 'mcp-server', name: 'MCP Server', endpoint: '/api/koi/mcp/status' }
    ];

    for (const service of serviceChecks) {
      try {
        const response = await fetch(service.endpoint);
        services.push({
          ...service,
          status: response.ok ? 'active' : 'offline'
        });
      } catch {
        services.push({
          ...service,
          status: 'offline'
        });
      }
    }

    return services;
  };

  // Initialize the graph with real data
  const initializeGraph = useCallback(async () => {
    if (!isRefreshing) setLoading(true);

    try {
      // Fetch all data in parallel
      const [sensorData, processedSources, serviceStatus] = await Promise.all([
        fetchSensors(),
        fetchProcessedSourcesData(),
        fetchServiceStatus()
      ]);

      // Create sensor nodes from real data
      const sensorNodes: GraphNode[] = sensorData.map((sensor: any) => {
        // Normalize sensor data structure
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

      // Add Eliza Agents as final node
      pipelineNodes.push({
        id: 'eliza-agents',
        type: 'service' as const,
        label: 'Eliza Agents',
        status: 'active',
        icon: 'activity'
      });

      // Create edges based on actual pipeline flow
      const defaultEdges: GraphEdge[] = [];

      // Connect all active sensors to coordinator
      sensorNodes.forEach(sensor => {
        if (sensor.status === 'active') {
          defaultEdges.push({
            source: sensor.id,
            target: 'coordinator',
            type: 'data'
          });
        }
      });

      // Pipeline flow connections (based on actual architecture)
      const pipelineFlow = [
        { source: 'coordinator', target: 'event-bridge' },
        { source: 'event-bridge', target: 'bge-embeddings' },
        { source: 'bge-embeddings', target: 'postgresql' },
        { source: 'event-bridge', target: 'apache-jena' },
        { source: 'postgresql', target: 'mcp-server' },
        { source: 'mcp-server', target: 'eliza-agents' }
      ];

      pipelineFlow.forEach(flow => {
        // Only add edge if both nodes exist
        const sourceExists = pipelineNodes.some(n => n.id === flow.source);
        const targetExists = pipelineNodes.some(n => n.id === flow.target);
        if (sourceExists && targetExists) {
          defaultEdges.push({
            source: flow.source,
            target: flow.target,
            type: 'data'
          });
        }
      });

      setNodes([...sensorNodes, ...pipelineNodes]);
      setEdges(defaultEdges);
    } catch (error) {
      console.error('Error initializing graph:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Handle node click to expand sources dynamically
  const handleNodeClick = useCallback(async (node: GraphNode) => {
    if (node.type === 'sensor' && node.monitoring && node.monitoring.length > 0) {
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
            type: 'monitoring'
          });

          // Connect workspace to all pages
          pageNodes.forEach(pageNode => {
            newEdges.push({
              source: workspaceNode.id,
              target: pageNode.id,
              type: 'monitoring'
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
              type: 'monitoring'
            });
          });
        } else {
          // For other sensors, directly add source nodes
          const sourceNodes: GraphNode[] = node.monitoring.map((source: any, idx: number) => ({
            id: `${nodeId}-source-${idx}`,
            type: 'source',
            label: typeof source === 'object' ? (source.title || source.name || source.url || `Source ${idx}`) : source,
            status: 'active',
            metadata: source
          }));

          newNodes.push(...sourceNodes);

          // Connect sensor to sources
          sourceNodes.forEach(sourceNode => {
            newEdges.push({
              source: nodeId,
              target: sourceNode.id,
              type: 'monitoring'
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
    } else if (node.type === 'source' && node.metadata?.domain) {
      // For website sources, expand to show pages from this domain
      const nodeId = node.id;
      const isExpanded = expandedNodes.has(nodeId);

      if (!isExpanded) {
        // Fetch real pages for this domain from the KOI Content API
        const domain = node.metadata.domain;

        // Fetch real pages from the KOI Content API
        let pages: any[] = [];

        try {
          const response = await fetch(`/api/koi/content/pages/${domain}`);
          if (response.ok) {
            const data = await response.json();
            pages = data.pages || [];
          }
        } catch (error) {
          console.error('Error fetching pages for domain:', domain, error);
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
            type: 'monitoring'
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

    // Create force simulation with better parameters for dynamic content
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
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

    // Create arrow markers
    svg.append('defs').selectAll('marker')
      .data(['data', 'monitoring', 'control'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', d => {
        switch(d) {
          case 'data': return '#3b82f6';
          case 'monitoring': return '#10b981';
          case 'control': return '#f59e0b';
          default: return '#999';
        }
      });

    // Create edges
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', d => {
        switch(d.type) {
          case 'data': return '#3b82f6';
          case 'monitoring': return '#10b981';
          case 'control': return '#f59e0b';
          default: return '#999';
        }
      })
      .attr('stroke-width', d => d.type === 'monitoring' ? 1 : 2)
      .attr('stroke-opacity', d => d.type === 'monitoring' ? 0.6 : 0.8)
      .attr('marker-end', d => `url(#arrow-${d.type})`);

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

    // Add circles for nodes with dynamic sizing
    nodeGroups.append('circle')
      .attr('r', (d: GraphNode) => {
        if (d.type === 'page') return 6;
        if (d.type === 'source') return 10;
        if (d.type === 'sensor') return 20;
        return 15;
      })
      .attr('fill', (d: GraphNode) => {
        if (d.status === 'offline') return '#ef4444';
        if (d.status === 'idle') return '#f59e0b';
        if (d.type === 'sensor') return '#3b82f6';
        if (d.type === 'source') return '#10b981';
        if (d.type === 'page') return '#22c55e';
        if (d.type === 'processor') return '#8b5cf6';
        if (d.type === 'storage') return '#ec4899';
        if (d.type === 'service') return '#06b6d4';
        return '#6b7280';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

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
      link
        .attr('x1', d => (typeof d.source === 'object' ? d.source.x : 0) || 0)
        .attr('y1', d => (typeof d.source === 'object' ? d.source.y : 0) || 0)
        .attr('x2', d => (typeof d.target === 'object' ? d.target.x : 0) || 0)
        .attr('y2', d => (typeof d.target === 'object' ? d.target.y : 0) || 0);

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

          {selectedNode.type === 'source' && (
            <div className="mt-3">
              <p className="text-xs text-gray-600">
                Source from {selectedNode.id.split('-')[1]} sensor
              </p>
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