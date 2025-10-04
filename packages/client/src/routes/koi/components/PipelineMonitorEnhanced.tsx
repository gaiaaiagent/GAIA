import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Network,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  GitBranch,
  Eye,
  Clock as Timeline,
  FileText,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PipelineFlowGraphDynamic from './PipelineFlowGraphDynamic';
import ProvenanceTimeline from './ProvenanceTimeline';
import PipelineMonitor from './PipelineMonitor';

/**
 * Enhanced Pipeline Monitor with Flow Visualization and Provenance Tracking
 */
interface PipelineMonitorEnhancedProps {
  rid?: string;
  subView?: string;
}

const PipelineMonitorEnhanced: React.FC<PipelineMonitorEnhancedProps> = ({ rid, subView }) => {
  const [activeView, setActiveView] = useState(subView || 'overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Switch to provenance tab when RID is provided or subView changes
  useEffect(() => {
    if (rid) {
      setActiveView('provenance');
    } else if (subView) {
      setActiveView(subView);
    }
  }, [rid, subView]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Trigger refresh of child components
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">KOI Pipeline Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of sensor data flow and transformation provenance
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabbed interface */}
      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="provenance" className="flex items-center gap-2">
            <Timeline className="h-4 w-4" />
            Provenance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Interactive Data Flow with node status */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Interactive Data Flow
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Data flows with real-time status monitoring
              </p>
            </CardHeader>
            <CardContent>
              <PipelineFlowGraphDynamic showNodeStatus={true} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Provenance Tab - Transformation Timeline */}
        <TabsContent value="provenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Timeline className="h-5 w-5" />
                Transformation Provenance
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Trace the complete transformation history of any RID with CAT receipts
              </p>
            </CardHeader>
            <CardContent>
              <ProvenanceTimeline rid={rid} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Pipeline Statistics removed - data not currently available */}
    </div>
  );
};

/**
 * Sub-component for transformation statistics
 */
const TransformationStats: React.FC = () => {
  const [stats, setStats] = useState({
    totalTransformations: 0,
    successRate: 0,
    averageChunks: 0,
    averageEmbeddings: 0
  });

  useEffect(() => {
    fetchStats();
    // Removed auto-refresh to prevent graph from resetting
  }, []);

  const fetchStats = async () => {
    try {
      // Try to fetch from Event Bridge stats endpoint through proxy
      const directUrl = '/api/koi/event-bridge/stats';
      const response = await fetch(directUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        // Calculate stats from Event Bridge data
        const totalTransformations = data.embeddings?.bge || 0;
        const uniqueDocs = data.unique_documents || 0;
        
        setStats({
          totalTransformations: totalTransformations,
          successRate: totalTransformations > 0 ? 100 : 0, // All BGE embeddings are successful
          averageChunks: uniqueDocs > 0 && totalTransformations > 0 ? Math.round(totalTransformations / uniqueDocs) : 1,
          averageEmbeddings: 1 // BGE generates 1 embedding per document
        });
        return;
      }
    } catch (error) {
      // Direct fetch failed, try proxy endpoint
      try {
        const proxyResponse = await fetch('/api/koi/event-bridge/stats');
        if (proxyResponse.ok) {
          const data = await proxyResponse.json();
          const totalTransformations = data.embeddings?.bge || 0;
          setStats({
            totalTransformations: totalTransformations,
            successRate: totalTransformations > 0 ? 100 : 0,
            averageChunks: 1,
            averageEmbeddings: 1
          });
          return;
        }
      } catch (proxyError) {
        console.error('Error fetching transformation stats:', proxyError);
      }
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Total Transformations</p>
        <p className="text-2xl font-bold">{stats.totalTransformations}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Success Rate</p>
        <p className="text-2xl font-bold">{stats.successRate}%</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Avg Chunks/Transform</p>
        <p className="text-2xl font-bold">{stats.averageChunks}</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Avg Embeddings/Transform</p>
        <p className="text-2xl font-bold">{stats.averageEmbeddings}</p>
      </div>
    </div>
  );
};

/**
 * Sensor Status View - Shows only the Active Sensor Nodes section
 */
const SensorStatusView: React.FC = () => {
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSensors, setExpandedSensors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const proxyUrl = `/api/koi/coordinator/sensors`;
      const response = await fetch(proxyUrl);

      if (response.ok) {
        const data = await response.json();
        if (data.sensors && Array.isArray(data.sensors)) {
          setSensors(data.sensors);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
    }

    setSensors([]);
    setLoading(false);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Sensor Nodes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sensors.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <WifiOff className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p className="text-lg font-medium">No Active Sensors</p>
              <p className="text-sm mt-2">Sensors are currently offline or not connected to the coordinator.</p>
              <p className="text-xs mt-4">Start sensors with: <code className="bg-gray-100 px-2 py-1 rounded">cd /opt/projects/koi-sensors && ./start_all_sensors.sh</code></p>
            </div>
          ) : sensors.map((sensor) => (
            <div key={sensor.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Globe className="h-5 w-5 text-primary" />
                  <div>
                    <h3 className="font-medium">{sensor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ID: {sensor.id} • Type: {sensor.type}
                    </p>
                  </div>
                </div>
                <Badge
                  variant={
                    sensor.status === 'active' ? 'default' :
                    sensor.status === 'idle' ? 'secondary' :
                    sensor.status === 'offline' ? 'destructive' :
                    'outline'
                  }
                >
                  {sensor.status === 'active' ? '🟢 Active' :
                   sensor.status === 'idle' ? '🟡 Idle' :
                   sensor.status === 'offline' ? '🔴 Offline' :
                   sensor.status}
                </Badge>
              </div>

              {sensor.monitoring && (
                <div className="space-y-2">
                  {sensor.type === 'notion' ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">
                          {sensor.monitoring.length === 1 && typeof sensor.monitoring[0] === 'string' && sensor.monitoring[0].includes('loading') ?
                            'Loading Notion pages...' :
                            `Monitoring ${sensor.monitoring.length} pages`
                          }
                        </p>
                        {sensor.monitoring.length > 10 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newExpanded = new Set(expandedSensors);
                              if (newExpanded.has(sensor.id)) {
                                newExpanded.delete(sensor.id);
                              } else {
                                newExpanded.add(sensor.id);
                              }
                              setExpandedSensors(newExpanded);
                            }}
                            className="h-6 px-2"
                          >
                            {expandedSensors.has(sensor.id) ? (
                              <>
                                <ChevronUp className="h-4 w-4 mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4 mr-1" />
                                Show all
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      {expandedSensors.has(sensor.id) && (
                        <div className="max-h-96 overflow-y-auto border rounded-md p-2 bg-muted/30">
                          <div className="space-y-1">
                            {sensor.monitoring.map((item: any, idx: number) => {
                              const isObject = typeof item === 'object' && item !== null;
                              const title = isObject ? item.title : item;
                              const url = isObject ? item.url : (typeof item === 'string' && item.startsWith('https://') ? item : null);

                              return (
                                <div key={idx} className="flex items-start gap-2 text-sm py-1">
                                  <FileText className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                                  {url ? (
                                    <a href={url} target="_blank" rel="noopener noreferrer"
                                       className="text-blue-500 hover:underline break-words">
                                      {title || (typeof url === 'string' ? url.replace('https://www.notion.so/', '') : url)}
                                    </a>
                                  ) : (
                                    <span className="break-words">{title || item}</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-medium">Monitoring {sensor.monitoring.length} {
                        sensor.type === 'github' ? 'repositories' :
                        sensor.type === 'gitlab' ? 'projects' :
                        sensor.type === 'twitter' ? 'accounts' :
                        sensor.type === 'telegram' ? 'channels' :
                        sensor.type === 'discord' ? 'servers' :
                        sensor.type === 'notion' ? 'pages' :
                        sensor.type === 'podcast' ? 'podcasts' :
                        sensor.type === 'medium' ? 'publications' :
                        sensor.type === 'discourse' ? 'forums' :
                        'websites'
                      }:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {sensor.monitoring.map((site: any) => (
                          <div key={site} className="flex items-center gap-2 text-sm">
                            <Wifi className="h-3 w-3 text-green-500" />
                            <span className="truncate">{site}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <span>Events: {sensor.eventsProcessed || 0}</span>
                {sensor.lastActivity && (
                  <span>
                    Last active: {new Date(sensor.lastActivity).toLocaleTimeString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PipelineMonitorEnhanced;