# RegenAI CLAUDE CODE CONFIGURATION

https://github.com/gaiaaiagent/GAIA/tree/regen

Essential configuration for Claude Code when working with the RegenAI/GAIA codebase.

## 🚨 CRITICAL DISCOVERIES & LESSONS LEARNED

### Security: Template-Based Character Configuration (August 29, 2025)

**CRITICAL:** Never commit secrets to Git! Use template system for character files.

**Problem:** Telegram bot tokens were being added directly to character files, risking exposure in Git.

**Solution:** Template-based configuration system:
1. **Templates in Git**: `characters/*.character.json.template` with placeholders
2. **Actual files gitignored**: `characters/*.character.json` with real tokens
3. **Setup script**: `./scripts/setup-characters.sh` configures from templates
4. **Security documentation**: See `SECURITY.md` for complete guidelines

**Key Files:**
- `SECURITY.md` - Complete security guidelines
- `scripts/setup-characters.sh` - Configuration script
- `.gitignore` - Excludes actual character files

**Usage:**
```bash
# Setup characters from templates
./scripts/setup-characters.sh
# Choose option 1 for full setup with Telegram
```

### Database Configuration (August 27, 2025)

**MOST COMMON FAILURE:** PostgreSQL authentication errors

**Problem:** Agents fail with "client password must be a string" or "password authentication failed"

**Solution:** Use correct PostgreSQL connection string in startup script:
```bash
# CORRECT (with password "postgres"):
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# WRONG (empty password causes SASL errors):
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza
```

### Agent Deployment Architecture (August 27, 2025)

**CRITICAL:** Agents run as native bun processes, NOT Docker containers!

- ✅ **PostgreSQL, Nginx, Django:** Run in Docker
- ✅ **Agents (5 instances):** Run as native bun processes on host
- ❌ **Never run agents in Docker** - this breaks the proxy configuration

### CHARACTER.* Environment Variable Timing Issue (August 29, 2025)

**CRITICAL:** ElizaOS initialization order affects CHARACTER.* variable accessibility in plugins!

**Problem:** Plugins calling `runtime.getSetting()` for CHARACTER.* variables fail on PostgreSQL but work on PGLite

**Root Cause:** Database-specific initialization timing differences:
- **PGLite**: Fast file-based → CHARACTER.* processing completes before plugin loading ✅
- **PostgreSQL**: Network + migrations + schema → plugins may load before CHARACTER.* processing ❌

**Solution:** Manual environment injection in startup scripts for PostgreSQL deployments:
```bash
# Required for PostgreSQL (not needed for PGLite)
# NOTE: CHARACTER.* vars with dots cannot be exported in bash, must be passed inline
CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true \
CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01 \
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza \
bun packages/cli/dist/index.js start --character characters/governor.character.json
```

**Key Insights:** 
1. Code working locally (PGLite) may fail in production (PostgreSQL) due to initialization timing
2. CHARACTER.* names must match exact character "name" field (case-sensitive: Governor not GOVERNOR)
3. Bash cannot export variables with dots - must pass inline to command

### Web Server Configuration (August 27, 2025)

**HTTPS/SSL Setup Requirements:**
- SSL certificates must be mounted: `/etc/letsencrypt:/etc/letsencrypt:ro`
- Nginx proxy must point to host IP: `server 172.17.0.1:3000;`
- Basic auth credentials: `regenai:regen2025`
- Ports: HTTP (80) redirects to HTTPS (443)

### Production Telegram Mention-Only Deployment (September 2, 2025)

**SUCCESS:** All 4 agents now deployed with Telegram mention-only functionality in production!

**Achievement:** Successfully deployed mention-only Telegram functionality to production server (202.61.196.119) with:
- **4 Telegram bots active**: @RegenGovernBot, @RegenVoiceOfNatureBot, @RegenNarrativeBot, @RegenAdvocacyBot  
- **Mention-only mode working**: Agents only respond when mentioned or in DMs
- **Custom plugin fork deployed**: Using github.com/gaiaaiagent/plugin-telegram#1.x with mention detection
- **Production startup script**: Modified to use full bun path `/home/darren/.bun/bin/bun`

**Key Production Fixes:**
1. **Bun path issue**: Production server needed full path `/home/darren/.bun/bin/bun` instead of `bun` command
2. **Plugin building**: Custom plugin-telegram required `bun run build` after installation
3. **Character file updates**: Had to manually add `@elizaos/plugin-telegram` to plugins arrays and update tokens
4. **Environment variables**: CHARACTER.* variables properly configured for mention-only mode

**Production Configuration:**
```bash
# Working startup command pattern:
env PORT=3001 \
TELEGRAM_BOT_TOKEN="your-token" \
'CHARACTER.AgentName.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
'CHARACTER.AgentName.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start \
--character characters/agent.character.json
```

**Verification:** All agents confirmed receiving and processing Telegram mentions correctly.

### Knowledge Deduplication & Ollama Embeddings (September 2, 2025)

**CRITICAL:** Multiple agents now share knowledge without duplicating embeddings!

**Problem:** Each agent was creating duplicate embeddings for the same documents (5 agents = 5x storage/processing)

**Solution:** Content-based deduplication with Ollama local embeddings:
1. **SHA-256 content IDs**: Documents identified by content hash, not filename
2. **Shared embeddings**: First agent creates embeddings, others reuse them
3. **Agent-scoped references**: Each agent creates lightweight references to shared knowledge
4. **Ollama embeddings**: Local, free, fast embeddings with nomic-embed-text model

**Configuration:**
```bash
# Environment variables for Ollama embeddings
EMBEDDING_PROVIDER=ollama
EMBEDDING_MODEL=nomic-embed-text:latest
OLLAMA_BASE_URL=http://localhost:11434
TEXT_PROVIDER=openai  # Keep OpenAI for text generation
TEXT_MODEL=gpt-4o-mini
```

**Key fixes:**
- Fixed `createUniqueUuid(runtime, baseUserId)` parameters in fragment references
- Added null checks for text.split operations
- Moved processing reports out of knowledge folder
- Clean corrupted fragments: file paths and error messages in knowledge base

**Performance:**
- First agent: ~10-20 min for 10k documents
- Subsequent agents: ~30 seconds (references only)
- Storage: ~90% reduction for multi-agent setups
- Cost: $0 for embeddings (vs OpenAI API costs)

### Plugin-Knowledge Configuration (Updated Sep 2, 2025)

**CRITICAL:** We use a custom fork of plugin-knowledge with deduplication fixes!

**Correct package.json configuration:**
```json
"dependencies": {
  "@elizaos/plugin-knowledge": "https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes",
  // ... other dependencies
}
```

**Setup Process:**
```bash
# 1. Ensure correct ownership (as server owner)
sudo chown -R darren:gaia-devs /opt/projects/GAIA
sudo chmod -R g+rws /opt/projects/GAIA

# 2. Clean install dependencies
rm -rf node_modules bun.lock bun.lockb
rm -rf ~/.bun/install/cache/*
bun install

# 3. Build the plugin-knowledge from source (REQUIRED!)
cd /opt/projects/GAIA/node_modules/@elizaos/plugin-knowledge
bun run build

# 4. Restart agents
bash /opt/projects/GAIA/start-all-agents.sh
```

**Common Issues:**
- **"Cannot find module './dist/index.js'"**: Plugin needs to be built first
- **Permission denied errors**: Fix ownership with sudo commands above
- **Agents reprocessing all documents**: Ensure using our fork with deduplication

### Telegram Mention-Only Mode Implementation (September 2, 2025)

**SUCCESS:** Implemented working mention-only mode for Telegram bots!

**What We Built:**
- Custom plugin-telegram fork with mention-only support
- Multi-agent configuration system using CHARACTER.* environment variables
- Comprehensive documentation and templates for deployment
- Full backward compatibility with existing setups

**Key Features:**
- **Mention Detection**: @username, name mentions, reply mentions, Telegram entities
- **Configurable Random Response Rate**: Default 1% for organic conversation
- **DM Override**: Always responds in direct messages
- **Multi-Agent Support**: Each agent can have independent settings
- **Environment Integration**: Uses CHARACTER.AgentName.SETTING_NAME pattern

**Working Configuration (Production Deployment):**
```bash
# ✅ PRODUCTION VERIFIED: All 4 agents deployed successfully on 202.61.196.119
# Governor Agent
env PORT=3002 TELEGRAM_BOT_TOKEN=8058793609:AAGZlJkjJtMUrcUmLXgosGYyAvBYyy0Zn8s \
'CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
'CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start --character characters/governor.character.json &

# VoiceOfNature Agent  
env PORT=3003 TELEGRAM_BOT_TOKEN=8258974878:AAFOylFnYxRLQgKJNAR8uCXjFPdRmHVuwC4 \
'CHARACTER.VoiceOfNature.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
'CHARACTER.VoiceOfNature.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start --character characters/voiceofnature.character.json &

# Narrative Agent
env PORT=3004 TELEGRAM_BOT_TOKEN=7413348697:AAGHWcX8yNZkdl2PzYqJIqvlKMkCqeQoqRc \
'CHARACTER.Narrator.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
'CHARACTER.Narrator.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start --character characters/narrative.character.json &

# Advocate Agent
env PORT=3001 TELEGRAM_BOT_TOKEN=8280814835:AAE9oue7ZTGKPzVImeONCAcCJ1WBT5KICdI \
'CHARACTER.Advocate.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true' \
'CHARACTER.Advocate.TELEGRAM_RANDOM_RESPONSE_RATE=0.01' \
/home/darren/.bun/bin/bun packages/cli/dist/index.js start --character characters/advocate.character.json &
```

**Bot Usernames (Verified Active):**
- @RegenGovernBot (Governor)
- @RegenVoiceOfNatureBot (VoiceOfNature) 
- @RegenNarrativeBot (Narrative)
- @RegenAdvocacyBot (Advocate)

**Plugin Fork:** `"@elizaos/plugin-telegram": "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"`

**Templates Available:**
- `characters/test-telegram.character.json.template`
- `characters/test-telegram2.character.json.template`  
- `start-test-agents.sh.template`

**Documentation:** See `docs/TELEGRAM-MENTION-ONLY-SETUP.md` for complete setup guide.

### Legacy: Telegram Multi-Agent Configuration (August 29, 2025)

**SOLVED:** The mention-only mode implementation above provides the complete solution for multi-agent Telegram bots.

### Port Assignment and Nginx Configuration (August 29, 2025)

**PROBLEM:** Agents don't always get requested ports, causing 502 errors

**Root Cause:** ElizaOS assigns alternate ports when requested ports are busy
- Requested: 3000, 3001, 3002, 3003, 3004
- Actual: May get 3000, 3002, 3004, 3005, etc.

**Solution:** 
1. Always check actual port assignments:
```bash
grep "AgentServer is listening" /opt/projects/GAIA/logs/*.log
```

2. Update nginx to proxy to correct port:
```nginx
upstream regen_app {
    server 172.17.0.1:3000;  # Update to actual port
}
```

3. Restart nginx without Docker conflicts:
```bash
docker compose up -d nginx --no-deps
```

### Telegram Bot Token Issues (August 29, 2025)

**PROBLEM:** "401: Unauthorized" errors with Telegram bots

**Common Causes:**
1. Invalid or expired bot tokens
2. Token environment variable not reaching the plugin
3. Custom fork expecting different configuration

**Solutions:**
1. Get fresh tokens from @BotFather on Telegram
2. Add tokens directly to character files (not just environment)
3. Use our custom fork: `@elizaos/plugin-telegram": "github.com/gaiaaiagent/plugin-telegram.git#1.x"`

### Plugin Version Compatibility Crisis (August 29, 2025)

**CRITICAL:** ElizaOS plugin ecosystem has severe version fragmentation!

**Problem:** Official plugins are incompatible with current ElizaOS releases
- Telegram plugin expects: @elizaos/core ^1.0.19 (3 weeks old)
- Current ElizaOS: 1.4.4 (25+ versions newer)
- Result: Official documentation approaches fail completely

**Impact:**
- Plugin documentation doesn't work with newer ElizaOS
- Forces use of undocumented workarounds
- `"secrets": {"key": "${TOKEN}"}` substitution broken
- No version compatibility matrix exists

**Workaround:** Use `"secrets": {}` + CHARACTER.* environment injection
**Root Cause:** Plugin ecosystem management and versioning strategy broken

### How Agents Actually Run

**The RegenAI agents are NOT Docker containers!** They run as native bun processes.

### Quick Status Check
```bash
# Are agents running?
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

# View individual agent logs
tail -f /opt/projects/GAIA/logs/regenai.log
tail -f /opt/projects/GAIA/logs/advocate.log
tail -f /opt/projects/GAIA/logs/voiceofnature.log
tail -f /opt/projects/GAIA/logs/governor.log
tail -f /opt/projects/GAIA/logs/narrative.log

# Check web access
curl -u regenai:regen2025 https://regen.gaiaai.xyz/
```

### Key Paths
- **Agents run from**: `/opt/projects/GAIA` (symlinked to `/opt/projects/GAIA-direct`)
- **Knowledge loaded from**: `/opt/projects/GAIA/knowledge`
- **Characters**: `/opt/projects/GAIA/characters`
- **Logs**: `/opt/projects/GAIA/logs/`
- **Web UI**: https://regen.gaiaai.xyz/ (Username: `regenai`, Password: `regen2025`)
- **Admin Panel**: https://admin.regen.gaiaai.xyz/admin/

## Project Context

### Partnership
- **Joint Development Agreement** between Symbiocene Labs & Regen Network
- **Full contract**: See `/opt/projects/GAIA/docs/CONTRACT-JDA.md`
- **Phase 1 Goal**: 5 agents, 15,000+ docs, 100,000+ interactions in 60 days

### Current Setup
- **5 AI Agents**: RegenAI, Advocate, Voice of Nature, Governor, Narrative
- **Database**: PostgreSQL with pgvector (Docker container on port 5433)
- **Knowledge Base**: 13,000+ documents (Notion pages, Regen Network docs, governance, technical docs)
- **AI Models**: Configured via environment variables (see Model Configuration section below)
- **Plugin-Knowledge**: Custom fork with deduplication and enhanced processing

## 🌍 KOI Knowledge Graph Visualization (January 2025)

### Major Milestone: Backend API Integration Complete ✅

Successfully implemented a comprehensive KOI knowledge graph visualization system with real SPARQL data integration:

**What's Working:**
- **Django REST API**: Complete backend with 5 API endpoints (`/api/koi/*`)
- **Apache Jena Fuseki**: SPARQL triplestore with 50 RDF triples
- **Real Data Flow**: `/api/koi/graph-data/` returns actual knowledge graph data (6 nodes, 5 edges)
- **React Frontend**: Interactive tabbed interface with 4 visualization components
- **Mock Data Fallbacks**: Graceful degradation when APIs unavailable

**Key Files Created:**
- `django_admin/koi_graph/` - Complete Django app with models, services, views
- `packages/client/src/routes/koi/` - React frontend with D3.js/Sigma.js
- `sample-koi-data.ttl` - RDF test data with documents, concepts, processes

**API Endpoints (Working):**
- `GET /api/koi/health/` - Service health check
- `GET /api/koi/graph-data/?max_nodes=100&depth=2` - Graph visualization data
- `POST /api/koi/nl-query/` - Natural language to SPARQL (ready for connection)
- `POST /api/koi/sparql/` - Direct SPARQL execution (ready for connection)
- `GET /api/koi/essence-data/` - Essence alignment visualization

**Architecture:**
```
React Frontend (5173) → Django API (8000) → Apache Jena Fuseki (3030) → PostgreSQL Cache
```

**Next Steps:**
- Connect natural language interface to backend API
- Connect SPARQL editor to execution service
- Implement essence radar with real alignment data

See updated documentation in `docs/KOI-SYSTEM.md` for complete technical details.

---

## 🌿 KOI Node System (Knowledge Organization Infrastructure)

### Overview
The KOI (Knowledge Organization Infrastructure) system provides distributed knowledge management with RID-based agent identification. Each agent gets a canonical Resource Identifier (RID) that maps to other identifiers.

### Architecture
- **KOI Node Server**: Python FastAPI service (port 8001)
- **KOI Query Server**: TypeScript Bun service (port 8100) 
- **KOI Registry**: Database-backed tracking of content sources and agent processing
- **Web Dashboard**: Real-time statistics at https://regen.gaiaai.xyz/koi/

### Agent RID System
Each agent has a canonical RID following the format: `relevant.agent.[slug].v1.0.0`

**Current Agent Mappings:**
```
relevant.agent.regenai.v1.0.0       -> RegenAI
relevant.agent.voiceofnature.v1.0.0 -> VoiceOfNature  
relevant.agent.facilitator.v1.0.0   -> RegenAI Facilitator
relevant.agent.governor.v1.0.0      -> Governor
relevant.agent.narrative.v1.0.0     -> Narrator
```

### Key Services

#### KOI Query Server (Port 8100)  
```bash
# Repository: https://github.com/gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes
# Location: /opt/projects/plugin-knowledge-standalone/
# Start: bun scripts/koi-query-server.ts

# Health check
curl http://localhost:8100/health

# Statistics dashboard
curl http://localhost:8100/stats

# List all agents
curl http://localhost:8100/agents

# Query knowledge base
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is regenerative agriculture?"}'

# Public Access: https://regen.gaiaai.xyz/koi/
```

### Source Metadata System
The knowledge plugin now preserves source information from file paths:

**Source Detection Logic:**
- `/knowledge/notion/` → `notion`
- `/knowledge/twitter/` → `twitter` 
- `/knowledge/medium/` → `medium`
- `/knowledge/discord/` → `discord`
- Default → `documents`

### Key Operations

#### Check KOI System Status
```bash
# Check if service is running
ps aux | grep -E "bun.*koi-query" | grep -v grep

# View query server logs (if capturing)
tail -f /opt/projects/plugin-knowledge-standalone/koi-server.log
```

#### Restart KOI Services
```bash
# Restart query server  
pkill -f "bun.*koi-query"
cd /opt/projects/plugin-knowledge-standalone
bun scripts/koi-query-server.ts &
```

### Web Interface
Access the KOI dashboard at: https://regen.gaiaai.xyz/koi/

Features:
- Real-time agent processing statistics
- Content source breakdown
- Interactive knowledge query interface
- Agent status monitoring with proper name mapping

## Knowledge Configuration

### Agent Knowledge Settings
Each agent character file should have these settings for proper knowledge access:
```json
"plugins": [
  "@elizaos/plugin-bootstrap",
  "@elizaos/plugin-sql",
  "@elizaos/plugin-openai",
  "@elizaos/plugin-knowledge",  // Required for knowledge access
  "@elizaos/plugin-telegram",   // Required for Telegram functionality
  "@elizaos/plugin-http-api"
],
"settings": {
  "clients": ["telegram"],              // Enable Telegram client
  "allowDirectMessages": true,          // Allow DMs
  "LOAD_DOCS_ON_STARTUP": true,         // Set to true for immediate knowledge access
  "KNOWLEDGE_PATH": "./knowledge",      // Points to /opt/projects/GAIA/knowledge
  "TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED": true,  // Only respond when mentioned (optional)
  "TELEGRAM_RANDOM_RESPONSE_RATE": "0.01"        // 1% random response rate (optional)
}
```

### Telegram Mention-Only Mode

**NEW FEATURE:** Agents can now be configured to only respond in Telegram groups when mentioned, reducing spam while maintaining engagement.

**Environment Configuration:**

Use the ElizaOS character-specific environment pattern in your `.env` file:

```bash
# Enable mention-only mode for Governor agent
CHARACTER.GOVERNOR.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.GOVERNOR.TELEGRAM_RANDOM_RESPONSE_RATE=0.01

# Enable for other agents using their character name
CHARACTER.REGENAI.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.ADVOCATE.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
```

**Configuration Options:**

1. **`CHARACTER.{AGENT}.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED`** (boolean, default: false)
   - When `true`: Only responds when directly mentioned, in DMs, or random responses
   - When `false`: Uses normal LLM-based shouldRespond logic
   - Detection methods:
     - Direct mention: `@RegenGovernBot`, `@botname`
     - Name mention: `Governor what's the status?`
     - DMs: Always responds in direct messages
     - Random: Occasional responses based on rate

2. **`CHARACTER.{AGENT}.TELEGRAM_RANDOM_RESPONSE_RATE`** (float, default: 0.01)
   - Probability (0.0-1.0) of responding to non-mentions
   - `0.01` = 1% chance (1 in 100 messages)
   - `0.05` = 5% chance (1 in 20 messages)  
   - `0.0` = No random responses
   - Keeps conversations organic and prevents complete silence

**Benefits:**
- **Faster**: Programmatic detection vs LLM analysis
- **Cheaper**: Fewer LLM calls for shouldRespond decisions  
- **More Reliable**: Consistent mention detection
- **Environment-Based**: Consistent with other ElizaOS configuration patterns

**Note:** With 32GB RAM, all agents can have `LOAD_DOCS_ON_STARTUP: true` for best performance.

## Model Configuration

### How Models Are Configured
The AI models used by agents are configured through a hierarchy of settings:

1. **Environment Variables (Highest Priority)**
   - `TEXT_MODEL` - Sets the primary chat model for all agents
   - `TEXT_EMBEDDING_MODEL` - Sets the embedding model
   - `OPENAI_SMALL_MODEL` / `SMALL_MODEL` - Small text generation model
   - `OPENAI_LARGE_MODEL` / `LARGE_MODEL` - Large text generation model
   - `OPENAI_EMBEDDING_MODEL` - OpenAI-specific embedding model
   - `OPENAI_EMBEDDING_DIMENSIONS` - Embedding vector dimensions (default: 1536)

2. **Character File Settings**
   - `modelProvider` - Specifies the AI provider (e.g., "openai", "anthropic")
   - Model-specific settings in character JSON files

3. **Plugin Defaults (Lowest Priority)**
   - OpenAI plugin defaults are used if no environment variables are set
   - Located in `@elizaos/plugin-openai` configuration

### Setting Models in .env File
```bash
# Primary models (override all defaults)
TEXT_MODEL=gpt-4o-mini
TEXT_EMBEDDING_MODEL=text-embedding-3-small

# Provider-specific models
OPENAI_SMALL_MODEL=gpt-4o-mini
OPENAI_LARGE_MODEL=gpt-4o
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536

# Model provider (if not set in character files)
MODEL_PROVIDER=openai
```

### Model Selection Priority
1. Environment variables in `.env` file
2. Startup script overrides (e.g., in `start-all-agents.sh`)
3. Character file `modelProvider` and model settings
4. Plugin default values

### Checking Active Models
```bash
# View configured environment variables
grep -E "MODEL|GPT|EMBEDDING" /opt/projects/GAIA/.env

# Check runtime logs for model usage
grep "Using model" /opt/projects/GAIA/logs/regenai.log | tail -10
```

## Development Environment

### Working Directory
- **Main**: `/opt/projects/GAIA` (Docker configs, characters, knowledge)
- **Runtime**: `/opt/projects/GAIA` (symlinked from GAIA-direct)
- **Indexing**: `/home/regenai/project/indexing` (Notion crawler)

### Technology Stack
- **Framework**: ElizaOS 1.4.4
- **Runtime**: Bun (NOT npm/pnpm)
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector extension
- **Container**: Docker for postgres/nginx/django only
- **AI Provider**: Configured via environment variables (typically OpenAI)

## Key Commands

### Agent Operations
```bash
# Start all agents (official method)
bash /opt/projects/GAIA/start-all-agents-with-telegram.sh

# Check status
ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep

# Stop all agents
sudo pkill -f 'packages/cli/dist/index.js start'

# View logs
tail -100 /opt/projects/GAIA/logs/*.log

# Full documentation
# See: docs/AGENT-STARTUP-GUIDE.md
```

### Database Operations
```bash
# Backup
docker exec gaia-postgres-1 pg_dumpall -U postgres > backup.sql

# Connect
docker exec -it gaia-postgres-1 psql -U postgres -d eliza

# Check size
docker exec gaia-postgres-1 psql -U postgres -c "SELECT pg_database_size('eliza') / 1024 / 1024 AS size_mb;"
```

---

## CRITICAL RULES (From upstream ElizaOS)

### Package Management

- **NEVER USE `npm` OR `pnpm`**
- **ALWAYS USE `bun` FOR ALL PACKAGE MANAGEMENT AND SCRIPT EXECUTION**
- **IF A COMMAND DOESN'T WORK:** Check `package.json` in the relevant package directory for correct script names
- Use `bun` for global installs: `bun install -g @elizaos/cli`

### Workspace Dependencies

- **ALWAYS USE `workspace:*` FOR ALL `@elizaos/` PACKAGE DEPENDENCIES**
- **NEVER USE HARDCODED VERSIONS** for internal monorepo packages
- **Example of CORRECT usage:**
  ```json
  {
    "dependencies": {
      "@elizaos/core": "workspace:*",
      "@elizaos/plugin-sql": "workspace:*",
      "@elizaos/server": "workspace:*"
    }
  }
  ```
- **Example of INCORRECT usage:**
  ```json
  {
    "dependencies": {
      "@elizaos/core": "1.4.2", // ❌ Don't use hardcoded versions
      "@elizaos/plugin-sql": "^1.4.0", // ❌ Don't use version ranges
      "@elizaos/server": "latest" // ❌ Don't use version tags
    }
  }
  ```
- **RATIONALE:** Workspace references ensure proper monorepo dependency resolution and prevent version conflicts

### Process Execution

- **NEVER USE `execa` OR OTHER PROCESS EXECUTION LIBRARIES**
- **NEVER USE NODE.JS APIS LIKE `execSync`, `spawnSync`, `exec`, `spawn` FROM `child_process`**
- **ALWAYS USE `Bun.spawn()` FOR SPAWNING PROCESSES**
- **USE THE EXISTING `bun-exec` UTILITY:** Located at `packages/cli/src/utils/bun-exec.ts` which provides:
  - `bunExec()` - Main execution function with full control
  - `bunExecSimple()` - For simple command execution
  - `bunExecInherit()` - For interactive commands
  - `commandExists()` - To check if commands exist
- **Example usage:**

  ```typescript
  import { bunExec, bunExecSimple } from '@/utils/bun-exec';

  // Simple command
  const output = await bunExecSimple('git status');

  // Full control
  const result = await bunExec('bun', ['test'], { cwd: '/path/to/dir' });
  ```

  **IMPORTANT:** Even in test files, avoid using Node.js `execSync` or other child_process APIs. Use the bun-exec utilities or Bun.spawn directly.

### Event Handling

- **NEVER USE `EventEmitter` FROM NODE.JS**
- **EventEmitter has compatibility issues with Bun and should be avoided**
- **ALWAYS USE BUN'S NATIVE `EventTarget` API INSTEAD**
- **When migrating from EventEmitter:**
  - Extend `EventTarget` instead of `EventEmitter`
  - Use `dispatchEvent(new CustomEvent(name, { detail: data }))` instead of `emit(name, data)`
  - Wrap handlers to extract data from `CustomEvent.detail`
  - Maintain backward-compatible API when possible
- **Example migration:**

  ```typescript
  // ❌ WRONG - Don't use EventEmitter
  import { EventEmitter } from 'events';
  class MyClass extends EventEmitter {
    doSomething() {
      this.emit('event', { data: 'value' });
    }
  }

  // ✅ CORRECT - Use EventTarget
  class MyClass extends EventTarget {
    private handlers = new Map<string, Map<Function, EventListener>>();

    emit(event: string, data: any) {
      this.dispatchEvent(new CustomEvent(event, { detail: data }));
    }

    on(event: string, handler: (data: any) => void) {
      const wrappedHandler = ((e: CustomEvent) => handler(e.detail)) as EventListener;
      if (!this.handlers.has(event)) {
        this.handlers.set(event, new Map());
      }
      this.handlers.get(event)!.set(handler, wrappedHandler);
      this.addEventListener(event, wrappedHandler);
    }
  }
  ```

### Git & GitHub

- **ALWAYS USE `gh` CLI FOR GIT AND GITHUB OPERATIONS**
- Use `gh` commands for creating PRs, issues, releases, etc.
- **WHEN USER PROVIDES GITHUB WORKFLOW RUN LINK:** Use `gh run view <run-id>` and `gh run view <run-id> --log` to get workflow details and failure logs
- **NEVER ADD CO-AUTHOR CREDITS:** Do not include "Co-Authored-By: Claude" or similar co-authoring credits in commit messages or PR descriptions

### Development Branch Strategy

- **Base Branch:** `develop` (NOT `main`)
- **Create PRs against `develop` branch**
- **Main branch is used for releases only**

### ElizaOS CLI Usage

- **The `elizaos` CLI** is built from `packages/cli`
- **INTENDED FOR:** Production use by developers/users of the project
- **DO NOT USE THE `elizaos` CLI WITHIN THE `eliza` MONOREPO ITSELF**
- **The `elizaos` CLI is for external consumers, NOT internal monorepo development**
- **For monorepo development:** Use `bun` commands directly

### ElizaOS Test Command

The `elizaos test` command runs tests for ElizaOS projects and plugins:

```bash
# Run tests in current project
elizaos test

# Run specific test files
elizaos test src/**/*.test.ts

# Run with coverage
elizaos test --coverage
```

---

### Knowledge Updates
```bash
# Add new content to:
/opt/projects/GAIA/knowledge/

# Then restart agents:
bash /opt/projects/GAIA/scripts/start-all-agents.sh
```

## COMPLETE OPERATIONS GUIDE

### 🚀 QUICKSTART - RECOMMENDED APPROACH

**For full functionality (Web UI + Telegram):**
```bash
# 1. Stop any running agents
sudo pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true

# 2. Start all agents in single process
bash /opt/projects/GAIA/start-all-agents-single-process.sh

# 3. Access web UI
# https://regen.gaiaai.xyz/ (Username: regenai, Password: regen2025)
```

### Agent Startup Options

#### Option 1: Single Process Mode (RECOMMENDED)
**Use when:** You need web UI access to all agents
```bash
bash /opt/projects/GAIA/start-all-agents-single-process.sh
```
- ✅ All 5 agents available in web UI
- ✅ Each has its own Telegram bot
- ✅ Unified logging and management
- ⚠️ Restart affects all agents

#### Option 2: Multi-Process Mode
**Use when:** You need independent agent control
```bash
bash /opt/projects/GAIA/start-all-agents-telegram.sh
```
- ✅ Independent agent restarts
- ✅ Separate logs per agent
- ❌ Web UI only shows RegenAI
- ⚠️ More complex management

#### Option 3: No Telegram Mode
**Use when:** Testing or Telegram issues
```bash
bash /opt/projects/GAIA/start-all-agents-no-telegram.sh
```
- ✅ Simpler configuration
- ✅ No bot token issues
- ❌ No Telegram functionality

### Stopping Agents

```bash
# Option 1: Quick stop (works for any user with sudo)
sudo pkill -f 'packages/cli/dist/index.js'

# Option 2: Check who started them first
ps aux | grep -E "bun.*packages/cli" | grep -v grep

# Option 3: Stop specific agent
pkill -f 'governor.character.json'
```

### Restarting Agents

```bash
# Full restart (recommended)
sudo pkill -f 'packages/cli/dist/index.js' 2>/dev/null || true
sleep 2
bash /opt/projects/GAIA/start-all-agents-single-process.sh

# Quick restart keeping knowledge in memory
kill -HUP $(pgrep -f 'packages/cli/dist/index.js')
```

### Agent Management (CRITICAL PROCEDURES)

#### Prerequisites Check
```bash
# 1. PostgreSQL must be running in Docker
docker ps | grep postgres
# Should show: gaia-postgres-1 running on port 5433

# 2. Check database connectivity
docker exec gaia-postgres-1 psql -U postgres -d eliza -c '\l'

# 3. Verify character files exist
ls -la /opt/projects/GAIA/characters/*.character.json
```

#### Starting All Agents (CORRECT PROCEDURE)

**CRITICAL: Agents run as native bun processes, NOT Docker containers!**

```bash
# 1. Stop any existing agents first
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true

# 2. Start all 5 agents using the startup script
bash /opt/projects/GAIA/scripts/start-all-agents.sh

# 3. Verify all agents started
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep
```

**Expected:** 5 processes for regenai, facilitator, voiceofnature, governor, narrative

#### Database Configuration (MOST COMMON ERROR)

**CORRECT PostgreSQL URL (in startup script):**
```bash
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza
```

**WRONG configurations that cause failures:**
```bash
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza  # Empty password
PGLITE_DATA_DIR=/some/path  # Wrong database type
```

#### Web Server Management

**Nginx Configuration:**
```bash
# Check nginx status
docker ps | grep nginx

# Restart nginx if needed
docker compose stop nginx && docker compose up -d nginx --no-deps

# Test HTTPS access with basic auth
curl -u regenai:regen2025 https://regen.gaiaai.xyz/

# Rebuild nginx if configuration changed
docker compose build nginx --no-cache
```

**Web Access URLs:**
- **Main Dashboard:** https://regen.gaiaai.xyz/ (Username: `regenai`, Password: `regen2025`)
- **Admin Panel:** https://admin.regen.gaiaai.xyz/admin/

#### Troubleshooting Guide

**1. "Client password must be a string" Error**
```bash
# Fix: Update startup script with correct PostgreSQL password
grep POSTGRES_URL /opt/projects/GAIA/scripts/start-all-agents.sh
# Should show: postgresql://postgres:postgres@localhost:5433/eliza
```

**2. Agents Not Appearing on Dashboard**
```bash
# Check individual agent logs
tail -f /opt/projects/GAIA-direct/logs/regenai.log
tail -f /opt/projects/GAIA-direct/logs/facilitator.log
# Look for "Database connection verified" message
```

**3. HTTPS Not Working**
```bash
# Check SSL certificates are mounted
docker exec nginx ls -la /etc/letsencrypt/live/regen.gaiaai.xyz/

# Check nginx configuration
docker exec nginx nginx -t

# View nginx error logs
docker logs nginx --tail 20
```

**4. Nginx Proxy Issues**
```bash
# Verify nginx is pointing to host agents
docker exec nginx grep -A 3 "upstream regen_app" /etc/nginx/nginx.conf
# Should show: server 172.17.0.1:3000;

# Check agents are listening on correct ports
netstat -tlnp | grep -E ":(3000|3001|3002|3003|3004)"
```

#### Complete Restart Procedure

**Use this when troubleshooting or making changes:**
```bash
# 1. Stop everything
pkill -f 'packages/cli/dist/index.js start' 2>/dev/null || true
docker compose stop nginx

# 2. Verify PostgreSQL still running
docker ps | grep postgres

# 3. Start agents
bash /opt/projects/GAIA/scripts/start-all-agents.sh

# 4. Start nginx
docker compose up -d nginx --no-deps

# 5. Test access
curl -u regenai:regen2025 https://regen.gaiaai.xyz/
```

#### Key File Locations

**Startup Configuration:**
- `/opt/projects/GAIA/scripts/start-all-agents.sh` - Agent startup script with database config
- `/opt/projects/GAIA-direct/.env` - Environment variables

**Nginx Configuration:**
- `/opt/projects/GAIA/config/nginx-ssl.conf` - HTTPS config (production) 
- `/opt/projects/GAIA/nginx.Dockerfile` - Builds nginx with basic auth
- `/opt/projects/GAIA/docker-compose.yaml` - Services configuration

**Character Files:**
- `/opt/projects/GAIA/characters/` - Agent character definitions

**Log Files:**
- `/opt/projects/GAIA-direct/logs/[agent-name].log` - Individual agent logs

## Character Development

Each agent has a unique character file in `/opt/projects/GAIA/characters/`:
- `regenai.character.json` - Development orchestrator
- `facilitator.character.json` - Community facilitator
- `voiceofnature.character.json` - Philosophical voice
- `governor.character.json` - Governance expert
- `narrative.character.json` - Storyteller

## Documentation Structure

### Essential Docs
- **This file** - Critical config and commands
- `/opt/projects/GAIA/docs/TELEGRAM-BOT-SETUP.md` - **User guide for Regen team to interact with Telegram bots**
- `/opt/projects/GAIA/docs/TELEGRAM-TECHNICAL-REFERENCE.md` - Technical setup and troubleshooting for developers
- `/opt/projects/GAIA/docs/AGENT-OPERATIONS.md` - Detailed operations guide
- `/opt/projects/GAIA/docs/CONTRACT-JDA.md` - Full partnership agreement
- `/opt/projects/GAIA/docs/NOTION-INTEGRATION.md` - Notion knowledge integration

### Development Docs
- `/opt/projects/GAIA/.cursorrules` - ElizaOS development rules
- `/opt/projects/GAIA/README.md` - Project overview
- `/opt/projects/GAIA/AGENT.md` - Agent architecture (45k+ tokens)

## Working Principles

### For Claude Code Sessions
1. **Always check agent status first** using ps aux command
2. **Restart agents after knowledge updates** - they don't auto-reload
3. **Use bun, never npm/pnpm** for any operations
4. **Agents run natively**, not in Docker
5. **Knowledge path is recursive** - everything under `/opt/projects/GAIA/knowledge` is ingested

### Development Philosophy
- **Living Systems Thinking**: Code and ecology interconnected
- **Test Everything**: Models hallucinate, verify thoroughly
- **Document Changes**: Update relevant docs when changing operations
- **Collaborative Intelligence**: Work with existing patterns

## Quick Troubleshooting

### Django Admin Issues?
See [Django Admin Troubleshooting Guide](docs/DJANGO-ADMIN-TROUBLESHOOTING.md) for:
- Template variable rendering issues
- Docker build cache problems  
- Worker timeout errors
- URL routing confusion

**Quick Fix for Template Issues:**
```bash
# The /regenai/ URL is served by reporting app, not eliza_tables!
# Edit: django_admin/reporting/templates/reporting/dashboard.html
# Then rebuild: docker-compose build --no-cache django
```

### Agents not responding?
1. Check if running: `ps aux | grep bun.*packages/cli`
2. Check nginx: `docker ps | grep nginx`
3. View logs: `tail -50 /opt/projects/GAIA/logs/*.log`
4. Restart: `bash /opt/projects/GAIA/start-all-agents-with-telegram.sh`
5. **See full guide**: [AGENT-STARTUP-GUIDE.md](docs/AGENT-STARTUP-GUIDE.md)

### Knowledge not updating?
- Agents must be restarted to load new knowledge
- Verify files are in `/opt/projects/GAIA/knowledge/`
- Check `KNOWLEDGE_PATH` in running process

### Database issues?
- Check Docker: `docker ps | grep postgres`
- Verify connection: `docker exec gaia-postgres-1 psql -U postgres -c '\l'`
- Check logs: `docker logs gaia-postgres-1 | tail -50`

### Plugin not updating?
- **Build plugin**: `cd /opt/projects/GAIA-direct/packages/plugin-knowledge && bun run build`
- **CRITICAL**: Copy to external dir: `cp -f dist/index.js /opt/projects/plugin-knowledge/dist/index.js`
- **Restart agents**: `pkill -f 'packages/cli/dist' && bash start-agents-hybrid.sh`
- **Test isolated**: `bun packages/cli/dist/index.js start --character /tmp/test-character.json`

### KOI System issues?
- **Check service**: `ps aux | grep -E "bun.*koi-query" | grep -v grep`
- **Query server not responding**: Check port 8100, restart with `cd /opt/projects/plugin-knowledge-standalone && bun scripts/koi-query-server.ts`
- **Agent statistics wrong**: Check agent mappings at `curl http://localhost:8100/agents`
- **Source counts incorrect**: Verify knowledge plugin source detection is working and agents have been restarted
- **Dashboard not loading**: Check nginx proxy configuration at https://regen.gaiaai.xyz/koi/ and that service is running

### Phantom agent entries?
If you see agents with unrealistic statistics (e.g., 13K+ pending):
1. These are filtered out automatically by the phantom entry detection system
2. Check agent UUID mappings with: `curl http://localhost:8001/regen/agents`  
3. Verify database has correct agent names: `docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, name FROM agents;"`

---

*For complete ElizaOS development guidelines, see `.cursorrules`*
*For detailed operations, see `docs/AGENT-OPERATIONS.md`*
*For plugin development, see `docs/PLUGIN-DEVELOPMENT.md`*
*For contract details, see `docs/CONTRACT-JDA.md`*
## 🌍 KOI Knowledge Graph Visualization (September 2025)

### Complete Setup Successfully Deployed!

The KOI knowledge graph visualization is now fully integrated with ElizaOS at https://regen.gaiaai.xyz/

**Key Components:**
- **Apache Jena Fuseki** - SPARQL triplestore with 3,900+ triples (port 3030)
- **KOI API Server** - Flask API connecting frontend to Fuseki (port 8001)
- **React Frontend** - Interactive graph visualization with D3.js
- **Nginx Proxy** - HTTPS access with `/api/koi/` endpoint

**Access Points:**
- Graph button in sidebar footer (Network icon)
- Direct URLs: `/koi` or `/KOI` (case-insensitive)
- API: `https://regen.gaiaai.xyz/api/koi/health/`

**Critical Setup Notes:**
1. **Client Build Location**: ElizaOS serves from `packages/server/dist/client/`, NOT `packages/client/dist/`
   - Always copy after building: `cp -r packages/client/dist/* packages/server/dist/client/`
2. **Fuseki Persistence**: Use Docker volume and `tdb2` type (not `mem`)
3. **Full Bun Path**: Use `/home/darren/.bun/bin/bun` on production server
4. **API Endpoints**: Use relative paths (`/api/koi/`) in production

**Quick Start:**
```bash
# Start Fuseki
docker run -d --name fuseki-koi -p 3030:3030 -v fuseki-data:/fuseki stain/jena-fuseki

# Start KOI API
screen -dmS koi-api bash -c 'cd koi-data && python3 koi_api_server.py'

# Build and deploy client
cd packages/client && bun vite build
cp -r dist/* ../server/dist/client/

# Start agents
/home/darren/.bun/bin/bun packages/cli/dist/index.js start --character characters/*.character.json
```

See `docs/KOI-SETUP-GUIDE.md` for complete installation and troubleshooting guide.


## 🔐 Security Configuration (September 2025)

### Environment Variables
All sensitive configuration (API keys, bot tokens, passwords) should be stored in `.env` file, NOT in scripts.

**Setup:**
1. Copy `.env.example` to `.env`
2. Fill in your actual values
3. Never commit `.env` to git

**Scripts automatically load from .env:**
- `start-all-agents-single-process.sh`
- `start-all-agents-with-telegram.sh`
- `start-all-agents-no-telegram.sh`

All startup scripts now use `source .env` to load environment variables securely.

### Required Environment Variables:
- Telegram bot tokens for each agent
- OpenAI/Anthropic API keys
- Database credentials
- JWT/Session secrets

See `.env.example` for complete list.
