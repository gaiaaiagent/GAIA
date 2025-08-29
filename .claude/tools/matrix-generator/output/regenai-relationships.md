# RegenAI-Specific Relationship Analysis

_Generated: 2025-08-27T03:39:16.027Z_

## Critical RegenAI Components Not in Original Taxonomy

### RegenAI File Contexts

#### CLAUDE.md

- **Category**: living-documentation
- **Purpose**: Living guide for AI consciousness and RegenAI development
- **RegenAI Role**: Defines AI behavior, KOI principles, hierarchical memory
- **Critical Dependencies**: packages/core/src/runtime.ts, characters/*.character.json
- **Runtime Behavior**: Agents reference this for behavioral guidance

#### packages/plugin-bootstrap/src/services/embedding.ts

- **Category**: knowledge-processing
- **Purpose**: Asynchronous embedding generation for RAG system
- **RegenAI Role**: Powers contextual knowledge retrieval for 606 Notion pages
- **Critical Dependencies**: packages/core/src/memory.ts, packages/core/src/database.ts
- **Runtime Behavior**: Queue-based processing, 10 embeddings per batch

#### docs/CONTRACT-JDA.md

- **Category**: business-context
- **Purpose**: Joint Development Agreement between Symbiocene Labs and Regen Network
- **RegenAI Role**: Defines 100k interaction target, 5 agent requirement, 60-day timeline
- **Critical Dependencies**: django_admin/contract_tracking/models.py
- **Runtime Behavior**: Milestone tracking and compliance monitoring

#### characters/regenai.character.json

- **Category**: agent-personality
- **Purpose**: RegenAI primary agent character definition
- **RegenAI Role**: Technical bridge between ecology and technology
- **Critical Dependencies**: CLAUDE.md, packages/plugin-bootstrap/src/index.ts
- **Runtime Behavior**: Loaded at runtime, defines agent responses

#### characters/voiceofnature.character.json

- **Category**: agent-personality
- **Purpose**: Voice of Nature agent character definition
- **RegenAI Role**: More-than-human perspective in regenerative economics
- **Critical Dependencies**: CLAUDE.md, packages/plugin-bootstrap/src/index.ts
- **Runtime Behavior**: Philosophical responses, ecological wisdom

#### scripts/start-agents-hybrid.sh

- **Category**: deployment
- **Purpose**: Production agent startup script
- **RegenAI Role**: Launches 5 RegenAI agents with proper environment
- **Critical Dependencies**: docker-compose.yaml, .env
- **Runtime Behavior**: Spawns bun processes, sets KNOWLEDGE_PATH

#### knowledge/README.md

- **Category**: knowledge-base
- **Purpose**: Knowledge organization for 606 Notion pages
- **RegenAI Role**: Defines structure for regenerative knowledge corpus
- **Critical Dependencies**: packages/plugin-bootstrap/src/services/embedding.ts
- **Runtime Behavior**: Recursively loaded at agent startup

#### django_admin/contract_tracking/models.py

- **Category**: monitoring
- **Purpose**: Contract milestone tracking models
- **RegenAI Role**: Tracks progress toward 100k interactions
- **Critical Dependencies**: docs/CONTRACT-JDA.md, django_admin/monitoring/views.py
- **Runtime Behavior**: Real-time milestone monitoring

#### packages/server/src/api/messaging/sessions.ts

- **Category**: multi-agent
- **Purpose**: Session management for multi-agent conversations
- **RegenAI Role**: Enables 5 agents to coordinate in group chats
- **Critical Dependencies**: packages/server/src/socketio/index.ts
- **Runtime Behavior**: WebSocket session orchestration

### RegenAI-Specific Relationships

#### characters/regenai.character.json → knowledge/README.md

**Type**: knowledge-access | **Strength**: 10/10

RegenAI agent directly accesses 606 Notion pages through knowledge base. Character traits determine how ecological and economic knowledge is interpreted and presented.

---

#### docs/CONTRACT-JDA.md → django_admin/contract_tracking/models.py

**Type**: compliance-tracking | **Strength**: 10/10

Contract requirements (100k interactions, 5 agents, 60 days) implemented as Django models for real-time tracking. Critical for meeting Regen Network partnership obligations.

---

#### packages/plugin-bootstrap/src/index.ts → packages/plugin-bootstrap/src/services/embedding.ts

**Type**: service-registration | **Strength**: 10/10

Bootstrap plugin registers EmbeddingGenerationService for async knowledge processing. Critical for non-blocking agent responses while processing 606 documents.

---

#### packages/server/src/api/messaging/sessions.ts → packages/server/src/socketio/index.ts

**Type**: realtime-coordination | **Strength**: 10/10

Session management enables 5 agents to maintain context in group conversations. WebSocket events coordinate agent responses without collision.

---

#### CLAUDE.md → packages/plugin-bootstrap/src/services/embedding.ts

**Type**: knowledge-metabolism | **Strength**: 9/10

CLAUDE.md defines knowledge metabolism principles that embedding service implements through contextual RAG. The hierarchical memory framework in CLAUDE.md directly shapes how embeddings are prioritized and processed.

---

#### scripts/start-agents-hybrid.sh → docker-compose.yaml

**Type**: deployment-orchestration | **Strength**: 9/10

Hybrid deployment strategy: Docker for infrastructure (postgres, nginx), native bun for agents. Script sets KNOWLEDGE_PATH=/opt/projects/GAIA/knowledge for production.

---

#### .env → packages/plugin-bootstrap/src/services/embedding.ts

**Type**: api-configuration | **Strength**: 9/10

OpenAI API keys for embeddings, Gemini for chat. Production uses different models for cost optimization while maintaining quality.

---

#### .claude/planning/features/koi-integration.md → CLAUDE.md

**Type**: koi-principles | **Strength**: 9/10

KOI integration planning implements semantic traceability defined in CLAUDE.md. RID (Resource IDentifier) system enables knowledge graph construction.

---

#### characters/voiceofnature.character.json → characters/facilitator.character.json

**Type**: agent-coordination | **Strength**: 8/10

Voice of Nature provides ecological perspective while Facilitator orchestrates multi-agent collaboration. Together they bridge human and more-than-human perspectives.

---

#### .claude/journal/16-contract-day-one-reality-check.md → docs/CONTRACT-JDA.md

**Type**: reality-tracking | **Strength**: 8/10

Day 1 journal reveals gap between contract ambitions (100k interactions) and reality (0 agents deployed). Documents strategic pivot to quality-first approach.

---

## Key Insights

1. **Knowledge Metabolism**: The embedding service implements CLAUDE.md's knowledge metabolism principles
2. **Hybrid Deployment**: Docker for infrastructure, native bun for agents - unique to RegenAI
3. **Contract-Driven Development**: Django tracking ensures partnership obligations are met
4. **Multi-Agent Orchestration**: Session management enables 5 agents to collaborate without collision
5. **Ecological Bridge**: Character definitions bridge technical and ecological thinking

