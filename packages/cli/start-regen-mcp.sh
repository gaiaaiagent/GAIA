#!/usr/bin/env bash

# Start wrapper for Regen MCP Server
# This script starts the official Regen Network MCP server with proper environment setup

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Change to the Regen MCP directory
cd "$SCRIPT_DIR/mcp-servers/mcp-regen" || {
    echo "Error: Could not find mcp-servers/mcp-regen directory"
    echo "Please ensure the Regen MCP server is properly installed"
    exit 1
}

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies for Regen MCP server..."
    npm install || {
        echo "Error: Failed to install dependencies"
        exit 1
    }
fi

# Check if dist directory exists, if not build the project
if [ ! -d "server/dist" ]; then
    echo "Building the Regen MCP server..."
    npm run build || {
        echo "Error: Failed to build the server"
        exit 1
    }
fi

# Verify the server file exists
if [ ! -f "server/dist/index.js" ]; then
    echo "Error: Server file not found at server/dist/index.js"
    echo "Build may have failed"
    exit 1
fi

# Set default environment variables if not provided
export REGEN_RPC_ENDPOINT="${REGEN_RPC_ENDPOINT:-https://regen-rpc.polkachu.com}"
export REGEN_REST_ENDPOINT="${REGEN_REST_ENDPOINT:-https://regen-rest.publicnode.com}"

# Start the MCP server
echo "Starting Regen MCP Server..."
echo "RPC Endpoint: $REGEN_RPC_ENDPOINT"
echo "REST Endpoint: $REGEN_REST_ENDPOINT"
echo "----------------------------------------"

exec node server/dist/index.js "$@"