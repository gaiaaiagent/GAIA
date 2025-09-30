import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  GitBranch
} from 'lucide-react';

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
}

/**
 * Natural Language to SPARQL Query Interface
 * 
 * Allows users to input natural language questions and see:
 * - Generated SPARQL query
 * - Query execution results
 * - Formatted visualization data
 */
export default function QueryInterface({ onVisualizationData, onNavigateToProvenance }: QueryInterfaceProps) {
  const [naturalQuery, setNaturalQuery] = useState('');
  const [showSparqlEditor, setShowSparqlEditor] = useState(false);
  const [sparqlQuery, setSparqlQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [queryHistory, setQueryHistory] = useState<string[]>([]);
  const [rawApiResults, setRawApiResults] = useState<any[]>([]);

  const executeNaturalQuery = useCallback(async (question: string) => {
    setLoading(true);
    setError(null);

    try {
      // Try to fetch from API first, fallback to mock response if not available
      let queryResult: QueryResult;
      try {
        const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
        
        const response = await fetch('http://localhost:8300/api/koi/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ question })
        });

        if (!response.ok) {
          throw new Error('API not available');
        }

        const apiResult = await response.json();
        
        // Store raw API results for provenance display
        setRawApiResults(apiResult.results || []);
        
        // Transform API response to QueryResult format
        queryResult = {
          originalQuestion: apiResult.question,
          generatedSparql: `-- Hybrid RAG Query (Vector + Graph + Adaptive)
-- Question: "${apiResult.question}"
-- Confidence: ${apiResult.confidence.toFixed(3)}
-- Results: ${apiResult.total_results}
-- Extraction Triggered: ${apiResult.triggered_extraction}`,
          isValidSparql: true,
          executionResult: {
            success: true,
            results: {
              results: {
                bindings: apiResult.results.map((r: any, i: number) => ({
                  [`result${i}`]: { value: r.content, type: 'literal' }
                }))
              }
            },
            executionTime: apiResult.execution_time,
            fromCache: false
          },
          visualizationData: {
            nodes: apiResult.results.slice(0, 5).map((r: any, i: number) => ({
              id: r.rid || `node-${i}`,
              label: r.title,
              type: r.source
            })),
            edges: []
          },
          modelUsed: 'Hybrid RAG (RRF + BGE + Adaptive)',
          validationMessage: `Query processed successfully. Confidence: ${apiResult.confidence.toFixed(3)}`
        };
      } catch (apiError) {
        // Fallback to mock response for testing
        console.log('Using mock natural language query response for testing');
        queryResult = {
          originalQuestion: question,
          generatedSparql: `PREFIX koi: <http://koi.regen.network/ontology/>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?document ?title ?essence ?score WHERE {
  ?document a koi:Document ;
            rdfs:label ?title ;
            koi:hasEssenceAlignment [
              koi:essenceType ?essence ;
              koi:alignmentScore ?score
            ] .
  FILTER(?score > 0.8)
} 
ORDER BY DESC(?score)
LIMIT 10`,
          isValidSparql: true,
          executionResult: {
            success: true,
            results: {
              results: {
                bindings: [
                  {
                    document: { type: 'uri', value: 'http://koi.regen.network/documents/doc1' },
                    title: { type: 'literal', value: 'Regen Network White Paper 2023' },
                    essence: { type: 'literal', value: 'Re-Whole Value' },
                    score: { type: 'literal', value: '0.89' }
                  },
                  {
                    document: { type: 'uri', value: 'http://koi.regen.network/documents/doc2' },
                    title: { type: 'literal', value: 'Regenerative Agriculture Principles' },
                    essence: { type: 'literal', value: 'Re-Whole Value' },
                    score: { type: 'literal', value: '0.92' }
                  }
                ]
              }
            },
            executionTime: 0.145,
            fromCache: false
          },
          visualizationData: {
            nodes: [
              { id: 'doc1', label: 'Regen White Paper', type: 'Document' },
              { id: 'doc2', label: 'Regen Principles', type: 'Document' }
            ],
            edges: []
          },
          modelUsed: 'Mock Response',
          validationMessage: 'Query generated successfully (mock data for testing)'
        };
      }

      setResult(queryResult);
      setSparqlQuery(queryResult.generatedSparql);
      
      // Add to history
      setQueryHistory(prev => [question, ...prev.slice(0, 9)]);
      
      // Pass visualization data to parent if provided
      if (queryResult.visualizationData && onVisualizationData) {
        onVisualizationData(queryResult.visualizationData);
      }

      return queryResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onVisualizationData]);

  const executeSparqlQuery = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);

    try {
      const csrfToken = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || '';
      
      const response = await fetch('/api/koi/sparql/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const queryResult = await response.json();
      
      // Format as QueryResult for consistency
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
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [onVisualizationData]);

  const handleNaturalQuerySubmit = () => {
    if (!naturalQuery.trim()) return;
    executeNaturalQuery(naturalQuery.trim());
  };

  const handleSparqlQuerySubmit = () => {
    if (!sparqlQuery.trim()) return;
    executeSparqlQuery(sparqlQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent, type: 'natural' | 'sparql') => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (type === 'natural') {
        handleNaturalQuerySubmit();
      } else {
        handleSparqlQuerySubmit();
      }
    }
  };

  const formatResultCount = (result: QueryResult) => {
    if (!result.executionResult.success) return 0;
    const bindings = result.executionResult.results?.results?.bindings || [];
    return bindings.length;
  };

  return (
    <div className="space-y-6">
      {/* Natural Language Input */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Ask a Question</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSparqlEditor(!showSparqlEditor)}
            className="gap-2"
          >
            {showSparqlEditor ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showSparqlEditor ? 'Hide' : 'Show'} SPARQL Editor
          </Button>
        </div>
        
        <div className="space-y-2">
          <Textarea
            placeholder="Ask about the knowledge graph in natural language... 
Example: 'Show me documents about regenerative agriculture with high confidence'"
            value={naturalQuery}
            onChange={(e) => setNaturalQuery(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'natural')}
            rows={3}
            className="min-h-[80px] resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground">
              Press Ctrl+Enter to execute
            </div>
            <Button 
              onClick={handleNaturalQuerySubmit}
              disabled={loading || !naturalQuery.trim()}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Query Knowledge Graph
            </Button>
          </div>
        </div>
      </div>

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
              onKeyDown={(e) => handleKeyPress(e, 'sparql')}
              rows={6}
              className="font-mono text-sm resize-none"
            />
            <div className="flex justify-end">
              <Button 
                onClick={handleSparqlQuerySubmit}
                disabled={loading || !sparqlQuery.trim()}
                variant="secondary"
                size="sm"
                className="gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Database className="h-4 w-4" />
                )}
                Execute SPARQL
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Query History */}
      {queryHistory.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Queries
            </h4>
            <div className="space-y-2">
              {queryHistory.map((query, index) => (
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
                {result.executionResult.fromCache && (
                  <Badge variant="secondary">Cached</Badge>
                )}
              </div>
            </div>

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="sparql">Generated SPARQL</TabsTrigger>
                <TabsTrigger value="results">Raw Results</TabsTrigger>
                <TabsTrigger value="provenance">Provenance</TabsTrigger>
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
                      {result.visualizationData?.nodes?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Nodes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">
                      {result.visualizationData?.edges?.length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Edges</div>
                  </div>
                </div>
                
                {result.originalQuestion !== 'Direct SPARQL Query' && (
                  <div>
                    <strong>Original Question:</strong>
                    <p className="text-sm text-muted-foreground mt-1">
                      "{result.originalQuestion}"
                    </p>
                  </div>
                )}
                
                {result.validationMessage && (
                  <Alert>
                    <AlertDescription>
                      <strong>Validation:</strong> {result.validationMessage}
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>

              <TabsContent value="sparql">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Generated SPARQL Query</span>
                    {result.modelUsed && (
                      <Badge variant="outline" className="text-xs">
                        {result.modelUsed}
                      </Badge>
                    )}
                  </div>
                  <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                    <code>{result.generatedSparql}</code>
                  </pre>
                </div>
              </TabsContent>

              <TabsContent value="results">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Raw SPARQL Results</div>
                  {result.executionResult.success ? (
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto max-h-64 overflow-y-auto">
                      <code>{JSON.stringify(result.executionResult.results, null, 2)}</code>
                    </pre>
                  ) : (
                    <Alert variant="destructive">
                      <AlertDescription>
                        {result.executionResult.error}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="provenance">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Result RIDs for Provenance Tracing</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Click "Trace" on any RID below to automatically navigate to its transformation provenance
                  </div>
                  {result.executionResult.success && rawApiResults.length > 0 ? (
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
                            Score: {item.score?.toFixed(3)} | Source: {item.source}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">No RIDs available</div>
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