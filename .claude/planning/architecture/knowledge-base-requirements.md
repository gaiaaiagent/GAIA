---
rid: koi:architecture:knowledge-base-requirements
last-updated: 2024-01-15
confidence: high
related:
  - koi:planning:milestone-1.1.1
  - koi:architecture:koi-integration
---

# RegenAI Knowledge Base Requirements

Based on comprehensive resource catalogue from Claude Web agent.

## Scope Summary

### Scale

- **15,000+ documents** from Regen Network ecosystem
- **100,000+ interactions** target for Phase 1 (60 days)
- **1,000,000+ interactions** target for Phase 2
- **4 distinct agents** across multiple platforms

### Budget & Timeline

- **$25,000** for Phase 1 (60 days)
- **7.5M REGEN tokens** (24-month vesting)
- **6 milestones** with specific deliverables

## Knowledge Architecture Requirements

### 1. Data Sources (Priority Order)

#### Tier 1: Core Technical Documentation

- **docs.regen.network** - Technical documentation
- **registry.regen.network** - ALL credit classes, methodologies, projects
- **Regen Ledger GitHub** - Code + documentation

#### Tier 2: Community & Communications

- **forum.regen.network** - Historical discussions
- **Discord history** - Community conversations
- **blog.regen.network** - Official updates
- **Planetary Regeneration Podcast** - Transcripts

#### Tier 3: Governance & Strategy

- **DAODAO proposals** - Governance decisions
- **Token Economics Working Group** - Economic models
- **Partnership documents** - Strategic context

### 2. Technical Architecture

#### ElizaOS Knowledge System

```yaml
storage:
  primary: ElizaOS built-in knowledge management
  database: PostgreSQL (via Drizzle ORM)
  memory: Agent-specific UUID namespacing

knowledge_format:
  structure: ElizaOS knowledge array in character files
  citations: KOI RIDs embedded in knowledge entries
  organization: Topic-based clustering

integration:
  providers: Custom providers for dynamic knowledge
  actions: Knowledge query actions
  evaluators: Citation verification evaluators
```

#### Processing Pipeline

1. **Document Processing**: Convert sources to ElizaOS knowledge format
2. **Knowledge Structuring**: Organize by topic and relevance
3. **Character Integration**: Embed in character files or dynamic providers
4. **RID Assignment**: KOI semantic identifiers for traceability
5. **Memory Storage**: PostgreSQL for persistent agent memories

### 3. Agent-Specific Knowledge Domains

#### RegenAI Facilitator

- Complete project documentation
- All milestone deliverables
- Technical architecture
- Partnership agreements

#### Narrative Agent

- Blog posts and articles
- Podcast transcripts
- Marketing materials
- Success stories

#### Politician Agent

- Governance proposals
- Token economics
- DAO discussions
- Policy documents

#### Advocate Agent

- Credit methodologies
- Project case studies
- Impact metrics
- Community campaigns

#### Voice of Nature

- Philosophical writings
- Indigenous perspectives
- Ecological wisdom
- Regenerative principles

### 4. ElizaOS Implementation Strategy

#### Character File Structure

```json
{
  "name": "RegenAI Facilitator",
  "knowledge": [
    {
      "content": "Regen Network uses NCT tokens for...",
      "rid": "koi:registry:nct-methodology:v1",
      "source": "registry.regen.network/credit-classes/C01",
      "confidence": "high"
    }
  ],
  "plugins": ["@elizaos/plugin-knowledge-regen"]
}
```

#### Dynamic Knowledge Provider

- Create custom ElizaOS provider for real-time knowledge queries
- Connect to Registry API for live data
- Implement caching layer for performance

#### Knowledge Actions

- `QUERY_REGISTRY`: Live credit data
- `SEARCH_DOCS`: Documentation search
- `VERIFY_CLAIM`: Citation checking
- `UPDATE_KNOWLEDGE`: Learn from interactions

### 5. Critical Integration Points

#### Registry API Provider

- Real-time credit availability
- Project metadata queries
- Vintage information
- Pricing data access

#### KOI Integration

- Embed RIDs in all knowledge entries
- Citation chain for verification
- Semantic relationships between knowledge

#### Memory System

- PostgreSQL with agent UUID namespacing
- Conversation context retention
- Learning from user interactions
- Knowledge evolution tracking

### 6. Performance Requirements

#### Query Response

- < 2 second response time
- Leverage ElizaOS caching
- Efficient knowledge indexing

#### Update Mechanisms

- Static knowledge in character files
- Dynamic updates via providers
- Memory-based learning

#### Accuracy Metrics

- 95%+ citation accuracy
- KOI RID verification
- Source tracking for all claims

## Implementation Priorities

### Week 1 (M1.1): Foundation

1. Create ElizaOS knowledge processing scripts
2. Convert Tier 1 sources to knowledge format
3. Implement KOI RID system
4. Create base character files with knowledge

### Week 2 (M1.1): Knowledge Loading

1. Process registry.regen.network completely
2. Build custom knowledge provider plugin
3. Create agent-specific knowledge sets
4. Implement citation system

### Week 3-4 (M1.2): Agent Integration

1. Deploy agents with knowledge
2. Connect Registry API provider
3. Test knowledge queries
4. Optimize response times

## ElizaOS-Specific Considerations

### Knowledge Organization

- Use ElizaOS's native knowledge array format
- Implement topic-based clustering
- Create knowledge hierarchies
- Enable cross-agent knowledge sharing

### Provider Development

```typescript
// Custom Regen Knowledge Provider
class RegenKnowledgeProvider implements Provider {
  async get(query: string): Promise<Knowledge[]> {
    // Query logic with KOI RID tracking
  }
}
```

### Memory Integration

- Leverage ElizaOS memory system
- Store learned knowledge in PostgreSQL
- Use agent UUID namespacing
- Enable knowledge evolution

## Quality Assurance

### Verification Requirements

- KOI RID on every knowledge entry
- ElizaOS native citation format
- Provider-based verification
- Character file validation

### Testing Strategy

- Test knowledge queries in ElizaOS runtime
- Verify citation accuracy
- Load test with multiple agents
- Integration tests with providers

## Resource Allocation

### Development Time

- Knowledge conversion: 40 hours
- Provider development: 40 hours
- Character integration: 30 hours
- Testing & optimization: 30 hours

### ElizaOS Resources

- PostgreSQL instance
- ElizaOS runtime per agent
- Provider plugin development
- Character file management

## Next Steps

1. **Immediate**: Study ElizaOS knowledge system in depth
2. **Today**: Create knowledge conversion scripts
3. **Tomorrow**: Begin processing Tier 1 documents
4. **This Week**: Complete M1.1 deliverables

---

_This document reflects the ElizaOS-native approach to knowledge management._
