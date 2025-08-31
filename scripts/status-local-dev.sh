#!/bin/bash

# RegenAI Local Development Status Script
# Shows status of all local development components

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
LOG_FILE="$PROJECT_ROOT/logs/local-dev.log"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           Local Development Environment Status${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check PostgreSQL
echo -e "${BLUE}🐘 PostgreSQL Status:${NC}"
if docker ps | grep -q gaia-postgres-dev; then
    echo -e "   Status:      ${GREEN}Running${NC}"
    
    # Get container info
    CONTAINER_INFO=$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep gaia-postgres-dev)
    echo -e "   Container:   $(echo $CONTAINER_INFO | awk '{print $1}')"
    echo -e "   Uptime:      $(echo $CONTAINER_INFO | awk '{print $2, $3, $4}')"
    
    # Check database
    if docker exec gaia-postgres-dev psql -U postgres -d eliza -c '\dt' >/dev/null 2>&1; then
        TABLE_COUNT=$(docker exec gaia-postgres-dev psql -U postgres -d eliza -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
        echo -e "   Database:    ${GREEN}eliza${NC} ($TABLE_COUNT tables)"
    else
        echo -e "   Database:    ${YELLOW}Not initialized${NC}"
    fi
else
    echo -e "   Status:      ${RED}Not running${NC}"
    echo -e "   ${YELLOW}Start with: $SCRIPT_DIR/start-local-dev.sh${NC}"
fi

echo ""

# Check Agents
echo -e "${BLUE}🤖 Agent Status:${NC}"
if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p $PID > /dev/null 2>&1; then
        echo -e "   Status:      ${GREEN}Running${NC}"
        echo -e "   PID:         $PID"
        
        # Get process info
        PROCESS_INFO=$(ps -p $PID -o etime=,rss=,cpu= | tail -1)
        UPTIME=$(echo $PROCESS_INFO | awk '{print $1}')
        MEMORY=$(echo $PROCESS_INFO | awk '{print $2}')
        MEMORY_MB=$((MEMORY / 1024))
        echo -e "   Uptime:      $UPTIME"
        echo -e "   Memory:      ${MEMORY_MB}MB"
        
        # Check which port it's using
        AGENT_PORT=$(lsof -p $PID -i -n | grep LISTEN | awk '{print $9}' | cut -d: -f2 | head -1)
        if [ -n "$AGENT_PORT" ]; then
            echo -e "   Port:        $AGENT_PORT"
            echo -e "   Web UI:      ${BLUE}http://localhost:$AGENT_PORT${NC}"
        fi
    else
        echo -e "   Status:      ${RED}Not running${NC} (stale PID file)"
        echo -e "   ${YELLOW}Start with: $SCRIPT_DIR/start-local-dev.sh${NC}"
    fi
else
    echo -e "   Status:      ${RED}Not running${NC}"
    echo -e "   ${YELLOW}Start with: $SCRIPT_DIR/start-local-dev.sh${NC}"
fi

echo ""

# Check Characters
echo -e "${BLUE}👥 Characters:${NC}"
CHAR_DIR="$PROJECT_ROOT/characters"
if [ -d "$CHAR_DIR" ]; then
    CHAR_COUNT=$(ls -1 "$CHAR_DIR"/*.character.json 2>/dev/null | wc -l)
    if [ $CHAR_COUNT -gt 0 ]; then
        echo -e "   Found:       ${GREEN}$CHAR_COUNT character(s)${NC}"
        for char_file in "$CHAR_DIR"/*.character.json; do
            if [ -f "$char_file" ]; then
                CHAR_NAME=$(basename "$char_file" .character.json)
                echo -e "   • $CHAR_NAME"
            fi
        done
    else
        echo -e "   Status:      ${YELLOW}No characters configured${NC}"
        echo -e "   ${YELLOW}Run: $PROJECT_ROOT/scripts/setup-characters.sh${NC}"
    fi
else
    echo -e "   Status:      ${RED}Characters directory missing${NC}"
fi

echo ""

# Check Logs
echo -e "${BLUE}📝 Logs:${NC}"
if [ -f "$LOG_FILE" ]; then
    LOG_SIZE=$(du -h "$LOG_FILE" | cut -f1)
    LOG_LINES=$(wc -l < "$LOG_FILE")
    echo -e "   Log file:    $LOG_FILE"
    echo -e "   Size:        $LOG_SIZE ($LOG_LINES lines)"
    
    # Show last few error lines if any
    ERROR_COUNT=$(grep -i "error" "$LOG_FILE" 2>/dev/null | tail -5 | wc -l || echo 0)
    if [ $ERROR_COUNT -gt 0 ]; then
        echo -e "   ${YELLOW}Recent errors found ($ERROR_COUNT in last 5):${NC}"
        grep -i "error" "$LOG_FILE" | tail -3 | while read line; do
            echo -e "   ${RED}•${NC} $(echo $line | cut -c1-60)..."
        done
    else
        echo -e "   ${GREEN}No recent errors${NC}"
    fi
else
    echo -e "   ${YELLOW}No log file found${NC}"
fi

echo ""

# Check Ports
echo -e "${BLUE}🔌 Port Status:${NC}"
PORTS=(3000 3001 5433 8000)
for port in "${PORTS[@]}"; do
    if check_port $port; then
        SERVICE=$(lsof -i :$port -sTCP:LISTEN | tail -1 | awk '{print $1}')
        echo -e "   Port $port:   ${GREEN}In use${NC} ($SERVICE)"
    else
        echo -e "   Port $port:   Free"
    fi
done

echo ""

# Environment Info
echo -e "${BLUE}⚙️  Environment:${NC}"
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    echo -e "   Config:      ${GREEN}.env.local${NC}"
elif [ -f "$PROJECT_ROOT/.env" ]; then
    echo -e "   Config:      ${YELLOW}.env${NC} (consider creating .env.local)"
else
    echo -e "   Config:      ${RED}Missing${NC}"
fi

# Check for API keys
if [ -f "$PROJECT_ROOT/.env.local" ] || [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env.local" 2>/dev/null || source "$PROJECT_ROOT/.env" 2>/dev/null
    
    if [ -n "$OPENAI_API_KEY" ]; then
        echo -e "   OpenAI:      ${GREEN}Configured${NC}"
    else
        echo -e "   OpenAI:      ${YELLOW}Not configured${NC}"
    fi
    
    if [ -n "$ANTHROPIC_API_KEY" ]; then
        echo -e "   Anthropic:   ${GREEN}Configured${NC}"
    else
        echo -e "   Anthropic:   ${YELLOW}Not configured${NC}"
    fi
fi

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo ""