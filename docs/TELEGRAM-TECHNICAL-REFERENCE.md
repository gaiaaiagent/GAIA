# Telegram Bot Technical Reference

## Architecture Overview

The RegenAI Telegram integration uses a **forked version** of ElizaOS's `@elizaos/plugin-telegram` to connect AI agents to Telegram. Each agent runs as a native bun process and maintains its own Telegram bot connection.

### 🚨 IMPORTANT: We Use a Custom Fork

**Why we forked the plugin:**
- Original plugin was designed for ElizaOS v1.0.19, but we run ElizaOS v1.4.2
- Needed dependency updates for compatibility
- Required build configuration changes (disabled DTS generation due to type conflicts)

**Our fork:** https://github.com/gaiaaiagent/plugin-telegram  
**Branch:** `1.x`  
**Integration:** Used via GitHub URL in package.json

## Current Implementation Status

### ✅ Configured Agents:
- **RegenAI** (Port 3000) - Primary agent with Telegram integration
- **Facilitator** (Port 3001) - Community facilitator  
- **Voice of Nature** (Port 3002) - Philosophical guide
- **Governor** (Port 3003) - Governance expert
- **Narrative** (Port 3004) - Storyteller

### 🔧 Bot Token Configuration:

Each agent requires a unique Telegram bot token to avoid 409 Conflict errors.

**Environment Variables (in `/opt/projects/GAIA-direct/.env`):**

ElizaOS uses a specific naming convention: `CHARACTER.{CHARACTER_NAME}.{SETTING_KEY}`

```bash
# RegenAI bot (character name: "RegenAI")
CHARACTER.REGENAI.TELEGRAM_BOT_TOKEN=<your-regenai-bot-token>
CHARACTER.REGENAI.OPENAI_API_KEY=<your-openai-key>

# Facilitator bot (character name: "Facilitator") 
CHARACTER.FACILITATOR.TELEGRAM_BOT_TOKEN=<your-facilitator-bot-token>
CHARACTER.FACILITATOR.OPENAI_API_KEY=<your-openai-key>

# Narrative bot (character name: "Narrative")
CHARACTER.NARRATIVE.TELEGRAM_BOT_TOKEN=<your-narrative-bot-token>
CHARACTER.NARRATIVE.OPENAI_API_KEY=<your-openai-key>

# Voice of Nature bot (character name: "Voice of Nature" -> "VOICE_OF_NATURE")
CHARACTER.VOICE_OF_NATURE.TELEGRAM_BOT_TOKEN=<your-voiceofnature-bot-token>
CHARACTER.VOICE_OF_NATURE.OPENAI_API_KEY=<your-openai-key>

# Governor bot (character name: "Governor")
CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN=<your-governor-bot-token>
CHARACTER.GOVERNOR.OPENAI_API_KEY=<your-openai-key>
```

## Plugin Installation and Configuration

### Step 1: Install the Forked Plugin

The telegram plugin **MUST be built from source** after installation:

```bash
# 1. Install from our fork (done automatically by package.json)
bun install

# 2. CRITICAL: Build the plugin from source
cd node_modules/@elizaos/plugin-telegram
bun run build

# 3. Restart agents to load the updated plugin
pkill -f 'packages/cli/dist/index.js start'
bash start-agents-hybrid.sh
```

**Package.json Configuration:**
```json
{
  "dependencies": {
    "@elizaos/plugin-telegram": "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"
  }
}
```

## Character Configuration

### 🚨 CRITICAL: ElizaOS Environment Variable System

ElizaOS automatically loads environment variables using the pattern: `CHARACTER.{CHARACTER_NAME}.{SETTING_KEY}`

**How it works:**
1. ElizaOS reads your character's `name` field
2. Converts it to UPPERCASE and replaces spaces with underscores
3. Looks for environment variables starting with `CHARACTER.{NAME}.`
4. Automatically adds these to your character's settings/secrets

**Example:** For a character named "Governor":
- `CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN` → automatically available as `TELEGRAM_BOT_TOKEN`
- `CHARACTER.GOVERNOR.OPENAI_API_KEY` → automatically available as `OPENAI_API_KEY`

### 🚨 CRITICAL: Schema Requirements

ElizaOS has **strict character schema validation**. The following fields MUST be placed correctly:

**❌ WRONG (causes validation failure):**
```json
{
  "name": "AgentName",
  "clients": ["telegram"],           // ❌ NOT allowed at root level
  "allowDirectMessages": true,       // ❌ NOT allowed at root level
  "plugins": ["@elizaos/plugin-telegram"]
}
```

**✅ CORRECT:**
```json
{
  "name": "AgentName",
  "username": "agentname",
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-sql",
    "@elizaos/plugin-openai",
    "@elizaos/plugin-knowledge", 
    "@elizaos/plugin-telegram"
  ],
  "settings": {
    "clients": ["telegram"],           // ✅ Must be in settings
    "allowDirectMessages": true,       // ✅ Must be in settings
    "LOAD_DOCS_ON_STARTUP": true,
    "KNOWLEDGE_PATH": "./knowledge"
    // API keys automatically loaded from CHARACTER.AGENTNAME.* environment variables
  },
  "secrets": {},
  "bio": ["Agent description for Telegram users"],
  "lore": ["Background information"],
  "messageExamples": [
    [
      {
        "user": "{{user1}}",
        "content": {
          "text": "Example user message"
        }
      },
      {
        "user": "AgentName", 
        "content": {
          "text": "Example agent response"
        }
      }
    ]
  ],
  "postExamples": ["Example posts the agent might make"],
  "adjectives": ["personality", "traits"],
  "people": ["Known entities the agent references"],
  "topics": ["Areas of expertise"],
  "style": {
    "all": ["Communication style guidelines"],
    "chat": ["Telegram-specific style notes"],
    "post": ["Public posting style"]
  }
}
```

### Advanced Configuration Options:

```json
{
  "clients": ["telegram"],
  "allowDirectMessages": true,
  "shouldOnlyJoinInAllowedGroups": false,
  "allowedGroupIds": ["-123456789", "-987654321"],
  "messageTrackingLimit": 100,
  "templates": {
    "telegramMessageHandlerTemplate": "Custom template for responses"
  }
}
```

## Creating New Telegram Bots

### Step 1: Create Bot with BotFather
1. Message `@BotFather` on Telegram
2. Send `/newbot`
3. Follow prompts to name your bot
4. Save the bot token

### Step 2: Configure Character File
1. Add bot token to character configuration
2. Include `"telegram"` in clients array
3. Add `@elizaos/plugin-telegram` to plugins
4. Configure personality and examples for Telegram context

### Step 3: Update Environment
1. Add bot token to `.env` file
2. Update startup script if using environment variable references
3. Restart the specific agent

### Step 4: Test Integration
```bash
# Check if agent is running with Telegram
ps aux | grep "bun.*packages/cli.*AgentName"

# Check agent logs for Telegram connection
tail -f /opt/projects/GAIA-direct/logs/agentname.log | grep -i telegram
```

## Troubleshooting Guide

### Character Validation Failures

**Problem:** `Character validation failed: Unrecognized key(s) in object: 'clients', 'allowDirectMessages'`

**Root Cause:** These fields are not part of the core Character schema and cannot be at the root level.

**Solution:** Move `clients` and `allowDirectMessages` to the `settings` object:

```json
{
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true
  }
}
```

### Plugin Not Found Errors

**Problem:** `Cannot find module '@elizaos/plugin-telegram'`

**Solutions:**
1. **Check package.json:** Ensure the plugin is listed with our fork URL
2. **Clean install:** `rm -rf node_modules bun.lock && bun install`
3. **Build from source:** `cd node_modules/@elizaos/plugin-telegram && bun run build`

### No Response from Bot

**Problem:** Bot receives messages but doesn't respond

**Common Causes:**
1. **Missing OpenAI API Key:** Bot can't generate responses without AI model access
   ```bash
   # Check logs for: "⚠️ OPENAI_API_KEY not found in process.env"
   ```
   
2. **Settings State Errors:** `No settings state found for server undefined`
   - Usually resolves after first successful message processing

**Solutions:**
1. Add `OPENAI_API_KEY` to environment variables or character settings
2. Ensure bot token is correctly configured
3. Check agent logs for specific error messages

### Build/Compatibility Issues

**Problem:** TypeScript errors during plugin build

**Solution:** Our fork disables DTS generation to avoid type conflicts:
```typescript
// tsup.config.ts
export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  dts: false, // Disabled to avoid Plugin type export issues
  ...
});
```

## Common Issues and Solutions

### 409 Conflict Error
**Problem:** Multiple agents using same bot token
```
error: 409: Conflict: terminated by other getUpdates request
```

**Solution:** Each agent needs its own unique bot token
- Create separate bot with @BotFather for each agent
- Use different environment variable names
- Verify no duplicate tokens in configuration

### Agent Not Responding in Telegram
**Checklist:**
1. ✅ Bot token is correct in character config
2. ✅ Agent process is running (`ps aux | grep bun`)
3. ✅ No 409 conflicts in logs
4. ✅ Telegram plugin is included in character config
5. ✅ Bot has been started in Telegram (`/start` command)

### Message Handling Issues
**Debug Commands:**
```bash
# Check agent logs for Telegram activity
tail -f /opt/projects/GAIA-direct/logs/regenai.log | grep -i telegram

# Test bot token validity
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Check webhook status
curl "https://api.telegram.org/bot<TOKEN>/getWebhookInfo"
```

## Best Practices

### Security
- ✅ Keep bot tokens in environment variables, never commit to git
- ✅ Use different tokens for development vs production
- ✅ Regularly rotate tokens for production bots
- ✅ Configure `allowedGroupIds` for production bots in sensitive groups

### Performance  
- ✅ Set appropriate `messageTrackingLimit` based on usage
- ✅ Monitor agent logs for performance issues
- ✅ Use specific character examples for Telegram context
- ✅ Implement rate limiting if needed

### User Experience
- ✅ Include clear bot descriptions and capabilities
- ✅ Provide helpful error messages
- ✅ Use consistent personality across different platforms
- ✅ Include `/help` command responses

## Development Workflow

### Adding Telegram to Existing Agent:
```bash
# 1. Create new bot with @BotFather
# 2. Add token to .env file
echo "TELEGRAM_BOT_TOKEN_NEWAGENT=your-new-token" >> /opt/projects/GAIA-direct/.env

# 3. Update character configuration
# Add telegram client and plugin to character.json

# 4. Restart specific agent
pkill -f "character-name.character.json"
bash /opt/projects/GAIA/scripts/start-all-agents.sh

# 5. Test integration
tail -f /opt/projects/GAIA-direct/logs/agent.log
```

### Testing New Bot:
1. Send `/start` to bot in Telegram
2. Ask test questions relevant to agent's expertise
3. Check logs for proper message handling
4. Test group functionality if applicable
5. Verify response quality and personality consistency

## Monitoring and Maintenance

### Health Checks:
```bash
# Check all agents are running
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

# Check Telegram plugin loading
grep -r "Telegram" /opt/projects/GAIA-direct/logs/*.log | tail -10

# Test bot responsiveness
curl "https://api.telegram.org/bot<TOKEN>/getMe"
```

### Log Analysis:
```bash
# Telegram-specific logs
grep -i "telegram" /opt/projects/GAIA-direct/logs/*.log

# Message handling logs
grep -i "message" /opt/projects/GAIA-direct/logs/*.log | grep -i telegram

# Error patterns
grep -E "(error|fail)" /opt/projects/GAIA-direct/logs/*.log | grep -i telegram
```

## Integration with Other Systems

### KOI System Integration:
- Telegram messages are tracked in KOI system
- Agent interactions are logged with RID identifiers
- Statistics available at https://regen.gaiaai.xyz/koi/

### Database Integration:
- Telegram conversations stored in PostgreSQL
- Message history maintained per agent
- User interactions tracked across platforms

### Knowledge Base Integration:
- Agents access full Regen knowledge base (600+ documents)
- Real-time querying of Regen Registry data
- Cross-platform consistency in responses

## Future Enhancements

### Planned Features:
- Button-based interactions for complex workflows
- File sharing and document processing
- Voice message support
- Group moderation capabilities
- Integration with calendar and scheduling

### Technical Improvements:
- Enhanced error handling and recovery
- Better rate limiting and message queuing
- Webhook-based message handling for improved performance
- Advanced analytics and usage tracking

---

## Quick Reference Commands

```bash
# Create new bot with BotFather
# Message @BotFather: /newbot

# Add telegram to character
# Edit character.json: add "telegram" to clients array

# Test bot token
curl "https://api.telegram.org/bot<TOKEN>/getMe"

# Check agent logs
tail -f /opt/projects/GAIA-direct/logs/agentname.log

# Restart agent
pkill -f "agentname.character.json" && bash /opt/projects/GAIA/scripts/start-all-agents.sh
```

---

*For additional technical support or questions about the Telegram integration, refer to the ElizaOS documentation or contact the development team.*