# Comprehensive Taxonomy Matrix File Inventory

## Overview

This inventory includes:

- ALL root files
- ALL .claude/ files (90+ files)
- ~20 TypeScript modules from packages
- 10+ Django files
- All character files
- ~20 documentation files

Total: ~150+ files for a comprehensive matrix

## Priority Scoring Criteria

Each file is scored 1-10 on these dimensions:

- **Architectural Impact** (AI): How central to system architecture
- **Knowledge Density** (KD): How much understanding it provides
- **Development Frequency** (DF): How often it's modified/referenced
- **Cross-Cutting Concerns** (CC): How many systems it affects
- **Educational Value** (EV): How much it teaches about the system

**Total Priority Score** = (AI × 2) + KD + DF + CC + EV (max 60)

## Category 1: Root Files (Score 40-60)

1. **CLAUDE.md** (Score: 58)

   - Path: `/CLAUDE.md`
   - Role: Living system guide for AI participation

2. **.env** (Score: 56)

   - Path: `/.env`
   - Role: Environment configuration

3. **package.json** (Score: 54)

   - Path: `/package.json`
   - Role: Project configuration and dependencies

4. **README.md** (Score: 52)

   - Path: `/README.md`
   - Role: Project overview and setup

5. **llms.txt** (Score: 50)

   - Path: `/llms.txt`
   - Role: LLM context and patterns

6. **tsconfig.json** (Score: 45)

   - Path: `/tsconfig.json`
   - Role: TypeScript configuration

7. **turbo.json** (Score: 44)

   - Path: `/turbo.json`
   - Role: Monorepo build configuration

8. **docker-compose.yaml** (Score: 42)

   - Path: `/docker-compose.yaml`
   - Role: Container orchestration

9. **CHANGELOG.md** (Score: 40)

   - Path: `/CHANGELOG.md`
   - Role: Version history

10. **eliza.postman.json** (Score: 40)

    - Path: `/eliza.postman.json`
    - Role: API documentation

11. **lerna.json** (Score: 38)

    - Path: `/lerna.json`
    - Role: Monorepo publishing config

12. **bunfig.toml** (Score: 36)

    - Path: `/bunfig.toml`
    - Role: Bun configuration

13. **LICENSE** (Score: 30)

    - Path: `/LICENSE`
    - Role: Legal terms

14. **Dockerfile** (Score: 35)
    - Path: `/Dockerfile`
    - Role: Container definition

## Category 2: .claude/ Journal Files (Score 35-50)

15. **.claude/journal/00-index.md** (Score: 48)
16. **.claude/journal/19-day2-elizaos-analysis.md** (Score: 46)
17. **.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md** (Score: 45)
18. **.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md** (Score: 44)
19. **.claude/journal/18-database-integration-breakthrough.md** (Score: 43)
20. **.claude/journal/17-django-architecture-mastery.md** (Score: 42)
21. **.claude/journal/16-contract-day-one-reality-check.md** (Score: 42)
22. **.claude/journal/14-comprehensive-infrastructure-and-process-reflection.md** (Score: 41)
23. **.claude/journal/13-tdd-implementation-success.md** (Score: 40)
24. **.claude/journal/07-agent-response-breakthrough-and-plugin-architecture.md** (Score: 40)

## Category 3: .claude/ Planning & Architecture (Score 35-45)

25. **.claude/planning/current-priorities.md** (Score: 45)
26. **.claude/planning/architecture/elizaos-knowledge-architecture.md** (Score: 44)
27. **.claude/planning/features/character-development-framework.md** (Score: 43)
28. **.claude/planning/features/agent-archetypes.md** (Score: 42)
29. **.claude/planning/roadmaps/milestone-1-core-agent-framework.md** (Score: 41)
30. **.claude/planning/dependency-matrix.md** (Score: 40)
31. **.claude/planning/strategy/tdd-roadmap.md** (Score: 39)
32. **.claude/planning/architecture/living-documentation-workflow.md** (Score: 38)

## Category 4: .claude/ Diagnostics & Resources (Score 35-45)

33. **.claude/diagnostics/01-investigate-group-chat.js** (Score: 42)
34. **.claude/diagnostics/README.md** (Score: 40)
35. **.claude/resources/07-project-context/14-contract-draft.md** (Score: 45)
36. **.claude/resources/03-foundational-research/01-regen-network-token-economics-working-group-governance-structure-and-engagement-strategy.md** (Score: 42)
37. **.claude/resources/04-agentic-research/01-four-agent-architecture.md** (Score: 41)
38. **.claude/resources/05-knowledge-architecture-and-truth-discovery/02-koi-integration-and-semantic-traceability.md** (Score: 40)

## Category 5: Core TypeScript Modules (Score 40-55)

39. **packages/core/src/runtime.ts** (Score: 55)
40. **packages/core/src/types/index.ts** (Score: 53)
41. **packages/core/src/database.ts** (Score: 51)
42. **packages/core/src/index.ts** (Score: 50)
43. **packages/core/src/actions.ts** (Score: 48)
44. **packages/core/src/services.ts** (Score: 47)
45. **packages/core/src/prompts.ts** (Score: 46)
46. **packages/core/src/entities.ts** (Score: 45)
47. **packages/core/src/logger.ts** (Score: 44)
48. **packages/core/src/utils.ts** (Score: 43)
49. **packages/core/src/search.ts** (Score: 42)
50. **packages/core/src/settings.ts** (Score: 41)
51. **packages/core/src/types/agent.ts** (Score: 40)
52. **packages/core/src/types/memory.ts** (Score: 40)
53. **packages/core/src/types/message.ts** (Score: 40)
54. **packages/core/src/schemas/character.ts** (Score: 39)

## Category 6: Server TypeScript Modules (Score 40-50)

55. **packages/server/src/index.ts** (Score: 50)
56. **packages/server/src/socketio/index.ts** (Score: 48)
57. **packages/server/src/services/message.ts** (Score: 47)
58. **packages/server/src/api/index.ts** (Score: 46)
59. **packages/server/src/bus.ts** (Score: 45)

## Category 7: Django Files (Score 35-45)

60. **django_admin/elizaos/models.py** (Score: 45)
61. **django_admin/elizaos/admin.py** (Score: 42)
62. **django_admin/eliza_admin/settings.py** (Score: 41)
63. **django_admin/eliza_admin/urls.py** (Score: 40)
64. **django_admin/manage.py** (Score: 38)
65. **django_admin/knowledge/models.py** (Score: 40)
66. **django_admin/metrics/models.py** (Score: 39)
67. **django_admin/reporting/views.py** (Score: 38)
68. **django_admin/pyproject.toml** (Score: 37)
69. **django_admin/README.md** (Score: 40)

## Category 8: Character Files (Score: 35-45)

70. **characters/facilitator.character.json** (Score: 45)
71. **characters/narrative.character.json** (Score: 44)
72. **characters/regenai.character.json** (Score: 43)
73. **characters/example/gaia4.character.json** (Score: 42)
74. **characters/example/cascadia.character.json** (Score: 41)
75. **characters/example/aquarius.character.json** (Score: 40)
76. **characters/example/terranova.character.json** (Score: 39)
77. **characters/example/genesis.character.json** (Score: 38)
78. **characters/example/astraea.character.json** (Score: 37)

## Category 9: Client/UI Files (Score: 35-45)

79. **packages/client/src/components/chat.tsx** (Score: 44)
80. **packages/client/src/hooks/use-socket-chat.ts** (Score: 43)
81. **packages/client/src/App.tsx** (Score: 42)
82. **packages/client/src/routes/chat/group/[id].tsx** (Score: 41)
83. **packages/client/src/main.tsx** (Score: 40)

## Category 10: Documentation Files (Score: 35-45)

84. **packages/docs/README.md** (Score: 42)
85. **packages/docs/docs/intro.md** (Score: 41)
86. **packages/docs/docs/getting-started/installation.md** (Score: 40)
87. **packages/docs/docs/api/overview.md** (Score: 40)
88. **packages/docs/docs/architecture/system-design.md** (Score: 42)
89. **packages/docs/docs/guides/creating-agents.md** (Score: 41)
90. **packages/docs/docs/guides/plugin-development.md** (Score: 40)
91. **packages/cli/README.md** (Score: 39)
92. **packages/core/README.md** (Score: 40)
93. **packages/server/README.md** (Score: 39)
94. **scripts/dev-instructions.md** (Score: 38)

## Category 11: Plugin & Extension Files (Score: 35-40)

95. **packages/plugin-bootstrap/src/index.ts** (Score: 40)
96. **packages/plugin-sql/src/index.ts** (Score: 39)
97. **packages/api-client/src/index.ts** (Score: 38)
98. **packages/cli/src/index.ts** (Score: 40)

## Category 12: Additional .claude Resources (Score: 30-40)

99-150. [Remaining .claude/resources files...]

- All research documents
- All project context files
- All community activation documents
- All knowledge architecture files

## Matrix Dimensions

With ~150 files, this creates a 150×150 matrix = 22,500 cells

### Optimization Strategy

1. **Sparse Matrix**: Only document relationships with strength > 5/10
2. **Category Clustering**: Focus on within-category relationships first
3. **Critical Paths**: Prioritize architectural dependencies
4. **Progressive Enhancement**: Build incrementally

### Estimated Meaningful Relationships

- Within-category: ~500 strong relationships
- Cross-category: ~1000 medium relationships
- Total documented: ~1500 relationships (vs 22,500 possible)

## Next Steps

1. Finalize exact file list (currently ~100, need 50 more)
2. Create matrix generation script
3. Design relationship strength algorithm
4. Build progressive documentation system
5. Implement sparse matrix optimization
