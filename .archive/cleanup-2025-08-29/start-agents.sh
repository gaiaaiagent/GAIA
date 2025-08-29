#!/bin/bash

# Unified Agent Startup Script
# Replaces: start-all-agents*.sh, start-agents-*.sh
# Usage: ./start-agents.sh [OPTIONS]
#
# Options:
#   --mode=dev|prod         Development or production mode (default: dev)
#   --telegram=on|off       Enable/disable Telegram (default: on)
#   --process=single|multi  Single or multi-process (default: multi)
#   --knowledge=on|off      Load knowledge on startup (default: on)
#   --performance=normal|optimized  Performance mode (default: normal)

# Default settings
MODE="dev"
TELEGRAM="on"
PROCESS="multi"
KNOWLEDGE="on"
PERFORMANCE="normal"

# Parse arguments
for arg in "$@"; do
  case $arg in
    --mode=*)
      MODE="${arg#*=}"
      ;;
    --telegram=*)
      TELEGRAM="${arg#*=}"
      ;;
    --process=*)
      PROCESS="${arg#*=}"
      ;;
    --knowledge=*)
      KNOWLEDGE="${arg#*=}"
      ;;
    --performance=*)
      PERFORMANCE="${arg#*=}"
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --mode=dev|prod         Development or production mode (default: dev)"
      echo "  --telegram=on|off       Enable/disable Telegram (default: on)"
      echo "  --process=single|multi  Single or multi-process (default: multi)"
      echo "  --knowledge=on|off      Load knowledge on startup (default: on)"
      echo "  --performance=normal|optimized  Performance mode (default: normal)"
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

# Set environment based on mode
if [ "$MODE" = "prod" ]; then
  echo "🚀 Starting agents in PRODUCTION mode"
  export NODE_ENV=production
  export LOG_LEVEL=warn
  DB_HOST="localhost"
  DB_PORT="5433"
else
  echo "🛠️ Starting agents in DEVELOPMENT mode"
  export NODE_ENV=development
  export LOG_LEVEL=debug
  DB_HOST="localhost"
  DB_PORT="5433"
fi

# Configure database
export POSTGRES_URL="postgresql://postgres:postgres@${DB_HOST}:${DB_PORT}/eliza"
echo "📊 Database: ${POSTGRES_URL}"

# Configure knowledge loading
if [ "$KNOWLEDGE" = "on" ]; then
  export LOAD_DOCS_ON_STARTUP=true
  export KNOWLEDGE_PATH="./knowledge"
  echo "📚 Knowledge loading: ENABLED"
else
  export LOAD_DOCS_ON_STARTUP=false
  echo "📚 Knowledge loading: DISABLED"
fi

# Configure performance
if [ "$PERFORMANCE" = "optimized" ]; then
  export TEXT_MODEL="claude-3-5-haiku-20241022"
  export BUN_JSC_FORCE_JIT=1
  export NODE_OPTIONS="--max-old-space-size=8192"
  echo "⚡ Performance: OPTIMIZED (Haiku model)"
else
  export TEXT_MODEL="gpt-4o-mini"
  echo "⚡ Performance: NORMAL"
fi

# Configure Telegram
if [ "$TELEGRAM" = "on" ]; then
  echo "💬 Telegram: ENABLED"
  TELEGRAM_FLAGS=""
else
  echo "💬 Telegram: DISABLED"
  TELEGRAM_FLAGS="--no-telegram"  # This would need ElizaOS support
fi

# Stop any existing agents
echo "🛑 Stopping existing agents..."
pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2

# Create logs directory
mkdir -p logs

# Character files
CHARACTERS=(
  "characters/regenai.character.json"
  "characters/advocate.character.json"
  "characters/voiceofnature.character.json"
  "characters/governor.character.json"
  "characters/narrative.character.json"
)

# Start agents based on process mode
if [ "$PROCESS" = "single" ]; then
  echo "🔄 Starting all agents in SINGLE process..."
  
  # Build character list for single process
  CHAR_ARGS=""
  for char in "${CHARACTERS[@]}"; do
    CHAR_ARGS="$CHAR_ARGS --character $char"
  done
  
  # Start single process with all characters
  nohup bun packages/cli/dist/index.js start $CHAR_ARGS \
    > logs/all-agents.log 2>&1 &
  
  echo "✅ Started all agents in single process (PID: $!)"
  echo "📝 Log: logs/all-agents.log"
  
else
  echo "🔄 Starting agents in MULTI-process mode..."
  
  # Start each agent in its own process
  for char_file in "${CHARACTERS[@]}"; do
    # Extract agent name from filename
    agent_name=$(basename "$char_file" .character.json)
    
    echo "Starting $agent_name..."
    
    # Agent-specific environment variables
    case $agent_name in
      governor)
        export CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
        export CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01
        ;;
      advocate)
        export CHARACTER.Advocate.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
        export CHARACTER.Advocate.TELEGRAM_RANDOM_RESPONSE_RATE=0.02
        ;;
    esac
    
    # Start agent
    nohup bun packages/cli/dist/index.js start --character "$char_file" \
      > "logs/${agent_name}.log" 2>&1 &
    
    echo "  ✅ Started $agent_name (PID: $!)"
    sleep 2  # Brief pause between starts
  done
fi

echo ""
echo "🎉 Agent startup complete!"
echo ""
echo "📊 Status check: ps aux | grep 'packages/cli/dist' | grep -v grep"
echo "📝 View logs: tail -f logs/*.log"
echo "🛑 Stop all: pkill -f 'packages/cli/dist/index.js'"
echo ""

# Quick status check
sleep 3
RUNNING=$(ps aux | grep -c 'packages/cli/dist/index.js' | grep -v grep || echo "0")
echo "🏃 Agents running: $RUNNING"