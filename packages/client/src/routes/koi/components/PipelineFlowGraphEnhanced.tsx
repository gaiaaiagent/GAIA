import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, Zap, Network, Brain, Activity, Eye, GitBranch, Twitter, FileText, MessageSquare, Radio, BookOpen, Gitlab, Monitor } from 'lucide-react';
import { notionPages } from '../data/notionPages';

interface GraphNode {
  id: string;
  type: 'sensor' | 'source' | 'processor' | 'storage' | 'service';
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

const PipelineFlowGraphEnhanced: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const simulationRef = useRef<d3.Simulation<GraphNode, GraphEdge> | null>(null);

  // Fetch sensor data - use coordinator proxy or hardcoded data
  const fetchSensors = async () => {
    try {
      // Try to fetch from coordinator via proxy
      const response = await fetch('/api/koi/coordinator/sensors');
      if (response.ok) {
        const data = await response.json();
        setSensors(data.sensors || []);
        return data.sensors || [];
      }
    } catch (error) {
      console.error('Error fetching sensors from API:', error);
    }

    // Fallback to hardcoded sensor data since we know what's running
    const hardcodedSensors = [
      {
        id: 'twitter-sensor',
        name: 'Twitter Sensor',
        type: 'twitter',
        status: 'active',
        monitoring: ['@regen_network']
      },
      {
        id: 'github-sensor',
        name: 'GitHub Sensor',
        type: 'github',
        status: 'active',
        monitoring: [
          'regen-network/regen-ledger',
          'regen-network/regen-js',
          'regen-network/regen-web',
          'regen-network/regen-data-standards',
          'regen-network/groups-ui'
        ]
      },
      {
        id: 'gitlab-sensor',
        name: 'GitLab Sensor',
        type: 'gitlab',
        status: 'active',
        monitoring: [
          'regen-public/regen-whitepapers',
          'regen-public/regen-public-docs'
        ]
      },
      {
        id: 'discourse-sensor',
        name: 'Discourse Sensor',
        type: 'discourse',
        status: 'active',
        monitoring: ['forum.regen.network', 'regencommons.discourse.group']
      },
      {
        id: 'website-sensor',
        name: 'Website Sensor',
        type: 'website',
        status: 'active',
        monitoring: [
          'regen.network',
          'docs.regen.network',
          'guides.regen.network',
          'registry.regen.network',
          'regen.foundation'
        ]
      },
      {
        id: 'notion-sensor',
        name: 'Notion Sensor',
        type: 'notion',
        status: 'active',
        monitoring: [
          { title: 'AI KOI Guide', url: 'https://www.notion.so/AI-KOI-Guide-1d925b77eda18032ae2ce0fd7f89a9c7' },
          { title: 'AI Agent Architecture Analysis', url: 'https://www.notion.so/AI-Agent-Architecture-Analysis-1f525b77eda180239b2ef11a0f96d45c' },
          { title: 'Asha regen biocultural meeting summary', url: 'https://www.notion.so/Asha-regen-biocultural-meeting-summary-27725b77eda18031bb1deab993abb555' },
          { title: 'BioFi Fund of Funds Design', url: 'https://www.notion.so/BioFi-Fund-of-Funds-Design-27325b77eda1807b9248dedbad96db15' },
          { title: '2025 Registry Fee and Contract Development', url: 'https://www.notion.so/2025-Registry-Fee-and-Contract-Development-6147f9fd599b432d9bec5a1789ca47d1' }
          // Add more as needed
        ]
      },
      {
        id: 'podcast-sensor',
        name: 'Podcast Sensor',
        type: 'podcast',
        status: 'active',
        monitoring: ['Planetary Regeneration Podcast']
      },
      {
        id: 'medium-sensor',
        name: 'Medium Sensor',
        type: 'medium',
        status: 'active',
        monitoring: ['regen-network.medium.com']
      },
      {
        id: 'telegram-sensor',
        name: 'Telegram Sensor',
        type: 'telegram',
        status: 'active',
        monitoring: ['Telegram channels']
      }
    ];

    setSensors(hardcodedSensors);
    return hardcodedSensors;
  };

  // Initialize the graph with sensor and pipeline nodes
  const initializeGraph = useCallback(async () => {
    const sensorData = await fetchSensors();

    // Create sensor nodes
    const sensorNodes: GraphNode[] = sensorData.map((sensor: any) => ({
      id: `sensor-${sensor.type}`,
      type: 'sensor' as const,
      label: sensor.name || sensor.type,
      status: sensor.status === 'active' ? 'active' : 'idle',
      icon: sensor.type,
      monitoring: sensor.monitoring,
      metadata: sensor,
      children: []
    }));

    // Create pipeline component nodes
    const pipelineNodes: GraphNode[] = [
      {
        id: 'coordinator',
        type: 'processor' as const,
        label: 'KOI Coordinator',
        status: 'active',
        icon: 'network'
      },
      {
        id: 'event-bridge',
        type: 'processor' as const,
        label: 'Event Bridge',
        status: 'active',
        icon: 'zap'
      },
      {
        id: 'bge-embeddings',
        type: 'processor' as const,
        label: 'BGE Embeddings',
        status: 'active',
        icon: 'brain'
      },
      {
        id: 'postgresql',
        type: 'storage' as const,
        label: 'PostgreSQL',
        status: 'active',
        icon: 'database'
      },
      {
        id: 'apache-jena',
        type: 'storage' as const,
        label: 'Apache Jena',
        status: 'active',
        icon: 'database'
      },
      {
        id: 'mcp-server',
        type: 'service' as const,
        label: 'MCP Server',
        status: 'active',
        icon: 'activity'
      },
      {
        id: 'eliza-agents',
        type: 'service' as const,
        label: 'Eliza Agents',
        status: 'active',
        icon: 'activity'
      }
    ];

    // Create edges for the default pipeline flow
    const defaultEdges: GraphEdge[] = [];

    // Connect all sensors to coordinator
    sensorNodes.forEach(sensor => {
      defaultEdges.push({
        source: sensor.id,
        target: 'coordinator',
        type: 'data'
      });
    });

    // Pipeline flow connections
    defaultEdges.push(
      { source: 'coordinator', target: 'event-bridge', type: 'data' },
      { source: 'event-bridge', target: 'bge-embeddings', type: 'data' },
      { source: 'bge-embeddings', target: 'postgresql', type: 'data' },
      { source: 'event-bridge', target: 'apache-jena', type: 'data' },
      { source: 'postgresql', target: 'mcp-server', type: 'data' },
      { source: 'mcp-server', target: 'eliza-agents', type: 'data' }
    );

    setNodes([...sensorNodes, ...pipelineNodes]);
    setEdges(defaultEdges);
  }, []);

  // Handle node click to expand sources
  const handleNodeClick = useCallback((node: GraphNode) => {
    if (node.type === 'sensor' && node.monitoring) {
      const newNodes = [...nodes];
      const newEdges = [...edges];

      // Toggle expansion
      node.expanded = !node.expanded;

      if (node.expanded) {
        // Add source nodes for this sensor
        if (node.icon === 'notion' && node.monitoring.length > 0) {
          // For Notion, create a workspace node first
          const workspaceNode: GraphNode = {
            id: `${node.id}-workspace`,
            type: 'source',
            label: 'Regen Network Notion',
            status: 'active',
            children: []
          };

          // Add ALL page nodes - no limit
          const pageNodes: GraphNode[] = node.monitoring.map((page: any, idx: number) => ({
            id: `${node.id}-page-${idx}`,
            type: 'source',
            label: typeof page === 'object' ? page.title : page,
            status: 'active',
            metadata: page
          }));

          newNodes.push(workspaceNode, ...pageNodes);

          // Connect sensor to workspace
          newEdges.push({
            source: node.id,
            target: workspaceNode.id,
            type: 'monitoring'
          });

          // Connect workspace to pages
          pageNodes.forEach(pageNode => {
            newEdges.push({
              source: workspaceNode.id,
              target: pageNode.id,
              type: 'monitoring'
            });
          });
        } else {
          // For other sensors, directly add source nodes
          const sourceNodes: GraphNode[] = node.monitoring.slice(0, 10).map((source: any, idx: number) => ({
            id: `${node.id}-source-${idx}`,
            type: 'source',
            label: typeof source === 'object' ? source.title || source.name : source,
            status: 'active',
            metadata: source
          }));

          newNodes.push(...sourceNodes);

          // Connect sensor to sources
          sourceNodes.forEach(sourceNode => {
            newEdges.push({
              source: node.id,
              target: sourceNode.id,
              type: 'monitoring'
            });
          });
        }
      } else {
        // Remove source nodes and their edges
        const nodeIdsToRemove = newNodes
          .filter(n => n.id.startsWith(`${node.id}-`))
          .map(n => n.id);

        setNodes(newNodes.filter(n => !nodeIdsToRemove.includes(n.id)));
        setEdges(newEdges.filter(e => {
          const sourceId = typeof e.source === 'object' ? e.source.id : e.source;
          const targetId = typeof e.target === 'object' ? e.target.id : e.target;
          return !nodeIdsToRemove.includes(sourceId) && !nodeIdsToRemove.includes(targetId);
        }));
        return;
      }

      setNodes(newNodes);
      setEdges(newEdges);
    }

    setSelectedNode(node);
  }, [nodes, edges]);

  // D3 Force Simulation
  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = 1200;
    const height = 800;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 2])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g');

    // Create force simulation
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphEdge>(edges)
        .id(d => d.id)
        .distance(d => {
          const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
          const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
          if (sourceNode?.type === 'sensor' && targetNode?.type === 'source') return 80;
          if (d.type === 'monitoring') return 60;
          return 120;
        }))
      .force('charge', d3.forceManyBody().strength(d => {
        if (d.type === 'source') return -50;
        if (d.type === 'sensor') return -200;
        return -150;
      }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    simulationRef.current = simulation;

    // Create arrow markers for directed edges
    svg.append('defs').selectAll('marker')
      .data(['data', 'monitoring', 'control'])
      .enter().append('marker')
      .attr('id', d => `arrow-${d}`)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
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
      .attr('stroke-width', 2)
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
          d.fx = null;
          d.fy = null;
        }));

    // Add circles for nodes
    nodeGroups.append('circle')
      .attr('r', d => {
        if (d.type === 'source') return 8;
        if (d.type === 'sensor') return 20;
        return 15;
      })
      .attr('fill', d => {
        if (d.status === 'offline') return '#ef4444';
        if (d.status === 'idle') return '#f59e0b';
        if (d.type === 'sensor') return '#3b82f6';
        if (d.type === 'source') return '#10b981';
        if (d.type === 'processor') return '#8b5cf6';
        if (d.type === 'storage') return '#ec4899';
        if (d.type === 'service') return '#06b6d4';
        return '#6b7280';
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Add labels
    nodeGroups.append('text')
      .text(d => d.label)
      .attr('x', 0)
      .attr('y', d => d.type === 'source' ? 20 : 35)
      .attr('text-anchor', 'middle')
      .style('font-size', d => d.type === 'source' ? '10px' : '12px')
      .style('fill', '#1f2937');

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

  useEffect(() => {
    initializeGraph();
    const interval = setInterval(fetchSensors, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [initializeGraph]);

  return (
    <div className="relative w-full h-[800px]">
      <svg
        ref={svgRef}
        className="w-full h-full border rounded-lg bg-gray-50"
        viewBox="0 0 1200 800"
      />

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
            {selectedNode.status}
          </Badge>

          {selectedNode.type === 'sensor' && selectedNode.monitoring && (
            <div className="mt-3">
              <p className="text-sm text-gray-700 font-medium mb-1">
                Monitoring {selectedNode.monitoring.length} items
              </p>
              <p className="text-xs text-gray-600">
                Click to {selectedNode.expanded ? 'collapse' : 'expand'} sources
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
        Click sensors to expand • Drag nodes to reposition • Scroll to zoom
      </div>
    </div>
  );
};

export default PipelineFlowGraphEnhanced;