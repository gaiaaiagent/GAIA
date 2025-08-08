#!/bin/bash
# Test if Docker build will work in production
# This catches issues BEFORE pushing to GitHub

set -e

echo "🔨 Testing Docker build for production..."
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test the build with production platform
echo -e "${YELLOW}Building for linux/amd64 platform...${NC}"

START_TIME=$(date +%s)

# Run the same build that GitHub Actions would run
docker build \
    --platform linux/amd64 \
    -t gaia-test-build \
    -f Dockerfile \
    . || {
    echo -e "${RED}❌ Build failed! Fix these issues before pushing:${NC}"
    echo -e "${RED}This build would fail in GitHub Actions too.${NC}"
    exit 1
}

END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))

echo -e "${GREEN}✅ Build successful in ${BUILD_TIME} seconds!${NC}"
echo -e "${GREEN}This build should work in production.${NC}"

# Optional: Test if the image runs
echo -e "${YELLOW}Testing if container starts...${NC}"
docker run --rm -d --name test-container gaia-test-build sleep 10
docker stop test-container

echo -e "${GREEN}✅ Container starts successfully!${NC}"
echo ""
echo "You can now safely:"
echo "1. Push to GitHub (will trigger Actions)"
echo "2. Or use ./scripts/deploy-production.sh --build-local for direct deploy"