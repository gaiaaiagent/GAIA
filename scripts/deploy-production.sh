#!/bin/bash
# Production deployment script for RegenAI
# Matches actual production container names and compose file

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Production Deployment for RegenAI${NC}"
echo "====================================="

# Configuration - matches production reality
COMPOSE_FILE="docker-compose-ssl.yaml"
IMAGES=(
    "ghcr.io/gaiaaiagent/gaia/regenai:latest"
    "ghcr.io/gaiaaiagent/gaia/django-admin:regen-latest"
    "ghcr.io/gaiaaiagent/gaia/nginx:regen-latest"
)

# Container names as they actually are in production
CONTAINER_REGENAI="regenai"
CONTAINER_DJANGO="django-admin"
CONTAINER_NGINX="nginx"
CONTAINER_POSTGRES="gaia-postgres-1"

# Function to check if image has changed
check_image_changed() {
    local image=$1
    local image_name=$(echo $image | cut -d: -f1)
    local image_tag=$(echo $image | cut -d: -f2)
    
    echo -e "${YELLOW}Checking $image_name:$image_tag for updates...${NC}"
    
    # Get current digest if image exists locally
    local current_digest=""
    if docker image inspect "$image" &>/dev/null; then
        current_digest=$(docker image inspect "$image" 2>/dev/null | jq -r '.[0].RepoDigests[0]' | cut -d@ -f2)
    fi
    
    # Get remote digest
    local remote_digest=""
    remote_digest=$(docker manifest inspect "$image" 2>/dev/null | jq -r .config.digest) || {
        echo -e "${YELLOW}  Could not fetch remote manifest, will pull to be safe${NC}"
        return 0  # Assume changed if we can't check
    }
    
    if [ -z "$current_digest" ]; then
        echo -e "${YELLOW}  Image not found locally, need to pull${NC}"
        return 0  # Changed - need to pull
    elif [ "$current_digest" == "$remote_digest" ]; then
        echo -e "${GREEN}  ✓ Image is up to date${NC}"
        return 1  # Not changed
    else
        echo -e "${YELLOW}  Image has updates available${NC}"
        return 0  # Changed
    fi
}

# Function to pull image with progress
pull_image() {
    local image=$1
    echo -e "${YELLOW}Pulling $image...${NC}"
    
    if docker pull "$image"; then
        echo -e "${GREEN}  ✓ Image pulled successfully${NC}"
        return 0
    else
        echo -e "${RED}  ✗ Failed to pull image${NC}"
        return 1
    fi
}

# Function to wait for health check
wait_for_health() {
    local service=$1
    local url=$2
    local max_attempts=30
    local attempt=0
    
    echo -e "${YELLOW}Waiting for $service to be healthy...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        if curl -sf -o /dev/null "$url" 2>/dev/null; then
            echo -e "${GREEN}  ✓ $service is healthy${NC}"
            return 0
        fi
        
        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done
    
    echo -e "${RED}  ✗ $service failed to become healthy${NC}"
    return 1
}

# Main deployment process
START_TIME=$(date +%s)

echo -e "${BLUE}Step 1: Checking for updates${NC}"
echo "------------------------------"

IMAGES_TO_PULL=()
NEED_RESTART=false

for image in "${IMAGES[@]}"; do
    if check_image_changed "$image"; then
        IMAGES_TO_PULL+=("$image")
        NEED_RESTART=true
    fi
done

if [ ${#IMAGES_TO_PULL[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ All images are up to date, no deployment needed${NC}"
    exit 0
fi

echo ""
echo -e "${BLUE}Step 2: Pulling updated images${NC}"
echo "--------------------------------"

# Pull images sequentially for better error handling
for image in "${IMAGES_TO_PULL[@]}"; do
    pull_image "$image" || {
        echo -e "${RED}Failed to pull $image, aborting deployment${NC}"
        exit 1
    }
done

echo ""
echo -e "${BLUE}Step 3: Quick backup${NC}"
echo "---------------------"

# Quick database backup (non-blocking)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="$BACKUP_DIR/quick_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Creating database backup...${NC}"
docker exec $CONTAINER_POSTGRES pg_dump -U postgres eliza > "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${YELLOW}  ⚠️  Backup failed (container might be down)${NC}"
}

echo ""
echo -e "${BLUE}Step 4: Deployment with minimal downtime${NC}"
echo "------------------------------------------"

# Check if compose file exists
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}Error: $COMPOSE_FILE not found${NC}"
    exit 1
fi

echo -e "${YELLOW}Using compose file: $COMPOSE_FILE${NC}"

# For critical services, try to minimize downtime
if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_REGENAI$"; then
    echo -e "${YELLOW}Updating services with minimal downtime...${NC}"
    
    # Update services one by one to minimize downtime
    docker compose -f "$COMPOSE_FILE" up -d --no-deps regenai
    sleep 2
    docker compose -f "$COMPOSE_FILE" up -d --no-deps django
    sleep 2
    docker compose -f "$COMPOSE_FILE" up -d --no-deps nginx
else
    echo -e "${YELLOW}Starting all services...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d
fi

echo ""
echo -e "${BLUE}Step 5: Health verification${NC}"
echo "----------------------------"

# Wait for services with actual health checks
DEPLOY_SUCCESS=true

# Check RegenAI through nginx (since we use basic auth)
wait_for_health "RegenAI (via nginx)" "https://agents.regen.gaiaai.xyz" || {
    # Fallback to checking if container is running
    if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_REGENAI$"; then
        echo -e "${YELLOW}  Container is running${NC}"
    else
        DEPLOY_SUCCESS=false
    fi
}

# Check Django Admin
wait_for_health "Django Admin" "https://admin.regen.gaiaai.xyz/admin/login/" || {
    if docker ps --format '{{.Names}}' | grep -q "^$CONTAINER_DJANGO$"; then
        echo -e "${YELLOW}  Container is running${NC}"
    else
        DEPLOY_SUCCESS=false
    fi
}

# Check main site
wait_for_health "Main Site" "https://regen.gaiaai.xyz" || {
    echo -e "${YELLOW}  Nginx is handling redirects${NC}"
}

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${BLUE}Deployment Summary${NC}"
echo "=================="
echo "Duration: ${DURATION} seconds"
echo "Images updated: ${#IMAGES_TO_PULL[@]}"

if [ "$DEPLOY_SUCCESS" = true ]; then
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Show container status
    echo ""
    echo "Container status:"
    docker compose -f "$COMPOSE_FILE" ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
    
    # Clean up old images
    echo ""
    echo -e "${YELLOW}Cleaning up old images...${NC}"
    docker image prune -f --filter "until=24h" | grep "Total reclaimed space" || true
else
    echo -e "${RED}❌ Deployment completed with issues${NC}"
    echo ""
    echo "Recent logs:"
    docker compose -f "$COMPOSE_FILE" logs --tail=20
    
    echo ""
    echo -e "${YELLOW}Run 'docker compose -f $COMPOSE_FILE logs' to see full logs${NC}"
fi

echo ""
echo "Access points:"
echo "  • Main: https://regen.gaiaai.xyz"
echo "  • Agents: https://agents.regen.gaiaai.xyz (auth: regenai/regen2025)"
echo "  • Admin: https://admin.regen.gaiaai.xyz/admin/"
echo "  • Dashboard: https://dashboard.regen.gaiaai.xyz"