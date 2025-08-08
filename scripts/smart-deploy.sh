#!/bin/bash
# Smart deployment script with change detection and optimizations
# Minimizes downtime and only pulls when necessary

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Smart Deployment for RegenAI${NC}"
echo "===================================="

# Configuration
IMAGES=(
    "ghcr.io/gaiaaiagent/gaia/regen:latest"
    "ghcr.io/gaiaaiagent/gaia/django-admin:latest"
    "ghcr.io/gaiaaiagent/gaia/nginx:latest"
)

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
    
    if docker pull "$image" | grep -q "Status: Downloaded"; then
        echo -e "${GREEN}  ✓ New version downloaded${NC}"
        return 0
    elif docker pull "$image" | grep -q "Status: Image is up to date"; then
        echo -e "${GREEN}  ✓ Already up to date${NC}"
        return 1
    else
        docker pull "$image"
        echo -e "${GREEN}  ✓ Image pulled${NC}"
        return 0
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

# Pull images in parallel for speed
for image in "${IMAGES_TO_PULL[@]}"; do
    pull_image "$image" &
done
wait  # Wait for all pulls to complete

echo ""
echo -e "${BLUE}Step 3: Quick backup${NC}"
echo "---------------------"

# Quick database backup (non-blocking)
BACKUP_DIR="${BACKUP_DIR:-./backups}"
BACKUP_FILE="$BACKUP_DIR/quick_$(date +%Y%m%d_%H%M%S).sql"
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Creating database backup...${NC}"
docker exec postgres pg_dump -U postgres eliza > "$BACKUP_FILE" 2>/dev/null || {
    echo -e "${YELLOW}  ⚠️  Backup failed (container might be down)${NC}"
}

echo ""
echo -e "${BLUE}Step 4: Rolling deployment${NC}"
echo "---------------------------"

# Check if we should use production compose file
COMPOSE_FILE="docker-compose.yaml"
if [ -f "docker-compose.production.yaml" ]; then
    COMPOSE_FILE="docker-compose.production.yaml"
    echo -e "${YELLOW}Using production compose file${NC}"
fi

# For critical services, do rolling update
if docker ps --format '{{.Names}}' | grep -q "^regen$"; then
    echo -e "${YELLOW}Performing rolling update...${NC}"
    
    # Start new container alongside old one
    docker compose -f "$COMPOSE_FILE" up -d --no-deps --scale regen=2 regen 2>/dev/null || {
        # If scaling doesn't work, do regular restart
        echo -e "${YELLOW}  Scaling not supported, doing regular restart${NC}"
        docker compose -f "$COMPOSE_FILE" up -d --no-deps regen
    }
    
    # Update other services
    docker compose -f "$COMPOSE_FILE" up -d --no-deps django nginx
else
    echo -e "${YELLOW}Starting all services...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d
fi

echo ""
echo -e "${BLUE}Step 5: Health verification${NC}"
echo "----------------------------"

# Wait for services with actual health checks
DEPLOY_SUCCESS=true

wait_for_health "RegenAI" "http://localhost:3000/health" || {
    # Fallback to checking if container is running
    if docker ps --format '{{.Names}}' | grep -q "^regen$"; then
        echo -e "${YELLOW}  Container is running (no health endpoint)${NC}"
    else
        DEPLOY_SUCCESS=false
    fi
}

wait_for_health "Django Admin" "http://localhost:8000/admin/login/" || {
    if docker ps --format '{{.Names}}' | grep -q "^django-admin$"; then
        echo -e "${YELLOW}  Container is running${NC}"
    else
        DEPLOY_SUCCESS=false
    fi
}

# Clean up any duplicate containers from rolling update
if docker ps --format '{{.Names}}' | grep -q "^regen-1$"; then
    echo -e "${YELLOW}Cleaning up old containers...${NC}"
    docker compose -f "$COMPOSE_FILE" up -d --no-recreate --scale regen=1
fi

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
    docker compose logs --tail=20
    
    echo ""
    echo -e "${YELLOW}Run 'docker compose logs' to see full logs${NC}"
fi

echo ""
echo "Access points:"
echo "  • Main: https://regen.gaiaai.xyz"
echo "  • Admin: https://admin.regen.gaiaai.xyz"