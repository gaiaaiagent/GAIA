# Docker Images for GAIA AI System

This directory documents the Docker images created to fix various issues with the ElizaOS knowledge/RAG system.

## Image Progression

Each image builds upon previous fixes to address specific issues discovered during RAG system debugging.

### 1. `zaldarren/gaia-regen-knowledge:esm-fix`
**Problem Solved**: CommonJS/ESM module compatibility issues  
**Key Changes**:
- Created ESM-compatible wrapper for knowledge plugin
- Fixed "require is not defined in ES module scope" errors
- Added module type declarations

**Status**: ✅ Plugin loads, but provider not registered

### 2. `zaldarren/gaia-regen-knowledge:rag-fix-v2`
**Problem Solved**: Provider not being registered with runtime  
**Key Changes**:
- Force registration of knowledge provider
- Added comprehensive [RAG] logging
- Attempted to hook provider into runtime

**Status**: ✅ Provider registered, but not being selected by agents

### 3. `zaldarren/gaia-regen-knowledge:provider-selection-fix`
**Problem Solved**: Provider not appearing in selectable list  
**Key Changes**:
- Added `dynamic: true` to knowledge provider (critical!)
- Patched provider selection instructions
- Updated all character files to use wrapper

**Status**: ✅ Provider selectable, agents choose it, but no document retrieval

### 4. `zaldarren/gaia-regen-knowledge:knowledge-core-fix`
**Problem Solved**: KNOWLEDGE not in agent's provider selection rules  
**Key Changes**:
- Patched compiled ElizaOS core with `s/FACTS/FACTS,KNOWLEDGE/g`
- Ensures KNOWLEDGE appears wherever FACTS is mentioned
- Added to provider selection instructions

**Status**: ✅ Agents select KNOWLEDGE, provider called, but returns empty

### 5. `zaldarren/gaia-regen-knowledge:production-v9`
**Current Production**: Combines all fixes  
**Includes**:
- ESM compatibility wrapper
- Provider registration with `dynamic: true`
- Core patches for selection rules
- Comprehensive logging
- All character configurations

**Status**: ⚠️ Provider selected and called, but document retrieval not implemented

## Quick Reference

| Issue | Symptom | Solution | Image |
|-------|---------|----------|-------|
| Module errors | "require is not defined" | ESM wrapper | `esm-fix` |
| Provider missing | Not in runtime.providers | Force registration | `rag-fix-v2` |
| Not selectable | Empty `<providers>` | Add `dynamic: true` | `provider-selection-fix` |
| Not in rules | Agent doesn't know about KNOWLEDGE | Patch core prompts | `knowledge-core-fix` |
| All above | Multiple issues | Combined fixes | `production-v9` |

## Usage

### Development/Testing
```bash
docker pull zaldarren/gaia-regen-knowledge:knowledge-core-fix
docker run -d --name regenai \
  -p 3000:3000 \
  -v $(pwd)/knowledge:/app/knowledge:ro \
  -v $(pwd)/characters:/app/characters:ro \
  -e KNOWLEDGE_PATH=/app/knowledge \
  -e NODE_ENV=production \
  zaldarren/gaia-regen-knowledge:knowledge-core-fix
```

### Production
```bash
# Use docker-compose.override.yaml
services:
  regen:
    image: zaldarren/gaia-regen-knowledge:production-v9
    # ... rest of configuration
```

## Building Custom Images

### Base Dockerfile Structure
```dockerfile
FROM node:23.3.0-slim
WORKDIR /app

# Copy ElizaOS
COPY packages ./packages
COPY characters ./characters
COPY knowledge ./knowledge

# Apply fixes
COPY knowledge-plugin-wrapper.js ./
COPY start-knowledge-fix.sh ./

# Patch core if needed
RUN sed -i 's/FACTS/FACTS,KNOWLEDGE/g' \
    /app/node_modules/@elizaos/core/dist/index.js

ENTRYPOINT ["/app/start-knowledge-fix.sh"]
```

### Key Files Needed
1. `knowledge-plugin-wrapper.js` - ESM wrapper with provider
2. `start-knowledge-fix.sh` - Startup script with patches
3. Character files with plugin configuration
4. Knowledge documents in `/app/knowledge`

## Debugging Images

### Check Plugin Loading
```bash
docker logs regenai | grep "\[KNOWLEDGE\]"
```

### Verify Provider Registration
```bash
docker logs regenai | grep "Provider.*registered"
```

### Monitor Provider Selection
```bash
docker logs regenai -f | grep "<providers>"
```

### Watch RAG Activity
```bash
docker logs regenai -f | grep "\[RAG\]"
```

## Known Issues

### Issue: Provider Returns Empty
Even in `production-v9`, the knowledge provider is called but doesn't retrieve documents.

**Root Cause**: The `@elizaos/plugin-knowledge` provider's `get()` method doesn't implement document search.

**Workaround**: Implement custom retrieval logic in wrapper:
```javascript
get: async (runtime, message, state) => {
    // Custom document search implementation
    const service = runtime.getService('knowledge');
    const results = await service.searchDocuments(message.content.text);
    return formatResults(results);
}
```

### Issue: Build Loop at Runtime
Container rebuilds project instead of running.

**Solution**: Use production mode and skip build:
```bash
-e NODE_ENV=production \
-e ELIZA_SKIP_BUILD=true
```

### Issue: Characters Not Loading
Character files not found at expected paths.

**Solution**: Mount or copy characters to `/app/characters/`:
```bash
-v $(pwd)/characters:/app/characters:ro
```

## Testing Images

Use the test script to verify functionality:
```bash
./scripts/test-rag-system.sh
```

Expected output when working:
```
✅ Container running
✅ Documents indexed
✅ Knowledge service started
✅ Knowledge plugin loaded
✅ KNOWLEDGE provider selected
✅ Provider being called
✅ RAG activity detected
```

## Future Improvements

1. **Implement Document Retrieval**: Fix provider's `get()` method to actually search and return documents
2. **Native Integration**: Submit PR to ElizaOS to include KNOWLEDGE in core provider rules
3. **Build Optimization**: Create fully pre-built image without runtime compilation
4. **API Documentation**: Document the knowledge service API for proper integration

## Support

For issues or questions:
- Check logs: `docker logs regenai --tail 100`
- Run tests: `./scripts/test-rag-system.sh`
- See troubleshooting guide: `docs/RAG_TROUBLESHOOTING_GUIDE.md`