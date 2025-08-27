# Telegram Bot Technical Reference

## Architecture Overview

The RegenAI Telegram integration uses ElizaOS's `@elizaos/plugin-telegram` to connect AI agents to Telegram. Each agent runs as a native bun process and maintains its own Telegram bot connection.

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
```bash
# Primary RegenAI bot
TELEGRAM_BOT_TOKEN=<your-regenai-bot-token>

# Facilitator bot  
TELEGRAM_BOT_TOKEN_ADVOCATE=<your-facilitator-bot-token>

# Narrative bot
TELEGRAM_BOT_TOKEN_NARRATIVE=<your-narrative-bot-token>

# Voice of Nature bot
TELEGRAM_BOT_TOKEN_VOICEOFNATURE=<your-voiceofnature-bot-token>

# Governor bot
TELEGRAM_BOT_TOKEN_GOVERNOR=<your-governor-bot-token>
```

## Character Configuration

### Basic Telegram Configuration Template:

```json
{
  "name": "AgentName",
  "clients": ["telegram"],
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-telegram"
  ],
  "settings": {
    "secrets": {
      "TELEGRAM_BOT_TOKEN": "<bot-token>"
    }
  },
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
bash /opt/projects/GAIA/start-all-agents.sh

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
pkill -f "agentname.character.json" && bash /opt/projects/GAIA/start-all-agents.sh
```

---

*For additional technical support or questions about the Telegram integration, refer to the ElizaOS documentation or contact the development team.*