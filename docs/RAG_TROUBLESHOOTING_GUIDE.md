# RAG System Troubleshooting Guide

This guide documents the complete investigation and resolution of RAG (Retrieval-Augmented Generation) issues in the ElizaOS-based Regen Network AI system.

## Problem Statement

Despite having 1,014+ documents successfully indexed, the AI agents were providing generic responses instead of using the indexed knowledge base. When asked "What are jaguar credits?", agents would give generic definitions instead of specific details from the indexed documents (Ecuador, 10,000 hectares, Altos Planos Inc, $16,000).

## Root Causes Discovered

Through extensive investigation, we identified **three critical issues** preventing the knowledge system from working:

### Issue 1: Provider Not in Selection Rules
The KNOWLEDGE provider wasn't mentioned in the agent's provider selection instructions. Agents literally didn't know KNOWLEDGE existed as an option.

### Issue 2: Missing `dynamic: true` Property
Even when added to instructions, providers need `dynamic: true` to appear in the selectable providers list.

### Issue 3: Provider Doesn't Retrieve Documents
The knowledge provider's `get()` method was being called but wasn't actually retrieving document content.

## Investigation Process

### Step 1: Verify Documents Are Indexed
```bash
# Check document count
docker exec regenai ls /app/knowledge/regen-network/governance/articles/ | wc -l

# Verify specific document exists
docker exec regenai grep -c "Ecuador" /app/knowledge/regen-network/governance/articles/*jaguar*.md

# Check if fragments were created
docker logs regenai | grep "fragments created"
```

### Step 2: Check Provider Registration
```bash
# Look for provider registration
docker logs regenai | grep -i "provider.*knowledge.*registered"

# Check if knowledge service starts
docker logs regenai | grep "Starting Knowledge service"

# Verify plugin loads
docker logs regenai | grep "\[KNOWLEDGE\]"
```

### Step 3: Monitor Provider Selection
```bash
# Watch what providers agent selects
docker logs regenai -f | grep "<providers>"

# Check if KNOWLEDGE is called
docker logs regenai | grep "KNOWLEDGE Provider took"

# Look for RAG activity
docker logs regenai | grep "\[RAG\]"
```

### Step 4: Analyze Agent Response Structure
When agents respond, they return XML like:
```xml
<response>
    <thought>User is asking about jaguar credits...</thought>
    <actions>REPLY</actions>
    <providers></providers>  <!-- PROBLEM: Empty! Should include KNOWLEDGE -->
    <text>Generic response...</text>
</response>
```

## Solutions

### Fix 1: Add KNOWLEDGE to Provider Selection Rules
The core ElizaOS prompts tell agents when to use each provider but didn't mention KNOWLEDGE:
```javascript
// In compiled @elizaos/core/dist/index.js
// Original:
"If the message asks about facts or specific information, include FACTS"

// Fixed:
"If the message asks about facts or specific information, include FACTS,KNOWLEDGE"
```

### Fix 2: Ensure Provider Has `dynamic: true`
```javascript
const knowledgeProvider = {
    name: 'KNOWLEDGE',
    description: 'Indexed documents and knowledge base',
    dynamic: true,  // CRITICAL: Required for provider to be selectable
    get: async (runtime, message, state) => {
        // Provider implementation
    }
};
```

### Fix 3: Implement Document Retrieval
The provider needs to actually search and return documents:
```javascript
get: async (runtime, message, state) => {
    console.log('[RAG] KNOWLEDGE provider GET called!');
    const query = message?.content?.text || '';
    
    // Get knowledge service
    const service = runtime.getService('knowledge');
    
    // Search for documents (implementation depends on plugin version)
    const results = await service.searchKnowledge(query);
    
    // Return formatted content
    if (results && results.length > 0) {
        const content = results.map(r => r.content).join('\n\n');
        return `Based on indexed documents:\n${content}`;
    }
    
    return '';
}
```

## Docker Images Created

Each image addresses specific issues:

| Image | Purpose | Key Fix |
|-------|---------|---------|
| `esm-fix` | Fixed module loading | CommonJS/ESM compatibility |
| `rag-fix-v2` | Provider registration | Force registration in runtime |
| `provider-selection-fix` | Provider visibility | Added `dynamic: true` |
| `knowledge-core-fix` | Provider selection | Patched core selection rules |
| `production-v9` | Complete solution | All fixes combined |

## Verification Steps

### 1. Test Provider Selection
```bash
# Ask a factual question
curl -X POST https://your-domain/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What are jaguar credits?"}'

# Check logs for provider selection
docker logs regenai | grep "<providers>" | tail -1
# Should show: <providers>KNOWLEDGE</providers> or <providers>FACTS,KNOWLEDGE</providers>
```

### 2. Verify Provider is Called
```bash
# Look for provider execution
docker logs regenai | grep "KNOWLEDGE Provider took"
# Should show: KNOWLEDGE Provider took XXXms to respond
```

### 3. Check Document Retrieval
```bash
# Monitor RAG logs
docker logs regenai -f | grep "\[RAG\]"
# Should show:
# [RAG] KNOWLEDGE provider GET called!
# [RAG] Searching for: what are jaguar credits?
# [RAG] Found 6 documents, 2847 chars
```

### 4. Validate Response Content
The response should include specific details from documents:
- ✅ 10,000 hectares in Ecuador
- ✅ Partnership with Altos Planos Inc
- ✅ $16,000 purchase amount
- ✅ Denver event in March 2024

## Common Pitfalls

### 1. Build Loop at Runtime
**Problem**: Container rebuilds entire project instead of running.
```bash
# Wrong - triggers rebuild
CMD ["bun", "run", "start"]

# Right - uses pre-built
CMD ["bun", "/app/packages/cli/dist/index.js", "start"]
```

### 2. Provider Not in List
**Problem**: PROVIDERS provider only shows providers with `dynamic: true`.
```javascript
// This filters out static providers
const dynamicProviders = runtime.providers.filter(p => p.dynamic === true);
```

### 3. Empty Provider Response
**Problem**: Provider is called but returns empty string.
```javascript
// Check if provider actually retrieves content
console.log('[RAG] Provider returned:', result?.length || 0, 'chars');
```

### 4. Wrong Provider Name
**Problem**: Case sensitivity matters.
```javascript
// Inconsistent naming breaks selection
name: 'knowledge'  // lowercase
name: 'KNOWLEDGE'  // uppercase (matches other providers)
```

## Quick Debugging Commands

```bash
# Full diagnostic in one command
docker logs regenai --tail 200 2>&1 | grep -E "\[KNOWLEDGE\]|\[RAG\]|<providers>|Provider took" | tail -50

# Check if working end-to-end
echo "Test question: What are jaguar credits?" && \
sleep 5 && \
docker logs regenai --tail 100 | grep -A 5 "jaguar"

# Monitor live
docker logs regenai -f 2>&1 | grep -E "KNOWLEDGE|RAG|providers"
```

## Summary

The RAG system failure was caused by a chain of issues:
1. Agents didn't know KNOWLEDGE was an option (not in selection rules)
2. Even if added, it wasn't visible without `dynamic: true`
3. Even when called, it didn't retrieve actual documents

The solution requires fixing all three issues. The `knowledge-core-fix` image addresses the first two, but the third requires implementing proper document retrieval in the provider's `get()` method based on how the specific version of `@elizaos/plugin-knowledge` works.

## KOI System Integration

The KOI (Knowledge Organization Infrastructure) system provides additional monitoring and debugging capabilities for the RAG system:

### KOI Dashboard Monitoring
Access the KOI dashboard at https://regen.gaiaai.xyz/koi/ to monitor:
- **Agent Processing Statistics**: Real-time view of which agents have processed content
- **Content Source Breakdown**: See documents organized by source (Notion, Twitter, etc.)
- **Processing Status**: Track pending, processed, and failed documents by agent

### KOI System Commands
```bash
# Check KOI services are running
ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep

# Get agent statistics via KOI
curl http://localhost:8100/stats | jq '.agents'

# Query KOI knowledge base directly
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What are jaguar credits?"}' | jq

# Check agent RID mappings
curl http://localhost:8001/regen/agents | jq
```

### Troubleshooting with KOI
If agents show incorrect processing statistics:
1. **Phantom Entries**: KOI automatically filters out phantom agent entries with suspicious statistics
2. **Agent Name Mismatch**: Use agent RID system to map between GAIA UUIDs and display names
3. **Source Detection**: KOI preserves source metadata from knowledge file paths

### KOI Service Issues
```bash
# Restart KOI node server
cd /home/regenai/project/koi-infrastructure/koi-regen-node
pkill -f "python.*node" && source venv/bin/activate && python -m node &

# Restart KOI query server
cd /opt/projects/plugin-knowledge-gaia  
pkill -f "bun.*koi-query" && bun scripts/koi-query-server.ts &
```

## Next Steps

If RAG still isn't working after applying these fixes:
1. Investigate the actual `@elizaos/plugin-knowledge` implementation
2. Find the correct API methods for document search
3. Implement proper retrieval in the provider
4. Consider building from source with modifications rather than patching compiled code
5. Use KOI system to monitor and debug processing status
6. Check agent RID mappings and source metadata preservation