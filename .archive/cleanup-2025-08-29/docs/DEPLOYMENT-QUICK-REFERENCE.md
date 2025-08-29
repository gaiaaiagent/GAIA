# RegenAI Deployment Quick Reference

## 🚀 Most Common Commands

```bash
# Deploy latest changes (90% of the time)
ssh shawn@202.61.196.119
sudo -u darren /opt/projects/GAIA/deploy.sh

# Or use the shortcut (after setup)
regenai-deploy
```

## 📋 Deployment Options

```bash
# Full deployment (pull + build + restart)
sudo -u darren /opt/projects/GAIA/deploy.sh

# Skip build (when only config changed)
sudo -u darren /opt/projects/GAIA/deploy.sh --skip-build

# Just restart agents (no code changes)
sudo -u darren /opt/projects/GAIA/deploy.sh --force-restart

# Deploy without pulling (test local changes)
sudo -u darren /opt/projects/GAIA/deploy.sh --skip-pull

# Quiet mode (minimal output)
sudo -u darren /opt/projects/GAIA/deploy.sh --quiet
```

## 🔍 Status Checks

```bash
# Quick status check
regenai-status

# Check what's running
ps aux | grep "bun.*cli/dist" | grep -v grep

# Check git status
sudo -u darren git -C /opt/projects/GAIA-direct status

# View current deployment
sudo -u darren git -C /opt/projects/GAIA-direct log -1 --oneline
```

## 📝 Logs

```bash
# All agents combined
tail -f /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Specific agent
tail -f /opt/projects/GAIA-direct/logs/regenai.log
tail -f /opt/projects/GAIA-direct/logs/advocate.log
tail -f /opt/projects/GAIA-direct/logs/governor.log
tail -f /opt/projects/GAIA-direct/logs/narrative.log
tail -f /opt/projects/GAIA-direct/logs/voiceofnature.log

# Last 100 lines with timestamps
tail -100 /opt/projects/GAIA-direct/logs/regenai.log
```

## 🛠️ Troubleshooting

### Emergency Stop
```bash
# Stop all agents immediately
sudo pkill -f 'packages/cli/dist/index.js start'
```

### Fix Ownership Issues
```bash
# Run as root
sudo chown -R darren:darren /opt/projects/GAIA-direct
sudo chown -R darren:darren /opt/projects/GAIA
```

### Clean Build
```bash
sudo -u darren bash
cd /opt/projects/GAIA-direct
rm -rf node_modules .turbo
bun install --force
bun run build
```

### Rollback
```bash
sudo -u darren bash
cd /opt/projects/GAIA-direct
git log --oneline -10  # Find good commit
git checkout <commit-hash>
bun install && bun run build
bash /opt/projects/GAIA/start-all-agents.sh
```

### Check Docker Services
```bash
# List running containers
docker ps

# Restart PostgreSQL
docker restart gaia-postgres-1

# Restart Nginx
docker restart gaia-nginx-1

# View Docker logs
docker logs gaia-postgres-1 --tail 50
```

## 🌐 Access Points

- **Web UI**: https://regen.gaiaai.xyz/
  - Username: `regenai`
  - Password: `regen2025`
  
- **Admin Panel**: https://admin.regen.gaiaai.xyz/admin/
  - Django admin interface
  
- **Agent Endpoints** (internal):
  - RegenAI: http://localhost:3000
  - Advocate: http://localhost:3001
  - Voice of Nature: http://localhost:3002
  - Governor: http://localhost:3003
  - Narrative: http://localhost:3004

## ⚠️ Golden Rules

1. **ALWAYS deploy as `darren`** - Never as your personal user
2. **Test locally first** - Don't debug in production
3. **Check status after deploy** - Verify all 5 agents start
4. **Monitor logs** - Watch for errors after deployment
5. **Communicate deploys** - Tell team in chat

## 📊 Health Checks

```bash
# Quick health check
curl -s http://localhost:3000/health | jq .

# Check all agents
for port in 3000 3001 3002 3003 3004; do
  echo -n "Port $port: "
  curl -s http://localhost:$port/health | jq -r .status || echo "DOWN"
done

# Database connection
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT COUNT(*) FROM memories;"
```

## 🔄 Workflow Summary

```mermaid
graph LR
    A[Local Dev] -->|git push| B[GitHub PR]
    B -->|merge| C[Main Branch]
    C -->|ssh server| D[Deploy as darren]
    D -->|deploy.sh| E[Running in Prod]
```

---

_Remember: `darren` is our friend. Always deploy through `darren`._