# GitHub Setup for Auto-Deployment

## Required GitHub Secrets

Go to: https://github.com/gaiaaiagent/GAIA/settings/secrets/actions

Add these two secrets:

### 1. SERVER_USER
Your SSH username for the production server (likely `shawn`)

### 2. SERVER_SSH_KEY
Your private SSH key to access the production server.

To generate one if you don't have it:

```bash
# On your LOCAL machine, generate a key pair
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github-deploy

# Copy the PUBLIC key to the server
ssh-copy-id -i ~/.ssh/github-deploy.pub shawn@202.61.196.119

# Copy the PRIVATE key content for GitHub
cat ~/.ssh/github-deploy
# Copy everything including -----BEGIN OPENSSH PRIVATE KEY----- 
# and -----END OPENSSH PRIVATE KEY-----
```

Paste the entire private key into the GitHub secret.

## Branch Protection

Go to: https://github.com/gaiaaiagent/GAIA/settings/branches

### Protect `regen` branch:
1. Click "Add branch protection rule"
2. Branch name pattern: `regen`
3. Check:
   - ✅ Require a pull request before merging
   - ✅ Require approvals: 1
   - ✅ Dismiss stale pull request approvals when new commits are pushed
   - ✅ Include administrators (optional but recommended)
4. Click "Create"

### Protect `regen-develop` branch:
Same as above but with pattern: `regen-develop`

## Test the Workflow

1. Make a small change in `regen-develop`
2. Create a PR to `regen`
3. Merge it
4. Watch the Actions tab: https://github.com/gaiaaiagent/GAIA/actions
5. Should deploy automatically within 5-10 minutes

## Monitoring

- **GitHub Actions**: See all deployments and their status
- **Deployment History**: Check the "Deployments" tab in your repo
- **Rollback**: SSH to server and run `/opt/projects/GAIA/scripts/rollback.sh`