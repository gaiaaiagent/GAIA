# Development Workflow

## Quick Start for Developers

### 1. Local Development Setup

```bash
# Clone the repository
git clone https://github.com/gaiaaiagent/GAIA.git
cd GAIA

# Switch to development branch
git checkout regen-develop

# Copy environment template
cp .env.example .env
# Edit .env with your API keys (OPENAI_API_KEY, ANTHROPIC_API_KEY)

# Start local development
docker compose up

# Access locally at:
# - http://localhost:3000 (agents)
# - http://localhost:8000 (django admin)
```

### 2. Development Workflow

```bash
# Always start from regen-develop
git checkout regen-develop
git pull origin regen-develop

# Create a feature branch
git checkout -b feature/my-new-feature

# Make your changes
# ... edit files ...

# Test locally
docker compose up

# Commit your changes
git add .
git commit -m "feat: add amazing new feature"

# Push to GitHub
git push origin feature/my-new-feature

# Create a Pull Request to regen-develop
# Go to GitHub and click "New Pull Request"
# Base: regen-develop, Compare: feature/my-new-feature
```

### 3. Deploying to Production

**Only authorized team members can merge to `regen` branch!**

```bash
# After your PR is approved and merged to regen-develop
git checkout regen-develop
git pull origin regen-develop

# Create a PR from regen-develop to regen
# This requires approval from another team member

# Once merged to regen:
# ✅ GitHub Actions automatically builds new Docker images
# ✅ Deploys to production within 5-10 minutes
# ✅ Previous version saved for rollback
```

### 4. Emergency Rollback

If something breaks in production:

```bash
# SSH into production server
ssh user@202.61.196.119

# Quick rollback to previous version
cd /opt/projects/GAIA
./scripts/rollback.sh

# Or rollback to specific commit
./scripts/rollback.sh abc123def456
```

## Branch Protection Rules

### `regen` Branch (Production)
- ✅ Requires pull request reviews (1 approval)
- ✅ Dismiss stale reviews on new commits
- ✅ No direct pushes (even admins)
- ✅ Auto-deploys on merge

### `regen-develop` Branch
- ✅ Main development integration branch
- ✅ All features merge here first
- ✅ Should always be stable

## Environment Variables

### Required for Local Development
```env
# AI Models (need at least one)
OPENAI_API_KEY=your-key-here
ANTHROPIC_API_KEY=your-key-here

# Database (optional - uses SQLite by default)
POSTGRES_URL=postgresql://user:pass@localhost:5432/eliza

# Server
NODE_ENV=development
SERVER_PORT=3000
```

### Production (Managed by DevOps)
- Set in production server's `.env`
- Includes additional security tokens
- SSL certificates managed by Let's Encrypt

## Docker Images

### Local Development
- Uses `docker-compose.yaml`
- Builds from local source
- Hot-reload enabled

### Production
- Uses `docker-compose-ssl.yaml`
- Pulls from GitHub Container Registry
- Images tagged with commit SHA for tracking

## Monitoring Deployments

### GitHub Actions
- Check deployment status: https://github.com/gaiaaiagent/GAIA/actions
- Each merge to `regen` triggers a deployment
- Takes 5-10 minutes typically

### Production Health Checks
```bash
# Check if services are running
curl https://regen.gaiaai.xyz

# Check agent interface (requires auth)
curl -u regenai:password https://agents.regen.gaiaai.xyz

# Check Django admin
curl https://admin.regen.gaiaai.xyz/admin/
```

## Common Issues

### Agents Not Responding
- Check API keys are set in `.env`
- Verify Docker containers are running: `docker ps`
- Check logs: `docker logs regenai`

### Build Failures
- Check GitHub Actions logs
- Ensure Dockerfile is valid
- Verify all dependencies are installed

### Can't Push to Protected Branch
- Create a Pull Request instead
- Ask for review from team member
- Never force push to `regen` or `regen-develop`

## Team Guidelines

1. **Always test locally first**
2. **Create descriptive commit messages**
3. **Document breaking changes**
4. **Request reviews for production deploys**
5. **Monitor after deploying**
6. **Keep `regen-develop` stable**

## Getting Help

- Check logs: `docker logs [container-name]`
- Review deployment history in GitHub Actions
- Ask in team Slack/Discord
- Check journal entries in `.claude/journal/`