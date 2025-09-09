import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface PipelineNode {
  id: string;
  type: 'sensor' | 'processor' | 'storage';
  label: string;
  metrics: {
    port?: number;
    status?: string;
    event_count?: number;
    last_event?: string;
  };
  x?: number;
  y?: number;
}

interface PipelineEdge {
  source: string;
  target: string;
  type: string;
}

interface PipelineData {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  metrics: {
    total_documents?: number;
    total_embeddings?: number;
    unique_rids?: number;
    unique_sensors?: number;
  };
}

const PipelineFlowGraph: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [pipelineData, setPipelineData] = useState<PipelineData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [transformations, setTransformations] = useState<any[]>([]);

  useEffect(() => {
    fetchPipelineData();
    const interval = setInterval(fetchPipelineData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchPipelineData = async () => {
    try {
      const response = await fetch('/api/koi/pipeline-flow');
      const data = await response.json();
      if (data.status === 'ok') {
        setPipelineData(data.pipeline);
      }
    } catch (error) {
      console.error('Error fetching pipeline data:', error);
    }
  };

  const fetchTransformations = async (sensorId: string) => {
    try {
      const response = await fetch('/api/koi/transformations?limit=5');
      const data = await response.json();
      if (data.status === 'ok') {
        setTransformations(data.transformations);
      }
    } catch (error) {
      console.error('Error fetching transformations:', error);
    }
  };

  useEffect(() => {
    if (!pipelineData || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 500;

    // Clear previous render
    svg.selectAll('*').remove();

    // Create main group
    const g = svg.append('g');

    // Position nodes in a pipeline layout
    const nodePositions: { [key: string]: { x: number; y: number } } = {
      'coordinator': { x: 300, y: 250 },
      'event-bridge': { x: 450, y: 250 },
      'bge-server': { x: 450, y: 150 },
      'database': { x: 600, y: 250 }
    };

    // Position sensor nodes
    const sensorNodes = pipelineData.nodes.filter(n => n.type === 'sensor');
    sensorNodes.forEach((node, i) => {
      nodePositions[node.id] = { x: 150, y: 200 + i * 60 };
    });

    // Apply positions to nodes
    const nodesWithPositions = pipelineData.nodes.map(node => ({
      ...node,
      x: nodePositions[node.id]?.x || 100,
      y: nodePositions[node.id]?.y || 100
    }));

    // Create arrow markers
    svg.append('defs').selectAll('marker')
      .data(['arrow'])
      .enter().append('marker')
      .attr('id', d => d)
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 25)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#999');

    // Draw edges
    const edges = g.selectAll('.edge')
      .data(pipelineData.edges)
      .enter().append('g')
      .attr('class', 'edge');

    edges.append('line')
      .attr('x1', d => nodePositions[d.source]?.x || 0)
      .attr('y1', d => nodePositions[d.source]?.y || 0)
      .attr('x2', d => nodePositions[d.target]?.x || 0)
      .attr('y2', d => nodePositions[d.target]?.y || 0)
      .attr('stroke', '#999')
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrow)');

    // Animate data flow particles
    edges.append('circle')
      .attr('r', 4)
      .attr('fill', '#4CAF50')
      .attr('opacity', 0.8)
      .append('animateMotion')
      .attr('dur', '3s')
      .attr('repeatCount', 'indefinite')
      .append('mpath')
      .attr('href', (d, i) => `#path-${i}`);

    // Draw nodes
    const nodes = g.selectAll('.node')
      .data(nodesWithPositions)
      .enter().append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.x},${d.y})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        setSelectedNode(d.id);
        if (d.type === 'sensor') {
          fetchTransformations(d.id);
        }
      });

    // Node circles
    nodes.append('circle')
      .attr('r', 30)
      .attr('fill', d => {
        switch (d.type) {
          case 'sensor': return '#2196F3';
          case 'processor': return '#FF9800';
          case 'storage': return '#4CAF50';
          default: return '#666';
        }
      })
      .attr('stroke', d => selectedNode === d.id ? '#000' : 'none')
      .attr('stroke-width', 3);

    // Node icons
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', -40)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .text(d => d.label);

    // Node metrics
    nodes.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 45)
      .style('font-size', '10px')
      .text(d => {
        if (d.type === 'sensor' && d.metrics.event_count) {
          return `${d.metrics.event_count} events`;
        }
        if (d.metrics.port) {
          return `Port ${d.metrics.port}`;
        }
        return '';
      });

    // Status indicator
    nodes.append('circle')
      .attr('r', 5)
      .attr('cx', 20)
      .attr('cy', -20)
      .attr('fill', d => d.metrics.status === 'online' ? '#4CAF50' : '#f44336');

  }, [pipelineData, selectedNode]);

  return (
    <div className="pipeline-flow-graph">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Pipeline Data Flow</h3>
        {pipelineData?.metrics && (
          <div className="text-sm text-gray-600">
            Documents: {pipelineData.metrics.total_documents} | 
            Embeddings: {pipelineData.metrics.total_embeddings} | 
            Sensors: {pipelineData.metrics.unique_sensors}
          </div>
        )}
      </div>
      
      <svg 
        ref={svgRef} 
        width="800" 
        height="500"
        style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}
      />
      
      {selectedNode && (
        <div className="mt-4 p-4 bg-gray-50 rounded">
          <h4 className="font-semibold mb-2">Selected: {selectedNode}</h4>
          {transformations.length > 0 && (
            <div>
              <h5 className="text-sm font-medium mb-1">Recent Transformations:</h5>
              <ul className="text-xs space-y-1">
                {transformations.slice(0, 5).map((t, i) => (
                  <li key={i} className="bg-white p-2 rounded">
                    <div className="flex justify-between">
                      <span>{t.transformation_type}</span>
                      <span className="text-gray-500">
                        {t.chunks_created} chunks, {t.embeddings_created} embeddings
                      </span>
                    </div>
                    <div className="text-gray-400 mt-1">
                      RID: {t.input_rid?.substring(0, 20)}...
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PipelineFlowGraph;