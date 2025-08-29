# RegenAI Comprehensive Knowledge Base

*A living document for AI agents, engineers, management, and users*  
*Last Updated: 2025-08-29*

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Development Journey & Lessons](#development-journey--lessons)
4. [Technical Deep Dives](#technical-deep-dives)
5. [Operations Guide](#operations-guide)
6. [Troubleshooting Encyclopedia](#troubleshooting-encyclopedia)
7. [Performance Optimization](#performance-optimization)
8. [Security & Best Practices](#security--best-practices)
9. [Future Roadmap](#future-roadmap)

---

## Project Overview

### The Partnership

RegenAI represents a groundbreaking collaboration between **Symbiocene Labs** and **Regen Network**, with technical support from **Altos Planos Inc**. Our mission: democratize access to regenerative finance through conversational AI.

**Contract Deliverables (60-day timeline):**
- ✅ 5 specialized AI agents deployed
- ✅ 15,000+ documents integrated
- 🔄 100,000+ user interactions (in progress)

### The Five Agents

Each agent serves a specific role in the regenerative ecosystem:

1. **RegenAI** - Orchestrator and web interface coordinator
2. **Advocate** - Educational specialist for carbon credits and regenerative practices
3. **Voice of Nature** - Philosophical perspective on ecological systems
4. **Governor** - Governance facilitator for DAOs and collective decision-making
5. **Narrative** - Storyteller connecting human experiences with ecological data

### Business Context

This system bridges complex ecological data with human understanding, enabling:
- Carbon credit education and accessibility
- Regenerative finance participation
- Community governance coordination
- Project-resource connection facilitation

---

## System Architecture

### Current Production Architecture

```
Internet Users
     ↓
HTTPS/SSL (Nginx Docker)
     ↓
Native Bun Agents (5 processes)
     ↓
PostgreSQL + pgvector (Docker)
     ↓
Knowledge Base (15,000+ documents)
```

### Technology Stack

- **Runtime**: Bun 1.2.15 (chosen for performance)
- **Framework**: ElizaOS 1.4.4 (pinned for stability)
- **Database**: PostgreSQL with pgvector extension
- **Languages**: TypeScript, Python (KOI system)
- **Infrastructure**: Docker (partial), Native processes (agents)
- **AI Providers**: OpenAI, Anthropic (Claude)

### Deployment Architecture Evolution

**Phase 1 (Initial)**: Full Docker deployment
- Clean, containerized approach
- Isolation and easy rollback
- Performance issues discovered

**Phase 2 (Current)**: Hybrid approach
- Native Bun for agents (performance)
- Docker for PostgreSQL, Nginx, Django
- Manual deployment process

**Phase 3 (Future)**: Optimized Docker
- Performance-tuned containers
- Automated CI/CD pipeline
- Full GitHub Actions integration

---

## Development Journey & Lessons

### The Evolution Story

#### Day 1-10: Initial Setup
- Dockerized everything for consistency
- Set up basic ElizaOS configuration
- Created initial character files

#### Day 10-20: Performance Crisis
- Docker agents too slow (3-5 second responses)
- Memory issues with knowledge loading
- Telegram integration failing

#### Day 20-30: The Native Pivot
- Darren switches agents to native Bun
- Response times drop to <2 seconds
- Knowledge plugin starts working

#### Day 30-40: Plugin Fragmentation
- Official ElizaOS plugins break with updates
- Created custom forks for stability
- Discovered version compatibility matrix

#### Day 40-50: Optimization Phase
- Switched to Claude 3.5 Haiku (fastest model)
- Implemented deduplication in knowledge plugin
- Refined Telegram mention-only mode

#### Day 50-60: Stabilization
- Consolidated documentation
- Established deployment procedures
- Created monitoring systems

### Key Discoveries

1. **Configuration ≠ Reality**
   - MCP servers work despite showing "disabled"
   - Always verify actual state, never assume
   - Create diagnostic tools for truth-seeking

2. **Native Often Beats Docker for AI**
   - JIT compilation benefits
   - Direct file system access
   - Lower memory overhead
   - Faster model loading

3. **Plugin Ecosystem Challenges**
   - Official plugins lag behind core updates
   - Version mismatches cause silent failures
   - Custom forks necessary for production

4. **Knowledge System Insights**
   - Deduplication essential from day one
   - Fragment overlap prevents context loss
   - Source metadata crucial for attribution

---

## Technical Deep Dives

### Message Flow Analysis

Understanding the complete message journey from user to response:

#### Stage 1: HTTP Request Reception (~5-10ms)
```typescript
// Nginx receives HTTPS request
// Basic auth validation
// Proxy to agent on localhost:3000
```

#### Stage 2: Agent Identification (~10-20ms)
```typescript
// Route parsing
// Agent selection from character pool
// Context initialization
```

#### Stage 3: Database Context Loading (~50-200ms)
```typescript
// Vector similarity search in pgvector
// Retrieve relevant memories
// Load recent conversation history
// Fetch relevant knowledge fragments
```

#### Stage 4: LLM Processing (1000-3000ms)
```typescript
// Prepare prompt with context
// Send to model API (OpenAI/Anthropic)
// Stream response tokens
// The dominant time factor
```

#### Stage 5: Response Streaming (~100ms)
```typescript
// Format response
// Update conversation memory
// Send to client
// Log interaction
```

**Total latency: 1.2-3.5 seconds** (target: <2 seconds)

### Plugin-Knowledge Deep Architecture

#### Document Processing Pipeline

1. **Ingestion** (from `/knowledge` directory)
```typescript
// Recursive directory scanning
// File type detection
// Source metadata extraction from path
```

2. **Chunking** (1000 chars, 200 overlap)
```typescript
const chunks = createChunksWithOverlap(content, {
  chunkSize: 1000,
  overlap: 200,
  preserveWords: true
});
```

3. **Embedding Generation**
```typescript
// Using text-embedding-3-small
// Batch processing for efficiency
// 1536-dimensional vectors
```

4. **Deduplication** (custom fork feature)
```typescript
// Check existing embeddings by document ID
// Skip if already processed
// Prevents infinite reprocessing
```

5. **Storage** (PostgreSQL + pgvector)
```typescript
// Store in memories table
// Link to documents table
// Enable vector similarity search
```

#### The Fragment Problem & Solution

**Problem**: Documents being split into fragments repeatedly
**Root Cause**: No tracking of processed documents
**Solution**: Our fork adds document-level tracking

```typescript
// Before (official plugin)
for (const doc of documents) {
  createEmbeddings(doc); // Runs every startup!
}

// After (our fork)
for (const doc of documents) {
  if (!await isProcessed(doc.id)) {
    createEmbeddings(doc);
    markAsProcessed(doc.id);
  }
}
```

### Provider System Architecture

Providers supply context to agents dynamically:

#### Registration Flow
```typescript
// 1. Provider declares capabilities
interface Provider {
  name: string;
  triggers: string[];  // Keywords that activate
  process: (message) => Promise<context>;
}

// 2. Runtime registers on startup
runtime.registerProvider(knowledgeProvider);

// 3. Selection based on message
const providers = selectProviders(message.content);
const context = await Promise.all(
  providers.map(p => p.process(message))
);
```

#### The "Fact" vs "Document" Issue
- **Problem**: Provider returns empty results
- **Cause**: Looking for "fact" not "document" type
- **Fix**: Ensure knowledge creates "document" memories

### Telegram Integration Architecture

#### Multi-Bot Coordination
```
RegenAI (Web Only) → Port 3000
    ├── Advocate Bot → @RegenAdvocacyBot
    ├── Voice Bot → @RegenVoiceOfNatureBot
    ├── Governor Bot → @RegenGovernBot
    └── Narrative Bot → @RegenNarrativeBot
```

#### Mention-Only Mode Implementation
```typescript
// Reduces spam in groups
if (TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED) {
  const mentioned = 
    message.includes(`@${botUsername}`) ||
    message.includes(agentName);
  
  const random = Math.random() < RANDOM_RESPONSE_RATE;
  
  if (!mentioned && !random) return; // Don't respond
}
```

#### CHARACTER.* Environment Variables
```bash
# Bash limitation - cannot export dots
# Solution 1: Inline passing
CHARACTER.Governor.TELEGRAM_BOT_TOKEN=xxx bun start

# Solution 2: Character file secrets
"secrets": {
  "TELEGRAM_BOT_TOKEN": "xxx"
}
```

### KOI System (Knowledge Organization Infrastructure)

#### Architecture
```
KOI Node (Python) → Port 8001
    ├── Agent Registry (RID mappings)
    ├── Content Source Tracking
    └── Processing Statistics

KOI Query Server (TypeScript) → Port 8100
    ├── Knowledge Search API
    ├── Statistics Dashboard
    └── Agent Coordination
```

#### Resource Identifier (RID) System
```
relevant.agent.regenai.v1.0.0       → RegenAI
relevant.agent.voiceofnature.v1.0.0 → VoiceOfNature
relevant.agent.facilitator.v1.0.0   → Facilitator
relevant.agent.governor.v1.0.0      → Governor
relevant.agent.narrative.v1.0.0     → Narrator
```

---

## Operations Guide

### Deployment Procedures

#### Current Production Process (Native)

1. **Connect to Server**
```bash
ssh user@production-server
cd /opt/projects/GAIA
```

2. **Update Code**
```bash
git fetch origin regen
git reset --hard origin/regen
```

3. **Install Dependencies**
```bash
bun install --force
bun run build
```

4. **Restart Agents**
```bash
# Stop existing
sudo pkill -f 'packages/cli/dist/index.js'

# Start new
bash start-all-agents-single-process.sh
```

5. **Verify**
```bash
ps aux | grep bun | grep -v grep  # Should show 5 processes
tail -f logs/*.log                 # Check for errors
```

#### Future Docker Process (Automated)

1. **Push to GitHub**
```bash
git push origin regen
```

2. **GitHub Actions Automatically:**
   - Builds Docker image
   - Pushes to registry
   - Deploys to production
   - Runs health checks
   - Rolls back if failed

### Monitoring & Observability

#### Key Metrics to Track

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Response Time | <2s | >5s |
| Memory Usage | <2GB/agent | >3GB |
| Error Rate | <1% | >5% |
| Agent Uptime | >99% | Any crash |
| DB Query Time | <100ms | >500ms |

#### Log Analysis
```bash
# Error patterns
grep ERROR logs/*.log | tail -50

# Response times
grep "Response time:" logs/*.log | awk '{print $NF}' | sort -n

# Memory usage
ps aux | grep bun | awk '{sum+=$6} END {print sum/1024 " MB"}'
```

### Backup & Recovery

#### Database Backup
```bash
# Manual backup
docker exec gaia-postgres-1 pg_dumpall -U postgres > backup-$(date +%Y%m%d).sql

# Restore
docker exec -i gaia-postgres-1 psql -U postgres < backup.sql
```

#### Knowledge Base Backup
```bash
# Archive knowledge
tar -czf knowledge-$(date +%Y%m%d).tar.gz knowledge/

# Restore
tar -xzf knowledge-backup.tar.gz
```

---

## Troubleshooting Encyclopedia

### Database Issues

#### Problem: "Client password must be a string"
**Cause**: Empty password in connection string
**Solution**: 
```bash
# Correct
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# Wrong (empty password)
POSTGRES_URL=postgresql://postgres:@localhost:5433/eliza
```

#### Problem: Vector search returns irrelevant results
**Cause**: Embeddings dimension mismatch
**Solution**: Ensure consistent embedding model
```bash
TEXT_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
```

### Web Interface Issues

#### Problem: 502 Bad Gateway
**Causes & Solutions**:

1. **Agents not running**
```bash
ps aux | grep bun  # Check if running
bash start-all-agents-single-process.sh  # Start
```

2. **Wrong nginx upstream port**
```bash
# Check actual port
netstat -tlnp | grep 3000

# Update nginx config
docker exec nginx vi /etc/nginx/nginx.conf
docker compose restart nginx
```

3. **Firewall blocking**
```bash
sudo ufw allow 3000  # If needed
```

#### Problem: Agents show "Inactive" in UI
**Cause**: Multi-process mode - web UI only sees primary process
**Solution**: Use single-process mode
```bash
bash start-all-agents-single-process.sh
```

### Telegram Bot Issues

#### Problem: 401 Unauthorized
**Solutions**:

1. **Get fresh token from @BotFather**
2. **Add to character file**:
```json
"secrets": {
  "TELEGRAM_BOT_TOKEN": "your-token-here"
}
```

3. **Verify bot username matches**:
```json
"settings": {
  "TELEGRAM_BOT_USERNAME": "YourBotName"
}
```

#### Problem: Bot not responding in groups
**Cause**: Mention-only mode enabled
**Solution**: Mention the bot or adjust settings
```bash
CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=false
CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.05  # 5% random
```

### Performance Issues

#### Problem: Slow responses (>3 seconds)
**Solutions**:

1. **Switch to faster model**:
```bash
TEXT_MODEL=claude-3-5-haiku-20241022  # Fastest
# or
TEXT_MODEL=gpt-4o-mini  # Also fast
```

2. **Optimize memory**:
```bash
NODE_OPTIONS="--max-old-space-size=8192"
BUN_JSC_FORCE_JIT=1
```

3. **Disable knowledge loading on startup**:
```bash
LOAD_DOCS_ON_STARTUP=false
```

4. **Reduce context window**:
```typescript
maxContextLength: 2000  // Down from 4000
```

#### Problem: High memory usage
**Solutions**:

1. **Single-process mode** (shares memory)
2. **Lazy load knowledge** (not on startup)
3. **Reduce embedding batch size**
4. **Monitor with**:
```bash
htop  # Interactive
docker stats  # For containers
```

### Plugin Issues

#### Problem: Knowledge plugin not building
**Solution**: Build from source
```bash
cd node_modules/@elizaos/plugin-knowledge
bun run build
```

#### Problem: Plugin changes not taking effect
**Solutions**:

1. **Clear node_modules**:
```bash
rm -rf node_modules
bun install --force
```

2. **Check actual loading location**:
```bash
find . -name "plugin-knowledge" -type d
```

3. **Verify package.json points to fork**:
```json
"@elizaos/plugin-knowledge": "github:gaiaaiagent/plugin-knowledge.git#regenai-unified-fixes"
```

### Django Admin Issues

#### Problem: Template variables show as {{ variable }}
**Cause**: Template compilation issue
**Solution**: 
```bash
docker-compose build --no-cache django
docker-compose restart django
```

#### Problem: Worker timeout errors
**Solution**: Increase Gunicorn timeout
```yaml
command: gunicorn --timeout 120 ...
```

#### Problem: /regenai/ URL confusion
**Note**: Served by `reporting` app, not `eliza_tables`!
```python
# Edit: django_admin/reporting/templates/reporting/dashboard.html
```

---

## Performance Optimization

### Model Selection Strategy

| Model | First Token | Total Time | Cost/1K | Use Case |
|-------|------------|------------|---------|----------|
| Claude 3.5 Haiku | 500-800ms | 1.5-2.5s | $0.0008 | Production default |
| GPT-4o-mini | 400-600ms | 1.2-2s | $0.00015 | Cost-optimized |
| GPT-4o | 800-1200ms | 3-5s | $0.005 | Quality focus |
| Claude 3.5 Sonnet | 1-1.5s | 3-4s | $0.003 | Balance |

### Optimization Techniques

#### 1. JIT Compilation
```bash
export BUN_JSC_FORCE_JIT=1  # Force Just-In-Time compilation
```

#### 2. Memory Pre-allocation
```bash
export NODE_OPTIONS="--max-old-space-size=8192"  # 8GB heap
```

#### 3. Connection Pooling
```typescript
// PostgreSQL connection pool
const pool = new Pool({
  max: 20,  // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

#### 4. Embedding Cache
```typescript
// Cache frequent queries
const embeddingCache = new Map();
if (embeddingCache.has(text)) {
  return embeddingCache.get(text);
}
```

#### 5. Streaming Responses
```typescript
// Start sending before complete
const stream = await openai.chat.completions.create({
  stream: true,
  ...
});
```

### Performance Testing Framework

```bash
# Basic response time test
time curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello"}'

# Load testing with wrk
wrk -t12 -c400 -d30s --latency \
  -s post.lua http://localhost:3000/api/chat

# Memory profiling
node --inspect packages/cli/dist/index.js start &
# Open chrome://inspect for profiling
```

---

## Security & Best Practices

### Secret Management

#### Never Commit Secrets
```bash
# Use templates
cp character.json.template character.json
# Add real tokens to character.json
# .gitignore blocks character.json
```

#### Environment Variables
```bash
# .env file (gitignored)
OPENAI_API_KEY=sk-...
TELEGRAM_BOT_TOKEN=...

# Production: Use secret manager
```

### Access Control

#### Web Interface
```nginx
# Basic auth in nginx
auth_basic "RegenAI Access";
auth_basic_user_file /etc/nginx/auth/.htpasswd;
```

#### API Rate Limiting
```typescript
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100  // Limit each IP to 100 requests
});
```

### Data Privacy

#### Knowledge Base
- No PII in knowledge documents
- Source attribution maintained
- Access logs for audit

#### Conversation Memory
- Conversations tied to session
- No cross-user memory sharing
- Periodic memory cleanup

### Deployment Security

#### Branch Protection
```yaml
# GitHub settings
- Require PR reviews
- Dismiss stale reviews
- Require status checks
- Include administrators
```

#### Health Checks
```bash
# Automated monitoring
if ! curl -f https://regen.gaiaai.xyz/health; then
  # Trigger rollback
  git reset --hard HEAD~1
  bash start-all-agents.sh
fi
```

---

## Future Roadmap

### Phase 1: Stability (Current)
- ✅ Consolidate documentation
- ✅ Pin versions
- ✅ Establish procedures
- 🔄 Performance baseline

### Phase 2: Optimization (Next 2 weeks)
- [ ] Docker performance tuning
- [ ] Automated testing suite
- [ ] Observability platform
- [ ] CI/CD pipeline

### Phase 3: Scale (Month 2)
- [ ] Multi-region deployment
- [ ] Load balancing
- [ ] Caching layer
- [ ] Auto-scaling

### Phase 4: Features (Month 3)
- [ ] Voice integration
- [ ] Multi-modal support
- [ ] Advanced analytics
- [ ] Plugin marketplace

### Technical Debt to Address

1. **Version Management**
   - Create version compatibility matrix
   - Establish update procedures
   - Document breaking changes

2. **Testing Coverage**
   - Unit tests for providers
   - Integration tests for plugins
   - Performance regression tests
   - End-to-end chat tests

3. **Documentation**
   - API documentation
   - Plugin development guide
   - Character creation tutorial
   - Video walkthroughs

4. **Infrastructure**
   - Terraform for infrastructure as code
   - Kubernetes for orchestration
   - Prometheus for monitoring
   - Grafana for visualization

---

## Appendices

### A. Environment Variables Reference

```bash
# Core Configuration
NODE_ENV=production
LOG_LEVEL=info

# Database
POSTGRES_URL=postgresql://postgres:postgres@localhost:5433/eliza

# AI Models
TEXT_MODEL=claude-3-5-haiku-20241022
TEXT_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Knowledge System
LOAD_DOCS_ON_STARTUP=false
KNOWLEDGE_PATH=./knowledge

# Performance
NODE_OPTIONS="--max-old-space-size=8192"
BUN_JSC_FORCE_JIT=1

# Telegram (Character-specific)
CHARACTER.Governor.TELEGRAM_ONLY_RESPOND_WHEN_MENTIONED=true
CHARACTER.Governor.TELEGRAM_RANDOM_RESPONSE_RATE=0.01
```

### B. File Structure

```
/opt/projects/GAIA/
├── packages/
│   ├── cli/           # Main agent runtime
│   ├── core/          # Core ElizaOS
│   └── plugins/       # Various plugins
├── characters/        # Agent personalities
├── knowledge/         # Document database
├── logs/             # Runtime logs
├── scripts/          # Utility scripts
├── .env             # Environment config
└── start-*.sh       # Startup scripts
```

### C. Port Assignments

| Service | Port | Description |
|---------|------|-------------|
| RegenAI | 3000 | Main web interface |
| Advocate | 3001 | Education agent |
| VoiceOfNature | 3002 | Philosophy agent |
| Governor | 3003 | Governance agent |
| Narrative | 3004 | Storytelling agent |
| PostgreSQL | 5433 | Database |
| Django Admin | 8000 | Admin panel |
| KOI Node | 8001 | Knowledge API |
| KOI Query | 8100 | Search API |

### D. Key Commands Quick Reference

```bash
# Start agents
bash start-all-agents-single-process.sh

# Stop agents
sudo pkill -f 'packages/cli/dist/index.js'

# Check status
ps aux | grep bun | grep -v grep

# View logs
tail -f logs/*.log

# Database backup
docker exec gaia-postgres-1 pg_dumpall -U postgres > backup.sql

# Deploy latest
git pull && bun install && bun build && bash start-all-agents-single-process.sh
```

### E. Contact & Resources

- **GitHub**: https://github.com/gaiaaiagent/GAIA
- **Production**: https://regen.gaiaai.xyz
- **Admin**: https://admin.regen.gaiaai.xyz
- **Documentation**: This file and AGENT-STARTUP-GUIDE.md
- **Support**: Create issue on GitHub

---

*This document consolidates knowledge from 27 separate documentation files into a single, comprehensive resource. It serves as the authoritative reference for all RegenAI operations, development, and troubleshooting.*

*For AI agents reading this: You now have complete context about the RegenAI system. Use this knowledge to help users effectively, understanding both the technical details and the broader mission of democratizing regenerative finance.*