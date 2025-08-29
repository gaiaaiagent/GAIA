# Stable Deployment Workflow

## Current State Analysis

### Branches
- **`regen`** - Production (auto-deploys via GitHub Actions)
- **`regen-develop`** - Integration branch
- **`regen-knowledge-rag`** - Current feature branch (we are here)

### Problems Identified
1. Direct commits to `regen` are dangerous (instant production deploy)
2. No automated testing before production
3. No staging environment for validation
4. Version pinning strategy unclear (ElizaOS updates breaking things)

## Proposed Stable Workflow

### Branch Protection Strategy

```
feature branches → regen-develop → regen-staging → regen
     ↓                   ↓              ↓            ↓
Local testing      Integration      Staging      Production
                   testing          validation    auto-deploy
```

### 1. Feature Development
```bash
# Create feature branch from regen-develop
git checkout regen-develop
git pull origin regen-develop
git checkout -b feature/performance-improvements

# Work on feature
# Test locally with stable scripts
./start-all-agents-single-process.sh

# Commit and push
git add .
git commit -m "feat: improve response time"
git push origin feature/performance-improvements
```

### 2. Pull Request to Integration
```bash
# Create PR to regen-develop
gh pr create --base regen-develop \
  --title "Performance improvements" \
  --body "Reduces response time by 50%"
```

**PR Requirements:**
- [ ] Local testing complete
- [ ] No ElizaOS version changes (unless coordinated)
- [ ] Startup scripts work
- [ ] Telegram/Discord/Twitter plugins tested
- [ ] Performance metrics included

### 3. Integration Testing (regen-develop)
Once merged to `regen-develop`:
- Automated tests run
- Deploy to dev server (if available)
- Team validation
- Performance benchmarks

### 4. Staging Promotion
```bash
# Weekly promotion to staging
git checkout regen-staging
git merge regen-develop
git push origin regen-staging
```

**Staging Validation (24-48 hours):**
- Full integration test suite
- Performance testing
- User acceptance testing
- Rollback plan prepared

### 5. Production Release
```bash
# After staging validation
git checkout regen
git merge regen-staging --no-ff
git tag -a v1.0.x -m "Release: <description>"
git push origin regen --tags
```

## GitHub Configuration

### Branch Protection Rules

#### For `regen` (Production)
```yaml
Protection Rules:
  - Require pull request reviews: 2
  - Dismiss stale reviews: true
  - Require status checks:
    - CI/Build
    - Tests
    - Performance benchmarks
  - Require branches up to date: true
  - Include administrators: true
  - Restrict push access: deploy-bot only
```

#### For `regen-develop` (Integration)
```yaml
Protection Rules:
  - Require pull request reviews: 1
  - Require status checks:
    - Build
    - Lint
    - Basic tests
  - Allow force pushes: false
  - Allow deletions: false
```

## Version Management

### ElizaOS Pinning Strategy
```json
// package.json
{
  "version": "1.4.4",  // Pin to stable
  "elizaos-version-policy": "manual-update-only",
  "update-schedule": "quarterly"
}
```

### Dependency Update Process
1. Test updates in feature branch
2. Full regression testing
3. Performance comparison
4. Document breaking changes
5. Coordinate team-wide update

## Automated Testing Requirements

### Pre-merge Checks (GitHub Actions)
```yaml
name: Pre-merge Validation
on:
  pull_request:
    branches: [regen-develop, regen-staging, regen]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Build all packages
      - Run unit tests
      - Check startup scripts
      - Validate character files
      - Test Telegram plugin
      - Test Discord plugin
      - Test Twitter plugin
      - Performance benchmark
      - Memory usage check
```

### Performance Gates
- Response time: < 2 seconds
- Memory usage: < 2GB per agent
- Startup time: < 30 seconds
- Knowledge loading: < 60 seconds

## Rollback Strategy

### Quick Rollback
```bash
# If production breaks
git checkout regen
git revert HEAD
git push origin regen

# Or revert to known good tag
git checkout regen
git reset --hard v1.0.x-stable
git push --force-with-lease origin regen
```

### Hotfix Process
```bash
# For critical fixes only
git checkout -b hotfix/critical-fix regen
# Make minimal fix
git commit -m "hotfix: critical issue"
gh pr create --base regen --label hotfix
# After approval, merge directly to regen
# Then backport to regen-develop
```

## Monitoring & Alerts

### Key Metrics to Track
- Agent response times
- Memory usage trends
- Error rates
- Telegram/Discord message handling
- Database query performance

### Alert Thresholds
- Response time > 5s: Warning
- Memory > 3GB: Warning
- Any agent crash: Critical
- Database connection lost: Critical

## Team Responsibilities

### Release Manager (Weekly Rotation)
- Coordinate staging promotion
- Run validation checklist
- Approve production release
- Monitor post-deployment

### Feature Developer
- Test locally thoroughly
- Document changes
- Update relevant guides
- Provide rollback plan

### DevOps Lead
- Maintain CI/CD pipeline
- Monitor infrastructure
- Optimize performance
- Manage secrets/credentials

## Implementation Timeline

### Week 1: Foundation
- [ ] Configure branch protection rules
- [ ] Set up staging branch
- [ ] Create GitHub Actions workflow

### Week 2: Testing
- [ ] Add automated tests
- [ ] Set up performance benchmarks
- [ ] Configure monitoring

### Week 3: Documentation
- [ ] Update all guides
- [ ] Train team on workflow
- [ ] Create runbooks

### Week 4: Go Live
- [ ] Enable full protection
- [ ] First controlled release
- [ ] Monitor and adjust

## Success Criteria

1. **Zero unplanned downtime** in production
2. **All changes tested** before production
3. **Rollback possible** within 2 minutes
4. **Performance maintained** or improved
5. **Team confidence** in deployment process

---

*This workflow prioritizes stability and predictability over speed of deployment.*
*Every production change should be deliberate, tested, and reversible.*