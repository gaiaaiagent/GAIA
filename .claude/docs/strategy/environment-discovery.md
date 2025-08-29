---
rid: koi:strategy:environment-discovery
created: 2025-08-27
last-modified: 2025-08-27
confidence: low
verification-status: discovery-in-progress
source-type: environment-analysis
themes:
  - production-vs-development
  - docker-confusion
  - deployment-reality
  - environment-management
related:
  - koi:docs:agent-operations
  - koi:docs:claude-md
  - koi:planning:infrastructure
accuracy-concerns:
  - Docker usage unclear after Darren's changes
  - Production server access assumptions incorrect
  - Development environment setup undocumented
  - Plugin loading paths inconsistent
---

# Environment Discovery & Reality Assessment

_Date: August 27, 2025_
_Purpose: Establish ground truth about our development and production environments_

## Current State of Confusion

### What We Thought We Knew
Based on documentation in CLAUDE.md and various operational guides:

1. **Production Server**: regen.gaiaai.xyz
   - Agents run as native bun processes
   - PostgreSQL in Docker container (port 5433)
   - Nginx proxy in Docker
   - KOI services on ports 8001 and 8100

2. **Development Environment**: Local machines
   - Should mirror production setup
   - Docker compose for services
   - Local agent testing

### What Just Broke
- Attempted to access KOI services assuming we were on production server
- Reality: We're in local development environment
- No clear documentation on how to set up local development
- Darren had "complete nightmare with Docker" and changed everything

## Discovery Questions

### 1. Environment Detection
- [ ] How do we programmatically detect which environment we're in?
- [ ] What environment variables distinguish prod from dev?
- [ ] Is there a config file that specifies environment?

### 2. Docker Reality
- [ ] What actually runs in Docker vs native?
- [ ] Why did Darren have Docker nightmares?
- [ ] What changes did he make to the Docker setup?
- [ ] Do we even need Docker for development?

### 3. Service Architecture
```
UNCLEAR: Where do these actually run?
- ElizaOS agents (bun processes?)
- PostgreSQL database (Docker? Native?)
- KOI Node Server (Python FastAPI)
- KOI Query Server (Bun TypeScript)
- Django Admin (Docker? Native?)
- Nginx proxy (Docker only?)
```

### 4. Development Setup
- [ ] What's the minimal local setup?
- [ ] Which services are required vs optional?
- [ ] How do we test agent functionality locally?
- [ ] Can we run without production dependencies?

## Investigation Plan

### Phase 1: Document Current Reality
1. **Examine all Docker files**
   - `docker-compose.yml` files
   - Dockerfiles
   - Docker scripts

2. **Review startup scripts**
   - `start-agents-hybrid.sh`
   - Any other startup scripts
   - Service initialization

3. **Check configuration files**
   - Environment configs
   - Service configs
   - Agent character files

### Phase 2: Interview Team
Questions for team members:
- **For Darren**: What Docker issues did you encounter? What changes did you make?
- **For Shawn**: What's the intended dev/prod architecture?
- **For Team**: How do you currently develop and test locally?

### Phase 3: Create Clear Documentation
1. **Environment Setup Guide**
   - Development environment from scratch
   - Production deployment process
   - Environment-specific configurations

2. **Service Architecture Diagram**
   - What runs where
   - Port mappings
   - Dependencies

3. **Troubleshooting Guide**
   - Common issues and solutions
   - Environment-specific problems
   - Recovery procedures

## Discovered Patterns

### Plugin Loading Confusion
From CLAUDE.md:
```
**Plugins are loaded from EXTERNAL directory**, not the monorepo:
- Actual Runtime: /opt/projects/plugin-knowledge/
- Development: /opt/projects/GAIA-direct/packages/plugin-knowledge/
```
This suggests multiple directory structures that need reconciliation.

### Multiple Project Roots
Seeing references to:
- `/opt/projects/GAIA` (Docker configs, characters, knowledge)
- `/opt/projects/GAIA-direct` (where agents run)
- `/home/regenai/project/` (KOI infrastructure)
- `/home/ygg/Workspace/cognitive-ecosystem/07-projects/16-regen-ai/GAIA` (current location)

### Process Management Chaos
- Agents started with bash scripts
- KOI services started separately
- Docker services managed with docker-compose
- No unified process management

## Proposed Solutions

### 1. Environment Configuration Standard
Create `.env.development` and `.env.production`:
```bash
# .env.development
ENVIRONMENT=development
DATABASE_URL=postgresql://localhost:5432/eliza
KOI_NODE_URL=http://localhost:8001
KOI_QUERY_URL=http://localhost:8100
AGENT_MODE=standalone
```

### 2. Unified Startup Script
Single script that detects environment and starts appropriate services:
```bash
#!/bin/bash
# start.sh - Unified startup with environment detection

ENV=${ENVIRONMENT:-development}
echo "Starting in $ENV mode..."

if [ "$ENV" = "development" ]; then
    # Start minimal local services
else
    # Start production services
fi
```

### 3. Development Container Option
Docker compose for complete local environment:
```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: eliza
    ports:
      - "5432:5432"
  
  koi-node:
    build: ./koi-node
    ports:
      - "8001:8001"
```

## Next Steps

### Immediate (Today)
1. Inventory all Docker and startup files in the repo
2. Document what we can verify works locally
3. Create basic local development setup

### This Week  
1. Test minimal local development environment
2. Document findings in clear guide
3. Get team alignment on approach

### Long-term
1. Standardize environment management
2. Create CI/CD pipeline
3. Automate environment setup

## Open Questions

1. **Is production actually working?** 
   - Last verified: Unknown
   - How to verify: Need production access

2. **What's the minimal viable dev environment?**
   - Just PostgreSQL?
   - Do we need KOI locally?
   - Can we mock external services?

3. **Version control for environments?**
   - How do we track environment changes?
   - How do we ensure dev/prod parity?

## Key Insight

We're suffering from **environment drift** - the documentation describes an idealized setup, but reality has diverged through ad-hoc fixes and undocumented changes. We need to:

1. **Accept current reality** - Document what actually works
2. **Simplify ruthlessly** - Remove unnecessary complexity  
3. **Standardize gradually** - Move toward cleaner setup over time
4. **Communicate changes** - Ensure team knows about environment updates

---

_"We can't fix what we don't understand. First, we document reality. Then we improve it."_