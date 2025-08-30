# Plugin Development and Integration Guide

## Overview

This guide documents the patterns and practices for integrating external ElizaOS plugins into the GAIA project, based on learnings from integrating the Telegram and Knowledge plugins.

## Current Plugin Forks

The GAIA project uses custom forks of several ElizaOS plugins to ensure compatibility and add required features:

### 1. Plugin-Knowledge Fork
- **Fork URL**: `https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes`
- **Original**: `@elizaos/plugin-knowledge`
- **Reason**: Deduplication fixes, enhanced document processing, custom metadata handling
- **Key Features**: Content-based IDs (SHA-256), semantic similarity checking, source metadata preservation

### 2. Plugin-Telegram Fork  
- **Fork URL**: `https://github.com/gaiaaiagent/plugin-telegram.git#1.x`
- **Original**: `@elizaos/plugin-telegram` (community plugin)
- **Reason**: Version compatibility with ElizaOS 1.4.4, build fixes, custom configuration support
- **Key Features**: Multi-bot support, mention-only mode, improved error handling

## External Plugin Integration Pattern

### When to Fork a Plugin

Fork an external plugin when:
1. **Version Compatibility:** Plugin targets older ElizaOS version than your project
2. **Build Issues:** Plugin has TypeScript or build configuration problems
3. **Custom Requirements:** You need modifications not available upstream
4. **Maintenance:** Original plugin is unmaintained or slow to update
5. **Security:** Need to audit or modify plugin behavior for production use

### Fork Setup Process

#### 1. Create Fork
```bash
# Fork the original repository on GitHub
# Example: https://github.com/elizaos-plugins/plugin-telegram
# → https://github.com/gaiaaiagent/plugin-telegram
```

#### 2. Update Dependencies
```json
// package.json in your fork
{
  "dependencies": {
    "@elizaos/core": "^1.4.4",  // Match your project version
    // ... other deps
  }
}
```

#### 3. Fix Build Configuration
```typescript
// tsup.config.ts - Common fixes
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: false, // Disable if Plugin type exports cause issues
  sourcemap: true,
  clean: true,
});
```

#### 4. Test the Fork
```bash
cd your-fork
bun install
bun run build  # Should complete without errors
```

### Integration in Main Project

#### 1. Update package.json
```json
{
  "dependencies": {
    "@elizaos/plugin-knowledge": "https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes",
    "@elizaos/plugin-telegram": "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"
  }
}
```

#### 2. Install and Build
```bash
# Clean install to ensure fork is used
rm -rf node_modules bun.lock bun.lockb
bun install

# CRITICAL: Build plugin from source (if working in monorepo development)
cd node_modules/@elizaos/plugin-knowledge
bun run build
```

#### 3. Character Configuration
Follow the character schema requirements:
```json
{
  "plugins": ["@elizaos/plugin-knowledge", "@elizaos/plugin-telegram"],
  "settings": {
    // Plugin-specific config goes in settings, NOT at root level
    "clients": ["telegram"],
    "allowDirectMessages": true,
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "./knowledge",
    "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": true
  },
  "secrets": {
    // For single-process mode (recommended)
    "TELEGRAM_BOT_TOKEN": "your-bot-token-here"
  }
}
```

## Character Schema Requirements

### Core Schema Structure

The ElizaOS Character schema is **strict** and only allows specific root-level fields:

```typescript
interface Character {
  id?: UUID;
  name: string;           // Required
  username?: string;
  system?: string;
  templates?: Record<string, TemplateType>;
  bio: string | string[]; // Required
  messageExamples?: MessageExample[][];
  postExamples?: string[];
  topics?: string[];
  adjectives?: string[];
  knowledge?: (string | { path: string; shared?: boolean } | DirectoryItem)[];
  plugins?: string[];
  settings?: Record<string, any>;  // Flexible - plugin config goes here
  secrets?: Record<string, any>;   // API keys and sensitive config
  style?: StyleConfig;
}
```

### Plugin Configuration Guidelines

#### ✅ Correct Plugin Configuration
```json
{
  "name": "MyAgent",
  "bio": "Agent description",
  "plugins": ["@elizaos/plugin-knowledge", "@elizaos/plugin-telegram"],
  "settings": {
    // All plugin-specific config here
    "clients": ["telegram"],
    "allowDirectMessages": true,
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "./knowledge",
    "customOption": "value"
  },
  "secrets": {
    "TELEGRAM_BOT_TOKEN": "your-bot-token-here"
  }
}
```

#### ❌ Common Mistakes
```json
{
  "name": "MyAgent", 
  "clients": ["telegram"],      // ❌ Not allowed at root
  "allowDirectMessages": true,  // ❌ Not allowed at root
  "customOption": "value",      // ❌ Not allowed at root
  "plugins": ["@elizaos/plugin-telegram"]
}
```

### Debugging Character Validation

Enable debug logging to see validation errors:
```bash
# Look for character validation error messages
bun packages/cli/dist/index.js start --character your-character.json 2>&1 | grep -i "validation"
```

Common validation errors:
- `Unrecognized key(s) in object` - Move fields to `settings`
- `Character validation failed` - Check required fields (`name`, `bio`)
- `Failed to load character` - JSON syntax error

## Plugin Development Best Practices

### 1. Dependency Management
- Always use `workspace:*` for internal `@elizaos/` packages in monorepo
- Use specific versions for external dependencies
- Test compatibility with your ElizaOS version

### 2. Build Configuration
- Disable DTS generation if you encounter Plugin type export issues
- Use `bun` instead of `npm` for all operations
- Test builds in clean environment

### 3. Testing Integration
```bash
# Test character loading
bun packages/cli/dist/index.js start --character test-character.json

# Check plugin loading
grep -i "plugin.*loaded" logs/agent.log

# Verify service registration
grep -i "registered.*handler" logs/agent.log
```

### 4. Documentation
- Document fork reasons in README
- Include build-from-source requirements
- Provide character configuration examples
- Document troubleshooting steps

## ElizaOS Environment Variable System

### How ElizaOS Loads Environment Variables

ElizaOS automatically loads environment variables using a specific naming convention:

**Pattern:** `CHARACTER.{CHARACTER_NAME}.{SETTING_KEY}`

**Process:**
1. ElizaOS reads the `name` field from your character.json
2. Converts the name to match the exact character name (case-sensitive)
3. Scans environment variables for the pattern `CHARACTER.{NAME}.`
4. Automatically adds matching variables to the character's settings/secrets

### Character-Specific Environment Variables

```bash
# .env file - ElizaOS naming convention
CHARACTER.Governor.TELEGRAM_BOT_TOKEN=your-bot-token
CHARACTER.Governor.OPENAI_API_KEY=your-openai-key
CHARACTER.Governor.CUSTOM_SETTING=custom-value

# For character name "RegenAI" 
CHARACTER.RegenAI.DISCORD_BOT_TOKEN=your-discord-token
CHARACTER.RegenAI.API_KEY=your-api-key
```

```json
// Character file - no need to reference environment variables directly
{
  "name": "Governor",
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true
    // TELEGRAM_BOT_TOKEN and OPENAI_API_KEY automatically loaded from:
    // CHARACTER.Governor.TELEGRAM_BOT_TOKEN and CHARACTER.Governor.OPENAI_API_KEY
  }
}
```

### Priority Order
1. Character-specific environment variables (`CHARACTER.{NAME}.*`)
2. Character `settings` (explicit values)
3. Character `secrets`
4. Global environment variables
5. Default values

### Security Best Practices
- ✅ Use `CHARACTER.{NAME}.*` pattern for secure API keys
- ✅ Keep character files clean without hardcoded secrets  
- ✅ Character files can be safely committed to repositories
- ❌ Don't use `${VARIABLE}` syntax - ElizaOS doesn't support this
- ❌ Don't put API keys directly in character files

## Maintenance and Updates

### Keeping Forks Updated
```bash
# Add upstream remote
git remote add upstream https://github.com/original/plugin-repo.git

# Fetch upstream changes
git fetch upstream

# Merge or rebase upstream changes
git merge upstream/main
# or
git rebase upstream/main

# Push updates
git push origin your-branch
```

### Plugin Update Checklist
- [ ] Dependencies compatible with current ElizaOS version
- [ ] Build completes without errors
- [ ] Character validation passes
- [ ] Plugin loads and registers successfully
- [ ] Basic functionality works
- [ ] Documentation updated

## Common Patterns

### Service Registration
```typescript
// Plugin services automatically register with runtime
export default {
  name: "plugin-name",
  description: "Plugin description",
  services: [YourService],
  // ... other exports
};
```

### Character Access in Plugins
```typescript
// Access character configuration
const botToken = runtime.getSetting("TELEGRAM_BOT_TOKEN");
const allowDMs = runtime.getSetting("allowDirectMessages");

// Character schema fields
const agentName = runtime.character.name;
const agentBio = runtime.character.bio;
```

### Error Handling
```typescript
// Graceful degradation if plugin requirements not met
if (!botToken) {
  logger.warn("Plugin disabled - no API token provided");
  return null;
}
```

This pattern ensures plugins work even when not fully configured, preventing agent startup failures.

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Plugin Changes Not Taking Effect

**Symptom**: You modify plugin code, rebuild, but changes don't appear when running agents.

**Root Cause**: In development mode, plugins may be loaded from external directories or cached builds.

**Solutions**:

For **monorepo development**:
```bash
# After making changes in packages/plugin-knowledge/src/
cd /opt/projects/GAIA
bun run build

# If using external plugin directory (legacy setup)
cp -f packages/plugin-knowledge/dist/index.js /opt/projects/plugin-knowledge/dist/index.js

# Restart agents
sudo pkill -f 'packages/cli/dist/index.js'
bash /opt/projects/GAIA/start-all-agents-single-process.sh
```

For **fork development**:
```bash
# Make changes in your fork
cd node_modules/@elizaos/plugin-knowledge
# Make your changes
bun run build

# Restart agents
sudo pkill -f 'packages/cli/dist/index.js'
bash start-all-agents-single-process.sh
```

#### 2. "Already Exists - Skipping" But Fragments Still Created

**Symptom**: Logs show "already exists - skipping" but then "X fragments created"

**Root Cause**: The document IS being skipped (no new fragments created). The log message is just reporting the count of existing fragments.

**Solution**: This is expected behavior with our knowledge plugin fork. The plugin returns the count of existing fragments when a document is skipped for transparency.

#### 3. Plugin Version Compatibility Issues

**Symptom**: Plugin fails to load with TypeScript errors or missing dependencies

**Root Cause**: Plugin expects different ElizaOS version than your project uses

**Solutions**:
1. **Use our tested forks** (recommended):
   ```json
   {
     "dependencies": {
       "@elizaos/plugin-knowledge": "https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes",
       "@elizaos/plugin-telegram": "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"
     }
   }
   ```

2. **Update plugin dependencies** in your fork:
   ```json
   {
     "dependencies": {
       "@elizaos/core": "^1.4.4"
     }
   }
   ```

#### 4. Telegram Bot Token Issues

**Symptom**: "401: Unauthorized" errors with Telegram bots

**Common Causes & Solutions**:

1. **Invalid or expired bot tokens**
   - Get fresh tokens from @BotFather on Telegram
   - Test token with curl: `curl https://api.telegram.org/bot<TOKEN>/getMe`

2. **Token not reaching the plugin**
   - Add to character `secrets` section (single-process mode)
   - Or use `CHARACTER.{NAME}.TELEGRAM_BOT_TOKEN` environment variable

3. **Using wrong plugin version**
   - Ensure using our fork: `@elizaos/plugin-telegram": "github.com/gaiaaiagent/plugin-telegram.git#1.x"`

#### 5. Finding Where Plugin Is Actually Loaded From

**Symptom**: Not sure which version of plugin is being executed.

**Solution**: Add temporary logging to trace plugin loading:

```typescript
// In packages/cli/src/utils/load-plugin.ts (if developing)
if (repository.includes('knowledge') || repository.includes('telegram')) {
  console.log(`[PLUGIN-LOAD] Loading ${repository} from: ${importPath}`);
}
```

Then rebuild CLI and check logs:
```bash
bun run build:cli
# Run agent and check console for [PLUGIN-LOAD]
```

#### 6. Old Code Still Running After Changes

**Symptom**: Made changes but old behavior persists.

**Possible Causes & Solutions**:

1. **Bun cache**: Clear it
   ```bash
   rm -rf ~/.bun/install/cache/*
   bun install
   ```

2. **Build not updated**: Rebuild properly
   ```bash
   cd /opt/projects/GAIA
   bun run build
   ```

3. **Agent not restarted**: Kill and restart
   ```bash
   sudo pkill -f 'packages/cli/dist/index.js'
   bash start-all-agents-single-process.sh
   ```

#### 7. Database Duplicate Issues

**Symptom**: Same document processed multiple times creating duplicate fragments.

**Solution**: Our knowledge plugin fork uses content-based IDs (SHA-256 hash of content) to detect exact duplicates and checks semantic similarity using pgvector for near-duplicates.

To clean existing duplicates:
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

### Testing Plugin Changes in Isolation

**Best Practice**: Test changes with a minimal character before deploying to production.

Create test character (`/tmp/test.json`):
```json
{
  "name": "PluginTest",
  "username": "plugintest",
  "plugins": ["@elizaos/plugin-bootstrap", "@elizaos/plugin-openai", "@elizaos/plugin-knowledge"],
  "settings": {
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "/tmp/test-knowledge"
  },
  "bio": "Test agent for plugin development"
}
```

Test:
```bash
mkdir -p /tmp/test-knowledge
echo "Test content for plugin validation" > /tmp/test-knowledge/test.md

cd /opt/projects/GAIA
bun packages/cli/dist/index.js start --character /tmp/test.json
```

### Quick Diagnostic Commands

```bash
# Check if agents are running
ps aux | grep -E "bun.*cli/dist" | grep -v grep

# Check which plugins are installed
bun list | grep -E "plugin-(knowledge|telegram)"

# Find where plugins are installed
find . -name "*plugin-knowledge*" -o -name "*plugin-telegram*" -type d 2>/dev/null

# View recent logs
tail -100 logs/*.log

# Check database for documents
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, metadata FROM memories WHERE type = 'documents' LIMIT 5;"

# Test plugin functionality
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"message": "test knowledge query"}'
```

### Build & Deploy Checklist for Plugin Development

- [ ] Make changes in correct location (fork repo or monorepo packages/)
- [ ] Build plugin: `bun run build`
- [ ] If using external plugin directory: Copy built files
- [ ] Kill agents: `sudo pkill -f 'packages/cli/dist'`
- [ ] Restart agents: `bash start-all-agents-single-process.sh`
- [ ] Check logs for expected behavior: `tail -f logs/*.log`
- [ ] Test functionality with simple queries
- [ ] If not working, check this troubleshooting guide!

### Performance Considerations

1. **Memory Usage**: Knowledge plugin with `LOAD_DOCS_ON_STARTUP: true` requires sufficient RAM
2. **Startup Time**: Loading large knowledge bases can take several minutes
3. **Database Performance**: Ensure pgvector extension is properly configured
4. **Concurrent Processing**: Limit simultaneous document processing to avoid memory issues

---

*This guide is based on real-world experience integrating plugins in the GAIA project. Keep it updated as new patterns emerge.*