# KOI System Documentation

## Overview

The KOI (Knowledge Organization Infrastructure) system provides distributed knowledge management and monitoring for the RegenAI agent ecosystem. It implements a Resource Identifier (RID) based system for tracking agent processing and content sources.

## Current Implementation

As of August 2025, the KOI system has been fully integrated into the ElizaOS knowledge plugin architecture. The previous standalone Python implementation has been deprecated in favor of a TypeScript/Bun implementation that provides better integration with the agent ecosystem.

## Architecture

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

## Components

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

### Web Dashboard
- **Public Access**: https://regen.gaiaai.xyz/koi/
- **Features**:
  - Real-time processing statistics
  - Content source breakdown
  - Interactive query interface
  - Agent status monitoring
  - No authentication required (public access)

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

### Implementation
The source detection is implemented in the plugin-knowledge repository within the document processing pipeline.

## API Endpoints

### Public Access via HTTPS
All endpoints are publicly accessible at `https://regen.gaiaai.xyz/koi/[endpoint]`

### Available Endpoints

#### Dashboard
```
GET https://regen.gaiaai.xyz/koi/
```
Interactive web dashboard with statistics and visualizations.

#### Health Check
```bash
GET https://regen.gaiaai.xyz/koi/health
curl https://regen.gaiaai.xyz/koi/health
```

#### Agent Registry
```bash
GET https://regen.gaiaai.xyz/koi/agents
curl https://regen.gaiaai.xyz/koi/agents | jq
```

#### Statistics
```bash
GET https://regen.gaiaai.xyz/koi/stats
curl https://regen.gaiaai.xyz/koi/stats | jq
```

#### Knowledge Query
```bash
POST https://regen.gaiaai.xyz/koi/query
curl -X POST https://regen.gaiaai.xyz/koi/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is regenerative agriculture?"}' | jq
```

#### Suggested Questions
```bash
GET https://regen.gaiaai.xyz/koi/suggestions
curl https://regen.gaiaai.xyz/koi/suggestions | jq
```

## Operations

### Service Management

#### Starting the KOI Server

The KOI server runs from the plugin-knowledge repository:

```bash
# Clone the repository if not already present
cd /opt/projects
git clone https://github.com/gaiaaiagent/plugin-knowledge.git -b regenai-unified-fixes plugin-knowledge-standalone

# Install dependencies
cd plugin-knowledge-standalone
bun install

# Start the KOI query server
bun scripts/koi-query-server.ts &
```

#### Check Status
```bash
# Check if service is running
ps aux | grep -E "bun.*koi-query" | grep -v grep

# Test health endpoint
curl http://localhost:8100/health
```

#### Stop Service
```bash
# Stop KOI query server  
pkill -f "bun.*koi-query"
```

#### View Logs
The KOI server outputs logs to console. To capture logs:
```bash
# Start with log capture
bun scripts/koi-query-server.ts > koi-server.log 2>&1 &

# View logs
tail -f koi-server.log
```

### Configuration

The KOI system uses environment variables and connects to the ElizaOS PostgreSQL database:

```bash
# Database connection (uses same as agents)
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# KOI server port (default: 8100)
KOI_PORT=8100
```

## Current Statistics (as of August 2025)

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

## Troubleshooting

### Common Issues

#### Service Not Running
```bash
# Check port availability
ss -tlnp | grep 8100

# Check for process conflicts
ps aux | grep -E "bun.*8100"

# Restart service
pkill -f "bun.*koi-query"
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &
```

#### Dashboard Not Loading
```bash
# Check nginx proxy configuration
docker logs nginx | grep koi

# Test service directly
curl -s http://localhost:8100/health

# Check public access
curl -s https://regen.gaiaai.xyz/koi/health
```

#### Agent Statistics Incorrect
```bash
# Check agent mappings
curl -s http://localhost:8100/agents | jq

# Verify database agent records  
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, name FROM agents;"
```

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

## KOI Knowledge Graph Visualization (New - January 2025)

### Overview
A comprehensive web-based knowledge graph visualization system has been implemented, providing interactive exploration of the KOI knowledge base through SPARQL queries and visual interfaces.

### Architecture
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

### Components

#### Frontend (React)
- **Location**: `/Users/darrenzal/projects/RegenAI/GAIA/packages/client/src/routes/koi/`
- **URL**: `http://localhost:5173/koi` (development) / `https://regen.gaiaai.xyz/koi` (production)
- **Features**:
  - **Natural Language Query Interface**: Convert English questions to SPARQL
  - **SPARQL Editor**: Direct SPARQL query execution with syntax validation
  - **Graph Explorer**: Interactive Sigma.js network visualization (6 nodes, 5 edges)
  - **Essence Radar**: D3.js radar chart showing essence alignments (Re-Whole Value, Nest Caring, Harmonize Agency)
  - **Tabbed Interface**: Organized navigation between different visualization modes

#### Backend API (Django)
- **Location**: `/Users/darrenzal/projects/RegenAI/GAIA/django_admin/koi_graph/`
- **Endpoints**:
  - `/api/koi/nl-query/` - Natural language to SPARQL conversion and execution
  - `/api/koi/sparql/` - Direct SPARQL query execution
  - `/api/koi/graph-data/` - Graph visualization data (✅ IMPLEMENTED - returns real SPARQL data)
  - `/api/koi/essence-data/` - Essence alignment visualization data
  - `/api/koi/health/` - Service health check

#### SPARQL Triplestore (Apache Jena Fuseki)
- **Service**: Apache Jena Fuseki
- **Port**: 3030
- **Dataset**: `/koi`
- **Data**: RDF triples from sample-koi-data.ttl with documents, concepts, processes, and essence alignments
- **Query Endpoint**: `http://fuseki:3030/koi/sparql`
- **Update Endpoint**: `http://fuseki:3030/koi/update`

### Key Features

#### Natural Language to SPARQL
- **Model**: OpenAI GPT-4 for query generation
- **Ontology-Aware**: Uses KOI ontology structure for accurate query generation
- **Validation**: Syntax validation before execution
- **Caching**: PostgreSQL-based result caching for performance

#### Real Data Integration (✅ WORKING)
- **Status**: Successfully implemented - backend API now returns real SPARQL data from Apache Jena Fuseki
- **Sample Data**: 50 RDF triples including:
  - 3 Document entities with titles and essence alignment scores
  - 3 Concept entities (Regenerative Agriculture, Carbon Sequestration, Ecosystem Health)
  - 2 Metabolic Process entities (Soil Carbon Enhancement, Biodiversity Restoration)
  - Relationship mappings between all entities
- **Query Results**: Graph Explorer displays 6 nodes and 5 edges from real triplestore data

#### Visualization Components
- **Sigma.js Graph**: Interactive network visualization with node clustering and edge relationships
- **D3.js Essence Radar**: Three-axis radar chart showing alignment scores for KOI essence types
- **Mock Data Fallbacks**: Graceful fallback to test data when APIs unavailable

### Data Model

#### RDF Ontology
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

#### Essence Types
- **Re-Whole Value**: Alignment with regenerative wholeness principles
- **Nest Caring**: Alignment with caring and nurturing approaches  
- **Harmonize Agency**: Alignment with collaborative agency and harmony

### API Documentation

#### Natural Language Query
```bash
curl -X POST http://localhost:8000/api/koi/nl-query/ \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me documents about regenerative agriculture"}'
```

#### Direct SPARQL Query
```bash
curl -X POST http://localhost:8000/api/koi/sparql/ \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 10"}'
```

#### Graph Visualization Data
```bash
curl "http://localhost:8000/api/koi/graph-data/?max_nodes=100&depth=2"
```

### Development Setup

#### Prerequisites
- Bun v1.2.15+ (for React frontend)
- Python 3.10+ with Poetry (for Django backend)
- Docker (for Apache Jena Fuseki)
- OpenAI API key (for natural language processing)

#### Quick Start
```bash
# 1. Start Apache Jena Fuseki
docker run -d --name fuseki-koi -p 3030:3030 \
  apache/jena-fuseki:latest /jena-fuseki/run --file /tmp/koi-data.ttl /koi

# 2. Start Django backend
cd django_admin
poetry install
poetry run python manage.py migrate
poetry run python manage.py runserver 8000

# 3. Start React frontend  
cd packages/client
bun install
bun run dev  # Starts on port 5173

# 4. Access KOI visualization
open http://localhost:5173/koi
```

#### Load Sample Data
```bash
# Load sample RDF data into Fuseki
curl -X POST http://localhost:3030/koi/data \
  -H "Content-Type: text/turtle" \
  --data-binary @sample-koi-data.ttl
```

### Implementation Status

#### ✅ Completed (Phase 1)
- Django koi_graph app with models, services, views, URLs
- React KOI page with tabbed interface and components
- SPARQL service integration with Apache Jena Fuseki
- Graph visualization with real data from triplestore
- Mock data fallbacks for testing
- Natural language query interface (UI ready)
- SPARQL editor interface (UI ready)
- Sample RDF data with 50 triples

#### 🔄 In Progress (Phase 2)
- Connect natural language interface to Django NL-to-SPARQL service
- Connect SPARQL editor to Django SPARQL execution service
- Implement essence radar visualization with real alignment data

#### 📋 Planned (Phase 3)
- Advanced Sigma.js features (clustering, filtering, search)
- Provenance timeline visualization
- Real-time query performance metrics
- SPARQL query builder interface
- Export functionality (JSON, CSV, RDF)

### Configuration

#### Environment Variables
```bash
# Django Backend
KOI_SPARQL_ENDPOINT=http://fuseki:3030/koi/sparql
KOI_SPARQL_UPDATE_ENDPOINT=http://fuseki:3030/koi/update
KOI_SPARQL_TIMEOUT=30
OPENAI_API_KEY=your-openai-key

# React Frontend
VITE_API_BASE_URL=http://localhost:8000
```

#### Docker Compose Integration
```yaml
services:
  fuseki:
    image: apache/jena-fuseki:latest
    ports:
      - "3030:3030"
    command: ["/jena-fuseki/run", "--file", "/tmp/sample-data.ttl", "/koi"]
    
  django-koi:
    build: ./django_admin
    ports:
      - "8000:8000" 
    depends_on:
      - fuseki
      - postgres
```

### Troubleshooting

#### Common Issues

**SPARQL Connection Errors**
```bash
# Check Fuseki service
curl http://localhost:3030/$/ping

# Test SPARQL endpoint
curl -X POST http://localhost:3030/koi/sparql \
  -H "Content-Type: application/sparql-query" \
  -d "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"
```

**Frontend API Errors**
```bash
# Check Django service
curl http://localhost:8000/api/koi/health/

# Verify CORS settings in django_admin/settings.py
CORS_ALLOWED_ORIGINS = ["http://localhost:5173"]
```

**Graph Visualization Issues**
- **No nodes displayed**: Check browser console for API errors
- **Sigma.js errors**: Verify D3.js and Sigma.js dependencies loaded
- **Mock data shown**: API endpoints not available, using fallback data

### Related Files
- `/Users/darrenzal/projects/RegenAI/GAIA/sample-koi-data.ttl` - Sample RDF data
- `/Users/darrenzal/projects/RegenAI/GAIA/django_admin/koi_graph/` - Backend API implementation
- `/Users/darrenzal/projects/RegenAI/GAIA/packages/client/src/routes/koi/` - Frontend implementation

## Future Enhancements

### Planned Features  
- Real-time processing status updates via WebSocket
- Content source analytics dashboard
- Agent performance metrics visualization
- Multi-agent collaboration tracking
- Knowledge graph expansion with production data
- Advanced SPARQL query optimization

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