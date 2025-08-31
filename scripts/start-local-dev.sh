#!/bin/bash

# RegenAI Local Development Startup Script
# Runs PostgreSQL in Docker and all agents in single native process
# Perfect for local development with hot reload capabilities

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
cd "$PROJECT_ROOT"

# Configuration
POSTGRES_PORT=5433
AGENT_PORT=3000
LOG_DIR="$PROJECT_ROOT/logs"
PID_FILE="$PROJECT_ROOT/.gaia-dev/agent.pid"
ENV_FILE="$PROJECT_ROOT/.env.local"
FALLBACK_ENV_FILE="$PROJECT_ROOT/.env"

echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}           RegenAI Local Development Environment${NC}"
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

# Function to wait for PostgreSQL
wait_for_postgres() {
    echo -e "${YELLOW}⏳ Waiting for PostgreSQL to be ready...${NC}"
    local max_attempts=30
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        if docker exec gaia-postgres-dev psql -U postgres -c '\l' >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PostgreSQL is ready!${NC}"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
        echo -n "."
    done
    
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    return 1
}

# Create necessary directories
mkdir -p "$LOG_DIR"
mkdir -p "$PROJECT_ROOT/.gaia-dev"

# Step 1: Environment Setup
echo -e "${BLUE}📋 Setting up environment...${NC}"

# Check for environment file
if [ -f "$ENV_FILE" ]; then
    echo -e "   Using ${GREEN}$ENV_FILE${NC}"
    source "$ENV_FILE"
elif [ -f "$FALLBACK_ENV_FILE" ]; then
    echo -e "   Using ${YELLOW}$FALLBACK_ENV_FILE${NC} (create .env.local for local overrides)"
    source "$FALLBACK_ENV_FILE"
else
    echo -e "${YELLOW}⚠️  No .env file found. Creating from template...${NC}"
    if [ -f "$PROJECT_ROOT/.env.example" ]; then
        cp "$PROJECT_ROOT/.env.example" "$ENV_FILE"
        echo -e "${YELLOW}   Created $ENV_FILE - Please configure your API keys!${NC}"
        echo -e "${RED}   Edit $ENV_FILE and run this script again.${NC}"
        exit 1
    else
        echo -e "${RED}❌ No .env.example found!${NC}"
        exit 1
    fi
fi

# Check required environment variables
if [ -z "$OPENAI_API_KEY" ] && [ -z "$ANTHROPIC_API_KEY" ]; then
    echo -e "${RED}❌ No AI API key found!${NC}"
    echo -e "   Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your .env file"
    exit 1
fi

# Step 2: Start PostgreSQL
echo -e "${BLUE}🐘 Starting PostgreSQL...${NC}"

# Check if PostgreSQL is already running
if docker ps | grep -q gaia-postgres-dev; then
    echo -e "   ${GREEN}PostgreSQL already running${NC}"
else
    # Check if we have docker-compose.dev.yml
    if [ -f "$PROJECT_ROOT/docker-compose.dev.yml" ]; then
        echo -e "   Starting PostgreSQL from docker-compose.dev.yml..."
        docker-compose -f docker-compose.dev.yml up -d postgres
    else
        # Fallback to direct docker run
        echo -e "   Starting PostgreSQL with docker run..."
        docker run -d \
            --name gaia-postgres-dev \
            -e POSTGRES_USER=postgres \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=eliza \
            -p $POSTGRES_PORT:5432 \
            ankane/pgvector:latest
    fi
    
    wait_for_postgres
fi

# Step 3: Check Node/Bun dependencies
echo -e "${BLUE}📦 Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "   Installing dependencies..."
    bun install
else
    echo -e "   ${GREEN}Dependencies already installed${NC}"
fi

# Check if CLI is built
if [ ! -f "packages/cli/dist/index.js" ]; then
    echo -e "   Building CLI package..."
    cd packages/cli
    bun run build
    cd "$PROJECT_ROOT"
else
    echo -e "   ${GREEN}CLI already built${NC}"
fi

# Step 4: Stop any existing agents
echo -e "${BLUE}🛑 Checking for existing agents...${NC}"

if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p $OLD_PID > /dev/null 2>&1; then
        echo -e "   Stopping existing agent (PID: $OLD_PID)..."
        kill $OLD_PID 2>/dev/null || true
        sleep 2
    fi
fi

# Also check for any stray processes
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true

# Step 5: Check character files
echo -e "${BLUE}👥 Checking character files...${NC}"

CHAR_DIR="$PROJECT_ROOT/characters"
if [ ! -d "$CHAR_DIR" ]; then
    echo -e "${RED}❌ Characters directory not found!${NC}"
    exit 1
fi

# Setup characters if needed
if ! ls "$CHAR_DIR"/*.character.json >/dev/null 2>&1; then
    echo -e "${YELLOW}   No character files found. Running setup...${NC}"
    if [ -f "$PROJECT_ROOT/scripts/setup-characters.sh" ]; then
        bash "$PROJECT_ROOT/scripts/setup-characters.sh"
    else
        echo -e "${RED}❌ Character setup script not found!${NC}"
        exit 1
    fi
fi

# Count available characters
CHAR_COUNT=$(ls -1 "$CHAR_DIR"/*.character.json 2>/dev/null | wc -l)
echo -e "   Found ${GREEN}$CHAR_COUNT${NC} character(s)"

# Step 5.5: Optional - Start Django Admin
echo -e "${BLUE}🎛️  Django Admin Panel:${NC}"
if [ -f "$PROJECT_ROOT/django_admin/manage.py" ]; then
    echo -n "   Start Django Admin panel? (y/N): "
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "   Starting Django Admin on port 8000..."
        if [ -f "$PROJECT_ROOT/docker-compose.dev.yml" ]; then
            docker-compose -f docker-compose.dev.yml up -d django
        else
            cd "$PROJECT_ROOT/django_admin"
            python manage.py migrate >/dev/null 2>&1
            python manage.py runserver 0.0.0.0:8000 > "$LOG_DIR/django.log" 2>&1 &
            cd "$PROJECT_ROOT"
        fi
        echo -e "   ${GREEN}✅ Django Admin started at http://localhost:8000/admin${NC}"
    else
        echo -e "   ${BLUE}Skipping Django Admin (start manually if needed)${NC}"
    fi
fi

# Step 6: Start agents
echo -e "${BLUE}🚀 Starting agents...${NC}"

# Check if port is available
if check_port $AGENT_PORT; then
    echo -e "${YELLOW}⚠️  Port $AGENT_PORT is in use. Using next available port...${NC}"
    AGENT_PORT=$((AGENT_PORT + 1))
fi

# Build the character arguments
CHAR_ARGS=""
for char_file in "$CHAR_DIR"/*.character.json; do
    if [ -f "$char_file" ]; then
        CHAR_ARGS="$CHAR_ARGS --character \"$char_file\""
    fi
done

# Start all agents in single process
echo -e "   Starting on port ${GREEN}$AGENT_PORT${NC}..."

# Export environment and start agents
export PORT=$AGENT_PORT
export POSTGRES_URL="postgresql://postgres:postgres@localhost:$POSTGRES_PORT/eliza"
export NODE_ENV=development
export LOG_LEVEL=info

# Start in background and save PID
eval "bun packages/cli/dist/index.js start $CHAR_ARGS" > "$LOG_DIR/local-dev.log" 2>&1 &
AGENT_PID=$!
echo $AGENT_PID > "$PID_FILE"

# Wait a moment for startup
sleep 3

# Step 7: Verify startup
echo -e "${BLUE}🔍 Verifying startup...${NC}"

if ps -p $AGENT_PID > /dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Agents running (PID: $AGENT_PID)${NC}"
else
    echo -e "   ${RED}❌ Failed to start agents${NC}"
    echo -e "   Check logs: tail -f $LOG_DIR/local-dev.log"
    exit 1
fi

# Check if web UI is responding
if curl -s -o /dev/null -w "%{http_code}" http://localhost:$AGENT_PORT | grep -q "200\|301\|302"; then
    echo -e "   ${GREEN}✅ Web UI responding${NC}"
else
    echo -e "   ${YELLOW}⚠️  Web UI not yet ready (this is normal, it may take a moment)${NC}"
fi

# Step 8: Success!
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}           🎉 Local Development Environment Ready!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${CYAN}📊 Status:${NC}"
echo -e "   PostgreSQL:  ${GREEN}Running${NC} on port $POSTGRES_PORT"
echo -e "   Agents:      ${GREEN}Running${NC} on port $AGENT_PORT (PID: $AGENT_PID)"
echo -e "   Characters:  ${GREEN}$CHAR_COUNT loaded${NC}"
echo ""
echo -e "${CYAN}🌐 Access:${NC}"
echo -e "   Web UI:      ${BLUE}http://localhost:$AGENT_PORT${NC}"
echo -e "   API:         ${BLUE}http://localhost:$AGENT_PORT/api${NC}"
if docker ps | grep -q django || pgrep -f "manage.py runserver" > /dev/null; then
    echo -e "   Django Admin: ${BLUE}http://localhost:8000/admin${NC}"
fi
echo ""
echo -e "${CYAN}📝 Useful Commands:${NC}"
echo -e "   View logs:   ${YELLOW}tail -f $LOG_DIR/local-dev.log${NC}"
echo -e "   Stop all:    ${YELLOW}$SCRIPT_DIR/stop-local-dev.sh${NC}"
echo -e "   Status:      ${YELLOW}$SCRIPT_DIR/status-local-dev.sh${NC}"
echo -e "   Restart:     ${YELLOW}$SCRIPT_DIR/restart-local-dev.sh${NC}"
echo ""
echo -e "${CYAN}💡 Tips:${NC}"
echo -e "   • Code changes require restart (use restart-local-dev.sh)"
echo -e "   • Create .env.local for local-only settings"
echo -e "   • Logs are in ./logs/local-dev.log"
echo -e "   • PostgreSQL data persists in Docker volume"
echo ""