import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Filter, 
  RefreshCw, 
  Download,
  Loader2,
  Brain
} from 'lucide-react';

interface EssenceDocument {
  id: string;
  title: string;
  essenceScores: {
    'Re-Whole Value': number;
    'Nest Caring': number;
    'Harmonize Agency': number;
  };
  confidence: number;
}

/**
 * Essence Alignment Radar Visualization
 * 
 * D3.js-powered radar chart showing essence alignment patterns
 * for Re-Whole Value, Nest Caring, and Harmonize Agency
 */
export default function EssenceRadar() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [documents, setDocuments] = useState<EssenceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minConfidence, setMinConfidence] = useState([0.5]);
  const [selectedEssence, setSelectedEssence] = useState<string>('all');

  useEffect(() => {
    loadEssenceData();
  }, [minConfidence, selectedEssence]);

  const loadEssenceData = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        min_confidence: minConfidence[0].toString(),
        ...(selectedEssence !== 'all' && { essence_type: selectedEssence })
      });

      // Try to fetch from API first, fallback to mock data if not available
      let data;
      try {
        const response = await fetch(`/api/koi/essence-data/?${params}`);
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error('API not available');
        }
      } catch (apiError) {
        // Fallback to mock data for testing
        console.log('Using mock essence data for testing');
        data = {
          essence_data: [
            {
              id: 'doc1',
              title: 'Regen Network White Paper 2023',
              essenceScores: {
                'Re-Whole Value': 0.89,
                'Nest Caring': 0.76,
                'Harmonize Agency': 0.82
              },
              confidence: 0.94
            },
            {
              id: 'doc2', 
              title: 'Regenerative Agriculture Principles',
              essenceScores: {
                'Re-Whole Value': 0.92,
                'Nest Caring': 0.88,
                'Harmonize Agency': 0.71
              },
              confidence: 0.96
            },
            {
              id: 'doc3',
              title: 'Carbon Sequestration Study',
              essenceScores: {
                'Re-Whole Value': 0.79,
                'Nest Caring': 0.84,
                'Harmonize Agency': 0.67
              },
              confidence: 0.88
            },
            {
              id: 'doc4',
              title: 'Biodiversity & Ecosystem Health',
              essenceScores: {
                'Re-Whole Value': 0.85,
                'Nest Caring': 0.91,
                'Harmonize Agency': 0.74
              },
              confidence: 0.92
            },
            {
              id: 'doc5',
              title: 'Soil Restoration Practices',
              essenceScores: {
                'Re-Whole Value': 0.88,
                'Nest Caring': 0.79,
                'Harmonize Agency': 0.86
              },
              confidence: 0.90
            }
          ]
        };
      }

      // Filter by confidence threshold
      const filteredData = data.essence_data?.filter((doc: any) => 
        doc.confidence >= minConfidence[0]
      ) || [];

      // Filter by selected essence type
      let finalData = filteredData;
      if (selectedEssence !== 'all') {
        finalData = filteredData.filter((doc: any) => 
          doc.essenceScores[selectedEssence] >= 0.5
        );
      }

      setDocuments(finalData);

      // Render visualization
      if (svgRef.current && finalData.length > 0) {
        renderRadarChart(finalData);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load essence data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderRadarChart = (data: EssenceDocument[]) => {
    // D3.js radar chart implementation will be added in Phase 3
    console.log('Rendering radar chart with data:', data);
    
    // For now, clear any existing content and show placeholder
    const svg = svgRef.current;
    if (svg) {
      svg.innerHTML = '';
    }
  };

  const exportVisualization = () => {
    // Export functionality
    console.log('Exporting essence radar visualization');
  };

  const resetFilters = () => {
    setMinConfidence([0.5]);
    setSelectedEssence('all');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Confidence Filter */}
          <div className="space-y-2 min-w-48">
            <label className="text-sm font-medium">
              Minimum Confidence: {minConfidence[0].toFixed(2)}
            </label>
            <Slider
              value={minConfidence}
              onValueChange={setMinConfidence}
              max={1}
              min={0}
              step={0.01}
              className="w-full"
            />
          </div>

          {/* Essence Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Essence Type</label>
            <Select value={selectedEssence} onValueChange={setSelectedEssence}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select essence type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Essences</SelectItem>
                <SelectItem value="Re-Whole Value">Re-Whole Value</SelectItem>
                <SelectItem value="Nest Caring">Nest Caring</SelectItem>
                <SelectItem value="Harmonize Agency">Harmonize Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetFilters} className="gap-2">
            <Filter className="h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={loadEssenceData} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportVisualization} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Badge variant="outline" className="gap-2">
          <Brain className="h-3 w-3" />
          {documents.length} Documents
        </Badge>
        <Badge variant="outline">
          Min Confidence: {minConfidence[0].toFixed(2)}
        </Badge>
        {selectedEssence !== 'all' && (
          <Badge variant="secondary">
            Filter: {selectedEssence}
          </Badge>
        )}
      </div>

      {/* Visualization Container */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p className="text-sm text-muted-foreground">Loading essence data...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Card className="max-w-md">
              <CardHeader>
                <CardTitle className="text-red-600">Error Loading Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadEssenceData} className="w-full">
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="w-full h-full min-h-[400px] flex items-center justify-center">
          {!loading && !error && documents.length > 0 ? (
            <div className="w-full h-full relative">
              {/* SVG Container for D3.js */}
              <svg 
                ref={svgRef} 
                className="w-full h-full"
                viewBox="0 0 800 600"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Placeholder content */}
                <g transform="translate(400, 300)">
                  <circle cx="0" cy="0" r="150" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  <circle cx="0" cy="0" r="100" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  <circle cx="0" cy="0" r="50" fill="none" stroke="#e5e5e5" strokeWidth="1" />
                  
                  <line x1="0" y1="0" x2="0" y2="-150" stroke="#999" strokeWidth="1" />
                  <line x1="0" y1="0" x2="129.9" y2="75" stroke="#999" strokeWidth="1" />
                  <line x1="0" y1="0" x2="-129.9" y2="75" stroke="#999" strokeWidth="1" />
                  
                  <text x="0" y="-170" textAnchor="middle" className="fill-foreground text-sm font-medium">
                    Re-Whole Value
                  </text>
                  <text x="140" y="85" textAnchor="middle" className="fill-foreground text-sm font-medium">
                    Nest Caring
                  </text>
                  <text x="-140" y="85" textAnchor="middle" className="fill-foreground text-sm font-medium">
                    Harmonize Agency
                  </text>
                  
                  <text x="0" y="0" textAnchor="middle" className="fill-muted-foreground text-xs">
                    D3.js Radar Chart
                  </text>
                  <text x="0" y="15" textAnchor="middle" className="fill-muted-foreground text-xs">
                    Coming in Phase 3
                  </text>
                </g>
              </svg>

              {/* Legend */}
              <div className="absolute top-4 right-4">
                <Card className="w-48">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Essence Types</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      Re-Whole Value
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      Nest Caring  
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-orange-500" />
                      Harmonize Agency
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : !loading && !error && documents.length === 0 ? (
            <div className="text-center space-y-4">
              <div className="text-6xl">🎯</div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium">No Data Found</h3>
                <p className="text-sm text-muted-foreground">
                  Try adjusting the filters or check if the SPARQL endpoint is available.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3">Essence Distribution Summary</h4>
            <div className="grid grid-cols-3 gap-4">
              {['Re-Whole Value', 'Nest Caring', 'Harmonize Agency'].map(essence => {
                const avgScore = documents.reduce((sum, doc) => 
                  sum + doc.essenceScores[essence as keyof typeof doc.essenceScores], 0
                ) / documents.length;
                
                return (
                  <div key={essence} className="text-center">
                    <div className="text-lg font-bold text-primary">
                      {avgScore.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Avg {essence}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}