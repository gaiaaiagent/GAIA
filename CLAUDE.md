# RegenAI CLAUDE CODE CONFIGURATION

https://github.com/gaiaaiagent/GAIA/tree/regen

Essential configuration for Claude Code when working with the RegenAI/GAIA codebase.

## 🚨 CRITICAL DISCOVERIES & LESSONS LEARNED

### Database Configuration (August 27, 2025)

**MOST COMMON FAILURE:** PostgreSQL authentication errors

**Problem:** Agents fail with "client password must be a string" or "password authentication failed"

**Solution:** Use correct PostgreSQL connection string in startup script:
```bash
# CORRECT (with password "postgres"):
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# WRONG (empty password causes SASL errors):
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza
```

### Agent Deployment Architecture (August 27, 2025)

**CRITICAL:** Agents run as native bun processes, NOT Docker containers!

- ✅ **PostgreSQL, Nginx, Django:** Run in Docker
- ✅ **Agents (5 instances):** Run as native bun processes on host
- ❌ **Never run agents in Docker** - this breaks the proxy configuration

### Web Server Configuration (August 27, 2025)

**HTTPS/SSL Setup Requirements:**
- SSL certificates must be mounted: `/etc/letsencrypt:/etc/letsencrypt:ro`
- Nginx proxy must point to host IP: `server 172.17.0.1:3000;`
- Basic auth credentials: `regenai:regen2025`
- Ports: HTTP (80) redirects to HTTPS (443)

### Plugin Loading Issue (Found Aug 2024)

**Plugins are loaded from EXTERNAL directory**, not the monorepo:
- **Actual Runtime Location**: `/opt/projects/plugin-knowledge/`
- **Development Location**: `/opt/projects/GAIA-direct/packages/plugin-knowledge/`

**You MUST copy built plugins to external directory for changes to take effect!**

```bash
# After building plugin in monorepo
cp -f /opt/projects/GAIA-direct/packages/plugin-knowledge/dist/index.js \
      /opt/projects/plugin-knowledge/dist/index.js
```

### How Agents Actually Run

**The RegenAI agents are NOT Docker containers!** They run as native bun processes.

### Quick Status Check
```bash
# Are agents running?
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

# View individual agent logs
tail -f /opt/projects/GAIA-direct/logs/regenai.log
tail -f /opt/projects/GAIA-direct/logs/facilitator.log
tail -f /opt/projects/GAIA-direct/logs/voiceofnature.log
tail -f /opt/projects/GAIA-direct/logs/governor.log
tail -f /opt/projects/GAIA-direct/logs/narrative.log

# Check web access
curl -u regenai:regen2025 https://regen.gaiaai.xyz/
```

### Key Paths
- **Agents run from**: `/opt/projects/GAIA-direct`
- **Knowledge loaded from**: `/opt/projects/GAIA/knowledge`
- **Characters**: `/opt/projects/GAIA/characters`
- **Web UI**: https://regen.gaiaai.xyz/ (Username: `regenai`, Password: `regen2025`)
- **Admin Panel**: https://admin.regen.gaiaai.xyz/admin/

## Project Context

### Partnership
- **Joint Development Agreement** between Symbiocene Labs & Regen Network
- **Full contract**: See `/opt/projects/GAIA/docs/CONTRACT-JDA.md`
- **Phase 1 Goal**: 5 agents, 15,000+ docs, 100,000+ interactions in 60 days

### Current Setup
- **5 AI Agents**: RegenAI, Facilitator, Voice of Nature, Governor, Narrative
- **Database**: PostgreSQL with pgvector (Docker container on port 5433)
- **Knowledge Base**: 606 Notion pages + Regen Network docs
- **Model**: Gemini 1.5 Flash (chat) + OpenAI embeddings
- **KOI System**: Knowledge Organization Infrastructure with RID-based agent tracking

## 🌿 KOI Node System (Knowledge Organization Infrastructure)

### Overview
The KOI (Knowledge Organization Infrastructure) system provides distributed knowledge management with RID-based agent identification. Each agent gets a canonical Resource Identifier (RID) that maps to other identifiers.

### Architecture
- **KOI Node Server**: Python FastAPI service (port 8001)
- **KOI Query Server**: TypeScript Bun service (port 8100) 
- **KOI Registry**: Database-backed tracking of content sources and agent processing
- **Web Dashboard**: Real-time statistics at https://regen.gaiaai.xyz/koi/

### Agent RID System
Each agent has a canonical RID following the format: `relevant.agent.[slug].v1.0.0`

**Current Agent Mappings:**
```
relevant.agent.regenai.v1.0.0       -> RegenAI
relevant.agent.voiceofnature.v1.0.0 -> VoiceOfNature  
relevant.agent.facilitator.v1.0.0   -> RegenAI Facilitator
relevant.agent.governor.v1.0.0      -> Governor
relevant.agent.narrative.v1.0.0     -> Narrator
```

### Key Services

#### KOI Node Server (Port 8001)
```bash
# Location: /home/regenai/project/koi-infrastructure/koi-regen-node/
# Start: source venv/bin/activate && python -m node

# Health check
curl http://localhost:8001/regen/health

# List all agents with RIDs
curl http://localhost:8001/regen/agents

# Get specific agent info
curl http://localhost:8001/regen/agents/relevant.agent.regenai.v1.0.0
```

#### KOI Query Server (Port 8100)  
```bash
# Location: /opt/projects/plugin-knowledge-gaia/
# Start: bun scripts/koi-query-server.ts

# Statistics dashboard
curl http://localhost:8100/stats

# Query knowledge base
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is regenerative agriculture?"}'
```

### Source Metadata System
The knowledge plugin now preserves source information from file paths:

**Source Detection Logic:**
- `/knowledge/notion/` → `notion`
- `/knowledge/twitter/` → `twitter` 
- `/knowledge/medium/` → `medium`
- `/knowledge/discord/` → `discord`
- Default → `documents`

### Key Operations

#### Check KOI System Status
```bash
# Check both services are running
ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep

# View KOI node logs  
tail -f /home/regenai/project/koi-infrastructure/koi-regen-node/koi-node.log

# View query server logs
tail -f /opt/projects/plugin-knowledge-gaia/koi-server-fixed.log
```

#### Restart KOI Services
```bash
# Restart KOI node
cd /home/regenai/project/koi-infrastructure/koi-regen-node
pkill -f "python.*node" 
source venv/bin/activate && python -m node &

# Restart query server  
cd /opt/projects/plugin-knowledge-gaia
pkill -f "bun.*koi-query"
bun scripts/koi-query-server.ts &
```

### Web Interface
Access the KOI dashboard at: https://regen.gaiaai.xyz/koi/

Features:
- Real-time agent processing statistics
- Content source breakdown
- Interactive knowledge query interface
- Agent status monitoring with proper name mapping

## Development Environment

### Working Directory
- **Main**: `/opt/projects/GAIA` (Docker configs, characters, knowledge)
- **Runtime**: `/opt/projects/GAIA-direct` (where agents actually run)
- **Indexing**: `/home/regenai/project/indexing` (Notion crawler)

### Technology Stack
- **Framework**: ElizaOS 1.2.0
- **Runtime**: Bun (NOT npm/pnpm)
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector extension
- **Container**: Docker for postgres/nginx/django only

## Key Commands

### Agent Operations
```bash
# Check status
ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep

# Restart to load new knowledge
pkill -f 'packages/cli/dist/index.js start'
bash /opt/projects/GAIA/start-agents-hybrid.sh

# View logs
tail -100 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log
```

### Database Operations
```bash
# Backup
docker exec gaia-postgres-1 pg_dumpall -U postgres > backup.sql

# Connect
docker exec -it gaia-postgres-1 psql -U postgres -d eliza

# Check size
docker exec gaia-postgres-1 psql -U postgres -c "SELECT pg_database_size('eliza') / 1024 / 1024 AS size_mb;"
```

### Knowledge Updates
```bash
# Add new content to:
/opt/projects/GAIA/knowledge/

# Then restart agents:
bash /opt/projects/GAIA/start-all-agents.sh
```

## COMPLETE OPERATIONS GUIDE

### Agent Management (CRITICAL PROCEDURES)

#### Prerequisites Check
```bash
# 1. PostgreSQL must be running in Docker
docker ps | grep postgres
# Should show: gaia-postgres-1 running on port 5433

# 2. Check database connectivity
docker exec gaia-postgres-1 psql -U postgres -d eliza -c '\l'

# 3. Verify character files exist
ls -la /opt/projects/GAIA/characters/*.character.json
```

#### Starting All Agents (CORRECT PROCEDURE)

**CRITICAL: Agents run as native bun processes, NOT Docker containers!**

```bash
# 1. Stop any existing agents first
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true

# 2. Start all 5 agents using the startup script
bash /opt/projects/GAIA/start-all-agents.sh

# 3. Verify all agents started
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep
```

**Expected:** 5 processes for regenai, facilitator, voiceofnature, governor, narrative

#### Database Configuration (MOST COMMON ERROR)

**CORRECT PostgreSQL URL (in startup script):**
```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
```

**WRONG configurations that cause failures:**
```bash
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza  # Empty password
PGLITE_DATA_DIR=/some/path  # Wrong database type
```

#### Web Server Management

**Nginx Configuration:**
```bash
# Check nginx status
docker ps | grep nginx

# Restart nginx if needed
docker compose stop nginx && docker compose up -d nginx --no-deps

# Test HTTPS access with basic auth
curl -u regenai:regen2025 https://regen.gaiaai.xyz/

# Rebuild nginx if configuration changed
docker compose build nginx --no-cache
```

**Web Access URLs:**
- **Main Dashboard:** https://regen.gaiaai.xyz/ (Username: `regenai`, Password: `regen2025`)
- **Admin Panel:** https://admin.regen.gaiaai.xyz/admin/

#### Troubleshooting Guide

**1. "Client password must be a string" Error**
```bash
# Fix: Update startup script with correct PostgreSQL password
grep POSTGRES_URL /opt/projects/GAIA/start-all-agents.sh
# Should show: postgresql://postgres:postgres@localhost:5433/eliza
```

**2. Agents Not Appearing on Dashboard**
```bash
# Check individual agent logs
tail -f /opt/projects/GAIA-direct/logs/regenai.log
tail -f /opt/projects/GAIA-direct/logs/facilitator.log
# Look for "Database connection verified" message
```

**3. HTTPS Not Working**
```bash
# Check SSL certificates are mounted
docker exec nginx ls -la /etc/letsencrypt/live/regen.gaiaai.xyz/

# Check nginx configuration
docker exec nginx nginx -t

# View nginx error logs
docker logs nginx --tail 20
```

**4. Nginx Proxy Issues**
```bash
# Verify nginx is pointing to host agents
docker exec nginx grep -A 3 "upstream regen_app" /etc/nginx/nginx.conf
# Should show: server 172.17.0.1:3000;

# Check agents are listening on correct ports
netstat -tlnp | grep -E ":(3000|3001|3002|3003|3004)"
```

#### Complete Restart Procedure

**Use this when troubleshooting or making changes:**
```bash
# 1. Stop everything
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
docker compose stop nginx

# 2. Verify PostgreSQL still running
docker ps | grep postgres

# 3. Start agents
bash /opt/projects/GAIA/start-all-agents.sh

# 4. Start nginx
docker compose up -d nginx --no-deps

# 5. Test access
curl -u regenai:regen2025 https://regen.gaiaai.xyz/
```

#### Key File Locations

**Startup Configuration:**
- `/opt/projects/GAIA/start-all-agents.sh` - Agent startup script with database config
- `/opt/projects/GAIA-direct/.env` - Environment variables

**Nginx Configuration:**
- `/opt/projects/GAIA/nginx-ssl.conf` - HTTPS config (production) 
- `/opt/projects/GAIA/nginx.Dockerfile` - Builds nginx with basic auth
- `/opt/projects/GAIA/docker-compose.yaml` - Services configuration

**Character Files:**
- `/opt/projects/GAIA/characters/` - Agent character definitions

**Log Files:**
- `/opt/projects/GAIA-direct/logs/[agent-name].log` - Individual agent logs

## Character Development

Each agent has a unique character file in `/opt/projects/GAIA/characters/`:
- `regenai.character.json` - Development orchestrator
- `facilitator.character.json` - Community facilitator
- `voiceofnature.character.json` - Philosophical voice
- `governor.character.json` - Governance expert
- `narrative.character.json` - Storyteller

## Documentation Structure

### Essential Docs
- **This file** - Critical config and commands
- `/opt/projects/GAIA/docs/TELEGRAM-BOT-SETUP.md` - **User guide for Regen team to interact with Telegram bots**
- `/opt/projects/GAIA/docs/TELEGRAM-TECHNICAL-REFERENCE.md` - Technical setup and troubleshooting for developers
- `/opt/projects/GAIA/docs/AGENT-OPERATIONS.md` - Detailed operations guide
- `/opt/projects/GAIA/docs/CONTRACT-JDA.md` - Full partnership agreement
- `/opt/projects/GAIA/docs/NOTION-INTEGRATION.md` - Notion knowledge integration

### Development Docs
- `/opt/projects/GAIA/.cursorrules` - ElizaOS development rules
- `/opt/projects/GAIA/README.md` - Project overview
- `/opt/projects/GAIA/AGENT.md` - Agent architecture (45k+ tokens)

## Working Principles

### For Claude Code Sessions
1. **Always check agent status first** using ps aux command
2. **Restart agents after knowledge updates** - they don't auto-reload
3. **Use bun, never npm/pnpm** for any operations
4. **Agents run natively**, not in Docker
5. **Knowledge path is recursive** - everything under `/opt/projects/GAIA/knowledge` is ingested

### Development Philosophy
- **Living Systems Thinking**: Code and ecology interconnected
- **Test Everything**: Models hallucinate, verify thoroughly
- **Document Changes**: Update relevant docs when changing operations
- **Collaborative Intelligence**: Work with existing patterns

## Quick Troubleshooting

### Agents not responding?
1. Check if running: `ps aux | grep bun.*packages/cli`
2. Check nginx: `docker ps | grep nginx`
3. View logs: `tail -50 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log`
4. Restart: `bash /opt/projects/GAIA/start-agents-hybrid.sh`

### Knowledge not updating?
- Agents must be restarted to load new knowledge
- Verify files are in `/opt/projects/GAIA/knowledge/`
- Check `KNOWLEDGE_PATH` in running process

### Database issues?
- Check Docker: `docker ps | grep postgres`
- Verify connection: `docker exec gaia-postgres-1 psql -U postgres -c '\l'`
- Check logs: `docker logs gaia-postgres-1 | tail -50`

### Plugin not updating?
- **Build plugin**: `cd /opt/projects/GAIA-direct/packages/plugin-knowledge && bun run build`
- **CRITICAL**: Copy to external dir: `cp -f dist/index.js /opt/projects/plugin-knowledge/dist/index.js`
- **Restart agents**: `pkill -f 'packages/cli/dist' && bash start-agents-hybrid.sh`
- **Test isolated**: `bun packages/cli/dist/index.js start --character /tmp/test-character.json`

### KOI System issues?
- **Check services**: `ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep`
- **KOI node not responding**: Check port 8001, restart with `cd /home/regenai/project/koi-infrastructure/koi-regen-node && source venv/bin/activate && python -m node`
- **Query server not responding**: Check port 8100, restart with `cd /opt/projects/plugin-knowledge-gaia && bun scripts/koi-query-server.ts`
- **Agent statistics wrong**: Check agent RID mappings at `curl http://localhost:8001/regen/agents`
- **Source counts incorrect**: Verify knowledge plugin source detection is working and agents have been restarted
- **Dashboard not loading**: Check nginx proxy configuration and that both services are running

### Phantom agent entries?
If you see agents with unrealistic statistics (e.g., 13K+ pending):
1. These are filtered out automatically by the phantom entry detection system
2. Check agent UUID mappings with: `curl http://localhost:8001/regen/agents`  
3. Verify database has correct agent names: `docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, name FROM agents;"`

---

*For complete ElizaOS development guidelines, see `.cursorrules`*
*For detailed operations, see `docs/AGENT-OPERATIONS.md`*
*For plugin development, see `docs/PLUGIN-DEVELOPMENT.md`*
*For contract details, see `docs/CONTRACT-JDA.md`*