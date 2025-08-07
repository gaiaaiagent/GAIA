#!/bin/bash

# Quick rollback script for production
# Usage: ./rollback.sh [commit-sha]
# If no commit SHA provided, rolls back to previous deployment

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔄 Starting rollback process...${NC}"

cd /opt/projects/GAIA

# Get target version
if [ -z "$1" ]; then
    # No argument, use last deployment
    if [ -f .last-deploy-version ]; then
        TARGET_VERSION=$(cat .last-deploy-version)
        echo "Rolling back to previous deployment"
    else
        echo -e "${RED}No previous deployment record found!${NC}"
        echo "Please specify a commit SHA to roll back to:"
        echo "  ./rollback.sh <commit-sha>"
        exit 1
    fi
else
    # Use specified commit
    TARGET_VERSION="ghcr.io/gaiaaiagent/gaia/regenai:$1"
    echo "Rolling back to version: $1"
fi

# Save current version
CURRENT_VERSION=$(docker inspect ghcr.io/gaiaaiagent/gaia/regenai:latest --format='{{index .RepoDigests 0}}' 2>/dev/null || echo "none")

echo -e "${YELLOW}Current version:${NC} $CURRENT_VERSION"
echo -e "${YELLOW}Target version:${NC} $TARGET_VERSION"

# Confirm rollback
read -p "Are you sure you want to rollback? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Rollback cancelled"
    exit 0
fi

# Pull the target image if needed
echo -e "${YELLOW}Pulling target image...${NC}"
docker pull $TARGET_VERSION || {
    echo -e "${RED}Failed to pull target image. It may not exist.${NC}"
    exit 1
}

# Tag it as latest
docker tag $TARGET_VERSION ghcr.io/gaiaaiagent/gaia/regenai:latest

# Restart containers
echo -e "${YELLOW}Restarting containers with rollback version...${NC}"
docker compose -f docker-compose-ssl.yaml up -d --no-deps regenai

# Wait for services to start
sleep 10

# Health check
echo -e "${YELLOW}Running health check...${NC}"
if curl -f https://regen.gaiaai.xyz > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Rollback successful!${NC}"
    
    # Update last deployment record
    echo "$TARGET_VERSION" > .last-deploy-version
    
    # Also rollback the git repository to match
    if [ ! -z "$1" ]; then
        echo -e "${YELLOW}Rolling back git repository to match...${NC}"
        git fetch origin
        git reset --hard $1
    fi
else
    echo -e "${RED}❌ Health check failed after rollback!${NC}"
    echo "You may need to investigate manually."
    exit 1
fi

echo -e "${GREEN}Rollback complete!${NC}"