# ElizaOS Knowledge Plugin Issues

This document details specific issues with the `@elizaos/plugin-knowledge` package in ElizaOS v1.2.0+ that prevent RAG functionality from working out of the box.

## Core Architecture Issues

### 1. Provider Selection Mechanism

The ElizaOS agent decision flow:
```
User Message → Agent Thinks → Selects Providers → Calls Selected Providers → Generates Response
```

**Problem**: The KNOWLEDGE provider is never selected because:
- It's not listed in the provider selection rules in `@elizaos/core/src/prompts.ts`
- The PROVIDERS provider (which lists available providers) only shows providers with `dynamic: true`
- Even if manually added, the provider's `get()` method doesn't retrieve documents

### 2. Provider Registration vs Selection

**Registration** (✓ Works):
```javascript
runtime.registerProvider(knowledgeProvider);
// Provider is now in runtime.providers array
```

**Selection** (✗ Broken):
```javascript
// Agent must explicitly choose to use it
<providers>KNOWLEDGE</providers>  // Never happens
```

The provider can be registered successfully but never gets selected by agents.

### 3. Dynamic Provider Filtering

In `@elizaos/plugin-bootstrap/src/providers/providers.ts`:
```javascript
const dynamicProviders = runtime.providers.filter(
    provider => provider.dynamic === true
);
```

This means:
- Only providers with `dynamic: true` appear in the available list
- Static providers are hidden from agents
- Knowledge provider must have `dynamic: true` to be discoverable

## Specific Code Issues

### Issue 1: Missing from Core Prompts

**File**: `@elizaos/core/src/prompts.ts`
```javascript
// Current provider selection rules
IMPORTANT PROVIDER SELECTION RULES:
- If the message mentions images...include "ATTACHMENTS"
- If the message asks about specific people...include "ENTITIES"
- If the message asks about facts...include "FACTS"
- If the message asks about the environment...include "WORLD"
// KNOWLEDGE is never mentioned!
```

**Impact**: Agents don't know KNOWLEDGE exists as an option.

### Issue 2: Provider Property Requirements

**File**: `@elizaos/core/src/types/plugin.ts`
```typescript
interface Provider {
    name: string;
    dynamic?: boolean;  // Optional but critical!
    get: (runtime, message, state) => Promise<any>;
}
```

**Problem**: Without `dynamic: true`, provider is invisible to selection.

### Issue 3: Knowledge Plugin Export Format

**File**: `@elizaos/plugin-knowledge/package.json`
```json
{
  "type": "module",
  "exports": {
    ".": "./dist/index.js"
  }
}
```

**Issues**:
- ESM/CommonJS compatibility problems
- No clear plugin structure export
- Provider may not be properly exposed

## Implementation Gaps

### 1. No Document Retrieval Implementation

The knowledge provider's `get()` method should:
```javascript
async get(runtime, message, state) {
    // 1. Extract query from message
    const query = message.content.text;
    
    // 2. Search indexed documents
    const results = await searchDocuments(query);
    
    // 3. Return relevant content
    return formatResults(results);
}
```

**Reality**: Returns empty string or undefined.

### 2. Missing Service Integration

The knowledge service exists but isn't connected to the provider:
```javascript
// Service starts
"Starting Knowledge service for agent: xxx"

// But provider doesn't use it
knowledgeProvider.get = async () => {
    // Doesn't call service methods
    return "";
}
```

### 3. No Search Actions

Unlike other plugins, knowledge doesn't provide a search action:
```javascript
// Expected
actions: [
    {
        name: "SEARCH_KNOWLEDGE",
        handler: async (runtime, message) => { /* search */ }
    }
]

// Reality
actions: []  // Empty or minimal
```

## Required Fixes

### Fix 1: Update Core Prompts
```diff
// In @elizaos/core/src/prompts.ts
IMPORTANT PROVIDER SELECTION RULES:
+ - If the message asks about domain-specific knowledge, include "KNOWLEDGE"
  - If the message asks about facts...include "FACTS"
```

### Fix 2: Ensure Dynamic Property
```javascript
// In knowledge provider
export const knowledgeProvider = {
    name: 'KNOWLEDGE',
    dynamic: true,  // REQUIRED
    get: async () => { /* ... */ }
};
```

### Fix 3: Implement Retrieval
```javascript
// Actual document search
get: async (runtime, message, state) => {
    const service = runtime.getService('knowledge');
    const results = await service.search(message.content.text);
    return results.map(r => r.content).join('\n');
}
```

## Workarounds

### 1. Patch Compiled Code
```bash
# Add KNOWLEDGE wherever FACTS appears
sed -i 's/FACTS/FACTS,KNOWLEDGE/g' node_modules/@elizaos/core/dist/index.js
```

### 2. Force Provider Registration
```javascript
// In wrapper
runtime.providers.push(knowledgeProvider);
runtime.providerRegistry.KNOWLEDGE = knowledgeProvider;
```

### 3. Hardcode Test Response
```javascript
// Temporary verification
if (query.includes('jaguar')) {
    return "Jaguar credits: 10,000 hectares in Ecuador...";
}
```

## Version-Specific Notes

### ElizaOS v1.2.0
- Knowledge plugin exists but minimal implementation
- No clear document retrieval API
- Provider structure unclear

### ElizaOS v1.4.2
- May have improved knowledge plugin
- Check for new search methods
- Verify provider export structure

## Testing for Issues

### Test 1: Provider Visibility
```javascript
// Check if KNOWLEDGE appears in available providers
const providers = runtime.providers.filter(p => p.dynamic);
console.log(providers.map(p => p.name));  // Should include KNOWLEDGE
```

### Test 2: Provider Selection
```xml
<!-- Check agent response -->
<providers>KNOWLEDGE</providers>  <!-- Should appear for factual questions -->
```

### Test 3: Document Retrieval
```javascript
// Verify provider returns content
const result = await knowledgeProvider.get(runtime, message, state);
console.log(result.length);  // Should be > 0
```

## Recommended Solution

Rather than patching, consider:
1. Fork `@elizaos/plugin-knowledge`
2. Implement proper document retrieval
3. Ensure `dynamic: true` in provider
4. Submit PR to ElizaOS with fixes

## Summary

The knowledge plugin has three fundamental issues:
1. **Discovery**: Not in provider selection rules
2. **Visibility**: Missing `dynamic: true` property
3. **Functionality**: Doesn't retrieve documents

All three must be fixed for RAG to work. Current implementations patch the first two but struggle with actual document retrieval, suggesting the plugin may be incomplete or incorrectly integrated.