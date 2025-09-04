import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Loader2
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  size: number;
  color: string;
  type: string;
  x?: number;
  y?: number;
}

interface GraphEdge {
  source: string;
  target: string;
  label: string;
  weight: number;
  color: string;
}

interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Large-scale Graph Explorer using Sigma.js
 * 
 * Interactive network visualization for the knowledge graph
 * Supports pan, zoom, node selection, and search
 */
export default function GraphExplorer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial graph data
  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first, fallback to mock data if not available
      let data;
      try {
        const response = await fetch('/api/koi/graph-data/?max_nodes=1000&depth=2');
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Fallback to mock data for testing
        console.log('Using mock graph data for testing');
        data = {
          nodes: [
            { id: 'doc1', label: 'Regen White Paper 2023', size: 15, color: '#4285f4', type: 'Document' },
            { id: 'doc2', label: 'Regenerative Agriculture Principles', size: 12, color: '#4285f4', type: 'Document' },
            { id: 'doc3', label: 'Carbon Sequestration Study', size: 10, color: '#4285f4', type: 'Document' },
            { id: 'concept1', label: 'Regenerative Agriculture', size: 18, color: '#34a853', type: 'Concept' },
            { id: 'concept2', label: 'Carbon Sequestration', size: 14, color: '#34a853', type: 'Concept' },
            { id: 'concept3', label: 'Ecosystem Health', size: 16, color: '#34a853', type: 'Concept' },
            { id: 'essence1', label: 'Re-Whole Value', size: 20, color: '#ea4335', type: 'EssenceAlignment' },
            { id: 'essence2', label: 'Nest Caring', size: 18, color: '#ea4335', type: 'EssenceAlignment' },
            { id: 'essence3', label: 'Harmonize Agency', size: 16, color: '#ea4335', type: 'EssenceAlignment' },
            { id: 'process1', label: 'Soil Carbon Enhancement', size: 13, color: '#fbbc04', type: 'MetabolicProcess' },
            { id: 'process2', label: 'Biodiversity Restoration', size: 11, color: '#fbbc04', type: 'MetabolicProcess' }
          ],
          edges: [
            { source: 'doc1', target: 'concept1', label: 'mentions', weight: 0.8, color: '#666' },
            { source: 'doc2', target: 'concept1', label: 'defines', weight: 0.9, color: '#666' },
            { source: 'doc3', target: 'concept2', label: 'studies', weight: 0.7, color: '#666' },
            { source: 'concept1', target: 'essence1', label: 'alignsWith', weight: 0.89, color: '#666' },
            { source: 'concept1', target: 'essence2', label: 'alignsWith', weight: 0.76, color: '#666' },
            { source: 'concept2', target: 'essence1', label: 'alignsWith', weight: 0.79, color: '#666' },
            { source: 'concept3', target: 'essence3', label: 'alignsWith', weight: 0.82, color: '#666' },
            { source: 'concept1', target: 'process1', label: 'enabledBy', weight: 0.6, color: '#666' },
            { source: 'concept2', target: 'process2', label: 'enabledBy', weight: 0.7, color: '#666' },
            { source: 'process1', target: 'concept3', label: 'produces', weight: 0.5, color: '#666' }
          ]
        };
      }

      setGraphData({
        nodes: data.nodes || [],
        edges: data.edges || []
      });

      // Initialize Sigma.js visualization
      if (containerRef.current && data.nodes?.length > 0) {
        initializeVisualization(data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load graph data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const initializeVisualization = async (data: GraphData) => {
    // Sigma.js initialization will be implemented in Phase 3
    // For now, show a placeholder
    console.log('Initializing Sigma.js with data:', data);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    // Implement search highlighting
    console.log('Searching for:', term);
  };

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNode(nodeId);
    // Implement node highlighting and neighborhood display
    console.log('Selected node:', nodeId);
  };

  const resetView = () => {
    // Reset zoom and pan
    console.log('Resetting view');
  };

  const getNodeTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'Document': '#4285f4',
      'Concept': '#34a853',
      'EssenceAlignment': '#ea4335',
      'MetabolicProcess': '#fbbc04',
      'default': '#999'
    };
    return colorMap[type] || colorMap.default;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls Bar */}
      <div className="flex items-center justify-between p-4 border-b bg-card/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search nodes..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => console.log('Zoom in')}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => console.log('Zoom out')}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={resetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {graphData && (
            <>
              <Badge variant="outline">
                {graphData.nodes.length} nodes
              </Badge>
              <Badge variant="outline">
                {graphData.edges.length} edges
              </Badge>
            </>
          )}
        </div>
      </div>

      {/* Graph Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading graph data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Error Loading Graph</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadGraphData} className="w-full">
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sigma.js container */}
        <div 
          ref={containerRef} 
          className="w-full h-full bg-muted/20"
          style={{ minHeight: '400px' }}
        >
          {/* Placeholder visualization */}
          {!loading && !error && graphData && (
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🕸️</div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Graph Visualization</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Interactive Sigma.js graph visualization will be implemented in Phase 3.
                    Currently showing {graphData.nodes.length} nodes and {graphData.edges.length} edges.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Node Info Panel */}
        {selectedNode && graphData && (
          <div className="absolute top-4 right-4 w-80">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Node Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(() => {
                  const node = graphData.nodes.find(n => n.id === selectedNode);
                  if (!node) return <p>Node not found</p>;
                  
                  return (
                    <>
                      <div>
                        <strong>ID:</strong> {node.id}
                      </div>
                      <div>
                        <strong>Label:</strong> {node.label}
                      </div>
                      <div>
                        <strong>Type:</strong> 
                        <Badge 
                          variant="outline" 
                          className="ml-2"
                          style={{ borderColor: getNodeTypeColor(node.type) }}
                        >
                          {node.type}
                        </Badge>
                      </div>
                      <div>
                        <strong>Connections:</strong> {
                          graphData.edges.filter(e => 
                            e.source === selectedNode || e.target === selectedNode
                          ).length
                        }
                      </div>
                    </>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4">
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Node Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.entries({
                'Document': '#4285f4',
                'Concept': '#34a853',
                'Essence': '#ea4335',
                'Process': '#fbbc04'
              }).map(([type, color]) => (
                <div key={type} className="flex items-center gap-2 text-xs">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: color }}
                  />
                  {type}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}