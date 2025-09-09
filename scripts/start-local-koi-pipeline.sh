#!/bin/bash

# Local KOI Pipeline Test Script
# Starts all KOI services locally for testing

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Base directories
GAIA_DIR="/Users/darrenzal/projects/RegenAI/GAIA"
KOI_SENSORS_DIR="/Users/darrenzal/projects/RegenAI/koi-sensors"
KOI_PROCESSOR_DIR="/Users/darrenzal/projects/RegenAI/koi-processor"

# Ports configuration
KOI_COORDINATOR_PORT=8200
KOI_EVENT_BRIDGE_PORT=8100
BGE_SERVER_PORT=8090
POSTGRES_PORT=5432

echo -e "${GREEN}=== Starting Local KOI Pipeline ===${NC}"
echo

# Function to check if port is in use
check_port() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to stop service on port
stop_port() {
    echo "Stopping process on port $1..."
    lsof -ti :$1 | xargs kill -9 2>/dev/null || true
}

# Check and stop conflicting services
echo "Checking for conflicting services..."
for port in $KOI_COORDINATOR_PORT $KOI_EVENT_BRIDGE_PORT $BGE_SERVER_PORT; do
    if check_port $port; then
        echo -e "${YELLOW}Port $port is in use. Stopping existing service...${NC}"
        stop_port $port
    fi
done

# Create log directory
LOG_DIR="$GAIA_DIR/logs/koi-local"
mkdir -p "$LOG_DIR"

# Start PostgreSQL with Docker (if Docker is available)
if command -v docker &> /dev/null && docker info &> /dev/null 2>&1; then
    echo -e "${GREEN}Starting PostgreSQL with pgvector...${NC}"
    
    # Check if container exists
    if docker ps -a | grep -q "koi-postgres-local"; then
        docker start koi-postgres-local
    else
        docker run -d \
            --name koi-postgres-local \
            -e POSTGRES_PASSWORD=postgres \
            -e POSTGRES_DB=eliza \
            -p 5432:5432 \
            ankane/pgvector:latest
    fi
    
    # Wait for PostgreSQL to be ready
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
    
    # Create pgvector extension
    docker exec koi-postgres-local psql -U postgres -d eliza -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>/dev/null || true
    
    export POSTGRES_URL="postgresql://postgres:postgres@localhost:5432/eliza"
else
    echo -e "${YELLOW}Docker not available. Using SQLite fallback for testing.${NC}"
    export DATABASE_TYPE="sqlite"
    export SQLITE_PATH="$GAIA_DIR/data/koi-test.db"
    mkdir -p "$GAIA_DIR/data"
fi

# Start KOI Coordinator
echo -e "${GREEN}Starting KOI Coordinator on port $KOI_COORDINATOR_PORT...${NC}"
cd "$KOI_SENSORS_DIR"
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment for koi-sensors..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

export KOI_COORDINATOR_PORT=$KOI_COORDINATOR_PORT
nohup python koi_protocol/coordinator/run_coordinator.py > "$LOG_DIR/coordinator.log" 2>&1 &
COORDINATOR_PID=$!
echo "Coordinator started with PID $COORDINATOR_PID"
deactivate

# Wait for coordinator to start
sleep 3

# Start Event Bridge
echo -e "${GREEN}Starting Event Bridge on port $KOI_EVENT_BRIDGE_PORT...${NC}"
cd "$KOI_PROCESSOR_DIR"
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment for koi-processor..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    pip install fastapi uvicorn
else
    source venv/bin/activate
fi

export KOI_EVENT_BRIDGE_PORT=$KOI_EVENT_BRIDGE_PORT
export POSTGRES_URL=${POSTGRES_URL:-"sqlite:///$GAIA_DIR/data/koi-test.db"}
nohup python koi_event_bridge.py > "$LOG_DIR/event-bridge.log" 2>&1 &
EVENT_BRIDGE_PID=$!
echo "Event Bridge started with PID $EVENT_BRIDGE_PID"

# Start BGE Server
echo -e "${GREEN}Starting BGE Server on port $BGE_SERVER_PORT...${NC}"
export BGE_SERVER_PORT=$BGE_SERVER_PORT
nohup python bge_server.py > "$LOG_DIR/bge-server.log" 2>&1 &
BGE_SERVER_PID=$!
echo "BGE Server started with PID $BGE_SERVER_PID"
deactivate

# Wait for services to start
sleep 3

# Start Website Sensor (with limited scope for testing)
echo -e "${GREEN}Starting Website Sensor (test mode)...${NC}"
cd "$KOI_SENSORS_DIR"
source venv/bin/activate

# Create a test configuration with fewer sites
cat > sensors/websites/test-config.yaml <<EOF
sensor:
  node_id: website-sensor-local-001
  sensor_name: website-sensor-local
  platform: website
  api:
    type: http
    base_url: http://localhost:$KOI_COORDINATOR_PORT
  koi_net:
    coordinator_url: http://localhost:$KOI_COORDINATOR_PORT
    node_type: partial
    node_name: website-sensor-local-001

websites:
  - url: https://regen.network
    name: Regen Network Main
    check_interval: 300  # 5 minutes for testing
    max_depth: 1
  - url: https://docs.regen.network
    name: Regen Docs
    check_interval: 300
    max_depth: 1
EOF

export PYTHONPATH="$KOI_SENSORS_DIR"
export KOI_COORDINATOR_URL="http://localhost:$KOI_COORDINATOR_PORT"
nohup python sensors/websites/run_website_sensor.py --config sensors/websites/test-config.yaml > "$LOG_DIR/website-sensor.log" 2>&1 &
SENSOR_PID=$!
echo "Website Sensor started with PID $SENSOR_PID"
deactivate

# Create stop script
cat > "$GAIA_DIR/scripts/stop-local-koi-pipeline.sh" <<EOF
#!/bin/bash
echo "Stopping KOI Pipeline services..."
kill $COORDINATOR_PID 2>/dev/null || true
kill $EVENT_BRIDGE_PID 2>/dev/null || true
kill $BGE_SERVER_PID 2>/dev/null || true
kill $SENSOR_PID 2>/dev/null || true
docker stop koi-postgres-local 2>/dev/null || true
echo "All services stopped."
EOF
chmod +x "$GAIA_DIR/scripts/stop-local-koi-pipeline.sh"

echo
echo -e "${GREEN}=== KOI Pipeline Started Successfully ===${NC}"
echo
echo "Service Status:"
echo "  Coordinator: http://localhost:$KOI_COORDINATOR_PORT/events/poll?node_id=test"
echo "  Event Bridge: http://localhost:$KOI_EVENT_BRIDGE_PORT/health"
echo "  BGE Server: http://localhost:$BGE_SERVER_PORT/health"
echo "  Logs: $LOG_DIR/"
echo
echo "To stop all services: $GAIA_DIR/scripts/stop-local-koi-pipeline.sh"
echo
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Start the Eliza agent with: cd $GAIA_DIR && bun packages/cli/dist/index.js start --character characters/testregen.character.json"
echo "2. Start the dashboard: cd $GAIA_DIR && bun packages/server/src/index.ts"
echo "3. Access dashboard at: http://localhost:3000/koi"
echo