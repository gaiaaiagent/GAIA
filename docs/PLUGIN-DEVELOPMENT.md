# Plugin Development & Testing Guide

## Critical Discovery: Plugin Loading Locations

**⚠️ IMPORTANT:** The RegenAI agents load plugins from TWO different locations:

1. **External Plugin Directory**: `/opt/projects/plugin-knowledge/`
   - This is where plugins are ACTUALLY loaded from at runtime
   - Separate repository from the main ElizaOS fork
   
2. **Monorepo Packages**: `/opt/projects/GAIA-direct/packages/plugin-knowledge/`
   - This is where you develop and build plugins
   - Part of the forked ElizaOS codebase

### Why This Matters

When you modify a plugin in the monorepo, the changes won't take effect unless you copy the built files to the external directory. This can cause hours of confusion if you don't know about it!

## Complete Build & Test Process

### 1. Modify Plugin Code

```bash
# Navigate to the plugin in the monorepo
cd /opt/projects/GAIA-direct/packages/plugin-knowledge

# Edit source files
vim src/service.ts
```

### 2. Build the Plugin

```bash
# Build just the plugin
cd /opt/projects/GAIA-direct/packages/plugin-knowledge
bun run build

# OR build everything (slower but ensures consistency)
cd /opt/projects/GAIA-direct
bun run build
```

### 3. Deploy to Runtime Location

**This is the critical step most people miss!**

```bash
# Copy built plugin to external directory where agents load from
cp -f /opt/projects/GAIA-direct/packages/plugin-knowledge/dist/index.js \
      /opt/projects/plugin-knowledge/dist/index.js

# For other plugins, check where they're loaded from:
ps aux | grep bun | grep packages/cli
# Then check the logs to see the actual load path
```

### 4. Restart Agents

Agents must be restarted to load the new plugin code:

```bash
# Check running agents
ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep

# Stop agents
pkill -f 'packages/cli/dist/index.js start'

# Restart (example for test)
cd /opt/projects/GAIA-direct
bun packages/cli/dist/index.js start --character /tmp/test-character.json

# For production agents
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

## Testing Changes

### Create a Test Character

```json
{
  "name": "TestAgent",
  "username": "testagent",
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-sql", 
    "@elizaos/plugin-openai",
    "@elizaos/plugin-knowledge"
  ],
  "settings": {
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "/tmp/test-knowledge"
  }
}
```

### Run Isolated Test

```bash
# Create test knowledge directory
mkdir -p /tmp/test-knowledge
echo "Test content" > /tmp/test-knowledge/test.md

# Run test agent
cd /opt/projects/GAIA-direct
timeout 60 bun packages/cli/dist/index.js start \
  --character /tmp/test-character.json 2>&1 | tee /tmp/test.log

# Check logs for your changes
grep "Your debug message" /tmp/test.log
```

## Debugging Plugin Loading

### Find Where Plugin Is Loaded From

Add this to `/opt/projects/GAIA-direct/packages/cli/src/utils/load-plugin.ts`:

```typescript
if (repository.includes('knowledge')) {
  logger.info(`[PLUGIN-LOAD] Knowledge plugin loaded from: ${importPath}`);
}
```

Then rebuild CLI and check logs:

```bash
cd /opt/projects/GAIA-direct
bun run build:cli
```

### Common Issues & Solutions

#### Changes Not Taking Effect

1. **Check where plugin is actually loaded from:**
   ```bash
   grep "Successfully loaded plugin" /path/to/logs
   ```

2. **Verify the external plugin directory has your changes:**
   ```bash
   grep "your-new-code" /opt/projects/plugin-knowledge/dist/index.js
   ```

3. **Clear Bun cache if needed:**
   ```bash
   rm -rf ~/.bun/install/cache/*
   ```

#### Old Code Still Running

This usually means:
- Plugin is loaded from external directory, not monorepo
- Bun has cached an old version
- Agent wasn't properly restarted

Solution:
```bash
# Kill all agents
pkill -f 'bun.*index.js'

# Clear cache
rm -rf ~/.bun/install/cache/*

# Copy latest build
cp -f /opt/projects/GAIA-direct/packages/plugin-knowledge/dist/index.js \
      /opt/projects/plugin-knowledge/dist/index.js

# Restart
```

## Plugin Architecture Notes

### Knowledge Plugin Deduplication

The knowledge plugin now includes deduplication to prevent duplicate documents:

1. **Exact Match**: Uses content-based SHA-256 hash IDs
2. **Semantic Similarity**: Uses pgvector to find similar documents (>95% similarity)
3. **Returns Early**: When duplicate found, returns existing fragment count

### Key Files

- **Service**: `src/service.ts` - Main knowledge service with deduplication logic
- **Loader**: `src/docs-loader.ts` - Loads documents from filesystem
- **Processor**: `src/document-processor.ts` - Processes documents into fragments

## Quick Reference Commands

```bash
# Build plugin
cd /opt/projects/GAIA-direct/packages/plugin-knowledge && bun run build

# Deploy to runtime
cp -f dist/index.js /opt/projects/plugin-knowledge/dist/index.js

# Test changes
cd /opt/projects/GAIA-direct
bun packages/cli/dist/index.js start --character /tmp/test-character.json

# Check logs
tail -f /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Restart production agents
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

## Important Paths

- **Development**: `/opt/projects/GAIA-direct/packages/`
- **Runtime Plugins**: `/opt/projects/plugin-knowledge/`
- **Agent Configs**: `/opt/projects/GAIA/characters/`
- **Knowledge**: `/opt/projects/GAIA/knowledge/`
- **Logs**: `/opt/projects/GAIA-direct/logs/`

---

*Last Updated: August 2024*
*Critical Discovery: External plugin directory issue found during deduplication debugging*