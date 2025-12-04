# Regen Registry Assistant Deployment Guide

## Target: registry.regen.gaiaai.xyz

This guide deploys the Regen Registry Assistant as a separate ElizaOS instance on the GAIA server.

## Architecture Overview

```
                    ┌─────────────────────────────────────────────┐
                    │              GAIA Server                     │
                    │                                              │
 Internet ──────────┤  nginx (443/80)                              │
                    │     │                                        │
                    │     ├─► regen.gaiaai.xyz:3000 (existing)     │
                    │     │                                        │
                    │     └─► registry.regen.gaiaai.xyz:3001 (NEW) │
                    │              │                               │
                    │              ▼                               │
                    │     ┌────────────────────┐                   │
                    │     │ Registry Assistant │                   │
                    │     │ /opt/projects/     │                   │
                    │     │ registry-eliza/    │                   │
                    │     └────────────────────┘                   │
                    │              │                               │
                    │              ▼                               │
                    │     ┌────────────────────┐                   │
                    │     │ PostgreSQL:5433    │                   │
                    │     │ (existing pgvector)│                   │
                    │     └────────────────────┘                   │
                    │              │                               │
                    │     MCP Servers (existing):                  │
                    │     ├─► registry-review-api                  │
                    │     ├─► regen-koi-mcp                        │
                    │     └─► regen-ledger-mcp                     │
                    └─────────────────────────────────────────────┘
```

## Prerequisites

- [ ] DNS A record for `registry.regen.gaiaai.xyz` pointing to server IP
- [ ] SSH access to server as user `shawn` or `darren`
- [ ] Anthropic API key for Claude model access

## Quick Deploy

```bash
# SSH to server
ssh shawn@gaia.gaiaai.xyz

# Clone the repository (first time only)
sudo mkdir -p /opt/projects/registry-eliza
sudo chown shawn:gaia-devs /opt/projects/registry-eliza
git clone git@github.com:gaiaaiagent/GAIA.git /opt/projects/registry-eliza
cd /opt/projects/registry-eliza
git checkout regen-assistant-avatar

# Run the deployment script
cd /opt/projects/registry-eliza/packages/plugin-registry-actions/deploy
chmod +x deploy.sh
./deploy.sh
```

### Updating an Existing Deployment

```bash
ssh shawn@gaia.gaiaai.xyz
cd /opt/projects/registry-eliza
git pull origin regen-assistant-avatar
bun install
bun run build
sudo systemctl restart registry-eliza
```

## Manual Deployment Steps

### Step 1: Configure DNS

Add an A record for `registry.regen.gaiaai.xyz` pointing to the server IP.
Verify with: `dig +short registry.regen.gaiaai.xyz`

### Step 2: Create Database

```bash
# Connect to PostgreSQL container
docker exec -it gaia-postgres-1 psql -U postgres

# Create database for registry assistant
CREATE DATABASE registry_eliza;
\c registry_eliza
CREATE EXTENSION IF NOT EXISTS vector;
\q
```

### Step 3: Deploy Application

```bash
# Create deployment directory
sudo mkdir -p /opt/projects/registry-eliza
sudo chown shawn:gaia-devs /opt/projects/registry-eliza

# Clone the repository
git clone git@github.com:gaiaaiagent/GAIA.git /opt/projects/registry-eliza
cd /opt/projects/registry-eliza
git checkout regen-assistant-avatar

# Install dependencies
bun install

# Build the project
bun run build
```

### Step 4: Configure Environment

```bash
# Copy environment template
cp packages/plugin-registry-actions/deploy/.env.production /opt/projects/registry-eliza/.env

# Edit and fill in your values
nano /opt/projects/registry-eliza/.env
```

### Step 5: Configure MCP Servers

```bash
# Copy MCP configuration
cp packages/plugin-registry-actions/deploy/.mcp.production.json /opt/projects/registry-eliza/.mcp.json

# Verify MCP servers are reachable
curl -s http://127.0.0.1:8080/health  # registry-review-api
```

### Step 6: Install Systemd Service

```bash
# Copy service file
sudo cp packages/plugin-registry-actions/deploy/registry-eliza.service /etc/systemd/system/

# Reload systemd
sudo systemctl daemon-reload

# Enable and start service
sudo systemctl enable registry-eliza
sudo systemctl start registry-eliza

# Check status
sudo systemctl status registry-eliza
journalctl -u registry-eliza -f
```

### Step 7: Configure Nginx

```bash
# Copy nginx config to container
docker cp packages/plugin-registry-actions/deploy/nginx-registry.conf \
  gaia-nginx:/etc/nginx/conf.d/registry.conf

# Test nginx configuration
docker exec gaia-nginx nginx -t

# Reload nginx
docker exec gaia-nginx nginx -s reload
```

### Step 8: Configure SSL

```bash
# Run certbot to add registry subdomain to existing certificate
docker exec -it gaia-nginx certbot certonly --nginx \
  -d regen.gaiaai.xyz \
  -d registry.regen.gaiaai.xyz \
  -d admin.regen.gaiaai.xyz

# Reload nginx after cert update
docker exec gaia-nginx nginx -s reload
```

## Verification

```bash
# Check service is running
sudo systemctl status registry-eliza

# Check logs
journalctl -u registry-eliza -f

# Test local access
curl http://127.0.0.1:3001

# Test external access
curl https://registry.regen.gaiaai.xyz
```

## Troubleshooting

### Service won't start
```bash
# Check logs
journalctl -u registry-eliza -n 100

# Check environment
cat /opt/projects/registry-eliza/.env

# Try running manually
cd /opt/projects/registry-eliza
bun run packages/cli/dist/index.js start --character characters/regen-registry-assistant.json
```

### MCP connection issues
```bash
# Check MCP server status
ps aux | grep mcp

# Test MCP endpoints
curl http://127.0.0.1:8080/health
```

### Database connection issues
```bash
# Test PostgreSQL connection
docker exec -it gaia-postgres-1 psql -U postgres -d registry_eliza -c "SELECT 1;"
```

## Files Reference

| File | Purpose |
|------|---------|
| `.env.production` | Environment variables template |
| `.mcp.production.json` | MCP server configuration |
| `registry-eliza.service` | Systemd service file |
| `nginx-registry.conf` | Nginx virtual host configuration |
| `deploy.sh` | Automated deployment script |

## Maintenance

### Restart service
```bash
sudo systemctl restart registry-eliza
```

### View logs
```bash
journalctl -u registry-eliza -f
```

### Update application
```bash
cd /opt/projects/registry-eliza
git pull
bun install
bun run build
sudo systemctl restart registry-eliza
```
