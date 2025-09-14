import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  Globe,
  Loader2,
  Network,
  RefreshCw,
  Server,
  Wifi,
  WifiOff,
  Zap,
  Eye,
  Brain,
  ArrowRight,
  BarChart3,
  Share2
} from 'lucide-react';

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'error' | 'loading';
  port: number;
  endpoint?: string;
  lastCheck?: string;
  details?: any;
}

interface SensorNode {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'idle' | 'error';
  lastActivity?: string;
  monitoring?: string[];
  eventsProcessed?: number;
}

interface PipelineFlow {
  stage: string;
  icon: any;
  status: 'active' | 'idle' | 'processing' | 'error';
  description: string;
  metrics?: {
    processed?: number;
    pending?: number;
    rate?: string;
    vectors?: number;
    triples?: number;
    queries?: number;
  };
}

/**
 * Pipeline Monitor Component
 * Real-time monitoring of the KOI sensor-to-agent pipeline
 */
export default function PipelineMonitor() {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [sensors, setSensors] = useState<SensorNode[]>([]);
  const [pipelineFlow, setPipelineFlow] = useState<PipelineFlow[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Initialize pipeline flow stages
  useEffect(() => {
    setPipelineFlow([
      {
        stage: 'Sensors',
        icon: Eye,
        status: 'active',
        description: 'Website monitoring sensors',
        metrics: { processed: 89, pending: 0, rate: '3/min' }
      },
      {
        stage: 'Coordinator',
        icon: Network,
        status: 'idle',
        description: 'Event coordination & routing',
        metrics: { processed: 0 }
      },
      {
        stage: 'Event Bridge',
        icon: Zap,
        status: 'idle',
        description: 'Event processing & transformation',
        metrics: { processed: 0 }
      },
      {
        stage: 'BGE Embeddings',
        icon: Brain,
        status: 'idle',
        description: 'Semantic vector generation',
        metrics: { processed: 0, rate: '0/sec' }
      },
      {
        stage: 'Data Storage',
        icon: Database,
        status: 'idle',
        description: 'PostgreSQL & Apache Jena',
        metrics: { vectors: 0, triples: 0 }
      },
      {
        stage: 'MCP Server',
        icon: Share2,
        status: 'idle',
        description: 'Model Context Protocol API',
        metrics: { queries: 0 }
      },
      {
        stage: 'Eliza Agents',
        icon: Activity,
        status: 'idle',
        description: 'Agent knowledge access',
        metrics: { queries: 0 }
      }
    ]);
  }, []);

  // Check service health
  const checkServices = async () => {
    const serviceChecks: ServiceStatus[] = [
      {
        name: 'KOI Coordinator',
        status: 'loading',
        port: 8005,
        endpoint: '/api/koi/coordinator/health'
      },
      {
        name: 'Event Bridge',
        status: 'loading',
        port: 8100,
        endpoint: '/api/koi/event-bridge/'  // Root endpoint returns database status
      },
      {
        name: 'BGE Server',
        status: 'loading',
        port: 8090,
        endpoint: '/api/koi/bge/health'  // Health endpoint works now
      },
      {
        name: 'PostgreSQL',
        status: 'loading',
        port: 5433,
        endpoint: '/api/koi/event-bridge/'  // Event Bridge returns database status
      },
      {
        name: 'MCP Server',
        status: 'loading',
        port: 8200,
        endpoint: '/api/koi/mcp/'  // MCP Server root endpoint returns status
      }
    ];

    // Check each service
    const updatedServices = await Promise.all(
      serviceChecks.map(async (service) => {
        try {
          if (!service.endpoint) {
            return {
              ...service,
              status: 'error' as any,
              lastCheck: new Date().toISOString(),
              details: { error: 'No endpoint configured' }
            };
          }
          
          // Special handling for KOI Coordinator - fetch directly
          let response;
          if (service.name === 'KOI Coordinator') {
            // Try direct fetch first
            try {
              response = await fetch('http://localhost:8005/health');
            } catch (directError) {
              // Fall back to proxy if direct fails
              const baseUrl = window.location.origin;
              const apiUrl = import.meta.env.VITE_KOI_API_URL || baseUrl;
              const fullUrl = apiUrl.startsWith('http') ? `${apiUrl}${service.endpoint}` : `${baseUrl}${service.endpoint}`;
              response = await fetch(fullUrl);
            }
          } else {
            // Build absolute URL without credentials to avoid browser security errors
            const baseUrl = window.location.origin;
            const apiUrl = import.meta.env.VITE_KOI_API_URL || baseUrl;
            const fullUrl = apiUrl.startsWith('http') ? `${apiUrl}${service.endpoint}` : `${baseUrl}${service.endpoint}`;
            response = await fetch(fullUrl);
          }
          
          if (!response.ok) {
            return {
              ...service,
              status: 'offline' as any,
              lastCheck: new Date().toISOString(),
              details: { error: `HTTP ${response.status}` }
            };
          }
          
          const data = await response.json();
          
          // Handle different response formats from different services
          let status: 'online' | 'offline' | 'error' = 'offline';
          
          // Event Bridge returns { status: "operational", ... }
          if (data.status === 'operational' || data.status === 'online') {
            status = 'online';
          }
          // BGE server and Coordinator return { status: "healthy", ... }
          else if (data.status === 'healthy') {
            status = 'online';
          }
          // Database status - PostgreSQL returns service info
          else if (data.status === 'connected' || data.database_connected === true || (data.service === 'PostgreSQL' && data.database)) {
            status = 'online';
          }
          // Coordinator returns 404 at root but works on specific endpoints
          else if (service.name === 'KOI Coordinator' && response.status === 404) {
            // For coordinator, 404 at root is expected - it's a FastAPI app
            status = 'online';
          }
          // Generic check for any success indicators
          else if (data.success === true || data.healthy === true || data.service) {
            status = 'online';
          }
          
          return {
            ...service,
            status: status as any,
            lastCheck: new Date().toISOString(),
            details: data
          };
        } catch (error) {
          return {
            ...service,
            status: 'offline' as any,
            lastCheck: new Date().toISOString(),
            details: { error: error instanceof Error ? error.message : 'Unknown error' }
          };
        }
      })
    );

    setServices(updatedServices);
  };

  // Fetch sensor status
  const fetchSensors = async () => {
    try {
      // Try direct fetch from coordinator first
      const directUrl = 'http://localhost:8005/sensors';
      const response = await fetch(directUrl);
      
      if (response.ok) {
        const data = await response.json();
        if (data.sensors && Array.isArray(data.sensors)) {
          setSensors(data.sensors);
          return;
        }
      }
    } catch (error) {
      // Fallback to proxy endpoint if direct fails
      try {
        const baseUrl = window.location.origin;
        const apiUrl = import.meta.env.VITE_KOI_API_URL || baseUrl;
        const fullUrl = apiUrl.startsWith('http') ? `${apiUrl}/api/koi/coordinator/sensors` : `${baseUrl}/api/koi/coordinator/sensors`;
        const response = await fetch(fullUrl);
        
        if (response.ok) {
          const data = await response.json();
          if (data.sensors && Array.isArray(data.sensors)) {
            setSensors(data.sensors);
            return;
          }
        }
      } catch (fallbackError) {
        console.error('Failed to fetch sensors:', fallbackError);
      }
    }
    
    // No sensors found - show empty state
    setSensors([]);
  };

  // Update pipeline metrics
  const updatePipelineMetrics = async () => {
    // Fetch real metrics from the Event Bridge stats API
    try {
      const baseUrl = window.location.origin;
      const apiUrl = import.meta.env.VITE_KOI_API_URL || baseUrl;
      
      // Try to fetch from Event Bridge stats endpoint
      const statsUrl = apiUrl.startsWith('http') ? `${apiUrl}/api/koi/event-bridge/stats` : `${baseUrl}/api/koi/event-bridge/stats`;
      const response = await fetch(statsUrl);
      
      if (response.ok) {
        const stats = await response.json();
        
        setPipelineFlow(prev => prev.map(stage => {
          switch (stage.stage) {
            case 'Sensors':
              // Check if coordinator has connected sensors
              const coordinatorData = services.find(s => s.name === 'KOI Coordinator');
              const connectedSensors = coordinatorData?.details?.connected_sensors || 0;
              // Use actual connected sensors from coordinator, not historical count from database
              const activeSensors = connectedSensors;
              return {
                ...stage,
                status: activeSensors > 0 ? 'active' : 'idle',
                metrics: {
                  processed: stats.new_events || stats.total_versions || 0,
                  pending: 0,
                  rate: activeSensors > 0 ? `${activeSensors} active` : '0/min'
                }
              };
            case 'Coordinator':
              return {
                ...stage,
                status: stats.new_events > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: stats.new_events || 0
                }
              };
            case 'Event Bridge':
              return {
                ...stage,
                status: stats.unique_documents > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: stats.unique_documents || 0
                }
              };
            case 'BGE Embeddings':
              const bgeEmbeddings = stats.embeddings?.bge || 0;
              return {
                ...stage,
                status: bgeEmbeddings > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: bgeEmbeddings,
                  rate: stats.latest_event ? '~100ms/doc' : '0/sec'
                }
              };
            case 'Data Storage':
              return {
                ...stage,
                status: stats.unique_documents > 0 ? 'active' : 'idle',
                metrics: {
                  vectors: stats.embeddings?.bge || 0,
                  triples: 0  // TODO: Get from Apache Jena when integrated
                }
              };
            case 'MCP Server':
              return {
                ...stage,
                status: 'idle',
                metrics: {
                  queries: 0
                }
              };
            case 'Eliza Agents':
              return {
                ...stage,
                status: 'idle',
                metrics: {
                  queries: 0
                }
              };
            default:
              return stage;
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  // Initial load and refresh
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        checkServices(),
        fetchSensors(),
        updatePipelineMetrics()
      ]);
      setLoading(false);
    };

    loadData();

    // Auto-refresh if enabled
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadData, 5000); // Refresh every 5 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return 'text-green-500';
      case 'processing':
        return 'text-blue-500';
      case 'idle':
        return 'text-gray-400';
      case 'error':
      case 'offline':
        return 'text-red-500';
      default:
        return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'error':
      case 'offline':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Knowledge Flow Pipeline</h2>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
        </div>
      </div>

      {/* Pipeline Flow Visualization */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {pipelineFlow.map((stage, index) => {
              // Map pipeline stages to service statuses
              let serviceStatus = 'idle';
              if (stage.stage === 'Sensors') {
                // Check coordinator's connected_sensors field
                const coordinatorService = services.find(s => s.name === 'KOI Coordinator');
                const connectedSensors = coordinatorService?.details?.connected_sensors || 0;
                serviceStatus = connectedSensors > 0 ? 'active' : 'idle';
              } else if (stage.stage === 'Coordinator') {
                const coordinatorService = services.find(s => s.name === 'KOI Coordinator');
                serviceStatus = coordinatorService?.status === 'online' ? 'active' : 'offline';
              } else if (stage.stage === 'Event Bridge') {
                const eventBridgeService = services.find(s => s.name === 'Event Bridge');
                serviceStatus = eventBridgeService?.status === 'online' ? 'active' : 'offline';
              } else if (stage.stage === 'BGE Embeddings') {
                const bgeService = services.find(s => s.name === 'BGE Server');
                serviceStatus = bgeService?.status === 'online' ? 'active' : 'offline';
              } else if (stage.stage === 'Data Storage') {
                const pgService = services.find(s => s.name === 'PostgreSQL');
                serviceStatus = pgService?.status === 'online' ? 'active' : 'offline';
              } else if (stage.stage === 'MCP Server') {
                const mcpService = services.find(s => s.name === 'MCP Server');
                serviceStatus = mcpService?.status === 'online' ? 'active' : 'offline';
              } else if (stage.stage === 'Eliza Agents') {
                serviceStatus = 'active'; // Always show as active if pipeline is running
              }
              
              return (
                <React.Fragment key={stage.stage}>
                  <div className="flex flex-col items-center min-w-[140px]">
                    <div className={`p-4 rounded-xl bg-card border-2 transition-all ${
                      serviceStatus === 'active' ? 'border-green-500 shadow-green-500/20 shadow-lg' :
                      serviceStatus === 'processing' ? 'border-blue-500 animate-pulse shadow-blue-500/20 shadow-lg' :
                      serviceStatus === 'offline' ? 'border-red-500 shadow-red-500/20 shadow-lg' :
                      'border-gray-300'
                    }`}>
                      <stage.icon className={`h-8 w-8 ${
                        serviceStatus === 'active' ? 'text-green-500' :
                        serviceStatus === 'processing' ? 'text-blue-500' :
                        serviceStatus === 'offline' ? 'text-red-500' :
                        'text-gray-400'
                      }`} />
                    </div>
                    <h3 className="mt-3 text-sm font-semibold">{stage.stage}</h3>
                    <p className="text-xs text-muted-foreground mt-1 text-center max-w-[120px]">
                      {stage.description}
                    </p>
                    <Badge 
                      className="mt-2" 
                      variant={
                        serviceStatus === 'active' ? 'default' :
                        serviceStatus === 'offline' ? 'destructive' :
                        'secondary'
                      }
                    >
                      {serviceStatus === 'active' ? 'Online' :
                       serviceStatus === 'offline' ? 'Offline' :
                       'Idle'}
                    </Badge>
                  </div>
                  {index < pipelineFlow.length - 1 && (
                    <div className="flex items-center flex-1 max-w-[100px]">
                      <div className={`h-[2px] flex-1 transition-all ${
                        serviceStatus === 'active' && (
                          pipelineFlow[index + 1] && 
                          (pipelineFlow[index + 1].stage === 'Coordinator' ? services.find(s => s.name === 'KOI Coordinator')?.status === 'online' :
                           pipelineFlow[index + 1].stage === 'Event Bridge' ? services.find(s => s.name === 'Event Bridge')?.status === 'online' :
                           pipelineFlow[index + 1].stage === 'BGE Embeddings' ? services.find(s => s.name === 'BGE Server')?.status === 'online' :
                           pipelineFlow[index + 1].stage === 'Data Storage' ? services.find(s => s.name === 'PostgreSQL')?.status === 'online' :
                           pipelineFlow[index + 1].stage === 'MCP Server' ? services.find(s => s.name === 'MCP Server')?.status === 'online' :
                           true)
                        ) ? 'bg-green-500' : 'bg-gray-300'
                      }`}>
                        <div className={`h-full ${
                          serviceStatus === 'active' ? 'bg-green-400 animate-pulse' : ''
                        }`} />
                      </div>
                      <ArrowRight className={`h-5 w-5 flex-shrink-0 -ml-[2px] ${
                        serviceStatus === 'active' ? 'text-green-500' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Sensor Nodes */}
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
                  <Badge variant={sensor.status === 'active' ? 'default' : 'secondary'}>
                    {sensor.status}
                  </Badge>
                </div>
                
                {sensor.monitoring && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Monitoring {sensor.monitoring.length} websites:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {sensor.monitoring.map((site) => (
                        <div key={site} className="flex items-center gap-2 text-sm">
                          <Wifi className="h-3 w-3 text-green-500" />
                          <span className="truncate">{site}</span>
                        </div>
                      ))}
                    </div>
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineFlow.reduce((acc, stage) => {
                // Only count processed from stages that actually process events
                if (stage.stage === 'Sensors' || stage.stage === 'Coordinator' || 
                    stage.stage === 'Event Bridge' || stage.stage === 'BGE Embeddings') {
                  return acc + (stage.metrics?.processed || 0);
                }
                return acc;
              }, 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all pipeline stages
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Processing Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pipelineFlow[0]?.metrics?.rate || '0/min'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Current sensor activity
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((services.filter(s => s.status === 'online').length / services.length) * 100)}%
            </div>
            <Progress 
              value={(services.filter(s => s.status === 'online').length / services.length) * 100} 
              className="mt-2"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}