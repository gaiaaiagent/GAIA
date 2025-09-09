#!/bin/bash

# Master KOI Services Startup Script
# This script starts all KOI pipeline services in the correct order

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo -e "${GREEN}Starting KOI Pipeline Services...${NC}"

# Set default configuration
export POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"
export REDIS_URL="${REDIS_URL:-redis://localhost:6379}"

# Function to check if a service is running
check_service() {
    local port=$1
    local name=$2
    if lsof -i:$port > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC} $name is running on port $port"
        return 0
    else
        echo -e "${RED}✗${NC} $name is not running on port $port"
        return 1
    fi
}

# Function to start a service
start_service() {
    local script=$1
    local name=$2
    local port=$3
    
    echo -e "${YELLOW}Starting $name...${NC}"
    
    # Make script executable
    chmod +x "$script"
    
    # Start in background
    nohup "$script" > "${name// /_}.log" 2>&1 &
    
    # Wait for service to start
    sleep 3
    
    # Check if started successfully
    check_service $port "$name"
}

# Check PostgreSQL
echo -e "\n${YELLOW}Checking PostgreSQL...${NC}"
if pg_isready -h localhost -p 5433 > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} PostgreSQL is ready on port 5433"
else
    echo -e "${RED}✗${NC} PostgreSQL is not running on port 5433"
    echo "Please start PostgreSQL first"
    exit 1
fi

# Start KOI Coordinator
echo -e "\n${YELLOW}1. KOI Coordinator${NC}"
if ! check_service 8100 "KOI Coordinator"; then
    start_service "./start-coordinator.sh" "KOI Coordinator" 8100
fi

# Start KOI Event Bridge
echo -e "\n${YELLOW}2. KOI Event Bridge${NC}"
if ! check_service 8888 "KOI Event Bridge"; then
    start_service "./start-event-bridge.sh" "KOI Event Bridge" 8888
fi

# Start KOI Permissions API
echo -e "\n${YELLOW}3. KOI Permissions API${NC}"
if ! check_service 8300 "KOI Permissions API"; then
    start_service "./start-permissions-api.sh" "KOI Permissions API" 8300
fi

# Start BGE MCP Server
echo -e "\n${YELLOW}4. BGE MCP Server${NC}"
echo -e "${YELLOW}Note: BGE MCP Server runs on-demand via stdio, not as a persistent service${NC}"
echo -e "It will be started automatically when agents use it"

# Summary
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}KOI Pipeline Services Status:${NC}"
echo -e "${GREEN}========================================${NC}"
check_service 8100 "KOI Coordinator"
check_service 8888 "KOI Event Bridge"
check_service 8300 "KOI Permissions API"
echo -e "${GREEN}========================================${NC}"

echo -e "\n${GREEN}All KOI services started!${NC}"
echo -e "Logs are available in:"
echo -e "  - KOI_Coordinator.log"
echo -e "  - KOI_Event_Bridge.log"
echo -e "  - KOI_Permissions_API.log"
echo -e "\nTo stop all services, run: ${YELLOW}./stop-all-koi-services.sh${NC}"