# Security Guidelines for RegenAI

## Critical Security Rules

### 🚨 Never Commit Secrets to Git

**NEVER commit these to the repository:**
- API keys (OpenAI, Anthropic, etc.)
- Telegram bot tokens
- Database passwords
- Private keys or certificates
- Any authentication credentials

### 📁 File Security Structure

```
GAIA/
├── .env                           # GITIGNORED - Contains all secrets
├── .gitignore                     # Ensures secrets aren't tracked
├── characters/
│   ├── *.character.json          # GITIGNORED - Actual configs with tokens
│   └── *.character.json.template # SAFE - Templates with placeholders
└── scripts/
    └── setup-characters.sh        # SAFE - Script to configure from templates
```

## Configuration Management

### For API Keys (OpenAI, Anthropic, etc.)

**Where they go:** `.env` file only

```bash
# .env file (gitignored)
OPENAI_API_KEY=sk-proj-...
ANTHROPIC_API_KEY=sk-ant-...
```

**Why:** These are shared across all agents and highly sensitive.

### For Telegram Bot Tokens

**Template approach (RECOMMENDED):**

1. **Templates in Git:** `characters/*.character.json.template`
   ```json
   "secrets": {
     "TELEGRAM_BOT_TOKEN": "YOUR_TELEGRAM_BOT_TOKEN_HERE",
     "TELEGRAM_BOT_USERNAME": "YOUR_BOT_USERNAME_HERE"
   }
   ```

2. **Actual files (gitignored):** `characters/*.character.json`
   - Created from templates using `scripts/setup-characters.sh`
   - Contains real tokens
   - Never committed to Git

3. **Setup process:**
   ```bash
   # Run setup script
   ./scripts/setup-characters.sh
   
   # Choose option 1 to setup all characters
   # Enter tokens when prompted or load from .env
   ```

## Security Checklist

### Before Committing

- [ ] Run `git status` - ensure no `.env` files listed
- [ ] Check no `characters/*.character.json` files (only `.template` versions)
- [ ] Verify no tokens visible in `git diff`
- [ ] Use `git grep` to search for token patterns:
  ```bash
  git grep -E "sk-[a-zA-Z0-9]{48}" # OpenAI keys
  git grep -E "[0-9]{10}:[a-zA-Z0-9_-]{35}" # Telegram tokens
  ```

### If You Accidentally Commit Secrets

**IMMEDIATE ACTIONS:**

1. **Revoke the exposed credentials immediately:**
   - Telegram: Use @BotFather to revoke tokens
   - OpenAI: Regenerate API keys in dashboard
   - Change any exposed passwords

2. **Remove from Git history:**
   ```bash
   # Remove the file from history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all
   
   # Force push (coordinate with team)
   git push --force --all
   ```

3. **Consider the repository compromised:**
   - Assume any pushed secrets are public
   - Rotate ALL credentials, not just exposed ones

## Development Workflow

### Initial Setup

1. **Clone repository:**
   ```bash
   git clone https://github.com/gaiaaiagent/GAIA.git
   cd GAIA
   ```

2. **Create .env from example:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Setup characters from templates:**
   ```bash
   ./scripts/setup-characters.sh
   ```

### Adding New Characters

1. **Create template first:**
   ```bash
   # Create character with placeholders
   cp characters/example.character.json.template characters/mynew.character.json.template
   ```

2. **Commit only the template:**
   ```bash
   git add characters/mynew.character.json.template
   git commit -m "Add new character template"
   ```

3. **Generate actual file locally:**
   ```bash
   ./scripts/setup-characters.sh
   ```

## Environment Variable Patterns

### Naming Convention

For character-specific settings:
```bash
# Pattern: CATEGORY_CHARACTERNAME_SETTING
TELEGRAM_BOT_TOKEN_GOVERNOR=...
TELEGRAM_BOT_USERNAME_GOVERNOR=...
```

### Loading Priority

1. **System environment variables** (highest)
2. **`.env` file variables**
3. **Character file `secrets` section**
4. **Character file `settings` section** (lowest)

## CI/CD Considerations

### GitHub Actions

**Never use secrets in workflow files directly:**

```yaml
# BAD - Don't do this
env:
  OPENAI_API_KEY: sk-proj-xxxxx

# GOOD - Use GitHub Secrets
env:
  OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### Deployment

**For production deployment:**

1. Use environment variables injected at runtime
2. Use secret management services (AWS Secrets Manager, etc.)
3. Never bake secrets into Docker images
4. Rotate credentials regularly

## Security Tools

### Pre-commit Hooks

Consider adding pre-commit hooks to catch secrets:

```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

### Scanning Commands

Regular security scans:

```bash
# Check for common secret patterns
grep -r "password\|token\|key\|secret" --include="*.json" --include="*.js" --include="*.ts" .

# Check git history
git log -S "TELEGRAM_BOT_TOKEN" --oneline

# Use dedicated tools
npx secretlint "**/*"
```

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. **DO NOT** disclose it publicly
3. **DO** email security concerns to the maintainers
4. **DO** allow time for a fix before disclosure

## Additional Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [12 Factor App - Config](https://12factor.net/config)

---

*Remember: Security is everyone's responsibility. When in doubt, ask before committing.*