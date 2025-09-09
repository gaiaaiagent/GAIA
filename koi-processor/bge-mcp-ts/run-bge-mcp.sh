#!/bin/bash

# BGE MCP Server Launcher Script
# This script starts the BGE MCP server for semantic search

# Get the directory of this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Navigate to the bge-mcp-ts directory
cd "$DIR"

# Set PostgreSQL connection from environment or use default
POSTGRES_URL="${POSTGRES_URL:-postgresql://postgres:postgres@localhost:5433/eliza}"

# Export for the TypeScript server
export POSTGRES_URL

# Check if node_modules exists, if not install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    bun install
fi

# Run the BGE MCP server
echo "Starting BGE MCP server..."
echo "PostgreSQL URL: $POSTGRES_URL"
exec bun run bge-server.ts