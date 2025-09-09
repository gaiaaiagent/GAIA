import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Search, 
  Database, 
  Network, 
  BarChart3, 
  Brain, 
  Eye,
  Loader2 
} from 'lucide-react';
import QueryInterface from './components/QueryInterface';
import GraphExplorer from './components/GraphExplorer';
import EssenceRadar from './components/EssenceRadar';
import PipelineMonitorEnhanced from './components/PipelineMonitorEnhanced';

/**
 * KOI Knowledge Graph Visualization Page
 * 
 * Main page for the KOI (Knowledge Organization Infrastructure) system
 * Provides natural language querying, SPARQL interface, and interactive visualizations
 */
export default function KOIPage() {
  const [activeTab, setActiveTab] = useState('monitor');

  return (
    <div className="flex flex-col h-full w-full bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <Network className="h-8 w-8 text-primary" />
                KOI Knowledge Graph
              </h1>
              <p className="text-muted-foreground">
                Explore the regenerative systems knowledge graph through natural language queries and interactive visualizations
              </p>
            </div>
            
            {/* Status indicators */}
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="gap-2">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                SPARQL Endpoint
              </Badge>
              <Badge variant="outline" className="gap-2">
                <Database className="h-3 w-3" />
                1,116+ Documents
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 container mx-auto px-4 py-6 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          {/* Tab navigation */}
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Pipeline Monitor
            </TabsTrigger>
            <TabsTrigger value="query" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Query
            </TabsTrigger>
            <TabsTrigger value="graph" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Graph
            </TabsTrigger>
            <TabsTrigger value="essence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Essence
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          {/* Pipeline Monitor Tab */}
          <TabsContent value="monitor" className="h-full">
            <PipelineMonitorEnhanced />
          </TabsContent>

          {/* Query Interface Tab */}
          <TabsContent value="query" className="h-full">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Query Interface */}
              <div className="xl:col-span-2 space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Natural Language to SPARQL
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Ask questions about the knowledge graph in plain English
                    </p>
                  </CardHeader>
                  <CardContent className="h-full">
                    <QueryInterface />
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats & Examples */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Triples</span>
                      <Badge variant="secondary">Loading...</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Documents</span>
                      <Badge variant="secondary">1,116+</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Concepts</span>
                      <Badge variant="secondary">Loading...</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Example Queries</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button variant="ghost" size="sm" className="w-full text-left justify-start">
                      Show me documents about regenerative agriculture
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-left justify-start">
                      Find high confidence essence alignments
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-left justify-start">
                      What are the main metabolic processes?
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full text-left justify-start">
                      Show transformation provenance chains
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Graph Explorer Tab */}
          <TabsContent value="graph" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5" />
                  Interactive Graph Explorer
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Explore the knowledge graph through interactive network visualization
                </p>
              </CardHeader>
              <CardContent className="h-full p-0">
                <GraphExplorer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Essence Patterns Tab */}
          <TabsContent value="essence" className="h-full">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Essence Alignment Patterns
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Visualize Re-Whole Value, Nest Caring, and Harmonize Agency alignments
                </p>
              </CardHeader>
              <CardContent className="h-full">
                <EssenceRadar />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Query Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground">
                      <Eye className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Analytics dashboard coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Knowledge Graph Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Graph statistics loading...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}