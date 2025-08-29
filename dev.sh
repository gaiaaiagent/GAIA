#!/bin/bash

# RegenAI Local Development Environment Manager
# Provides simple, reliable local development setup with progressive complexity tiers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="$PROJECT_ROOT/.env.local"
DOCKER_COMPOSE_FILE="$PROJECT_ROOT/docker-compose.local.yaml"
LOG_DIR="$PROJECT_ROOT/logs"
DATA_DIR="$PROJECT_ROOT/data"

# Default environment - can be overridden by GAIA_ENV
ENVIRONMENT="${GAIA_ENV:-local}"

# Service ports (local defaults)
POSTGRES_PORT=5432
AGENT_PORTS=(3000 3001 3002 3003 3004)
KOI_NODE_PORT=8001
KOI_QUERY_PORT=8100
DJANGO_PORT=8000
NGINX_PORT=80

# Agent names
AGENT_NAMES=("regenai" "advocate" "voiceofnature" "governor" "narrative")

# Print colored message
print_message() {
    local color=$1
    local message=$2
    echo -e "${color}${message}${NC}"
}

# Print header
print_header() {
    echo ""
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    print_message "$BLUE" "  RegenAI Local Development Environment"
    print_message "$BLUE" "  Environment: $ENVIRONMENT"
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    echo ""
}

# Check prerequisites
check_prerequisites() {
    local missing=()
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        missing+=("Docker")
    fi
    
    # Check Bun
    if ! command -v bun &> /dev/null; then
        missing+=("Bun")
    fi
    
    # Check for minimum RAM (Linux/Mac)
    if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
        if [[ "$OSTYPE" == "darwin"* ]]; then
            total_ram=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024}')
        else
            total_ram=$(awk '/MemTotal/ {print $2/1024/1024}' /proc/meminfo)
        fi
        
        if (( $(echo "$total_ram < 4" | bc -l) )); then
            print_message "$YELLOW" "⚠️  Warning: Less than 4GB RAM detected. You may experience performance issues."
        fi
    fi
    
    if [ ${#missing[@]} -gt 0 ]; then
        print_message "$RED" "❌ Missing prerequisites: ${missing[*]}"
        echo ""
        echo "Installation instructions:"
        
        if [[ " ${missing[*]} " =~ " Docker " ]]; then
            echo "  Docker: https://docs.docker.com/get-docker/"
        fi
        
        if [[ " ${missing[*]} " =~ " Bun " ]]; then
            echo "  Bun: curl -fsSL https://bun.sh/install | bash"
        fi
        
        exit 1
    fi
    
    print_message "$GREEN" "✅ All prerequisites met"
}

# Setup environment file
setup_env() {
    if [ ! -f "$ENV_FILE" ]; then
        print_message "$YELLOW" "📝 Creating .env.local from template..."
        
        cat > "$ENV_FILE" << 'EOF'
# RegenAI Local Development Configuration
# Copy this file to .env.local and add your API keys

# Environment
GAIA_ENV=local
NODE_ENV=development

# Required API Keys (get from respective providers)
OPENAI_API_KEY=your_openai_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Optional API Keys
# GOOGLE_GENERATIVE_AI_API_KEY=
# GROQ_API_KEY=
# ELEVEN_LABS_API_KEY=

# Database Configuration (local defaults)
# CRITICAL: Password MUST be included or agents fail with "client password must be a string"
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/eliza
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=eliza

# Model Configuration
TEXT_PROVIDER=openai
TEXT_MODEL=gpt-3.5-turbo
TEXT_EMBEDDING_MODEL=text-embedding-3-small

# Local Paths (relative to project root)
KNOWLEDGE_PATH=./knowledge
CHARACTERS_PATH=./characters

# Feature Flags
LOAD_DOCS_ON_STARTUP=false
ELIZA_UI_ENABLE=true
LOG_LEVEL=info

# Server Configuration
SERVER_HOST=127.0.0.1
SERVER_PORT=3000

# Optional Services (uncomment to enable)
# DISCORD_APPLICATION_ID=
# DISCORD_API_TOKEN=
# TWITTER_USERNAME=
# TWITTER_PASSWORD=
# TELEGRAM_BOT_TOKEN=
EOF
        
        print_message "$YELLOW" "⚠️  Please edit .env.local and add your API keys"
        echo "   Required: OPENAI_API_KEY"
        echo ""
        read -p "Press Enter to continue after adding your API keys..."
    else
        print_message "$GREEN" "✅ Using existing .env.local"
    fi
    
    # Source the environment file
    set -a
    source "$ENV_FILE"
    set +a
    
    # Check for required API keys
    if [ -z "$OPENAI_API_KEY" ] || [ "$OPENAI_API_KEY" = "your_openai_api_key_here" ]; then
        print_message "$RED" "❌ OPENAI_API_KEY not set in .env.local"
        echo "   Please add your OpenAI API key to continue"
        exit 1
    fi
}

# Create necessary directories
setup_directories() {
    mkdir -p "$LOG_DIR"
    mkdir -p "$DATA_DIR"
    mkdir -p "$PROJECT_ROOT/knowledge"
    mkdir -p "$PROJECT_ROOT/characters"
    
    # Check for at least one character file
    if [ ! -f "$PROJECT_ROOT/characters/regenai.character.json" ]; then
        print_message "$YELLOW" "⚠️  No character files found. Creating default character..."
        
        cat > "$PROJECT_ROOT/characters/regenai.character.json" << 'EOF'
{
  "name": "RegenAI Development",
  "description": "Local development instance of RegenAI",
  "modelProvider": "openai",
  "settings": {
    "model": "gpt-3.5-turbo",
    "temperature": 0.7,
    "maxTokens": 2048
  },
  "systemPrompt": "You are RegenAI, a helpful assistant focused on regenerative systems and ecological wisdom. You are running in local development mode.",
  "bio": ["Local development instance of RegenAI agent"],
  "topics": ["regenerative systems", "development", "testing"],
  "style": {
    "all": ["helpful", "informative", "development-focused"],
    "chat": ["friendly", "technical when appropriate"]
  }
}
EOF
    fi
}

# Check port availability
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1
    fi
    return 0
}

# Start PostgreSQL
start_postgres() {
    print_message "$BLUE" "🐘 Starting PostgreSQL..."
    
    if ! check_port $POSTGRES_PORT; then
        print_message "$YELLOW" "⚠️  Port $POSTGRES_PORT in use. Checking if it's PostgreSQL..."
        
        # Try to connect to existing PostgreSQL
        if docker exec -it postgres psql -U postgres -c '\l' >/dev/null 2>&1; then
            print_message "$GREEN" "✅ Using existing PostgreSQL on port $POSTGRES_PORT"
            return 0
        else
            print_message "$RED" "❌ Port $POSTGRES_PORT is in use by another service"
            echo "   Please stop the service or use a different port"
            exit 1
        fi
    fi
    
    # Start PostgreSQL container
    docker run -d \
        --name postgres-regenai \
        -e POSTGRES_PASSWORD=postgres \
        -e POSTGRES_USER=postgres \
        -e POSTGRES_DB=eliza \
        -p $POSTGRES_PORT:5432 \
        -v regenai-postgres-data:/var/lib/postgresql/data \
        ankane/pgvector:latest \
        >/dev/null 2>&1 || {
            # Container might already exist
            docker start postgres-regenai >/dev/null 2>&1 || true
        }
    
    # Wait for PostgreSQL to be ready
    print_message "$BLUE" "⏳ Waiting for PostgreSQL to be ready..."
    for i in {1..30}; do
        if docker exec postgres-regenai pg_isready -U postgres >/dev/null 2>&1; then
            print_message "$GREEN" "✅ PostgreSQL ready"
            return 0
        fi
        sleep 1
    done
    
    print_message "$RED" "❌ PostgreSQL failed to start"
    exit 1
}

# Build the project
build_project() {
    print_message "$BLUE" "🔨 Building project..."
    
    cd "$PROJECT_ROOT"
    
    # Install dependencies
    print_message "$BLUE" "📦 Installing dependencies..."
    bun install --no-cache >/dev/null 2>&1
    
    # Build packages
    print_message "$BLUE" "🏗️  Building packages..."
    bun run build >/dev/null 2>&1
    
    print_message "$GREEN" "✅ Project built successfully"
}

# Start agent
start_agent() {
    local agent_name=$1
    local port=$2
    local character_file="$PROJECT_ROOT/characters/${agent_name}.character.json"
    
    # Use default character if specific one doesn't exist
    if [ ! -f "$character_file" ]; then
        character_file="$PROJECT_ROOT/characters/regenai.character.json"
    fi
    
    print_message "$BLUE" "🤖 Starting ${agent_name} on port ${port}..."
    
    # Kill any existing process on this port
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    
    # Start the agent
    cd "$PROJECT_ROOT"
    PORT=$port \
    POSTGRES_URL="postgresql://postgres:postgres@localhost:$POSTGRES_PORT/eliza" \
    KNOWLEDGE_PATH="$PROJECT_ROOT/knowledge" \
    bun packages/cli/dist/index.js start \
        --character "$character_file" \
        > "$LOG_DIR/${agent_name}.log" 2>&1 &
    
    # Wait for agent to be ready
    for i in {1..30}; do
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            print_message "$GREEN" "✅ ${agent_name} ready on http://localhost:${port}"
            return 0
        fi
        sleep 1
    done
    
    print_message "$YELLOW" "⚠️  ${agent_name} slow to start, check logs: tail -f $LOG_DIR/${agent_name}.log"
}

# Start services based on tier
start_services() {
    local tier=${1:-minimal}
    
    print_header
    check_prerequisites
    setup_env
    setup_directories
    
    # Always start PostgreSQL
    start_postgres
    
    # Build project if needed
    if [ ! -d "$PROJECT_ROOT/packages/cli/dist" ]; then
        build_project
    fi
    
    case $tier in
        minimal)
            print_message "$BLUE" "🚀 Starting minimal tier (1 agent)..."
            start_agent "regenai" 3000
            ;;
        
        standard)
            print_message "$BLUE" "🚀 Starting standard tier (5 agents)..."
            for i in "${!AGENT_NAMES[@]}"; do
                start_agent "${AGENT_NAMES[$i]}" "${AGENT_PORTS[$i]}"
            done
            ;;
        
        full)
            print_message "$BLUE" "🚀 Starting full tier (all services)..."
            
            # Start all agents
            for i in "${!AGENT_NAMES[@]}"; do
                start_agent "${AGENT_NAMES[$i]}" "${AGENT_PORTS[$i]}"
            done
            
            # Start additional services via docker-compose
            print_message "$BLUE" "🐳 Starting additional services..."
            docker-compose -f "$DOCKER_COMPOSE_FILE" up -d django nginx 2>/dev/null || {
                print_message "$YELLOW" "⚠️  Additional services require docker-compose.local.yaml"
            }
            ;;
        
        *)
            print_message "$RED" "❌ Unknown tier: $tier"
            echo "   Valid tiers: minimal, standard, full"
            exit 1
            ;;
    esac
    
    print_message "$GREEN" ""
    print_message "$GREEN" "🎉 Development environment ready!"
    show_status
}

# Stop all services
stop_services() {
    print_header
    print_message "$BLUE" "🛑 Stopping all services..."
    
    # Stop agents
    pkill -f "packages/cli/dist/index.js" 2>/dev/null || true
    
    # Stop Docker containers
    docker stop postgres-regenai 2>/dev/null || true
    docker-compose -f "$DOCKER_COMPOSE_FILE" down 2>/dev/null || true
    
    print_message "$GREEN" "✅ All services stopped"
}

# Show service status
show_status() {
    echo ""
    print_message "$BLUE" "📊 Service Status:"
    echo ""
    
    # Check PostgreSQL
    if docker exec postgres-regenai pg_isready -U postgres >/dev/null 2>&1; then
        print_message "$GREEN" "  PostgreSQL:     ✅ Running (port $POSTGRES_PORT)"
    else
        print_message "$RED" "  PostgreSQL:     ❌ Stopped"
    fi
    
    # Check agents
    for i in "${!AGENT_NAMES[@]}"; do
        local agent="${AGENT_NAMES[$i]}"
        local port="${AGENT_PORTS[$i]}"
        
        if curl -s "http://localhost:$port/health" >/dev/null 2>&1; then
            print_message "$GREEN" "  $agent:    ✅ Running (http://localhost:$port)"
        else
            print_message "$YELLOW" "  $agent:    ⭕ Not running"
        fi
    done
    
    echo ""
    print_message "$BLUE" "📝 Useful commands:"
    echo "  View logs:     tail -f $LOG_DIR/<agent>.log"
    echo "  Check health:  curl http://localhost:3000/health"
    echo "  Stop all:      ./dev.sh stop"
    echo ""
}

# Show logs
show_logs() {
    local service=${1:-regenai}
    local log_file="$LOG_DIR/${service}.log"
    
    if [ -f "$log_file" ]; then
        tail -f "$log_file"
    else
        print_message "$RED" "❌ Log file not found: $log_file"
        echo "   Available logs:"
        ls -1 "$LOG_DIR"/*.log 2>/dev/null | xargs -n1 basename | sed 's/\.log$//'
    fi
}

# Reset environment
reset_environment() {
    print_header
    print_message "$YELLOW" "⚠️  This will remove all containers, volumes, and generated files"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stop_services
        
        print_message "$BLUE" "🧹 Cleaning up..."
        
        # Remove containers
        docker rm postgres-regenai 2>/dev/null || true
        
        # Remove volumes
        docker volume rm regenai-postgres-data 2>/dev/null || true
        
        # Remove generated files
        rm -rf "$LOG_DIR"
        rm -rf "$DATA_DIR"
        rm -rf "$PROJECT_ROOT/packages/*/dist"
        rm -rf "$PROJECT_ROOT/node_modules"
        
        print_message "$GREEN" "✅ Environment reset complete"
    else
        print_message "$BLUE" "Reset cancelled"
    fi
}

# Run tests
run_tests() {
    print_header
    print_message "$BLUE" "🧪 Running tests..."
    
    cd "$PROJECT_ROOT"
    bun test
}

# Show help
show_help() {
    echo "RegenAI Local Development Environment Manager"
    echo ""
    echo "Usage: ./dev.sh [command] [options]"
    echo ""
    echo "Commands:"
    echo "  start [tier]    Start development environment"
    echo "                  Tiers: minimal (default), standard, full"
    echo "  stop           Stop all services"
    echo "  restart        Restart all services"
    echo "  status         Show service status"
    echo "  logs [service] Show service logs (default: regenai)"
    echo "  reset          Reset environment (removes all data)"
    echo "  test           Run test suite"
    echo "  help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./dev.sh start              # Start minimal environment"
    echo "  ./dev.sh start standard     # Start all 5 agents"
    echo "  ./dev.sh start full         # Start everything"
    echo "  ./dev.sh logs regenai       # View RegenAI logs"
    echo "  ./dev.sh status             # Check what's running"
    echo ""
}

# Main command handler
case "${1:-}" in
    start)
        start_services "${2:-minimal}"
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        start_services "${2:-minimal}"
        ;;
    status)
        print_header
        show_status
        ;;
    logs)
        show_logs "${2:-regenai}"
        ;;
    reset)
        reset_environment
        ;;
    test)
        run_tests
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        show_help
        exit 1
        ;;
esac