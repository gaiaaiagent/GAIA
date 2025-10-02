# MCP Always-On Knowledge Retrieval Architecture

## Overview
This document outlines the recommended strategy for making MCP servers function as always-available knowledge bases for ElizaOS agents, rather than tools the LLM occasionally decides to use.

## The Core Insight

**MCP should be the agent's knowledge base** - always queried, always available, like a RAG system where retrieval happens automatically before every response. Not a tool triggered by keywords or LLM decisions, but a fundamental layer of the agent's knowledge retrieval architecture.

## Current ElizaOS Message Flow

```
User Message
  → shouldRespond check
  → composeState(['ACTIONS', 'PROVIDERS', 'KNOWLEDGE'])
  → PROVIDERS execute (all registered providers run on EVERY message)
  → LLM gets context with provider results
  → LLM generates response
```

## The Solution: Enhanced MCP Provider

### Key Insight
The MCP provider at `/opt/projects/plugin-mcp/src/provider.ts` **already runs on every message** via the `PROVIDERS` composition. We simply enhance it to actually execute searches instead of just returning metadata.

### Current Implementation

```typescript
export const provider: Provider = {
  name: "MCP",
  get: async (runtime, message, state) => {
    const mcpService = runtime.getService<McpService>(MCP_SERVICE_NAME);
    if (!mcpService) {
      return { values: {}, data: {}, text: "" };
    }

    // Currently: Only returns list of available servers/tools
    return mcpService.getProviderData();
  }
};
```

### Enhanced Implementation

```typescript
export const provider: Provider = {
  name: "MCP",
  get: async (runtime, message, state) => {
    const mcpService = runtime.getService<McpService>(MCP_SERVICE_NAME);
    if (!mcpService) {
      return { values: {}, data: {}, text: "" };
    }

    // Get metadata (existing functionality)
    const providerData = mcpService.getProviderData();

    // NEW: Auto-execute search if enabled
    const servers = mcpService.getServers();
    let knowledgeText = "";

    for (const server of servers) {
      const config = JSON.parse(server.config);

      // Check if this server has autoSearch enabled
      if (config.autoSearch && server.status === 'connected') {
        // Only search on user messages, not agent self-talk
        if (message.userId === runtime.agentId) continue;

        runtime.logger.info(`[MCP-AUTO] Executing ${config.searchTool || 'search_knowledge'} for query`);

        const toolName = config.searchTool || 'search_knowledge';
        const limit = config.searchLimit || 5;

        try {
          const result = await mcpService.callTool(server.name, toolName, {
            query: message.content.text,
            limit: limit
          });

          const resultText = result.content
            .filter(c => c.type === 'text')
            .map(c => c.text)
            .join('\n');

          knowledgeText += `\n\n# Retrieved Knowledge (${server.name})\n${resultText}`;

          runtime.logger.info(`[MCP-AUTO] Retrieved ${result.content.length} results from ${server.name}`);
        } catch (error) {
          runtime.logger.error(`[MCP-AUTO] Search failed for ${server.name}: ${error}`);
        }
      }
    }

    return {
      ...providerData,
      text: providerData.text + knowledgeText  // Injected into LLM context
    };
  }
};
```

## Character Configuration

### Basic Setup

```json
{
  "settings": {
    "mcp": {
      "servers": {
        "koi-knowledge": {
          "type": "streamable-http",
          "url": "http://localhost:8200/mcp",
          "description": "KOI Knowledge Graph",
          "autoSearch": true,           // Enable always-on search
          "searchTool": "search_knowledge",  // Which tool to call
          "searchLimit": 5              // How many results to retrieve
        }
      }
    }
  }
}
```

### Advanced Configuration

```json
{
  "settings": {
    "mcp": {
      "servers": {
        "koi-knowledge": {
          "type": "streamable-http",
          "url": "http://localhost:8200/mcp",
          "autoSearch": true,
          "searchTool": "search_knowledge",
          "searchLimit": 10,
          "minConfidence": 0.8,         // Only include high-confidence results
          "cacheResults": true,         // Cache identical queries
          "cacheTTL": 300000            // 5 minutes
        }
      }
    }
  }
}
```

### Multiple Knowledge Sources

```json
{
  "settings": {
    "mcp": {
      "servers": {
        "koi-knowledge": {
          "type": "streamable-http",
          "url": "http://localhost:8200/mcp",
          "autoSearch": true,
          "searchTool": "search_knowledge",
          "searchLimit": 5
        },
        "technical-docs": {
          "type": "stdio",
          "command": "/path/to/docs-server.sh",
          "autoSearch": true,
          "searchTool": "semantic_search",
          "searchLimit": 3
        }
      }
    }
  }
}
```

## Complete Message Flow

```
User: "What are jaguar credits?"
  ↓
shouldRespond: true
  ↓
composeState(['ACTIONS', 'PROVIDERS', 'KNOWLEDGE'])
  ↓
MCP Provider executes automatically:
  1. Checks config.autoSearch = true
  2. Calls search_knowledge("What are jaguar credits?", limit=5)
  3. Gets results from knowledge base:
     - Result 1 (confidence: 0.836): "Indigenous-Led Group Launches..."
     - Result 2 (confidence: 0.791): "Biocultural Conservation Credits..."
     - etc.
  4. Formats results as provider.text
  ↓
State now includes in context:
  # Retrieved Knowledge (koi-knowledge)

  [Document 1 - Confidence: 0.836]
  Indigenous-Led Group Launches Cutting-Edge Biocultural Jaguar Credits
  Source: orn:web.page:registry.regen.network/3ddf7c82a6fee4f2#chunk0

  Jaguar Credits are biocultural conservation credits aimed at protecting
  jaguar habitats managed by Indigenous communities...

  [Document 2 - Confidence: 0.791]
  ...
  ↓
LLM receives prompt with knowledge results ALREADY in context
  ↓
LLM generates response using the retrieved knowledge:
  "Based on our knowledge base (confidence: 0.836), Jaguar Credits are
   biocultural conservation credits launched by an Indigenous-led initiative
   to protect jaguar habitats. [detailed answer with citations]

   Source: orn:web.page:registry.regen.network/3ddf7c82a6fee4f2#chunk0"
```

## Why This Architecture is Correct

1. **Provider Pattern** - ElizaOS providers are DESIGNED to inject context into every message. This is their exact purpose in the framework.

2. **Always Runs** - Providers in the `PROVIDERS` composition run on every message automatically. No triggers, no decisions needed.

3. **Opt-In** - Controlled via `autoSearch` flag per server. Want it off? Set to `false` or omit entirely.

4. **Composable** - Multiple MCP servers can each have `autoSearch` enabled. Results from all are combined into the context.

5. **Performance Aware** - Only searches on user messages, not agent self-talk (checks `message.userId !== runtime.agentId`).

6. **Zero Breaking Changes** - If `autoSearch` is not set, behavior is unchanged. Fully backward compatible.

7. **No Keyword Lists** - Works for EVERY query, not just those matching keywords. Truly knowledge-base-backed agents.

## Advanced Enhancements

### Query Optimization

```typescript
function optimizeQueryForSearch(text: string): string {
  // Remove conversational fluff
  const cleaned = text
    .replace(/^(hi|hello|hey|can you|could you|please)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  // Extract key terms if query is very long
  if (cleaned.length > 200) {
    return extractKeyTerms(cleaned);
  }

  return cleaned;
}
```

### Result Caching

```typescript
// Cache results for identical queries within a time window
const cacheKey = `mcp:${server.name}:${hash(message.content.text)}`;
const cached = await runtime.cacheManager.get(cacheKey);

if (cached && Date.now() - cached.timestamp < config.cacheTTL) {
  return cached.results;
}

const result = await mcpService.callTool(...);
await runtime.cacheManager.set(cacheKey, {
  results: result,
  timestamp: Date.now()
});
```

### Confidence Filtering

```typescript
// Only include high-confidence results
const minConfidence = config.minConfidence || 0.0;
const filteredResults = result.content.filter(r => {
  const confidence = r.annotations?.confidence || 0;
  return confidence >= minConfidence;
});
```

### Adaptive Search Depth

```typescript
// Vary search depth based on query complexity
function estimateRequiredResults(text: string): number {
  if (text.includes('compare') || text.includes('difference')) return 10;
  if (text.includes('overview') || text.includes('summary')) return 8;
  if (text.includes('specific') || text.includes('exact')) return 3;
  return 5; // default
}

const searchLimit = config.searchLimit || estimateRequiredResults(message.content.text);
```

## Implementation Plan

### Phase 1: Core Enhancement
**File**: `/opt/projects/plugin-mcp/src/provider.ts`

1. Add `autoSearch` detection logic
2. Execute search when enabled
3. Inject results into provider text
4. Add logging for debugging

### Phase 2: Configuration Support
**File**: `/opt/projects/plugin-mcp/src/types.ts`

1. Add `autoSearch`, `searchTool`, `searchLimit` to config types
2. Add `minConfidence`, `cacheResults`, `cacheTTL` for advanced features
3. Update documentation

### Phase 3: Optimization (Optional)
1. Implement query optimization
2. Add result caching layer
3. Add confidence filtering
4. Add adaptive search depth
5. Performance monitoring

## Testing Strategy

### Test 1: Basic Functionality
```bash
# Enable autoSearch in character file
# Restart agent
# Send ANY message - should trigger search

curl -X POST http://localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hello",
    "channelId": "test-channel"
  }'

# Check logs
tail -f logs/regenai.log | grep "MCP-AUTO"
```

Expected output:
```
[MCP-AUTO] Executing search_knowledge for query
[MCP-AUTO] Retrieved 5 results from koi-knowledge
```

### Test 2: Multiple Queries
```bash
# Test various query types
queries=("What are jaguar credits?" "Hello" "Explain additionality" "How are you?")

for query in "${queries[@]}"; do
  echo "Testing: $query"
  curl -X POST http://localhost:3000/api/messages \
    -H "Content-Type: application/json" \
    -d "{\"text\": \"$query\", \"channelId\": \"test\"}"
  sleep 2
done
```

All should trigger knowledge retrieval.

### Test 3: Performance
```bash
# Measure response time with/without caching
time curl -X POST http://localhost:3000/api/messages \
  -d '{"text": "What are ecological credits?", "channelId": "test"}'

# Second identical query (should be cached)
time curl -X POST http://localhost:3000/api/messages \
  -d '{"text": "What are ecological credits?", "channelId": "test"}'
```

Second request should be faster if caching is enabled.

## Benefits Over Keyword Triggers

| Aspect | Keyword Triggers | Always-On Provider |
|--------|-----------------|-------------------|
| **Coverage** | Only matching queries | Every query |
| **Complexity** | Maintain keyword list | Set flag once |
| **False Negatives** | Common (missed keywords) | Impossible |
| **False Positives** | Possible | N/A |
| **Performance** | Conditional | Every message (cacheable) |
| **Architecture** | Workaround | Native pattern |
| **Maintainability** | Medium | High |
| **Agent Knowledge** | Patchy | Complete |

## Migration Path

### Step 1: Enable for One Agent
1. Update `regenai.character.json` with `autoSearch: true`
2. Restart agent
3. Monitor logs and performance
4. Verify responses include knowledge citations

### Step 2: Roll Out to All Agents
1. Update all character files
2. Restart all agents
3. Monitor system performance
4. Tune `searchLimit` and `minConfidence` per agent

### Step 3: Optimize
1. Enable result caching
2. Add query optimization
3. Implement confidence filtering
4. Performance tuning

## System Prompt Updates

With always-on knowledge retrieval, the system prompt can be simplified:

### Before (with manual tool calling)
```
KNOWLEDGE ACCESS PROTOCOL (CRITICAL):
You MUST use MCP tools for ANY question about:
- Regenerative agriculture...
[long list of when to use tools]

Required Response Pattern:
1. Use CALL_MCP_TOOL with search_knowledge for the query
2. Analyze results with confidence scores
3. Provide answer citing specific sources and RIDs
```

### After (with always-on provider)
```
KNOWLEDGE BASE:
You have access to a comprehensive knowledge base with 6,500+ documents
about regenerative agriculture, Regen Network, methodologies, and ecological
credits. Relevant information is automatically retrieved for every query.

When responding:
1. Use the retrieved knowledge shown in your context
2. Cite sources with RIDs when available
3. Note confidence scores in your answers
4. If no relevant knowledge is found, say so clearly
```

Much simpler! The complexity moves from the prompt to the architecture.

## Conclusion

This architecture treats MCP as what it fundamentally should be: **a knowledge retrieval layer that always runs**, not an optional tool the LLM decides to use.

Benefits:
- ✅ Every response is knowledge-backed
- ✅ No keyword maintenance
- ✅ No LLM decision overhead
- ✅ True RAG architecture
- ✅ Composable across multiple knowledge sources
- ✅ Opt-in per agent/server
- ✅ Zero breaking changes

This is the correct long-term architecture for knowledge-backed agents in ElizaOS.
