# Plugin Development and Integration Guide

## Overview

This guide documents the patterns and practices for integrating external ElizaOS plugins into the GAIA project, based on learnings from integrating the Telegram plugin.

## External Plugin Integration Pattern

### When to Fork a Plugin

Fork an external plugin when:
1. **Version Compatibility:** Plugin targets older ElizaOS version than your project
2. **Build Issues:** Plugin has TypeScript or build configuration problems
3. **Custom Requirements:** You need modifications not available upstream
4. **Maintenance:** Original plugin is unmaintained or slow to update

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
    "@elizaos/core": "^1.4.2",  // Match your project version
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
    "@elizaos/plugin-name": "https://github.com/your-org/plugin-name.git#branch-name"
  }
}
```

#### 2. Install and Build
```bash
# Clean install to ensure fork is used
rm -rf node_modules bun.lock
bun install

# CRITICAL: Build plugin from source
cd node_modules/@elizaos/plugin-name
bun run build
```

#### 3. Character Configuration
Follow the character schema requirements (see Telegram example):
```json
{
  "plugins": ["@elizaos/plugin-name"],
  "settings": {
    // Plugin-specific config goes in settings, NOT at root level
    "PLUGIN_API_KEY": "${PLUGIN_API_KEY}",
    "pluginSpecificOption": true
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
  secrets?: Record<string, any>;
  style?: StyleConfig;
}
```

### Plugin Configuration Guidelines

#### ✅ Correct Plugin Configuration
```json
{
  "name": "MyAgent",
  "bio": "Agent description",
  "plugins": ["@elizaos/plugin-example"],
  "settings": {
    // All plugin-specific config here
    "API_KEY": "${API_KEY}",
    "clients": ["telegram"],
    "allowDirectMessages": true,
    "customOption": "value"
  },
  "secrets": {}
}
```

#### ❌ Common Mistakes
```json
{
  "name": "MyAgent", 
  "clients": ["telegram"],      // ❌ Not allowed at root
  "allowDirectMessages": true,  // ❌ Not allowed at root
  "customOption": "value",      // ❌ Not allowed at root
  "plugins": ["@elizaos/plugin-example"]
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
2. Converts the name to UPPERCASE and replaces spaces with underscores
3. Scans environment variables for the pattern `CHARACTER.{NAME}.`
4. Automatically adds matching variables to the character's settings/secrets

### Character-Specific Environment Variables

```bash
# .env file - ElizaOS naming convention
CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN=your-bot-token
CHARACTER.GOVERNOR.OPENAI_API_KEY=your-openai-key
CHARACTER.GOVERNOR.CUSTOM_SETTING=custom-value

# For character name "My Agent" → "MY_AGENT"  
CHARACTER.MY_AGENT.DISCORD_BOT_TOKEN=your-discord-token
CHARACTER.MY_AGENT.API_KEY=your-api-key
```

```json
// Character file - no need to reference environment variables directly
{
  "name": "Governor",
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true
    // TELEGRAM_BOT_TOKEN and OPENAI_API_KEY automatically loaded from:
    // CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN and CHARACTER.GOVERNOR.OPENAI_API_KEY
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