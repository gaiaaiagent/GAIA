# Adaptive Context System for RegenAI Development

## Core Principle
Rather than memorizing specific files, understand patterns and let the system guide discovery.

## Session Initialization Pattern

### 1. Orient to Current State
**Look for the latest:**
- Journal entries (numbered sequentially) - What happened recently?
- Updated priorities - What matters now?
- Active roadmaps - What milestone are we on?
- In-progress work - What's partially complete?

**Pattern Recognition:**
- Files with recent timestamps are living
- Documents with questions are inviting updates
- Templates are empty, waiting to be used
- Frameworks guide but don't constrain

### 2. Understand Document Types

#### Living Documents (Change Frequently)
- **Journal entries** - Daily/session discoveries
- **Priority lists** - Dynamic task organization  
- **Feature specs** - Evolve during implementation
- **Session docs** - Active work in progress

#### Framework Documents (Change Slowly)
- **Development frameworks** - How we work
- **Architecture decisions** - Why we chose patterns
- **Workflow guides** - Process documentation

#### Templates (Static Until Used)
- **Feature template** - Starting point for new features
- **Sprint template** - Structure for time-boxed work
- **Character template** - (To be created)

### 3. Navigation Strategies

#### For Understanding Context
1. Start with indexes (00-index.md files)
2. Check "last updated" dates
3. Look for "current" or "active" in filenames
4. Follow cross-references between docs

#### For Finding Information
1. Use directory names as topic guides:
   - `architecture/` - How we build
   - `features/` - What we're building
   - `roadmaps/` - When we're building
   - `priorities/` - What to build next
2. Check templates for structure patterns
3. Look for numbered sequences (sessions, journals)

#### For Making Updates
1. Find the most specific relevant document
2. Check if it's a template (copy it) or living doc (update it)
3. Add cross-references to related documents
4. Update "last modified" metadata

### 4. Staying Current Through Patterns

#### The Breathing Rhythm
- **Inhale**: Read relevant docs before starting
- **Hold**: Think and work within documents
- **Exhale**: Update docs with discoveries
- **Pause**: Reflect in journal

#### Update Triggers
- **Confusion** = Update clarifying documentation
- **Decision** = Document rationale
- **Discovery** = Add to relevant framework
- **Completion** = Check off in roadmap

#### Living Indicators
- Questions in documents need answers
- TBD sections need filling
- Old timestamps need refreshing
- Disconnected docs need linking

### 5. Anti-Fragile Practices

#### Embrace Evolution
- Documents should change with understanding
- Templates spawn instances, not clones
- Frameworks adapt to reality
- Patterns emerge from practice

#### Maintain Coherence
- Cross-reference liberally
- Use consistent naming patterns
- Keep metadata current
- Let structure emerge

#### Trust the System
- If you can't find something, it might not exist yet
- If something seems stale, it probably is
- If patterns conflict, document the tension
- If confused, write the clarification

## Integration with KOI Principles

### Reference IDs (RIDs)
Use semantic naming that describes content, not brittled paths:
```
koi:journal:session-01
koi:feature:character-development
koi:architecture:living-docs
```

### Metadata Headers
Add to living documents:
```yaml
---
last-updated: 2024-01-15
confidence: high
status: active
related:
  - koi:framework:character-development
  - koi:journal:session-01
---
```

### Traceability
- Link claims to sources
- Reference decisions to discussions
- Connect implementations to designs
- Trace knowledge to origins

## The Meta-Learning

This system itself demonstrates the principles:
- It's a framework, not a prescription
- It emphasizes patterns over specifics
- It expects to evolve with use
- It treats confusion as information

## Remember

The best way to understand the current state is to:
1. Look for what's been updated recently
2. Follow the cross-references
3. Trust the patterns
4. Update what you touch

The planning system is designed to guide discovery, not dictate paths. Let it breathe, let it evolve, and let it serve the work rather than constraining it.