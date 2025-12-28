import { useState, useEffect, useCallback } from 'react';
import type { UUID } from '@elizaos/core';
import { useChannelMessages } from '@/hooks/use-query-hooks';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Network, ArrowRight, ArrowLeft, ExternalLink, AlertTriangle, RefreshCw } from 'lucide-react';

type GraphContextViewerProps = {
  agentId: UUID;
  channelId?: UUID;
};

interface GraphContextEdge {
  predicate: string;
  subject_uri: string;
  subject_text: string;
  object_uri: string;
  object_text: string;
  direction: 'out' | 'in';
  confidence: number;
  occurrence_count: number;
}

interface GraphContext {
  dominant_entity: {
    uri: string;
    text: string;
    type: string;
    occurrence_count: number;
  } | null;
  edges: GraphContextEdge[];
  edge_count: number;
  truncated: boolean;
  _privacy_warning?: string;
}

interface QueryResponse {
  question: string;
  total_results: number;
  confidence: number;
  graph_context?: GraphContext;
  resolved_entity?: {
    entity_text: string;
    entity_type: string;
    uri: string;
    occurrence_count: number;
  };
}

function getBaseUrl(): string {
  return window.location.origin.replace(/\/\/[^@]+@/, '//');
}

export function GraphContextViewer({ agentId, channelId }: GraphContextViewerProps) {
  const [graphContext, setGraphContext] = useState<GraphContext | null>(null);
  const [resolvedEntity, setResolvedEntity] = useState<QueryResponse['resolved_entity'] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  // Get channel messages to find the last user query
  const { data: messages } = useChannelMessages(channelId, undefined);

  // Find the last user message (query) - user messages have name="Unknown"
  const findLastUserQuery = useCallback((): string | null => {
    if (!messages || messages.length === 0) return null;

    // Look for the most recent user message (name === 'Unknown' in this system)
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      // User messages are labeled "Unknown", agent messages have the agent name
      if (msg.name === 'Unknown' && msg.text) {
        return msg.text;
      }
    }
    return null;
  }, [messages]);

  // Fetch graph context for a query
  const fetchGraphContext = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const baseUrl = getBaseUrl();
      const response = await fetch(`${baseUrl}/api/koi/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          limit: 5,
          graph_context: true
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `API error: ${response.status}`);
      }

      const data: QueryResponse = await response.json();
      setGraphContext(data.graph_context || null);
      setResolvedEntity(data.resolved_entity || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch graph context');
      setGraphContext(null);
      setResolvedEntity(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-fetch when component mounts or channel changes
  useEffect(() => {
    const query = findLastUserQuery();
    if (query && query !== lastQuery) {
      fetchGraphContext(query);
    }
  }, [findLastUserQuery, lastQuery, fetchGraphContext]);

  const handleRefresh = () => {
    const query = findLastUserQuery();
    if (query) {
      fetchGraphContext(query);
    }
  };

  const openInGraph = (entityUri?: string) => {
    const url = entityUri
      ? `/graph?entity=${encodeURIComponent(entityUri)}`
      : '/graph';
    window.open(url, '_blank');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading graph context...</p>
      </div>
    );
  }

  // No query found
  if (!lastQuery && !graphContext) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4 text-center">
        <Network className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-muted-foreground">
          No recent query found. Send a message to see graph context.
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-destructive text-center">{error}</p>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  // No graph context available
  if (!graphContext && !resolvedEntity) {
    return (
      <div className="flex flex-col p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground truncate flex-1">
            Query: <span className="font-medium">{lastQuery}</span>
          </p>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 space-y-2">
          <Network className="h-8 w-8 text-muted-foreground/50" />
          <p className="text-muted-foreground text-center">
            No graph context available for this query.
          </p>
        </div>
      </div>
    );
  }

  const dominantEntity = graphContext?.dominant_entity || (resolvedEntity ? {
    text: resolvedEntity.entity_text,
    type: resolvedEntity.entity_type,
    uri: resolvedEntity.uri,
    occurrence_count: resolvedEntity.occurrence_count
  } : null);

  return (
    <div className="flex flex-col p-4 space-y-4 h-full overflow-y-auto">
      {/* Header with query and refresh */}
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground truncate flex-1">
          Query: <span className="font-medium">{lastQuery}</span>
        </p>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Dominant Entity */}
      {dominantEntity && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Network className="h-4 w-4 text-primary" />
              Dominant Entity
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openInGraph(dominantEntity.uri)}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open in Graph
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-medium">{dominantEntity.text}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{dominantEntity.type}</Badge>
              <span className="text-sm text-muted-foreground">
                {dominantEntity.occurrence_count} occurrences
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Edges */}
      {graphContext?.edges && graphContext.edges.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <h3 className="font-semibold">
            Top Relationships
            {graphContext.truncated && (
              <span className="text-xs text-muted-foreground ml-2">
                (showing {graphContext.edges.length} of {graphContext.edge_count})
              </span>
            )}
          </h3>
          <div className="space-y-2">
            {graphContext.edges.slice(0, 10).map((edge, i) => (
              <div
                key={i}
                className="flex items-center gap-2 p-2 bg-muted/50 rounded text-sm"
              >
                {edge.direction === 'out' ? (
                  <>
                    <span className="font-medium truncate max-w-[120px]" title={edge.subject_text}>
                      {edge.subject_text}
                    </span>
                    <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {edge.predicate}
                    </Badge>
                    <ArrowRight className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="truncate max-w-[120px]" title={edge.object_text}>
                      {edge.object_text}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="truncate max-w-[120px]" title={edge.subject_text}>
                      {edge.subject_text}
                    </span>
                    <ArrowLeft className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <Badge variant="outline" className="text-xs">
                      {edge.predicate}
                    </Badge>
                    <ArrowLeft className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                    <span className="font-medium truncate max-w-[120px]" title={edge.object_text}>
                      {edge.object_text}
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Privacy Warning */}
      {graphContext?._privacy_warning && (
        <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0 mt-0.5" />
          <p className="text-yellow-600 dark:text-yellow-400">
            Graph context is not privacy-filtered yet.
          </p>
        </div>
      )}
    </div>
  );
}
