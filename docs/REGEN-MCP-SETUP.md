# Regen MCP Integration Setup Documentation

## Current Architecture

### 1. MCP (Model Context Protocol) Overview
MCP is a standardized protocol that allows LLMs to access external tools and data sources. For the Advocate agent, we're using MCP to connect to the Regen Network blockchain.

### 2. Components

#### A. Regen MCP Server
- **Location**: `mcp-servers/mcp-regen/`
- **Source**: Cloned from https://github.com/regen-network/mcp
- **Purpose**: Provides 43+ tools for querying Regen Network blockchain data
- **Tools Include**:
  - Ecocredit module (credit classes, batches, projects)
  - Marketplace module (sell orders, denominations)
  - Basket module (basket management)
  - Cosmos modules (bank, staking, governance)

#### B. Character Configuration
- **File**: `characters/advocate.character.json`
- **MCP Configuration**:
```json
"mcp": {
  "servers": {
    "regen": {
      "type": "stdio",
      "command": "./start-regen-mcp.sh",
      "args": [],
      "env": {
        "REGEN_RPC_ENDPOINT": "https://regen-rpc.polkachu.com",
        "REGEN_REST_ENDPOINT": "https://regen-rest.publicnode.com"
      }
    }
  }
}
```

#### C. Startup Scripts
- **Primary**: `start-regen-mcp.sh`
  - Auto-installs dependencies if missing
  - Auto-builds TypeScript if not built
  - Starts the official MCP server
  - Located at project root AND `packages/cli/`


### 3. Current Issues

#### Problem: MCP Connection Failures
The agent starts successfully but MCP servers fail to connect with "Connection closed" errors.

**Root Cause**: The scripts use relative paths (`./start-regen-mcp.sh`) but the agent runs from `packages/cli/` directory.

**Evidence from logs**:
```
ERROR: Failed to connect to new MCP server regen
error: "MCP error -32000: Connection closed"
```

### 4. Solution for Version Control & Deployment

#### A. Fix Path Issues
Update `characters/advocate.character.json` to use absolute paths relative to project root:

```json
"mcp": {
  "servers": {
    "regen": {
      "type": "stdio",
      "command": "bash",
      "args": ["../../start-regen-mcp.sh"],
      "env": {
        "REGEN_RPC_ENDPOINT": "https://regen-rpc.polkachu.com",
        "REGEN_REST_ENDPOINT": "https://regen-rest.publicnode.com"
      }
    }
  }
}
```

#### B. Version Control Structure
```
RegenAI/
├── characters/
│   └── advocate.character.json    # Character config with MCP settings
├── mcp-servers/
│   └── mcp-regen/                  # Git submodule or vendored
│       ├── package.json
│       └── server/
├── start-regen-mcp.sh             # Startup script (checked in)
└── .env                           # Environment variables (not checked in)
```

#### C. Environment Variables
For production deployment, use environment variables:
```bash
# .env.example
REGEN_RPC_ENDPOINT=https://regen-rpc.polkachu.com
REGEN_REST_ENDPOINT=https://regen-rest.publicnode.com
```

#### D. Docker Deployment
For server deployment, create a Dockerfile:
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN cd mcp-servers/mcp-regen && npm install && npm run build
RUN bun install
CMD ["bun", "run", "start", "--", "--character", "./characters/advocate.character.json"]
```

### 5. Testing MCP Connection

To verify MCP is working:
1. Check if scripts are executable: `chmod +x start-regen-mcp*.sh`
2. Test script directly: `./start-regen-mcp.sh` (should output MCP protocol messages)
3. Check agent logs for successful connection
4. Test in chat: Ask about specific Regen Network data

### 6. Required Files for Version Control

**Must Include**:
- `characters/advocate.character.json`
- `start-regen-mcp.sh`
- `mcp-servers/mcp-regen/` (as submodule or vendored)

**Should Include**:
- `.env.example` (with sample values)
- This documentation file

**Should NOT Include**:
- `.env` (contains secrets)
- `node_modules/`
- `dist/` or built files

### 7. Deployment Steps

1. Clone repository
2. Install dependencies: `bun install`
3. Setup MCP server:
   ```bash
   cd mcp-servers/mcp-regen
   npm install
   npm run build
   cd ../..
   ```
4. Configure environment variables
5. Start agent: `bun run start -- --character ./characters/advocate.character.json`

### 8. Troubleshooting

**MCP Connection Fails**:
- Ensure scripts are executable
- Check script paths are correct relative to where agent runs
- Verify MCP server builds successfully
- Check environment variables are set

**Agent Can't Find Scripts**:
- Copy scripts to `packages/cli/` directory
- Or update paths in character config to use absolute paths

**TypeScript Build Errors**:
- Ensure Node.js version 20+
- Clear node_modules and reinstall