# RegenAI - ElizaOS Deployment

AI agents for regenerative economics, powered by ElizaOS.

## Quick Start

### Docker Deployment (Recommended)

```bash
# Clone and setup
git clone https://github.com/gaiaaiagent/GAIA.git -b regen
cd GAIA
cp .env.example .env

# Add your API key to .env
# OPENAI_API_KEY=your_key_here
# or ANTHROPIC_API_KEY=your_key_here

# Start everything
docker compose up -d
```

### Access Points

**Team Access:**
- Agents: http://agents.localhost (regenai/regen2025)
- Admin: http://admin.localhost (admin/admin123)

**Direct Ports (if subdomains fail):**
- Agents: http://localhost:3000
- Admin: http://localhost:8000/admin

See [LOCAL-ACCESS.md](LOCAL-ACCESS.md) for troubleshooting.

## The Five Agents

1. **Advocate** - Carbon credits and regenerative practices educator
2. **Governor** - DAO governance and proposal facilitator
3. **Narrator** - Data-to-narrative storyteller
4. **VoiceOfNature** - Ecological systems thinker
5. **RegenAI** - Technical coordinator

## Development Setup

<details>
<summary>Manual Installation (Advanced)</summary>

### Prerequisites
- Node.js 23.3.0+
- Bun 1.2.15+
- PostgreSQL 14+

### Build from Source

```bash
# Install and build
bun install
bun run build

# Configure environment
cp .env.example .env
# Edit .env with your API keys

# Run all agents
bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

### Django Admin Setup

```bash
cd django_admin
poetry install
poetry run python manage.py migrate
poetry run python manage.py createsuperuser
poetry run python manage.py runserver
```

</details>

## Documentation

- [LOCAL-ACCESS.md](LOCAL-ACCESS.md) - Local development guide
- [CLAUDE.md](CLAUDE.md) - AI agent development context
- [Journal](.claude/journal/) - Development history
- [Characters](characters/) - Agent personalities

## ElizaOS Framework

This project extends [ElizaOS](https://github.com/elizaos/eliza), a multi-agent AI framework.

---

*For ElizaOS documentation, see the [official repository](https://github.com/elizaos/eliza).*
