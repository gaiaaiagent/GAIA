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

## Implementation Status

✅ **Completed**: Fork https://github.com/elizaos-plugins/plugin-knowledge to gaiaaiagent/plugin-knowledge
✅ **Completed**: Apply fixes to the fork at `/opt/projects/plugin-knowledge-gaia/`
✅ **Completed**: Update GAIA package.json to reference the forked version
✅ **Completed**: Add KOI system integration for enhanced statistics and monitoring

## Current Setup

The GAIA repo now references our enhanced knowledge plugin via:
```json
"@elizaos/plugin-knowledge": "https://github.com/gaiaaiagent/plugin-knowledge.git"
```

This ensures:
- Automatic installation from our fork
- KOI system integration for agent statistics
- Enhanced source metadata preservation
- Improved debugging capabilities

## Testing

After applying these changes:
1. The plugin loads successfully in ElizaOS
2. The knowledge provider is registered properly
3. RAG functionality works when asking about indexed content
4. Debug logs help trace provider selection