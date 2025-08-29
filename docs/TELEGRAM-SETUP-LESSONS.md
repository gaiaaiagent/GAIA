# Telegram Bot Setup - Lessons Learned

## Session Date: August 29, 2025

This document captures critical lessons learned while setting up Telegram bots for the RegenAI agents using ElizaOS with mention-only mode.

## Key Discoveries

### 1. ElizaOS Character Configuration Structure

**Problem:** Initial setup had inconsistent configuration across character files.

**Solution:** Standardized configuration approach:
```json
{
  "name": "CharacterName",
  "plugins": ["@elizaos/plugin-telegram"],
  "secrets": {},  // Keep empty - use environment variables
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true
  }
}
```

**Key Learning:** Never hardcode tokens in character files. Use environment variables exclusively.

### 2. Environment Variable Timing Issue

**Problem:** ElizaOS loads character-specific environment variables (CHARACTER.*) AFTER plugin initialization, causing Telegram bots to fail with "Bot Token not provided" errors.

**Root Cause:** 
- Telegram plugin needs bot token during initialization
- CHARACTER.* variables are injected after plugins are loaded
- This timing mismatch causes connection failures

**Workaround:** Manually inject environment variables in the startup script:
```bash
CHARACTER.ADVOCATE.TELEGRAM_BOT_TOKEN=<token> \
CHARACTER.ADVOCATE.TELEGRAM_BOT_USERNAME=RegenAdvocacyBot \
bun packages/cli/dist/index.js start --character advocate.character.json
```

### 3. Character Name Sensitivity

**Critical Discovery:** The CHARACTER.* environment variable prefix MUST match the character's "name" field exactly.

**Example of Issue:**
- Character file has: `"name": "Narrator"`
- Environment uses: `CHARACTER.NARRATIVE.*`
- Result: Configuration not found

**Correct Usage:**
- Character file: `"name": "Narrator"`
- Environment: `CHARACTER.NARRATOR.*`

### 4. Mention Detection Requirements

**Problem:** Bots weren't detecting @mentions correctly.

**Root Cause:** The mention detection logic needs to know the actual Telegram bot username (@RegenAdvocacyBot), not just the character name (Advocate).

**Solution:** Provide TELEGRAM_BOT_USERNAME in environment:
```bash
CHARACTER.ADVOCATE.TELEGRAM_BOT_USERNAME=RegenAdvocacyBot
```

### 5. Never Hardcode Project-Specific Logic in Core Code

**Bad Practice Found:** The plugin-bootstrap mention detection had hardcoded logic:
```typescript
if (agentName === 'governor') {
  telegramBotUsername = 'regengovernbot';
}
```

**Lesson:** Core ElizaOS packages should NEVER contain project-specific hardcoded values. Always use configuration.

### 6. Response Discarding with Rapid Messages

**Issue:** When multiple bots are mentioned quickly in succession, they generate responses but discard them when newer messages arrive.

**Log Message:** "Response discarded - newer message being processed"

**Cause:** ElizaOS agents prioritize processing the newest message and discard pending responses.

**Solution:** 
- Space out mentions when testing multiple bots
- Test bots individually or in separate conversations
- Allow time for responses before sending new messages

## Correct Configuration Summary

### For Each Telegram Bot Agent:

1. **Character File Requirements:**
   - Include `@elizaos/plugin-telegram` in plugins
   - Set `"secrets": {}` (empty)
   - Add `"clients": ["telegram"]` to settings
   - Set `"allowDirectMessages": true`

2. **Environment Variables Required:**
   - `CHARACTER.<NAME>.TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
   - `CHARACTER.<NAME>.TELEGRAM_BOT_USERNAME` - Bot username (without @)
   - `CHARACTER.<NAME>.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED` - true/false
   - `CHARACTER.<NAME>.TELEGRAM_RANDOM_RESPONSE_RATE` - 0.0 to 1.0

3. **Startup Script Pattern:**
   ```bash
   AGENT_ENV="CHARACTER.<NAME>.TELEGRAM_BOT_TOKEN=xxx \
              CHARACTER.<NAME>.TELEGRAM_BOT_USERNAME=BotUsername \
              CHARACTER.<NAME>.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true \
              CHARACTER.<NAME>.TELEGRAM_RANDOM_RESPONSE_RATE=0.01"
   
   env $BASE_ENV $AGENT_ENV bun packages/cli/dist/index.js start \
       --character characters/agent.character.json
   ```

## Testing Checklist

- [ ] Verify character "name" field matches CHARACTER.* prefix
- [ ] Check logs for "Bot info" message confirming connection
- [ ] Test @mentions individually with spacing
- [ ] Verify DMs always get responses
- [ ] Confirm random responses work (may need multiple messages)
- [ ] Ensure no hardcoded tokens in character files
- [ ] Validate bot usernames match Telegram registration

## Common Error Messages and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Telegram Bot Token not provided" | CHARACTER.* vars not available during init | Use startup script env injection |
| "Response discarded - newer message being processed" | Multiple rapid messages | Space out messages |
| No response to @mention | Missing TELEGRAM_BOT_USERNAME | Add to environment variables |
| Bot responds to wrong mentions | Character name mismatch | Fix CHARACTER.* prefix |

## Recommendations for ElizaOS Improvements

1. Load character-specific environment variables before plugin initialization
2. Provide clearer documentation on CHARACTER.* variable timing
3. Add validation to warn when TELEGRAM_BOT_USERNAME is missing
4. Consider adding a pre-initialization hook for environment setup
5. Never include project-specific hardcoded values in core packages

## Files Modified in This Session

- `/opt/projects/GAIA/characters/advocate.character.json` - Standardized configuration
- `/opt/projects/GAIA/characters/voiceofnature.character.json` - Standardized configuration
- `/opt/projects/GAIA/characters/narrative.character.json` - Standardized configuration
- `/opt/projects/GAIA/start-all-agents.sh` - Added bot username env vars, fixed CHARACTER.NARRATOR
- `/opt/projects/GAIA/packages/plugin-bootstrap/src/utils/mentionDetection.ts` - Removed hardcoded Governor logic

## Security Notes

- Never commit bot tokens to version control
- Use environment variables or secure secrets management
- Tokens should only exist in `.env` files (gitignored) or secure deployment configs
- The startup script in this repo has tokens that should be moved to `.env` before production use