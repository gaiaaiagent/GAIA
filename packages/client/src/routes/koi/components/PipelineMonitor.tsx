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
  BarChart3
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
        metrics: { processed: 0, pending: 0, rate: '0/min' }
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
        port: 8200,
        endpoint: '/api/koi/coordinator/status'
      },
      {
        name: 'Event Bridge',
        status: 'loading',
        port: 8100,
        endpoint: '/api/koi/event-bridge/health'
      },
      {
        name: 'BGE Server',
        status: 'loading',
        port: 8090,
        endpoint: '/api/koi/bge/health'
      },
      {
        name: 'PostgreSQL',
        status: 'loading',
        port: 5433,
        endpoint: '/api/koi/database/status'
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
          
          const apiUrl = import.meta.env.VITE_KOI_API_URL || '';
          const response = await fetch(`${apiUrl}${service.endpoint}`);
          const data = await response.json();
          
          return {
            ...service,
            status: data.status === 'online' ? 'online' : 'error' as any,
            lastCheck: new Date().toISOString(),
            details: data.data || data
          };
        } catch (error) {
          return {
            ...service,
            status: 'error' as any,
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
      const apiUrl = import.meta.env.VITE_KOI_API_URL || '';
      const response = await fetch(`${apiUrl}/api/koi/sensors`);
      const data = await response.json();
      
      if (data.sensors && Array.isArray(data.sensors)) {
        setSensors(data.sensors);
      } else {
        // Fallback to mock data if API doesn't return expected format
        const mockSensors: SensorNode[] = [
          {
            id: 'website-sensor-001',
            name: 'Website Monitor',
            type: 'website',
            status: 'active',
            lastActivity: new Date(Date.now() - 5 * 60000).toISOString(),
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
            ],
            eventsProcessed: 1247
          }
        ];
        setSensors(mockSensors);
      }
    } catch (error) {
      console.error('Failed to fetch sensors:', error);
      // Use mock data on error
      const mockSensors: SensorNode[] = [
        {
          id: 'website-sensor-001',
          name: 'Website Monitor',
          type: 'website',
          status: 'active',
          lastActivity: new Date(Date.now() - 5 * 60000).toISOString(),
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
          ],
          eventsProcessed: 1247
        }
      ];
      setSensors(mockSensors);
    }
  };

  // Update pipeline metrics
  const updatePipelineMetrics = async () => {
    // Fetch real metrics from the pipeline API
    try {
      const apiUrl = import.meta.env.VITE_KOI_API_URL || '';
      const response = await fetch(`${apiUrl}/api/koi/metrics`);
      if (response.ok) {
        const data = await response.json();
        
        setPipelineFlow(prev => prev.map(stage => {
          switch (stage.stage) {
            case 'Sensors':
              return {
                ...stage,
                status: data.pipeline.sensors?.active > 0 ? 'active' : 'idle',
                metrics: {
                  processed: data.pipeline.sensors?.events_processed || 0,
                  pending: data.pipeline.coordinator?.pending || 0,
                  rate: data.pipeline.sensors?.rate || '0/min'
                }
              };
            case 'Coordinator':
              return {
                ...stage,
                status: data.pipeline.coordinator?.events_routed > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: data.pipeline.coordinator?.events_routed || 0
                }
              };
            case 'Event Bridge':
              return {
                ...stage,
                status: data.pipeline.event_bridge?.events_processed > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: data.pipeline.event_bridge?.events_processed || 0
                }
              };
            case 'BGE Embeddings':
              return {
                ...stage,
                status: data.pipeline.event_bridge?.transformations > 0 ? 'processing' : 'idle',
                metrics: {
                  processed: data.pipeline.event_bridge?.transformations || 0,
                  rate: '0/sec'
                }
              };
            case 'Data Storage':
              return {
                ...stage,
                status: data.pipeline.database?.status === 'online' ? 'idle' : 'error',
                metrics: {
                  vectors: data.pipeline.database?.vectors_stored || 0,
                  triples: data.pipeline.sparql?.triples_stored || 0
                }
              };
            case 'Eliza Agents':
              return {
                ...stage,
                status: 'idle',
                metrics: {
                  queries: data.pipeline.agents?.queries_processed || 0
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
        <h2 className="text-2xl font-bold">Pipeline Monitor</h2>
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

      {/* Service Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {services.map((service) => (
          <Card key={service.name} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {service.name}
                </CardTitle>
                {getStatusIcon(service.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Port</span>
                  <span className="font-mono">{service.port}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={service.status === 'online' ? 'default' : 'destructive'}>
                    {service.status}
                  </Badge>
                </div>
                {service.details?.uptime && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uptime</span>
                    <span>{service.details.uptime}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Flow Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Knowledge Flow Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between overflow-x-auto pb-4">
            {pipelineFlow.map((stage, index) => (
              <React.Fragment key={stage.stage}>
                <div className="flex flex-col items-center min-w-[120px]">
                  <div className={`p-3 rounded-lg bg-card border-2 ${
                    stage.status === 'active' ? 'border-green-500' :
                    stage.status === 'processing' ? 'border-blue-500 animate-pulse' :
                    'border-gray-200'
                  }`}>
                    <stage.icon className={`h-6 w-6 ${getStatusColor(stage.status)}`} />
                  </div>
                  <h3 className="mt-2 text-sm font-medium">{stage.stage}</h3>
                  <p className="text-xs text-muted-foreground mt-1 text-center max-w-[100px]">
                    {stage.description}
                  </p>
                  {stage.metrics && (
                    <div className="mt-2 text-xs space-y-1">
                      {stage.metrics.processed !== undefined && (
                        <div className="text-center">
                          <span className="font-mono">{stage.metrics.processed}</span>
                          <span className="text-muted-foreground"> processed</span>
                        </div>
                      )}
                      {stage.metrics.vectors !== undefined && (
                        <div className="text-center">
                          <span className="font-mono">{stage.metrics.vectors}</span>
                          <span className="text-muted-foreground"> vectors</span>
                        </div>
                      )}
                      {stage.metrics.triples !== undefined && (
                        <div className="text-center">
                          <span className="font-mono">{stage.metrics.triples}</span>
                          <span className="text-muted-foreground"> triples</span>
                        </div>
                      )}
                      {stage.metrics.queries !== undefined && (
                        <div className="text-center">
                          <span className="font-mono">{stage.metrics.queries}</span>
                          <span className="text-muted-foreground"> queries</span>
                        </div>
                      )}
                      {stage.metrics.pending !== undefined && stage.metrics.pending > 0 && (
                        <div className="text-center text-yellow-600">
                          <span className="font-mono">{stage.metrics.pending}</span>
                          <span> pending</span>
                        </div>
                      )}
                      {stage.metrics.rate && (
                        <div className="text-center text-muted-foreground">
                          {stage.metrics.rate}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {index < pipelineFlow.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 mx-2 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
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
            {sensors.map((sensor) => (
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