---
rid: koi:process:development-workflow
created: 2025-08-08
last-modified: 2025-08-08
confidence: high
verification-status: active-process
---

# RegenAI Development Workflow

## Branch Strategy

### Production Branch: `regen`
- **AUTO-DEPLOYS to production** via GitHub Actions
- **NEVER commit directly** to this branch
- Only merge from `regen-develop` after thorough testing
- Contains only production-ready code

### Development Branch: `regen-develop`
- Primary working branch for all development
- Test all changes here first
- Run local instances for validation
- Safe to experiment and iterate

### Feature Branches (optional)
- `regen-develop-feature-name` for larger features
- Merge back to `regen-develop` when complete

## Daily Development Flow

### 1. Start of Session
```bash
# Ensure on development branch
git checkout regen-develop

# Pull latest changes
git pull origin regen-develop

# Check status
git status
```

### 2. Local Development Setup

#### ElizaOS Local Instance
```bash
# Start local ElizaOS
bun start

# Or with specific character
bun start --character characters/regenai.character.json
```

#### Django Admin Local
```bash
# Navigate to Django admin
cd django_admin

# Start Django dev server
python manage.py runserver

# Access at http://localhost:8000/admin/
```

#### Docker Local Testing
```bash
# Use local docker-compose
docker-compose -f docker-compose.local.yaml up
```

### 3. Making Changes

```bash
# Always on regen-develop
git checkout regen-develop

# Make changes
# Test locally
# Verify everything works

# Commit with clear messages
git add .
git commit -m "feat: description of change"

# Push to development branch
git push origin regen-develop
```

### 4. Testing Checklist

Before considering code ready:
- [ ] Local ElizaOS runs without errors
- [ ] Django admin accessible locally
- [ ] No 500 errors in Django
- [ ] Character files load properly
- [ ] Database operations work
- [ ] No TypeScript errors (`bun run build`)
- [ ] Linting passes (`bun run lint`)

### 5. Deploying to Production

**CAREFUL: This auto-deploys!**

```bash
# Only when fully tested
git checkout regen
git merge regen-develop
git push origin regen

# GitHub Actions will auto-deploy
# Monitor deployment at GitHub Actions tab
```

## Safety Rules

### DO NOT on `regen` branch:
- Make direct commits
- Fix bugs directly
- Test new features
- Experiment with code

### ALWAYS on `regen-develop`:
- Test thoroughly locally
- Run build commands
- Check for errors
- Validate Django admin
- Test agent interactions

### Before Merging to Production:
1. All local tests pass
2. No known breaking changes
3. Database migrations tested
4. Character files validated
5. Configuration reviewed

## Local vs Production Config

### Local Development
- Use `.env.local` for local settings
- Point to local PostgreSQL
- Use development API keys
- Enable debug logging

### Production
- Uses production environment variables
- Points to production database
- Uses production API keys
- Minimal logging

## Common Development Tasks

### Run Local Agents
```bash
bun start --character characters/advocate.character.json
```

### Test Django Admin
```bash
cd django_admin
python manage.py runserver
# Visit http://localhost:8000/admin/
```

### Check Agent Interactions
```bash
# View logs
tail -f logs/agent.log

# Check database
psql -d elizaos -c "SELECT COUNT(*) FROM memories;"
```

### Build and Test
```bash
bun run build
bun test
bun run lint
```

## Emergency Procedures

### If Production Breaks:
1. **DO NOT PANIC**
2. Check GitHub Actions for deployment status
3. Review recent commits to `regen`
4. Revert if necessary:
   ```bash
   git checkout regen
   git revert HEAD
   git push origin regen
   ```

### If Local Won't Start:
1. Check dependencies: `bun install`
2. Check database: `docker-compose ps`
3. Check environment: `.env` file
4. Reset if needed: `git clean -fd`

## Current State Notes

- **Production**: interactions logged, system working
- **Auto-deployment**: Active on `regen` branch
- **Development branch**: `regen-develop` created and active

---

*Workflow established: August 8, 2025*  
*Primary rule: Never commit directly to `regen`*  
*Always work on `regen-develop` first*
