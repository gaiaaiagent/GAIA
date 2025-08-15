# Plugin-Knowledge Changes Required

## Overview

The `@elizaos/plugin-knowledge` package requires several fixes for proper ESM compatibility and debugging. These changes are currently in the local `packages/plugin-knowledge` directory on branch `fix-esm-export-and-debug`.

## Required Changes

### 1. Fix ESM Export (src/index.ts)
```typescript
// Add at the end of the file
export default knowledgePlugin;
```

### 2. Add Debug Logging
- Added console.log statements in `src/provider.ts` to track provider calls
- Added console.log statements in `src/service.ts` to track service initialization

### 3. Fix tsup Configuration (tsup.config.ts)
```typescript
// Change the runner from tsx to tsup
runner: 'tsup'
```

### 4. Add Polyfills (src/polyfills.ts)
```typescript
// @ts-nocheck
import { polyfillNode } from 'esbuild-plugin-polyfill-node';

// Polyfill global if needed
if (typeof global === 'undefined') {
  (window as any).global = window;
}
```

### 5. Import Polyfills (src/index.ts)
```typescript
import './polyfills.js';
```

## Next Steps

1. Fork https://github.com/elizaos-plugins/plugin-knowledge to gaiaaiagent/plugin-knowledge
2. Apply these changes to the fork
3. Update GAIA to use the forked version
4. Consider contributing fixes back to upstream

## Testing

After applying these changes:
1. The plugin loads successfully in ElizaOS
2. The knowledge provider is registered properly
3. RAG functionality works when asking about indexed content
4. Debug logs help trace provider selection