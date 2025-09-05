# KOI Knowledge Graph Setup Guide

This guide documents the complete setup process for the KOI (Knowledge Organization Infrastructure) knowledge graph visualization system integrated with ElizaOS.

## Overview

The KOI system provides a knowledge graph visualization interface for exploring the relationships between entities extracted from Regen Network's documentation and data sources.

### Components

1. **Apache Jena Fuseki** - SPARQL triplestore database (port 3030)
2. **KOI API Server** - Flask-based API server (port 8001)  
3. **React Frontend** - Knowledge graph visualization UI
4. **Nginx** - Reverse proxy for HTTPS access

## Prerequisites

- Docker and Docker Compose
- Python 3 with Flask
- Bun (for building React frontend)
- 4GB+ RAM for Fuseki

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/gaiaaiagent/GAIA.git
cd GAIA
```

### 2. Install Python Dependencies

```bash
# Install Flask and dependencies
sudo apt-get update
sudo apt-get install -y python3-flask python3-flask-cors python3-requests
```

### 3. Set Up Fuseki SPARQL Database

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

### 4. Start KOI API Server

```bash
# Start in screen session for persistence
screen -dmS koi-api bash -c 'cd koi-data && python3 koi_api_server.py'

# Verify it's running
curl http://localhost:8001/api/koi/health/
# Should return: {"status": "healthy", "fuseki": "connected", "triple_count": 50}
```

### 5. Build React Frontend

```bash
# Install bun if not present
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Build the client with KOI components
cd packages/client
bun install
bun vite build

# Copy build to server dist (IMPORTANT!)
cd ../..
rm -rf packages/server/dist/client/*
cp -r packages/client/dist/* packages/server/dist/client/
```

### 6. Configure Nginx Proxy

Add the following to your `nginx-ssl.conf` file before the main `location /` block:

```nginx
# KOI Graph API proxy
location /api/koi/ {
    proxy_pass http://172.17.0.1:8001/api/koi/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto https;
    proxy_set_header X-Forwarded-Ssl on;
    
    # CORS headers for graph visualization
    add_header Access-Control-Allow-Origin "*" always;
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS" always;
    add_header Access-Control-Allow-Headers "Content-Type, Accept" always;
}
```

Then rebuild and restart nginx:

```bash
docker compose build nginx
docker compose up -d nginx --no-deps
```

### 7. Start ElizaOS Agents

```bash
# Use the full path to bun if not in PATH
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json
```

## Accessing the System

- **Main Dashboard**: https://your-domain.com/ (with basic auth)
- **KOI Graph**: Click the "Graph" button in the sidebar footer
- **Direct Graph URLs**: https://your-domain.com/koi or /KOI (both work)

## API Endpoints

- `GET /api/koi/health/` - System health check
- `GET /api/koi/graph-data/` - Get graph visualization data
- `POST /api/koi/sparql/` - Execute SPARQL queries
- `GET /api/koi/essence-data/` - Get essence alignment data

## Important Notes

### Client Build Location

ElizaOS serves the client from `packages/server/dist/client/`, NOT from `packages/client/dist/`. After building the client, you MUST copy the files:

```bash
cp -r packages/client/dist/* packages/server/dist/client/
```

### API Endpoint Configuration

The KOI API endpoints in the React client should use relative paths when behind a proxy:
- Development: `http://localhost:8001/api/koi/`
- Production: `/api/koi/` (proxied through nginx)

## Troubleshooting

### Graph button not visible

1. Ensure client is rebuilt with latest changes
2. Copy build to server dist: `cp -r packages/client/dist/* packages/server/dist/client/`
3. Restart agents

### Fuseki not persisting data

1. Ensure Docker volume is created: `docker volume create fuseki-data`
2. Use `tdb2` for persistent storage, not `mem`
3. Check dataset exists: `curl --user admin:admin http://localhost:3030/$/datasets`

### API returns 405 or 404 errors

1. Check Fuseki endpoint is `/koi/sparql` for POST requests
2. Ensure Content-Type header is `application/x-www-form-urlencoded`
3. Verify dataset name is "koi"

### Port conflicts

- Fuseki: 3030
- KOI API: 8001  
- ElizaOS: 3000
- Ensure no other services use these ports

## Data Files

- `sample-koi-data.ttl` - Sample RDF data (74 triples)
- `koi-data/koi-entities-production.ttl` - Production data (3900+ triples)
- `koi-data/koi_api_server.py` - Flask API server

## Maintenance

### Restart Services

```bash
# Restart Fuseki
docker restart fuseki-koi

# Restart API server
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

### Update Data

```bash
# Load new RDF data
curl -X POST --user admin:admin 'http://localhost:3030/koi/data' \
  --data-binary '@new-data.ttl' \
  -H 'Content-Type: text/turtle'
```

### Monitor Logs

```bash
# API server logs
screen -r koi-api

# Fuseki logs
docker logs fuseki-koi

# Agent logs
tail -f /tmp/agents.log
```

## Production Deployment Checklist

- [ ] Fuseki container running with persistent volume
- [ ] KOI API server running on port 8001
- [ ] Client built with KOI components
- [ ] Client build copied to `packages/server/dist/client/`
- [ ] Nginx configured with `/api/koi/` proxy
- [ ] Agents started with full bun path
- [ ] Graph button visible in sidebar
- [ ] KOI routes (/koi and /KOI) accessible
- [ ] API health check returns success
- [ ] Graph data loads properly