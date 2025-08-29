# RegenAI Agent Startup Guide

## Overview
This guide provides the official process for starting and managing the RegenAI agents. All 5 agents (RegenAI, Advocate, VoiceOfNature, Governor, Narrative) run as native Bun processes with PostgreSQL database support and Telegram bot integration.

## Prerequisites

### 1. PostgreSQL Database
Ensure PostgreSQL is running in Docker:
```bash
docker ps | grep postgres
# Should show: gaia-postgres-1 running on port 5433

# Verify connection:
docker exec gaia-postgres-1 psql -U postgres -d eliza -c '\l'
```

### 2. Environment Configuration (.env file)
Create or verify `/opt/projects/GAIA/.env` contains:
```bash
# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# OpenAI Configuration
OPENAI_API_KEY=your-api-key-here
TEXT_MODEL=gpt-5-nano-2025-08-07
TEXT_EMBEDDING_MODEL=text-embedding-3-small

# Telegram Bot Tokens (get from @BotFather)
TELEGRAM_BOT_TOKEN_ADVOCATE=your-advocate-token
TELEGRAM_BOT_TOKEN_VOICEOFNATURE=your-voiceofnature-token
TELEGRAM_BOT_TOKEN_GOVERNOR=your-governor-token
TELEGRAM_BOT_TOKEN_NARRATIVE=your-narrative-token
# Note: RegenAI is web-only, no Telegram bot
```

### 3. File Permissions
Ensure proper ownership:
```bash
sudo chown -R $USER:gaia-devs /opt/projects/GAIA
sudo chmod -R g+rws /opt/projects/GAIA
```

## Starting Agents

### Official Startup Script
Use the production-ready script with full Telegram support:
```bash
bash /opt/projects/GAIA/start-all-agents-with-telegram.sh
```

This script:
- Loads environment from .env file
- Stops any existing agents
- Starts all 5 agents with proper configuration
- Provides Telegram bot support with mention-only mode
- Shows status and access URLs

### What Happens During Startup

1. **Environment Loading**: Reads .env file for configuration
2. **Process Cleanup**: Stops any existing agent processes
3. **Token Validation**: Checks for required Telegram tokens
4. **Agent Launch**: Starts each agent on its designated port:
   - RegenAI: Port 3000 (Web only)
   - Advocate: Port 3001 (Web + Telegram)
   - VoiceOfNature: Port 3002 (Web + Telegram)
   - Governor: Port 3003 (Web + Telegram)
   - Narrative: Port 3004 (Web + Telegram)
5. **Status Display**: Shows running processes and access URLs

## Verifying Agents

### Check Running Processes
```bash
ps aux | grep "bun.*packages/cli/dist/index.js start" | grep -v grep
```
Expected: 5 processes (one per agent)

### Check Telegram Bot Connections
```bash
grep "Bot info" /opt/projects/GAIA/logs/*.log | tail -5
```
Should show successful connections for all 4 Telegram bots

### Check Individual Agent Logs
```bash
tail -f /opt/projects/GAIA/logs/regenai.log
tail -f /opt/projects/GAIA/logs/advocate.log
tail -f /opt/projects/GAIA/logs/voiceofnature.log
tail -f /opt/projects/GAIA/logs/governor.log
tail -f /opt/projects/GAIA/logs/narrative.log
```

### Test Web Access
```bash
# Main dashboard (requires auth)
curl -u regenai:regen2025 https://regen.gaiaai.xyz/

# Individual agent endpoints
curl http://localhost:3000  # RegenAI
curl http://localhost:3001  # Advocate
curl http://localhost:3002  # VoiceOfNature
curl http://localhost:3003  # Governor
curl http://localhost:3004  # Narrative
```

## Stopping Agents

### Standard Stop
```bash
pkill -f 'packages/cli/dist/index.js start'
```

### If Permission Denied (Multi-Developer Environment)
```bash
sudo pkill -f 'packages/cli/dist/index.js start'
```

## Restarting Agents

### Quick Restart
```bash
# Stop
sudo pkill -f 'packages/cli/dist/index.js start'
sleep 3

# Start
bash /opt/projects/GAIA/start-all-agents-with-telegram.sh
```

### After Knowledge Updates
Agents must be restarted to load new knowledge:
```bash
# Add new content to knowledge directory
cp new-docs/* /opt/projects/GAIA/knowledge/

# Restart agents
sudo pkill -f 'packages/cli/dist/index.js start'
bash /opt/projects/GAIA/start-all-agents-with-telegram.sh
```

## Troubleshooting

### Agents Not Starting

1. **Check PostgreSQL**:
```bash
docker ps | grep postgres
# If not running:
docker compose up -d postgres
```

2. **Check Ports**:
```bash
netstat -tlnp | grep -E ":(3000|3001|3002|3003|3004)"
# Kill any conflicting processes
```

3. **Check Logs**:
```bash
tail -50 /opt/projects/GAIA/logs/*.log
```

### Telegram Bots Not Connecting

1. **Verify Tokens in .env**:
```bash
grep "TELEGRAM_BOT_TOKEN_" /opt/projects/GAIA/.env
```

2. **Check Bot Registration**:
```bash
grep "Bot info\|Bot Token not provided" /opt/projects/GAIA/logs/*.log
```

3. **Verify Character Files**:
```bash
# All should have "secrets": {} and telegram plugin
grep -A2 '"secrets"' /opt/projects/GAIA/characters/*.character.json
```

### Database Connection Issues

1. **Check PostgreSQL URL**:
```bash
echo $POSTGRES_URL
# Should be: postgresql://postgres:postgres@localhost:5433/eliza
```

2. **Test Connection**:
```bash
docker exec gaia-postgres-1 psql -U postgres -d eliza -c '\dt'
```

### Knowledge Not Loading

1. **Check Knowledge Path**:
```bash
ls -la /opt/projects/GAIA/knowledge/
```

2. **Verify in Logs**:
```bash
grep "Document loading complete" /opt/projects/GAIA/logs/*.log
```

## Access Points

### Web Interfaces
- **Main Dashboard**: https://regen.gaiaai.xyz/ (Auth: regenai/regen2025)
- **Admin Panel**: https://admin.regen.gaiaai.xyz/admin/
- **KOI Dashboard**: https://regen.gaiaai.xyz/koi/

### Telegram Bots
- **@RegenAdvocacyBot** - Educational specialist
- **@RegenVoiceOfNatureBot** - Philosophical voice
- **@RegenGovernBot** - Governance facilitator
- **@RegenNarrativeBot** - Storyteller

### API Endpoints
Each agent exposes an API on its respective port:
- http://localhost:3000 - RegenAI
- http://localhost:3001 - Advocate
- http://localhost:3002 - VoiceOfNature
- http://localhost:3003 - Governor
- http://localhost:3004 - Narrative

## Configuration Details

### Character Files
Located in `/opt/projects/GAIA/characters/`:
- `regenai.character.json` - Web-only orchestrator
- `advocate.character.json` - Education focus
- `voiceofnature.character.json` - Philosophy focus
- `governor.character.json` - Governance focus
- `narrative.character.json` - Storytelling focus

### Environment Variable Pattern
The startup script uses CHARACTER.* pattern for Telegram configuration:
```bash
CHARACTER.<AGENT_NAME>.TELEGRAM_BOT_TOKEN=<token>
CHARACTER.<AGENT_NAME>.TELEGRAM_BOT_USERNAME=<username>
CHARACTER.<AGENT_NAME>.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.<AGENT_NAME>.TELEGRAM_RANDOM_RESPONSE_RATE=0.01
```

This bypasses ElizaOS timing issues where plugins initialize before environment variables are loaded.

## Best Practices

1. **Always Check Status After Starting**: Verify all agents are running
2. **Monitor Logs During Startup**: Watch for errors in real-time
3. **Use Sudo for Multi-Developer Environments**: Prevents permission issues
4. **Restart After Configuration Changes**: Agents don't hot-reload
5. **Keep .env Updated**: Ensure all required tokens are present
6. **Document Custom Changes**: If modifying startup scripts

## Related Documentation

- [CLAUDE.md](/CLAUDE.md) - Critical configuration and known issues
- [AGENT-OPERATIONS.md](AGENT-OPERATIONS.md) - Detailed operations guide
- [TELEGRAM-SETUP-LESSONS.md](TELEGRAM-SETUP-LESSONS.md) - Telegram bot setup details
- [ELIZAOS-GITHUB-ISSUE-STRATEGY.md](ELIZAOS-GITHUB-ISSUE-STRATEGY.md) - Known ElizaOS issues

## Quick Reference Commands

```bash
# Start all agents
bash /opt/projects/GAIA/start-all-agents-with-telegram.sh

# Stop all agents
sudo pkill -f 'packages/cli/dist/index.js start'

# Check status
ps aux | grep "bun.*packages/cli" | grep -v grep

# View logs
tail -f /opt/projects/GAIA/logs/*.log

# Verify Telegram bots
grep "Bot info" /opt/projects/GAIA/logs/*.log
```

---

*Last Updated: August 29, 2025*
*Version: 1.0*
*Maintained by: RegenAI Development Team*