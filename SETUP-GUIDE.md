# Quick Setup Guide

This guide helps you get the RegenAI agents running locally after cloning this repository.

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime)
- [Docker](https://docker.com/) with Docker Compose
- Git

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/gaiaaiagent/GAIA.git -b regen-knowledge-rag
cd GAIA
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

# Optional (for full functionality)
ANTHROPIC_API_KEY=your-anthropic-key
TELEGRAM_BOT_TOKEN=your-telegram-token
```

### 4. Model Configuration (Default: OpenAI GPT-5 Nano)

The agents are configured to use:
- **Chat Model**: GPT-5 Nano (`gpt-5-nano-2025-08-07`)
- **Embeddings**: OpenAI text-embedding-3-small
- **Provider**: OpenAI

To use different models, add to your `.env`:

```bash
# Use GPT-4 (more expensive, better quality)
TEXT_MODEL=gpt-4o-mini
TEXT_PROVIDER=openai

# Use Claude (requires ANTHROPIC_API_KEY)
TEXT_MODEL=claude-3-haiku-20240307
TEXT_PROVIDER=anthropic

# Use different embeddings
TEXT_EMBEDDING_MODEL=text-embedding-3-large  # Better quality, more expensive
```

**Cost Considerations:**
- GPT-3.5 Turbo: ~$0.002/1K tokens (cheapest)
- GPT-4o-mini: ~$0.15/1M tokens (good balance)  
- Claude Haiku: ~$0.25/1M tokens
- Embeddings: text-embedding-3-small is most cost-effective

### 5. Add Knowledge Base (Optional)

The `knowledge/` directory is not included in the repository (contains sensitive data). For testing:

```bash
# Create empty knowledge directory - agents will run without knowledge
mkdir -p knowledge

# OR: Add your own knowledge files
# Place .md, .txt, or .pdf files in knowledge/ directory
```

### 6. Start Agents

```bash
# Start all 5 agents
bash start-all-agents.sh
```

### 7. Verify Setup

- **API Check**: `curl http://localhost:3000/api/agents`
- **Web UI**: Visit `http://localhost:3000` (RegenAI)
- **Logs**: `tail -f logs/regenai.log`

## Project Structure

```
GAIA/
├── characters/           # Agent character definitions
├── config/              # Nginx and other configs
├── docs/               # Documentation
├── knowledge/          # Knowledge base content
├── logs/              # Agent runtime logs
├── scripts/           # Utility scripts and tools
├── start-all-agents.sh # Main agent startup script
└── packages/          # ElizaOS framework code
```

## Troubleshooting

- **Build errors**: If `bun run build` fails, ensure `build-utils.ts` symlink exists at repository root
- **Agents won't start**: Check `bun install` and `bun run build` completed successfully
- **Database errors**: Ensure PostgreSQL is running on port 5433
- **API key errors**: Verify `.env` file has valid OpenAI key
- **Can't stop agents**: If started by another user, use `sudo pkill -f "bun.*packages/cli/dist/index.js start"`

## Team Development Notes

If multiple developers work on the same server:
- Agents run as the user who started them
- Other developers need `sudo pkill` to stop agents started by others
- Consider using a shared service user or systemd for production

For detailed multi-developer process management, see `docs/AGENT-OPERATIONS.md`.

For complete information, see `CLAUDE.md`.