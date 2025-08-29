# RegenAI Deployment Workflow

_Last Updated: August 27, 2025_
_Deploy User: `darren`_

## Overview

This document establishes the standardized deployment workflow for RegenAI using `darren` as the dedicated deploy user. This approach eliminates git ownership conflicts and ensures consistent deployments.

## Core Principle

**ALL deployment operations MUST be performed as the `darren` user via sudo.**

This ensures:
- Consistent file ownership
- Clean git state
- Predictable permissions
- Clear audit trail

## Deployment Workflow

### 1. Local Development (Your Machine)

```bash
# Work on feature branch
git checkout -b feature/your-feature
# Make changes
git add .
git commit -m "feat: your changes"
git push origin feature/your-feature
```

### 2. Code Review

- Create Pull Request to `regen-knowledge-rag` branch
- Get review from team member
- Merge when approved

### 3. Server Deployment (Production)

```bash
# SSH to server
ssh shawn@202.61.196.119  # or your user

# ALWAYS use darren for deployment operations
sudo -u darren bash
cd /opt/projects/GAIA-direct

# Pull latest changes
git pull origin regen-knowledge-rag

# Build and deploy
./deploy.sh
```

## Standard Deployment Commands

### Quick Deploy (After PR Merge)

```bash
# One-line deployment
sudo -u darren /opt/projects/GAIA/deploy.sh
```

### Manual Step-by-Step

```bash
# Become darren
sudo -u darren bash

# Navigate to project
cd /opt/projects/GAIA-direct

# Check status
git status
git branch --show-current

# Pull latest
git pull origin regen-knowledge-rag

# Install and build
bun install
bun run build

# Restart agents
bash /opt/projects/GAIA/start-all-agents.sh
```

### Emergency Rollback

```bash
# As darren user
sudo -u darren bash
cd /opt/projects/GAIA-direct

# Rollback to previous commit
git log --oneline -5  # Find good commit
git checkout <commit-hash>

# Rebuild
bun install
bun run build

# Restart
bash /opt/projects/GAIA/start-all-agents.sh
```

## File Ownership Rules

### ✅ Correct Ownership
```
/opt/projects/GAIA-direct/   -> darren:darren
/opt/projects/GAIA/          -> darren:darren  
/opt/projects/plugin-knowledge/ -> darren:darren
```

### ❌ Never Do This
```bash
# DON'T edit files directly as your user
vi /opt/projects/GAIA-direct/some-file.ts  # Creates ownership issues

# DON'T pull as yourself
cd /opt/projects/GAIA-direct && git pull  # Creates git conflicts
```

### ✅ Always Do This
```bash
# Edit files as darren
sudo -u darren vi /opt/projects/GAIA-direct/some-file.ts

# Or edit locally and deploy via git
# (edit on your machine, push, then pull as darren)
```

## Common Scenarios

### Scenario 1: Deploy Latest Changes

```bash
ssh shawn@202.61.196.119
sudo -u darren /opt/projects/GAIA/deploy.sh
```

### Scenario 2: Hot Fix in Production

```bash
# Edit locally first if possible
# If must edit on server:
sudo -u darren bash
cd /opt/projects/GAIA-direct
vi packages/some-file.ts
git add -A
git commit -m "hotfix: emergency fix"
git push origin regen-knowledge-rag
bun run build
bash /opt/projects/GAIA/start-all-agents.sh
```

### Scenario 3: Check Deployment Status

```bash
# Check git status
sudo -u darren git -C /opt/projects/GAIA-direct status

# Check running agents
ps aux | grep -E "bun.*packages/cli/dist" | grep -v grep

# Check recent logs
tail -50 /opt/projects/GAIA-direct/logs/regenai.log
```

## Troubleshooting

### Problem: Permission Denied

```bash
# Fix ownership if needed (run as root)
sudo chown -R darren:darren /opt/projects/GAIA-direct
sudo chown -R darren:darren /opt/projects/GAIA
```

### Problem: Git Refuses to Pull

```bash
# As darren, stash changes
sudo -u darren bash
cd /opt/projects/GAIA-direct
git stash
git pull origin regen-knowledge-rag
git stash pop  # if you want to keep local changes
```

### Problem: Build Fails

```bash
# Clean build
sudo -u darren bash
cd /opt/projects/GAIA-direct
rm -rf node_modules .turbo
bun install --force
bun run build
```

## Team Agreements

1. **ALWAYS use `darren` for deployments** - No exceptions
2. **Never edit files directly as your user** on production
3. **Test locally first** before deploying
4. **Communicate deploys** in team chat
5. **Document hotfixes** with clear commit messages

## Deployment Checklist

Before deploying:
- [ ] PR reviewed and approved
- [ ] Tests passing (if applicable)
- [ ] Team notified of deployment
- [ ] Backup plan ready if needed

During deployment:
- [ ] Use `sudo -u darren` for all operations
- [ ] Monitor logs during restart
- [ ] Verify all 5 agents start
- [ ] Check web UI accessibility

After deployment:
- [ ] Confirm feature works as expected
- [ ] Monitor for errors (15 minutes)
- [ ] Update team on success/issues

## Quick Reference Card

```bash
# Standard deployment (99% of cases)
ssh shawn@202.61.196.119
sudo -u darren /opt/projects/GAIA/deploy.sh

# Check what's running
ps aux | grep "bun.*cli/dist" | grep -v grep

# View logs
tail -f /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Restart agents only (no build)
sudo -u darren bash /opt/projects/GAIA/start-all-agents.sh

# Emergency stop all agents
sudo pkill -f 'packages/cli/dist/index.js start'
```

## Security Notes

- `darren` user has limited sudo permissions (only what's needed)
- Deploy SSH key is read-only for GitHub
- No personal SSH keys should be on production server
- All deploys are logged in system audit log

---

_Remember: Consistency prevents conflicts. Always deploy as `darren`._