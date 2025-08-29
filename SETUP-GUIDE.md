# RegenAI Setup Guide

This guide helps you get the RegenAI agents running locally after cloning this repository.

## Prerequisites

- [Bun](https://bun.sh/) v1.2.15+ (JavaScript runtime - **NOT npm/pnpm**)
- [Docker](https://docker.com/) with Docker Compose
- Git
- OpenAI API key (or compatible provider)

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/gaiaaiagent/GAIA.git -b regen
cd GAIA

# MUST use bun, not npm/pnpm
bun install

# Build the project (required for first run)
bun run build
```

### 2. Start Database

```bash
docker compose up -d postgres
```

### 3. Environment Setup

Create `.env` file with your API keys:

```bash
# Required
OPENAI_API_KEY=your-openai-key-here
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# Model Configuration (Optional - defaults shown)
TEXT_MODEL=gpt-4o-mini
TEXT_EMBEDDING_MODEL=text-embedding-3-small
```

### 4. Configure Characters (IMPORTANT - Security)

**Characters use a template system to keep secrets out of Git:**

```bash
# Run the setup script
./scripts/setup-characters.sh

# Choose option:
# 1) Setup all characters (with Telegram)
# 2) Setup specific character
# 3) Web-only mode (no Telegram)
```

This creates actual character files from templates, keeping tokens secure.
See [SECURITY.md](SECURITY.md) for details.

### 5. Start Agents

**Option 1: Single-Process Mode (RECOMMENDED)**
```bash
# All agents in one process - full web UI + Telegram
bash start-all-agents-single-process.sh
```

**Option 2: Use the Control Center**
```bash
# View all available commands
./scripts/agent-control.sh help

# Start agents (recommended mode)
./scripts/agent-control.sh start-single

# Check status
./scripts/agent-control.sh status
```

**Option 3: Multi-Process Mode (Independent control)**
```bash
# Each agent in separate process
bash start-all-agents-telegram.sh
```

### 5. Verify Setup

```bash
# Check agent status
./scripts/agent-control.sh status

# API Check
curl http://localhost:3000/api/agents

# Web UI
open http://localhost:3000

# View logs
tail -f logs/*.log
```

## Startup Options Comparison

| Mode | Script | Web UI | Telegram | Use Case |
|------|--------|--------|----------|----------|
| Single-Process | `start-all-agents-single-process.sh` | ✅ All agents | ✅ All bots | **RECOMMENDED** - Full functionality |
| Multi-Process | `start-all-agents-telegram.sh` | ❌ Only RegenAI | ✅ All bots | Independent agent control |
| No Telegram | `start-all-agents-no-telegram.sh` | ✅ All agents | ❌ Disabled | Testing/Development |

## Available Agents

1. **RegenAI** - Development orchestrator (Web only, no Telegram)
2. **Advocate** - Educational specialist (@RegenAdvocacyBot)
3. **VoiceOfNature** - Philosophical voice (@RegenVoiceOfNatureBot)
4. **Governor** - Governance expert (@RegenGovernBot)
5. **Narrative** - Storyteller (@RegenNarrativeBot)

## Project Structure

```
GAIA/
├── characters/              # Agent character definitions
├── config/                  # Nginx and other configs
├── docs/                    # Documentation
├── knowledge/               # Knowledge base (not in repo)
├── logs/                    # Agent runtime logs
├── scripts/                 # Utility scripts
│   └── agent-control.sh     # Unified control center
├── start-all-agents-*.sh    # Various startup scripts
└── packages/                # ElizaOS framework code
```

## Telegram Configuration

### Setting Up Telegram Bots

1. **Get Bot Tokens from @BotFather**:
   - Create 4 bots (Advocate, VoiceOfNature, Governor, Narrative)
   - Save the tokens

2. **Configure Tokens in Character Files**:
   ```json
   // In characters/[agent].character.json
   "secrets": {
     "TELEGRAM_BOT_TOKEN": "your-bot-token-here",
     "TELEGRAM_BOT_USERNAME": "BotUsername"
   }
   ```

3. **Mention-Only Mode** (Reduces spam in groups):
   ```json
   "settings": {
     "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": true,
     "TELEGRAM_RANDOM_RESPONSE_RATE": "0.01"  // 1% random responses
   }
   ```

## Knowledge Base

The `knowledge/` directory contains proprietary content and is not included in the repository.

```bash
# Create empty knowledge directory (agents will run without knowledge)
mkdir -p knowledge

# OR: Add your own knowledge files
# Place .md, .txt, or .pdf files in knowledge/ directory
# Agents must be restarted to load new knowledge
```

## Common Issues & Solutions

### 502 Bad Gateway on Web UI
```bash
# Check agents are running
ps aux | grep "bun.*packages/cli" | grep -v grep

# Check nginx is pointing to correct port
docker logs nginx | tail -20

# Restart everything
./scripts/agent-control.sh restart
```

### Agents Show as "Inactive" in Web UI
```bash
# Use single-process mode for full web UI
./scripts/agent-control.sh stop
./scripts/agent-control.sh start-single
```

### Telegram Bot Authentication Errors
```bash
# Verify tokens in character files
grep "TELEGRAM_BOT_TOKEN" characters/*.json

# Get fresh tokens from @BotFather if needed
```

### Can't Stop Agents (Multi-Developer)
```bash
# If started by another user
sudo pkill -f "bun.*packages/cli/dist/index.js"

# Then restart normally
./scripts/agent-control.sh start-single
```

### Build Errors
```bash
# Clean and rebuild
rm -rf node_modules bun.lockb
bun install
bun run build
```

## Model Configuration

### Cost-Optimized Defaults
- **Chat**: GPT-4o-mini (good balance of cost/quality)
- **Embeddings**: text-embedding-3-small (most cost-effective)

### Alternative Models
```bash
# Use GPT-3.5 (cheapest)
TEXT_MODEL=gpt-3.5-turbo

# Use GPT-4 (best quality, expensive)
TEXT_MODEL=gpt-4o

# Use Claude (requires ANTHROPIC_API_KEY)
TEXT_MODEL=claude-3-haiku-20240307
TEXT_PROVIDER=anthropic
```

## Team Development Notes

For multi-developer environments:
- Agents run as the user who started them
- Use `sudo pkill` to stop agents started by others
- Consider systemd service for production (see `docs/AGENT-OPERATIONS.md`)

## Quick Commands Reference

```bash
# Start all agents (recommended)
./scripts/agent-control.sh start-single

# Stop all agents
./scripts/agent-control.sh stop

# Check status
./scripts/agent-control.sh status

# View logs
./scripts/agent-control.sh logs

# Test web access
./scripts/agent-control.sh test-web

# Test Telegram bots
./scripts/agent-control.sh test-telegram
```

## Related Documentation

- **[CLAUDE.md](CLAUDE.md)** - Critical configuration and known issues
- **[docs/AGENT-STARTUP-GUIDE.md](docs/AGENT-STARTUP-GUIDE.md)** - Detailed startup procedures
- **[docs/TELEGRAM-BOT-SETUP.md](docs/TELEGRAM-BOT-SETUP.md)** - Telegram user guide
- **[docs/AGENT-OPERATIONS.md](docs/AGENT-OPERATIONS.md)** - Advanced operations

---

*Last Updated: August 29, 2025*
*Version: 2.0*