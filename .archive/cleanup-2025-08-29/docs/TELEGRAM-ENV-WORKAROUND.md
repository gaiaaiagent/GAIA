# Telegram Bot Environment Variable Workaround

## Issue Description

The ElizaOS Telegram plugin fails to initialize when relying on CHARACTER.* environment variables from the .env file, even though the loader.ts code suggests it should work.

### Root Cause

There's an initialization order issue where:
1. The Telegram plugin validates bot tokens during initialization
2. CHARACTER.* environment variables are processed by the loader
3. But the Telegram client initialization happens before CHARACTER.* variables are fully available to `runtime.getSetting()`

### Symptoms

Without manual environment injection:
- Telegram send handler registers successfully
- But Telegram client never starts
- No error messages (silent failure)
- Bot tokens from CHARACTER.* pattern are not accessible via `runtime.getSetting()`

## The Workaround

### Manual Environment Injection in Startup Script

The `start-all-agents.sh` script manually injects CHARACTER.* environment variables for each agent:

```bash
# For each agent, explicitly set environment variables
REGENAI_ENV="CHARACTER.REGENAI.TELEGRAM_BOT_TOKEN=xxx CHARACTER.REGENAI.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true"
GOVERNOR_ENV="CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN=yyy CHARACTER.GOVERNOR.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true"

# Start agent with manual injection
env $BASE_ENV $agent_env bun packages/cli/dist/index.js start --character $character_file
```

### Why This Works

By manually setting CHARACTER.* as environment variables at process start:
1. They're available immediately when the process starts
2. The Telegram plugin can access them during initialization
3. The bot tokens are found and Telegram clients start successfully

## Configuration Files

### .env File
Still contains CHARACTER.* entries for documentation and future compatibility:
```env
CHARACTER.AGENT_NAME.TELEGRAM_BOT_TOKEN=<your-bot-token-here>
CHARACTER.AGENT_NAME.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.REGENAI.TELEGRAM_RANDOM_RESPONSE_RATE=0.01
```

### Character Files
Should have empty secrets and Telegram in clients list:
```json
{
  "name": "Governor",
  "plugins": ["@elizaos/plugin-telegram"],
  "secrets": {},
  "settings": {
    "clients": ["telegram"]
  }
}
```

## Testing the Issue

### Without Manual Injection (Fails)
```bash
bun packages/cli/dist/index.js start --character governor.character.json
# Result: Telegram handler registers but client never starts
```

### With Manual Injection (Works)
```bash
env CHARACTER.GOVERNOR.TELEGRAM_BOT_TOKEN=xxx bun packages/cli/dist/index.js start --character governor.character.json
# Result: Telegram client starts successfully
```

## Future Fix

The ideal solution would be to fix the initialization order in ElizaOS so that:
1. CHARACTER.* variables are processed first
2. Then plugins are initialized
3. So runtime.getSetting() can find CHARACTER.* values during plugin init

Until then, the manual injection workaround in the startup script is necessary and functional.

## Plugin Versions

- Using fork: `@elizaos/plugin-telegram: "https://github.com/gaiaaiagent/plugin-telegram.git#1.x"`
- Mention detection in: `@elizaos/plugin-bootstrap/src/utils/mentionDetection.ts`

## Summary

This is a pragmatic workaround for an ElizaOS initialization order issue. The manual environment injection ensures Telegram bots work reliably with mention-only mode enabled.