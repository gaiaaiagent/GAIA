#!/bin/bash

# RegenAI Local Development Stop Script
# Stops agents and optionally PostgreSQL

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
PID_FILE="$PROJECT_ROOT/.gaia-dev/agent.pid"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Stopping Local Development Environment${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Stop agents
echo -e "${BLUE}🛑 Stopping agents...${NC}"

# Check PID file
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "   Stopping agent (PID: $PID)..."
        kill $PID 2>/dev/null || true
        sleep 2
        
        # Force kill if still running
        if ps -p $PID > /dev/null 2>&1; then
            echo -e "   Force stopping agent..."
            kill -9 $PID 2>/dev/null || true
        fi
        
        rm -f "$PID_FILE"
        echo -e "   ${GREEN}✅ Agent stopped${NC}"
    else
        echo -e "   ${YELLOW}Agent not running (stale PID file)${NC}"
        rm -f "$PID_FILE"
    fi
else
    echo -e "   ${YELLOW}No PID file found${NC}"
fi

# Also check for any stray processes
if pgrep -f 'packages/cli/dist/index.js start' > /dev/null; then
    echo -e "   Cleaning up stray processes..."
    pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
    echo -e "   ${GREEN}✅ Stray processes cleaned${NC}"
fi

# Ask about PostgreSQL
echo ""
echo -e "${BLUE}🐘 PostgreSQL:${NC}"
if docker ps | grep -q gaia-postgres-dev; then
    echo -e "   PostgreSQL is running in Docker"
    echo -n "   Stop PostgreSQL? (y/N): "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "   Stopping PostgreSQL..."
        if [ -f "$PROJECT_ROOT/docker-compose.dev.yml" ]; then
            docker-compose -f "$PROJECT_ROOT/docker-compose.dev.yml" stop postgres
        else
            docker stop gaia-postgres-dev
        fi
        echo -e "   ${GREEN}✅ PostgreSQL stopped${NC}"
    else
        echo -e "   ${BLUE}PostgreSQL left running (for faster restarts)${NC}"
    fi
else
    echo -e "   ${YELLOW}PostgreSQL not running${NC}"
fi

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           ✅ Local Development Environment Stopped${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""