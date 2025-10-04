import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Settings,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';
import D3ForceGraph from './D3ForceGraph';

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
  const [showMetadata, setShowMetadata] = useState(false);

  // Load graph data when showMetadata changes
  useEffect(() => {
    loadGraphData();
  }, [showMetadata]);

  const loadGraphData = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/koi/graph-data/?max_nodes=1000&depth=2&show_metadata=${showMetadata}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

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

        {/* D3 Force Graph container */}
        <div
          ref={containerRef}
          className="w-full h-full bg-muted/20"
          style={{ minHeight: '600px', height: '100%' }}
        >
          {/* D3.js Force-Directed Graph */}
          {!loading && !error && graphData && graphData.nodes.length > 0 && (
            <D3ForceGraph
              nodes={graphData.nodes}
              edges={graphData.edges}
              width={containerRef.current?.clientWidth || 1200}
              height={containerRef.current?.clientHeight || 800}
              onNodeClick={(node) => handleNodeSelect(node.id)}
            />
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

        {/* Legend and Controls */}
        <div className="absolute bottom-4 left-4 space-y-2">
          <Card className="w-64">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Display Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Metadata Toggle */}
              <div className="flex items-center justify-between">
                <Label htmlFor="metadata-toggle" className="text-xs flex items-center gap-2">
                  {showMetadata ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  Show Metadata Nodes
                </Label>
                <Switch
                  id="metadata-toggle"
                  checked={showMetadata}
                  onCheckedChange={setShowMetadata}
                />
              </div>
              
              {/* Node Type Legend */}
              <div className="pt-2 border-t">
                <div className="text-xs font-medium mb-2">Node Types</div>
                {Object.entries({
                  'SemanticAsset': '#4CAF50',
                  'Agent': '#2196F3',
                  'Organization': '#9C27B0',
                  'Resource': '#FF9800',
                  ...(showMetadata ? {
                    'Ontology': '#607D8B',
                    'CID': '#795548'
                  } : {})
                }).map(([type, color]) => (
                  <div key={type} className="flex items-center gap-2 text-xs py-0.5">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: color }}
                    />
                    <span>{type}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}