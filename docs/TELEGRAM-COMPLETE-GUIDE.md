# Complete Telegram Bot Setup Guide for RegenAI/GAIA

This comprehensive guide consolidates all Telegram bot setup documentation for the RegenAI/GAIA project.

## Table of Contents
1. [Overview](#overview)
2. [Available Bots](#available-bots)
3. [Architecture](#architecture)
4. [Setup Instructions](#setup-instructions)
5. [Configuration](#configuration)
6. [Mention-Only Mode](#mention-only-mode)
7. [Troubleshooting](#troubleshooting)
8. [Production Deployment](#production-deployment)
9. [Security Best Practices](#security-best-practices)
10. [Technical Details](#technical-details)

## Overview

The RegenAI project integrates AI agents with Telegram, allowing team members to interact with them directly through Telegram messages. Each agent has its own unique personality, expertise area, and dedicated Telegram bot.

### Key Features
- **Mention-Only Response Mode**: Bots only respond when mentioned directly, reducing spam
- **Multi-Agent Support**: Each agent runs its own Telegram bot
- **Direct Message Support**: Always responds in DMs
- **Configurable Random Response Rate**: For organic group interactions

## Available Bots

### Active Telegram Bots

| Agent | Telegram Handle | Expertise | Token Required |
|-------|----------------|-----------|----------------|
| **Advocate** | @RegenAdvocacyBot | Educational content, carbon credits, regenerative practices | Yes |
| **Governor** | @RegenGovernBot | Governance, coordination, decision-making | Yes |
| **Voice of Nature** | @RegenVoiceOfNatureBot | Ecological wisdom, regenerative principles | Yes |
| **Narrative** | @RegenNarrativeBot | Storytelling, documentation, communication | Yes |

### Web-Only Agents (No Telegram)

| Agent | Purpose | Reason |
|-------|---------|--------|
| **RegenAI** | Main coordinator agent | No bot token assigned |
| **Facilitator** | Internal coordination | Reserved for future use |

## Architecture

### Technology Stack
- **Framework**: ElizaOS v1.4.2
- **Runtime**: Bun v1.2.20
- **Plugin**: Custom fork of `@elizaos/plugin-telegram`
- **Database**: PostgreSQL for message history
- **API**: OpenAI GPT-4o-mini for text generation

### Custom Fork Details
**Repository**: https://github.com/gaiaaiagent/plugin-telegram  
**Branch**: `1.x`  
**Reason**: Added mention-only mode support and updated dependencies for ElizaOS v1.4.2 compatibility

## Setup Instructions

### Prerequisites

1. **PostgreSQL Database**
   ```bash
   # Create database
   createdb eliza
   
   # Verify connection
   psql -d eliza -c "SELECT 1;"
   ```

2. **OpenAI API Key**
   - Get from https://platform.openai.com/api-keys
   - Required for text generation

3. **Telegram Bot Tokens**
   - Create via @BotFather on Telegram
   - Use `/newbot` command
   - Save token and username

### Step 1: Configure Character Files

Each agent needs proper configuration in its character file:

```json
{
  "name": "AgentName",
  "username": "agentusername",
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-sql",
    "@elizaos/plugin-openai",
    "@elizaos/plugin-telegram"
  ],
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true,
    "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": "true",
    "TELEGRAM_RANDOM_RESPONSE_RATE": "0.01"
  },
  "secrets": {
    "TELEGRAM_BOT_TOKEN": "YOUR_BOT_TOKEN_HERE",
    "TELEGRAM_BOT_USERNAME": "YourBotUsername"
  }
}
```

### Step 2: Set Environment Variables

Create `.env` file:

```bash
# Core Services
OPENAI_API_KEY=your-openai-api-key
POSTGRES_URL=postgresql://username@localhost:5432/eliza

# Optional: Bot tokens can also go here
TELEGRAM_BOT_TOKEN_ADVOCATE=8280814835:AAE...
TELEGRAM_BOT_TOKEN_GOVERNOR=8058793609:AAG...
TELEGRAM_BOT_TOKEN_VOICEOFNATURE=8258974878:AAF...
TELEGRAM_BOT_TOKEN_NARRATIVE=7413348697:AAG...
```

### Step 3: Start Agents

#### Single Process Mode (All Agents)
```bash
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

#### Individual Agent (for testing)
```bash
PORT=3000 bun packages/cli/dist/index.js start \
  --character characters/advocate.character.json
```

## Configuration

### Token Configuration Priority

Tokens are loaded in this order (highest to lowest priority):
1. Character file `secrets` section
2. Environment variables
3. CHARACTER.* pattern variables (see workaround below)

### Environment Variable Workaround

Due to an initialization order issue, CHARACTER.* environment variables require manual injection:

```bash
# Workaround for CHARACTER.* pattern
CHARACTER.Advocate.TELEGRAM_BOT_TOKEN="token" \
TELEGRAM_BOT_TOKEN="token" \
bun packages/cli/dist/index.js start --character advocate.json
```

## Mention-Only Mode

### How It Works

The mention-only mode uses programmatic detection instead of LLM-based shouldRespond:

1. **Direct Mentions**: `@BotName hello`
2. **Name Mentions**: `Hey Advocate, what do you think?`
3. **Direct Messages**: Always responds
4. **Random Chance**: Configured percentage (e.g., 1% of messages)

### Configuration Options

```json
{
  "settings": {
    "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": "true",
    "TELEGRAM_RANDOM_RESPONSE_RATE": "0.01"
  }
}
```

- **TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED**: Enable/disable mention-only mode
- **TELEGRAM_RANDOM_RESPONSE_RATE**: 0.0 to 1.0 (0.01 = 1% chance)

### Performance Benefits
- **95% faster**: Bypasses expensive LLM shouldRespond calls
- **Cost savings**: Reduces API costs significantly
- **Predictable behavior**: Deterministic response patterns

## Troubleshooting

### Common Issues and Solutions

#### Bot Not Responding

1. **Check bot token**:
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

2. **Verify in logs**:
   ```bash
   tail -f logs/all-agents.log | grep -i telegram
   ```

3. **Database connection**:
   ```bash
   psql -d eliza -c "SELECT 1;"
   ```

#### 404: Not Found Error

- **Cause**: Invalid bot token or bot was deleted
- **Solution**: Regenerate bot via @BotFather

#### Silent Failures

- **Symptom**: No Telegram client initialization
- **Solution**: Ensure token is in character file `secrets` section

#### Duplicate Messages

- **Cause**: Multiple instances running
- **Solution**: `pkill -f 'packages/cli/dist/index.js'`

## Production Deployment

### Current Production Setup

```bash
# Location: /opt/projects/GAIA
# Server: 202.61.196.119

# Start all agents
bash start-all-agents-single-process.sh

# Monitor
tail -f logs/all-agents.log

# Stop
pkill -f 'packages/cli/dist/index.js'
```

### Service URLs
- **Web Interface**: https://regen.gaiaai.xyz/
- **KOI Graph**: https://regen.gaiaai.xyz/koi
- **Grant Form**: https://regen.gaiaai.xyz/irl/

### Health Checks

```bash
# Check if running
ps aux | grep 'packages/cli/dist' | grep -v grep

# Test web interface
curl -I http://localhost:3000

# Check Telegram status
grep "Telegram" /tmp/agents.log | tail -10
```

## Security Best Practices

### Token Management

⚠️ **NEVER commit real tokens to Git!**

**GitHub Repository Setup:**
- Character files use placeholders: `"${TELEGRAM_BOT_TOKEN_ADVOCATE}"`
- Real tokens stored in `.env` file (gitignored)
- Production server can use real tokens in character files

### Secure Storage Options

```bash
# Option 1: Environment variables in .env file (RECOMMENDED)
# Create .env from .env.example and add real tokens:
TELEGRAM_BOT_TOKEN_ADVOCATE=8280814835:AAE...
TELEGRAM_BOT_TOKEN_GOVERNOR=8058793609:AAG...
TELEGRAM_BOT_TOKEN_NARRATIVE=7413348697:AAG...
TELEGRAM_BOT_TOKEN_VOICEOFNATURE=8258974878:AAF...

# Option 2: Direct in character file (production server only)
"secrets": {
  "TELEGRAM_BOT_TOKEN": "actual-token-here"
}

# Option 3: Runtime environment variable
export TELEGRAM_BOT_TOKEN="actual-token-here"

# Option 3: .env file (for development)
TELEGRAM_BOT_TOKEN=actual-token-here
```

## Technical Details

### Message Flow

1. **Telegram → Bot**: Message received via webhook/polling
2. **Plugin Processing**: Mention detection and filtering
3. **LLM Generation**: If should respond, generate reply
4. **Response → Telegram**: Send message back to chat

### Database Schema

Messages are stored in PostgreSQL with:
- User information
- Message content
- Room/channel data
- Agent responses
- Timestamps

### Plugin Architecture

```typescript
// Simplified flow
1. TelegramClient initialization
2. Bot.launch() with token
3. Message handler registration
4. Mention detection logic
5. Response generation
6. Message sending
```

### Known Limitations

1. **Initialization Order**: CHARACTER.* variables require workaround
2. **Silent Failures**: Some errors don't surface to logs
3. **Token Validation**: Happens at startup, not runtime
4. **Multi-Process Complexity**: Each agent needs separate process for different tokens

## Monitoring and Maintenance

### Log Locations
- **All agents**: `/opt/projects/GAIA/logs/all-agents.log`
- **Individual**: `/tmp/agents-[name].log`
- **Errors**: Check for "ERROR" or "Failed" in logs

### Regular Maintenance

```bash
# Daily: Check agent status
systemctl status agents  # if using systemd

# Weekly: Rotate logs
logrotate /opt/projects/GAIA/logs/*.log

# Monthly: Update dependencies
bun update

# As needed: Restart agents
bash start-all-agents-single-process.sh
```

## Appendix

### Quick Reference Commands

```bash
# Test bot token
curl https://api.telegram.org/bot<TOKEN>/getMe

# Start agents
bash start-all-agents-single-process.sh

# Check status
ps aux | grep 'packages/cli/dist'

# View logs
tail -f logs/all-agents.log

# Stop agents
pkill -f 'packages/cli/dist/index.js'

# Test specific bot
PORT=3000 bun packages/cli/dist/index.js start --character characters/advocate.character.json
```

### Support Links

- [ElizaOS Documentation](https://docs.elizaos.com)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Our Fork](https://github.com/gaiaaiagent/plugin-telegram)
- [Production Server](https://regen.gaiaai.xyz/)

---

*Last Updated: September 2025*  
*Version: 2.0 (Consolidated)*  
*Maintainer: GAIA Team*
