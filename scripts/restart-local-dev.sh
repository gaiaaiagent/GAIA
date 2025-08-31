#!/bin/bash

# RegenAI Local Development Restart Script
# Quick restart for code changes

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Restarting Local Development Environment${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Check if we need to rebuild
REBUILD=false
if [ "$1" == "--rebuild" ] || [ "$1" == "-r" ]; then
    REBUILD=true
    echo -e "${YELLOW}📦 Rebuild requested${NC}"
fi

# Stop agents only (keep PostgreSQL running for faster restart)
echo -e "${BLUE}🛑 Stopping agents...${NC}"
PID_FILE="$PROJECT_ROOT/.gaia-dev/agent.pid"

if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID 2>/dev/null || true
        sleep 2
        rm -f "$PID_FILE"
        echo -e "   ${GREEN}✅ Agents stopped${NC}"
    fi
fi

# Clean up any stray processes
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true

# Rebuild if requested
if [ "$REBUILD" == true ]; then
    echo ""
    echo -e "${BLUE}🔨 Rebuilding CLI...${NC}"
    cd "$PROJECT_ROOT/packages/cli"
    bun run build
    cd "$PROJECT_ROOT"
    echo -e "   ${GREEN}✅ Build complete${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting agents...${NC}"

# Start the agents again
"$SCRIPT_DIR/start-local-dev.sh"