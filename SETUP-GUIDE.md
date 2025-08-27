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

### 4. Add Knowledge Base (Optional)

The `knowledge/` directory is not included in the repository (contains sensitive data). For testing:

```bash
# Create empty knowledge directory - agents will run without knowledge
mkdir -p knowledge

# OR: Add your own knowledge files
# Place .md, .txt, or .pdf files in knowledge/ directory
```

### 5. Start Agents

```bash
# Start all 5 agents
bash start-all-agents.sh
```

### 6. Verify Setup

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

- **Agents won't start**: Check `bun install` completed successfully
- **Database errors**: Ensure PostgreSQL is running on port 5433
- **API key errors**: Verify `.env` file has valid OpenAI key

For detailed information, see `CLAUDE.md`.