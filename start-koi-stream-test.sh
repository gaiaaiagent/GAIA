#!/bin/bash

# KOI Stream Test Agent Startup Script
# This starts only the test agent without affecting existing agents

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Starting KOI Stream Test Agent ===${NC}"
echo ""

# Configuration
POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
TEST_PORT="${TEST_PORT:-3020}"  # Use different port from production agents

# Check if PostgreSQL is accessible
echo -e "${YELLOW}Checking PostgreSQL connection...${NC}"
if psql "$POSTGRES_URL" -c "SELECT 1" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ PostgreSQL connection successful${NC}"
else
    echo -e "${RED}✗ Cannot connect to PostgreSQL${NC}"
    echo "Make sure PostgreSQL is running on port 5433"
    exit 1
fi

# Check if BGE embeddings exist
echo -e "${YELLOW}Checking BGE embeddings...${NC}"
EMBEDDING_COUNT=$(psql "$POSTGRES_URL" -t -c "SELECT COUNT(*) FROM embeddings WHERE dim_1024 IS NOT NULL" 2>/dev/null || echo "0")
echo -e "${GREEN}✓ Found ${EMBEDDING_COUNT} BGE embeddings${NC}"

# Start the test agent
echo ""
echo -e "${YELLOW}Starting KOI Stream test agent on port ${TEST_PORT}...${NC}"
echo -e "${YELLOW}Character file: characters/koi-stream.character.json${NC}"
echo ""

# Start agent with MCP support
POSTGRES_URL="$POSTGRES_URL" \
PORT="$TEST_PORT" \
bun packages/cli/dist/index.js start \
--character characters/koi-stream.character.json

echo ""
echo -e "${GREEN}KOI Stream test agent started!${NC}"
echo -e "${GREEN}Access at: http://localhost:${TEST_PORT}${NC}"
echo ""
echo -e "${YELLOW}Test commands:${NC}"
echo "  - Ask about regenerative agriculture"
echo "  - Request BGE search statistics"
echo "  - Query specific Regen Network topics"