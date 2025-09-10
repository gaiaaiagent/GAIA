# KOI MCP Deployment Guide

## Overview

This guide covers the deployment of the KOI (Knowledge Organization Infrastructure) pipeline with MCP (Model Context Protocol) integration for BGE semantic search capabilities. The system enables Eliza agents to perform high-quality semantic searches across 48,000+ regenerative agriculture and Regen Network documents.

## Architecture

```
KOI Sensors → KOI Coordinator → KOI Event Bridge v2 → BGE Embeddings → PostgreSQL → Eliza Agents
                                                                                         ↓
                                                                                    MCP Server
                                                                                         ↓
                                                                                  BGE Semantic Search
```

### Components

1. **KOI Coordinator** (Port 8100)
   - Receives sensor events
   - Routes to processing pipeline
   - Manages sensor registration

2. **KOI Event Bridge v2** (Port 8100)
   - Processes incoming events with RID-based deduplication
   - Generates BGE embeddings (1024-dimensional)
   - Stores in PostgreSQL with pgvector using isolated tables
   - Version control for UPDATE events

3. **KOI Permissions API** (Port 8300)
   - Manages agent knowledge access permissions
   - Provides UI for permission management
   - Controls data source visibility per agent

4. **BGE MCP Server** (stdio)
   - TypeScript implementation using Anthropic's MCP SDK
   - Provides semantic search tools to agents
   - Connects to PostgreSQL for vector similarity search

## Prerequisites

### System Requirements
- PostgreSQL with pgvector extension
- Python 3.8+
- Node.js 18+ and Bun
- Redis (optional, for caching)
- 8GB+ RAM recommended

### Database Setup
```sql
-- Ensure pgvector extension is installed
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify BGE embeddings exist
SELECT COUNT(*) FROM embeddings WHERE dim_1024 IS NOT NULL;
-- Should return 48,000+ embeddings
```

## Installation

### 1. Copy KOI Pipeline Components

The KOI processor components are now included in the GAIA repository:

```bash
cd /path/to/GAIA
ls koi-processor/
# Should contain:
# - bge-mcp-ts/     # BGE MCP server
# - *.py            # Python services
# - start-*.sh      # Startup scripts
```

### 2. Install Dependencies

#### Python Dependencies
```bash
cd koi-processor
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### TypeScript Dependencies (BGE MCP Server)
```bash
cd koi-processor/bge-mcp-ts
bun install
```

### 3. Configure Environment Variables

Create or update `.env` file:
```bash
# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Service Ports
COORDINATOR_PORT=8100
EVENT_BRIDGE_PORT=8888
PERMISSIONS_API_PORT=8300

# BGE API
BGE_API_BASE=http://localhost:8001
```

## Starting Services

### Option 1: Start All Services at Once

```bash
cd koi-processor
chmod +x start-all-koi-services.sh
./start-all-koi-services.sh
```

This will start:
- KOI Coordinator on port 8100
- KOI Event Bridge v2 on port 8100
- KOI Permissions API on port 8300

### Option 2: Start Services Individually

```bash
# Start Coordinator
./start-coordinator.sh

# Start Event Bridge v2
python koi_event_bridge_v2.py

# Start Permissions API
./start-permissions-api.sh
```

### Verify Services

```bash
# Check service health
curl http://localhost:8100/health  # Coordinator
curl http://localhost:8100/  # Event Bridge v2
curl http://localhost:8300/health  # Permissions API

# Check service status
lsof -i:8100
lsof -i:8888
lsof -i:8300
```

## Agent Configuration

### Adding MCP to Existing Agents

#### Automatic Configuration
Use the provided script to add MCP to all production agents:

```bash
cd scripts
chmod +x add-mcp-to-characters.sh
./add-mcp-to-characters.sh
# Type 'yes' to confirm
```

#### Manual Configuration
Add the following to your character file:

```json
{
  "plugins": [
    // ... existing plugins ...
    "@elizaos/plugin-mcp"
  ],
  "settings": {
    // ... existing settings ...
    "mcp": {
      "servers": {
        "bge-search": {
          "type": "stdio",
          "command": "./koi-processor/bge-mcp-ts/run-bge-mcp.sh",
          "args": [],
          "env": {
            "POSTGRES_URL": "${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
          }
        }
      }
    }
  }
}
```

### Testing MCP Integration

1. Start an agent with MCP:
```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
bun packages/cli/dist/index.js start \
--character characters/narrative-with-mcp.character.json \
--port 3010
```

2. Test semantic search:
```
You: What do we know about regenerative agriculture?
Agent: [Uses bge_search tool to search knowledge base]
```

## UI Access

### KOI Knowledge Manager
Access the web interface at http://localhost:3010/koi

Features:
- Knowledge tab for managing agent permissions
- Pipeline Monitor for real-time status
- Graph Explorer for knowledge visualization
- Query Interface for SPARQL queries

### Permissions Management

1. Navigate to Knowledge tab
2. Select an agent from the list
3. Toggle access to specific data sources
4. Click "Save Changes" to apply

## Monitoring

### View Logs

```bash
# KOI service logs
tail -f koi-processor/KOI_Coordinator.log
tail -f koi-processor/KOI_Event_Bridge.log
tail -f koi-processor/KOI_Permissions_API.log

# Agent logs (will show MCP interactions)
tail -f logs/[agent-name].log
```

### Check Pipeline Flow

```bash
# Send test sensor event
python3 test-website-sensor.py

# Monitor processing
watch -n 1 'curl -s http://localhost:8888/stats'
```

## Stopping Services

### Stop All Services
```bash
cd koi-processor
./stop-all-koi-services.sh
```

### Stop Individual Services
```bash
# By port
lsof -ti:8100 | xargs kill  # Coordinator
lsof -ti:8100 | xargs kill  # Event Bridge v2
lsof -ti:8300 | xargs kill  # Permissions API

# By process name
pkill -f koi_coordinator
pkill -f koi_event_bridge_v2
pkill -f koi_permissions_api
```

## Troubleshooting

### MCP Server Not Connecting
1. Check PostgreSQL is running: `pg_isready -h localhost -p 5433`
2. Verify BGE embeddings exist: `SELECT COUNT(*) FROM embeddings WHERE dim_1024 IS NOT NULL;`
3. Check MCP server script is executable: `chmod +x koi-processor/bge-mcp-ts/run-bge-mcp.sh`
4. Look for errors in agent logs: `grep -i mcp logs/[agent-name].log`

### Services Not Starting
1. Check port availability: `lsof -i:8100` (should return nothing if port is free)
2. Verify Python environment: `which python3` and `python3 --version`
3. Check Redis if configured: `redis-cli ping`
4. Review service logs for errors

### Permission Denied Errors
```bash
# Make all scripts executable
chmod +x koi-processor/*.sh
chmod +x koi-processor/bge-mcp-ts/*.sh
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -h localhost -p 5433 -U postgres -d eliza -c "SELECT 1;"

# Check pgvector extension
psql -h localhost -p 5433 -U postgres -d eliza -c "SELECT extversion FROM pg_extension WHERE extname = 'vector';"
```

## Production Deployment

### Server Setup

1. **Install Dependencies**
```bash
# On production server
sudo apt update
sudo apt install python3-venv postgresql-client redis-tools

# Install Bun
curl -fsSL https://bun.sh/install | bash
```

2. **Clone Repository**
```bash
cd /opt/projects
git clone https://github.com/your-org/GAIA.git
cd GAIA
git checkout feat/koi-provenance-visualization
```

3. **Configure Environment**
```bash
cp .env.example .env
# Edit .env with production values
```

4. **Start Services**
```bash
cd koi-processor
./start-all-koi-services.sh
```

5. **Configure Systemd (Optional)**
Create service files for automatic startup:

```ini
# /etc/systemd/system/koi-coordinator.service
[Unit]
Description=KOI Coordinator Service
After=postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/projects/GAIA/koi-processor
Environment="POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza"
ExecStart=/opt/projects/GAIA/koi-processor/start-coordinator.sh
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable koi-coordinator
sudo systemctl start koi-coordinator
```

## Performance Tuning

### PostgreSQL Optimization
```sql
-- Increase work memory for vector operations
ALTER SYSTEM SET work_mem = '256MB';

-- Optimize for vector similarity searches
ALTER SYSTEM SET maintenance_work_mem = '512MB';

-- Reload configuration
SELECT pg_reload_conf();
```

### Index Optimization
```sql
-- Create optimized index for BGE vectors
CREATE INDEX CONCURRENTLY idx_embeddings_bge_vector 
ON embeddings 
USING ivfflat (dim_1024 vector_cosine_ops)
WITH (lists = 100);
```

## Security Considerations

1. **Database Credentials**: Never commit database credentials to git
2. **Network Security**: Use firewall rules to restrict service ports
3. **API Authentication**: Consider adding authentication to KOI services
4. **SSL/TLS**: Use HTTPS in production environments

## Support

For issues or questions:
1. Check logs in `koi-processor/*.log`
2. Review agent logs for MCP errors
3. Consult the main GAIA documentation
4. Open an issue on GitHub

## Version History

- v1.0.0 - Initial KOI MCP integration
- v1.1.0 - Added permissions management UI
- v1.2.0 - TypeScript BGE MCP server implementation