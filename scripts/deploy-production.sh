#!/bin/bash
# Production deployment script for GAIA
# Usage: ./scripts/deploy-production.sh [--build-local]

set -e

echo "🚀 GAIA Production Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REMOTE_HOST="deploy@regen.gaiaai.xyz"
REMOTE_DIR="/opt/GAIA"
REGISTRY="ghcr.io/gaiaaiagent/gaia"
IMAGE_TAG="regen:latest"

# Check if we should build locally
if [[ "$1" == "--build-local" ]]; then
    echo -e "${YELLOW}Building Docker image locally...${NC}"
    
    # Test build first
    echo "Testing build..."
    docker build --platform linux/amd64 -t ${REGISTRY}/${IMAGE_TAG} . || {
        echo -e "${RED}❌ Build failed locally. Fix issues before deploying.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Build successful!${NC}"
    
    # Push to registry (requires docker login)
    echo "Pushing to registry..."
    docker push ${REGISTRY}/${IMAGE_TAG} || {
        echo -e "${RED}❌ Failed to push image. Check docker login.${NC}"
        exit 1
    }
    
    echo -e "${GREEN}✅ Image pushed to registry${NC}"
fi

# Deploy to production
echo -e "${YELLOW}Deploying to production...${NC}"

ssh ${REMOTE_HOST} << 'ENDSSH'
set -e
cd /opt/GAIA

echo "Pulling latest code..."
git pull origin regen

echo "Pulling latest images..."
docker compose pull

echo "Updating containers..."
docker compose up -d

echo "Checking container status..."
docker compose ps

echo "✅ Deployment complete!"
ENDSSH

echo -e "${GREEN}✅ Production deployment successful!${NC}"

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
sleep 5

# Check version
VERSION=$(curl -s -u regenai:regen2025 https://agents.regen.gaiaai.xyz/api/system/version | jq -r '.version')
echo -e "${GREEN}✅ Production running version: ${VERSION}${NC}"