# Registry Assistant Test Strategy

**Date:** 2025-11-20
**Purpose:** Systematic testing approach for the Regen Registry Assistant, starting with foundational MCP operations and building up to complex workflows.

---

## Testing Philosophy

1. **Bottom-Up Approach**: Test foundational MCP tools first, then actions, then workflows
2. **Isolation**: Each test should be independent and not rely on previous test state
3. **Cleanup**: Tests should clean up after themselves (delete created sessions)
4. **Documentation**: Every test case should be documented with expected behavior
5. **Visual Verification**: Use Playwright for UI testing, keep browser open for inspection

---

## Test Hierarchy

```
Level 1: MCP Tool Tests (Foundation)
├── Session Management
├── Document Discovery
├── Requirement Mapping
└── Evidence Extraction

Level 2: Custom Action Tests
├── REGISTRY_LIST
├── REGISTRY_DISCOVER_DOCUMENTS
└── Future actions...

Level 3: Workflow Tests
├── Complete review workflow
├── Error handling flows
└── Edge cases
```

---

## Level 1: MCP Tool Tests

### 1.1 Session Management Tests

#### Test Case 1.1.1: List All Sessions (Empty State)
**MCP Tool:** `list_sessions`
**Precondition:** Fresh database or no sessions exist
**Expected Result:** Empty list or "No sessions found"
**Success Criteria:**
- Tool returns valid JSON structure
- No errors thrown
- Clear empty state message

#### Test Case 1.1.2: Create New Session
**MCP Tool:** `start_review`
**Input:**
```json
{
  "project_name": "Test Project Alpha",
  "documents_path": "/path/to/test/documents",
  "methodology": "test-methodology-v1.0"
}
```
**Expected Result:**
- New session created with unique ID
- Session ID format: `session-[a-f0-9]{12}`
- Session metadata stored correctly
- Documents auto-discovered (if path contains files)

**Success Criteria:**
- Returns valid session object
- Session ID is unique
- Can load session by ID immediately after creation

#### Test Case 1.1.3: Create Duplicate Session (Deduplication)
**MCP Tool:** `start_review`
**Precondition:** Session already exists for "Test Project Alpha"
**Input:** Same as 1.1.2
**Expected Behavior:**
- Should detect duplicate project
- Either:
  - Return existing session ID, OR
  - Ask user for confirmation, OR
  - Auto-increment project name (e.g., "Test Project Alpha (2)")

**Success Criteria:**
- No duplicate sessions with identical metadata
- User is informed of existing session
- Clear guidance on next steps

#### Test Case 1.1.4: Load Existing Session
**MCP Tool:** `load_session`
**Precondition:** Session created in 1.1.2
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
- Complete session data returned
- Includes: metadata, documents, requirements, workflow stage

**Success Criteria:**
- All session fields populated correctly
- Document count matches what was discovered
- Workflow stage is accurate

#### Test Case 1.1.5: Load Non-Existent Session
**MCP Tool:** `load_session`
**Input:** `{ "session_id": "session-nonexistent" }`
**Expected Result:** `SessionNotFoundError`
**Success Criteria:**
- Clear error message
- Suggests checking session ID with `list_sessions`

#### Test Case 1.1.6: Delete Session
**MCP Tool:** (Assuming `delete_session` exists)
**Precondition:** Test session created
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
- Session removed from database
- Subsequent `load_session` returns SessionNotFoundError
- `list_sessions` no longer includes deleted session

**Success Criteria:**
- Clean deletion
- No orphaned data
- Confirmation message returned

#### Test Case 1.1.7: List Sessions After Creation
**MCP Tool:** `list_sessions`
**Precondition:** 3 test sessions created
**Expected Result:**
- List contains all 3 sessions
- Each session has: ID, name, created date, status
- Sessions sorted by creation date (newest first)

**Success Criteria:**
- Complete session metadata
- Proper formatting
- Correct count

---

### 1.2 Document Discovery Tests

#### Test Case 1.2.1: Discover Documents (Fresh Session)
**MCP Tool:** `discover_documents`
**Precondition:** New session created WITHOUT auto-discovery
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
- Documents found and classified
- Returns: `{ documents: [...], total_count: N, classification_summary: {...} }`

**Success Criteria:**
- All PDFs in directory discovered
- Classification confidence > 0.7
- Document types correctly identified

#### Test Case 1.2.2: Discover Documents (Already Discovered)
**MCP Tool:** `discover_documents`
**Precondition:** Documents already discovered for session
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
```json
{
  "documents_found": 0,
  "duplicates_skipped": 7,
  "message": "Documents already discovered for this session"
}
```

**Success Criteria:**
- No duplicate document entries
- Clear message about existing documents
- Existing document count reported

#### Test Case 1.2.3: Discover Documents (Empty Directory)
**MCP Tool:** `discover_documents`
**Precondition:** Session with empty documents directory
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
```json
{
  "documents_found": 0,
  "total_count": 0,
  "message": "No documents found in directory"
}
```

**Success Criteria:**
- Graceful handling of empty directory
- No errors thrown
- Helpful message to user

#### Test Case 1.2.4: Discover Documents (Invalid Path)
**MCP Tool:** `discover_documents`
**Precondition:** Session with non-existent documents path
**Expected Result:** Error indicating invalid path
**Success Criteria:**
- Clear error message
- Suggests checking path configuration

---

### 1.3 Requirement Mapping Tests

#### Test Case 1.3.1: Map All Requirements
**MCP Tool:** `map_all_requirements`
**Precondition:** Session with discovered documents
**Input:** `{ "session_id": "session-xxxxx" }`
**Expected Result:**
- All methodology requirements mapped to documents
- Coverage statistics returned

**Success Criteria:**
- Requirements mapped to correct document types
- Coverage percentages accurate
- Partial matches identified

#### Test Case 1.3.2: Map Requirements (No Documents)
**MCP Tool:** `map_all_requirements`
**Precondition:** Session with no documents
**Expected Result:** Error or message indicating no documents to map

**Success Criteria:**
- Graceful error handling
- Suggests discovering documents first

---

## Level 2: Custom Action Tests

### 2.1 REGISTRY_LIST Action Tests

#### Test Case 2.1.1: List Sessions (Aesthetic Mode)
**Action:** `REGISTRY_LIST`
**User Input:** "List all sessions"
**Expected Behavior:**
- Action triggers (not CALL_MCP_TOOL)
- Returns formatted session list
- Proper markdown spacing
- Action badge shows "REGISTRY_LIST Completed"

**Success Criteria:**
- LLM selects REGISTRY_LIST action
- Output bypasses LLM interpretation
- Markdown renders correctly
- No paragraph-list merging issues

#### Test Case 2.1.2: List Sessions (Empty State)
**Action:** `REGISTRY_LIST`
**User Input:** "Show me all registry sessions"
**Precondition:** No sessions exist
**Expected Result:**
- Action triggers
- Message: "No review sessions found."
- Helpful suggestion to create first session

---

### 2.2 REGISTRY_DISCOVER_DOCUMENTS Action Tests

#### Test Case 2.2.1: Discover New Documents
**Action:** `REGISTRY_DISCOVER_DOCUMENTS`
**User Input:** "Discover documents for session session-xxxxx"
**Precondition:** Fresh session, documents not yet discovered
**Expected Result:**
- Action triggers
- Documents discovered and listed
- Document types shown with counts
- Proper markdown formatting

**Success Criteria:**
- Action badge: "REGISTRY_DISCOVER_DOCUMENTS Completed"
- Document list with bullet points
- Confidence scores shown
- Next steps suggested

#### Test Case 2.2.2: Discover Already-Discovered Documents
**Action:** `REGISTRY_DISCOVER_DOCUMENTS`
**User Input:** "Discover documents for session session-xxxxx"
**Precondition:** Documents already discovered
**Expected Result:**
- Action triggers
- Header: "📋 **7 documents** already discovered for session..."
- Full document list shown
- Duplicates skipped count shown

**Success Criteria:**
- Clear "already discovered" message
- Complete document details provided
- No confusing "No documents found" message

#### Test Case 2.2.3: Discover Documents (Session Not Found)
**Action:** `REGISTRY_DISCOVER_DOCUMENTS`
**User Input:** "Discover documents for session session-invalid"
**Precondition:** Session doesn't exist
**Expected Result:**
- Action triggers
- Error: "❌ Session `session-invalid` not found."
- Suggestion: "Please verify the session ID or create a new session first."

**Success Criteria:**
- Clear error message
- Action badge shows "Error"
- Helpful guidance provided

---

## Level 3: Workflow Tests

### 3.1 Complete Review Workflow

#### Test Case 3.1.1: End-to-End Happy Path
**Steps:**
1. Create new session
2. Discover documents
3. Map requirements
4. Extract evidence
5. Generate review report

**Expected Result:**
- All steps complete successfully
- Workflow progresses correctly
- Data persists between steps

**Success Criteria:**
- Complete review generated
- All requirements addressed
- Evidence properly extracted

---

## Test Implementation Plan

### Phase 1: Foundation (Week 1)
- [ ] Implement MCP tool tests (1.1 - 1.3)
- [ ] Create test data sets (sample projects, documents)
- [ ] Set up test database isolation
- [ ] Document test results

### Phase 2: Actions (Week 2)
- [ ] Implement custom action tests (2.1 - 2.2)
- [ ] Create visual Playwright tests
- [ ] Verify action selection by LLM
- [ ] Document UI behavior

### Phase 3: Workflows (Week 3)
- [ ] Implement end-to-end tests (3.1)
- [ ] Test error recovery
- [ ] Test edge cases
- [ ] Performance testing

---

## Test Data Requirements

### Sample Projects
1. **Botany Farm 2024** - Complete project with all document types
2. **Empty Project** - No documents
3. **Partial Project** - Missing some document types
4. **Invalid Project** - Malformed files

### Sample Sessions
- Fresh session (no documents)
- Session with documents discovered
- Session with requirements mapped
- Completed session

---

## Test Execution

### Test Runner
```bash
# Run all MCP tool tests
bun test tests/mcp-tools/*.test.ts

# Run all action tests
bun test tests/actions/*.test.ts

# Run Playwright UI tests
node tests/playwright/registry-*.js
```

### Test Isolation
Each test should:
1. Create its own test session
2. Use unique project names
3. Clean up after completion
4. Not depend on other tests

---

## Success Metrics

- **Coverage:** 100% of MCP tools tested
- **Reliability:** All tests pass consistently
- **Speed:** Full test suite runs in < 5 minutes
- **Clarity:** Test failures provide actionable error messages

---

## Next Steps

1. Review this strategy with team
2. Implement test infrastructure
3. Create test data sets
4. Write and run Phase 1 tests
5. Iterate based on findings
