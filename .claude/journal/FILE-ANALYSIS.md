# File Analysis - Production Server Status

## Files We Should KEEP:

### Grant System Files (IMPORTANT - IN PRODUCTION!)
- **grant-admin.html** - Admin panel for REGEN IRL Grant Applications
- **create-grant-tables.sql** - Database schema for grant system
- **nginx-ssl.conf** (modified) - Contains routes for /irl/ and /api/grants/
  - The grant system is live at port 3007
  - IRL interface at /opt/projects/GAIA/Gaia-IRL/

### SystemD Service Files (For stability)
- **regenai-agents.service** - SystemD service definition
- **setup-systemd-service.sh** - Setup script for the service

### Documentation
- **docs/JOURNAL-DEVOPS-INTERVENTION.md** - Important milestone

### Modified Core Files (Need review)
- **characters/advocate.character.json** - Telegram client enabled
- **characters/narrative.character.json** - Telegram client enabled  
- **start-all-agents-single-process.sh** - Production startup script
- **package.json** - Added @elizaos/plugin-mcp dependency
- **bun.lock** - Package lock file

## Files We Can REMOVE:

### Old Test Scripts (Safe to remove)
- **start-test-agents.sh** - Old test script for 2 test agents
- **start-test-agents-fixed.sh** - Another test variant
- **start-advocate-ollama.sh** - Old local dev script (Mac paths)
- **start-agents-simple.sh** - Redundant startup script
- **test-symlink-knowledge.sh** - Test utility

### Test Data
- **koi-data/koi-entities-sample.ttl** - Sample RDF data (moved elsewhere?)

## Files That Need INVESTIGATION:

### MCP Servers Directory
- **mcp-servers/** - Contains "regen" subdirectory
  - Need to check if this is being used in production
  - Related to the @elizaos/plugin-mcp addition

### Backup/Duplicate Directories
- **knowledge copy/** - Appears to be a backup of knowledge base
  - Contains .deduplication and .processing-reports
  - Should verify this isn't needed

### Utility Files
- **uuid-from-string.js** - Utility for deterministic UUIDs
  - Might be used by grant system or other components

### Environment Backup
- **.env.backup.20250901_224724** - Contains secrets (NEVER commit)

## Recommended Action Plan:

1. **DO NOT REMOVE grant system files** - They're in production use
2. **KEEP systemd files** - Essential for stability
3. **SAFE TO REMOVE old test scripts** - Confirmed as dev/test only
4. **INVESTIGATE MCP usage** before deciding
5. **NEVER COMMIT .env backups**

## Critical Discovery:
The REGEN IRL Grant system is actively deployed and integrated with nginx. Any changes to grant-admin.html, create-grant-tables.sql, or the nginx configuration could break production functionality.
