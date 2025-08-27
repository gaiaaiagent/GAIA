# GAIA vs GAIA-direct Directory Structure

## Overview
The RegenAI deployment uses two separate directories to maintain clean separation between data and code:

## GAIA Directory (`/opt/projects/GAIA/`)
**Purpose**: Data and configuration repository
- **Location**: Your fork of the GAIA project
- **Contains**:
  - `/knowledge/` - All knowledge base documents (12,534 files)
  - `/characters/` - Agent character configuration files
  - Custom scripts and deployment configurations
  - Project-specific documentation

## GAIA-direct Directory (`/opt/projects/GAIA-direct/`)
**Purpose**: ElizaOS runtime environment
- **Location**: Clean ElizaOS installation
- **Contains**:
  - ElizaOS v1.4.2 codebase
  - `/packages/` - All ElizaOS packages
  - `/shared-data-*` - Database files (PostgreSQL data)
  - `/logs/` - Runtime logs
  - Docker compose configurations

## Benefits of This Separation

1. **Clean Updates**: Can update ElizaOS without affecting your data
2. **Version Control**: GAIA contains your customizations, GAIA-direct is vanilla ElizaOS
3. **Shared Resources**: All agents use the same knowledge path
4. **Backup Strategy**: Easy to backup just your data (GAIA) separately from code

## How They Work Together

```bash
# Startup script references both:
GAIA_DIR="/opt/projects/GAIA-direct"        # Where ElizaOS runs
KNOWLEDGE_PATH="/opt/projects/GAIA/knowledge" # Where knowledge lives
CHARACTERS_PATH="/opt/projects/GAIA/characters" # Where characters are defined
```

## Key Configuration Updates Made

All character files have been updated to:
- `LOAD_DOCS_ON_STARTUP: false` - Prevents duplicate processing since knowledge is already in the database
- `KNOWLEDGE_PATH: "/opt/projects/GAIA/knowledge"` - Points to the correct server path

## Notes
- The `/app/knowledge` path in character files was for Docker deployments
- Environment variables in startup scripts can override character file settings
- All agents share the same PostgreSQL database for knowledge embeddings