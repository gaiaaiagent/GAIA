# Docker File Analysis and Consolidation Plan

## Current State: Docker File Inventory

### Docker Compose Files (10 files!)

1. **docker-compose.yaml** - Main production config (nginx, postgres, django, regen agent)
2. **docker-compose.local.yaml** - Local dev with ports exposed (5433 for postgres)
3. **docker-compose.prod.yaml** - Production variant (seems redundant with main)
4. **docker-compose.production-fixed.yaml** - Another production variant (why?)
5. **docker-compose.knowledge.yaml** - Knowledge ingestion service
6. **docker-compose.regenai.yaml** - Agent-specific config
7. **docker-compose-ssl.yaml** - SSL/HTTPS configuration
8. **docker-compose-certbot.yaml** - Certificate generation
9. **docker-compose-docs.yaml** - Documentation server
10. **docker-compose.override.yaml** - Local overrides

### Dockerfiles (4 files)

1. **Dockerfile** - Main ElizaOS build
2. **Dockerfile.simple** - Simplified build
3. **Dockerfile.knowledge** - Knowledge processor
4. **Dockerfile.docs** - Documentation server

### Startup Scripts (7+ files)

1. **start-all-agents.sh** - Basic startup
2. **start-all-agents-with-telegram.sh** - Telegram-enabled
3. **start-all-agents-telegram.sh** - Another Telegram variant
4. **start-all-agents-single-process.sh** - Single process mode
5. **start-all-agents-no-telegram.sh** - No Telegram
6. **start-agents-optimized.sh** - Performance optimized
7. **start-agents-simple.sh** - Simplified startup

## Problems Identified

1. **Massive redundancy** - Multiple files doing the same thing
2. **Unclear which to use when** - No clear documentation
3. **Configuration drift** - Each file has slightly different settings
4. **Maintenance nightmare** - Changes need to be replicated across files

## Consolidation Plan

### Phase 1: Immediate Consolidation

#### Docker Compose (Reduce from 10 to 2)
```
docker-compose.dev.yml    # Local development
docker-compose.prod.yml   # Production deployment
```

#### Dockerfiles (Reduce from 4 to 1)
```
Dockerfile               # Single multi-stage build
```

#### Startup Scripts (Reduce from 7 to 1)
```
start-agents.sh         # Single script with flags
  --mode=dev|prod
  --telegram=on|off
  --process=single|multi
```

### Phase 2: Configuration Management

Use environment variables and .env files:
- `.env.dev` - Development settings
- `.env.prod` - Production settings
- `.env.example` - Template with all options

### Phase 3: Documentation

Single authoritative guide:
- `SETUP.md` - Complete setup and deployment guide
- Remove all redundant docs

## Implementation Priority

1. **TODAY**: Consolidate startup scripts
2. **TODAY**: Merge docker-compose files
3. **TOMORROW**: Single Dockerfile with multi-stage
4. **THIS WEEK**: Update all documentation

## Key Decisions Needed

1. Do we need separate knowledge ingestion service?
2. Should Django admin be in same compose or separate?
3. Do we need certbot in compose or handle externally?
4. Should agents run in Docker or native (current: native)?