# Telegram Mention-Only Mode

This document describes the mention-only response mode for Telegram bots in the RegenAI/GAIA project.

## Overview

The mention-only mode allows Telegram bots to respond only when directly mentioned, in DMs, or through configurable random responses. This reduces spam in group chats while maintaining natural conversation flow.

## Features

### 🎯 **Mention Detection**
- **Direct mentions**: `@BotName` or `@username`
- **Name mentions**: `BotName what do you think?`
- **Telegram entities**: Uses Telegram's native mention detection
- **DM support**: Always responds in direct messages
- **Case insensitive**: Works with any capitalization

### ⚡ **Performance Benefits**
- **Faster**: Programmatic detection bypasses expensive LLM shouldRespond calls
- **Cheaper**: Significantly reduces API costs by avoiding unnecessary LLM requests
- **Reliable**: Consistent, predictable mention detection vs LLM-based analysis

### 🎲 **Organic Conversation**
- **Random responses**: Configurable probability (default 1%) to respond without mentions
- **Prevents silence**: Keeps conversations natural and engaging
- **Fully configurable**: Set rate per agent (0.0 = never, 0.05 = 5% chance)

## Configuration

### Environment Variables

Add these settings to your `.env` file using the ElizaOS character-specific pattern:

```bash
# Enable mention-only mode for specific agents
CHARACTER.GOVERNOR.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.GOVERNOR.TELEGRAM_RANDOM_RESPONSE_RATE=0.01

CHARACTER.REGENAI.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.REGENAI.TELEGRAM_RANDOM_RESPONSE_RATE=0.02

CHARACTER.ADVOCATE.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.ADVOCATE.TELEGRAM_RANDOM_RESPONSE_RATE=0.005
```

### Character File Requirements

Ensure your character files include the Telegram plugin:

```json
{
  "name": "Governor",
  "username": "governor", 
  "plugins": [
    "@elizaos/plugin-bootstrap",
    "@elizaos/plugin-telegram",
    "@elizaos/plugin-sql",
    "@elizaos/plugin-openai",
    "@elizaos/plugin-knowledge"
  ],
  "settings": {
    "clients": ["telegram"],
    "allowDirectMessages": true
  }
}
```

## Bot Username Mapping

The system automatically detects mentions for known bot username mappings:

- **Governor agent** (`name: "Governor"`) → Detects `@RegenGovernBot`
- **Custom mapping**: Set `CHARACTER.{AGENT}.TELEGRAM_BOT_USERNAME` in environment

## Testing

### Expected Behavior

**✅ Should Respond:**
- `"@RegenGovernBot can you help?"` (direct mention)
- `"Governor what's the status?"` (name mention)  
- `"Hello there"` in DM (always respond in DMs)
- Random 1% of non-mentions (organic conversation)

**❌ Should NOT Respond:**
- `"can you still hear me?"` (no mention, no random trigger)
- `"what do you all think?"` (generic group message)

### Debug Logging

The system provides detailed debug logs for troubleshooting:

```
[MentionDetection] Agent: "Governor" | Message: "can you help @RegenGovernBot" | 
Source: telegram | Mentioned: true (direct, confidence: 1.0)
[MentionDetection] Not skipping - bot was mentioned
```

## Implementation Details

### Core Components

1. **`mentionDetection.ts`**: Core logic for detecting mentions and random responses
2. **Bootstrap integration**: Checks mentions before expensive LLM shouldRespond logic
3. **Environment loading**: Uses ElizaOS character-specific environment variable pattern

### Detection Priority

1. **DM check**: Always respond in direct messages
2. **Source filter**: Skip if not from Telegram
3. **Entity parsing**: Check Telegram mention entities (most reliable)
4. **Text analysis**: Fallback to text-based mention detection
5. **Random response**: Check probability if no mention detected

### Mention Types

- `dm`: Direct message (confidence: 1.0)
- `direct`: `@username` mention (confidence: 1.0)
- `name`: Name mentioned in text (confidence: 0.9)
- `username`: Username in text without @ (confidence: 0.7)
- `none`: No mention detected (confidence: 0.0)

## Troubleshooting

### Common Issues

1. **Bot not responding to mentions**
   - Check environment variables are set correctly
   - Verify bot username mapping is correct
   - Check debug logs for mention detection results

2. **Bot responding to non-mentions**  
   - Verify `TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true`
   - Check if random responses are triggering (reduce rate)
   - Ensure agent is properly restarted after config changes

3. **Environment variables not loading**
   - Follow ElizaOS pattern: `CHARACTER.{NAME}.{SETTING}`
   - Character name should match exactly (case sensitive)
   - Restart agent after environment changes

### Debug Commands

```bash
# Check if agent is running with correct config
ps aux | grep "packages/cli/dist/index.js start.*governor"

# View logs with mention detection info
tail -f logs/governor.log | grep MentionDetection

# Test environment variable loading
echo $CHARACTER.GOVERNOR.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED
```

## Deployment

1. **Update `.env`** with character-specific settings
2. **Restart agents** to load new configuration  
3. **Test functionality** with mention and non-mention messages
4. **Monitor logs** for mention detection debug information

## Contributing

When extending this feature:

1. **Follow ElizaOS patterns** for configuration and plugin structure
2. **Add comprehensive logging** for debugging
3. **Update documentation** with new configuration options
4. **Test thoroughly** with different mention scenarios
5. **Consider backwards compatibility** when making changes

---

*This feature addresses [GitHub Issue #9](https://github.com/gaiaaiagent/GAIA/issues/9) - Telegram bots mention-only response mode.*