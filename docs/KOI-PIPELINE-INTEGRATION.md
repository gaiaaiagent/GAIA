# KOI Pipeline Integration Guide

This guide documents the complete flow from sensors to agents in the KOI (Knowledge Organization Infrastructure) system, covering the entire pipeline architecture, setup, and integration procedures.

## Architecture Overview

The KOI pipeline follows this complete flow from data collection to agent processing:

### High-Level Pipeline Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│    Data         │    │   Knowledge     │    │   Processing    │    │    Agents       │
│   Sensors       │────│  Coordinator    │────│   Processor     │────│  (ElizaOS)      │
│                 │    │                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │                       │
         │                       │                       │                       │
         ▼                       ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Raw Sources   │    │  File System    │    │   PostgreSQL    │    │   Character     │
│ • Notion Pages  │    │ • /knowledge/   │    │ • ElizaOS DB    │    │     Files       │
│ • Twitter/X     │    │ • Structured    │    │ • Vector Store  │    │ • MCP Config    │
│ • Discord       │    │ • Categorized   │    │ • Embeddings    │    │ • Plugins       │
│ • Medium        │    │ • Metadata      │    │ • Statistics    │    │ • Behaviors     │
│ • Websites      │    │ • Source Tags   │    │ • Processing    │    │ • Evaluators    │
│ • GitHub        │    │                 │    │   Status        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Detailed System Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────┐
│                           KOI PIPELINE INTEGRATION                                    │
├──────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐                  │
│  │   Data Sources  │    │   Coordinators  │    │   Processors    │                  │
│  │                 │    │                 │    │                 │                  │
│  │  Notion API     │    │  File Manager   │    │  Knowledge      │                  │
│  │  Twitter API    │────│  Source Tagger  │────│  Plugin         │                  │
│  │  Discord Bot    │    │  Metadata       │    │  Vector Store   │                  │
│  │  Web Scrapers   │    │  Categorizer    │    │  Embeddings     │                  │
│  │  GitHub API     │    │                 │    │                 │                  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘                  │
│           │                       │                       │                         │
│           │                       │                       │                         │
│           ▼                       ▼                       ▼                         │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                        PostgreSQL Database                                   │   │
│  │                         (Port 5433)                                         │   │
│  │                                                                              │   │
│  │  • documents          • memories           • koi_content_sources            │   │
│  │  • knowledge          • relationships      • koi_content_items              │   │
│  │  • agents            • participants        • koi_processing_status          │   │
│  │  • accounts          • rooms               • embeddings                     │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                              │
│                                      │                                              │
│                                      ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                        ElizaOS Agents                                       │   │
│  │                                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │   │
│  │  │   RegenAI   │  │  Advocate   │  │  Governor   │  │ Voice of    │        │   │
│  │  │   Agent     │  │   Agent     │  │   Agent     │  │  Nature     │        │   │
│  │  │             │  │             │  │             │  │   Agent     │        │   │
│  │  │ • MCP       │  │ • MCP       │  │ • MCP       │  │ • MCP       │        │   │
│  │  │ • Plugins   │  │ • Plugins   │  │ • Plugins   │  │ • Plugins   │        │   │
│  │  │ • Knowledge │  │ • Knowledge │  │ • Knowledge │  │ • Knowledge │        │   │
│  │  │ • RAG       │  │ • RAG       │  │ • RAG       │  │ • RAG       │        │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
│                                      │                                              │
│                                      │                                              │
│                                      ▼                                              │
│  ┌──────────────────────────────────────────────────────────────────────────────┐   │
│  │                    KOI Visualization & Monitoring                            │   │
│  │                                                                              │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │   │
│  │  │ KOI Query   │  │ Knowledge   │  │ Apache Jena │  │ Django API  │        │   │
│  │  │ Server      │  │ Graph UI    │  │ Fuseki      │  │ Backend     │        │   │
│  │  │ (Port 8100) │  │ React App   │  │ (Port 3030) │  │ (Port 8000) │        │   │
│  │  │             │  │             │  │             │  │             │        │   │
│  │  │ • Stats     │  │ • Sigma.js  │  │ • SPARQL    │  │ • NL Query  │        │   │
│  │  │ • Health    │  │ • D3.js     │  │ • RDF Store │  │ • Graph API │        │   │
│  │  │ • Agents    │  │ • Tabbed UI │  │ • Triples   │  │ • Health    │        │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │   │
│  └──────────────────────────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────────────────┘
```

## Repository Structure

The KOI pipeline integrates three main repositories:

### 1. GAIA Repository (Main Orchestrator)
**Location**: `~/projects/GAIA` (or your project directory)
**Role**: Primary coordination, agent management, and user interfaces
**Key Components**:
- ElizaOS agents and character files
- Knowledge management system
- Web interfaces and dashboards
- Docker orchestration
- Configuration management

### 2. Plugin-Knowledge Repository (Processing Engine)  
**Location**: `/opt/projects/plugin-knowledge-standalone`
**Repository**: https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes
**Role**: Knowledge processing, statistics, and monitoring
**Key Components**:
- KOI Query Server (TypeScript/Bun)
- Agent statistics and monitoring
- Knowledge base querying
- RID (Resource Identifier) system
- Source metadata management

### 3. Knowledge Repository (Data Storage)
**Location**: `/opt/projects/knowledge` (if separate) or `GAIA/knowledge/`
**Role**: Structured knowledge storage and categorization
**Key Components**:
- Categorized content files
- Source-specific directories
- Metadata preservation
- File organization

## Complete Setup Instructions

### Phase 1: Repository Setup

#### 1.1. Clone All Repositories

```bash
# Main GAIA repository
cd ~/projects  # Or your projects directory
git clone https://github.com/gaiaaiagent/GAIA.git
cd GAIA

# Plugin-knowledge repository
cd /opt/projects
git clone https://github.com/gaiaaiagent/plugin-knowledge.git -b regenai-unified-fixes plugin-knowledge-standalone

# Ensure knowledge directory exists
mkdir -p /opt/projects/GAIA/knowledge
```

#### 1.2. Install Dependencies

```bash
# GAIA repository dependencies
cd GAIA
bun install

# Build client
cd packages/client
bun install
bun vite build
cd ../..
cp -r packages/client/dist/* packages/server/dist/client/

# Plugin-knowledge dependencies
cd /opt/projects/plugin-knowledge-standalone
bun install

# Django backend dependencies
cd django_admin
pip install poetry
poetry install
```

### Phase 2: Database Infrastructure

#### 2.1. PostgreSQL Setup

```bash
# Start PostgreSQL container (if using Docker Compose)
cd GAIA
docker compose up -d postgres

# Verify connection
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT version();"

# Run migrations
cd django_admin
poetry run python manage.py migrate
```

#### 2.2. Apache Jena Fuseki Setup

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
sleep 10

# Create KOI dataset
curl -X POST --user admin:admin 'http://localhost:3030/$/datasets' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'dbName=koi&dbType=tdb2'

# Verify dataset creation
curl --user admin:admin 'http://localhost:3030/$/datasets' | jq

# Load sample data
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@sample-koi-data.ttl' \
  -H 'Content-Type: text/turtle'

# Verify data load
curl -X POST --user admin:admin 'http://localhost:3030/koi/sparql' \
  -H 'Content-Type: application/sparql-query' \
  -d 'SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }'
```

### Phase 3: Knowledge Processing Pipeline

#### 3.1. Knowledge Directory Structure

```bash
# Create knowledge directory structure
mkdir -p knowledge/{notion,twitter,discord,medium,website,github,documents}

# Example content organization
knowledge/
├── notion/
│   ├── regen-network-overview.md
│   ├── carbon-methodology.md
│   └── ecosystem-services.md
├── twitter/
│   ├── regen-updates-2024.md
│   └── community-discussions.md
├── discord/
│   ├── technical-discussions.md
│   └── governance-chat.md
├── medium/
│   ├── regenerative-agriculture-articles.md
│   └── web3-ecosystem-posts.md
├── website/
│   ├── regen-network-docs.md
│   └── partner-resources.md
└── documents/
    ├── research-papers.md
    └── technical-specifications.md
```

#### 3.2. Source Detection Configuration

The knowledge plugin automatically detects sources based on file paths:

```typescript
// Source detection logic (implemented in plugin-knowledge)
const detectSource = (filePath: string): string => {
    if (filePath.includes('/knowledge/notion/')) return 'notion';
    if (filePath.includes('/knowledge/twitter/')) return 'twitter';
    if (filePath.includes('/knowledge/discord/')) return 'discord';
    if (filePath.includes('/knowledge/medium/')) return 'medium';
    if (filePath.includes('/knowledge/website/')) return 'website';
    if (filePath.includes('/knowledge/github/')) return 'github';
    return 'documents';
};
```

### Phase 4: Service Layer Setup

#### 4.1. Start Core Services

```bash
# Terminal 1: Start KOI Query Server
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts

# Terminal 2: Start Django Backend
cd django_admin
poetry run python manage.py runserver 8000

# Terminal 3: Start React Frontend (development)
cd packages/client
bun run dev

# Terminal 4: Legacy Flask API (optional)
cd koi-data
python3 koi_api_server.py
```

#### 4.2. Verify Services

```bash
# Check all services are running
curl http://localhost:8100/health | jq        # KOI Query Server
curl http://localhost:8000/api/koi/health/ | jq  # Django Backend
curl http://localhost:5173/koi                   # React Frontend
curl http://localhost:3030/$/ping               # Fuseki
```

### Phase 5: Agent Configuration

#### 5.1. Character File Configuration with MCP

**Note**: The MCP plugin must be installed in your project:
```bash
# Install the MCP plugin (if not already in package.json)
bun add @elizaos/plugin-mcp
```

Example character file with KOI integration:

```json
{
  "name": "RegenAI",
  "description": "AI agent focused on regenerative agriculture and ecosystem services",
  "modelProvider": "openai",
  "settings": {
    "model": "gpt-4o-mini",
    "embeddingModel": "text-embedding-ada-002"
  },
  "plugins": [
    "plugin-knowledge"
  ],
  "knowledge": [
    {
      "path": "knowledge/notion",
      "source": "notion"
    },
    {
      "path": "knowledge/twitter", 
      "source": "twitter"
    },
    {
      "path": "knowledge/discord",
      "source": "discord"
    }
  ],
  "clients": ["discord", "twitter"],
  "bio": [
    "Expert in regenerative agriculture practices",
    "Knowledgeable about carbon sequestration methodologies",
    "Focused on ecosystem health and biodiversity",
    "Committed to sustainable land management practices"
  ],
  "lore": [
    "Developed deep understanding of soil health through analyzing thousands of agricultural documents",
    "Specializes in connecting traditional farming wisdom with modern scientific research",
    "Passionate about supporting farmers in transition to regenerative practices"
  ],
  "messageExamples": [
    [
      {
        "user": "user", 
        "content": {
          "text": "What are the key principles of regenerative agriculture?"
        }
      },
      {
        "user": "RegenAI",
        "content": {
          "text": "Regenerative agriculture focuses on rebuilding soil health through practices like cover cropping, diverse rotations, minimizing tillage, integrating livestock, and maintaining living roots. These principles work together to sequester carbon, enhance biodiversity, and improve water retention while maintaining productive farming systems."
        }
      }
    ]
  ],
  "postExamples": [
    "Just analyzed new research on mycorrhizal networks - the underground fungal connections between plants can increase carbon storage by up to 30%. Nature's internet is more sophisticated than we imagined! #RegenerativeAgriculture #SoilHealth",
    "Working with farmers to implement holistic planned grazing systems. Early results show 40% improvement in soil organic matter and significant biodiversity increases. Proof that livestock can be part of the climate solution when managed properly."
  ],
  "topics": [
    "regenerative agriculture",
    "carbon sequestration", 
    "soil health",
    "biodiversity",
    "ecosystem services",
    "sustainable farming",
    "climate solutions",
    "land restoration"
  ],
  "style": {
    "all": [
      "Speak with scientific accuracy while remaining accessible",
      "Reference specific research and data when possible",
      "Connect traditional knowledge with modern science",
      "Focus on practical, actionable solutions",
      "Maintain optimism about regenerative potential",
      "Use clear, educational language"
    ],
    "chat": [
      "Be conversational but informative",
      "Ask follow-up questions to understand context",
      "Provide specific examples and case studies",
      "Offer practical next steps"
    ],
    "post": [
      "Share insights from recent research",
      "Highlight successful regenerative projects",
      "Use relevant hashtags",
      "Include data and metrics when available"
    ]
  },
  "adjectives": [
    "knowledgeable",
    "practical", 
    "optimistic",
    "evidence-based",
    "collaborative",
    "innovative",
    "systems-thinking",
    "solution-oriented"
  ]
}
```

#### 5.2. MCP Server Configuration

Create MCP configuration for each agent:

```json
{
  "mcpServers": {
    "knowledge": {
      "command": "node",
      "args": ["dist/knowledge-server.js"],
      "env": {
        "POSTGRES_URL": "postgresql://postgres:postgres@localhost:5433/eliza",
        "KOI_ENDPOINT": "http://localhost:8100"
      }
    },
    "web-search": {
      "command": "npx",
      "args": ["@modelcontextprotocol/server-web-search"]
    },
    "filesystem": {
      "command": "npx", 
      "args": ["@modelcontextprotocol/server-filesystem"],
      "env": {
        "ALLOWED_DIRECTORIES": "./knowledge"
      }
    }
  }
}
```

### Phase 6: Agent Startup and Orchestration

#### 6.1. Start All Agents

```bash
# Start agents with character files
cd GAIA

bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

#### 6.2. Verify Agent Registration

```bash
# Check agents are registered
curl http://localhost:8100/agents | jq

# Check agent statistics
curl http://localhost:8100/stats | jq

# Verify database agent records
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT id, name FROM agents ORDER BY created_at DESC LIMIT 5;"
```

## Testing and Verification Procedures

### Test 1: Knowledge Processing Pipeline

```bash
# 1. Add test knowledge file
cat > knowledge/notion/test-document.md << 'EOF'
# Test Document: Regenerative Agriculture Basics

## Introduction
Regenerative agriculture is a farming practice that focuses on rebuilding soil health and biodiversity.

## Key Principles
- Cover cropping
- Diverse rotations  
- Minimal tillage
- Integrated livestock

## Carbon Sequestration
Healthy soils can sequester significant amounts of carbon dioxide from the atmosphere.
EOF

# 2. Restart agents to process new knowledge
pkill -f 'packages/cli/dist/index.js'
bun packages/cli/dist/index.js start --character characters/regenai.character.json &

# 3. Wait for processing
sleep 30

# 4. Verify processing
curl http://localhost:8100/stats | jq '.sources.notion'

# 5. Test knowledge retrieval
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question": "What are the key principles of regenerative agriculture?"}' | jq
```

### Test 2: SPARQL Integration

```bash
# 1. Test Fuseki connection
curl -X POST http://localhost:3030/koi/sparql \
  -H "Content-Type: application/sparql-query" \
  -d "SELECT ?s ?p ?o WHERE { ?s ?p ?o } LIMIT 5"

# 2. Test Django SPARQL API
curl -X POST http://localhost:8000/api/koi/sparql/ \
  -H "Content-Type: application/json" \
  -d '{"query": "SELECT (COUNT(*) as ?count) WHERE { ?s ?p ?o }"}' | jq

# 3. Test graph data endpoint
curl "http://localhost:8000/api/koi/graph-data/?max_nodes=10" | jq
```

### Test 3: Web Interface Integration

```bash
# 1. Test KOI dashboard access
curl -s http://localhost:8100/ | grep -o '<title>.*</title>'

# 2. Test React frontend
curl -s http://localhost:5173/koi | grep -o '<title>.*</title>'

# 3. Test API endpoints
curl http://localhost:8100/health | jq
curl http://localhost:8000/api/koi/health/ | jq
```

### Test 4: Agent-Knowledge Integration

```bash
# 1. Check agent memory storage
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT COUNT(*) FROM memories WHERE agent_id IN (SELECT id FROM agents);"

# 2. Check knowledge document processing
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT COUNT(*) FROM documents WHERE metadata->>'source' IS NOT NULL;"

# 3. Test agent response with knowledge
# This requires interaction with the running agents through their configured clients
```

## Configuration Examples

### Environment Variables

Create `.env` file in GAIA repository root:

```bash
# Database Configuration
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/eliza

# OpenAI Configuration  
OPENAI_API_KEY=your-openai-api-key-here

# KOI Configuration
KOI_PORT=8100
KOI_SPARQL_ENDPOINT=http://localhost:3030/koi/sparql
KOI_SPARQL_UPDATE_ENDPOINT=http://localhost:3030/koi/update
KOI_SPARQL_TIMEOUT=30

# Django Configuration
DJANGO_SECRET_KEY=your-django-secret-key-here
DJANGO_DEBUG=False
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://regen.gaiaai.xyz

# Agent Configuration
AGENT_LOG_LEVEL=info
ENABLE_KNOWLEDGE_PLUGIN=true

# Discord/Twitter (if using)
DISCORD_BOT_TOKEN=your-discord-bot-token
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-twitter-access-token
TWITTER_ACCESS_SECRET=your-twitter-access-secret
```

### Docker Compose Integration

Add to `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:13
    ports:
      - "5433:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: eliza
    volumes:
      - postgres_data:/var/lib/postgresql/data

  fuseki:
    image: stain/jena-fuseki
    ports:
      - "3030:3030"
    environment:
      ADMIN_PASSWORD: admin
    volumes:
      - fuseki_data:/fuseki
      - ./koi-data:/staging:ro
    command: ["/jena-fuseki/run", "--file", "/staging/sample-koi-data.ttl", "/koi"]

  django-koi:
    build: ./django_admin
    ports:
      - "8000:8000"
    environment:
      KOI_SPARQL_ENDPOINT: http://fuseki:3030/koi/sparql
      POSTGRES_URL: postgresql://postgres:postgres@postgres:5432/eliza
    depends_on:
      - postgres
      - fuseki
    volumes:
      - ./knowledge:/app/knowledge:ro

  nginx:
    build: ./nginx
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - django-koi
    volumes:
      - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro

volumes:
  postgres_data:
  fuseki_data:
```

### Nginx Configuration

Add to `nginx-ssl.conf`:

```nginx
upstream koi_query_server {
    server 172.17.0.1:8100;
}

upstream django_koi {
    server django-koi:8000;
}

upstream fuseki {
    server fuseki:3030;
}

server {
    listen 443 ssl http2;
    server_name regen.gaiaai.xyz;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # KOI Dashboard
    location /koi/ {
        proxy_pass http://koi_query_server/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }

    # Django KOI API
    location /api/koi/ {
        proxy_pass http://django_koi/api/koi/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        
        # CORS headers
        add_header Access-Control-Allow-Origin "*" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Content-Type, Accept, Authorization" always;
    }

    # SPARQL endpoint (optional direct access)
    location /sparql/ {
        proxy_pass http://fuseki/koi/sparql/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Main application
    location / {
        proxy_pass http://172.17.0.1:3000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

## Troubleshooting Common Issues

### Issue 1: Agents Not Processing Knowledge

**Symptoms**:
- Agent statistics show 0 processed documents
- Knowledge queries return no results
- Database shows no memory entries

**Diagnosis**:
```bash
# Check knowledge directory exists and has content
ls -la knowledge/
find knowledge/ -name "*.md" -type f | head -5

# Check agent logs for knowledge plugin errors
tail -f agent-logs.txt | grep -i knowledge

# Verify database connection
curl http://localhost:8100/health | jq '.database'
```

**Solutions**:
```bash
# 1. Restart agents with knowledge plugin enabled
pkill -f 'packages/cli/dist/index.js'
ENABLE_KNOWLEDGE_PLUGIN=true bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json

# 2. Check knowledge directory permissions
chmod -R 755 knowledge/

# 3. Verify PostgreSQL connection
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT 1;"
```

### Issue 2: SPARQL Queries Failing

**Symptoms**:
- Graph visualization shows no data
- SPARQL endpoints return errors
- Fuseki connection timeouts

**Diagnosis**:
```bash
# Check Fuseki status
docker ps | grep fuseki
curl http://localhost:3030/$/ping

# Test SPARQL endpoint directly
curl -X POST http://localhost:3030/koi/sparql \
  -H "Content-Type: application/sparql-query" \
  -d "ASK { ?s ?p ?o }"

# Check dataset exists
curl --user admin:admin http://localhost:3030/$/datasets | jq
```

**Solutions**:
```bash
# 1. Restart Fuseki with data reload
docker stop fuseki-koi
docker start fuseki-koi
sleep 10

# 2. Recreate dataset if needed
curl -X POST --user admin:admin 'http://localhost:3030/$/datasets' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'dbName=koi&dbType=tdb2'

# 3. Reload sample data
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@sample-koi-data.ttl' \
  -H 'Content-Type: text/turtle'
```

### Issue 3: Web Interface Not Loading

**Symptoms**:
- Dashboard returns 502/503 errors
- Graph visualization components not rendering
- API endpoints not responding

**Diagnosis**:
```bash
# Check all services are running
ps aux | grep -E "(bun.*koi-query|python.*manage.py|bun.*dev)"

# Test service endpoints
curl http://localhost:8100/health
curl http://localhost:8000/api/koi/health/
curl http://localhost:5173/koi

# Check nginx configuration
docker logs nginx | grep -i error
```

**Solutions**:
```bash
# 1. Restart all services in correct order
docker start fuseki-koi
cd /opt/projects/plugin-knowledge-standalone && bun scripts/koi-query-server.ts &
cd django_admin && poetry run python manage.py runserver 8000 &
cd packages/client && bun run dev &

# 2. Rebuild nginx configuration
docker compose build nginx
docker compose up -d nginx --no-deps

# 3. Check frontend build
cd packages/client
bun vite build
cp -r dist/* ../server/dist/client/
```

### Issue 4: Agent RID Mapping Issues

**Symptoms**:
- Agent statistics show incorrect names
- UUID to name mapping fails
- Multiple entries for same agent

**Diagnosis**:
```bash
# Check agent registration
curl http://localhost:8100/agents | jq

# Check database agent records
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT id, name, created_at FROM agents ORDER BY created_at DESC;"

# Check for duplicate agents
curl http://localhost:8100/stats | jq '.agents'
```

**Solutions**:
```bash
# 1. Clean up duplicate agent records
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "DELETE FROM agents WHERE id NOT IN (SELECT DISTINCT ON (name) id FROM agents ORDER BY name, created_at DESC);"

# 2. Restart KOI query server to refresh mappings
pkill -f "bun.*koi-query"
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &

# 3. Verify agent startup logs
tail -f agent-logs.txt | grep -i "agent.*registered"
```

### Issue 5: Knowledge Source Detection Problems

**Symptoms**:
- All content shows as "documents" source
- Source-specific statistics missing
- Metadata not preserved

**Diagnosis**:
```bash
# Check knowledge directory structure
find knowledge/ -type d

# Verify file paths in database
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT metadata->>'source', metadata->>'filePath', COUNT(*) FROM documents GROUP BY metadata->>'source', metadata->>'filePath';"

# Check knowledge plugin configuration
grep -r "detectSource" /opt/projects/plugin-knowledge-standalone/
```

**Solutions**:
```bash
# 1. Reorganize knowledge files to match expected structure
mkdir -p knowledge/{notion,twitter,discord,medium,website,github,documents}

# 2. Move files to appropriate directories
mv knowledge/*.md knowledge/documents/  # Move uncategorized files

# 3. Restart agents to reprocess with correct paths
pkill -f 'packages/cli/dist/index.js'
bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json &
```

## Performance Optimization

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents USING GIN ((metadata->>'source'));
CREATE INDEX IF NOT EXISTS idx_memories_agent_id ON memories(agent_id);
CREATE INDEX IF NOT EXISTS idx_koi_content_sources_type ON koi_content_sources(source_type);

-- Analyze table statistics
ANALYZE documents;
ANALYZE memories; 
ANALYZE agents;
```

### SPARQL Query Optimization

```turtle
# Use specific property paths instead of wildcard queries
# Good:
SELECT ?doc ?title WHERE {
  ?doc a koi:Document ;
       koi:title ?title .
}

# Avoid:
SELECT ?s ?p ?o WHERE {
  ?s ?p ?o .
}
```

### Memory Usage Monitoring

```bash
# Monitor service memory usage
docker stats fuseki-koi
ps aux --sort=-%mem | grep -E "(bun|python.*manage.py)" | head -5

# Monitor database size
docker exec gaia-postgres-1 psql -U postgres -d eliza -c \
  "SELECT pg_size_pretty(pg_database_size('eliza'));"
```

## Monitoring and Maintenance

### Health Check Scripts

Create `scripts/health-check.sh`:

```bash
#!/bin/bash

echo "=== KOI Pipeline Health Check ==="

# Check PostgreSQL
echo -n "PostgreSQL: "
if docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ HEALTHY"
else
    echo "❌ FAILED"
fi

# Check Fuseki
echo -n "Fuseki: "
if curl -s http://localhost:3030/$/ping >/dev/null 2>&1; then
    echo "✅ HEALTHY"
else
    echo "❌ FAILED"
fi

# Check KOI Query Server
echo -n "KOI Query Server: "
if curl -s http://localhost:8100/health | grep -q "healthy"; then
    echo "✅ HEALTHY"
else
    echo "❌ FAILED"
fi

# Check Django Backend
echo -n "Django Backend: "
if curl -s http://localhost:8000/api/koi/health/ | grep -q "healthy"; then
    echo "✅ HEALTHY"
else
    echo "❌ FAILED"
fi

# Check Agents
echo -n "Agents: "
AGENT_COUNT=$(curl -s http://localhost:8100/agents | jq '. | length' 2>/dev/null)
if [[ $AGENT_COUNT -gt 0 ]]; then
    echo "✅ HEALTHY ($AGENT_COUNT active)"
else
    echo "❌ FAILED"
fi

echo "=== End Health Check ==="
```

### Backup Procedures

```bash
# Backup PostgreSQL data
docker exec gaia-postgres-1 pg_dump -U postgres eliza > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup Fuseki data
docker exec fuseki-koi tar -czf /fuseki/backup_$(date +%Y%m%d_%H%M%S).tar.gz /fuseki/databases/

# Backup knowledge files
tar -czf knowledge_backup_$(date +%Y%m%d_%H%M%S).tar.gz knowledge/

# Backup configuration files
tar -czf config_backup_$(date +%Y%m%d_%H%M%S).tar.gz characters/ docker-compose.yml nginx-ssl.conf
```

### Log Aggregation

```bash
# Collect all logs
mkdir -p logs/$(date +%Y%m%d)
docker logs fuseki-koi > logs/$(date +%Y%m%d)/fuseki.log 2>&1
docker logs gaia-postgres-1 > logs/$(date +%Y%m%d)/postgres.log 2>&1
docker logs nginx > logs/$(date +%Y%m%d)/nginx.log 2>&1

# Agent logs
cp agent-logs.txt logs/$(date +%Y%m%d)/agents.log

# Service logs
journalctl -u koi-query-server > logs/$(date +%Y%m%d)/koi-query.log
```

## Security Considerations

### Access Control

1. **Nginx Basic Auth**: Protect sensitive endpoints
2. **Fuseki Authentication**: Use admin credentials for data operations
3. **Database Security**: Restrict PostgreSQL access
4. **API Rate Limiting**: Prevent abuse of query endpoints

### Data Privacy

1. **Knowledge Content**: Ensure sensitive documents are properly categorized
2. **Agent Conversations**: Monitor for information leakage
3. **API Logs**: Sanitize logs before storage
4. **Backup Encryption**: Encrypt backup files

### Network Security

1. **HTTPS Only**: Force SSL for all public endpoints
2. **Internal Communication**: Use Docker networks for service communication
3. **Firewall Rules**: Restrict access to database and SPARQL ports
4. **API Authentication**: Implement token-based auth for production

## Related Documentation

- [KOI Complete Guide](./KOI-COMPLETE-GUIDE.md) - Comprehensive system documentation
- [Agent Operations Guide](./AGENT-OPERATIONS.md) - Agent management and operations
- [RAG Troubleshooting Guide](./RAG_TROUBLESHOOTING_GUIDE.md) - RAG system debugging
- [Notion Integration](./NOTION-INTEGRATION.md) - Knowledge source integration

## Support and Maintenance

For issues with the KOI pipeline integration:

1. **Check Health Endpoints**: Use health check scripts to identify failing components
2. **Review Service Logs**: Check individual service logs for specific error messages  
3. **Verify Configuration**: Ensure environment variables and configuration files are correct
4. **Test Components Individually**: Isolate issues by testing each pipeline component separately
5. **Consult Documentation**: Reference specific component documentation for detailed troubleshooting

The KOI pipeline is designed to be resilient and self-healing, but proper monitoring and maintenance are essential for optimal performance.