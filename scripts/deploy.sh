#!/bin/bash

# Auto-deployment script for RegenAI production
# Triggered by GitHub webhook when regen branch is updated

set -e

# Configuration
DEPLOY_DIR="/opt/projects/GAIA"
BRANCH="regen"
COMPOSE_FILE="docker-compose-ssl.yaml"
LOG_FILE="/var/log/regenai-deploy.log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Error handling
error_exit() {
    echo -e "${RED}[ERROR] $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

# Main deployment function
deploy() {
    log "=== Starting deployment ==="
    
    # Navigate to project directory
    cd "$DEPLOY_DIR" || error_exit "Failed to navigate to $DEPLOY_DIR"
    
    # Fetch latest changes
    log "Fetching latest changes from origin..."
    git fetch origin || error_exit "Failed to fetch from origin"
    
    # Check if there are updates
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/$BRANCH)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        log "Already up to date. No deployment needed."
        exit 0
    fi
    
    # Store current commit for rollback
    PREVIOUS_COMMIT=$LOCAL
    log "Current commit: $PREVIOUS_COMMIT"
    log "New commit: $REMOTE"
    
    # Pull latest changes
    log "Pulling latest changes..."
    git pull origin $BRANCH || error_exit "Failed to pull changes"
    
    # Backup current environment
    log "Creating backup of current configuration..."
    cp docker-compose-ssl.yaml docker-compose-ssl.yaml.backup.$(date +%Y%m%d_%H%M%S)
    
    # Pull new Docker images if needed
    log "Pulling Docker images..."
    docker compose -f $COMPOSE_FILE pull || {
        log "Warning: Failed to pull some images, continuing with existing ones"
    }
    
    # Restart services with minimal downtime
    log "Restarting services..."
    
    # For zero-downtime deployment, we could use:
    # docker compose -f $COMPOSE_FILE up -d --no-deps --build
    # But for now, let's do a simple restart
    
    docker compose -f $COMPOSE_FILE up -d --remove-orphans || {
        log "Deployment failed! Rolling back..."
        git reset --hard $PREVIOUS_COMMIT
        docker compose -f $COMPOSE_FILE up -d --remove-orphans
        error_exit "Deployment failed and rolled back to $PREVIOUS_COMMIT"
    }
    
    # Wait for services to be healthy
    log "Waiting for services to be healthy..."
    sleep 10
    
    # Health check
    log "Running health checks..."
    
    # Check if nginx is responding
    if curl -f -s -o /dev/null https://regen.gaiaai.xyz; then
        log "✓ Main site is responding"
    else
        log "✗ Main site is not responding"
    fi
    
    # Check if agents are responding
    if curl -f -s -o /dev/null -u regenai:regen2025 https://agents.regen.gaiaai.xyz; then
        log "✓ Agents interface is responding"
    else
        log "✗ Agents interface is not responding"
    fi
    
    # Check if admin is responding
    if curl -f -s -o /dev/null https://admin.regen.gaiaai.xyz/admin/login/; then
        log "✓ Django admin is responding"
    else
        log "✗ Django admin is not responding"
    fi
    
    # Clean up old images
    log "Cleaning up old Docker images..."
    docker image prune -f || log "Warning: Failed to prune images"
    
    # Log success
    NEW_COMMIT=$(git rev-parse HEAD)
    log "=== Deployment successful! ==="
    log "Deployed commit: $NEW_COMMIT"
    
    # Send notification (optional - could integrate with Slack, Discord, etc.)
    # curl -X POST -H 'Content-type: application/json' \
    #     --data "{\"text\":\"RegenAI deployed successfully to production. Commit: $NEW_COMMIT\"}" \
    #     YOUR_WEBHOOK_URL
}

# Run deployment
deploy