#!/bin/bash

# RegenAI Agent Control Script
# Central control for all agent operations

GAIA_DIR="/opt/projects/GAIA"
cd "$GAIA_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

show_help() {
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}           RegenAI Agent Control Center${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Usage:${NC} $0 [command]"
    echo ""
    echo -e "${BLUE}Commands:${NC}"
    echo "  start-single    - Start all agents in single process (RECOMMENDED)"
    echo "                    Full web UI + Telegram support"
    echo ""
    echo "  start-multi     - Start agents in separate processes"
    echo "                    Independent control, limited web UI"
    echo ""
    echo "  start-no-telegram - Start without Telegram"
    echo "                    For testing or when tokens unavailable"
    echo ""
    echo "  stop            - Stop all running agents"
    echo ""
    echo "  restart         - Stop and restart in single-process mode"
    echo ""
    echo "  status          - Show current agent status"
    echo ""
    echo "  logs            - Tail all agent logs"
    echo ""
    echo "  test-web        - Test web UI connectivity"
    echo ""
    echo "  test-telegram   - Check Telegram bot status"
    echo ""
    echo "  help            - Show this help message"
    echo ""
    echo -e "${GREEN}Examples:${NC}"
    echo "  $0 start-single   # Recommended for development"
    echo "  $0 status         # Check what's running"
    echo "  $0 restart        # Quick restart"
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}"
}

start_single() {
    echo -e "${GREEN}Starting all agents in single process mode...${NC}"
    bash "$GAIA_DIR/start-all-agents-single-process.sh"
}

start_multi() {
    echo -e "${GREEN}Starting agents in multi-process mode...${NC}"
    bash "$GAIA_DIR/start-all-agents-telegram.sh"
}

start_no_telegram() {
    echo -e "${GREEN}Starting agents without Telegram...${NC}"
    bash "$GAIA_DIR/start-all-agents-no-telegram.sh"
}

stop_agents() {
    echo -e "${YELLOW}Stopping all agents...${NC}"
    sudo pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
    sleep 2
    echo -e "${GREEN}All agents stopped${NC}"
}

restart_agents() {
    echo -e "${YELLOW}Restarting agents...${NC}"
    stop_agents
    start_single
}

show_status() {
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}                    Agent Status Report${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    
    # Check processes
    echo -e "${YELLOW}Running Processes:${NC}"
    ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep | while read line; do
        user=$(echo $line | awk '{print $1}')
        pid=$(echo $line | awk '{print $2}')
        cmd=$(echo $line | awk '{for(i=11;i<=NF;i++) printf "%s ", $i}')
        echo -e "  PID: ${GREEN}$pid${NC} User: ${BLUE}$user${NC}"
    done
    
    if [ $(ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep | wc -l) -eq 0 ]; then
        echo -e "  ${RED}No agents running${NC}"
    fi
    echo ""
    
    # Check ports
    echo -e "${YELLOW}Active Ports:${NC}"
    for port in 3000 3001 3002 3003 3004 3005; do
        if ss -tlnp 2>/dev/null | grep -q ":$port "; then
            echo -e "  Port $port: ${GREEN}ACTIVE${NC}"
        fi
    done
    echo ""
    
    # Check API
    echo -e "${YELLOW}API Status:${NC}"
    response=$(curl -s http://localhost:3000/api/agents 2>/dev/null | jq -r '.data.agents[] | "\(.name): \(.status)"' 2>/dev/null)
    if [ -n "$response" ]; then
        echo "$response" | while read line; do
            name=$(echo $line | cut -d: -f1)
            status=$(echo $line | cut -d: -f2 | tr -d ' ')
            if [ "$status" = "active" ]; then
                echo -e "  $name: ${GREEN}$status${NC}"
            else
                echo -e "  $name: ${RED}$status${NC}"
            fi
        done
    else
        echo -e "  ${RED}API not responding${NC}"
    fi
    echo ""
    
    # Check Docker services
    echo -e "${YELLOW}Docker Services:${NC}"
    for service in postgres nginx django-admin; do
        if docker ps | grep -q "$service"; then
            echo -e "  $service: ${GREEN}RUNNING${NC}"
        else
            echo -e "  $service: ${RED}NOT RUNNING${NC}"
        fi
    done
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
}

show_logs() {
    echo -e "${GREEN}Tailing all agent logs (Ctrl+C to stop)...${NC}"
    tail -f "$GAIA_DIR/logs/"*.log
}

test_web() {
    echo -e "${BLUE}Testing Web UI connectivity...${NC}"
    echo ""
    
    # Test main web UI
    echo -e "${YELLOW}Main Web UI (https://regen.gaiaai.xyz/):${NC}"
    status=$(curl -s -o /dev/null -w "%{http_code}" -u regenai:regen2025 https://regen.gaiaai.xyz/)
    if [ "$status" = "200" ]; then
        echo -e "  Status: ${GREEN}OK ($status)${NC}"
    else
        echo -e "  Status: ${RED}FAILED ($status)${NC}"
    fi
    
    # Test API endpoint
    echo -e "${YELLOW}API Endpoint:${NC}"
    agents=$(curl -s http://localhost:3000/api/agents | jq -r '.data.agents | length' 2>/dev/null)
    if [ -n "$agents" ]; then
        echo -e "  Agents Found: ${GREEN}$agents${NC}"
    else
        echo -e "  ${RED}API not responding${NC}"
    fi
}

test_telegram() {
    echo -e "${BLUE}Checking Telegram Bot Status...${NC}"
    echo ""
    
    for bot in "Advocate:@RegenAdvocacyBot" "VoiceOfNature:@RegenVoiceOfNatureBot" "Governor:@RegenGovernBot" "Narrative:@RegenNarrativeBot"; do
        name=$(echo $bot | cut -d: -f1)
        username=$(echo $bot | cut -d: -f2)
        
        # Check if bot token is configured
        if grep -q "TELEGRAM_BOT_TOKEN" "$GAIA_DIR/characters/$(echo $name | tr '[:upper:]' '[:lower:]').character.json" 2>/dev/null; then
            echo -e "  $username: ${GREEN}Configured${NC}"
        else
            echo -e "  $username: ${RED}Not Configured${NC}"
        fi
    done
}

# Main script logic
case "$1" in
    start-single)
        start_single
        ;;
    start-multi)
        start_multi
        ;;
    start-no-telegram)
        start_no_telegram
        ;;
    stop)
        stop_agents
        ;;
    restart)
        restart_agents
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    test-web)
        test_web
        ;;
    test-telegram)
        test_telegram
        ;;
    help|--help|-h|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        echo ""
        show_help
        exit 1
        ;;
esac