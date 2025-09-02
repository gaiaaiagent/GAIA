# Server Deployment Notes - Telemetry & Model Configuration

## Changes Pushed to `regen-telemetry` Branch

### 1. Telemetry System Implementation
- Complete telemetry infrastructure with correlation IDs
- Performance monitoring for LLM calls and provider execution  
- Memory usage tracking
- Configurable via environment variables

### 2. Required Environment Variable Updates for Server

Add these to your server's `.env` file:

```bash
# Model Configuration (CRITICAL - fixes slow shouldRespond calls)
OPENAI_SMALL_MODEL=gpt-4o-mini
OPENAI_LARGE_MODEL=gpt-4o

# Telemetry Configuration (Optional - for performance monitoring)
LOG_LEVEL=debug
LOG_TELEMETRY=true
LOG_PROMPTS=true
LOG_PROVIDERS=true
LOG_ACTIONS=true
LOG_CORRELATION=true
LOG_MEMORY_USAGE=true
LOG_TIMING_THRESHOLD=50
```

## Expected Performance Improvements

### Before (using non-existent gpt-5-nano):
- shouldRespond calls: 556ms (due to model errors/retries)
- Total message processing: ~600ms

### After (using gpt-4o-mini):
- shouldRespond calls: ~50-100ms 
- Total message processing: ~80-120ms
- **Expected speedup: 5-7x faster**

## Deployment Instructions

1. **Pull latest changes:**
   ```bash
   cd /opt/projects/GAIA
   git checkout regen-telemetry  
   git pull
   ```

2. **Update .env file with the model configuration above**

3. **Rebuild if needed:**
   ```bash
   bun install
   bun run build
   ```

4. **Restart agents:**
   ```bash
   sudo pkill -f 'packages/cli/dist/index.js'
   bash /opt/projects/GAIA/start-all-agents-single-process.sh
   ```

5. **Test performance:**
   - Send a message to any agent
   - Check logs for telemetry data showing improved response times

## Verification

Look for these log entries indicating success:
- `[OpenAI] Using TEXT_SMALL model: gpt-4o-mini`
- `shouldRespond_useModel` spans completing in <100ms
- Overall message processing under 200ms

The telemetry will show exact timing breakdowns for all operations.