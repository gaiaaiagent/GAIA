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

### 1. Knowledge Deduplication
- Content-based SHA-256 hashing prevents duplicate document storage
- Multiple agents can share the same knowledge base without duplication
- First agent creates embeddings, subsequent agents create lightweight references

### 2. Rate Limiting Fixes
- Improved handling of large document batches
- Prevents overwhelming the embedding API with too many concurrent requests

### 3. Source Metadata Preservation
- Automatically detects and preserves document sources (notion, twitter, discord, etc.)
- Maintains provenance tracking through the KOI system

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

## Related Documentation

- [KOI-COMPLETE-GUIDE.md](./KOI-COMPLETE-GUIDE.md) - KOI system overview
- [KOI-PIPELINE-INTEGRATION.md](./KOI-PIPELINE-INTEGRATION.md) - Complete pipeline setup
- [RAG_TROUBLESHOOTING_GUIDE.md](./RAG_TROUBLESHOOTING_GUIDE.md) - RAG debugging