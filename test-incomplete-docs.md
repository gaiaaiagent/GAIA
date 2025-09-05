# Testing Incomplete Document Fix

## What We Fixed

1. **Problem**: 17,841 documents were registered in the database but had no fragments created
2. **Cause**: Some error during initial processing left documents incomplete
3. **Old Behavior**: These documents would be skipped forever (marked as "already exists")
4. **New Behavior**: Detect incomplete documents, delete them, and reprocess

## The Fix (in service.ts)

```typescript
// If document exists but has no fragments, it was incompletely processed
if (relatedFragments.length === 0) {
  logger.warn(`[INCOMPLETE DOC] Document has NO fragments - needs reprocessing`);
  
  // Delete the incomplete document record
  await this.runtime.adapter.removeMemory(contentBasedId);
  
  // Continue with normal processing (document will be recreated)
}
```

## Testing Steps

1. Build the plugin:
   ```bash
   cd packages/plugin-knowledge
   bun run build
   ```

2. Create a test character with small knowledge set
3. Simulate incomplete documents
4. Run agent and watch logs for "[INCOMPLETE DOC]" messages

## Expected Behavior

When the agent encounters a document that exists but has no fragments:
1. Log: `[INCOMPLETE DOC] Document "filename" has NO fragments - needs reprocessing`
2. Delete the incomplete document record
3. Process the document normally, creating proper fragments
4. Document becomes searchable via RAG

## Deployment Plan

1. ✅ Fix implemented locally
2. ✅ Committed to plugin-knowledge fork
3. ⏳ Test locally with sample data
4. ⏳ Deploy to production server
5. ⏳ Run agents to reprocess 17,841 incomplete documents
6. ⏳ Verify all documents have fragments