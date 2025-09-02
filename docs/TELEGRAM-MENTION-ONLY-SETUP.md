# Telegram Bot Setup with Mention-Only Mode

This guide explains how to set up ElizaOS agents with Telegram bots that only respond when mentioned directly.

## Features

- **Mention-Only Response**: Bot only responds when:
  - Mentioned directly with @username
  - Receiving direct messages (DMs)
  - Random chance (configurable rate)
- **Multi-Agent Support**: Each agent can have its own Telegram bot
- **Configurable Response Rate**: Set random response probability

## Prerequisites

1. **PostgreSQL Database**
   ```bash
   # Install PostgreSQL if not already installed
   brew install postgresql@14
   brew services start postgresql@14
   
   # Create database
   createdb eliza
   ```

2. **OpenAI API Key**
   - Get from https://platform.openai.com/api-keys
   - Add to `.env` file (see below)

3. **Telegram Bot Token**
   - Create bot via @BotFather on Telegram
   - Use `/newbot` command
   - Save the token and username

## Quick Setup

### 1. Configure Environment Variables

Add to `.env` file:
```bash
# Required for text generation
OPENAI_API_KEY=your-openai-api-key-here

# Database connection
POSTGRES_URL=postgresql://yourusername@localhost:5432/eliza

# Optional: Add bot token here (or in character file)
TELEGRAM_BOT_TOKEN=your-bot-token-here
```

### 2. Create Character File

Use the template at `characters/test-telegram.character.json.template`:

```json
{
  "name": "YourAgentName",
  "username": "youragentusername",
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-sql",
    "@elizaos/plugin-openai",
    "@elizaos/plugin-telegram"
  ],
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true,
    "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": true,
    "TELEGRAM_RANDOM_RESPONSE_RATE": "0.05",
    "TELEGRAM_BOT_USERNAME": "YourBotUsername"
  },
  "secrets": {
    "TELEGRAM_BOT_TOKEN": "your-bot-token-here"
  }
}
```

### 3. Start the Agent(s)

#### Single Agent
```bash
# Simple start
PORT=3000 bun packages/cli/dist/index.js start --character characters/your-agent.character.json
```

#### Multiple Agents with Telegram
```bash
# Copy and configure the template
cp start-all-agents-with-telegram.sh.template start-all-agents-with-telegram.sh

# Edit the script with your bot tokens and usernames
nano start-all-agents-with-telegram.sh

# Make executable and run
chmod +x start-all-agents-with-telegram.sh
./start-all-agents-with-telegram.sh
```

## Configuration Options

### Mention-Only Settings

- **`TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED`**: `true` or `false`
  - When `true`: Only responds to mentions, DMs, or random chance
  - When `false`: Uses normal AI-based response logic

- **`TELEGRAM_RANDOM_RESPONSE_RATE`**: Number between 0 and 1
  - `0.01` = 1% chance (responds to 1 in 100 messages)
  - `0.05` = 5% chance (responds to 1 in 20 messages)
  - `0.0` = Never responds randomly
  - `1.0` = Always responds (defeats the purpose)

### Multiple Agents

For multiple agents with different Telegram bots:

1. Create separate character files for each agent
2. Each character file should have its own:
   - `TELEGRAM_BOT_TOKEN` in secrets
   - `TELEGRAM_BOT_USERNAME` in settings
   - Unique `name` field

3. Start each agent on a different port:
```bash
# Agent 1
PORT=3000 bun packages/cli/dist/index.js start --character agent1.json &

# Agent 2  
PORT=3001 bun packages/cli/dist/index.js start --character agent2.json &
```

## Testing Your Bot

1. **Direct Message Test**
   - Open Telegram
   - Search for @YourBotUsername
   - Send a message - bot should always respond

2. **Group Mention Test**
   - Add bot to a group
   - Send: "Hello @YourBotUsername"
   - Bot should respond to the mention

3. **Group Non-Mention Test**
   - Send regular messages without mentioning the bot
   - Bot should only respond based on random rate (e.g., 5% of messages)

## Troubleshooting

### Bot Not Responding

1. **Check logs for Telegram initialization:**
   ```bash
   grep -i "telegram" logs/your-agent.log
   ```

2. **Verify bot token is correct:**
   - Token should start with numbers followed by `:AAE...`
   - Test with curl:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

3. **Check database connection:**
   ```bash
   psql -d eliza -c "SELECT 1;"
   ```

### Common Issues

- **"Failed to connect" error**: Database not running or wrong connection string
- **"401 Unauthorized" from OpenAI**: Missing or invalid OPENAI_API_KEY
- **Bot receives messages but doesn't respond**: Check mention-only settings
- **"Duplicate package path" error**: Delete `bun.lock` and run `bun install`

## Security Notes

⚠️ **NEVER commit secrets to Git!**

- Add `.env` to `.gitignore`
- Use template files for character configs
- Store actual tokens only in local `.env` or environment variables
- Use GitHub Secrets for CI/CD

## Environment Variable Priority

Settings are loaded in this order (highest to lowest priority):
1. Environment variables
2. Character file `secrets` section
3. Character file `settings` section
4. Plugin defaults

## Advanced Configuration

### Using Environment Variables for Multi-Agent

For complex multi-agent setups, you can use CHARACTER-specific environment variables:

```bash
# In startup script
CHARACTER.AgentName.TELEGRAM_BOT_TOKEN="token-here" \
CHARACTER.AgentName.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true \
CHARACTER.AgentName.TELEGRAM_RANDOM_RESPONSE_RATE=0.01 \
bun packages/cli/dist/index.js start --character agent.json
```

**CRITICAL**: The CHARACTER.* pattern requires exact character name matching (case-sensitive).

### Working Multi-Agent Script Template

```bash
#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_ENV="LOG_LEVEL=info TEXT_PROVIDER=openai TEXT_MODEL=gpt-4o-mini POSTGRES_URL=postgresql://user:pass@localhost:5432/eliza"

# Agent 1 specific environment (must match character name exactly)
AGENT1_ENV="CHARACTER.TelegramTestAgent.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.TelegramTestAgent.TELEGRAM_RANDOM_RESPONSE_RATE=0.05"

# Agent 2 specific environment (must match character name exactly)
AGENT2_ENV="CHARACTER.TelegramTestAgent2.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true CHARACTER.TelegramTestAgent2.TELEGRAM_RANDOM_RESPONSE_RATE=0.05"

# Start agents with separate tokens
cd $SCRIPT_DIR && env $BASE_ENV $AGENT1_ENV TELEGRAM_BOT_TOKEN=8428017886:AAE... bun packages/cli/dist/index.js start --character characters/test-telegram.character.json --port 3000 > logs/test-telegram1.log 2>&1 &

cd $SCRIPT_DIR && env $BASE_ENV $AGENT2_ENV TELEGRAM_BOT_TOKEN=8434148933:AAE... bun packages/cli/dist/index.js start --character characters/test-telegram2.character.json --port 3001 > logs/test-telegram2.log 2>&1 &

wait
```

**Note**: We use our custom fork of plugin-telegram that adds mention-only support: `"@elizaos/plugin-telegram": "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"`

## Monitoring

- **Web UI**: Access at http://localhost:3000 when agent is running
- **Logs**: Check `logs/[agent-name].log` for detailed output
- **Database**: Query PostgreSQL for message history

## Related Documentation

- [ElizaOS Documentation](https://docs.elizaos.com)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Plugin Development Guide](./PLUGIN-DEVELOPMENT.md)