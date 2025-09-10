# Local Test Setup for Knowledge Processing

## What We're Testing

1. **Symlink Support**: Plugin-knowledge can follow symlinks to process files
2. **Selective Knowledge**: Different agents get different knowledge subsets
3. **Incomplete Document Fix**: Documents with no fragments get reprocessed
4. **Ollama Embeddings**: Local, free embeddings with nomic-embed-text
5. **Processing Speed**: With 13,000+ documents

## Test Configuration

### Knowledge Structure
```
test-knowledge/
├── governor/           # Full knowledge (13,053 files)
│   ├── governance/ -> ../../knowledge/regen-network/governance
│   ├── community/  -> ../../knowledge/regen-network/community
│   ├── ecological/ -> ../../knowledge/regen-network/ecological
│   ├── notion/     -> ../../knowledge/regen-network/notion
│   ├── shared/     -> ../../knowledge/regen-network/shared
│   ├── social/     -> ../../knowledge/regen-network/social
│   └── technical/  -> ../../knowledge/regen-network/technical
└── other-agents/      # No governance (12,889 files)
    ├── community/  -> ../../knowledge/regen-network/community
    ├── ecological/ -> ../../knowledge/regen-network/ecological
    ├── notion/     -> ../../knowledge/regen-network/notion
    ├── shared/     -> ../../knowledge/regen-network/shared
    ├── social/     -> ../../knowledge/regen-network/social
    └── technical/  -> ../../knowledge/regen-network/technical
```

### Agent Configuration
- **Governor**: Gets all knowledge including governance docs
- **RegenAI**: Gets all knowledge EXCEPT governance docs

### Environment (.env.test)
- Embeddings: Ollama (local) with nomic-embed-text
- Text Generation: OpenAI gpt-4o-mini
- Database: Local SQLite (test-db)

## Running the Test

```bash
# Start the test
./test-symlink-knowledge.sh

# Monitor logs in another terminal
tail -f logs/test-governor.log
tail -f logs/test-other.log

# Check for issues
grep -E "ERROR|INCOMPLETE DOC|symlink" logs/test-*.log
```

## Expected Results

1. **Symlinks Work**: Files are found and processed through symlinks
2. **Correct File Counts**: 
   - Governor processes 13,053 files
   - RegenAI processes 12,889 files
3. **Processing Speed**: ~10-20 files/second with Ollama
4. **Incomplete Docs**: Any incomplete documents are detected and reprocessed
5. **No Errors**: No symlink errors or processing failures

## What We Fixed

1. **Incomplete Document Handling**: 
   - Detects documents with no fragments
   - Deletes and reprocesses them
   - Fixes the 17,841 incomplete documents on production

2. **Symlink Support**:
   - Plugin follows symlinks correctly
   - Handles broken symlinks gracefully
   - Allows flexible knowledge organization

3. **Performance**:
   - 20,000 record limit instead of fetching all
   - Local Ollama embeddings (free, fast)
   - Optimized queries