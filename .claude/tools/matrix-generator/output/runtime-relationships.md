# Runtime and Dynamic Relationships Analysis

_Generated: 2025-08-27T03:42:14.190Z_

## Runtime Flow Summary

- **Critical Path Flows**: 8
- **Async/Background Flows**: 6
- **Total Runtime Relationships**: 14

## Critical Path Flows

These flows must complete for the system to function:

### packages/client/src/components/chat.tsx → packages/server/src/socketio/index.ts

- **Type**: websocket
- **Trigger**: User sends message
- **Flow**: React component → Socket.IO client → WebSocket → Express server
- **Timing**: Real-time (< 100ms)

### packages/server/src/socketio/index.ts → packages/server/src/services/message.ts

- **Type**: event
- **Trigger**: WebSocket message received
- **Flow**: Socket handler → Message service → Database persistence
- **Timing**: Async (10-50ms)

### packages/server/src/services/message.ts → packages/core/src/runtime.ts

- **Type**: process
- **Trigger**: Message persisted
- **Flow**: Message service → Agent runtime → Process message → Generate response
- **Timing**: Variable (100ms-2s depending on LLM)

### packages/server/src/api/messaging/sessions.ts → packages/server/src/socketio/index.ts

- **Type**: websocket
- **Trigger**: Group chat message
- **Flow**: Session manager → Broadcast to all agents in room → Coordinated responses
- **Timing**: Parallel broadcast (< 50ms)

### characters/regenai.character.json → packages/core/src/runtime.ts

- **Type**: process
- **Trigger**: Agent initialization
- **Flow**: Character file → Runtime loader → Personality initialization → Ready state
- **Timing**: Startup (500ms per agent)

### packages/core/src/runtime.ts → packages/core/src/memory.ts

- **Type**: database
- **Trigger**: Context needed for response
- **Flow**: Runtime → Memory search → Vector similarity → Top-k results
- **Timing**: Query time (20-100ms for 606 documents)

### scripts/start-agents-hybrid.sh → docker-compose.yaml

- **Type**: process
- **Trigger**: System startup
- **Flow**: Script → Docker (postgres/nginx) → Native bun (5 agents) → Health checks
- **Timing**: Startup sequence (30-60 seconds)

### .env → packages/core/src/runtime.ts

- **Type**: process
- **Trigger**: Environment loading
- **Flow**: .env → Process.env → Runtime config → API initialization
- **Timing**: Startup (immediate)

## Async/Background Flows

These flows enhance functionality but aren't blocking:

### packages/core/src/runtime.ts → packages/plugin-bootstrap/src/services/embedding.ts

- **Type**: event
- **Trigger**: EMBEDDING_GENERATION_REQUESTED event
- **Flow**: Runtime → Event bus → Embedding service → Queue processing
- **Timing**: Async queue (batch every 100ms)

### packages/plugin-bootstrap/src/services/embedding.ts → packages/core/src/database.ts

- **Type**: database
- **Trigger**: Embedding generated
- **Flow**: Embedding service → PostgreSQL pgvector → Store 1536-dimension vectors
- **Timing**: Database write (5-20ms)

### knowledge/README.md → packages/plugin-bootstrap/src/services/embedding.ts

- **Type**: process
- **Trigger**: Agent startup
- **Flow**: Knowledge directory → Recursive loading → Embedding generation → Vector storage
- **Timing**: Initial load (5-10 minutes for 606 pages)

### django_admin/monitoring/views.py → packages/core/src/database.ts

- **Type**: database
- **Trigger**: Dashboard refresh
- **Flow**: Django view → PostgreSQL query → Aggregate stats → Render dashboard
- **Timing**: Page load (100-500ms)

### django_admin/contract_tracking/models.py → django_admin/monitoring/views.py

- **Type**: api
- **Trigger**: Milestone check
- **Flow**: Contract model → Calculate progress → Update dashboard → Alert if behind
- **Timing**: Periodic check (every 5 minutes)

### packages/server/src/bus.ts → packages/server/src/services/message.ts

- **Type**: event
- **Trigger**: Error in message processing
- **Flow**: Error event → Bus → Error handler → Retry logic → Fallback response
- **Timing**: Error handling (50-200ms)

## Event Flow Patterns

### Message Processing Pipeline
```
User Input → WebSocket → Server → Message Service → Database
                                ↓
                          Agent Runtime
                                ↓
                     [Memory Search + Context]
                                ↓
                         LLM Generation
                                ↓
User ← WebSocket ← Server ← Response
```

### Multi-Agent Coordination
```
Group Message → Session Manager → Agent Selection
                                      ↓
                            [Parallel Processing]
                          ↙        ↓        ↘
                   Agent1     Agent2     Agent3
                          ↘        ↓        ↙
                          Response Coordination
                                      ↓
                              Unified Response
```

### Knowledge Processing Pipeline
```
606 Notion Pages → Knowledge Loader → Text Extraction
                                           ↓
                                   Embedding Service
                                           ↓
                                   [Async Queue]
                                           ↓
                                  Batch Processing
                                           ↓
                               PostgreSQL pgvector
                                           ↓
                            Available for RAG Queries
```

## Performance Characteristics

- **Message Round Trip**: 200-2500ms (depends on LLM)
- **Embedding Generation**: 100ms per batch of 10
- **Vector Search**: 20-100ms for 606 documents
- **WebSocket Latency**: < 50ms
- **Database Writes**: 5-20ms
- **Agent Startup**: 500ms per agent
- **Full System Boot**: 30-60 seconds

## Bottlenecks and Optimization Points

1. **LLM Response Time**: Primary bottleneck (1-2s per response)
2. **Initial Knowledge Load**: 5-10 minutes for 606 pages
3. **Multi-Agent Coordination**: Sequential responses could be parallelized
4. **Embedding Queue**: Batch size of 10 might be suboptimal
5. **Memory Search**: No caching of frequent queries

