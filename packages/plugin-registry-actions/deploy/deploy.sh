#!/bin/bash
# Regen Registry Assistant Deployment Script
# Run this on the target server after copying files

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
DEPLOY_DIR="/opt/projects/registry-eliza"
SERVICE_NAME="registry-eliza"
DB_NAME="registry_eliza"
DB_HOST="127.0.0.1"
DB_PORT="5433"

echo "========================================"
echo "Regen Registry Assistant Deployment"
echo "========================================"
echo ""

# Check if running as appropriate user
if [ "$EUID" -eq 0 ]; then
    log_error "Please run as a regular user (shawn), not root"
    log_info "Use: sudo for specific commands that need root"
    exit 1
fi

# Step 1: Check prerequisites
log_info "Step 1: Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    log_error "Bun is not installed. Please install bun first."
    exit 1
fi
log_info "  ✓ Bun $(bun --version) found"

if ! command -v docker &> /dev/null; then
    log_error "Docker is not installed."
    exit 1
fi
log_info "  ✓ Docker $(docker --version | cut -d' ' -f3 | tr -d ',') found"

# Check PostgreSQL
if ! docker exec gaia-postgres-1 pg_isready -h localhost -p 5432 &> /dev/null; then
    log_error "PostgreSQL container is not running"
    exit 1
fi
log_info "  ✓ PostgreSQL container running"

# Step 2: Create database if not exists
log_info "Step 2: Setting up database..."

DB_EXISTS=$(docker exec gaia-postgres-1 psql -U postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null || echo "0")
if [ "$DB_EXISTS" != "1" ]; then
    log_info "  Creating database $DB_NAME..."
    docker exec gaia-postgres-1 psql -U postgres -c "CREATE DATABASE $DB_NAME;" 2>/dev/null
    docker exec gaia-postgres-1 psql -U postgres -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null
    log_info "  ✓ Database created with pgvector extension"
else
    log_info "  ✓ Database $DB_NAME already exists"
fi

# Step 3: Update from git (if needed)
log_info "Step 3: Checking git repository..."
cd "$DEPLOY_DIR"

if [ -d ".git" ]; then
    CURRENT_BRANCH=$(git branch --show-current)
    log_info "  Git repository detected, branch: $CURRENT_BRANCH"

    # Check for updates
    git fetch origin 2>/dev/null
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/$CURRENT_BRANCH 2>/dev/null)

    if [ "$LOCAL" != "$REMOTE" ]; then
        log_info "  Updates available, pulling..."
        git pull origin "$CURRENT_BRANCH"
        log_info "  ✓ Repository updated"
    else
        log_info "  ✓ Repository up to date"
    fi
else
    log_warn "  Not a git repository. Assuming files are in place."
fi

# Step 4: Install dependencies
log_info "Step 4: Installing dependencies..."
bun install --frozen-lockfile 2>/dev/null || bun install
log_info "  ✓ Dependencies installed"

# Step 5: Build the project
log_info "Step 5: Building project..."
bun run build
log_info "  ✓ Build complete"

# Step 6: Set up environment file
log_info "Step 6: Configuring environment..."
ENV_FILE="$DEPLOY_DIR/.env"
if [ ! -f "$ENV_FILE" ]; then
    cp "$DEPLOY_DIR/packages/plugin-registry-actions/deploy/.env.production" "$ENV_FILE"
    log_warn "  Created .env file - PLEASE EDIT WITH YOUR API KEYS"
    log_warn "  Edit: $ENV_FILE"
else
    log_info "  ✓ Environment file exists"
fi

# Step 7: Set up MCP configuration
log_info "Step 7: Configuring MCP servers..."
MCP_FILE="$DEPLOY_DIR/.mcp.json"
if [ ! -f "$MCP_FILE" ]; then
    cp "$DEPLOY_DIR/packages/plugin-registry-actions/deploy/.mcp.production.json" "$MCP_FILE"
    log_info "  ✓ MCP configuration created"
else
    log_info "  ✓ MCP configuration exists"
fi

# Step 8: Install systemd service
log_info "Step 8: Installing systemd service..."
SERVICE_FILE="/etc/systemd/system/$SERVICE_NAME.service"
DEPLOY_SERVICE="$DEPLOY_DIR/packages/plugin-registry-actions/deploy/registry-eliza.service"

if [ -f "$DEPLOY_SERVICE" ]; then
    sudo cp "$DEPLOY_SERVICE" "$SERVICE_FILE"
    sudo systemctl daemon-reload
    log_info "  ✓ Systemd service installed"
else
    log_error "  Service file not found: $DEPLOY_SERVICE"
fi

# Step 9: Configure nginx
log_info "Step 9: Configuring nginx..."
NGINX_CONF="$DEPLOY_DIR/packages/plugin-registry-actions/deploy/nginx-registry.conf"

if [ -f "$NGINX_CONF" ]; then
    docker cp "$NGINX_CONF" gaia-nginx:/etc/nginx/conf.d/registry.conf

    # Test nginx configuration
    if docker exec gaia-nginx nginx -t 2>/dev/null; then
        docker exec gaia-nginx nginx -s reload
        log_info "  ✓ Nginx configured and reloaded"
    else
        log_error "  Nginx configuration test failed"
    fi
else
    log_warn "  Nginx config not found, skipping..."
fi

# Step 10: Start the service
log_info "Step 10: Starting service..."

# Check if .env has been configured
if grep -q "your_anthropic_api_key_here" "$ENV_FILE" 2>/dev/null; then
    log_warn "  ⚠ Environment file not configured!"
    log_warn "  Please edit $ENV_FILE and add your API keys"
    log_warn "  Then run: sudo systemctl start $SERVICE_NAME"
else
    sudo systemctl enable "$SERVICE_NAME"
    sudo systemctl start "$SERVICE_NAME"

    # Wait and check status
    sleep 3
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_info "  ✓ Service started successfully"
    else
        log_error "  Service failed to start. Check logs:"
        log_error "  journalctl -u $SERVICE_NAME -n 50"
    fi
fi

echo ""
echo "========================================"
echo "Deployment Summary"
echo "========================================"
echo ""
echo "Application: $DEPLOY_DIR"
echo "Service:     $SERVICE_NAME"
echo "Port:        3001"
echo "Database:    $DB_NAME"
echo ""
echo "Commands:"
echo "  Start:   sudo systemctl start $SERVICE_NAME"
echo "  Stop:    sudo systemctl stop $SERVICE_NAME"
echo "  Restart: sudo systemctl restart $SERVICE_NAME"
echo "  Logs:    journalctl -u $SERVICE_NAME -f"
echo ""

# DNS check
log_info "Checking DNS..."
DNS_RESULT=$(dig +short registry.regen.gaiaai.xyz 2>/dev/null || echo "")
if [ -z "$DNS_RESULT" ]; then
    log_warn "⚠ DNS for registry.regen.gaiaai.xyz is NOT configured"
    log_warn "  Please add an A record pointing to this server's IP"
else
    log_info "✓ DNS resolves to: $DNS_RESULT"
fi

echo ""
echo "Next steps:"
echo "1. Edit .env file with your API keys"
echo "2. Configure DNS for registry.regen.gaiaai.xyz"
echo "3. Run SSL certificate update:"
echo "   docker exec -it gaia-nginx certbot certonly --nginx \\"
echo "     -d regen.gaiaai.xyz -d registry.regen.gaiaai.xyz"
echo ""
log_info "Deployment complete!"
