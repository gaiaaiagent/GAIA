#!/bin/bash

# Stop all KOI Pipeline Services

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping KOI Pipeline Services...${NC}"

# Function to stop a service by port
stop_service() {
    local port=$1
    local name=$2
    
    echo -e "Stopping $name on port $port..."
    
    # Find and kill process on port
    PID=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$PID" ]; then
        kill $PID 2>/dev/null
        echo -e "${GREEN}✓${NC} Stopped $name (PID: $PID)"
    else
        echo -e "${YELLOW}○${NC} $name was not running"
    fi
}

# Stop all services
stop_service 8100 "KOI Coordinator"
stop_service 8888 "KOI Event Bridge"
stop_service 8300 "KOI Permissions API"

# Also stop any Python processes related to KOI
echo -e "\n${YELLOW}Cleaning up any remaining KOI processes...${NC}"
pkill -f "koi_coordinator" 2>/dev/null
pkill -f "koi_event_bridge" 2>/dev/null
pkill -f "koi_permissions_api" 2>/dev/null
pkill -f "coordinator.py" 2>/dev/null

echo -e "\n${GREEN}All KOI services stopped!${NC}"