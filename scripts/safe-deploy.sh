#!/bin/bash
# Safe deployment script with rollback capability
# This ensures we don't break production

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Safe Deployment Script for RegenAI${NC}"
echo "======================================="

# Configuration
BACKUP_DIR="/opt/backups/gaia"
LOG_DIR="/opt/logs/gaia"
HEALTH_CHECK_URL="https://regen.gaiaai.xyz/health"
ADMIN_CHECK_URL="https://admin.regen.gaiaai.xyz/admin/login/"

# Create directories
mkdir -p $BACKUP_DIR
mkdir -p $LOG_DIR

# Function to check service health
check_health() {
    local service=$1
    local url=$2
    
    echo -e "${YELLOW}Checking $service health...${NC}"
    
    if curl -sSf -o /dev/null -w '%{http_code}' --max-time 10 $url | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ $service is healthy${NC}"
        return 0
    else
        echo -e "${RED}❌ $service health check failed${NC}"
        return 1
    fi
}

# Function to backup current state
backup_current() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    echo -e "${YELLOW}📦 Creating backup...${NC}"
    
    # Save current image tags
    docker ps --format "table {{.Image}}\t{{.Names}}" > "$BACKUP_DIR/running_containers_$timestamp.txt"
    
    # Save current docker compose file
    cp docker-compose.yaml "$BACKUP_DIR/docker-compose_$timestamp.yaml" 2>/dev/null || true
    
    # Export database backup
    echo -e "${YELLOW}Backing up database...${NC}"
    docker exec postgres pg_dump -U postgres eliza > "$BACKUP_DIR/eliza_db_$timestamp.sql" || {
        echo -e "${YELLOW}⚠️  Database backup failed (might be okay if postgres container is down)${NC}"
    }
    
    echo -e "${GREEN}✅ Backup created: $BACKUP_DIR/*_$timestamp.*${NC}"
    echo $timestamp > "$BACKUP_DIR/last_deploy_timestamp.txt"
}

# Function to rollback
rollback() {
    echo -e "${RED}🔄 Rolling back deployment...${NC}"
    
    local last_timestamp=$(cat "$BACKUP_DIR/last_deploy_timestamp.txt" 2>/dev/null)
    
    if [ -z "$last_timestamp" ]; then
        echo -e "${RED}No backup timestamp found!${NC}"
        return 1
    fi
    
    # Restore database if backup exists
    if [ -f "$BACKUP_DIR/eliza_db_$last_timestamp.sql" ]; then
        echo -e "${YELLOW}Restoring database...${NC}"
        docker exec -i postgres psql -U postgres eliza < "$BACKUP_DIR/eliza_db_$last_timestamp.sql"
    fi
    
    # Restart with previous configuration
    docker compose down
    docker compose up -d
    
    echo -e "${GREEN}✅ Rollback completed${NC}"
}

# Main deployment process
echo -e "${BLUE}Step 1: Pre-deployment checks${NC}"
echo "------------------------------"

# Check current health
check_health "RegenAI" "$HEALTH_CHECK_URL" || {
    echo -e "${YELLOW}⚠️  Current deployment already unhealthy, proceeding anyway...${NC}"
}

echo -e "${BLUE}Step 2: Backup current state${NC}"
echo "----------------------------"
backup_current

echo -e "${BLUE}Step 3: Pull new images${NC}"
echo "------------------------"

# Pull new images
echo -e "${YELLOW}Pulling latest images...${NC}"
docker pull ghcr.io/gaiaaiagent/gaia/regen:latest || {
    echo -e "${RED}Failed to pull regen image${NC}"
    exit 1
}
docker pull ghcr.io/gaiaaiagent/gaia/django-admin:latest || {
    echo -e "${RED}Failed to pull django-admin image${NC}"
    exit 1
}
docker pull ghcr.io/gaiaaiagent/gaia/nginx:latest || {
    echo -e "${RED}Failed to pull nginx image${NC}"
    exit 1
}

echo -e "${BLUE}Step 4: Deploy new version${NC}"
echo "--------------------------"

# Stop old containers
echo -e "${YELLOW}Stopping old containers...${NC}"
docker compose down

# Start with new images
echo -e "${YELLOW}Starting new containers...${NC}"

# Use production compose if it exists
if [ -f "docker-compose.production.yaml" ]; then
    docker compose -f docker-compose.production.yaml up -d
else
    # Tag images for local compose file
    docker tag ghcr.io/gaiaaiagent/gaia/regen:latest gaia-regen:latest
    docker tag ghcr.io/gaiaaiagent/gaia/django-admin:latest gaia-django:latest
    docker tag ghcr.io/gaiaaiagent/gaia/nginx:latest gaia-nginx:latest
    docker compose up -d
fi

echo -e "${BLUE}Step 5: Post-deployment verification${NC}"
echo "------------------------------------"

# Wait for services to start
echo -e "${YELLOW}Waiting for services to start (30 seconds)...${NC}"
sleep 30

# Check container status
echo -e "${YELLOW}Container status:${NC}"
docker compose ps

# Health checks
DEPLOY_SUCCESS=true

check_health "RegenAI" "$HEALTH_CHECK_URL" || DEPLOY_SUCCESS=false
check_health "Django Admin" "$ADMIN_CHECK_URL" || DEPLOY_SUCCESS=false

# Check logs for errors
echo -e "${YELLOW}Checking for errors in logs...${NC}"
docker compose logs --tail=50 2>&1 | tee "$LOG_DIR/deploy_$(date +%Y%m%d_%H%M%S).log"

if [ "$DEPLOY_SUCCESS" = false ]; then
    echo -e "${RED}❌ Deployment verification failed!${NC}"
    echo -e "${YELLOW}Do you want to rollback? (y/n)${NC}"
    read -r response
    
    if [[ "$response" =~ ^[Yy]$ ]]; then
        rollback
    else
        echo -e "${YELLOW}⚠️  Keeping new deployment despite failures${NC}"
    fi
else
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo -e "${GREEN}All health checks passed${NC}"
    
    # Clean up old images
    echo -e "${YELLOW}Cleaning up old images...${NC}"
    docker image prune -f
fi

echo ""
echo -e "${BLUE}Deployment Summary:${NC}"
echo "==================="
echo "Timestamp: $(date)"
echo "Status: $([ "$DEPLOY_SUCCESS" = true ] && echo "SUCCESS" || echo "FAILED")"
echo "Logs: $LOG_DIR/"
echo "Backups: $BACKUP_DIR/"
echo ""
echo "Monitor at:"
echo "  - https://regen.gaiaai.xyz"
echo "  - https://admin.regen.gaiaai.xyz"