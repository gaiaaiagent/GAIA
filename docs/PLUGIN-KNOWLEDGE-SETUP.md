# Plugin-Knowledge Setup Guide

## Overview

The GAIA project uses a **forked version** of the `@elizaos/plugin-knowledge` plugin with custom enhancements for knowledge deduplication and improved performance.

## Fork Details

- **Fork Repository**: https://github.com/gaiaaiagent/plugin-knowledge
- **Original Repository**: https://github.com/elizaos-plugins/plugin-knowledge
- **Active Branch**: `regenai-unified-fixes`
- **Version**: 1.2.2 (custom fork)

## Repository Structure

The plugin-knowledge fork is managed as a **git submodule** within the GAIA monorepo:

```
GAIA/
├── packages/
│   ├── plugin-knowledge/    # ← The actual plugin (git submodule)
│   │   ├── src/              # Source code
│   │   ├── dist/             # Built JavaScript files
│   │   └── package.json      # Plugin configuration
│   └── ... other packages
```

**Note**: The root-level `/GAIA/plugin-knowledge/` directory should NOT exist and is gitignored. Only use `packages/plugin-knowledge/`.

## Key Features of Our Fork

### 1. Content-Based Knowledge Deduplication (September 2, 2025)
- SHA-256 hashing for document identification
- Shared embeddings across multiple agents
- Agent-scoped fragment references
- ~90% storage reduction for multi-agent setups
- First agent creates embeddings, subsequent agents create lightweight references

### 2. Ollama Embedding Support
- Local embedding generation with nomic-embed-text model
- 768-dimension embeddings (vs 1536 for OpenAI)
- Zero-cost embeddings
- ~2-3x faster than API calls

### 3. Rate Limiting Fixes
- Improved handling of large document batches
- Prevents overwhelming the embedding API with too many concurrent requests

### 4. Source Metadata Preservation
- Automatically detects and preserves document sources (notion, twitter, discord, etc.)
- Maintains provenance tracking through the KOI system
- Enhanced source detection for KOI statistics

## Critical Bug Fixes in Our Fork

### createUniqueUuid Parameters (src/service.ts)
```typescript
// BEFORE (broken):
id: createUniqueUuid() as UUID

// AFTER (fixed):
id: createUniqueUuid(this.runtime, originalFragment.id) as UUID
```

### Text Split Null Checks (src/document-processor.ts)
```typescript
// Added null/undefined checks
if (!text || typeof text !== 'string') {
  logger.warn(`[splitIntoChunks] Received invalid text: ${typeof text}`);
  return [];
}
```

### Report Generation Location (src/report-generator.ts)
```typescript
// BEFORE (caused recursive processing):
this.reportPath = path.join(knowledgePath, '.processing-reports');

// AFTER (proper location):
const projectRoot = process.cwd();
this.reportPath = path.join(projectRoot, 'logs', 'knowledge-processing-reports');
```

## Setup Instructions

### 1. Clone with Submodules

When cloning the GAIA repository, include submodules:

```bash
git clone --recurse-submodules https://github.com/gaiaaiagent/GAIA.git
cd GAIA
```

### 2. Update the Submodule

If the submodule wasn't cloned or needs updating:

```bash
cd packages/plugin-knowledge
git fetch origin
git checkout regenai-unified-fixes
git pull origin regenai-unified-fixes
```

### 3. Build the Plugin

The plugin must be built before use:

```bash
cd packages/plugin-knowledge
bun install
bun run build
```

### 4. Using in Character Files

Add the plugin to your character configuration:

```json
{
  "name": "YourAgent",
  "plugins": [
    "@elizaos/plugin-knowledge",  // Our forked version
    "@elizaos/plugin-mcp",         // For BGE semantic search
    // ... other plugins
  ],
  "settings": {
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "./knowledge"
  }
}
```

## Implementation Status

✅ **Completed**: Fork https://github.com/elizaos-plugins/plugin-knowledge to gaiaaiagent/plugin-knowledge  
✅ **Completed**: Apply deduplication and Ollama fixes to the fork  
✅ **Completed**: Update GAIA packages to use the forked version as git submodule  
✅ **Completed**: Add KOI system integration for enhanced statistics and monitoring  
✅ **Completed**: Test with multiple agents sharing knowledge base  

## Working with the Fork

### Check Status

```bash
cd packages/plugin-knowledge
git status                      # Check local changes
git remote -v                   # Verify remotes
git branch                       # Check current branch
```

### Make Changes

1. Create a feature branch:
```bash
git checkout -b feature/your-feature
```

2. Make your changes and test:
```bash
bun run build
bun test  # If tests exist
```

3. Push to the fork:
```bash
git add .
git commit -m "feat: your feature description"
git push origin feature/your-feature
```

4. Create a pull request on GitHub to merge into `regenai-unified-fixes`

### Sync with Upstream

To incorporate updates from the original plugin:

```bash
git remote add upstream https://github.com/elizaos-plugins/plugin-knowledge.git
git fetch upstream
git checkout regenai-unified-fixes
git merge upstream/main  # Or relevant branch
# Resolve any conflicts
git push origin regenai-unified-fixes
```

## BGE Semantic Search Integration

The plugin works with BGE embeddings through the MCP server (separate from the plugin):

1. **Plugin-Knowledge**: Handles document loading and basic RAG
2. **MCP Server**: Provides BGE semantic search capabilities
3. **Integration**: Agents use both for comprehensive knowledge access

See [KOI-PIPELINE-INTEGRATION.md](./KOI-PIPELINE-INTEGRATION.md) for complete BGE setup.

## Troubleshooting

### Plugin Not Found

If you get `Cannot find module '@elizaos/plugin-knowledge'`:

```bash
cd packages/plugin-knowledge
bun install
bun run build
```

### Submodule Issues

If the submodule is missing or broken:

```bash
# From GAIA root
git submodule update --init --recursive
```

### Build Errors

If the build fails:

```bash
cd packages/plugin-knowledge
rm -rf node_modules dist
bun install
bun run build
```

## Important Notes

1. **Never modify files directly in node_modules/** - Changes will be lost
2. **Always work in packages/plugin-knowledge/** - This is the git submodule
3. **The fork is necessary** - It contains critical fixes not in the original
4. **Keep the fork updated** - Regularly sync with upstream for security fixes
5. **Document significant changes** - Update this guide when making major modifications

## Changelog

### September 2, 2025
- Initial fork created with deduplication support
- Added Ollama embedding integration
- Fixed createUniqueUuid parameter bugs
- Fixed text split null reference errors
- Fixed report generation location to avoid recursive processing
- Achieved ~90% storage reduction for multi-agent deployments

### September 7, 2025
- Consolidated documentation from PLUGIN-KNOWLEDGE-CHANGES.md
- Clarified git submodule structure
- Removed outdated BGE embedding attempts
- Updated to use MCP server for BGE semantic search

## Related Documentation

- [KOI-COMPLETE-GUIDE.md](./KOI-COMPLETE-GUIDE.md) - KOI system overview
- [KOI-PIPELINE-INTEGRATION.md](./KOI-PIPELINE-INTEGRATION.md) - Complete pipeline setup
- [RAG_TROUBLESHOOTING_GUIDE.md](./RAG_TROUBLESHOOTING_GUIDE.md) - RAG debugging