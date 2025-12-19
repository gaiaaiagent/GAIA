# Regen AI Infrastructure & Systems Guide

**Last Updated**: December 10, 2025
**Version**: 2.2
**Status**: Production (All Critical Services Supervised)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture Overview](#system-architecture-overview)
3. [Core Services Inventory](#core-services-inventory)
4. [Infrastructure Components](#infrastructure-components)
5. [DevOps & Operations](#devops--operations)
6. [Reliability & Monitoring](#reliability--monitoring)
7. [Historical Performance](#historical-performance)
8. [Future Roadmap](#future-roadmap)

---

## Executive Summary

The Regen AI system is a comprehensive multi-agent AI platform focused on regenerative agriculture and the Regen Network ecosystem. It consists of **5 AI agents**, **18 data collection sensors**, **multiple processing pipelines**, and **various web interfaces** all working together to provide intelligent knowledge management and community engagement.

### Key Metrics (Current)
- **Total Services**: 35+ running processes
- **AI Agents**: 5 (RegenAI, Governor, Voice of Nature, Advocate, Narrator)
- **Data Sensors**: 18 active collectors
- **Supervised Services**: 6 critical services under Supervisor management
- **Knowledge Base**: 48,000+ documents with embeddings
- **Uptime Target**: 99.9% (new as of Dec 2025)
- **Server Location**: regen.gaiaai.xyz (202.61.196.119)

### Technology Stack
- **AI Framework**: ElizaOS 1.4.4
- **Runtime**: Bun (native processes)
- **Database**: PostgreSQL 14 with pgvector extension
- **Web Server**: Nginx (Docker)
- **Process Manager**: Supervisor
- **Containers**: Docker & Docker Compose
- **Languages**: TypeScript, Python, Node.js

---

## System Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Internet (HTTPS)                                │
│                     https://regen.gaiaai.xyz                             │
└────────────────────────────┬────────────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Nginx (Docker)  │
                    │  Ports: 80, 443  │
                    │   SSL/Routing    │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            │                │                │
     ┌──────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
     │ GAIA Agents │  │   Django   │  │  KOI        │
     │ Port: 3000  │  │ Port: 8000 │  │  Pipeline   │
     │ (5 agents)  │  │   Admin    │  │  Services   │
     └──────┬──────┘  └─────┬─────┘  └──────┬──────┘
            │                │                │
            └────────────────┼────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   Port: 5433    │
                    │  (Docker + pgvector) │
                    └─────────────────┘
```

### Data Flow Architecture

```
External Data Sources (Twitter, GitHub, Discord, etc.)
            │
            ▼
    ┌───────────────┐
    │  KOI Sensors  │ ──── 18 active sensors
    │  (Python)     │      collecting content
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  Coordinator  │ ──── Port 8005
    │   (Python)    │      Event ingestion
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ Event Bridge  │ ──── Port 8100
    │   (Python)    │      RID deduplication
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  BGE Server   │ ──── Port 8090
    │   (Python)    │      Embeddings (1024-dim)
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  PostgreSQL   │ ──── Port 5433
    │  + pgvector   │      Vector storage
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │ MCP Knowledge │ ──── Port 8200
    │    Server     │      Knowledge API
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │  GAIA Agents  │ ──── Port 3000
    │  (ElizaOS)    │      AI responses
    └───────────────┘
```

---

## Core Services Inventory

### 1. GAIA AI Agents (Port 3000)

**What It Is:**
5 AI agents built on ElizaOS framework, each with unique personalities and expertise in regenerative agriculture and Regen Network governance.

**Agents:**
| Agent Name | Character | Purpose | Status |
|------------|-----------|---------|--------|
| RegenAI | Development Orchestrator | Main agent, technical coordination | ✅ Running |
| Governor | Governance Expert | Governance proposals, voting | ✅ Running |
| Voice of Nature | Philosophical Voice | Ecological philosophy, ethics | ✅ Running |
| Advocate | Community Advocate | Community engagement, advocacy | ✅ Running |
| Narrator | Storyteller | Narrative crafting, communication | ✅ Running |

**How It Works:**
1. Users interact via Telegram bots or web UI
2. Agents use MCP (Model Context Protocol) to access knowledge base
3. Hybrid RAG (Retrieval Augmented Generation) searches 48K+ documents
4. Responses include source citations with RIDs (Resource Identifiers)
5. Every query triggers automatic knowledge retrieval

**Technology:**
- Framework: ElizaOS 1.4.4
- Runtime: Bun (native process, not Docker)
- Database: PostgreSQL with pgvector
- LLM: Configurable (currently GPT-4o-mini via OpenAI)
- Embeddings: BGE-large-en-v1.5 (1024 dimensions)

**Requirements:**
- PostgreSQL connection (port 5433)
- MCP Knowledge Server (port 8200)
- Hybrid RAG API (port 8301)
- 32GB RAM (for loading 48K docs on startup)
- Environment variables (API keys, tokens)

**Supports:**
- Telegram integration (5 bot accounts)
- Web dashboard UI
- RESTful API endpoints
- WebSocket connections

**Managed By:**
- Supervisor: `gaia-regenai` program
- Auto-restart: Yes
- Auto-start on boot: Yes
- Logs: `/opt/projects/GAIA/logs/regenai.log`

---

### 2. KOI Coordinator (Port 8005)

**What It Is:**
Central hub that receives real-time content from 18 data collection sensors and forwards it to the processing pipeline.

**How It Works:**
1. Sensors push content via HTTP POST requests
2. Coordinator validates and timestamps events
3. Events assigned unique RIDs (Resource Identifiers)
4. Forwarded to Event Bridge for deduplication
5. Handles ~1000 events/day from all sources

**Technology:**
- Language: Python 3.12
- Framework: Custom event receiver
- Protocol: HTTP/JSON

**Requirements:**
- Port 8005 available
- Network access from all sensors
- Event Bridge running (port 8100)

**Supports:**
- 18 active sensors
- Multiple content types (text, URLs, files)
- Batch processing
- Event logging

**Managed By:**
- Supervisor: `koi-coordinator` program
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Config: `/etc/supervisor/conf.d/koi-coordinator.conf`
- Logs: `/opt/projects/koi-sensors/koi_protocol/coordinator/coordinator-supervisor.log`

---

### 3. KOI Sensors (18 Active)

**What It Is:**
Distributed data collectors monitoring various platforms for regenerative agriculture content.

**Active Sensors:**
| Sensor | Platform | Collection Frequency | Content Type |
|--------|----------|---------------------|--------------|
| GitHub | GitHub repos | 30 min | Commits, PRs, issues |
| Twitter | Twitter/X | Continuous | Tweets, mentions |
| Discord | Discord servers | Real-time | Messages, threads |
| Discourse | Forum posts | 1 hour | Topics, replies |
| Telegram | Telegram channels | Real-time | Messages |
| YouTube | YouTube channels | 6 hours | Videos, descriptions |
| Medium | Medium publications | 12 hours | Articles |
| Notion | Notion pages | 24 hours | Documentation |
| Website | Web scraping | Custom | HTML content |
| Podcast | Podcast feeds | 24 hours | Episodes |
| GitLab | GitLab repos | 30 min | Commits, MRs |
| Ledger | Blockchain data | 5 min | Transactions |
| GitHub Activity | Activity monitoring | 30 min | Events |
| 5 Others | Various experimental | Varies | Mixed |

**How It Works:**
1. Each sensor runs independently in its own Python process
2. Authenticates to platform APIs using credentials from `.env`
3. Polls or streams data according to schedule
4. Normalizes data into KOI event format
5. Pushes events to Coordinator (port 8005)
6. Handles rate limiting and retries

**Technology:**
- Language: Python 3.12
- Virtual Environment: Each sensor has own venv
- Dependencies: Platform-specific (playwright, requests, etc.)

**Requirements:**
- Platform API credentials in `.env`
- Internet connectivity
- Coordinator available (port 8005)
- Individual setup scripts per sensor

**Supports:**
- Content deduplication
- Error recovery
- Log rotation
- Health monitoring

**Managed By:**
- Process: Manual starts via `start_all.sh`
- Auto-restart: ❌ Not yet configured
- Logs: `/opt/projects/koi-sensors/sensors/*/sensor.log`

---

### 4. Event Bridge v2 (Port 8100)

**What It Is:**
Deduplication and enrichment layer that processes raw events from the coordinator.

**How It Works:**
1. Receives events from Coordinator (port 8005)
2. Checks for duplicates using RID + content hashing
3. Supersedes old versions of web pages
4. Generates BGE embeddings via BGE Server (port 8090)
5. Stores in PostgreSQL with vector embeddings
6. ~200-500ms processing time per event

**Technology:**
- Language: Python 3.12
- Framework: Flask API
- Algorithm: SHA-256 content hashing + RID versioning

**Requirements:**
- PostgreSQL connection (port 5433)
- BGE Server running (port 8090)
- Coordinator feeding events (port 8005)

**Supports:**
- Content versioning
- Duplicate filtering
- Embedding generation
- Event logging

**Managed By:**
- Supervisor: `koi-event-bridge` program
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Config: `/etc/supervisor/conf.d/koi-event-bridge.conf`
- Logs: `/opt/projects/koi-processor/logs/event-bridge-supervisor.log`

---

### 5. BGE Server (Port 8090)

**What It Is:**
Embedding generation service that converts text into 1024-dimensional vectors for semantic search.

**How It Works:**
1. Receives text via HTTP POST
2. Uses BAAI/bge-large-en-v1.5 model
3. Generates 1024-dim embedding vectors
4. Returns embedding in ~100ms
5. Runs on CPU (no GPU required for this model)

**Technology:**
- Language: Python 3.12
- Model: BAAI/bge-large-en-v1.5
- Framework: Flask API
- Vector Size: 1024 dimensions

**Requirements:**
- 2GB RAM for model
- Python sentence-transformers library
- Port 8090 available

**Supports:**
- Batch embedding generation
- Caching (future)
- Multiple clients

**Managed By:**
- Supervisor: `bge-server` program
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Config: `/etc/supervisor/conf.d/bge-server.conf`
- Logs: `/opt/projects/koi-processor/logs/bge-server-supervisor.log`

---

### 6. MCP Knowledge Server (Port 8200)

**What It Is:**
Model Context Protocol server that provides knowledge access API for agents.

**How It Works:**
1. Agents connect via stdio MCP protocol
2. Provides `search_knowledge` tool
3. Queries Hybrid RAG API (port 8301)
4. Returns results with RIDs and confidence scores
5. Formats results for LLM consumption

**Technology:**
- Language: Python 3.12
- Protocol: MCP 2024-11-05 (stdio transport)
- Framework: FastAPI

**Requirements:**
- PostgreSQL connection (port 5433)
- Hybrid RAG API running (port 8301)
- MCP plugin in agents

**Supports:**
- Automatic knowledge retrieval
- Source citations
- Confidence scoring
- Multi-agent access

**Managed By:**
- Process: Auto-starts with agents
- Auto-restart: ✅ Yes (subprocess of agents)
- Logs: Embedded in agent logs

---

### 7. Hybrid RAG API (Port 8301)

**What It Is:**
Advanced search API combining BM25 (keyword) + BGE (semantic) + RRF (Reciprocal Rank Fusion) for optimal knowledge retrieval.

**How It Works:**
1. Receives query from MCP server
2. Performs 3 parallel searches:
   - BM25: Traditional keyword matching
   - BGE: Semantic similarity via vectors
   - PostgreSQL: Full-text search
3. Combines results using RRF algorithm
4. Returns top 15 results with scores
5. Average latency: ~200ms

**Technology:**
- Language: TypeScript
- Runtime: Bun
- Framework: Express
- Algorithm: Reciprocal Rank Fusion

**Requirements:**
- PostgreSQL with pgvector (port 5433)
- BGE embeddings pre-computed
- Port 8301 available

**Supports:**
- Multi-modal search
- Configurable result count
- Agent filtering
- Score normalization

**Managed By:**
- Supervisor: `hybrid-rag-api` program
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Config: `/etc/supervisor/conf.d/hybrid-rag-api.conf`
- Logs: `/opt/projects/koi-processor/logs/hybrid-rag-supervisor.log`

---

### 8. Content Dashboard (Port 8400)

**What It Is:**
Web UI for viewing and managing digests, podcasts, and curated content.

**Features:**
- Weekly digest viewer
- Daily curation dashboard
- Podcast player and management
- Content quality metrics
- Processing status monitoring

**How It Works:**
1. Flask application serves HTML/CSS/JS
2. Queries PostgreSQL for digest data
3. Real-time updates via WebSockets (Socket.IO)
4. Podcast audio served via nginx proxy

**Technology:**
- Language: Python 3.12
- Framework: Flask + Gunicorn (gevent workers)
- Frontend: Jinja2 templates + vanilla JS
- WebSockets: Socket.IO

**Requirements:**
- PostgreSQL connection (port 5433)
- Gunicorn with gevent
- Podcast audio directory

**Supports:**
- Multiple digest formats
- Audio streaming
- Content search
- Export functionality

**Managed By:**
- Supervisor: `koi-digest-dashboard` program
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Logs: `/opt/projects/koi-processor/logs/supervisor-digest.log`

**Access:**
- URL: https://regen.gaiaai.xyz/digests
- Auth: Basic (username: regenai, password: regen2025)

---

### 9. Django Admin (Port 8000)

**What It Is:**
Administrative interface for managing agents, database content, and system configuration.

**Features:**
- Agent management
- Memory database browser
- KOI graph API endpoints
- User administration
- System statistics

**How It Works:**
1. Django application in Docker container
2. Connects to PostgreSQL (port 5433)
3. Provides REST API endpoints
4. Admin UI for content management

**Technology:**
- Language: Python 3.11
- Framework: Django 4.x
- WSGI Server: Gunicorn (3 workers)
- Container: gaia-django

**Requirements:**
- PostgreSQL connection
- Docker runtime
- Nginx proxy for HTTPS

**Supports:**
- User authentication
- API endpoints (/api/koi/*)
- Database admin
- Content editing

**Managed By:**
- Docker Compose
- Auto-restart: ✅ Yes (Docker restart policy)
- Auto-start on boot: ✅ Yes
- Logs: `docker logs django-admin`

**Access:**
- URL: https://regen.gaiaai.xyz/admin
- Auth: Django admin credentials

---

### 10. PostgreSQL + pgvector (Port 5433)

**What It Is:**
Primary database storing all agent memories, embeddings, and system data.

**Data Stored:**
- 48,000+ document embeddings (1024-dim BGE vectors)
- Agent conversation memories
- User profiles and sessions
- KOI event metadata
- Digest and content data

**How It Works:**
1. PostgreSQL 14 with pgvector extension
2. Stores vectors in `dim_1024` columns
3. Cosine similarity search (<=> operator)
4. Connection pooling for multiple clients
5. Daily automated backups

**Technology:**
- Database: PostgreSQL 14
- Extension: pgvector
- Container: ankane/pgvector:latest
- Storage: Docker volume (persistent)

**Requirements:**
- 16GB+ storage
- 4GB+ RAM allocated
- Docker runtime
- Port 5433 available (localhost only)

**Supports:**
- Vector similarity search
- Full-text search
- ACID transactions
- Concurrent connections (100+)

**Managed By:**
- Docker Compose
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Health checks: ✅ Enabled
- Logs: `docker logs gaia-postgres-1`

**Backup Strategy:**
- Frequency: Daily
- Method: `pg_dumpall`
- Retention: 30 days
- Location: `/opt/projects/backups/`

---

### 11. Nginx Reverse Proxy (Ports 80, 443)

**What It Is:**
HTTPS reverse proxy routing external traffic to internal services. Currently manages 27 location blocks across 4 server blocks.

**Primary Routes (Main Domain):**
| Endpoint Group | Backend Port | Auth | Count | Purpose |
|----------------|--------------|------|-------|---------|
| **Digests Dashboard** | 8400 | No | 4 | Content dashboard + WebSocket |
| **KOI Pipeline** | 8005-8200 | No | 4 | Coordinator, Event Bridge, BGE, MCP |
| **KOI Metadata** | 8002, 8007 | No | 4 | Pipeline graph, content, transformations, RIDs |
| **MCP Knowledge** | 8301, 3030 | Yes | 5 | RAG search, stats, health, SPARQL, code graph |
| **External APIs** | 8003, 3007 | No | 2 | Registry review (ChatGPT), grant submissions |
| **Static Content** | File | No | 1 | IRL grant application |
| **GAIA Agents** | 3000 | Yes | 1 | Main web UI (catch-all) |
| **TOTAL** | - | - | **21** | Main domain endpoints |

**Admin Subdomains** (admin.regen.gaiaai.xyz, dashboard.regen.gaiaai.xyz):
| Path | Backend | Purpose |
|------|---------|---------|
| /static/ | Django | Admin CSS/JS (cached 30d) |
| /media/ | Django | User uploads (cached 30d) |
| / | Django:8000 | Admin interface |

**Critical Endpoints (MCP-Required):**
- `/api/koi/query` → Port 8301 (Hybrid RAG search, 49,169 docs)
- `/api/koi/stats` → Port 8301 (Knowledge base statistics)
- `/api/koi/health` → Port 8301 (Service health check)
- `/api/koi/fuseki/` → Port 3030 (SPARQL triplestore)
- `/api/koi/graph` → Port 8301 (Apache AGE code graph, 28,489 entities)

**Note:** These endpoints MUST use `^~` priority modifier and appear BEFORE catch-all `location /`

**How It Works:**
1. Listens on ports 80 (HTTP) and 443 (HTTPS)
2. HTTP auto-redirects to HTTPS
3. SSL/TLS certificates via Let's Encrypt
4. Basic authentication for protected routes
5. Proxies requests to backend services on localhost
6. Priority routing (`^~`) prevents catch-all interception
7. CORS enabled for browser/ChatGPT access
8. WebSocket support for real-time features

**Technology:**
- Server: Nginx 1.29.3 (Alpine-based)
- Container: gaia-nginx (custom image)
- SSL: Let's Encrypt (auto-renewal via certbot)
- Auth: HTTP Basic Auth (.htpasswd)

**Requirements:**
- Valid SSL certificates (Let's Encrypt)
- Certificates mounted from host at `/etc/letsencrypt`
- Docker network access to services
- Ports 80/443 available (system nginx must be disabled)

**Special Features:**
- **CORS Support**: `/api/koi/graph/`, `/api/registry/`
- **WebSocket Support**: `/`, `/digests/`, `/digests/socket.io`
- **Path Stripping**: `/api/koi/fuseki/` → Fuseki expects `/koi/sparql`
- **Static Caching**: 30-day cache for CSS/JS/images
- **Extended Timeouts**: 120s for Registry API, 86400s for WebSockets

**Managed By:**
- Docker Compose (container lifecycle)
- Auto-restart: ✅ Yes (restart: always)
- Auto-start on boot: ✅ Yes
- Config mounted as volume: ✅ Yes
- Logs: `docker logs nginx`

**Configuration:**
- **Primary File**: `/opt/projects/GAIA/config/nginx-ssl.conf`
- **Mounted In Container**: `/etc/nginx/nginx.conf`
- **Volume Mount**: `./config/nginx-ssl.conf:/etc/nginx/nginx.conf:ro`
- **Update Method**: `docker cp` + `nginx -s reload` (no rebuild needed)
- **Complete Reference**: See [API_ROUTING_REFERENCE.md](API_ROUTING_REFERENCE.md)

**Common Issues:**
- Missing `^~` modifier causes routes to fall through to catch-all (ElizaOS)
- Location blocks must be BEFORE `location /` or they won't match
- CORS requires `always` flag to send headers on error responses
- WebSocket needs `proxy_http_version 1.1` and upgrade headers

**Testing:**
```bash
# Test all MCP endpoints
bash /tmp/test_all_mcp.sh

# Test code graph API
bash /tmp/test_graph_api.sh

# Validate config
docker exec nginx nginx -t

# Reload after changes
docker exec nginx nginx -s reload
```

---

### 12. Apache Jena Fuseki (Port 3030)

**What It Is:**
SPARQL triplestore database for knowledge graph storage and querying.

**Data Stored:**
- 3,900+ RDF triples
- Knowledge graph relationships
- Ontology definitions
- Semantic mappings

**How It Works:**
1. Stores data as RDF triples (subject-predicate-object)
2. Provides SPARQL query endpoint
3. Supports graph traversal and reasoning
4. Persistent TDB2 storage

**Technology:**
- Database: Apache Jena Fuseki
- Container: stain/jena-fuseki
- Storage: TDB2 (persistent)
- Dataset: koi

**Requirements:**
- 4GB+ RAM
- Docker runtime
- Persistent volume

**Supports:**
- SPARQL 1.1 queries
- SPARQL Update
- Graph Store Protocol
- Web UI for queries

**Managed By:**
- Docker (multiple instances)
- Auto-restart: ✅ Yes
- Auto-start on boot: ✅ Yes
- Logs: `docker logs fuseki-koi`

**Access:**
- URL: http://localhost:3030/
- Dataset: `/koi`
- UI: http://localhost:3030/$/datasets

---

### 13. Supervisor (Process Manager)

**What It Is:**
System-level process manager ensuring critical services stay running.

**Managed Services:**
| Program | Command | Port | Status |
|---------|---------|------|--------|
| gaia-regenai | Bun ElizaOS agent | 3000 | ✅ Running |
| koi-digest-dashboard | Gunicorn Flask app | 8400 | ✅ Running |
| koi-coordinator | Python coordinator | 8005 | ✅ Running |
| koi-event-bridge | Python event bridge | 8100 | ✅ Running |
| bge-server | Python BGE embeddings | 8090 | ✅ Running |
| hybrid-rag-api | Bun TypeScript API | 8301 | ✅ Running |

**How It Works:**
1. Systemd starts supervisor on boot
2. Supervisor reads configs from `/etc/supervisor/conf.d/`
3. Starts all configured programs
4. Monitors processes every 3 seconds
5. Auto-restarts on crashes (up to 3 retries)
6. Logs all starts/stops/crashes

**Technology:**
- Software: Supervisor 4.2.x
- Init System: Systemd
- Config: INI format

**Requirements:**
- Systemd enabled
- Root/sudo access for management
- Log directory writable

**Supports:**
- Auto-restart on failure
- Process groups
- Resource limits
- Log rotation
- Remote control (supervisorctl)

**Managed By:**
- Systemd: `supervisor.service`
- Auto-start on boot: ✅ Yes
- Logs: `journalctl -u supervisor`

**Commands:**
```bash
sudo supervisorctl status          # View all processes
sudo supervisorctl restart [name]  # Restart specific service
sudo supervisorctl stop all        # Stop everything
sudo supervisorctl start all       # Start everything
```

---

## Infrastructure Components

### Server Specifications

**Provider:** Contabo VPS
**Hostname:** v2202508198462369837.ultrasrv.de
**Public IP:** 202.61.196.119
**Domain:** regen.gaiaai.xyz

**Hardware:**
- **CPU:** 12 vCores
- **RAM:** 32 GB
- **Storage:** 252 GB SSD
- **Network:** 1 Gbps
- **Location:** Germany

**Operating System:**
- **OS:** Ubuntu 24.04 LTS
- **Kernel:** 6.8.0-78-generic
- **Architecture:** x86_64

**Current Usage:**
- **Disk:** 206 GB / 252 GB (86%)
- **Memory:** ~17 GB / 32 GB (53%)
- **Swap:** 2.5 GB / 4 GB (62.5%)

---

### Network Architecture

**Firewall Rules:**
- Port 80 (HTTP): Open → Redirects to 443
- Port 443 (HTTPS): Open → Nginx
- Port 22 (SSH): Open → Administrative access
- All other ports: Closed to public (localhost only)

**Internal Port Mapping:**
```
External           Internal
443 (HTTPS)   →   80/443 (Nginx Docker)
                   ├─ 3000 (GAIA Agents)
                   ├─ 8000 (Django Admin)
                   ├─ 8400 (Digest Dashboard)
                   └─ 8301 (Hybrid RAG API)

Localhost Only:
  ├─ 5433 (PostgreSQL)
  ├─ 8005 (KOI Coordinator)
  ├─ 8090 (BGE Server)
  ├─ 8100 (Event Bridge)
  ├─ 8200 (MCP Server)
  └─ 3030 (Fuseki)
```

**DNS Configuration:**
- **Domain:** regen.gaiaai.xyz
- **Type:** A Record
- **TTL:** 3600
- **IP:** 202.61.196.119

**SSL/TLS:**
- **Provider:** Let's Encrypt
- **Certificate:** Wildcard (*.regen.gaiaai.xyz)
- **Auto-renewal:** ✅ Enabled (certbot)
- **Renewal Check:** Weekly
- **Expiry Date:** ~90 days from last renewal

---

### Storage Layout

```
/opt/projects/
  ├─ GAIA/                    # Main ElizaOS agents (22 GB)
  │   ├─ knowledge/           # 13,000+ documents
  │   ├─ characters/          # Agent definitions
  │   ├─ logs/               # Agent logs
  │   └─ node_modules/       # Dependencies (large)
  │
  ├─ koi-processor/          # Processing pipeline (8 GB)
  │   ├─ src/core/          # Core services
  │   ├─ logs/              # Service logs
  │   └─ venv/              # Python environment
  │
  ├─ koi-sensors/            # Data collectors (12 GB)
  │   └─ sensors/           # 18 sensor directories
  │       └─ */venv/        # Individual environments
  │
  ├─ backups/               # Database backups (45 GB)
  │   └─ *.sql             # Daily pg_dump files
  │
  └─ registry-eliza/        # Registry agent (3 GB)

/var/lib/docker/volumes/    # Docker persistent data (85 GB)
  ├─ postgres-data/         # PostgreSQL database
  ├─ fuseki-data/           # Fuseki triplestore
  └─ nginx-certs/           # SSL certificates

/var/log/                   # System logs (2 GB)
  ├─ nginx/                 # Nginx access/error logs
  └─ supervisor/            # Supervisor logs
```

**Storage Recommendations:**
- ⚠️ Current usage 86% - cleanup recommended
- Target: Keep below 80%
- Cleanup candidates:
  - Old backups (retain 30 days)
  - Docker unused images
  - Log rotation (retain 14 days)
  - Node_modules caches

---

### Backup Strategy

**Daily Backups (Automated):**
```bash
# PostgreSQL
Schedule: Daily at 2:00 AM UTC
Method: pg_dumpall
Retention: 30 days
Size: ~1.5 GB per backup
Location: /opt/projects/backups/
```

**Configuration Backups:**
```bash
# Critical configs
Files:
  - /etc/supervisor/conf.d/*.conf
  - /opt/projects/GAIA/nginx-ssl.conf
  - /opt/projects/GAIA/.env
  - /opt/projects/GAIA/characters/*.json

Frequency: On change (manual)
Method: Git commits
Location: GitHub repositories
```

**Docker Volumes:**
```bash
# Currently: No automated backup ❌
# Recommended: Weekly volume backup
# Volumes:
  - postgres-data (critical)
  - fuseki-data (important)
```

---

## DevOps & Operations

### Deployment Procedures

#### Standard Deployment Workflow

1. **Code Changes:**
   ```bash
   # Development on local machine
   git checkout -b feature/new-feature
   # Make changes, test locally
   git commit -m "feat: description"
   git push origin feature/new-feature
   ```

2. **Pull Request:**
   - Create PR on GitHub
   - Code review required
   - CI/CD checks (if configured)
   - Merge to develop branch

3. **Deploy to Production:**
   ```bash
   # SSH to server
   ssh user@regen.gaiaai.xyz

   # Pull latest code
   cd /opt/projects/GAIA
   git pull origin develop

   # Install dependencies if needed
   bun install

   # Restart affected services
   sudo supervisorctl restart gaia-regenai

   # Verify
   sudo supervisorctl status
   curl -I https://regen.gaiaai.xyz/
   ```

4. **Rollback Procedure:**
   ```bash
   # If deployment fails
   git log --oneline  # Find last working commit
   git reset --hard [commit-hash]
   sudo supervisorctl restart all
   ```

---

### Configuration Management

**Environment Variables:**
- **File:** `/opt/projects/GAIA/.env`
- **Contains:** API keys, tokens, passwords
- **Security:** ❌ Not in Git, ✅ 600 permissions
- **Backup:** Manual, secure location

**Supervisor Configs:**
- **Location:** `/etc/supervisor/conf.d/`
- **Format:** INI
- **Version Control:** Should be in Git (currently not ❌)

**Nginx Config:**
- **Location:** `/opt/projects/GAIA/nginx-ssl.conf`
- **Changes Require:** Docker rebuild
- **Testing:** `nginx -t` before deploying

**Agent Characters:**
- **Location:** `/opt/projects/GAIA/characters/`
- **Format:** JSON
- **Version Control:** ✅ In Git
- **Contains:** Personalities, settings, tokens

---

### Utility Scripts & Automation

**Supervisor Management Scripts:**

Created December 9, 2025 to automate and simplify infrastructure operations.

1. **Setup Script:** `/tmp/setup_koi_supervisor.sh`
   - **Purpose:** Automated creation of all 4 KOI supervisor configs
   - **Features:**
     - Automatically finds running processes
     - Creates supervisor config files
     - Stops old manual processes
     - Loads configs into supervisor
     - Tests connectivity
   - **Usage:** `sudo bash /tmp/setup_koi_supervisor.sh`
   - **Creates:** koi-coordinator, koi-event-bridge, bge-server, hybrid-rag-api configs

2. **Status Check:** `/tmp/check_koi_status.sh`
   - **Purpose:** Comprehensive health check of all services
   - **Features:**
     - Supervisor status for all services
     - Port listening checks
     - Log tails (last 15 lines per service)
     - HTTP connectivity tests
     - Color-coded output
     - Summary report
   - **Usage:** `bash /tmp/check_koi_status.sh`
   - **Use Cases:** Daily health checks, troubleshooting, monitoring

3. **Auto-Restart Test:** `/tmp/test_supervisor_autorestart.sh`
   - **Purpose:** Verify supervisor auto-restart functionality
   - **Features:**
     - Kills a process to simulate crash
     - Waits 5 seconds for detection
     - Verifies supervisor restarts service
     - Compares PIDs to confirm new process
     - Tests resilience
   - **Usage:** `sudo bash /tmp/test_supervisor_autorestart.sh`
   - **Use Cases:** Validation testing, reliability verification

4. **Port Conflict Fix (BGE):** `/tmp/fix_bge_port_conflict.sh`
   - **Purpose:** Resolve port 8090 conflicts for BGE server
   - **Features:**
     - Finds processes using port 8090
     - Kills old processes
     - Restarts via supervisor
     - Waits for startup
     - Tests connectivity
   - **Usage:** `sudo bash /tmp/fix_bge_port_conflict.sh`
   - **Use Cases:** Port conflict resolution, troubleshooting

5. **Coordinator Duplicate Fix:** `/tmp/fix_coordinator_duplicate.sh`
   - **Purpose:** Clean up duplicate coordinator processes
   - **Features:**
     - Finds old coordinator processes
     - Kills duplicates (especially Nov 26 zombies)
     - Restarts via supervisor
     - Verifies single process
     - Tests connectivity
   - **Usage:** `sudo bash /tmp/fix_coordinator_duplicate.sh`
   - **Use Cases:** Process cleanup, duplicate removal

6. **BGE Diagnostics:** `/tmp/diagnose_bge.sh`
   - **Purpose:** Deep diagnostic of BGE server issues
   - **Features:**
     - Checks supervisor status
     - Displays error and output logs
     - Shows supervisor config
     - Tests manual start
     - Checks .env file
     - Provides recommendations
   - **Usage:** `bash /tmp/diagnose_bge.sh`
   - **Use Cases:** Troubleshooting BGE failures, root cause analysis

**Script Templates:**

These scripts follow best practices and can be used as templates for managing other services:

```bash
# Standard cleanup pattern
ALL_PIDS=$(ps aux | grep "process_name" | grep -v grep | awk '{print $2}')
for pid in $ALL_PIDS; do
    sudo kill -9 $pid 2>/dev/null || true
done
sleep 2

# Port verification
if lsof -ti:PORT > /dev/null 2>&1; then
    echo "ERROR: Port still in use!"
    exit 1
fi

# Supervisor restart with verification
sudo supervisorctl restart service-name
sleep 3
sudo supervisorctl status service-name
```

**Documentation:**
- Full documentation: `/tmp/SUPERVISOR_SETUP_COMPLETE.md`
- Port conflicts: `/tmp/PORT_CONFLICTS_RESOLVED.md`
- Infrastructure guide: `/tmp/REGEN_AI_INFRASTRUCTURE_GUIDE.md` (this document)

---

### Monitoring & Logging

#### Current Monitoring (Minimal ⚠️)

**Process Monitoring:**
```bash
# Manual checks
sudo supervisorctl status           # Supervised processes
docker ps                          # Docker containers
ps aux | grep -E "python|bun"     # All processes
```

**Log Files:**
```bash
# Agent logs
tail -f /opt/projects/GAIA/logs/regenai.log

# Supervisor logs
tail -f /opt/projects/koi-processor/logs/supervisor-digest.log

# Nginx logs
docker logs nginx --tail 50

# Database logs
docker logs gaia-postgres-1 --tail 50

# System logs
journalctl -u supervisor -f
```

**Health Checks:**
```bash
# Web endpoints
curl -I -u regenai:regen2025 https://regen.gaiaai.xyz/
curl -I https://regen.gaiaai.xyz/digests

# Database
docker exec gaia-postgres-1 pg_isready

# Internal services
curl http://localhost:8090/health  # BGE Server
curl http://localhost:8005/health  # Coordinator
```

#### Recommended Monitoring (To Implement)

**External Monitoring:**
- [ ] UptimeRobot (free tier)
- [ ] Pingdom or StatusCake
- [ ] Monitor: https://regen.gaiaai.xyz/ every 5 min
- [ ] Alert: Email/SMS on downtime

**Internal Monitoring:**
- [ ] Prometheus + Grafana
- [ ] Collect metrics: CPU, RAM, disk, network
- [ ] Service-specific metrics: response time, error rate
- [ ] Dashboards for visualization

**Log Aggregation:**
- [ ] ELK Stack or Loki
- [ ] Centralized log collection
- [ ] Log search and analysis
- [ ] Alert on ERROR/CRITICAL

**Alerting:**
- [ ] Email notifications
- [ ] Slack/Discord webhooks
- [ ] PagerDuty for critical issues
- [ ] Alert escalation policy

---

### Security Practices

**Access Control:**
- ✅ SSH key-based authentication
- ✅ Firewall (ufw) enabled
- ✅ Sudo access restricted
- ⚠️ Multiple user accounts (darren, shawn, regenai)

**Application Security:**
- ✅ HTTPS enforced
- ✅ Basic authentication on sensitive endpoints
- ✅ API keys in environment variables
- ⚠️ Some services lack authentication (localhost only)

**Database Security:**
- ✅ Localhost only (127.0.0.1:5433)
- ✅ Password protected
- ✅ Regular backups
- ⚠️ No encryption at rest

**Container Security:**
- ✅ Official base images
- ⚠️ Some containers running as root
- ⚠️ No image scanning
- ✅ Isolated networks

**Secrets Management:**
- ⚠️ Environment variables in .env files
- ❌ No secrets vault (Vault, AWS Secrets Manager)
- ⚠️ API keys visible in process list

**Recommendations:**
1. Implement HashiCorp Vault or similar
2. Regular security audits
3. Container scanning (Trivy, Clair)
4. Non-root containers where possible
5. Rotate API keys quarterly
6. Enable database encryption

---

### Disaster Recovery

**Current Capabilities:**

✅ **Database Restoration:**
```bash
# Restore from backup
docker exec -i gaia-postgres-1 psql -U postgres < backup.sql
```

✅ **Configuration Restoration:**
```bash
# Git-tracked configs
git checkout [file]
```

⚠️ **Service Recovery:**
```bash
# Supervisor handles auto-restart
# Manual restart if needed
sudo supervisorctl restart all
```

**Recovery Time Objectives (RTO):**
- Database: < 30 minutes
- Web services: < 5 minutes
- Full system: < 1 hour

**Recovery Point Objectives (RPO):**
- Database: 24 hours (daily backup)
- Code: 0 (Git)
- Configuration: Variable

**Disaster Scenarios:**

1. **Server Failure:**
   - Restore from backups to new server
   - Estimated time: 4-6 hours
   - Risk: Medium

2. **Database Corruption:**
   - Restore from daily backup
   - Data loss: Up to 24 hours
   - Estimated time: 30 minutes

3. **Service Crash:**
   - Auto-restart via Supervisor
   - Estimated time: < 1 minute

4. **Security Breach:**
   - Rotate all credentials
   - Audit logs
   - Restore from clean backup
   - Estimated time: 2-4 hours

**Improvements Needed:**
- [ ] Offsite backups (cloud storage)
- [ ] Hot standby server (if budget allows)
- [ ] Automated recovery testing
- [ ] Documented runbooks
- [ ] Contact escalation list

---

## Reliability & Monitoring

### Current Uptime & Availability

**Historical Performance (Pre-Dec 2025):**
- Uptime: ~95% (estimated)
- Unplanned outages: Multiple per month
- Longest outage: 5 days (Dec 4-9, 2025)
- MTTR (Mean Time To Repair): Variable (hours to days)

**Post-Improvements (Dec 9, 2025):**
- Target uptime: 99.9%
- Supervisor auto-restart: ✅ Enabled (6 services)
- Boot persistence: ✅ Enabled
- Expected MTTR: < 5 minutes (for auto-recoverable issues)
- Port conflict resolution: ✅ Completed
- Auto-restart testing: ✅ Verified

### Reliability Improvements Implemented

**✅ December 2025 Upgrades:**

1. **Process Supervision:** (Completed Dec 9, 2025)
   - ✅ Installed Supervisor
   - ✅ Configured 6 critical services
   - ✅ Auto-restart on crashes (3 retries)
   - ✅ Systemd integration
   - ✅ All KOI pipeline services supervised

2. **Boot Persistence:** (Completed Dec 9, 2025)
   - ✅ Services auto-start on reboot
   - ✅ Docker auto-start enabled
   - ✅ No manual intervention needed
   - ✅ Tested and verified

3. **Clean Architecture:** (Completed Dec 9, 2025)
   - ✅ Resolved nginx port conflicts
   - ✅ Eliminated zombie processes (BGE, Coordinator)
   - ✅ Clear service boundaries
   - ✅ Removed duplicate processes from Nov 26

4. **Configuration Management:** (Completed Dec 9, 2025)
   - ✅ Documented all services
   - ✅ Standardized deployment
   - ✅ Version control for configs
   - ✅ Created automation scripts
   - ✅ Documented troubleshooting procedures

### Known Issues & Limitations

**⚠️ Current Limitations:**

1. **Monitoring:**
   - ❌ No external uptime monitoring
   - ❌ No automated alerting
   - ❌ Manual log checking
   - ❌ No metrics dashboard

2. **Backup:**
   - ⚠️ Daily only (24-hour RPO)
   - ⚠️ No offsite backups
   - ⚠️ Manual testing required
   - ❌ No automated recovery

3. **Documentation:**
   - ⚠️ Limited runbooks
   - ⚠️ No incident response plan
   - ⚠️ Emergency contacts unclear

4. **Resource Management:**
   - ⚠️ 86% disk usage (cleanup needed)
   - ⚠️ 62.5% swap usage (investigate)
   - ⚠️ No resource limits on services

5. **Security:**
   - ⚠️ Basic auth only
   - ❌ No secrets vault
   - ❌ No audit logging
   - ❌ No intrusion detection

### Service Level Objectives (SLOs)

**Proposed SLOs:**

| Service | Availability Target | Response Time | Error Rate |
|---------|-------------------|---------------|-----------|
| Web UI | 99.9% | < 500ms | < 0.1% |
| API Endpoints | 99.5% | < 200ms | < 1% |
| Agents | 99.9% | < 2s | < 0.5% |
| Database | 99.99% | < 50ms | < 0.01% |

**Monitoring Metrics:**
- Uptime percentage
- Response time (p50, p95, p99)
- Error rate (5xx responses)
- Resource utilization
- Alert response time

---

## Historical Performance

### Major Incidents

#### Incident #1: 5-Day Outage (Dec 4-9, 2025)

**Impact:** Complete site unavailable, 502 Bad Gateway

**Timeline:**
- **Dec 4, 21:10**: Docker nginx container accidentally started
- **Dec 4, 21:11**: System nginx failed to start (port conflict)
- **Dec 4-9**: Site returned 502 errors, no alerts triggered
- **Dec 9**: Incident discovered and resolved

**Root Causes:**
1. Docker nginx blocking ports 80/443
2. No process supervision (supervisorctl not installed)
3. No external monitoring
4. No alerting system

**Resolution:**
1. Stopped conflicting Docker container
2. Installed and configured Supervisor
3. Switched to Docker nginx exclusively
4. Implemented boot persistence

**Preventive Measures:**
- ✅ Supervisor auto-restart
- ✅ Boot persistence
- ✅ Clear architecture documentation
- ⚠️ External monitoring (still needed)

**Lessons Learned:**
1. Never assume tools are installed
2. Verify configuration changes before applying
3. External monitoring is mandatory
4. Document all running services
5. Test after every change

#### Incident #2: Port Conflicts During Supervisor Setup (Dec 9, 2025)

**Impact:** BGE Server and Coordinator had duplicate processes, causing potential restart failures

**Timeline:**
- **Dec 9, 18:22**: Automated supervisor setup script completed
- **Dec 9, 18:29**: BGE Server marked FATAL (couldn't bind to port 8090)
- **Dec 9, 18:35**: Diagnostic revealed old manual processes still running
- **Dec 9, 18:40**: Issues discovered and resolved

**Root Causes:**
1. Old manual processes from Nov 26 still running (BGE: PID 1952064, Coordinator: PID 1879211)
2. Setup script only killed first matching process (`head -1`), not all duplicates
3. BGE Server setup had no cleanup procedure at all
4. Processes were running for 13+ days (BGE) and 836+ hours (Coordinator)

**Affected Services:**
- BGE Server (port 8090): FATAL - could not start
- Coordinator (port 8005): Running but with duplicate process

**Resolution:**
1. Created `/tmp/fix_bge_port_conflict.sh` - killed old BGE process
2. Created `/tmp/fix_coordinator_duplicate.sh` - killed old coordinator
3. Both services restarted cleanly via supervisor
4. Verified no other duplicate processes remained

**Preventive Measures:**
- ✅ Updated setup script pattern to kill ALL matching processes
- ✅ Added port verification before supervisor restart
- ✅ Created diagnostic scripts for future troubleshooting
- ✅ Documented proper cleanup procedures

**Lessons Learned:**
1. Always find and kill ALL matching processes, not just first one
2. Verify ports are free before starting supervised services
3. Test auto-restart functionality immediately after setup
4. Old manual processes can persist for weeks if not cleaned up
5. Automated setup needs comprehensive cleanup procedures

#### Incident #3: MCP Endpoint Outage (Dec 10, 2025)

**Impact:** Complete MCP Knowledge Server non-functional, all 4 critical endpoints returning 404 errors

**Timeline:**
- **Dec 10, Early AM**: MCP endpoints discovered broken
- **Hour 0-1**: Launched 5 parallel agents for investigation
- **Hour 1-2**: Root cause identified (missing nginx location blocks)
- **Hour 2-3**: 3 fix attempts (first 2 failed, third succeeded)
- **Hour 3**: All endpoints verified working

**Root Causes:**
1. Docker nginx config missing location blocks for `/api/koi/query`, `/api/koi/stats`, `/api/koi/health`, `/api/koi/fuseki/`
2. Catch-all `location /` routing requests to ElizaOS (port 3000) instead of correct backends
3. Config embedded at Docker build time, not mounted as volume
4. No automated endpoint testing or monitoring
5. Configuration drift between services and routing

**Affected Services:**
- MCP Knowledge Server (port 8200): Unable to reach backend
- Hybrid RAG API (port 8301): Inaccessible via HTTPS
- Apache Jena Fuseki (port 3030): SPARQL endpoint broken
- All 5 AI Agents: No knowledge retrieval, no source citations
- 49,169 documents: Completely inaccessible

**Resolution:**
1. Added 4 priority location blocks (`^~` modifier) to nginx config
2. Used `docker cp` to update running container config
3. Reloaded nginx with `nginx -s reload`
4. Updated docker-compose.yaml to mount config as volume
5. Set restart policy to "always"
6. Created comprehensive test script for all endpoints

**Preventive Measures:**
- ✅ Config mounted as volume (persists across restarts)
- ✅ Created automated test script (`/tmp/test_all_mcp.sh`)
- ✅ Documented nginx location block requirements
- ✅ Added inline comments explaining routing
- 📝 Need: Automated endpoint monitoring
- 📝 Need: Pre-deployment validation
- 📝 Need: Deployment checklist

**Lessons Learned:**
1. Always mount configs as volumes, not embedded at build time
2. Nginx location block order and priority (`^~`) is critical
3. Test config in running container before reloading
4. Path stripping requires trailing slash in `proxy_pass`
5. Automated testing prevents silent failures
6. Configuration should be self-documenting with comments
7. Multiple validation gates catch errors before production
8. Fast feedback loops (parallel investigation) save time

**Complete Incident Report:** See [INCIDENT_003_MCP_ENDPOINT_OUTAGE.md](INCIDENT_003_MCP_ENDPOINT_OUTAGE.md)

---

### Performance Metrics

**Average Response Times:**
- Web UI (GAIA): 300-500ms
- API Endpoints: 100-300ms
- Knowledge Search: 200ms
- Embedding Generation: 100ms
- Database Queries: 10-50ms

**Resource Utilization:**
- CPU: 20-40% average, spikes to 80% during batch jobs
- RAM: 53% average (17GB/32GB)
- Disk I/O: Low (SSD helps)
- Network: Minimal (mostly API calls)

**Throughput:**
- Events processed: ~1,000/day
- API requests: ~10,000/day (estimated)
- Knowledge searches: ~500/day
- Agent messages: ~100/day

---

## Future Roadmap

### Immediate Priorities (Next 30 Days)

**🔴 Critical:**
1. **External Monitoring** (Week 1)
   - Set up UptimeRobot
   - Configure alerts (email/SMS)
   - Monitor main endpoints
   - Test alert delivery

2. **Supervisor Configuration** ✅ COMPLETED (Dec 9, 2025)
   - ✅ Added all 6 critical services to Supervisor
   - ✅ Configured all KOI pipeline services
   - ✅ Tested auto-restart behavior
   - ✅ Documented management commands
   - ✅ Resolved port conflicts

3. **Disk Space Management** (Week 2)
   - Clean up old backups
   - Remove unused Docker images
   - Implement log rotation
   - Target: < 75% usage

4. **Documentation** (Ongoing)
   - Create runbooks for common operations
   - Document emergency procedures
   - List contact information
   - Standard operating procedures

**🟡 Important:**
5. **Backup Improvements** (Week 3)
   - Set up offsite backup (AWS S3/Backblaze)
   - Test restoration procedures
   - Document recovery steps
   - Reduce RPO to 12 hours

6. **Security Hardening** (Week 4)
   - Implement secrets vault
   - Rotate all API keys
   - Enable audit logging
   - Review firewall rules

---

### Short-Term Goals (Q1 2026)

**Infrastructure:**
- [ ] Implement Prometheus + Grafana monitoring
- [ ] Set up centralized logging (ELK/Loki)
- [ ] Configure automated alerts
- [ ] Deploy health check dashboard

**Reliability:**
- [ ] Achieve 99.9% uptime
- [ ] Reduce MTTR to < 5 minutes
- [ ] Automated recovery testing
- [ ] Disaster recovery drills

**Performance:**
- [ ] Optimize database queries
- [ ] Implement response caching
- [ ] Load testing and benchmarking
- [ ] Identify bottlenecks

**Security:**
- [ ] Implement HashiCorp Vault
- [ ] Enable database encryption
- [ ] Set up intrusion detection
- [ ] Regular security audits

---

### Medium-Term Goals (2026)

**Scalability:**
- [ ] Horizontal scaling for agents (load balancing)
- [ ] Database replication (read replicas)
- [ ] Redis caching layer
- [ ] CDN for static assets

**DevOps:**
- [ ] CI/CD pipeline automation
- [ ] Automated testing (unit, integration, e2e)
- [ ] Blue-green deployments
- [ ] Canary releases

**Features:**
- [ ] Multi-region deployment
- [ ] Advanced analytics dashboard
- [ ] Real-time metrics streaming
- [ ] Self-service admin portal

**Observability:**
- [ ] Distributed tracing (Jaeger)
- [ ] APM (Application Performance Monitoring)
- [ ] Custom business metrics
- [ ] SLO dashboards

---

### Long-Term Vision (2027+)

**Architecture Evolution:**
- Kubernetes orchestration (if scale demands)
- Microservices architecture refinement
- Event-driven architecture (Kafka/NATS)
- API gateway implementation

**AI Capabilities:**
- Model fine-tuning on Regen-specific data
- Multi-modal AI (image, audio analysis)
- Advanced reasoning capabilities
- Agent collaboration protocols

**Platform Expansion:**
- Public API offering
- Third-party integrations
- Mobile applications
- Community features

**Sustainability:**
- Carbon-aware computing
- Renewable energy hosting
- Resource optimization
- Green infrastructure practices

---

## Appendix

### Quick Reference

**Essential Commands:**
```bash
# Service Management
sudo supervisorctl status
sudo supervisorctl restart [service]
docker ps
docker logs [container]

# Health Checks
curl -I -u regenai:regen2025 https://regen.gaiaai.xyz/
curl http://localhost:8090/health
docker exec gaia-postgres-1 pg_isready

# Utility Scripts (December 2025)
bash /tmp/check_koi_status.sh                    # Comprehensive health check
sudo bash /tmp/test_supervisor_autorestart.sh    # Test auto-restart
sudo bash /tmp/fix_bge_port_conflict.sh          # Fix BGE port conflicts
sudo bash /tmp/fix_coordinator_duplicate.sh       # Fix coordinator duplicates
bash /tmp/diagnose_bge.sh                        # BGE diagnostics

# Logs
tail -f /opt/projects/GAIA/logs/regenai.log
docker logs nginx --tail 50
journalctl -u supervisor -f

# Database
docker exec -it gaia-postgres-1 psql -U postgres -d eliza
```

**Emergency Contacts:**
- Infrastructure: [To be documented]
- Database: [To be documented]
- Security: [To be documented]

**Important URLs:**
- Main Site: https://regen.gaiaai.xyz/
- Admin Panel: https://regen.gaiaai.xyz/admin
- Digest Dashboard: https://regen.gaiaai.xyz/digests
- GitHub Org: https://github.com/gaiaaiagent

---

### Glossary

**BGE**: BAAI General Embedding - Chinese language model for text embeddings
**ElizaOS**: Framework for building AI agents with memory and personality
**KOI**: Knowledge Organization Infrastructure - event processing pipeline
**MCP**: Model Context Protocol - standard for agent-tool communication
**RAG**: Retrieval Augmented Generation - AI technique combining search + generation
**RID**: Resource Identifier - unique ID for tracking content and events
**RRF**: Reciprocal Rank Fusion - algorithm for combining search results
**SPARQL**: Query language for RDF databases
**Supervisor**: Process control system for managing services
**pgvector**: PostgreSQL extension for vector similarity search

---

**Document Version:** 2.2
**Last Updated:** December 10, 2025 (MCP endpoint outage resolved, nginx config persistence)
**Authors:** Infrastructure Team
**Next Review:** January 10, 2026

**Recent Changes (v2.2):**
- Added Incident #3 (MCP endpoint outage)
- Updated nginx configuration to mount as volume
- Added automated MCP endpoint testing script
- Documented nginx location block requirements
- Lessons learned from 5-agent parallel investigation
- Preventive measures for configuration management

**Previous Changes (v2.1):**
- Updated all 6 services to supervised management
- Added Incident #2 (port conflicts resolution)
- Documented utility scripts and automation tools
- Marked supervisor configuration as completed
- Updated service status and management details
