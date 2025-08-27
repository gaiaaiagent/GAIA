# RegenAI CLAUDE CODE CONFIGURATION

https://github.com/gaiaaiagent/GAIA/tree/regen

Essential configuration for Claude Code when working with the RegenAI/GAIA codebase.

## 🚨 CRITICAL DISCOVERIES

### Plugin Loading Issue (Found Aug 2024)

**Plugins are loaded from EXTERNAL directory**, not the monorepo:
- **Actual Runtime Location**: `/opt/projects/plugin-knowledge/`
- **Development Location**: `/opt/projects/GAIA-direct/packages/plugin-knowledge/`

**You MUST copy built plugins to external directory for changes to take effect!**

```bash
# After building plugin in monorepo
cp -f /opt/projects/GAIA-direct/packages/plugin-knowledge/dist/index.js \
      /opt/projects/plugin-knowledge/dist/index.js
```

### How Agents Actually Run

**The RegenAI agents are NOT Docker containers!** They run as native bun processes.

### Quick Status Check
```bash
# Are agents running?
ps aux | grep -E "bun.*packages/cli/dist/index.js start" | grep -v grep

# View logs
tail -f /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Restart agents (to load new knowledge)
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

### Key Paths
- **Agents run from**: `/opt/projects/GAIA-direct`
- **Knowledge loaded from**: `/opt/projects/GAIA/knowledge`
- **Characters**: `/opt/projects/GAIA/characters`
- **Web UI**: https://regen.gaiaai.xyz/

## Project Context

### Partnership
- **Joint Development Agreement** between Symbiocene Labs & Regen Network
- **Full contract**: See `/opt/projects/GAIA/docs/CONTRACT-JDA.md`
- **Phase 1 Goal**: 5 agents, 15,000+ docs, 100,000+ interactions in 60 days

### Current Setup
- **5 AI Agents**: RegenAI, Facilitator, Voice of Nature, Governor, Narrative
- **Database**: PostgreSQL with pgvector (Docker container on port 5433)
- **Knowledge Base**: 606 Notion pages + Regen Network docs
- **Model**: Gemini 1.5 Flash (chat) + OpenAI embeddings
- **KOI System**: Knowledge Organization Infrastructure with RID-based agent tracking

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

#### KOI Node Server (Port 8001)
```bash
# Location: /home/regenai/project/koi-infrastructure/koi-regen-node/
# Start: source venv/bin/activate && python -m node

# Health check
curl http://localhost:8001/regen/health

# List all agents with RIDs
curl http://localhost:8001/regen/agents

# Get specific agent info
curl http://localhost:8001/regen/agents/relevant.agent.regenai.v1.0.0
```

#### KOI Query Server (Port 8100)  
```bash
# Location: /opt/projects/plugin-knowledge-gaia/
# Start: bun scripts/koi-query-server.ts

# Statistics dashboard
curl http://localhost:8100/stats

# Query knowledge base
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is regenerative agriculture?"}'
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
# Check both services are running
ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep

# View KOI node logs  
tail -f /home/regenai/project/koi-infrastructure/koi-regen-node/koi-node.log

# View query server logs
tail -f /opt/projects/plugin-knowledge-gaia/koi-server-fixed.log
```

#### Restart KOI Services
```bash
# Restart KOI node
cd /home/regenai/project/koi-infrastructure/koi-regen-node
pkill -f "python.*node" 
source venv/bin/activate && python -m node &

# Restart query server  
cd /opt/projects/plugin-knowledge-gaia
pkill -f "bun.*koi-query"
bun scripts/koi-query-server.ts &
```

### Web Interface
Access the KOI dashboard at: https://regen.gaiaai.xyz/koi/

Features:
- Real-time agent processing statistics
- Content source breakdown
- Interactive knowledge query interface
- Agent status monitoring with proper name mapping

## Development Environment

### Working Directory
- **Main**: `/opt/projects/GAIA` (Docker configs, characters, knowledge)
- **Runtime**: `/opt/projects/GAIA-direct` (where agents actually run)
- **Indexing**: `/home/regenai/project/indexing` (Notion crawler)

### Technology Stack
- **Framework**: ElizaOS 1.2.0
- **Runtime**: Bun (NOT npm/pnpm)
- **Language**: TypeScript
- **Database**: PostgreSQL with pgvector extension
- **Container**: Docker for postgres/nginx/django only

## Key Commands

### Agent Operations
```bash
# Check status
ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep

# Restart to load new knowledge
pkill -f 'packages/cli/dist/index.js start'
bash /opt/projects/GAIA/start-agents-hybrid.sh

# View logs
tail -100 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log
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
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

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
3. View logs: `tail -50 /opt/projects/GAIA-direct/logs/all-agents-hybrid.log`
4. Restart: `bash /opt/projects/GAIA/start-agents-hybrid.sh`

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
- **Check services**: `ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep`
- **KOI node not responding**: Check port 8001, restart with `cd /home/regenai/project/koi-infrastructure/koi-regen-node && source venv/bin/activate && python -m node`
- **Query server not responding**: Check port 8100, restart with `cd /opt/projects/plugin-knowledge-gaia && bun scripts/koi-query-server.ts`
- **Agent statistics wrong**: Check agent RID mappings at `curl http://localhost:8001/regen/agents`
- **Source counts incorrect**: Verify knowledge plugin source detection is working and agents have been restarted
- **Dashboard not loading**: Check nginx proxy configuration and that both services are running

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