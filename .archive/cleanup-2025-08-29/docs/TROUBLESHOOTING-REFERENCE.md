# Troubleshooting & Reference Guide

*Consolidated from historical documentation - Last updated: 2025-08-29*

## Quick Command Reference

### Deployment Commands
```bash
# Deploy latest changes (production)
ssh production-server
sudo -u darren /opt/projects/GAIA/deploy.sh

# Deployment options
--skip-build    # When only config changed
--force-restart # Just restart agents
--skip-pull     # Test local changes
--quiet         # Minimal output
```

### Status Checks
```bash
# Check running agents
ps aux | grep "bun.*cli/dist" | grep -v grep

# Check specific agent logs
tail -f /opt/projects/GAIA/logs/regenai.log
tail -f /opt/projects/GAIA/logs/advocate.log
tail -f /opt/projects/GAIA/logs/governor.log
tail -f /opt/projects/GAIA/logs/narrative.log
tail -f /opt/projects/GAIA/logs/voiceofnature.log

# Check git status
git -C /opt/projects/GAIA status
```

## Common Issues & Solutions

### PostgreSQL Connection Issues

**Problem**: "Client password must be a string" or SASL authentication errors

**Solution**: Ensure correct connection string:
```bash
# CORRECT (with password):
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# WRONG (empty password causes errors):
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza
```

### 502 Bad Gateway Errors

**Causes & Solutions**:

1. **Wrong nginx port configuration**:
```bash
# Check actual agent ports
grep "AgentServer is listening" /opt/projects/GAIA/logs/*.log

# Update nginx to match actual port
docker exec nginx vi /etc/nginx/nginx.conf
# Change upstream port to match
docker compose restart nginx
```

2. **Agents not running**:
```bash
# Start agents
bash /opt/projects/GAIA/start-all-agents-single-process.sh
```

### Telegram Bot Issues

**401 Unauthorized Errors**:
1. Get fresh tokens from @BotFather
2. Add to character files' `secrets` section:
```json
"secrets": {
  "TELEGRAM_BOT_TOKEN": "your-token-here"
}
```

**CHARACTER.* Environment Variables Not Working**:
- Bash cannot export variables with dots
- Use inline passing or add directly to character files

### Plugin-Knowledge Issues

**Documents Being Reprocessed**:
- Use our custom fork with deduplication: `github:gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes`
- Build from source after install:
```bash
cd node_modules/@elizaos/plugin-knowledge
bun run build
```

**Memory Usage Issues**:
- Set `LOAD_DOCS_ON_STARTUP=false` for large knowledge bases
- Load incrementally after startup

### Django Admin Issues

**Template Rendering Problems**:
- The /regenai/ URL is served by reporting app, not eliza_tables
- Edit: `django_admin/reporting/templates/reporting/dashboard.html`
- Rebuild: `docker-compose build --no-cache django`

**Worker Timeout Errors**:
- Increase Gunicorn timeout in docker-compose
- Add `--timeout 120` to gunicorn command

### Performance Issues

**Slow Response Times**:
1. Switch to faster model:
```bash
TEXT_MODEL=claude-3-5-haiku-20241022  # Fastest
# or
TEXT_MODEL=gpt-4o-mini  # Also fast
```

2. Optimize Node memory:
```bash
NODE_OPTIONS="--max-old-space-size=8192"
BUN_JSC_FORCE_JIT=1
```

**High Memory Usage**:
- Disable knowledge loading on startup
- Use single-process mode for agents
- Monitor with: `htop` or `docker stats`

## Model Performance Comparison

| Model | First Token (ms) | Total Time (ms) | Cost/1K |
|-------|-----------------|----------------|---------|
| Claude 3.5 Haiku | 500-800 | 1500-2500 | $0.0008 |
| GPT-4o-mini | 400-600 | 1200-2000 | $0.00015 |
| GPT-4o | 800-1200 | 3000-5000 | $0.005 |

## KOI System Operations

### Check KOI Services
```bash
# KOI Node (port 8001)
curl http://localhost:8001/regen/health
curl http://localhost:8001/regen/agents

# Query Server (port 8100)
curl http://localhost:8100/stats

# Restart services
pkill -f "python.*node"
cd /home/regenai/project/koi-infrastructure/koi-regen-node
source venv/bin/activate && python -m node &
```

### Agent RID Mappings
```
relevant.agent.regenai.v1.0.0       -> RegenAI
relevant.agent.voiceofnature.v1.0.0 -> VoiceOfNature
relevant.agent.facilitator.v1.0.0   -> Facilitator
relevant.agent.governor.v1.0.0      -> Governor
relevant.agent.narrative.v1.0.0     -> Narrator
```

## Emergency Procedures

### Stop All Agents
```bash
sudo pkill -f 'packages/cli/dist/index.js'
```

### Fix Ownership Issues
```bash
sudo chown -R darren:gaia-devs /opt/projects/GAIA
sudo chmod -R g+rws /opt/projects/GAIA
```

### Clean Rebuild
```bash
cd /opt/projects/GAIA
rm -rf node_modules .turbo bun.lockb
bun install --force
bun run build
```

### Rollback to Previous Version
```bash
cd /opt/projects/GAIA
git log --oneline -5  # Find good commit
git reset --hard <commit-hash>
bash start-all-agents-single-process.sh
```

## Environment Variable Reference

### Critical Variables
```bash
# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# Models (for performance)
TEXT_MODEL=claude-3-5-haiku-20241022
TEXT_EMBEDDING_MODEL=text-embedding-3-small

# Knowledge
LOAD_DOCS_ON_STARTUP=false  # For large knowledge bases
KNOWLEDGE_PATH=./knowledge

# Performance
NODE_OPTIONS="--max-old-space-size=8192"
BUN_JSC_FORCE_JIT=1
```

### Character-Specific (Telegram)
```bash
# Cannot be exported due to dots, pass inline:
CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01
```

## Key File Locations

### Production
- **Agents**: `/opt/projects/GAIA/`
- **Logs**: `/opt/projects/GAIA/logs/`
- **Characters**: `/opt/projects/GAIA/characters/`
- **Knowledge**: `/opt/projects/GAIA/knowledge/`

### Configuration
- **Environment**: `/opt/projects/GAIA/.env`
- **Startup Scripts**: 
  - `start-all-agents-single-process.sh` (recommended)
  - `start-all-agents-telegram.sh` (multi-process)
  - `start-all-agents-no-telegram.sh` (testing)

## Plugin Versions

### Working Combinations
```json
{
  "@elizaos/core": "1.4.4",
  "@elizaos/plugin-telegram": "github:gaiaaiagent/plugin-telegram.git#1.x",
  "@elizaos/plugin-knowledge": "github:gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes"
}
```

**Warning**: Official ElizaOS plugins often incompatible with newer core versions. Use our custom forks when available.

## Testing Checklist

Before deploying:
- [ ] Agents start without errors
- [ ] Web UI accessible
- [ ] Telegram bots connect
- [ ] Database queries work
- [ ] Knowledge loads correctly
- [ ] Response time < 2 seconds
- [ ] Memory usage stable

## Related Documentation

For detailed procedures, see:
- `AGENT-STARTUP-GUIDE.md` - Complete startup procedures
- `AGENT-OPERATIONS.md` - Operational procedures
- `TELEGRAM-BOT-SETUP.md` - Telegram configuration
- `KOI-SYSTEM.md` - KOI infrastructure details

---

*This document consolidates troubleshooting knowledge from 22 historical documentation files.*