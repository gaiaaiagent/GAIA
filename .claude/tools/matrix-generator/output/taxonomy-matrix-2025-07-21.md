# ElizaOS/RegenAI Taxonomy Matrix

_Generated: 2025-07-21T23:52:57.786Z_  
_Version: 1.0.0_  
_Files: 44_  
_Relationships: 177_

---

## About This Document

This taxonomy matrix provides a comprehensive analysis of relationships between key files in the ElizaOS/RegenAI project. Each relationship is documented with three analytical patterns:

1. **Psychological**: How developers perceive, trust, and collaborate around these files
2. **Technological**: The technical mechanisms, tools, and systems that connect them
3. **Thematic**: The broader patterns, principles, and narratives they embody

The matrix serves as both documentation and a learning tool for understanding the project's architecture.

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Matrix Overview](#matrix-overview)
3. [File Summaries](#file-summaries)
4. [Relationship Analysis](#relationship-analysis)
   - [Strong Relationships (≥8)](#strong-relationships-8)
   - [Important Relationships (6-7)](#important-relationships-6-7)
   - [Notable Relationships (5)](#notable-relationships-5)
5. [Navigation Guide](#navigation-guide)
6. [Appendices](#appendices)

## Executive Summary

### Key Findings

The analysis reveals a well-structured codebase with clear architectural boundaries:

- **80 strong relationships** form the core architecture
- **37 important relationships** support system integration
- **README.md** serves as the primary architectural hub with 22 connections

### Architectural Patterns

1. **Hub-and-Spoke**: Core runtime modules serve as central connection points
2. **Layered Architecture**: Clear separation between core, server, and client layers
3. **Modular Boundaries**: Django, character definitions, and documentation remain properly isolated

### Critical Files

The following files are most central to the system:

- **README.md**: 22 connections
- **CLAUDE.md**: 20 connections
- **llms.txt**: 19 connections
- **CHANGELOG.md**: 19 connections
- **packages/core/src/types/index.ts**: 14 connections

## Matrix Overview

### Matrix Statistics

| Metric                       | Value   |
| ---------------------------- | ------- |
| Matrix Size                  | 44 × 44 |
| Total Possible Cells         | 1936    |
| Documented Relationships     | 177     |
| Matrix Density               | 9.1%    |
| Average Connections per File | 8.0     |

### Relationship Distribution

| Strength | Count | Description            |
| -------- | ----- | ---------------------- |
| 9-10     | 76    | Critical dependencies  |
| 7-8      | 37    | Strong relationships   |
| 5-6      | 57    | Important connections  |
| 3-4      | 7     | Moderate relationships |

## File Summaries

This section provides an overview of each file in the matrix.

### Root

#### CLAUDE.md

This Markdown documentation file provides documentation within the root category. With 22 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: CLAUDE.md
category: root
type: Markdown documentation
size: 102.3KB
connections: 22
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/CLAUDE.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .env

This text file contributes specialized functionality within the root category. With 23 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .env
category: root
type: text
size: 2.4KB
connections: 23
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.env
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### package.json

This JSON configuration file contains structured data within the root category. With 24 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: package.json
category: root
type: JSON configuration
size: 3.4KB
connections: 24
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/package.json
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### README.md

This Markdown documentation file provides documentation within the root category. With 22 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: README.md
category: root
type: Markdown documentation
size: 8.2KB
connections: 22
imports: 0
exports: 0
references: 2
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/README.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### llms.txt

This text file contributes specialized functionality within the root category. With 21 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: llms.txt
category: root
type: text
size: 79.5KB
connections: 21
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/llms.txt
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### tsconfig.json

This JSON configuration file manages configuration settings within the root category. With 23 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: tsconfig.json
category: root
type: JSON configuration
size: 0.5KB
connections: 23
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/tsconfig.json
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### turbo.json

This JSON configuration file contains structured data within the root category. With 23 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: turbo.json
category: root
type: JSON configuration
size: 1.2KB
connections: 23
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/turbo.json
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### docker-compose.yaml

This YAML configuration file contributes specialized functionality within the root category. With 23 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: docker-compose.yaml
category: root
type: YAML configuration
size: 1.3KB
connections: 23
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/docker-compose.yaml
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### CHANGELOG.md

This Markdown documentation file provides documentation within the root category. With 21 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: CHANGELOG.md
category: root
type: Markdown documentation
size: 161.5KB
connections: 21
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/CHANGELOG.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### eliza.postman.json

This JSON configuration file contains structured data within the root category. With 23 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: eliza.postman.json
category: root
type: JSON configuration
size: 52.2KB
connections: 23
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/eliza.postman.json
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

### Claude Journal

#### .claude/journal/00-index.md

This Markdown documentation file acts as a module entry point within the claude_journal category. With 21 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/journal/00-index.md
category: claude_journal
type: Markdown documentation
size: 4.2KB
connections: 21
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/journal/00-index.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/journal/19-day2-elizaos-analysis.md

This Markdown documentation file provides documentation within the claude_journal category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/journal/19-day2-elizaos-analysis.md
category: claude_journal
type: Markdown documentation
size: 26.8KB
connections: 20
imports: 0
exports: 0
references: 11
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/journal/19-day2-elizaos-analysis.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md

This Markdown documentation file provides documentation within the claude_journal category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md
category: claude_journal
type: Markdown documentation
size: 4.0KB
connections: 20
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md

This Markdown documentation file provides documentation within the claude_journal category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md
category: claude_journal
type: Markdown documentation
size: 8.9KB
connections: 20
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/journal/18-database-integration-breakthrough.md

This Markdown documentation file provides documentation within the claude_journal category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/journal/18-database-integration-breakthrough.md
category: claude_journal
type: Markdown documentation
size: 7.9KB
connections: 20
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/journal/18-database-integration-breakthrough.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

### Claude Planning

#### .claude/planning/current-priorities.md

This Markdown documentation file provides documentation within the claude_planning category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/planning/current-priorities.md
category: claude_planning
type: Markdown documentation
size: 4.8KB
connections: 20
imports: 0
exports: 0
references: 4
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/planning/current-priorities.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/planning/architecture/elizaos-knowledge-architecture.md

This Markdown documentation file provides documentation within the claude_planning category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/planning/architecture/elizaos-knowledge-architecture.md
category: claude_planning
type: Markdown documentation
size: 21.7KB
connections: 20
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/planning/architecture/elizaos-knowledge-architecture.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/planning/features/character-development-framework.md

This Markdown documentation file provides documentation within the claude_planning category. With 20 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/planning/features/character-development-framework.md
category: claude_planning
type: Markdown documentation
size: 8.1KB
connections: 20
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/planning/features/character-development-framework.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/planning/roadmaps/milestone-1-core-agent-framework.md

This Markdown documentation file provides documentation within the claude_planning category. With 27 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/planning/roadmaps/milestone-1-core-agent-framework.md
category: claude_planning
type: Markdown documentation
size: 3.2KB
connections: 27
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/planning/roadmaps/milestone-1-core-agent-framework.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

### Claude Diagnostics

#### .claude/diagnostics/01-investigate-group-chat.js

This JavaScript file contributes specialized functionality within the claude_diagnostics category. With 11 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/diagnostics/01-investigate-group-chat.js
category: claude_diagnostics
type: JavaScript
size: 6.2KB
connections: 11
imports: 2
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/diagnostics/01-investigate-group-chat.js
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### .claude/diagnostics/README.md

This Markdown documentation file provides documentation within the claude_diagnostics category. With 21 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: .claude/diagnostics/README.md
category: claude_diagnostics
type: Markdown documentation
size: 1.8KB
connections: 21
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/.claude/diagnostics/README.md
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

### Core Typescript

#### packages/core/src/runtime.ts

This TypeScript file serves as the core runtime engine within the core_typescript category. With 7 connections to other files, it plays a significant role in system integration. Key elements include: exports Semaphore, exports AgentRuntime. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/runtime.ts
category: core_typescript
type: TypeScript
size: 73.9KB
connections: 7
imports: 7
exports: 2
references: 0
examples:
  - exports Semaphore
  - exports AgentRuntime
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/runtime.ts
  lastScanned: 2025-07-21T23:10:22.237Z
---
```

</details>

#### packages/core/src/types/index.ts

This TypeScript file defines essential type definitions within the core_typescript category. With 14 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/types/index.ts
category: core_typescript
type: TypeScript
size: 0.8KB
connections: 14
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/types/index.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/core/src/database.ts

This TypeScript file contributes specialized functionality within the core_typescript category. With 8 connections to other files, it plays a significant role in system integration. The file structure follows standard patterns. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/database.ts
category: core_typescript
type: TypeScript
size: 19.2KB
connections: 8
imports: 1
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/database.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/core/src/index.ts

This TypeScript file acts as a module entry point within the core_typescript category. With 16 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/index.ts
category: core_typescript
type: TypeScript
size: 0.5KB
connections: 16
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/index.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/core/src/actions.ts

This TypeScript file contributes specialized functionality within the core_typescript category. With 8 connections to other files, it plays a significant role in system integration. Key elements include: exports composeActionExamples, exports formatActionNames. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/actions.ts
category: core_typescript
type: TypeScript
size: 4.2KB
connections: 8
imports: 2
exports: 3
references: 0
examples:
  - exports composeActionExamples
  - exports formatActionNames
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/actions.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/core/src/services.ts

This TypeScript file contributes specialized functionality within the core_typescript category. With 13 connections to other files, it represents a critical architectural hub. Key elements include: exports ServiceBuilder, exports createService. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/services.ts
category: core_typescript
type: TypeScript
size: 2.8KB
connections: 13
imports: 2
exports: 4
references: 0
examples:
  - exports ServiceBuilder
  - exports createService
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/services.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/core/src/prompts.ts

This TypeScript file contributes specialized functionality within the core_typescript category. With 7 connections to other files, it plays a significant role in system integration. Key elements include: exports shouldRespondTemplate, exports messageHandlerTemplate. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/core/src/prompts.ts
category: core_typescript
type: TypeScript
size: 9.4KB
connections: 7
imports: 0
exports: 5
references: 0
examples:
  - exports shouldRespondTemplate
  - exports messageHandlerTemplate
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/core/src/prompts.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

### Server Typescript

#### packages/server/src/index.ts

This TypeScript file acts as a module entry point within the server_typescript category. With 10 connections to other files, it represents a critical architectural hub. Key elements include: exports expandTildePath, exports resolvePgliteDir, imports from @elizaos/core. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/server/src/index.ts
category: server_typescript
type: TypeScript
size: 50.1KB
connections: 10
imports: 20
exports: 6
references: 7
examples:
  - exports expandTildePath
  - exports resolvePgliteDir
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/server/src/index.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/server/src/socketio/index.ts

This TypeScript file acts as a module entry point within the server_typescript category. With 10 connections to other files, it represents a critical architectural hub. Key elements include: exports SocketIORouter, imports from @elizaos/core. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/server/src/socketio/index.ts
category: server_typescript
type: TypeScript
size: 18.1KB
connections: 10
imports: 4
exports: 1
references: 0
examples:
  - exports SocketIORouter
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/server/src/socketio/index.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/server/src/services/message.ts

This TypeScript file contributes specialized functionality within the server_typescript category. With 6 connections to other files, it maintains moderate coupling with related components. Key elements include: exports MessageServiceMessage, exports MessageBusService, imports from @elizaos/core. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/server/src/services/message.ts
category: server_typescript
type: TypeScript
size: 27.6KB
connections: 6
imports: 2
exports: 3
references: 0
examples:
  - exports MessageServiceMessage
  - exports MessageBusService
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/server/src/services/message.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/server/src/api/index.ts

This TypeScript file acts as a module entry point within the server_typescript category. With 10 connections to other files, it represents a critical architectural hub. Key elements include: exports setupSocketIO, exports createPluginRouteHandler, imports from @elizaos/core. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/server/src/api/index.ts
category: server_typescript
type: TypeScript
size: 16.6KB
connections: 10
imports: 19
exports: 3
references: 0
examples:
  - exports setupSocketIO
  - exports createPluginRouteHandler
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/server/src/api/index.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/server/src/bus.ts

This TypeScript file contributes specialized functionality within the server_typescript category. With 5 connections to other files, it maintains moderate coupling with related components. The file structure follows standard patterns. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/server/src/bus.ts
category: server_typescript
type: TypeScript
size: 3.4KB
connections: 5
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/server/src/bus.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

### Django

#### django_admin/elizaos/models.py

This Python file handles administrative interfaces within the django category. With 6 connections to other files, it maintains moderate coupling with related components. Key elements include: exports Agent, exports Memory. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: django_admin/elizaos/models.py
category: django
type: Python
size: 11.7KB
connections: 6
imports: 1
exports: 17
references: 0
examples:
  - exports Agent
  - exports Memory
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/django_admin/elizaos/models.py
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### django_admin/elizaos/admin.py

This Python file handles administrative interfaces within the django category. With 4 connections to other files, it maintains moderate coupling with related components. Key elements include: exports AgentAdmin, exports MemoryAdmin. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: django_admin/elizaos/admin.py
category: django
type: Python
size: 11.6KB
connections: 4
imports: 1
exports: 17
references: 0
examples:
  - exports AgentAdmin
  - exports MemoryAdmin
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/django_admin/elizaos/admin.py
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### django_admin/eliza_admin/settings.py

This Python file handles administrative interfaces within the django category. With 4 connections to other files, it maintains moderate coupling with related components. The file structure follows standard patterns. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: django_admin/eliza_admin/settings.py
category: django
type: Python
size: 3.8KB
connections: 4
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/django_admin/eliza_admin/settings.py
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### django_admin/manage.py

This Python file handles administrative interfaces within the django category. With 4 connections to other files, it maintains moderate coupling with related components. The file structure follows standard patterns. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: django_admin/manage.py
category: django
type: Python
size: 0.6KB
connections: 4
imports: 1
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/django_admin/manage.py
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### django_admin/README.md

This Markdown documentation file handles administrative interfaces within the django category. With 19 connections to other files, it represents a critical architectural hub. The file structure follows standard patterns. The file's position in the architecture makes it a critical nexus requiring careful change management.

<details>
<summary>File Metadata</summary>

```yaml
---
path: django_admin/README.md
category: django
type: Markdown documentation
size: 2.7KB
connections: 19
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/django_admin/README.md
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

### Characters

#### characters/facilitator.character.json

This JSON configuration file contains structured data within the characters category. With 8 connections to other files, it plays a significant role in system integration. The file structure follows standard patterns. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: characters/facilitator.character.json
category: characters
type: JSON configuration
size: 7.9KB
connections: 8
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/characters/facilitator.character.json
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### characters/narrative.character.json

This JSON configuration file contains structured data within the characters category. With 8 connections to other files, it plays a significant role in system integration. The file structure follows standard patterns. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: characters/narrative.character.json
category: characters
type: JSON configuration
size: 9.0KB
connections: 8
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/characters/narrative.character.json
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### characters/regenai.character.json

This JSON configuration file contains structured data within the characters category. With 8 connections to other files, it plays a significant role in system integration. The file structure follows standard patterns. The file's position in the architecture positions it as a key integration point.

<details>
<summary>File Metadata</summary>

```yaml
---
path: characters/regenai.character.json
category: characters
type: JSON configuration
size: 6.5KB
connections: 8
imports: 0
exports: 0
references: 0
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/characters/regenai.character.json
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

### Client

#### packages/client/src/components/chat.tsx

This React TypeScript file contributes specialized functionality within the client category. With 4 connections to other files, it maintains moderate coupling with related components. Key elements include: exports ChatLocationState, exports MemoizedMessageContent, imports from @elizaos/core. The file's position in the architecture reflects moderate coupling with clear boundaries.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/client/src/components/chat.tsx
category: client
type: React TypeScript
size: 62.1KB
connections: 4
imports: 46
exports: 4
references: 0
examples:
  - exports ChatLocationState
  - exports MemoizedMessageContent
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/client/src/components/chat.tsx
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/client/src/hooks/use-socket-chat.ts

This TypeScript file contributes specialized functionality within the client category. With 3 connections to other files, it exhibits focused responsibilities. Key elements include: exports useSocketChat, imports from @elizaos/core. The file's position in the architecture suggests focused responsibilities.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/client/src/hooks/use-socket-chat.ts
category: client
type: TypeScript
size: 9.0KB
connections: 3
imports: 7
exports: 1
references: 0
examples:
  - exports useSocketChat
  - imports from @elizaos/core
koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/client/src/hooks/use-socket-chat.ts
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

#### packages/client/src/App.tsx

This React TypeScript file contributes specialized functionality within the client category. With 3 connections to other files, it exhibits focused responsibilities. The file structure follows standard patterns. The file's position in the architecture suggests focused responsibilities.

<details>
<summary>File Metadata</summary>

```yaml
---
path: packages/client/src/App.tsx
category: client
type: React TypeScript
size: 8.0KB
connections: 3
imports: 28
exports: 0
references: 1
examples:

koi:
  location: /home/ygg/Workspace/cognitive-ecosystem/09-resources/13-eliza/GAIA/packages/client/src/App.tsx
  lastScanned: 2025-07-21T23:10:22.238Z
---
```

</details>

## Relationship Analysis

This section details the relationships between files, organized by strength.

### Strong Relationships (≥8)

These relationships form the core architecture of the system.

#### packages/core/src/runtime.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`, `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Developer trust flows from packages/core/src/runtime.ts to packages/core/src/index.ts through explicit dependency declarations. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from './index'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses relative module resolution. Module bundlers resolve this through relative imports (`import { decryptSecret, getSalt, safeReplacer } from './index'`). The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/core/src/runtime.ts'` demonstrates this connection (`import { decryptSecret, getSalt, safeReplacer } from './index'`).

**Thematic Pattern**  
Together they contribute to the system's core_typescript capabilities. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/runtime.ts → packages/core/src/types/index.ts

**Strength**: 10/10 | **Types**: `import`, `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence when types match reality. Knowledge coupling manifests as shared mental models between maintainers. When debugging a production issue at 2am, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity For instance, when developers see `imports from './types'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Runtime loading follows dependency injection initialization order. Module bundlers resolve this through relative imports (`import { decryptSecret, getSalt, safeReplacer } from './index'`). The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/core/src/runtime.ts'` demonstrates this connection (`import { decryptSecret, getSalt, safeReplacer } from './index'`).

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/database.ts → packages/core/src/types/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this import creates a cognitive contract where packages/core/src/types/index.ts relies on packages/core/src/database.ts's stability. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from './types'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses relative module resolution. Module bundlers resolve this through relative imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/core/src/database.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
The architectural pattern reflects dependency injection design principles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/actions.ts → packages/core/src/types/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this import creates a cognitive contract where packages/core/src/types/index.ts relies on packages/core/src/actions.ts's stability. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from './types'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Type information flows through the TypeScript compiler's inference engine. Module bundlers resolve this through relative imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/core/src/actions.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
Together they contribute to the system's core_typescript capabilities. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/services.ts → packages/core/src/types/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Knowledge coupling manifests as shared mental models between maintainers. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions For instance, when developers see `imports from './types'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses relative module resolution. Module bundlers resolve this through relative imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/core/src/services.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
The architectural pattern reflects dependency injection design principles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/index.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Developer trust flows from packages/server/src/index.ts to packages/core/src/index.ts through explicit dependency declarations. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the server_typescript and core_typescript domains. Mental models align through shared abstractions For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Runtime loading follows dependency injection initialization order. Module bundlers resolve this through workspace imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/index.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/socketio/index.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Teams must coordinate changes between these components to maintain psychological safety. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the server_typescript and core_typescript domains. Mental models align through shared abstractions For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Type information flows through the TypeScript compiler's inference engine. Module bundlers resolve this through workspace imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/socketio/index.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
The architectural pattern reflects dependency injection design principles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/socketio/index.ts → packages/server/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this import creates a cognitive contract where packages/server/src/index.ts relies on packages/server/src/socketio/index.ts's stability. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure For instance, when developers see `imports from '../index'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Build tools must process packages/server/src/socketio/index.ts before packages/server/src/index.ts in the compilation pipeline. Module bundlers resolve this through relative imports. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/socketio/index.ts'` demonstrates this connection. Concretely, this involves Key exports: `export expandTildePath`, `export resolvePgliteDir`, `export ServerMiddleware`.

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/services/message.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Teams must coordinate changes between these components to maintain psychological safety. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the server_typescript and core_typescript domains. Mental models align through shared abstractions For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Build tools must process packages/server/src/services/message.ts before packages/core/src/index.ts in the compilation pipeline. Module bundlers resolve this through workspace imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/services/message.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/services/message.ts → packages/server/src/bus.ts

**Strength**: 10/10 | **Types**: `import`, `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Teams must coordinate changes between these components to maintain psychological safety. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from '../bus'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses relative module resolution. Module bundlers resolve this through relative imports (`import internalMessageBus from '../bus'`). The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/services/message.ts'` demonstrates this connection (`import internalMessageBus from '../bus'`).

**Thematic Pattern**  
This connection reinforces the project's philosophy of modular architecture. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/api/index.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Teams must coordinate changes between these components to maintain psychological safety. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the server_typescript and core_typescript domains. Recognition patterns form through repeated exposure For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Type information flows through the TypeScript compiler's inference engine. Module bundlers resolve this through workspace imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/api/index.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
This connection reinforces the project's philosophy of modular architecture. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/api/index.ts → packages/server/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this import creates a cognitive contract where packages/server/src/index.ts relies on packages/server/src/api/index.ts's stability. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from '../index'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Runtime loading follows dependency injection initialization order. Module bundlers resolve this through relative imports. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/api/index.ts'` demonstrates this connection. Concretely, this involves Key exports: `export expandTildePath`, `export resolvePgliteDir`, `export ServerMiddleware`.

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/api/index.ts → packages/server/src/socketio/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Teams must coordinate changes between these components to maintain psychological safety. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns For instance, when developers see `imports from '../socketio'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
Runtime loading follows dependency injection initialization order. Module bundlers resolve this through relative imports. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/server/src/api/index.ts'` demonstrates this connection. Concretely, this involves Key exports: `export SocketIORouter`.

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/components/chat.tsx → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Knowledge coupling manifests as shared mental models between maintainers. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the client and core_typescript domains. Mental models align through shared abstractions For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses workspace module resolution. Module bundlers resolve this through workspace imports Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/client/src/components/chat.tsx'` demonstrates this connection.

**Thematic Pattern**  
This relationship embodies the theme of modular composition. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/hooks/use-socket-chat.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `import`

**Psychological Pattern**  
Developers experience confidence in understanding. Developer trust flows from packages/client/src/hooks/use-socket-chat.ts to packages/core/src/index.ts through explicit dependency declarations. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the client and core_typescript domains. Mental models align through shared abstractions For instance, when developers see `imports from '@elizaos/core'`, they immediately understand the dependency hierarchy.

**Technological Pattern**  
The dependency mechanism uses workspace module resolution. Module bundlers resolve this through workspace imports (Import pattern: `import { Something } from './index'`) Performance characteristics are tightly coupled, requiring joint optimization. Example: `import { X } from 'packages/client/src/hooks/use-socket-chat.ts'` demonstrates this connection (Import pattern: `import { Something } from './index'`).

**Thematic Pattern**  
Together they contribute to the system's cross-domain integration capabilities. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `pattern`, `structural`, `functional`, `hidden`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → README.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](README.md)` demonstrates this connection.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → llms.txt

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](llms.txt)` demonstrates this connection.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → CHANGELOG.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](CHANGELOG.md)` demonstrates this connection.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → package.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience uncertainty about correct values. When first-time setup, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → tsconfig.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience uncertainty about correct values and perceive this files as solving related problems. When first-time setup, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → turbo.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience uncertainty about correct values. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → docker-compose.yaml

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience uncertainty about correct values and perceive this files as solving related problems. When first-time setup, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → eliza.postman.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience uncertainty about correct values. When first-time setup, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → README.md

**Strength**: 10/10 | **Types**: `structural`, `hidden`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this shared location creates an implicit grouping in mental navigation. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies tight integration architectural principles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → tsconfig.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience uncertainty about correct values. Team expertise often spans both files due to domain similarity. When first-time setup, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → turbo.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → docker-compose.yaml

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → eliza.postman.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → llms.txt

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](llms.txt)` demonstrates this connection.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → CHANGELOG.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](CHANGELOG.md)` demonstrates this connection.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### llms.txt → CHANGELOG.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `/` directory.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### tsconfig.json → turbo.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### tsconfig.json → docker-compose.yaml

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### tsconfig.json → eliza.postman.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### turbo.json → docker-compose.yaml

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### turbo.json → eliza.postman.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### docker-compose.yaml → eliza.postman.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they tell the story of cohesive root implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/00-index.md → .claude/journal/19-day2-elizaos-analysis.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/19-day2-elizaos-analysis.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/00-index.md → .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/00-index.md → .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/00-index.md → .claude/journal/18-database-integration-breakthrough.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/18-database-integration-breakthrough.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/19-day2-elizaos-analysis.md → .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/19-day2-elizaos-analysis.md → .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/19-day2-elizaos-analysis.md → .claude/journal/18-database-integration-breakthrough.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/18-database-integration-breakthrough.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md → .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md → .claude/journal/18-database-integration-breakthrough.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/18-database-integration-breakthrough.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md → .claude/journal/18-database-integration-breakthrough.md

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. When learning a new codebase, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/journal/18-database-integration-breakthrough.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/journal/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive claude_journal implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/runtime.ts → packages/core/src/database.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/runtime.ts → packages/core/src/actions.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive core_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/runtime.ts → packages/core/src/services.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/runtime.ts → packages/core/src/prompts.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. The runtime initialization pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive core_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/database.ts → packages/core/src/index.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/database.ts → packages/core/src/actions.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/database.ts → packages/core/src/services.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/database.ts → packages/core/src/prompts.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/index.ts → packages/core/src/actions.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive core_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/index.ts → packages/core/src/services.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive core_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/index.ts → packages/core/src/prompts.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/actions.ts → packages/core/src/services.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/actions.ts → packages/core/src/prompts.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/services.ts → packages/core/src/prompts.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/core/src/` directory. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/index.ts → packages/server/src/socketio/index.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`, `hidden`

**Psychological Pattern**  
developers experience confidence in understanding and perceive this files as solving related problems. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/server/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/index.ts → packages/server/src/api/index.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`, `hidden`

**Psychological Pattern**  
Developers experience anxiety about breaking changes. Team expertise often spans both files due to domain similarity. When rolling out API v2, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with undocumented endpoints, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on Express.js middleware. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Server mounts API routes via `app.use("/api", apiRouter)`.`Concretely, this involves Both files reside in`packages/server/src/`directory structure, Uses`setupSocketIO`from target file, Uses`createPluginRouteHandler`from target file, Uses`createApiRouter` from target file.

**Thematic Pattern**  
Together they tell the story of cohesive server_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/index.ts → packages/server/src/bus.ts

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on Express.js middleware. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `packages/server/src/` directory. Concretely, this involves Both files reside in `packages/server/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### django_admin/elizaos/models.py → django_admin/elizaos/admin.py

**Strength**: 10/10 | **Types**: `structural`, `hidden`

**Psychological Pattern**  
developers experience confidence in understanding and discover this files together through directory proximity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `django_admin/elizaos/` directory. Concretely, this involves Both files reside in `django_admin/elizaos/` directory structure.

**Thematic Pattern**  
The directory structure embodies tight integration architectural principles. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### characters/facilitator.character.json → characters/narrative.character.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `characters/` directory. Concretely, this involves Both files reside in `characters/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### characters/facilitator.character.json → characters/regenai.character.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `characters/` directory. Concretely, this involves Both files reside in `characters/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### characters/narrative.character.json → characters/regenai.character.json

**Strength**: 10/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Both files are co-located in `characters/` directory. Concretely, this involves Both files reside in `characters/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/server/src/index.ts

**Strength**: 9/10 | **Types**: `pattern`, `hidden`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the core_typescript and server_typescript domains. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization.

**Thematic Pattern**  
This grouping supports the narrative of cross-cutting concerns. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/server/src/socketio/index.ts

**Strength**: 9/10 | **Types**: `pattern`, `hidden`

**Psychological Pattern**  
developers experience confidence in understanding and discover this files together through directory proximity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the core_typescript and server_typescript domains. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the core_typescript module. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization.

**Thematic Pattern**  
Together they form a complete feature module implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/server/src/api/index.ts

**Strength**: 9/10 | **Types**: `pattern`, `hidden`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. When code review discussions, this creates high-stakes coordination where changes require careful communication. Cross-team collaboration bridges the core_typescript and server_typescript domains. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization.

**Thematic Pattern**  
Together they form a complete feature module implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/core/src/database.ts

**Strength**: 9/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/core/src/actions.ts

**Strength**: 9/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. When code review discussions, this creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on runtime type system. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Together they tell the story of cohesive core_typescript implementation. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/core/src/services.ts

**Strength**: 9/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/core/src/types/index.ts → packages/core/src/prompts.ts

**Strength**: 9/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. This creates high-stakes coordination where changes require careful communication. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Concretely, this involves Both files reside in `packages/core/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → CLAUDE.md

**Strength**: 8/10 | **Types**: `reference`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Documentation references shape onboarding experiences. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The reference uses [MECHANISM] for path resolution. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](CLAUDE.md)` demonstrates this connection. Concretely, this involves Configuration reference or documentation link.

**Thematic Pattern**  
This pattern reflects the project's commitment to clarity. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → .claude/diagnostics/README.md

**Strength**: 8/10 | **Types**: `structural`, `functional`, `hidden`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Mental models converge when working across these boundaries. Moderate trust boundaries allow for some independent evolution. Cross-team collaboration bridges the root and claude_diagnostics domains. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance characteristics are tightly coupled, requiring joint optimization. Example: `[Link Text](.claude/diagnostics/README.md)` demonstrates this connection.

**Thematic Pattern**  
Their partnership reflects the principle of tight integration. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/socketio/index.ts → packages/server/src/api/index.ts

**Strength**: 8/10 | **Types**: `structural`, `functional`, `hidden`

**Psychological Pattern**  
Developers experience anxiety about breaking changes. When rolling out API v2, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with undocumented endpoints, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. The server-side coordination pattern governs initialization order Performance characteristics are tightly coupled, requiring joint optimization. Server mounts API routes via `app.use("/api", apiRouter)`.`Concretely, this involves Both files reside in`packages/server/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. This relationship is foundational to the system's architectural identity. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → package.json

**Strength**: 8/10 | **Types**: `reference`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. README.md serves as the trusted entry point for every developer's journey with ElizaOS. When developers read installation instructions like "npm install" or "npm run dev", they implicitly rely on the fact that these commands are accurately defined in package.json. When learning a new codebase, this creates a psychological contract - the README promises certain capabilities, and package.json must deliver them. Developers feel frustrated when this contract is broken (commands don't work as documented), highlighting how critical this connection is for developer experience and project credibility.

**Technological Pattern**  
The README contains numerous explicit references to package.json scripts and dependencies. Commands like `npm install`, `npm run build`, `npm run test` directly invoke scripts defined in package.json. The README also references minimum Node.js versions and key dependencies, all sourced from package.json. This creates a documentation dependency where README accuracy depends on package.json contents. Modern developers often check both files for consistency, and tools like npm run scripts are meaningless without their package.json definitions.

**Thematic Pattern**  
This relationship embodies the theme of "documentation as promise, configuration as delivery." The README makes promises about what the project can do and how to use it, while package.json contains the actual machinery to fulfill those promises. It's a perfect example of the broader pattern where human-readable documentation must stay synchronized with machine-readable configuration. This pairing also represents the project's public face - README for humans, package.json for tools - working together to create a coherent developer experience.

---

### Important Relationships (6-7)

These relationships support key system integrations.

#### CLAUDE.md → .env

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Spatial proximity reduces cognitive load when context-switching. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.env)` demonstrates this connection.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → package.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this shared location creates an implicit grouping in mental navigation. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](package.json)` demonstrates this connection.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → tsconfig.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience uncertainty about correct values. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During first-time setup, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](tsconfig.json)` demonstrates this connection.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → turbo.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](turbo.json)` demonstrates this connection.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → docker-compose.yaml

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](docker-compose.yaml)` demonstrates this connection.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → eliza.postman.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience gratitude for clear docs and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](eliza.postman.json)` demonstrates this connection.

**Thematic Pattern**  
Their co-location reflects the theme of cohesive feature packaging. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → README.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience uncertainty about correct values and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During first-time setup, this becomes especially important. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → llms.txt

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience uncertainty about correct values and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During first-time setup, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .env → CHANGELOG.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience uncertainty about correct values. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During first-time setup, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Environment variables like `OPENAI_API_KEY` and `DATABASE_URL` Configuration through `process.env.NODE_ENV` Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → llms.txt

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience confidence in understanding and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### package.json → CHANGELOG.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience confidence in understanding and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Scripts like `"build": "turbo run build"` and `"test": "jest"` Dependencies such as `"@elizaos/core": "workspace:*"` Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → tsconfig.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience uncertainty about correct values and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During first-time setup, this becomes especially important. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](tsconfig.json)` demonstrates this connection.

**Thematic Pattern**  
Their co-location reflects the theme of cohesive feature packaging. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → turbo.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this shared location creates an implicit grouping in mental navigation. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](turbo.json)` demonstrates this connection.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → docker-compose.yaml

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](docker-compose.yaml)` demonstrates this connection.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → eliza.postman.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience gratitude for clear docs and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](eliza.postman.json)` demonstrates this connection.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### llms.txt → tsconfig.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience uncertainty about correct values. When first-time setup, this shared location creates an implicit grouping in mental navigation. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with missing example files, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### llms.txt → turbo.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. Spatial proximity reduces cognitive load when context-switching. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `/` directory.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### llms.txt → docker-compose.yaml

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this shared location creates an implicit grouping in mental navigation. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `/` directory.

**Thematic Pattern**  
Their co-location reflects the theme of cohesive feature packaging. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### llms.txt → eliza.postman.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
The filesystem hierarchy enforces a modular organization organization pattern. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### tsconfig.json → CHANGELOG.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling. TypeScript paths like `"@/*": ["./src/*"]` Compiler options such as `"target": "es2020"` Both files are co-located in `/` directory.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### turbo.json → CHANGELOG.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the root module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `/` directory.

**Thematic Pattern**  
This grouping supports the narrative of cohesive root implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### docker-compose.yaml → CHANGELOG.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience confidence in understanding. Spatial proximity reduces cognitive load when context-switching. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `/` directory.

**Thematic Pattern**  
The directory structure embodies locality of reference architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CHANGELOG.md → eliza.postman.json

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Spatial proximity reduces cognitive load when context-switching. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](eliza.postman.json)` demonstrates this connection.

**Thematic Pattern**  
Together they form a complete feature module implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/planning/current-priorities.md → .claude/planning/architecture/elizaos-knowledge-architecture.md

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/architecture/elizaos-knowledge-architecture.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/planning/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/planning/current-priorities.md → .claude/planning/features/character-development-framework.md

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Mental models converge when working across these boundaries. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/features/character-development-framework.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/planning/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/planning/current-priorities.md → .claude/planning/roadmaps/milestone-1-core-agent-framework.md

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/roadmaps/milestone-1-core-agent-framework.md)` demonstrates this connection. Concretely, this involves Both files reside in `.claude/planning/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/diagnostics/01-investigate-group-chat.js → .claude/diagnostics/README.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Spatial proximity reduces cognitive load when context-switching. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `.claude/diagnostics/` directory. Concretely, this involves Both files reside in `.claude/diagnostics/` directory structure.

**Thematic Pattern**  
This grouping supports the narrative of cohesive claude_diagnostics implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/index.ts → packages/server/src/services/message.ts

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Mental models converge when working across these boundaries. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with HTTP request handling through similar APIs. The server-side coordination pattern governs initialization order Performance impacts are isolated through loose coupling. Concretely, this involves Both files reside in `packages/server/src/` directory structure, Uses `messageBusConnectorPlugin` from target file.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/socketio/index.ts → packages/server/src/bus.ts

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with HTTP request handling through similar APIs. The server-side coordination pattern governs initialization order Performance impacts are isolated through loose coupling. Concretely, this involves Both files reside in `packages/server/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/server/src/api/index.ts → packages/server/src/bus.ts

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on Express.js middleware. The server-side coordination pattern governs initialization order Performance impacts are isolated through loose coupling. Concretely, this involves Both files reside in `packages/server/src/` directory structure.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### django_admin/manage.py → django_admin/README.md

**Strength**: 7/10 | **Types**: `structural`

**Psychological Pattern**  
developers experience gratitude for clear docs and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Teams working on these components share domain expertise and communication channels. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Build tools process these files as part of the django module. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Both files are co-located in `django_admin/` directory. Concretely, this involves Both files reside in `django_admin/` directory structure.

**Thematic Pattern**  
This grouping supports the narrative of cohesive django implementation. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/components/chat.tsx → packages/client/src/App.tsx

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. When code review discussions, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Concretely, this involves Both files reside in `packages/client/src/` directory structure.

**Thematic Pattern**  
These files embody the theme of user interaction through complementary roles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/hooks/use-socket-chat.ts → packages/client/src/App.tsx

**Strength**: 7/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience confidence in understanding. Team expertise often spans both files due to domain similarity. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Teams working on these components share domain expertise and communication channels. Mental models align through shared abstractions Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Concretely, this involves Both files reside in `packages/client/src/` directory structure.

**Thematic Pattern**  
Their partnership reflects the principle of locality of reference. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### README.md → django_admin/README.md

**Strength**: 6/10 | **Types**: `functional`, `hidden`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Moderate trust boundaries allow for some independent evolution. Cross-team collaboration bridges the root and django domains. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](django_admin/README.md)` demonstrates this connection.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### .claude/diagnostics/README.md → django_admin/README.md

**Strength**: 6/10 | **Types**: `functional`, `hidden`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. Moderate trust boundaries allow for some independent evolution. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the claude_diagnostics and django domains. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](django_admin/README.md)` demonstrates this connection.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/components/chat.tsx → django_admin/elizaos/models.py

**Strength**: 6/10 | **Types**: `hidden`

**Psychological Pattern**  
Developers experience confidence in understanding. File organization influences how teams think about feature boundaries. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Cross-team collaboration bridges the client and django domains. Recognition patterns form through repeated exposure Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Version control treats them as a cohesive unit for atomic commits. Standard toolchain processing applies Performance impacts are isolated through loose coupling.

**Thematic Pattern**  
Their co-location reflects the theme of cohesive feature packaging. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### packages/client/src/App.tsx → django_admin/elizaos/models.py

**Strength**: 6/10 | **Types**: `hidden`

**Psychological Pattern**  
developers experience confidence in understanding and discover this files together through directory proximity. Moderate trust boundaries allow for some independent evolution. During code review discussions, this becomes especially important. Cross-team collaboration bridges the client and django domains. Expertise transfers through structural similarity Developers often struggle with unclear dependencies, making this connection crucial for maintaining sanity.

**Technological Pattern**  
IDE navigation naturally groups these files in project explorers. Standard toolchain processing applies Performance impacts are isolated through loose coupling.

**Thematic Pattern**  
The directory structure embodies loose coupling architectural principles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

### Notable Relationships (5)

These relationships contribute to system coherence.

#### CLAUDE.md → .claude/journal/00-index.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_journal domains. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Testing strategies must consider their combined effects. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/journal/00-index.md)` demonstrates this connection.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/journal/19-day2-elizaos-analysis.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Low coupling preserves team autonomy and reduces coordination overhead. Cross-team collaboration bridges the root and claude_journal domains. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/journal/19-day2-elizaos-analysis.md)` demonstrates this connection.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/journal/20-group-chat-investigation-and-diagnostic-tools.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_journal domains. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/journal/20-group-chat-investigation-and-diagnostic-tools.md)` demonstrates this connection.

**Thematic Pattern**  
Together they tell the story of cross-cutting concerns. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/journal/21-taxonomy-matrix-vision-and-meta-review.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_journal domains. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/journal/21-taxonomy-matrix-vision-and-meta-review.md)` demonstrates this connection.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/journal/18-database-integration-breakthrough.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. Team expertise often spans both files due to domain similarity. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_journal domains. Expertise transfers through structural similarity Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/journal/18-database-integration-breakthrough.md)` demonstrates this connection.

**Thematic Pattern**  
Together they tell the story of cross-cutting concerns. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/planning/current-priorities.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_planning domains. Recognition patterns form through repeated exposure Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/current-priorities.md)` demonstrates this connection.

**Thematic Pattern**  
Their partnership reflects the principle of locality of reference. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/planning/architecture/elizaos-knowledge-architecture.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Low coupling preserves team autonomy and reduces coordination overhead. Cross-team collaboration bridges the root and claude_planning domains. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Both files interact with the core system through similar APIs. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/architecture/elizaos-knowledge-architecture.md)` demonstrates this connection.

**Thematic Pattern**  
These files embody the theme of modular composition through complementary roles. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/planning/features/character-development-framework.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Low coupling preserves team autonomy and reduces coordination overhead. Cross-team collaboration bridges the root and claude_planning domains. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/features/character-development-framework.md)` demonstrates this connection.

**Thematic Pattern**  
This relationship demonstrates the pattern of functional cohesion. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/planning/roadmaps/milestone-1-core-agent-framework.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
Developers experience gratitude for clear docs. When learning a new codebase, this functional overlap creates shared ownership patterns. Low coupling preserves team autonomy and reduces coordination overhead. Cross-team collaboration bridges the root and claude_planning domains. Learning curves flatten through consistent patterns Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
Runtime behavior shows correlated performance characteristics. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/planning/roadmaps/milestone-1-core-agent-framework.md)` demonstrates this connection.

**Thematic Pattern**  
Their partnership reflects the principle of locality of reference. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

#### CLAUDE.md → .claude/diagnostics/README.md

**Strength**: 5/10 | **Types**: `structural`, `functional`

**Psychological Pattern**  
developers experience gratitude for clear docs and perceive this files as solving related problems. Low coupling preserves team autonomy and reduces coordination overhead. During learning a new codebase, this becomes especially important. Cross-team collaboration bridges the root and claude_diagnostics domains. Mental models align through shared abstractions Developers often struggle with examples that don't work, making this connection crucial for maintaining sanity.

**Technological Pattern**  
They share common dependencies on application framework. Standard toolchain processing applies Performance impacts are isolated through loose coupling. Example: `[Link Text](.claude/diagnostics/README.md)` demonstrates this connection.

**Thematic Pattern**  
Together they tell the story of cross-cutting concerns. The connection enriches the system's conceptual coherence. As the system evolves, this relationship guides architectural decisions and maintains conceptual integrity.

---

_... and 43 more notable relationships_

## Navigation Guide

### How to Use This Matrix

1. **Finding Specific Relationships**: Use your editor's search function to find "`fileA` → `fileB`"

2. **Understanding Dependencies**: Look for files with strength ≥8 relationships to understand critical dependencies

3. **Planning Changes**: Before modifying a file, search for all its relationships to understand impact

4. **Learning the Codebase**: Start with File Summaries, then explore Strong Relationships

### Quick Navigation Links

- [Back to Top](#elizaosregenai-taxonomy-matrix)
- [File Summaries](#file-summaries)
- [Strong Relationships](#strong-relationships-8)
- [Matrix Overview](#matrix-overview)

## Appendices

### Appendix A: Generation Metadata

```json
{
  "generatedAt": "2025-07-21T23:10:22.240Z",
  "totalFiles": 44,
  "totalRelationships": 177,
  "generator": "matrix-generator/06-content-generator-v2.ts",
  "version": "2.0.0",
  "analysisType": "psychological-technological-thematic",
  "lastUpdated": "2025-07-21T23:52:51.639Z",
  "codeExamplesEnhanced": 54,
  "advancedCodeEnhancement": {
    "enhanced": 74,
    "skipped": 103,
    "timestamp": "2025-07-21T23:50:58.512Z"
  },
  "psychologicalEnhancement": {
    "enhanced": 177,
    "timestamp": "2025-07-21T23:52:51.639Z"
  }
}
```

### Appendix B: File Categories

The following categories organize the analyzed files:

- **characters**: Characters
- **claude_diagnostics**: Claude Diagnostics
- **claude_journal**: Claude Journal
- **claude_planning**: Claude Planning
- **client**: Client
- **core_typescript**: Core Typescript
- **django**: Django
- **root**: Root
- **server_typescript**: Server Typescript

### Appendix C: Relationship Types

- **import**: Direct code dependency through import statements
- **structural**: Files in the same directory or category
- **functional**: Files serving related purposes
- **reference**: Explicit references in documentation or configuration
- **semantic**: Content similarity (when implemented)

### Appendix D: Strength Scale

| Strength | Meaning               | Example                           |
| -------- | --------------------- | --------------------------------- |
| 10       | Critical dependency   | Core imports, direct references   |
| 8-9      | Strong relationship   | Important shared functionality    |
| 6-7      | Important connection  | Related features, same subsystem  |
| 4-5      | Moderate relationship | Indirect connections              |
| 1-3      | Weak relationship     | Distant architectural connections |
