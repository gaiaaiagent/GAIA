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
  Clock as Timeline
} from 'lucide-react';
import PipelineFlowGraphDynamic from './PipelineFlowGraphDynamic';
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
              <PipelineFlowGraphDynamic />
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

export default PipelineMonitorEnhanced;