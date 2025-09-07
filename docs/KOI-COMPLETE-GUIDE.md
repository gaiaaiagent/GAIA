# KOI Complete Guide

This comprehensive guide covers the complete KOI (Knowledge Organization Infrastructure) system including setup, architecture, operations, and the knowledge graph visualization interface.

## Overview

The KOI system provides distributed knowledge management, monitoring, and visualization for the RegenAI agent ecosystem. It implements a Resource Identifier (RID) based system for tracking agent processing and content sources, along with an advanced SPARQL-based knowledge graph visualization system.

## Current Implementation Status (January 2025)

As of January 2025, the KOI system has evolved into two complementary implementations:

1. **Knowledge Management & Statistics** - TypeScript/Bun implementation fully integrated into the ElizaOS knowledge plugin architecture
2. **Knowledge Graph Visualization** - New SPARQL-based visualization system with React frontend and Django backend

The previous standalone Python implementation has been deprecated in favor of these integrated solutions.

## System Architecture

### Overall System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  KOI Query      │    │   Web Dashboard │    │    Nginx Proxy  │
│  Server         │────│  (Built-in HTML)│────│   (Public URL)  │
│  (Port 8100)    │    │                 │    │ regen.gaiaai.xyz│
│ TypeScript/Bun  │    │                 │    │      /koi/      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  (Port 5433)    │
                    │   ElizaOS DB    │
                    └─────────────────┘
```

### Knowledge Graph Visualization Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Web UI │    │  Django REST API│    │ Apache Jena     │
│   (Frontend)    │────│   (Backend)     │────│ Fuseki SPARQL   │
│   Port 5173     │    │   Port 8000     │    │   Port 3030     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  (Query Cache)  │
                    │   Port 5432     │
                    └─────────────────┘
```

## System Components

### KOI Query Server (Port 8100)
- **Purpose**: Knowledge querying, agent statistics, web dashboard, API endpoints
- **Location**: Runs from the forked plugin-knowledge repository
- **Technology**: TypeScript with Bun runtime
- **Repository**: https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes
- **Key Features**:
  - Real-time agent statistics
  - Knowledge base querying
  - Built-in web dashboard interface
  - Agent identity mapping
  - RESTful API endpoints

### Apache Jena Fuseki (Port 3030)
- **Purpose**: SPARQL triplestore database for knowledge graph data
- **Container**: stain/jena-fuseki
- **Dataset**: koi (with persistent TDB2 storage)
- **Key Features**:
  - RDF triple storage and querying
  - SPARQL endpoint for complex queries
  - Persistent data storage
  - 3900+ production triples

### KOI API Server (Port 8001) - Legacy Graph System
- **Purpose**: Flask-based API server for original graph visualization
- **Technology**: Python/Flask
- **Key Features**:
  - Graph data API endpoints
  - SPARQL query proxy
  - Health monitoring

### React Frontend - Knowledge Graph Visualization
- **Location**: `packages/client/src/routes/koi/`
- **URL**: `http://localhost:5173/koi` (development) / `https://regen.gaiaai.xyz/koi` (production)
- **Features**:
  - **Natural Language Query Interface**: Convert English questions to SPARQL
  - **SPARQL Editor**: Direct SPARQL query execution with syntax validation
  - **Graph Explorer**: Interactive Sigma.js network visualization (6 nodes, 5 edges)
  - **Essence Radar**: D3.js radar chart showing essence alignments
  - **Tabbed Interface**: Organized navigation between different visualization modes

### Django Backend API (Port 8000)
- **Location**: `django_admin/koi_graph/`
- **Endpoints**:
  - `/api/koi/nl-query/` - Natural language to SPARQL conversion and execution
  - `/api/koi/sparql/` - Direct SPARQL query execution
  - `/api/koi/graph-data/` - Graph visualization data
  - `/api/koi/essence-data/` - Essence alignment visualization data
  - `/api/koi/health/` - Service health check

### Nginx Proxy
- **Purpose**: Reverse proxy for HTTPS access and routing
- **Configuration**: Routes `/api/koi/` to appropriate backend services
- **Public URLs**: 
  - https://regen.gaiaai.xyz/koi/ (main dashboard)
  - https://regen.gaiaai.xyz/KOI (alternative route)

## Prerequisites

- Docker and Docker Compose
- Python 3.10+ with Poetry (for Django backend)
- Bun v1.2.15+ (for building React frontend)
- 4GB+ RAM for Fuseki
- OpenAI API key (for natural language processing)
- PostgreSQL database

## Complete Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/gaiaaiagent/GAIA.git
cd GAIA
```

### 2. Set Up Apache Jena Fuseki SPARQL Database

```bash
# Create persistent volume
docker volume create fuseki-data

# Start Fuseki container
docker run -d \
  --name fuseki-koi \
  -p 3030:3030 \
  -v fuseki-data:/fuseki \
  -v $(pwd)/koi-data:/staging:ro \
  -e ADMIN_PASSWORD=admin \
  stain/jena-fuseki

# Wait for startup
sleep 5

# Create KOI dataset
curl -X POST --user admin:admin 'http://localhost:3030/$/datasets' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'dbName=koi&dbType=tdb2'

# Load sample data
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@sample-koi-data.ttl' \
  -H 'Content-Type: text/turtle'

# Load production data (optional, 3900+ triples)
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@koi-data/koi-entities-production.ttl' \
  -H 'Content-Type: text/turtle'
```

### 3. Set Up Django Backend API

```bash
# Install Python dependencies
cd django_admin
pip install poetry
poetry install

# Run migrations
poetry run python manage.py migrate

# Start Django server
poetry run python manage.py runserver 8000 &
```

### 4. Set Up KOI Query Server

```bash
# Clone the plugin-knowledge repository if not already present
cd /opt/projects
git clone https://github.com/gaiaaiagent/plugin-knowledge.git -b regenai-unified-fixes plugin-knowledge-standalone

# Install dependencies
cd plugin-knowledge-standalone
bun install

# Start the KOI query server
bun scripts/koi-query-server.ts &
```

### 5. Set Up Legacy Flask API Server (Optional)

```bash
# Install Flask dependencies
sudo apt-get update
sudo apt-get install -y python3-flask python3-flask-cors python3-requests

# Start in screen session for persistence
screen -dmS koi-api bash -c 'cd koi-data && python3 koi_api_server.py'

# Verify it's running
curl http://localhost:8001/api/koi/health/
```

### 6. Build React Frontend

```bash
# Install bun if not present
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Build the client with KOI components
cd packages/client
bun install

# For development
bun run dev  # Starts on port 5173

# For production build
bun vite build

# Copy build to server dist (IMPORTANT for ElizaOS integration!)
cd ../..
rm -rf packages/server/dist/client/*
cp -r packages/client/dist/* packages/server/dist/client/
```

### 7. Configure Nginx Proxy

Add the following to your `nginx-ssl.conf` file before the main `location /` block:

```nginx
# KOI Graph API proxy
location /api/koi/ {
    proxy_pass http://172.17.0.1:8001/api/koi/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_Set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Ssl on;
    
    # CORS headers for graph visualization
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Accept" always;
}

# Django KOI API proxy
location /api/koi/ {
    proxy_pass http://localhost:8000/api/koi/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    
    # CORS headers
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Accept, Authorization" always;
}
```

Then rebuild and restart nginx:

```bash
docker compose build nginx
docker compose up -d nginx --no-deps
```

### 8. Start ElizaOS Agents

```bash
# Use the full path to bun if not in PATH
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

## Agent RID System

Each agent receives a canonical Resource Identifier (RID) following this format:
```
[relevance].[type].[subject].v[major].[minor].[patch]
```

### Current Agent Mappings

| Agent Name | Character Name | Status | UUID |
|------------|---------------|--------|------|
| RegenAI | RegenAI | active | 8e1e4498-b3c8-0fae-ad1f-e90d1c1a4331 |
| Advocate | Advocate | active | 5b4a0683-da89-0d56-aebc-03985cb8c8cc |
| Voice of Nature | VoiceOfNature | active | 8acf7e3c-53a0-087b-88df-05867d0fd1d5 |
| Governor | Governor | active | 156cca7b-a15e-05aa-8929-5d95bf5494be |
| Narrator | Narrator | active | 7de19cb6-ad0e-0a27-b290-9bd52b248847 |

## Source Metadata System

The knowledge plugin preserves content source information based on file paths:

### Source Detection Logic
- `/knowledge/notion/` → `notion` (Regen Network Notion pages)
- `/knowledge/twitter/` → `twitter` (Twitter/X content)
- `/knowledge/medium/` → `medium` (Medium articles)
- `/knowledge/discord/` → `discord` (Discord conversations)
- `/knowledge/website/` → `website` (Web scraped content)
- Default → `documents` (Generic documents)

## Accessing the System

### Web Interfaces
- **Main Dashboard**: https://regen.gaiaai.xyz/koi/ (with basic auth)
- **Knowledge Graph Visualization**: https://regen.gaiaai.xyz/koi (new SPARQL-based system)
- **Direct Graph URLs**: /koi and /KOI (both work)
- **Development**: http://localhost:5173/koi (React dev server)

### Public API Endpoints

#### KOI Query Server (Statistics & Management)
All endpoints are publicly accessible at `https://regen.gaiaai.xyz/koi/[endpoint]`

- `GET /health` - System health check
- `GET /agents` - Agent registry
- `GET /stats` - Processing statistics
- `POST /query` - Knowledge query
- `GET /suggestions` - Suggested questions

#### Knowledge Graph API (Django Backend)
- `POST /api/koi/nl-query/` - Natural language to SPARQL conversion
- `POST /api/koi/sparql/` - Direct SPARQL query execution
- `GET /api/koi/graph-data/` - Graph visualization data
- `GET /api/koi/essence-data/` - Essence alignment data
- `GET /api/koi/health/` - Service health check

#### Legacy Graph API (Flask Backend)
- `GET /api/koi/health/` - System health check
- `GET /api/koi/graph-data/` - Get graph visualization data
- `POST /api/koi/sparql/` - Execute SPARQL queries
- `GET /api/koi/essence-data/` - Get essence alignment data

## Knowledge Graph Data Model

### RDF Ontology
```turtle
@prefix koi: <http://koi.regen.network/ontology/> .
@prefix regen: <http://regen.network/ontology#> .

# Essence Alignments
koi:hasEssenceAlignment [
    koi:essenceType "Re-Whole Value" ;
    koi:alignmentScore 0.89
] .

# Entity Relationships  
regen:connects <concept> .
regen:relatesTo <process> .
```

### Essence Types
- **Re-Whole Value**: Alignment with regenerative wholeness principles
- **Nest Caring**: Alignment with caring and nurturing approaches  
- **Harmonize Agency**: Alignment with collaborative agency and harmony

## Configuration

### Environment Variables

#### Django Backend
```bash
KOI_SPARQL_ENDPOINT=http://fuseki:3030/koi/sparql
KOI_SPARQL_UPDATE_ENDPOINT=http://fuseki:3030/koi/update
KOI_SPARQL_TIMEOUT=30
OPENAI_API_KEY=your-openai-key
```

#### React Frontend
```bash
VITE_API_BASE_URL=http://localhost:8000
```

#### KOI Query Server
```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
KOI_PORT=8100
```

### Client Build Location

ElizaOS serves the client from `packages/server/dist/client/`, NOT from `packages/client/dist/`. After building the client, you MUST copy the files:

```bash
cp -r packages/client/dist/* packages/server/dist/client/
```

### API Endpoint Configuration

The KOI API endpoints in the React client should use relative paths when behind a proxy:
- Development: `http://localhost:8001/api/koi/` or `http://localhost:8000/api/koi/`
- Production: `/api/koi/` (proxied through nginx)

## Current Statistics (January 2025)

- **92,690+ content items** tracked across all sources
- **27,276 processed documents** 
- **5 active agents** monitoring and processing
- **12 content sources** including:
  - Notion workspaces
  - Twitter/X feeds
  - Medium articles
  - Discord conversations
  - Website content
  - GitHub repositories

## Operations

### Service Management

#### Starting All Services

```bash
# 1. Start Fuseki (if not running)
docker start fuseki-koi

# 2. Start Django backend
cd django_admin
poetry run python manage.py runserver 8000 &

# 3. Start KOI query server
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &

# 4. Start legacy Flask API (optional)
screen -dmS koi-api bash -c 'cd koi-data && python3 koi_api_server.py'

# 5. Start React frontend (development)
cd packages/client
bun run dev &
```

#### Check Service Status

```bash
# Check Fuseki
docker ps | grep fuseki-koi
curl http://localhost:3030/$/ping

# Check Django backend
curl http://localhost:8000/api/koi/health/

# Check KOI query server
ps aux | grep -E "bun.*koi-query" | grep -v grep
curl http://localhost:8100/health

# Check legacy Flask API
curl http://localhost:8001/api/koi/health/

# Check React frontend
curl http://localhost:5173/koi
```

#### Stop Services

```bash
# Stop all KOI services
pkill -f "bun.*koi-query"
pkill -f "python.*manage.py.*runserver"
screen -X -S koi-api quit
docker stop fuseki-koi
```

### Maintenance

#### Restart Services

```bash
# Restart Fuseki
docker restart fuseki-koi

# Restart KOI query server
pkill -f "bun.*koi-query"
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &

# Restart Django backend
pkill -f "python.*manage.py.*runserver"
cd django_admin
poetry run python manage.py runserver 8000 &

# Restart legacy API server
screen -X -S koi-api quit
screen -dmS koi-api bash -c 'cd koi-data && python3 koi_api_server.py'

# Restart agents
pkill -f 'packages/cli/dist/index.js'
cd /opt/projects/GAIA
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

#### Update Data

```bash
# Load new RDF data into Fuseki
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@new-data.ttl' \
  -H 'Content-Type: text/turtle'
```

#### Monitor Logs

```bash
# KOI query server logs
bun scripts/koi-query-server.ts > koi-server.log 2>&1 &
tail -f koi-server.log

# Django backend logs
poetry run python manage.py runserver 8000 > django-koi.log 2>&1 &
tail -f django-koi.log

# Legacy API server logs
screen -r koi-api

# Fuseki logs
docker logs fuseki-koi

# Agent logs
tail -f /tmp/agents.log
```

## Troubleshooting

### Common Issues

#### Service Not Running

```bash
# Check port availability
ss -tlnp | grep 8100  # KOI query server
ss -tlnp | grep 8000  # Django backend
ss -tlnp | grep 3030  # Fuseki
ss -tlnp | grep 8001  # Legacy Flask API

# Check for process conflicts
ps aux | grep -E "bun.*8100"
ps aux | grep -E "python.*8000"

# Restart services
pkill -f "bun.*koi-query"
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &
```

#### Graph Button Not Visible

1. Ensure client is rebuilt with latest changes
2. Copy build to server dist: `cp -r packages/client/dist/* packages/server/dist/client/`
3. Restart agents

#### Fuseki Not Persisting Data

1. Ensure Docker volume is created: `docker volume create fuseki-data`
2. Use `tdb2` for persistent storage, not `mem`
3. Check dataset exists: `curl --user admin:admin http://localhost:3030/$/datasets`

#### API Returns 405 or 404 Errors

1. Check Fuseki endpoint is `/koi/sparql` for POST requests
2. Ensure Content-Type header is `application/x-www-form-urlencoded` or `application/sparql-query`
3. Verify dataset name is "koi"

#### Dashboard Not Loading

```bash
# Check nginx proxy configuration
docker logs nginx | grep koi

# Test services directly
curl -s http://localhost:8100/health
curl -s http://localhost:8000/api/koi/health/

# Check public access
curl -s https://regen.gaiaai.xyz/koi/health
```

#### SPARQL Connection Errors

```bash
# Check Fuseki service
curl http://localhost:3030/$/ping

# Test SPARQL endpoint
curl -X POST http://localhost:3030/koi/sparql \
  -H "Content-Type: application/sparql-query" \
  -d "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
```

#### Frontend API Errors

```bash
# Check Django service
curl http://localhost:8000/api/koi/health/

# Verify CORS settings in django_admin/settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

#### Agent Statistics Incorrect

```bash
# Check agent mappings
curl -s http://localhost:8100/agents | jq

# Verify database agent records  
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, name FROM agents;"
```

#### Graph Visualization Issues

- **No nodes displayed**: Check browser console for API errors
- **Sigma.js errors**: Verify D3.js and Sigma.js dependencies loaded
- **Mock data shown**: API endpoints not available, using fallback data

### Port Conflicts

- Fuseki: 3030
- Django Backend: 8000
- KOI Query Server: 8100  
- Legacy Flask API: 8001
- ElizaOS: 3000
- React Dev Server: 5173
- Ensure no other services use these ports

## Data Files

- `sample-koi-data.ttl` - Sample RDF data (50 triples)
- `koi-data/koi-entities-production.ttl` - Production data (3900+ triples)
- `koi-data/koi_api_server.py` - Legacy Flask API server
- `django_admin/koi_graph/` - Django backend implementation
- `packages/client/src/routes/koi/` - React frontend implementation

## Integration with GAIA System

### Knowledge Plugin Integration
The KOI system is fully integrated with the ElizaOS knowledge plugin to:

1. **Track Processing**: Monitor which agents process which documents
2. **Preserve Metadata**: Maintain source information from file paths
3. **Filter Statistics**: Remove phantom entries from agent statistics
4. **Map Identities**: Connect agent UUIDs to display names

### Database Schema
The KOI system uses tables in the PostgreSQL database:

- `koi_content_sources` - Track content sources and their metadata
- `koi_content_items` - Individual content items with RIDs
- `koi_processing_status` - Agent processing status per content item

### Agent Restart Impact
When agents are restarted:

1. **Knowledge Reload**: New knowledge files are processed
2. **Statistics Update**: Processing statistics are refreshed
3. **Source Detection**: New source metadata is applied

## Implementation Status

### ✅ Completed Features
- Django koi_graph app with models, services, views, URLs
- React KOI page with tabbed interface and components
- SPARQL service integration with Apache Jena Fuseki
- Graph visualization with real data from triplestore
- Mock data fallbacks for testing
- Natural language query interface (UI ready)
- SPARQL editor interface (UI ready)
- Sample RDF data with 50+ triples
- Agent statistics and monitoring
- Real-time processing tracking

### 🔄 In Progress Features
- Connect natural language interface to Django NL-to-SPARQL service
- Connect SPARQL editor to Django SPARQL execution service
- Implement essence radar visualization with real alignment data

### 📋 Planned Features
- Advanced Sigma.js features (clustering, filtering, search)
- Provenance timeline visualization
- Real-time query performance metrics
- SPARQL query builder interface
- Export functionality (JSON, CSV, RDF)
- Real-time processing status updates via WebSocket
- Content source analytics dashboard
- Agent performance metrics visualization
- Multi-agent collaboration tracking

## Migration Notes

### Previous Implementation (Deprecated)
The original KOI implementation was located at `/home/regenai/project/koi-infrastructure/` and used:
- Python/FastAPI framework
- Port 8001 for the node server
- Separate KOI-net protocol implementation

This has been fully replaced by the integrated TypeScript implementation in the plugin-knowledge repository.

### Backup Location
A backup of the old implementation is stored at:
```
/opt/projects/koi-infrastructure-backup-[date].tar.gz
```

## Production Deployment Checklist

- [ ] Fuseki container running with persistent volume
- [ ] Django backend running on port 8000
- [ ] KOI query server running on port 8100
- [ ] Legacy Flask API server running on port 8001 (optional)
- [ ] Client built with KOI components
- [ ] Client build copied to `packages/server/dist/client/`
- [ ] Nginx configured with `/api/koi/` proxy routes
- [ ] Agents started with full bun path
- [ ] Graph button visible in sidebar
- [ ] KOI routes (/koi and /KOI) accessible
- [ ] API health checks return success
- [ ] Graph data loads properly
- [ ] SPARQL queries execute successfully
- [ ] All visualization components working

## Future Enhancements

### Monitoring Integration
- OpenTelemetry support for metrics
- Prometheus endpoint exposure  
- Grafana dashboard templates
- Alert rules for service health

## Related Documentation

- `/opt/projects/GAIA/CLAUDE.md` - Main development documentation
- `/opt/projects/GAIA/docs/AGENT-OPERATIONS.md` - Agent operations guide
- `/opt/projects/GAIA/docs/RAG_TROUBLESHOOTING_GUIDE.md` - RAG system debugging
- `/opt/projects/GAIA/docs/NOTION-INTEGRATION.md` - Knowledge integration details
- Plugin-knowledge repository: https://github.com/gaiaaiagent/plugin-knowledge