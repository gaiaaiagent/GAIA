#!/bin/bash

# RegenAI Standardized Deployment Script
# Always runs as darren user to prevent ownership issues
# Usage: sudo -u darren /opt/projects/GAIA/deploy.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DEPLOY_USER="darren"
GAIA_DIR="/opt/projects/GAIA"
GAIA_DIRECT_DIR="/opt/projects/GAIA-direct"
PLUGIN_KNOWLEDGE_DIR="/opt/projects/plugin-knowledge"
LOG_DIR="/opt/projects/GAIA-direct/logs"
BRANCH="regen-knowledge-rag"

# Deployment options
SKIP_BUILD=false
SKIP_PULL=false
FORCE_RESTART=false
QUIET_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-build)
            SKIP_BUILD=true
            shift
            ;;
        --skip-pull)
            SKIP_PULL=true
            shift
            ;;
        --force-restart)
            FORCE_RESTART=true
            shift
            ;;
        --quiet|-q)
            QUIET_MODE=true
            shift
            ;;
        --help|-h)
            echo "RegenAI Deployment Script"
            echo ""
            echo "Usage: sudo -u darren $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-build      Skip the build step (use existing build)"
            echo "  --skip-pull       Skip git pull (deploy current code)"
            echo "  --force-restart   Just restart agents (no pull, no build)"
            echo "  --quiet, -q       Minimal output"
            echo "  --help, -h        Show this help message"
            echo ""
            echo "Examples:"
            echo "  sudo -u darren $0                    # Full deployment"
            echo "  sudo -u darren $0 --skip-build       # Pull and restart only"
            echo "  sudo -u darren $0 --force-restart    # Restart agents only"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Logging function
log() {
    if [ "$QUIET_MODE" = false ]; then
        echo "$1"
    fi
}

# Print colored message
print_message() {
    local color=$1
    local message=$2
    if [ "$QUIET_MODE" = false ]; then
        echo -e "${color}${message}${NC}"
    fi
}

print_header() {
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    print_message "$BLUE" "  RegenAI Deployment - $(date '+%Y-%m-%d %H:%M:%S')"
    print_message "$BLUE" "  User: $(whoami) | Branch: $BRANCH"
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    echo ""
}

# Check if running as correct user
check_user() {
    if [ "$(whoami)" != "$DEPLOY_USER" ]; then
        print_message "$RED" "❌ ERROR: This script must be run as $DEPLOY_USER user"
        echo "Please run: sudo -u $DEPLOY_USER $0"
        exit 1
    fi
}

# Stop all running agents
stop_agents() {
    print_message "$YELLOW" "🛑 Stopping running agents..."
    
    pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
    sleep 2
    
    # Verify stopped
    if ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep > /dev/null; then
        print_message "$YELLOW" "⚠️  Some agents still running, forcing stop..."
        pkill -9 -f 'packages/cli/dist/index.js start' 2>/dev/null || true
        sleep 2
    fi
    
    if ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep > /dev/null; then
        print_message "$RED" "❌ Could not stop all agents"
        return 1
    else
        print_message "$GREEN" "✅ All agents stopped"
        return 0
    fi
}

# Pull latest code from git
pull_latest() {
    print_message "$YELLOW" "📥 Pulling latest code..."
    
    cd "$GAIA_DIRECT_DIR"
    
    # Check current status
    local current_branch=$(git branch --show-current)
    local current_commit=$(git rev-parse --short HEAD)
    
    log "  Current branch: $current_branch"
    log "  Current commit: $current_commit"
    
    # Check for uncommitted changes
    if [[ -n $(git status --porcelain) ]]; then
        print_message "$YELLOW" "⚠️  Local changes detected, stashing..."
        git stash push -m "Auto-stash before deployment $(date +%Y%m%d-%H%M%S)"
    fi
    
    # Fetch and pull
    log "  Fetching from origin..."
    git fetch origin
    
    log "  Pulling $BRANCH..."
    if git pull origin "$BRANCH"; then
        local new_commit=$(git rev-parse --short HEAD)
        print_message "$GREEN" "✅ Updated to commit: $new_commit"
        
        # Show what changed
        if [ "$current_commit" != "$new_commit" ]; then
            log ""
            log "  Changes pulled:"
            git log --oneline "$current_commit..$new_commit" | head -5
        fi
    else
        print_message "$RED" "❌ Git pull failed"
        return 1
    fi
}

# Build the project
build_project() {
    print_message "$YELLOW" "🔨 Building project..."
    
    cd "$GAIA_DIRECT_DIR"
    
    # Ensure bun is in PATH
    if ! command -v bun &> /dev/null; then
        export PATH="$HOME/.bun/bin:$PATH"
    fi
    
    # Verify bun is available
    if ! command -v bun &> /dev/null; then
        print_message "$RED" "❌ bun not found in PATH"
        return 1
    fi
    
    log "  Using bun: $(which bun)"
    log "  Bun version: $(bun --version)"
    
    # Clean caches
    log "  Cleaning build caches..."
    rm -rf node_modules/.cache .turbo 2>/dev/null || true
    
    # Install dependencies
    log "  Installing dependencies..."
    if ! bun install; then
        print_message "$RED" "❌ Dependency installation failed"
        return 1
    fi
    
    # Build
    log "  Building packages..."
    if ! bun run build; then
        print_message "$RED" "❌ Build failed"
        return 1
    fi
    
    # Copy plugin-knowledge if needed
    if [ -d "$GAIA_DIRECT_DIR/packages/plugin-knowledge" ] && [ -d "$PLUGIN_KNOWLEDGE_DIR" ]; then
        log "  Copying plugin-knowledge to external directory..."
        cp -f "$GAIA_DIRECT_DIR/packages/plugin-knowledge/dist/index.js" \
              "$PLUGIN_KNOWLEDGE_DIR/dist/index.js" 2>/dev/null || true
    fi
    
    print_message "$GREEN" "✅ Build completed successfully"
}

# Start all agents
start_agents() {
    print_message "$YELLOW" "🚀 Starting agents..."
    
    # Use the start script
    if [ -f "$GAIA_DIR/start-all-agents.sh" ]; then
        bash "$GAIA_DIR/start-all-agents.sh"
    else
        print_message "$RED" "❌ Start script not found: $GAIA_DIR/start-all-agents.sh"
        return 1
    fi
}

# Verify deployment
verify_deployment() {
    print_message "$YELLOW" "🔍 Verifying deployment..."
    
    sleep 5
    
    # Count running agents
    local agent_count=$(ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep | wc -l)
    
    if [ "$agent_count" -eq 5 ]; then
        print_message "$GREEN" "✅ All 5 agents running successfully!"
        
        # List agents
        log ""
        log "Running agents:"
        ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep | \
            awk '{print $NF}' | sed 's|.*/||' | while read agent; do
            log "  • $agent"
        done
    elif [ "$agent_count" -gt 0 ]; then
        print_message "$YELLOW" "⚠️  Only $agent_count of 5 agents running"
        log "Check logs at: $LOG_DIR"
        return 1
    else
        print_message "$RED" "❌ No agents running!"
        log "Check logs at: $LOG_DIR"
        return 1
    fi
    
    # Check web services
    log ""
    log "Web services:"
    
    if docker ps | grep -q nginx; then
        log "  • Nginx: ✅ Running"
    else
        log "  • Nginx: ⚠️  Not running (start with: docker compose up -d nginx)"
    fi
    
    if docker ps | grep -q postgres; then
        log "  • PostgreSQL: ✅ Running"
    else
        log "  • PostgreSQL: ❌ Not running (start with: docker compose up -d postgres)"
    fi
    
    # Show recent logs
    if [ -f "$LOG_DIR/regenai.log" ]; then
        log ""
        log "Recent activity:"
        tail -n 3 "$LOG_DIR/regenai.log" | head -n 2
    fi
}

# Main deployment flow
main() {
    # Check user first
    check_user
    
    # Print header
    if [ "$QUIET_MODE" = false ]; then
        print_header
    fi
    
    # Force restart mode - just restart agents
    if [ "$FORCE_RESTART" = true ]; then
        print_message "$BLUE" "Force restart mode - restarting agents only"
        stop_agents
        start_agents
        verify_deployment
        exit $?
    fi
    
    # Normal deployment flow
    
    # Step 1: Stop agents
    if ! stop_agents; then
        exit 1
    fi
    
    # Step 2: Pull latest (unless skipped)
    if [ "$SKIP_PULL" = false ]; then
        if ! pull_latest; then
            exit 1
        fi
    else
        print_message "$BLUE" "Skipping git pull (--skip-pull)"
    fi
    
    # Step 3: Build (unless skipped)
    if [ "$SKIP_BUILD" = false ]; then
        if ! build_project; then
            exit 1
        fi
    else
        print_message "$BLUE" "Skipping build (--skip-build)"
    fi
    
    # Step 4: Start agents
    if ! start_agents; then
        exit 1
    fi
    
    # Step 5: Verify
    verify_deployment
    local verify_result=$?
    
    # Summary
    echo ""
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    if [ $verify_result -eq 0 ]; then
        print_message "$GREEN" "  ✅ Deployment completed successfully!"
    else
        print_message "$YELLOW" "  ⚠️  Deployment completed with warnings"
    fi
    print_message "$BLUE" "═══════════════════════════════════════════════════════"
    
    if [ "$QUIET_MODE" = false ]; then
        echo ""
        echo "Access points:"
        echo "  • Web UI: https://regen.gaiaai.xyz/"
        echo "  • Admin: https://admin.regen.gaiaai.xyz/admin/"
        echo ""
        echo "Monitor logs:"
        echo "  • All agents: tail -f $LOG_DIR/all-agents-hybrid.log"
        echo "  • Specific: tail -f $LOG_DIR/regenai.log"
    fi
    
    exit $verify_result
}

# Run main function
main