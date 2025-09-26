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
echo -e "${BLUE}Starting All RegenAI Agents with Telegram${NC}"
echo -e "${BLUE}==========================================${NC}"

# Standardized to port 3001 to match nginx configuration
export PORT=3001

# Kill any existing agents
echo -e "${YELLOW}Stopping any existing agents...${NC}"
pkill -f 'packages/cli/dist/index.js' 2>/dev/null
sleep 2

# Function to start agent
start_agent() {
    local name=$1
    local char_file=$2
    local log_file=$3
    
    echo -e "${GREEN}Starting $name...${NC}"
    /home/darren/.bun/bin/bun packages/cli/dist/index.js start \
        --character "$char_file" \
        2>&1 | tee -a "$log_file" &
    
    sleep 3
    
    if ps aux | grep -v grep | grep -q "$char_file"; then
        echo -e "${GREEN}✓ $name started${NC}"
    else
        echo -e "${RED}✗ Failed to start $name${NC}"
    fi
}

# Start each agent
start_agent "RegenAI" "characters/regenai.character.json" "logs/regenai.log"
start_agent "Advocate" "characters/advocate.character.json" "logs/advocate.log"
start_agent "Governor" "characters/governor.character.json" "logs/governor.log"
start_agent "Narrative" "characters/narrative.character.json" "logs/narrative.log"
start_agent "VoiceOfNature" "characters/voiceofnature.character.json" "logs/voiceofnature.log"

echo -e "${GREEN}All agents started!${NC}"
echo "Monitor with: ps aux | grep 'packages/cli/dist'"
