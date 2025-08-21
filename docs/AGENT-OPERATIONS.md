# GAIA Agent Operations Guide

## Current Deployment Architecture

The GAIA agents are deployed in a **hybrid architecture**:

- **Agents**: Run as native bun processes (NOT Docker containers)
- **Database**: PostgreSQL with pgvector in Docker
- **Web Proxy**: Nginx in Docker
- **Admin Panel**: Django in Docker

## Agent Process Details

### Location
- **Running from**: `/opt/projects/GAIA-direct`
- **Characters from**: `/opt/projects/GAIA/characters`
- **Knowledge from**: `/opt/projects/GAIA/knowledge`
- **Logs**: `/opt/projects/GAIA-direct/logs/all-agents-hybrid.log`

### Current Configuration (as of Aug 20, 2025)
```bash
LOG_LEVEL=info
TEXT_PROVIDER=google
TEXT_MODEL=gemini-1.5-flash
TEXT_EMBEDDING_MODEL=text-embedding-3-small
CTX_KNOWLEDGE_ENABLED=true
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
KNOWLEDGE_PATH=/opt/projects/GAIA/knowledge
LOAD_DOCS_ON_STARTUP=false
PORT=3001
```

### Process Information
- **Main Process PID**: 907394 (as of Aug 16)
- **Command**: `bun packages/cli/dist/index.js start`
- **Characters Loaded**: 5 agents (RegenAI, Facilitator, Voice of Nature, Governor, Narrative)

## Checking Agent Status

### Are the agents running?
```bash
# Check for ElizaOS processes
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

# If output shows processes, agents are running
# If no output, agents are NOT running
```

### View agent logs
```bash
# Real-time logs
tail -f /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Last 100 lines
tail -100 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log
```

### Check web access
```bash
# Test if agents are responding
curl -s https://regen.gaiaai.xyz/ | head -20

# Or check nginx proxy
docker logs nginx | tail -20
```

## Starting/Stopping Agents

### Start agents (recommended method)
```bash
# Use the provided script
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

### Stop agents
```bash
# Kill all ElizaOS processes
pkill -f 'packages/cli/dist/index.js start'

# Verify they're stopped
ps aux | grep -E "bun.*packages/cli/dist/index.js" | grep -v grep
```

### Restart agents (full restart)
```bash
# Stop
pkill -f 'packages/cli/dist/index.js start'
sleep 3

# Start
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

## Knowledge Base Updates

When new content is added to `/opt/projects/GAIA/knowledge`:

1. **With LOAD_DOCS_ON_STARTUP=false** (current setting):
   - Agents will NOT automatically load new knowledge
   - Must restart agents to load new content

2. **To force knowledge reload**:
   ```bash
   # Restart agents
   pkill -f 'packages/cli/dist/index.js start'
   bash /opt/projects/GAIA/start-agents-hybrid.sh
   ```

3. **Recent Addition** (Aug 20, 2025):
   - Added 606 Notion pages to `/opt/projects/GAIA/knowledge/regen-network/notion/`
   - Agents need restart to process this new content

## Docker Services

### Check Docker services
```bash
# View all GAIA-related containers
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Expected output:
# nginx            Up X days    0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
# django-admin     Up X days    0.0.0.0:8000->8000/tcp
# gaia-postgres-1  Up X days    127.0.0.1:5433->5432/tcp
```

### Database operations
```bash
# Connect to PostgreSQL
docker exec -it gaia-postgres-1 psql -U postgres -d eliza

# Backup database
docker exec gaia-postgres-1 pg_dump -U postgres eliza > backup.sql

# Check database size
docker exec gaia-postgres-1 psql -U postgres -c "SELECT pg_database_size('eliza') / 1024 / 1024 AS size_mb;"
```

## Troubleshooting

### Agents not responding at https://regen.gaiaai.xyz/

1. **Check if agents are running**:
   ```bash
   ps aux | grep -E "bun.*packages/cli/dist/index.js" | grep -v grep
   ```

2. **Check nginx is running**:
   ```bash
   docker ps | grep nginx
   ```

3. **Check agent logs for errors**:
   ```bash
   tail -50 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log
   ```

4. **Check nginx proxy logs**:
   ```bash
   docker logs nginx | tail -50
   ```

5. **Restart everything**:
   ```bash
   # Stop agents
   pkill -f 'packages/cli/dist/index.js start'
   
   # Restart nginx
   docker-compose restart nginx
   
   # Start agents
   bash /opt/projects/GAIA/start-agents-hybrid.sh
   ```

### Knowledge not being used

1. **Verify knowledge path**:
   ```bash
   ls -la /opt/projects/GAIA/knowledge/regen-network/
   ```

2. **Check if KNOWLEDGE_PATH is set correctly**:
   ```bash
   ps aux | grep "KNOWLEDGE_PATH" | grep -v grep
   ```

3. **Restart agents to reload knowledge**:
   ```bash
   pkill -f 'packages/cli/dist/index.js start'
   bash /opt/projects/GAIA/start-agents-hybrid.sh
   ```

## KOI System Operations

The KOI (Knowledge Organization Infrastructure) system provides monitoring and management of the knowledge processing pipeline.

### KOI Services Status
```bash
# Check if KOI services are running
ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep

# Expected output:
# python -m node (KOI node server on port 8001)
# bun scripts/koi-query-server.ts (Query server on port 8100)
```

### KOI Service Management
```bash
# Start KOI node server
cd /home/regenai/project/koi-infrastructure/koi-regen-node
source venv/bin/activate && python -m node &

# Start KOI query server
cd /opt/projects/plugin-knowledge-gaia
bun scripts/koi-query-server.ts &

# Check KOI dashboard
curl -s http://localhost:8100/health | jq

# View agent RID mappings
curl -s http://localhost:8001/regen/agents | jq '.agents'
```

### KOI Dashboard Access
- **Web Interface**: https://regen.gaiaai.xyz/koi/
- **Features**: Real-time agent statistics, content source breakdown, query interface
- **Monitoring**: Agent processing status with proper name mapping

### KOI Troubleshooting
```bash
# Check KOI node server logs
tail -f /home/regenai/project/koi-infrastructure/koi-regen-node/koi-node.log

# Check KOI query server logs  
tail -f /opt/projects/plugin-knowledge-gaia/koi-server-fixed.log

# Test KOI knowledge query
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What are regenerative finance mechanisms?"}' | jq
```

## Important Notes

1. **Agents run outside Docker** - This is intentional for performance and direct file system access
2. **Single ElizaOS instance** - All 5 agents run in one process, available via UI dropdown
3. **Knowledge loading** - Currently set to NOT load on startup (LOAD_DOCS_ON_STARTUP=false)
4. **Port 3001** - Agents listen on this port, nginx proxies from port 80/443
5. **Hybrid model config** - Using Gemini for chat, OpenAI for embeddings
6. **KOI system** - Provides RID-based agent identification and knowledge monitoring

## Related Documentation

- `/opt/projects/GAIA/CLAUDE.md` - Main development documentation
- `/opt/projects/GAIA/docs/NOTION-INTEGRATION.md` - Notion knowledge integration details
- `/opt/projects/GAIA/start-agents-hybrid.sh` - Agent startup script