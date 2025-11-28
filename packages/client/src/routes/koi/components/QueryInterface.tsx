import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import {
  Send,
  Database,
  Code,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff,
  GitBranch,
  Search,
  BookOpen,
  Calendar,
  Network,
  FileCode,
  FolderGit2,
  Layers,
  Filter
} from 'lucide-react';

type SearchMode = 'knowledge' | 'code-graph' | 'github-docs';

type CodeGraphQueryType =
  | 'search_entities'
  | 'find_by_type'
  | 'list_entity_types'
  | 'get_entity_stats'
  | 'list_repos'
  | 'find_callers'
  | 'find_callees'
  | 'find_call_graph'
  | 'find_orphaned_code'
  | 'trace_call_chain';

interface QueryResult {
  originalQuestion: string;
  generatedSparql: string;
  isValidSparql: boolean;
  executionResult: {
    success: boolean;
    results?: any;
    error?: string;
    executionTime?: number;
    fromCache?: boolean;
  };
  visualizationData?: {
    nodes: any[];
    edges: any[];
  };
  modelUsed?: string;
  validationMessage?: string;
}

interface QueryInterfaceProps {
  onVisualizationData?: (data: { nodes: any[]; edges: any[] }) => void;
  onNavigateToProvenance?: (rid: string) => void;
  initialQuestion?: string;
  onQueryChange?: (query: string) => void;
}

const CODE_GRAPH_QUERY_TYPES: { value: CodeGraphQueryType; label: string; description: string; needsEntityName?: boolean; needsEntityType?: boolean; needsModuleName?: boolean; needsCallChain?: boolean }[] = [
  { value: 'search_entities', label: 'Search Entities', description: 'Search for code entities by name', needsEntityName: true },
  { value: 'find_by_type', label: 'Find by Type', description: 'Find all entities of a specific type', needsEntityType: true },
  { value: 'list_entity_types', label: 'List Entity Types', description: 'Show all entity types with counts' },
  { value: 'get_entity_stats', label: 'Get Statistics', description: 'Comprehensive statistics by entity type, language, and repo' },
  { value: 'list_repos', label: 'List Repositories', description: 'Show all indexed repositories' },
  { value: 'find_callers', label: 'Find Callers', description: 'Find functions/methods that call an entity', needsEntityName: true },
  { value: 'find_callees', label: 'Find Callees', description: 'Find functions/methods called by an entity', needsEntityName: true },
  { value: 'find_call_graph', label: 'Call Graph', description: 'Get local call graph around an entity', needsEntityName: true },
  { value: 'find_orphaned_code', label: 'Find Orphaned Code', description: 'Find unused functions with no callers', needsEntityType: true },
  { value: 'trace_call_chain', label: 'Trace Call Chain', description: 'Find call path between two entities', needsCallChain: true },
];

// Entity types that exist in the graph (from get_entity_stats)
const ENTITY_TYPES = ['Method', 'Function', 'Struct', 'Interface', 'Import', 'Concept'];

/**
 * Enhanced Hybrid RAG Query Interface
 *
 * Provides unified access to all KOI search capabilities:
 * - Knowledge Search: Hybrid RAG with vector + keyword search
 * - Code Graph: Apache AGE graph queries for 26,768 code entities
 * - GitHub Docs: Search documentation across 4 repositories
 */
export default function QueryInterface({ onVisualizationData, onNavigateToProvenance, initialQuestion, onQueryChange }: QueryInterfaceProps) {
  // Search mode state
  const [searchMode, setSearchMode] = useState<SearchMode>('knowledge');

  // Knowledge search state
  const [naturalQuery, setNaturalQuery] = useState(initialQuestion || '');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [includeUndated, setIncludeUndated] = useState(true);

  // Code graph state
  const [graphQueryType, setGraphQueryType] = useState<CodeGraphQueryType>('search_entities');
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('Method');
  const [callChainFrom, setCallChainFrom] = useState('');
  const [callChainTo, setCallChainTo] = useState('');

  // GitHub docs state
  const [githubQuery, setGithubQuery] = useState('');
  const [githubRepo, setGithubRepo] = useState<string>('');

  // Common state
  const [showSparqlEditor, setShowSparqlEditor] = useState(false);
  const [sparqlQuery, setSparqlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [rawApiResults, setRawApiResults] = useState<any[]>([]);
  const [graphResults, setGraphResults] = useState<any[]>([]);

  // Auto-execute query if initialQuestion is provided
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setNaturalQuery(initialQuestion);
      executeKnowledgeSearch(initialQuestion.trim());
    }
  }, [initialQuestion]);

  const getBaseUrl = () => {
    return window.location.origin.replace(/\/\/[^@]+@/, '//');
  };

  // Knowledge Search (Hybrid RAG)
  const executeKnowledgeSearch = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);
    setGraphResults([]);

    try {
      const baseUrl = getBaseUrl();
      const payload: any = { question: question, limit: 10 };  // API expects 'question' not 'query'

      // Add date filters if set (API expects filters.date_range structure)
      if (dateFrom || dateTo) {
        payload.filters = {
          date_range: {
            ...(dateFrom && { start: dateFrom }),
            ...(dateTo && { end: dateTo })
          },
          include_undated: includeUndated
        };
      }

      const response = await fetch(`${baseUrl}/api/koi/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'API not available');
      }

      const apiResult = await response.json();
      // API returns 'results' array with items having content, score, source, rid, metadata
      setRawApiResults(apiResult.results || []);

      const queryResult: QueryResult = {
        originalQuestion: question,
        generatedSparql: `-- Hybrid RAG Query (Vector + Keyword + RRF)
-- Question: "${question}"
-- Confidence: ${(apiResult.confidence * 100).toFixed(1)}%
-- Total Results: ${apiResult.total_results || 0}
-- Date Filter: ${dateFrom || 'none'} to ${dateTo || 'none'}`,
        isValidSparql: true,
        executionResult: {
          success: (apiResult.results?.length > 0),
          results: { results: { bindings: apiResult.results || [] } },
          executionTime: apiResult.execution_time || 0,
          fromCache: false
        },
        visualizationData: {
          nodes: (apiResult.results || []).slice(0, 5).map((r: any, i: number) => ({
            id: r.rid || `node-${i}`,
            label: r.rid || `Result ${i + 1}`,
            type: 'memory'
          })),
          edges: []
        },
        modelUsed: 'Hybrid RAG (Vector + Keyword + RRF)',
        validationMessage: `Found ${apiResult.results?.length || 0} of ${apiResult.total_results || 0} results (confidence: ${(apiResult.confidence * 100).toFixed(1)}%)`
      };

      setResult(queryResult);
      setSparqlQuery(queryResult.generatedSparql);
      setQueryHistory(prev => [question, ...prev.slice(0, 9)]);

      if (queryResult.visualizationData && onVisualizationData) {
        onVisualizationData(queryResult.visualizationData);
      }

      return queryResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, includeUndated, onVisualizationData]);

  // Code Graph Search (Apache AGE)
  const executeGraphSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRawApiResults([]);

    try {
      const baseUrl = getBaseUrl();
      const queryTypeConfig = CODE_GRAPH_QUERY_TYPES.find(t => t.value === graphQueryType);

      const payload: any = { query_type: graphQueryType, limit: 50 };

      if (queryTypeConfig?.needsEntityName) {
        payload.entity_name = entityName;
      }
      if (queryTypeConfig?.needsEntityType) {
        payload.entity_type = entityType;
      }
      if (queryTypeConfig?.needsCallChain) {
        payload.from = callChainFrom;
        payload.to = callChainTo;
      }

      const response = await fetch(`${baseUrl}/api/koi/graph`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Graph query failed: ${response.status}`);
      }

      const apiResult = await response.json();
      setGraphResults(apiResult.results || []);

      const queryResult: QueryResult = {
        originalQuestion: `${graphQueryType}: ${entityName || entityType || 'all'}`,
        generatedSparql: `-- Code Graph Query (Apache AGE / Cypher)
-- Query Type: ${graphQueryType}
-- Parameters: ${JSON.stringify(payload, null, 2)}
-- Results: ${apiResult.total_results || 0}`,
        isValidSparql: true,
        executionResult: {
          success: true,
          results: apiResult,
          executionTime: 0
        },
        modelUsed: 'Apache AGE (PostgreSQL Graph)',
        validationMessage: `Found ${apiResult.total_results || 0} entities`
      };

      setResult(queryResult);
      setSparqlQuery(queryResult.generatedSparql);

      // Create visualization data from graph results
      const nodes = (apiResult.results || []).slice(0, 20).map((r: any, i: number) => {
        const entity = r.entity || r.caller || r.callee || r.orphan || r.concept || {};
        return {
          id: entity.name || `node-${i}`,
          label: entity.name || `Entity ${i}`,
          type: entity.entity_type || 'unknown'
        };
      });

      if (onVisualizationData) {
        onVisualizationData({ nodes, edges: [] });
      }

      return queryResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [graphQueryType, entityName, entityType, callChainFrom, callChainTo, onVisualizationData]);

  // GitHub Docs Search
  const executeGithubSearch = useCallback(async () => {
    setLoading(true);
    setError(null);
    setGraphResults([]);

    try {
      // Use the same query API but enhance the search query to find GitHub documentation
      const baseUrl = getBaseUrl();
      // Add repo name to search query to help find relevant docs
      const searchQuery = githubRepo
        ? `${githubQuery} ${githubRepo} github documentation`
        : `${githubQuery} github regen documentation`;

      const response = await fetch(`${baseUrl}/api/koi/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: searchQuery,  // API expects 'question' not 'query'
          limit: 10
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'GitHub docs search failed');
      }

      const apiResult = await response.json();
      setRawApiResults(apiResult.results || []);

      const queryResult: QueryResult = {
        originalQuestion: githubQuery,
        generatedSparql: `-- GitHub Documentation Search
-- Query: "${githubQuery}"
-- Repository Filter: ${githubRepo || 'all'}
-- Enhanced Search: "${searchQuery}"
-- Results: ${apiResult.results?.length || 0}`,
        isValidSparql: true,
        executionResult: {
          success: (apiResult.results?.length > 0),
          results: { results: { bindings: apiResult.results || [] } },
          executionTime: apiResult.execution_time || 0
        },
        modelUsed: 'Hybrid RAG (GitHub Docs)',
        validationMessage: `Found ${apiResult.results?.length || 0} of ${apiResult.total_results || 0} documentation results`
      };

      setResult(queryResult);
      setSparqlQuery(queryResult.generatedSparql);

      return queryResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [githubQuery, githubRepo]);

  const executeSparqlQuery = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/koi/sparql/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const queryResult = await response.json();

      const formattedResult: QueryResult = {
        originalQuestion: 'Direct SPARQL Query',
        generatedSparql: query,
        isValidSparql: true,
        executionResult: queryResult.result,
        visualizationData: queryResult.visualizationData
      };

      setResult(formattedResult);

      if (queryResult.visualizationData && onVisualizationData) {
        onVisualizationData(queryResult.visualizationData);
      }

      return formattedResult;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    } finally {
      setLoading(false);
    }
  }, [onVisualizationData]);

  const handleSubmit = () => {
    switch (searchMode) {
      case 'knowledge':
        if (naturalQuery.trim()) executeKnowledgeSearch(naturalQuery.trim());
        break;
      case 'code-graph':
        executeGraphSearch();
        break;
      case 'github-docs':
        if (githubQuery.trim()) executeGithubSearch();
        break;
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getQueryTypeConfig = () => CODE_GRAPH_QUERY_TYPES.find(t => t.value === graphQueryType);

  const formatResultCount = (result: QueryResult) => {
    if (!result.executionResult.success) return 0;
    if (searchMode === 'code-graph') {
      return result.executionResult.results?.total_results || graphResults.length;
    }
    return rawApiResults.length;
  };

  return (
    <div className="space-y-6">
      {/* Search Mode Selector */}
      <div className="flex items-center gap-4 border-b pb-4">
        <Tabs value={searchMode} onValueChange={(v) => setSearchMode(v as SearchMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="knowledge" className="gap-2">
              <Search className="h-4 w-4" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="code-graph" className="gap-2">
              <Network className="h-4 w-4" />
              Code Graph
            </TabsTrigger>
            <TabsTrigger value="github-docs" className="gap-2">
              <FolderGit2 className="h-4 w-4" />
              GitHub Docs
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Knowledge Search Mode */}
      {searchMode === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Knowledge Search</h3>
              <p className="text-sm text-muted-foreground">
                Hybrid RAG search across 15,000+ documents with vector + keyword matching
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSparqlEditor(!showSparqlEditor)}
              className="gap-2"
            >
              {showSparqlEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSparqlEditor ? 'Hide' : 'Show'} SPARQL
            </Button>
          </div>

          <Textarea
            placeholder="Ask about Regen Network...
Examples:
- 'What are ecocredits and how do they work?'
- 'Tell me about Gregory Landua'
- 'Recent discussions about carbon credits'"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            className="min-h-[80px] resize-none"
          />

          {/* Date Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Date Filter (Optional)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-xs">From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs">To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="text-sm"
                  />
                </div>
                <div className="flex items-end col-span-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={includeUndated}
                      onChange={(e) => setIncludeUndated(e.target.checked)}
                      className="rounded"
                    />
                    Include undated documents
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to execute
            </div>
            <Button
              onClick={() => executeKnowledgeSearch(naturalQuery.trim())}
              disabled={loading || !naturalQuery.trim()}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Search Knowledge
            </Button>
          </div>
        </div>
      )}

      {/* Code Graph Mode */}
      {searchMode === 'code-graph' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Code Graph Query</h3>
            <p className="text-sm text-muted-foreground">
              Query 26,768 code entities with 11,331 call relationships via Apache AGE
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm">Query Type</Label>
              <select
                value={graphQueryType}
                onChange={(e) => setGraphQueryType(e.target.value as CodeGraphQueryType)}
                className="w-full mt-1 p-2 border rounded-md bg-background"
              >
                {CODE_GRAPH_QUERY_TYPES.map(qt => (
                  <option key={qt.value} value={qt.value}>
                    {qt.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {getQueryTypeConfig()?.description}
              </p>
            </div>

            {getQueryTypeConfig()?.needsEntityName && (
              <div>
                <Label className="text-sm">Entity Name</Label>
                <Input
                  placeholder="e.g., MsgCreateBatch, Keeper, NewQueryClient"
                  value={entityName}
                  onChange={(e) => setEntityName(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="mt-1"
                />
              </div>
            )}

            {getQueryTypeConfig()?.needsEntityType && (
              <div>
                <Label className="text-sm">Entity Type</Label>
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full mt-1 p-2 border rounded-md bg-background"
                >
                  {ENTITY_TYPES.map(et => (
                    <option key={et} value={et}>{et}</option>
                  ))}
                </select>
              </div>
            )}

            {getQueryTypeConfig()?.needsCallChain && (
              <>
                <div>
                  <Label className="text-sm">From Entity</Label>
                  <Input
                    placeholder="Source function name"
                    value={callChainFrom}
                    onChange={(e) => setCallChainFrom(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">To Entity</Label>
                  <Input
                    placeholder="Target function name"
                    value={callChainTo}
                    onChange={(e) => setCallChainTo(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="mt-1"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to execute
            </div>
            <Button
              onClick={executeGraphSearch}
              disabled={loading}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Network className="h-4 w-4" />}
              Query Code Graph
            </Button>
          </div>
        </div>
      )}

      {/* GitHub Docs Mode */}
      {searchMode === 'github-docs' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">GitHub Documentation Search</h3>
            <p className="text-sm text-muted-foreground">
              Search documentation across regen-ledger, regen-web, regen-data-standards, and regenie-corpus
            </p>
          </div>

          <Textarea
            placeholder="Search GitHub documentation...
Examples:
- 'ecocredit module setup'
- 'validator configuration'
- 'governance voting process'"
            value={githubQuery}
            onChange={(e) => setGithubQuery(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={3}
            className="min-h-[80px] resize-none"
          />

          <div>
            <Label className="text-sm">Repository Filter (Optional)</Label>
            <select
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className="w-full mt-1 p-2 border rounded-md bg-background"
            >
              <option value="">All Repositories</option>
              <option value="regen-ledger">regen-ledger (Blockchain)</option>
              <option value="regen-web">regen-web (Frontend)</option>
              <option value="regen-data-standards">regen-data-standards (Schemas)</option>
              <option value="regenie-corpus">regenie-corpus (Documentation)</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to execute
            </div>
            <Button
              onClick={executeGithubSearch}
              disabled={loading || !githubQuery.trim()}
              className="gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderGit2 className="h-4 w-4" />}
              Search GitHub Docs
            </Button>
          </div>
        </div>
      )}

      {/* SPARQL Editor (conditionally shown) */}
      {showSparqlEditor && (
        <Card>
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Code className="h-4 w-4" />
              SPARQL Query Editor
            </h4>
            <Textarea
              placeholder="Enter SPARQL query directly..."
              value={sparqlQuery}
              onChange={(e) => setSparqlQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  executeSparqlQuery(sparqlQuery.trim());
                }
              }}
              rows={6}
              className="font-mono text-sm resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={() => executeSparqlQuery(sparqlQuery.trim())}
                disabled={loading || !sparqlQuery.trim()}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
                Execute SPARQL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && searchMode === 'knowledge' && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Queries
            </h4>
            <div className="space-y-2">
              {queryHistory.slice(0, 5).map((query, index) => (
                <button
                  key={index}
                  onClick={() => setNaturalQuery(query)}
                  className="w-full text-left text-sm p-2 rounded border hover:bg-accent/50 transition-colors"
                >
                  {query}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Query Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {result && (
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Query Results</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {searchMode === 'knowledge' ? 'Knowledge' : searchMode === 'code-graph' ? 'Code Graph' : 'GitHub Docs'}
                </Badge>
                {result.executionResult.success ? (
                  <Badge variant="default" className="gap-2">
                    <CheckCircle className="h-3 w-3" />
                    Success
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="gap-2">
                    <XCircle className="h-3 w-3" />
                    Error
                  </Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="results">Results</TabsTrigger>
                <TabsTrigger value="provenance">
                  {searchMode === 'code-graph' ? 'Details' : 'Provenance'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {formatResultCount(result)}
                    </div>
                    <div className="text-xs text-muted-foreground">Results</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.executionResult.executionTime?.toFixed(2) || '--'}s
                    </div>
                    <div className="text-xs text-muted-foreground">Execution Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {searchMode === 'code-graph' ? '26,768' : '15,000+'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {searchMode === 'code-graph' ? 'Total Entities' : 'Documents'}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {searchMode === 'code-graph' ? '11,331' : '12'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {searchMode === 'code-graph' ? 'CALLS Edges' : 'Active Sensors'}
                    </div>
                  </div>
                </div>

                {result.originalQuestion !== 'Direct SPARQL Query' && (
                  <div>
                    <strong>Query:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      "{result.originalQuestion}"
                    </p>
                  </div>
                )}

                {result.validationMessage && (
                  <Alert>
                    <AlertDescription>
                      <strong>Status:</strong> {result.validationMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="results">
                <div className="space-y-3">
                  <div className="text-sm font-medium">
                    {searchMode === 'code-graph' ? 'Code Entities' : 'Search Results'}
                  </div>

                  {/* Knowledge/GitHub Docs Results */}
                  {searchMode !== 'code-graph' && rawApiResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {rawApiResults.map((item: any, index: number) => (
                        <div key={index} className="bg-muted p-3 rounded">
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant="secondary" className="text-xs">
                              Score: {item.score?.toFixed(3)}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {item.source || item.metadata?.source || 'unknown'}
                            </Badge>
                          </div>
                          <div className="text-sm mb-2 line-clamp-3">
                            {item.content}
                          </div>
                          {(item.metadata?.url || item.url) && (
                            <a
                              href={item.metadata?.url || item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-500 hover:underline"
                            >
                              {item.metadata?.url || item.url}
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Code Graph Results */}
                  {searchMode === 'code-graph' && graphResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {graphResults.map((item: any, index: number) => {
                        const entity = item.entity || item.caller || item.callee || item.orphan || item.concept || item;
                        return (
                          <div key={index} className="bg-muted p-3 rounded">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-mono text-sm font-medium">
                                {entity.name || 'Unknown'}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {entity.entity_type || entity.type || 'Entity'}
                              </Badge>
                            </div>
                            {entity.file_path && (
                              <div className="text-xs text-muted-foreground mb-1">
                                <FileCode className="h-3 w-3 inline mr-1" />
                                {entity.file_path}
                                {entity.line_number && `:${entity.line_number}`}
                              </div>
                            )}
                            {entity.repository && (
                              <Badge variant="outline" className="text-xs">
                                {entity.repository}
                              </Badge>
                            )}
                            {entity.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {entity.description}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {((searchMode !== 'code-graph' && rawApiResults.length === 0) ||
                    (searchMode === 'code-graph' && graphResults.length === 0)) && (
                    <Alert>
                      <AlertDescription>
                        No results found. Try adjusting your search criteria.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="provenance">
                <div className="space-y-3">
                  {searchMode === 'code-graph' ? (
                    <>
                      <div className="text-sm font-medium">Entity Details</div>
                      <div className="bg-muted p-3 rounded font-mono text-xs overflow-x-auto">
                        <pre>{JSON.stringify(graphResults.slice(0, 5), null, 2)}</pre>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-sm font-medium">Result RIDs for Provenance Tracing</div>
                      <div className="text-xs text-muted-foreground mb-3">
                        Click "Trace" to view transformation provenance
                      </div>
                      {rawApiResults.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {rawApiResults.map((item: any, index: number) => (
                            <div key={index} className="bg-muted p-2 rounded text-xs">
                              <div className="flex items-center justify-between">
                                <div className="font-mono text-blue-600 break-all">
                                  {item.rid}
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-6 px-2 text-xs"
                                  onClick={() => onNavigateToProvenance?.(item.rid)}
                                >
                                  <GitBranch className="h-3 w-3 mr-1" />
                                  Trace
                                </Button>
                              </div>
                              <div className="text-muted-foreground mt-1 line-clamp-2">
                                {item.content}
                              </div>
                              <div className="text-xs text-blue-500 mt-1">
                                Score: {item.score?.toFixed(3)} | Source: {item.source || item.metadata?.source}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-muted-foreground text-sm">No RIDs available</div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
