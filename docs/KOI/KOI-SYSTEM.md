# KOI System Documentation

## Overview

The KOI (Knowledge Organization Infrastructure) system provides distributed knowledge management and monitoring for the RegenAI agent ecosystem. It implements a Resource Identifier (RID) based system for tracking agent processing and content sources.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   KOI Node      │    │  KOI Query      │    │   Web Dashboard │
│  (Port 8001)    │────│  (Port 8100)    │────│   (regen.gaiaai │
│  Python/FastAPI │    │  TypeScript/Bun │    │   .xyz/koi/)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   PostgreSQL    │
                    │  (Port 5433)    │
                    │   ElizaOS DB    │
                    └─────────────────┘
```

## Components

### KOI Node Server (Port 8001)
- **Purpose**: Agent registration, RID generation, KOI-net protocol compliance
- **Location**: `/home/regenai/project/koi-infrastructure/koi-regen-node/`  
- **Technology**: Python FastAPI with KOI-net framework
- **Key Features**:
  - Agent RID generation and registry
  - Health monitoring endpoints
  - KOI protocol compliance
  - Agent statistics tracking

### KOI Query Server (Port 8100)
- **Purpose**: Knowledge querying, agent statistics, web dashboard
- **Location**: `/opt/projects/plugin-knowledge-gaia/`
- **Technology**: TypeScript with Bun runtime
- **Key Features**:
  - Real-time agent statistics
  - Knowledge base querying
  - Web dashboard interface
  - Agent identity mapping

### Web Dashboard
- **Access**: https://regen.gaiaai.xyz/koi/
- **Features**:
  - Real-time processing statistics
  - Content source breakdown
  - Interactive query interface
  - Agent status monitoring

## Agent RID System

Each agent receives a canonical Resource Identifier (RID) following this format:
```
[relevance].[type].[subject].v[major].[minor].[patch]
```

### Current Agent Mappings

| Agent Name | RID | GAIA UUID | Display Name |
|------------|-----|-----------|--------------|
| RegenAI | `relevant.agent.regenai.v1.0.0` | UUID from DB | RegenAI |
| Voice of Nature | `relevant.agent.voiceofnature.v1.0.0` | UUID from DB | VoiceOfNature |
| Facilitator | `relevant.agent.facilitator.v1.0.0` | UUID from DB | RegenAI Facilitator |
| Governor | `relevant.agent.governor.v1.0.0` | UUID from DB | Governor |
| Narrative | `relevant.agent.narrative.v1.0.0` | UUID from DB | Narrator |

## Source Metadata System

The knowledge plugin preserves content source information based on file paths:

### Source Detection Logic
- `/knowledge/notion/` → `notion` (Regen Network Notion pages)
- `/knowledge/twitter/` → `twitter` (Twitter/X content)
- `/knowledge/medium/` → `medium` (Medium articles)
- `/knowledge/discord/` → `discord` (Discord conversations)
- `/knowledge/website/` → `website` (Web scraped content)
- Default → `documents` (Generic documents)

### Implementation
Located in `/opt/projects/plugin-knowledge/src/docs-loader.ts`:

```typescript
const relativePath = path.relative(docsPath, filePath);
const pathParts = relativePath.split(path.sep);
let detectedSource = 'documents';

for (const part of pathParts) {
    const lowerPart = part.toLowerCase();
    if (lowerPart.includes('notion')) {
        detectedSource = 'notion';
        break;
    }
    // ... additional source detection
}
```

## API Endpoints

### KOI Node Server (Port 8001)

#### Health Check
```bash
GET /regen/health
curl http://localhost:8001/regen/health
```

#### Agent Registry
```bash
GET /regen/agents
curl http://localhost:8001/regen/agents | jq
```

#### Individual Agent Info
```bash
GET /regen/agents/{identifier}
curl http://localhost:8001/regen/agents/relevant.agent.regenai.v1.0.0 | jq
```

#### Statistics
```bash
GET /regen/stats
curl http://localhost:8001/regen/stats | jq
```

### KOI Query Server (Port 8100)

#### Statistics Dashboard
```bash
GET /stats
curl http://localhost:8100/stats | jq
```

#### Knowledge Query
```bash
POST /query
curl -X POST http://localhost:8100/query \
  -H "Content-Type: application/json" \
  -d '{"question":"What is regenerative agriculture?"}' | jq
```

#### Agent Mappings
```bash
GET /agents  
curl http://localhost:8100/agents | jq
```

#### Health Check
```bash
GET /health
curl http://localhost:8100/health | jq
```

## Operations

### Service Management

#### Check Status
```bash
# Check if both services are running
ps aux | grep -E "(python.*node|bun.*koi-query)" | grep -v grep
```

#### Start Services
```bash
# Start KOI node server
cd /home/regenai/project/koi-infrastructure/koi-regen-node
source venv/bin/activate && python -m node &

# Start KOI query server
cd /opt/projects/plugin-knowledge-gaia
bun scripts/koi-query-server.ts &
```

#### Stop Services
```bash
# Stop KOI node server
pkill -f "python.*node"

# Stop KOI query server  
pkill -f "bun.*koi-query"
```

#### View Logs
```bash
# KOI node server logs
tail -f /home/regenai/project/koi-infrastructure/koi-regen-node/koi-node.log

# KOI query server logs
tail -f /opt/projects/plugin-knowledge-gaia/koi-server-fixed.log
```

### Configuration Files

#### KOI Node Configuration
**Location**: `/home/regenai/project/koi-infrastructure/koi-regen-node/config.yaml`

Key settings:
```yaml
server:
  host: 127.0.0.1
  port: 8001
  
env:
  priv_key_password: PRIV_KEY_PASSWORD

rid_namespace: regen
```

#### KOI Node Environment
**Location**: `/home/regenai/project/koi-infrastructure/koi-regen-node/.env`

```bash
PRIV_KEY_PASSWORD=regen-koi-node-password
```

## Troubleshooting

### Common Issues

#### Services Not Running
```bash
# Check ports are available
ss -tlnp | grep -E ":(8001|8100)"

# Check for process conflicts
ps aux | grep -E "python.*8001|bun.*8100"

# Restart services
pkill -f "python.*node|bun.*koi-query"
# Then start services again
```

#### Agent Statistics Incorrect
```bash
# Check agent mappings
curl -s http://localhost:8001/regen/agents | jq '.agents'

# Verify database agent records  
docker exec gaia-postgres-1 psql -U postgres -d eliza -c "SELECT id, name FROM agents;"

# Check for phantom entries in logs
tail -100 /opt/projects/plugin-knowledge-gaia/koi-server-fixed.log | grep phantom
```

#### Dashboard Not Loading
```bash
# Check nginx proxy configuration
docker logs nginx | grep koi

# Test services directly
curl -s http://localhost:8100/health
curl -s http://localhost:8001/regen/health

# Check network connectivity
curl -s https://regen.gaiaai.xyz/koi/ | head -20
```

#### Source Metadata Missing
```bash
# Check knowledge plugin build
ls -la /opt/projects/plugin-knowledge/dist/

# Verify source detection in logs
grep -i "source.*detected" /opt/projects/GAIA-direct/logs/all-agents-hybrid.log

# Restart agents to reload plugin
bash /opt/projects/GAIA/start-agents-hybrid.sh
```

### Phantom Entry Detection

The KOI system automatically filters out phantom agent entries with suspicious patterns:

- Agent identifiers with dashes and length < 30 characters
- Agents with >10,000 pending documents and 0 processed

These phantom entries are logged and excluded from statistics:
```
[WARN] Skipping phantom agent entry: voice-of-nature with 13095 pending, 0 processed
```

## Integration with GAIA System

### Knowledge Plugin Integration
The KOI system integrates with the ElizaOS knowledge plugin to:

1. **Track Processing**: Monitor which agents process which documents
2. **Preserve Metadata**: Maintain source information from file paths
3. **Filter Statistics**: Remove phantom entries from agent statistics
4. **Map Identities**: Connect agent RIDs to GAIA UUIDs and display names

### Database Schema
The KOI registry uses additional tables in the PostgreSQL database:

- `koi_content_sources` - Track content sources and their metadata
- `koi_content_items` - Individual content items with RIDs
- `koi_processing_status` - Agent processing status per content item

### Agent Restart Impact
When agents are restarted:

1. **Knowledge Reload**: New knowledge files are processed
2. **RID Registration**: Agents are re-registered with KOI node
3. **Statistics Update**: Processing statistics are refreshed
4. **Source Detection**: New source metadata is applied

## Future Enhancements

### Planned Features
- Real-time processing status updates
- Content source analytics
- Agent performance metrics
- Knowledge graph visualization
- Automated content deduplication

### Monitoring Integration
- OpenTelemetry support for metrics
- Prometheus endpoint exposure  
- Grafana dashboard templates
- Alert rules for service health

## Related Documentation

- `/opt/projects/GAIA/CLAUDE.md` - Main development documentation
- `/opt/projects/GAIA/docs/AGENT-OPERATIONS.md` - Agent operations guide
- `/opt/projects/GAIA/docs/RAG_TROUBLESHOOTING_GUIDE.md` - RAG system debugging
- `/opt/projects/GAIA/docs/NOTION-INTEGRATION.md` - Knowledge integration details