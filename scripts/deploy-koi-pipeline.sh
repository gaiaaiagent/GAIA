#!/bin/bash

# KOI Pipeline Deployment Script
# Deploys the complete KOI sensor-to-agent pipeline

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/opt/projects"
GAIA_REPO="https://github.com/gaiaaiagent/GAIA.git"
KOI_SENSORS_REPO="https://github.com/gaiaaiagent/koi-sensors.git"
KOI_PROCESSOR_REPO="https://github.com/gaiaaiagent/koi-processor.git"

echo -e "${GREEN}=== KOI Pipeline Deployment Script ===${NC}"
echo

# Check if running as appropriate user
if [ "$USER" != "koiops" ] && [ "$USER" != "root" ]; then
    echo -e "${YELLOW}Warning: Running as $USER. Recommended to run as 'koiops' user.${NC}"
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists python3; then
    echo -e "${RED}Error: Python 3 is not installed${NC}"
    exit 1
fi

if ! command_exists node; then
    echo -e "${RED}Error: Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists docker; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    exit 1
fi

# Check if Docker daemon is running
if ! docker info >/dev/null 2>&1; then
    echo -e "${RED}Error: Docker daemon is not running${NC}"
    echo "Please start Docker and try again"
    exit 1
fi

if ! command_exists psql; then
    echo -e "${YELLOW}Warning: PostgreSQL client not installed. Database checks will be skipped.${NC}"
fi

echo -e "${GREEN}✓ Prerequisites check passed${NC}"
echo

# Create project directory if it doesn't exist
if [ ! -d "$PROJECT_DIR" ]; then
    echo "Creating project directory..."
    sudo mkdir -p "$PROJECT_DIR"
    if [ "$USER" == "koiops" ]; then
        sudo chown -R koiops:koiops "$PROJECT_DIR"
    fi
fi

cd "$PROJECT_DIR"

# Clone or update repositories
echo "Setting up repositories..."

# GAIA repository
if [ -d "GAIA" ]; then
    echo "Updating GAIA repository..."
    cd GAIA
    git fetch origin
    git checkout regen-prod
    git pull origin regen-prod
    cd ..
else
    echo "Cloning GAIA repository..."
    git clone "$GAIA_REPO" -b regen-prod GAIA
fi

# KOI Sensors repository
if [ -d "koi-sensors" ]; then
    echo "Updating koi-sensors repository..."
    cd koi-sensors
    git pull origin main
    cd ..
else
    echo "Cloning koi-sensors repository..."
    git clone "$KOI_SENSORS_REPO"
fi

# KOI Processor repository
if [ -d "koi-processor" ]; then
    echo "Updating koi-processor repository..."
    cd koi-processor
    git pull origin main
    cd ..
else
    echo "Cloning koi-processor repository..."
    git clone "$KOI_PROCESSOR_REPO"
fi

echo -e "${GREEN}✓ Repositories ready${NC}"
echo

# Install Python dependencies
echo "Installing Python dependencies..."

# KOI Sensors
echo "Setting up koi-sensors..."
cd "$PROJECT_DIR/koi-sensors"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

# KOI Processor
echo "Setting up koi-processor..."
cd "$PROJECT_DIR/koi-processor"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate

echo -e "${GREEN}✓ Python dependencies installed${NC}"
echo

# Configure environment
echo "Configuring environment..."
cd "$PROJECT_DIR/GAIA"

if [ ! -f "config/koi-pipeline.env" ]; then
    if [ -f "config/koi-pipeline.env.template" ]; then
        cp config/koi-pipeline.env.template config/koi-pipeline.env
        echo -e "${YELLOW}Please edit config/koi-pipeline.env with your settings${NC}"
        echo "Press Enter to continue after editing..."
        read
    else
        echo "Creating default environment configuration..."
        mkdir -p config
        cat > config/koi-pipeline.env <<EOF
# KOI Pipeline Environment Configuration

# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
POSTGRES_HOST=localhost
POSTGRES_PORT=5433
POSTGRES_DB=eliza
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# KOI Coordinator
KOI_COORDINATOR_PORT=8000
KOI_COORDINATOR_HOST=0.0.0.0

# KOI Event Bridge
KOI_EVENT_BRIDGE_PORT=8100
KOI_EVENT_BRIDGE_HOST=0.0.0.0

# BGE Server
BGE_SERVER_PORT=8888
BGE_SERVER_HOST=0.0.0.0

# Website Sensor Configuration
WEBSITE_CHECK_INTERVAL=1800  # 30 minutes
WEBSITE_MAX_DEPTH=3

# Logging
LOG_LEVEL=INFO
LOG_DIR=/var/log/koi
EOF
        echo -e "${GREEN}✓ Created default environment configuration${NC}"
    fi
fi

# Create systemd service files
echo "Creating systemd service files..."
sudo mkdir -p /etc/systemd/system

# Check if systemd directory exists in config
if [ ! -d "config/systemd" ]; then
    mkdir -p config/systemd
    
    # Create service files
    cat > config/systemd/koi-coordinator.service <<EOF
[Unit]
Description=KOI Coordinator Service
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=koiops
WorkingDirectory=$PROJECT_DIR/koi-sensors
Environment="PATH=$PROJECT_DIR/koi-sensors/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=$PROJECT_DIR/GAIA/config/koi-pipeline.env
ExecStart=$PROJECT_DIR/koi-sensors/venv/bin/python koi_protocol/coordinator/run_coordinator.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    cat > config/systemd/koi-event-bridge.service <<EOF
[Unit]
Description=KOI Event Bridge Service
After=network.target postgresql.service koi-coordinator.service
Requires=postgresql.service

[Service]
Type=simple
User=koiops
WorkingDirectory=$PROJECT_DIR/koi-processor
Environment="PATH=$PROJECT_DIR/koi-processor/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=$PROJECT_DIR/GAIA/config/koi-pipeline.env
ExecStart=$PROJECT_DIR/koi-processor/venv/bin/python koi_event_bridge.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    cat > config/systemd/bge-server.service <<EOF
[Unit]
Description=BGE Embedding Server
After=network.target
Wants=koi-event-bridge.service

[Service]
Type=simple
User=koiops
WorkingDirectory=$PROJECT_DIR/koi-processor
Environment="PATH=$PROJECT_DIR/koi-processor/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=$PROJECT_DIR/GAIA/config/koi-pipeline.env
ExecStart=$PROJECT_DIR/koi-processor/venv/bin/python bge_server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    cat > config/systemd/website-sensor.service <<EOF
[Unit]
Description=KOI Website Sensor
After=network.target koi-coordinator.service
Requires=koi-coordinator.service

[Service]
Type=simple
User=koiops
WorkingDirectory=$PROJECT_DIR/koi-sensors/sensors/websites
Environment="PATH=$PROJECT_DIR/koi-sensors/venv/bin:/usr/local/bin:/usr/bin:/bin"
EnvironmentFile=$PROJECT_DIR/GAIA/config/koi-pipeline.env
ExecStart=$PROJECT_DIR/koi-sensors/venv/bin/python run_website_sensor.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
fi

# Install systemd services
echo "Installing systemd services..."
sudo cp config/systemd/*.service /etc/systemd/system/
sudo systemctl daemon-reload

echo -e "${GREEN}✓ Systemd services created${NC}"
echo

# Check PostgreSQL
echo "Checking PostgreSQL..."
# Look for any PostgreSQL container (could be named differently)
POSTGRES_CONTAINER=$(docker ps --format "table {{.Names}}" | grep -E "postgres|pgvector" | head -1)

if [ -n "$POSTGRES_CONTAINER" ]; then
    echo -e "${GREEN}✓ PostgreSQL container is running: $POSTGRES_CONTAINER${NC}"
    
    # Check pgvector extension
    if command_exists psql; then
        echo "Checking pgvector extension..."
        if docker exec $POSTGRES_CONTAINER psql -U postgres -d eliza -c "SELECT * FROM pg_extension WHERE extname='vector';" 2>/dev/null | grep -q vector; then
            echo -e "${GREEN}✓ pgvector extension is installed${NC}"
        else
            echo -e "${YELLOW}Installing pgvector extension...${NC}"
            docker exec $POSTGRES_CONTAINER psql -U postgres -d eliza -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true
        fi
    fi
else
    echo -e "${YELLOW}Warning: No PostgreSQL container found${NC}"
    echo "Attempting to start or create PostgreSQL container..."
    
    # Try to start existing container first
    if docker start gaia-postgres-1 2>/dev/null; then
        echo -e "${GREEN}✓ Started existing PostgreSQL container${NC}"
    else
        # Create new container with pgvector
        echo "Creating new PostgreSQL container with pgvector..."
        docker run -d \
            --name gaia-postgres-1 \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=eliza \
            -p 5433:5432 \
            ankane/pgvector:latest || \
        docker run -d \
            --name gaia-postgres-1 \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=eliza \
            -p 5433:5432 \
            pgvector/pgvector:pg17
        
        # Wait for PostgreSQL to be ready
        echo "Waiting for PostgreSQL to be ready..."
        sleep 5
        
        # Create pgvector extension
        docker exec gaia-postgres-1 psql -U postgres -d eliza -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true
    fi
fi

echo

# Start services
echo "Starting KOI pipeline services..."

read -p "Do you want to start the services now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo systemctl enable koi-coordinator koi-event-bridge bge-server website-sensor
    sudo systemctl start koi-coordinator
    sleep 2
    sudo systemctl start koi-event-bridge
    sleep 2
    sudo systemctl start bge-server
    sleep 2
    sudo systemctl start website-sensor
    
    echo
    echo "Checking service status..."
    sleep 3
    
    for service in koi-coordinator koi-event-bridge bge-server website-sensor; do
        if systemctl is-active --quiet $service; then
            echo -e "${GREEN}✓ $service is running${NC}"
        else
            echo -e "${RED}✗ $service failed to start${NC}"
            echo "  Check logs with: sudo journalctl -u $service -n 50"
        fi
    done
fi

echo
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo
echo "Quick commands:"
echo "  Check status:  systemctl status koi-*"
echo "  View logs:     sudo journalctl -u koi-coordinator -f"
echo "  Test pipeline: curl http://localhost:8000/status"
echo
echo "For detailed documentation, see:"
echo "  $PROJECT_DIR/GAIA/docs/KOI-PIPELINE-INTEGRATION.md"
echo