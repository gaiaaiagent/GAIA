#!/bin/bash

# Load environment variables
if [ -f .env ]; then
    set -a
    source .env
    set +a
else
    echo "Error: .env file not found!"
    exit 1
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==========================================${NC}"
echo -e "${BLUE}Starting All RegenAI Agents - Single Process${NC}"
echo -e "${BLUE}==========================================${NC}"

# Kill any existing agents
echo -e "${YELLOW}Stopping any existing agents...${NC}"
pkill -f 'packages/cli/dist/index.js' 2>/dev/null

# Start all agents in a single process
echo -e "${GREEN}Starting all agents in single process mode...${NC}"

# Standardized to port 3000 to match nginx configuration
export PORT=3000

# Use environment variables for bot tokens
bun packages/cli/dist/index.js start \
  --character characters/regenai.character.json \
  --character characters/advocate.character.json \
  --character characters/governor.character.json \
  --character characters/narrative.character.json \
  --character characters/voiceofnature.character.json \
  2>&1 | tee logs/all-agents.log &

AGENT_PID=$!

sleep 5

# Check if process is running
if ps -p $AGENT_PID > /dev/null; then
    echo -e "${GREEN}✓ All agents started successfully!${NC}"
    echo ""
    echo -e "${BLUE}Available Agents:${NC}"
    echo "   RegenAI:       Web + Telegram (@regenaiagentbot)"
    echo "   Advocate:      Web + Telegram (@RegenAdvocacyBot)"
    echo "   VoiceOfNature: Web + Telegram (@RegenVoiceOfNatureBot)"
    echo "   Governor:      Web + Telegram (@RegenGovernBot)"
    echo "   Narrative:     Web + Telegram (@RegenNarrativeBot)"
    echo ""
    echo -e "${GREEN}🌐 Web Interface: https://regen.gaiaai.xyz/${NC}"
    echo "   All agents available for chat in the web UI!"
    echo ""
    echo -e "${BLUE}Monitor logs:${NC}"
    echo "   tail -f /opt/projects/GAIA/logs/all-agents.log"
else
    echo -e "${RED}✗ Failed to start agents${NC}"
    exit 1
fi
