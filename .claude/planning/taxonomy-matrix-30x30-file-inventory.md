# 30x30 Taxonomy Matrix File Inventory

## Priority Scoring Criteria

Each file is scored 1-10 on these dimensions:
- **Architectural Impact** (AI): How central to system architecture
- **Knowledge Density** (KD): How much understanding it provides
- **Development Frequency** (DF): How often it's modified/referenced
- **Cross-Cutting Concerns** (CC): How many systems it affects
- **Educational Value** (EV): How much it teaches about the system

**Total Priority Score** = (AI × 2) + KD + DF + CC + EV (max 60)

## Top 30 Priority Files

### Tier 1: Root Configuration & Core Documentation (Score 50-60)

1. **CLAUDE.md** (Score: 58)
   - AI: 10, KD: 10, DF: 8, CC: 10, EV: 10
   - Path: `/CLAUDE.md`
   - Role: Living system guide for AI participation

2. **.env** (Score: 56)
   - AI: 10, KD: 8, DF: 10, CC: 10, EV: 8
   - Path: `/.env`
   - Role: Environment configuration

3. **package.json** (Score: 54)
   - AI: 10, KD: 8, DF: 10, CC: 9, EV: 7
   - Path: `/package.json`
   - Role: Project configuration and dependencies

4. **README.md** (Score: 52)
   - AI: 9, KD: 10, DF: 7, CC: 8, EV: 10
   - Path: `/README.md`
   - Role: Project overview and setup

5. **llms.txt** (Score: 50)
   - AI: 9, KD: 10, DF: 6, CC: 8, EV: 9
   - Path: `/llms.txt`
   - Role: LLM context and patterns

### Tier 2: Core System Architecture (Score 45-49)

6. **packages/core/src/runtime.ts** (Score: 49)
   - AI: 10, KD: 9, DF: 8, CC: 9, EV: 8
   - Path: `/packages/core/src/runtime.ts`
   - Role: Core runtime implementation

7. **packages/core/src/types/index.ts** (Score: 48)
   - AI: 10, KD: 9, DF: 7, CC: 10, EV: 7
   - Path: `/packages/core/src/types/index.ts`
   - Role: Type definitions

8. **packages/server/src/index.ts** (Score: 47)
   - AI: 9, KD: 8, DF: 9, CC: 9, EV: 8
   - Path: `/packages/server/src/index.ts`
   - Role: Server entry point

9. **packages/core/src/database.ts** (Score: 46)
   - AI: 9, KD: 8, DF: 8, CC: 9, EV: 8
   - Path: `/packages/core/src/database.ts`
   - Role: Database abstraction layer

10. **django_admin/elizaos/models.py** (Score: 45)
    - AI: 8, KD: 9, DF: 8, CC: 8, EV: 9
    - Path: `/django_admin/elizaos/models.py`
    - Role: Django model definitions

### Tier 3: Communication & Messaging (Score 40-44)

11. **packages/server/src/socketio/index.ts** (Score: 44)
    - AI: 9, KD: 8, DF: 8, CC: 8, EV: 7
    - Path: `/packages/server/src/socketio/index.ts`
    - Role: WebSocket communication

12. **packages/server/src/services/message.ts** (Score: 43)
    - AI: 8, KD: 8, DF: 8, CC: 9, EV: 8
    - Path: `/packages/server/src/services/message.ts`
    - Role: Message bus service

13. **packages/server/src/api/index.ts** (Score: 42)
    - AI: 8, KD: 7, DF: 9, CC: 8, EV: 8
    - Path: `/packages/server/src/api/index.ts`
    - Role: API router setup

14. **packages/client/src/components/chat.tsx** (Score: 41)
    - AI: 7, KD: 8, DF: 9, CC: 7, EV: 9
    - Path: `/packages/client/src/components/chat.tsx`
    - Role: Chat UI component

15. **characters/facilitator.character.json** (Score: 40)
    - AI: 7, KD: 9, DF: 8, CC: 6, EV: 9
    - Path: `/characters/facilitator.character.json`
    - Role: Agent character definition

### Tier 4: Development & Testing Infrastructure (Score 35-39)

16. **tsconfig.json** (Score: 39)
    - AI: 7, KD: 7, DF: 8, CC: 9, EV: 7
    - Path: `/tsconfig.json`
    - Role: TypeScript configuration

17. **turbo.json** (Score: 38)
    - AI: 7, KD: 7, DF: 7, CC: 9, EV: 7
    - Path: `/turbo.json`
    - Role: Monorepo build configuration

18. **.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md** (Score: 37)
    - AI: 6, KD: 10, DF: 7, CC: 5, EV: 10
    - Path: `/.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md`
    - Role: Investigation documentation

19. **scripts/dev-instructions.md** (Score: 36)
    - AI: 6, KD: 9, DF: 7, CC: 6, EV: 9
    - Path: `/scripts/dev-instructions.md`
    - Role: Developer guidance

20. **.claude/diagnostics/01-investigate-group-chat.js** (Score: 35)
    - AI: 5, KD: 8, DF: 8, CC: 6, EV: 9
    - Path: `/.claude/diagnostics/01-investigate-group-chat.js`
    - Role: Diagnostic tool

### Tier 5: Plugins & Extensions (Score 30-34)

21. **packages/core/src/actions.ts** (Score: 34)
    - AI: 7, KD: 7, DF: 7, CC: 7, EV: 7
    - Path: `/packages/core/src/actions.ts`
    - Role: Action system implementation

22. **packages/core/src/services.ts** (Score: 33)
    - AI: 7, KD: 6, DF: 7, CC: 7, EV: 7
    - Path: `/packages/core/src/services.ts`
    - Role: Service management

23. **packages/core/src/prompts.ts** (Score: 32)
    - AI: 6, KD: 8, DF: 6, CC: 6, EV: 8
    - Path: `/packages/core/src/prompts.ts`
    - Role: Prompt templates

24. **packages/cli/src/index.ts** (Score: 31)
    - AI: 6, KD: 6, DF: 8, CC: 6, EV: 7
    - Path: `/packages/cli/src/index.ts`
    - Role: CLI entry point

25. **docker-compose.yaml** (Score: 30)
    - AI: 5, KD: 6, DF: 8, CC: 7, EV: 7
    - Path: `/docker-compose.yaml`
    - Role: Container orchestration

### Tier 6: Supporting Documentation & Config (Score 25-29)

26. **CHANGELOG.md** (Score: 29)
    - AI: 4, KD: 8, DF: 8, CC: 5, EV: 8
    - Path: `/CHANGELOG.md`
    - Role: Version history

27. **eliza.postman.json** (Score: 28)
    - AI: 4, KD: 7, DF: 6, CC: 6, EV: 9
    - Path: `/eliza.postman.json`
    - Role: API documentation

28. **packages/core/src/utils.ts** (Score: 27)
    - AI: 5, KD: 5, DF: 8, CC: 7, EV: 6
    - Path: `/packages/core/src/utils.ts`
    - Role: Utility functions

29. **lerna.json** (Score: 26)
    - AI: 5, KD: 5, DF: 6, CC: 7, EV: 6
    - Path: `/lerna.json`
    - Role: Monorepo publishing config

30. **.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md** (Score: 25)
    - AI: 3, KD: 9, DF: 6, CC: 4, EV: 10
    - Path: `/.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md`
    - Role: Matrix vision documentation

## Matrix Construction Plan

With these 30 files, we'll create a 30×30 matrix (900 cells) where:
- **Diagonal cells**: File self-documentation with YAML metadata
- **Off-diagonal cells**: Relationship documentation (870 relationships)
- **Sparse optimization**: Only document relationships with strength > 3/10

This reduces our workload to approximately 200-300 meaningful relationships while maintaining comprehensive coverage.

## Next Steps

1. Create matrix structure generator script
2. Build templates for consistent cell content
3. Begin with highest-priority relationships (Tier 1 ↔ Tier 1)
4. Progressively fill in lower-priority relationships
5. Validate educational value and accuracy