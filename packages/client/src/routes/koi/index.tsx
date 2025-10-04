import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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
  Loader2,
  Shield
} from 'lucide-react';
import QueryInterface from './components/QueryInterface';
import GraphExplorer from './components/GraphExplorer';
import EssenceRadar from './components/EssenceRadar';
import PipelineMonitorEnhanced from './components/PipelineMonitorEnhanced';
import KnowledgeManager from './components/KnowledgeManager';

/**
 * KOI Knowledge Graph Visualization Page
 *
 * Main page for the KOI (Knowledge Organization Infrastructure) system
 * Provides natural language querying, SPARQL interface, and interactive visualizations
 *
 * URL Structure:
 * - /koi - Default view (Pipeline Monitor)
 * - /koi/query/:question - Query view with pre-filled question
 * - /koi/monitor/:view/:rid - Pipeline Monitor with specific view and RID
 * - /koi/graph - Graph Explorer
 * - /koi/essence - Essence Radar
 * - /koi/analytics - Analytics
 * - /koi/knowledge - Knowledge Manager
 */
export default function KOIPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  // Parse URL to determine active tab and subtab
  const pathParts = location.pathname.split('/').filter(Boolean);
  const urlTab = pathParts[1] || 'monitor'; // /koi/[tab]
  const urlSubView = pathParts[2]; // /koi/monitor/[subview]
  const urlRid = pathParts[3] ? decodeURIComponent(pathParts.slice(3).join('/')) : undefined; // /koi/monitor/provenance/[rid]

  const [activeTab, setActiveTab] = useState(urlTab);
  const [selectedRid, setSelectedRid] = useState<string | undefined>(urlRid);
  const [exampleQuery, setExampleQuery] = useState<string>('');

  // Update state when URL changes
  useEffect(() => {
    setActiveTab(urlTab);
    setSelectedRid(urlRid);
  }, [urlTab, urlRid]);

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    navigate(`/koi/${newTab}`);
  };

  const handleNavigateToProvenance = (rid: string) => {
    setSelectedRid(rid);
    setActiveTab('monitor');
    navigate(`/koi/monitor/provenance/${encodeURIComponent(rid)}`);
  };

  return (
    <div className="flex w-full justify-center px-4 sm:px-6">
      <div className="w-full py-6">
        {/* Header */}
        <div className="mb-6">
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

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
          </TabsList>

          {/* Pipeline Monitor Tab */}
          <TabsContent value="monitor">
            <PipelineMonitorEnhanced rid={selectedRid} subView={urlSubView} />
          </TabsContent>

          {/* Query Interface Tab */}
          <TabsContent value="query">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-full">
              {/* Query Interface */}
              <div className="xl:col-span-2 space-y-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="h-5 w-5" />
                      Hybrid RAG Query Interface
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Semantic search combining vector embeddings, keyword matching, and adaptive ranking
                    </p>
                  </CardHeader>
                  <CardContent className="h-full">
                    <QueryInterface
                      onNavigateToProvenance={handleNavigateToProvenance}
                      initialQuestion={exampleQuery || (urlSubView ? decodeURIComponent(urlSubView.replace(/_/g, ' ')) : undefined)}
                      onQueryChange={(query: string) => setExampleQuery(query)}
                    />
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setExampleQuery("What are jaguar credits?")}
                    >
                      What are jaguar credits?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setExampleQuery("What is the Regen Ledger?")}
                    >
                      What is the Regen Ledger?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setExampleQuery("How does ecological credit verification work?")}
                    >
                      How does ecological credit verification work?
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-left justify-start"
                      onClick={() => setExampleQuery("What is regenerative agriculture?")}
                    >
                      What is regenerative agriculture?
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Graph Explorer Tab */}
          <TabsContent value="graph" className="h-[calc(100vh-280px)]">
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
              <CardContent className="h-[calc(100%-120px)] p-0">
                <GraphExplorer />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Essence Patterns Tab */}
          <TabsContent value="essence">
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

          {/* Knowledge Tab */}
          <TabsContent value="knowledge">
            <KnowledgeManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}