# Registry Agent Feedback & Requirements

**Purpose:** Capture user feedback on agent behavior to guide improvements.
**Last Updated:** 2025-11-19
**Character Version:** v0.1.0 (baseline)

---

## Feedback Format

Each entry should capture:
- **Date:** When the feedback was observed
- **Context:** What you were doing / what you asked
- **Observed Behavior:** What the agent actually did
- **Desired Behavior:** What you wanted instead
- **Priority:** High / Medium / Low
- **Status:** Open / Addressed / Validated

---

## Evaluation Framework: CRUD List View

**User Prompt:** "Hi can you list all existing registry review projects?"

**Independent Components to Evaluate:**

### 1. MCP Tool Response Quality
- ✅ Tool exists: `list_sessions()`
- ✅ Returns structured data: session_id, project_name, status, created_at, methodology, etc.
- ✅ Has formatting helper: `format_sessions_list()`
- Current format: Numbered list with indented details (80-char separator lines)
- **Evaluation:** Does the MCP response contain all necessary fields? Is data complete?

### 2. Action Layer (if exists)
- Status: Need to check if custom `REGISTRY_LIST_PROJECTS` action exists
- If not: Agent relies on generic MCP tool calling
- **Evaluation:** Does action properly invoke MCP? Handle errors? Format response?

### 3. Character Response Quality
**What to evaluate:**
- **Formatting:** Is the list clear, scannable, aesthetically pleasing?
- **Completeness:** Are all important fields shown? Any missing context?
- **Compactness:** Is it concise without excessive spacing/verbosity?
- **Helpfulness:** Does it suggest next steps? Provide guidance?
- **Context:** Does it explain what you're seeing?

**Desired list view qualities:**
- Clean visual hierarchy
- Easy to scan project names and status
- Consistent formatting
- Compact (no excessive line breaks)
- Shows key metadata (name, status, date, methodology)
- Offers actionable next steps

### 4. messageExample Needed
- **Scenario:** User asks to list projects → Agent shows clean CRUD list
- **Value:** Demonstrates proper list formatting pattern
- **Priority:** High (core CRUD operation)

---

## Active Feedback

### 2025-11-19 - List Projects CRUD Response Evaluation

**Context:**
User prompt: "Hi can you list all existing registry review projects?"

**Observed:**
```
Here are the current registry review projects:

1. Botany Farm 2022-2023 (Session ID: session-2a5da7eb539c)
   - Status: Initialized
   - Methodology: Soil Carbon v1.2.2
   - Documents Found: 7
   - Most Advanced Project: Has completed document discovery

2. Test Project (Multiple Sessions)
   - 3 separate sessions with "Test Project" name
   - All in initialization stage
   - Methodology: Soil Carbon v1.2.2

3. Project 1 and Project 2
   - Both in initialization stage
   - Methodology: Soil Carbon v1.2.2

Currently, these projects are in early stages, with most still in the initialization or document discovery phase. The Botany Farm 2022-2023 project appears to be the most progressed, having already discovered 7 documents.

Would you like more details about any of these projects or help starting a new registry review?
```

**Component Analysis:**

**MCP Layer:** ✅ Working correctly
- Tool called successfully
- Data retrieved properly

**Character Response Quality:**
✅ **Strengths:**
- Clear numbering and hierarchy
- Key information highlighted (Session ID, Status, Methodology)
- Good contextual summary ("most progressed")
- Helpful next step offered
- Reasonably compact formatting

⚠️ **Issues to consider:**
1. **Grouped projects inconsistently** - "Test Project" shows count but not individual sessions, while others show full details
2. **"Project 1 and Project 2"** - Are these separate or grouped? Unclear
3. **Missing created dates** - Would be helpful for recency
4. **Session IDs only shown for Botany Farm** - Inconsistent
5. **"Multiple Sessions" handling** - Should we show all sessions or just count? User might want to see individual session IDs

**Desired:**
For CRUD list consistency, either:
- **Option A (Summary):** Show all projects with counts if duplicates, hide session IDs unless only one
- **Option B (Detailed):** Show every session as separate item with full details (session ID, date, status)

**Questions for you:**
1. Should duplicate project names be grouped or shown separately?
2. Should session IDs always be visible or only on request?
3. Should created dates be shown in the list?
4. What's most important for scanning: project name, status, or date?

**Priority:** Medium - Response is functional but could be more consistent

**Status:** Resolved - MCP updated with standardized format ✅

**Resolution:** MCP engineer implemented the standardized format successfully.

**Next Step:** Test agent response to verify it properly presents the MCP data.

---

### 2025-11-19 - MCP Format Verification

**Context:** Testing updated MCP `list_sessions` output

**MCP Layer Output:** ✅ **PERFECT**
- Heavy separators (━) rendering correctly
- All sections present (Core Identity, Project Info, Workflow Stage, Statistics)
- Consistent field layout across all sessions
- Null handling working ("-" for missing values)
- Date formatting human-readable
- Workflow stage computation accurate
- Compact statistics formatting

**Ready for Agent Testing:** YES
Now need to test: "Hi can you list all existing registry review projects?"

---

### 2025-11-19 - Agent CRUD List Response Issue

**Context:** User asks: "Hi can you list all existing registry review projects?"

**Agent Response:**
```
I see we have 16 existing registry review projects in the system. Most of these are test or example projects, but I noticed a few interesting details:

The most recently active project appears to be "Botany Farm 2022-2023" (session ID: session-2a5da7eb539c), which has already completed its document discovery phase and found 7 documents. This project is currently in the "initialized" status and is using the soil-carbon-v1.2.2 methodology.

The other projects are mostly in "initialized" status, with a few marked as "in_progress". They all seem to be using the same soil-carbon methodology and are located in the same example documents directory.

Would you like me to help you explore any of these specific projects in more detail? I can load a session, review its documents, or help you start a new review if you're interested.
```

**Problem:** ❌ **Agent is summarizing instead of displaying**
- The MCP returns beautiful, structured, scannable list format
- Agent interprets the data and writes prose summary
- User loses ability to scan all sessions at once
- Misses the point of standardized CRUD list view

**Expected Behavior:**
Agent should **pass through** the MCP formatted output directly, possibly with minimal context before/after, but NOT summarize or rewrite it.

**Ideal Response:**
```
Here are all existing registry review sessions:

[FULL MCP OUTPUT WITH ALL SESSIONS]

You can load any session by its ID, or I can help you start a new review.
```

**Root Cause Analysis:**

**Possible causes:**
1. **Character system prompt** - May be instructing to "explain" or "summarize" data
2. **No messageExample** - No pattern showing "display raw structured data"
3. **Model behavior** - Claude tends to be helpful by summarizing unless told otherwise
4. **Missing instruction** - Need explicit "display tool output directly" guidance

**Desired:** ✅ **Priority: HIGH**
For CRUD list operations, agent should display structured data directly, not summarize.

**Status:** In Progress - Testing multiple approaches

**Attempts Made:**

1. **Style Guideline (v0.1.1)** - ❌ FAILED
   - Added: "Display structured data from tools directly without summarizing"
   - Result: Agent ignored it, still summarized

2. **messageExample (v0.1.2)** - ❌ FAILED
   - Added example showing direct display pattern
   - Result: Agent still summarized, missing all structured format patterns
   - Test: 0/10 required patterns, 1/5 anti-patterns detected
   - Actual response: "Great news! I found 4 existing registry review projects..." (prose summary)

**Key Insight:** Style guidelines and messageExamples alone are insufficient to override Claude's default "helpful summarization" behavior for tool outputs.

**Next Approaches to Try:**
1. System prompt update with explicit instruction
2. Custom action for CRUD operations
3. Combination approach (system prompt + messageExample)

**Semantic Acceptance Criteria** (replacing rigid pattern matching):
- ✅ Shows all sessions (not cherry-picked)
- ✅ All key fields visible for each session (session_id, project_name, status, methodology, documents_path, stage, documents_found)
- ✅ Scannable format (user can quickly find what they need)
- ✅ Proportional length (not collapsed into few sentences)
- ❌ Don't summarize into prose ("I found X projects...")
- ❌ Don't interpret or analyze ("appears to be...", "most progressed...")
- ❌ Don't add excessive helpfulness ("Would you like me to...")

---

### 2025-11-19 - Session Schema Documentation

**Complete Session Schema** (from `Session` model in MCP):

```
Session {
  session_id: str
  created_at: datetime
  updated_at: datetime
  status: str

  project_metadata: {
    project_name: str
    project_id: str | null
    crediting_period: str | null
    submission_date: datetime | null
    methodology: str (default: "soil-carbon-v1.2.2")
    proponent: str | null
    documents_path: str (absolute path)
  }

  workflow_progress: {
    initialize: "pending" | "in_progress" | "completed"
    document_discovery: "pending" | "in_progress" | "completed"
    evidence_extraction: "pending" | "in_progress" | "completed"
    cross_validation: "pending" | "in_progress" | "completed"
    report_generation: "pending" | "in_progress" | "completed"
    human_review: "pending" | "in_progress" | "completed"
    complete: "pending" | "in_progress" | "completed"
  }

  statistics: {
    documents_found: int
    requirements_total: int
    requirements_covered: int
    requirements_partial: int
    requirements_missing: int
    validations_passed: int
    validations_failed: int
  }
}
```

**User's Desired Fields for List View:**
1. ✅ Date started → `created_at`
2. ✅ Working directory → `project_metadata.documents_path`
3. ✅ Stage that it's at → `workflow_progress` (current stage)
4. ✅ Methodology → `project_metadata.methodology`
5. ✅ Documents found → `statistics.documents_found`

**Additional Available Fields** (could be useful):
- `session_id` - Unique identifier
- `status` - Overall status string
- `updated_at` - Last modified
- `project_metadata.project_id` - Official Regen ID (if available)
- `project_metadata.proponent` - Project owner
- `statistics.requirements_covered/partial/missing` - Progress metrics

**Design Decision - FINALIZED:**
Show **complete standardized schema** for every session:
- ✅ All Core Identity fields (session_id, created_at, updated_at, status)
- ✅ All Project Info fields (all 7 fields from project_metadata)
- ✅ All Statistics fields (all 7 fields from statistics)
- ✅ Current workflow stage (derived from workflow_progress)

**Ideal List Format:**

```
Registry Review Sessions (6 sessions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: session-2a5da7eb539c
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Identity:
  Session ID        : session-2a5da7eb539c
  Created At        : 2025-11-18 14:32:15 UTC
  Updated At        : 2025-11-19 09:15:42 UTC
  Status            : in_progress

Project Info:
  Project Name      : Botany Farm 2022-2023
  Project ID        : C01-001
  Methodology       : soil-carbon-v1.2.2
  Documents Path    : /home/ygg/Workspace/RegenAI/examples/22-23
  Proponent         : Nick Denman
  Crediting Period  : 2022-01-01 to 2023-12-31
  Submission Date   : 2023-02-15

Workflow Stage:
  Current Stage     : document_discovery (completed)
  Next Stage        : evidence_extraction (pending)

Statistics:
  Documents Found   : 7
  Requirements      : 4 / 23 covered, 2 partial, 17 missing
  Validations       : 12 passed, 3 failed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Session: session-abc123def456
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Core Identity:
  Session ID        : session-abc123def456
  Created At        : 2025-11-19 10:45:23 UTC
  Updated At        : 2025-11-19 10:45:23 UTC
  Status            : initialized

Project Info:
  Project Name      : Test Project
  Project ID        : -
  Methodology       : soil-carbon-v1.2.2
  Documents Path    : /home/ygg/Workspace/RegenAI/examples/test
  Proponent         : -
  Crediting Period  : -
  Submission Date   : -

Workflow Stage:
  Current Stage     : initialize (completed)
  Next Stage        : document_discovery (pending)

Statistics:
  Documents Found   : 0
  Requirements      : 0 / 23 covered, 0 partial, 23 missing
  Validations       : 0 passed, 0 failed
```

**Key Design Choices:**
1. **Consistent field layout** - Same fields in same order for every session
2. **Clear visual separation** - Heavy separator lines between sessions
3. **Aligned labels** - Right-aligned labels with colons for scanability
4. **Null handling** - Use "-" for null/empty values, never omit fields
5. **Computed current stage** - Derive from workflow_progress object
6. **Compact statistics** - Consolidate requirements into one line
7. **Session as primary identifier** - Each session is separate entry

---

## Resolved Feedback

(Feedback items that have been addressed and validated)

---

## Requirements Extracted from Feedback

(High-level requirements derived from patterns in feedback)

---

## Notes

- Add new feedback at the top of "Active Feedback" section
- Move to "Resolved Feedback" when addressed and validated
- Extract patterns into "Requirements" section when multiple pieces of feedback point to same issue
