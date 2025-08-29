# Plugin Troubleshooting Guide

## Common Issues & Solutions

### 1. Plugin Changes Not Taking Effect

**Symptom**: You modify plugin code, rebuild, but changes don't appear when running agents.

**Root Cause**: Plugins are loaded from `/opt/projects/plugin-knowledge/`, not from the monorepo at `/opt/projects/GAIA-direct/packages/`.

**Solution**:
```bash
# After building in monorepo
cd /opt/projects/GAIA-direct/packages/plugin-knowledge
bun run build

# CRITICAL: Copy to external plugin directory
cp -f dist/index.js /opt/projects/plugin-knowledge/dist/index.js

# Restart agents
pkill -f 'packages/cli/dist/index.js'
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

### 2. "Already Exists - Skipping" But Fragments Still Created

**Symptom**: Logs show "already exists - skipping" but then "X fragments created"

**Root Cause**: The document IS being skipped (no new fragments created). The log message is just reporting the count of existing fragments.

**Solution**: This is expected behavior. The plugin returns the count of existing fragments when a document is skipped. We've updated the log message to say "fragments (document loaded)" instead of "fragments created" for clarity.

### 3. Finding Where Plugin Is Actually Loaded From

**Symptom**: Not sure which version of plugin is being executed.

**Solution**: Add temporary logging to trace plugin loading:

```typescript
// In /opt/projects/GAIA-direct/packages/cli/src/utils/load-plugin.ts
if (repository.includes('knowledge')) {
  logger.info(`[PLUGIN-LOAD] Loading from: ${importPath}`);
}
```

Then rebuild CLI and check logs:
```bash
bun run build:cli
# Run agent and check logs for [PLUGIN-LOAD]
```

### 4. Old Code Still Running After Changes

**Symptom**: Made changes but old behavior persists.

**Possible Causes & Solutions**:

1. **Bun cache**: Clear it
   ```bash
   rm -rf ~/.bun/install/cache/*
   ```

2. **Wrong build location**: Ensure you're building in monorepo
   ```bash
   cd /opt/projects/GAIA-direct
   bun run build
   ```

3. **Not copied to external dir**: This is the most common issue
   ```bash
   cp -f packages/plugin-knowledge/dist/index.js /opt/projects/plugin-knowledge/dist/index.js
   ```

4. **Agent not restarted**: Kill and restart
   ```bash
   pkill -f 'bun.*index.js'
   ```

### 5. Testing Plugin Changes in Isolation

**Best Practice**: Test changes with a minimal character before deploying to production.

Create test character (`/tmp/test.json`):
```json
{
  "name": "PluginTest",
  "username": "plugintest",
  "plugins": ["@elizaos/plugin-bootstrap", "@elizaos/plugin-sql", "@elizaos/plugin-openai", "@elizaos/plugin-knowledge"],
  "settings": {
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "/tmp/test-knowledge"
  }
}
```

Test:
```bash
mkdir -p /tmp/test-knowledge
echo "Test content" > /tmp/test-knowledge/test.md

cd /opt/projects/GAIA-direct
bun packages/cli/dist/index.js start --character /tmp/test.json
```

### 6. Database Duplicate Issues

**Symptom**: Same document processed multiple times creating duplicate fragments.

**Solution**: The knowledge plugin now uses content-based IDs (SHA-256 hash of content) to detect exact duplicates. It also checks semantic similarity using pgvector for near-duplicates.

To clean duplicates:
```sql
-- Connect to database
docker exec -it gaia-postgres-1 psql -U postgres -d eliza

-- Find duplicate documents
SELECT content->>'text', COUNT(*) 
FROM memories 
WHERE type = 'documents' 
GROUP BY content->>'text' 
HAVING COUNT(*) > 1;

-- Remove duplicates (keep oldest)
DELETE FROM memories a
USING memories b
WHERE a.id > b.id 
  AND a.content->>'text' = b.content->>'text'
  AND a.type = 'documents';
```

## Quick Diagnostic Commands

```bash
# Check if agents are running
ps aux | grep -E "bun.*cli/dist" | grep -v grep

# Find where plugin is installed
find /opt/projects -name "plugin-knowledge" -type d 2>/dev/null

# Check plugin version (look for your changes)
grep "your-unique-string" /opt/projects/plugin-knowledge/dist/index.js

# View recent logs
tail -100 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Check database for documents
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, metadata FROM memories WHERE type = 'documents' LIMIT 5;"
```

## Build & Deploy Checklist

- [ ] Make changes in `/opt/projects/GAIA-direct/packages/plugin-knowledge/src/`
- [ ] Build plugin: `bun run build`
- [ ] Copy to external: `cp -f dist/index.js /opt/projects/plugin-knowledge/dist/index.js`
- [ ] Kill agents: `pkill -f 'packages/cli/dist'`
- [ ] Restart agents: `bash start-agents-hybrid.sh`
- [ ] Check logs for expected behavior
- [ ] If not working, check this troubleshooting guide!

---

*Created after debugging session on Aug 2024 where we discovered the external plugin directory issue*