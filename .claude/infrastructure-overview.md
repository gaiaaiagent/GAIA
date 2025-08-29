# RegenAI Infrastructure Overview

_Complete inventory of systems, tools, and frameworks created_

## 🏗️ Core Infrastructure Stack

### 1. ElizaOS Agent Runtime

- **Location**: Running on localhost:3001 (when active)
- **Database**: PGLite at `packages/cli/.eliza/pglite/`
- **Agent**: RegenAI Facilitator (character loaded)
- **Schema**: 17 tables (agents, memories, rooms, logs, etc.)
- **Status**: ✅ Fully operational


### 3. Database Schema Inspector

- **File**: `inspect-schema.js`
- **Usage**: `bun run inspect-schema.js [options]`
- **Features**:
  - Full schema inspection
  - Table-specific analysis
  - Sample data viewing
  - Row count statistics
  - CLI with multiple options

### 2. Django Admin Interface

- **URL Production**: http://regen.gaiaai.xyz:8000/admin/ 
- **Real-time**: Connected to live ElizaOS database
- **Reporting**: Agent interactions and performance dashboard

### Admin Dashboard

- **URL**: http://localhost:8000/
- **Login**: admin / admin123
- **Purpose**: Database visibility and contract completion tracking
- **Features**:
  - Browse all 17 ElizaOS tables
  - Interaction metrics tracking
  - Document processing metrics
  - Agent performance monitoring
  - User activity monitoring
  - Message analysis
  - Retrieval and search testing


## 🤖 Agent Architecture


### Official Agents

2. **Narrative Agent** 🚧

   - Character file: `characters/narrative.character.json` (partial)
   - Role: Story translation and communication

3. **Politician Agent** 📋

   - Character file: `characters/politician.character.json` (partial)
   - Role: Governance and policy coordination

4. **Advocate Agent** 📋

   - Character file: `characters/advocate.character.json` (partial)
   - Role: Community mobilization

5. **Voice of Nature** 📋
   - Character file: `characters/voiceofnature.character.json` (partial)
   - Role: Ecological wisdom and grounding


### Additional Agents

1. **RegenAI Facilitator** ✅
   - Character file: `characters/facilitator.character.json`
   - Role: Regen AI Partnership orchestrator


## 🗃️ Knowledge Management

### KOI Integration

- **Framework**: Knowledge Organization Infrastructure (BlockScience)
- **Status**: 69 documents converted to KOI format
- **Storage**: `.claude/resources/` directory
- **Integration**: Agent knowledge loading system

### Document Processing

- **Pipeline**: KOI conversion → ElizaOS knowledge plugin → Agent memory
- **Tracking**: Document metrics for contract compliance
- **Validation**: Citation verification (planned)

## 🔧 Development Tools

### Code Quality

- **Linting**: ESLint + Prettier (ElizaOS standards)
- **Testing**: Bun test runner with TDD approach
- **Build**: Turbo monorepo build system
- **Package Manager**: Bun (required, not npm/pnpm)

### Database Tools

1. **Schema Inspector**: `inspect-schema.js`
2. **Django Admin**: Full CRUD interface
3. **Direct PGLite Access**: For debugging and validation

### Reporting

- **ElizaOS Logs**: Real-time agent activity
- **Django Admin**: Database state visualization
- **Test Reports**: TDD validation results
- **Contract Dashboard**: Progress tracking

## 📁 File Structure

```
GAIA/
├── characters/                    # Agent character definitions
│   ├── facilitator.character.json
│   ├── narrative.character.json 
│   ├── governor.character.json 
│   └── advocate.character.json 
├── django_admin/                 # Database admin interface
│   ├── elizaos/                 # Read-only ElizaOS models
│   │   ├── models.py            # Django models matching ElizaOS tables
│   │   └── admin.py             # Admin interface configuration
│   ├── metrics/                 # Contract tracking models
│   │   ├── models.py            # Managed models for metrics
│   │   └── admin.py             # Metrics admin interface
│   ├── reporting/               # Dashboard and reporting
│   │   ├── views.py             # Dashboard views
│   │   └── templatetags/        # Template utilities (dict_extras)
│   ├── knowledge/               # Knowledge indexing progress
│   └── manage.py                # Django management
├── inspect-schema.js            # Database inspection utility
├── packages/cli/.eliza/pglite/  # ElizaOS database
└── .claude/                     # Project documentation and planning
```

## 🌐 Network Architecture

```
┌─────────────────┐    ┌─────────────────┐
│   ElizaOS       │    │   Django Admin  │
│   Agent Runtime │◄──►│   Interface     │
│   :3001         │    │   :8000         │
└─────────────────┘    └─────────────────┘
         │                        │       
         ▼                        ▼       
┌─────────────────────────────────────────────────────────────────┐
│                    PGLite Database                              │
│                    (Single Source of Truth)                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Current Capabilities

### ✅ Working Systems

- ElizaOS agent runtime with facilitator character
- Complete database schema mapping (17 tables)
- Django admin interface for data visualization
