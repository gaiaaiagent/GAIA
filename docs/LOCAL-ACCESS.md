# Local Access Guide for RegenAI

## Production Access

### Web Interfaces (HTTPS with Auth)

**ElizaOS Web UI - All 5 Agents:**
- https://regen.gaiaai.xyz/
- **Basic Auth**: regenai / regen2025
- Chat with all 5 agents via dropdown selector

**Django Admin Dashboard:**
- https://admin.regen.gaiaai.xyz/admin/
- **Django Login**: Contact admin for credentials

**KOI Knowledge Dashboard:**
- https://regen.gaiaai.xyz/koi/
- Real-time agent statistics and knowledge queries

### Telegram Bots

- **@RegenAdvocacyBot** - Educational specialist
- **@RegenVoiceOfNatureBot** - Philosophical voice
- **@RegenGovernBot** - Governance facilitator
- **@RegenNarrativeBot** - Storyteller

> **Note:** RegenAI itself is web-only, no Telegram bot

## Local Development Access

### Direct Port Access

**ElizaOS Web UI:**
- http://localhost:3000 (when agents running)
- All agents available via dropdown

**Django Admin:**
- http://localhost:8000/admin (if running locally)

**KOI Services:**
- http://localhost:8001 - KOI Node API
- http://localhost:8100 - KOI Query Server

### Services Architecture

**Native Processes (NOT Docker):**
- ElizaOS Agents - Run via bun on port 3000
- KOI Node - Python service on port 8001
- KOI Query - Bun service on port 8100

**Docker Services:**
- PostgreSQL - Port 5433
- Nginx - Ports 80/443 (reverse proxy)
- Django Admin - Port 8000

## Starting Services

### Quick Start (All Agents)
```bash
# Single command to start everything
./scripts/agent-control.sh start-single

# Check status
./scripts/agent-control.sh status
```

### Manual Control

**Start Agents:**
```bash
# Recommended: Single-process mode
bash start-all-agents-single-process.sh

# Alternative: Multi-process mode
bash start-all-agents-telegram.sh
```

**Start Docker Services:**
```bash
# Database (required)
docker compose up -d postgres

# Web proxy and admin (optional)
docker compose up -d nginx django-admin
```

**Start KOI Services:**
```bash
# KOI Node
cd /home/regenai/project/koi-infrastructure/koi-regen-node
source venv/bin/activate && python -m node &

# KOI Query Server
cd /opt/projects/plugin-knowledge-gaia
bun scripts/koi-query-server.ts &
```

## Checking Service Status

### Agents Status
```bash
# Are agents running?
ps aux | grep "bun.*packages/cli" | grep -v grep

# Check specific agent logs
tail -f logs/regenai.log
tail -f logs/advocate.log
```

### Docker Services Status
```bash
# View all containers
docker ps

# Check specific service
docker logs nginx --tail 20
docker logs gaia-postgres-1 --tail 20
```

### KOI Services Status
```bash
# Check processes
ps aux | grep -E "(python.*node|bun.*koi)" | grep -v grep

# Test endpoints
curl http://localhost:8001/regen/health
curl http://localhost:8100/stats
```

## Port Reference

| Port | Service | Type | Purpose |
|------|---------|------|---------|
| 80 | Nginx | Docker | HTTP redirect to HTTPS |
| 443 | Nginx | Docker | HTTPS reverse proxy |
| 3000 | ElizaOS | Native | Agent web UI & API |
| 5433 | PostgreSQL | Docker | Database with pgvector |
| 8000 | Django | Docker | Admin dashboard |
| 8001 | KOI Node | Native | Agent RID management |
| 8100 | KOI Query | Native | Knowledge queries |

## Troubleshooting

### Can't Access Web UI
```bash
# Check agents are running
./scripts/agent-control.sh status

# Restart if needed
./scripts/agent-control.sh restart
```

### 502 Bad Gateway
```bash
# Usually means agents aren't running
bash start-all-agents-single-process.sh

# Or nginx misconfigured
docker compose restart nginx
```

### Telegram Bots Not Responding
```bash
# Check bot tokens in character files
grep "TELEGRAM_BOT_TOKEN" characters/*.json

# Verify mention-only mode settings
grep "TELEGRAM_ONLY_RESPOND" characters/*.json
```

## Quick Commands

```bash
# Start everything
./scripts/agent-control.sh start-single

# Stop everything
./scripts/agent-control.sh stop

# Check status
./scripts/agent-control.sh status

# View all logs
./scripts/agent-control.sh logs

# Test web access
curl -u regenai:regen2025 https://regen.gaiaai.xyz/

# Test API
curl http://localhost:3000/api/agents
```

## Related Documentation

- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Initial setup instructions
- [docs/AGENT-STARTUP-GUIDE.md](docs/AGENT-STARTUP-GUIDE.md) - Detailed startup procedures
- [docs/TELEGRAM-BOT-SETUP.md](docs/TELEGRAM-BOT-SETUP.md) - Telegram user guide
- [CLAUDE.md](CLAUDE.md) - Critical configuration and known issues

---

*Last Updated: August 29, 2025*