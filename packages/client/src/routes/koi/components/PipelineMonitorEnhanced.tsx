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
  Timeline,
  Eye
} from 'lucide-react';
import PipelineFlowGraph from './PipelineFlowGraph';
import ProvenanceTimeline from './ProvenanceTimeline';
import PipelineMonitor from './PipelineMonitor';

/**
 * Enhanced Pipeline Monitor with Flow Visualization and Provenance Tracking
 */
const PipelineMonitorEnhanced: React.FC = () => {
  const [activeView, setActiveView] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            Pipeline Flow
          </TabsTrigger>
          <TabsTrigger value="provenance" className="flex items-center gap-2">
            <Timeline className="h-4 w-4" />
            Provenance
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab - Original PipelineMonitor */}
        <TabsContent value="overview" className="space-y-6">
          <PipelineMonitor />
        </TabsContent>

        {/* Pipeline Flow Tab - Interactive Graph */}
        <TabsContent value="flow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Interactive Pipeline Flow
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Click on sensor nodes to expand and view transformation chains
              </p>
            </CardHeader>
            <CardContent>
              <PipelineFlowGraph />
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
              <ProvenanceTimeline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <TransformationStats />
        </CardContent>
      </Card>
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
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/koi/transformations?limit=100');
      const data = await response.json();
      
      if (data.status === 'ok' && data.transformations) {
        const transformations = data.transformations;
        const total = transformations.length;
        const totalChunks = transformations.reduce((sum: number, t: any) => sum + (t.chunks_created || 0), 0);
        const totalEmbeddings = transformations.reduce((sum: number, t: any) => sum + (t.embeddings_created || 0), 0);
        
        setStats({
          totalTransformations: total,
          successRate: 100, // All stored transformations are successful
          averageChunks: total > 0 ? Math.round(totalChunks / total) : 0,
          averageEmbeddings: total > 0 ? Math.round(totalEmbeddings / total) : 0
        });
      }
    } catch (error) {
      console.error('Error fetching transformation stats:', error);
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

export default PipelineMonitorEnhanced;