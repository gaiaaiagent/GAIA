# Registry Review UX Improvements Needed

**Date:** 2025-11-20
**Status:** In Progress
**Priority:** HIGH

---

## Critical UX Problems Identified

### 1. **"Start a review" requires documents directory path**

**Current Behavior:**
- User says: "Start a review for Botany Farm 2024 project"
- Agent tries to call `start_review` MCP tool with `documents_path` parameter
- MCP tool call hangs/fails because no path was provided
- User sees "Processing..." indefinitely with no feedback

**Desired Behavior:**
- User says: "Start a review for [Project Name]"
- Agent responds immediately with upload instructions
- Agent provides clear guidance on what files are needed
- User can upload files via UI attachment button (📎)
- Agent creates session from uploaded files

**Solution Implemented (Partial):**
- Created `REGISTRY_START_REVIEW` action (characters/actions/registryStartReview.ts)
- Created `REGISTRY_REVIEW_UPLOAD` action (characters/actions/registryReviewUpload.ts)
- Actions not yet working due to build/loading issues

---

### 2. **File upload workflow should be primary method**

**Current State:**
- MCP tools expect `documents_path` (filesystem path)
- Only works if user has documents on local filesystem
- Not suitable for web UI or remote users

**Required Changes:**
- Make file upload the PRIMARY workflow
- Use `start_review_from_uploads` MCP tool with base64-encoded files
- Support drag-and-drop or attachment button upload
- Handle multiple file uploads in single session creation

---

### 3. **User shouldn't specify directories**

**User Feedback:**
> "I don't want the user to have to specify a directory."

**Implementation Requirements:**
1. Agent should prompt for file upload when user starts a review
2. Agent should gracefully handle directory management
3. MCP server should automatically organize uploaded files
4. No user-facing filesystem paths required

---

## Action System Architecture

### Current Actions

1. **REGISTRY_LIST** ✅ Working
   - Lists all registry review sessions
   - Bypasses LLM for direct markdown output
   - Handles empty state gracefully

2. **REGISTRY_DISCOVER_DOCUMENTS** ✅ Working
   - Discovers documents for a session
   - Shows "already discovered" state clearly
   - Loads existing documents if re-run

3. **REGISTRY_START_REVIEW** 🔄 Needs Integration
   - Prompts user to upload files
   - Provides clear upload instructions
   - Guides user through file selection

4. **REGISTRY_REVIEW_UPLOAD** 🔄 Needs Integration
   - Processes uploaded files
   - Creates session from base64-encoded files
   - Calls `start_review_from_uploads` MCP tool

### Integration Issues

**Problem:** Actions in `characters/actions/` directory are not being transpiled
- TypeScript build errors when loading plugin
- Actions need to be properly built or converted to JavaScript

**Options:**
1. Move actions to a proper package (e.g., `packages/plugin-registry-actions`)
2. Convert TypeScript to JavaScript for dynamic loading
3. Inline action definitions in character JSON file
4. Use existing `packages/plugin-registry-upload` package

---

## Testing Strategy

### Test Cases Needed

1. **Test 1.1.2: Create Session** (Currently Failing)
   - User: "Start a review for Test Project Alpha"
   - Expected: Upload prompt, not MCP tool hang
   - Current: Hangs on `CALL_MCP_TOOL` with no response

2. **Test 2.1: Upload Files**
   - User uploads 3 PDFs via attachment button
   - Expected: Session created, documents processed
   - Status: Not yet tested

3. **Test 2.2: Upload + Auto-discovery**
   - User uploads files
   - Expected: Automatic classification and evidence extraction
   - Status: Not yet tested

---

## Implementation Plan

### Phase 1: Fix Action Loading (Immediate)
- [ ] Resolve TypeScript build errors for registry actions
- [ ] Ensure actions are properly registered in plugin
- [ ] Test REGISTRY_START_REVIEW triggers on "start review" prompt
- [ ] Test REGISTRY_REVIEW_UPLOAD processes uploaded files

### Phase 2: MCP Server File Management (Next)
- [ ] Verify `start_review_from_uploads` handles base64 files
- [ ] Ensure automatic directory creation for uploaded files
- [ ] Test file deduplication logic
- [ ] Implement graceful error handling for invalid files

### Phase 3: End-to-End Workflow (Final)
- [ ] Test full workflow: prompt → upload → session creation → discovery
- [ ] Verify no filesystem paths required from user
- [ ] Test with multiple file formats (PDF, shapefiles, GeoJSON)
- [ ] Ensure clear progress feedback at each step

---

## File Upload Workflow (Ideal)

```
User: "Start a review for Botany Farm 2024"
  ↓
Agent (REGISTRY_START_REVIEW):
  "📋 Starting Registry Review for Botany Farm 2024

   To begin, please upload your project documents:
   - Project Description Document (PDD)
   - Monitoring Reports
   - GIS shapefiles or spatial data

   Click the attachment button (📎) below to upload files."
  ↓
User uploads 5 PDFs + 1 shapefile
  ↓
Agent (REGISTRY_REVIEW_UPLOAD):
  "Processing 6 files for registry review..."

  [Calls start_review_from_uploads with base64 files]

  "✅ Registry review session created successfully!

   **Session ID:** session-abc123def456
   **Documents:** 6 files processed
   **Classifications:**
   - 3× Project Description
   - 2× Monitoring Report
   - 1× GIS Shapefile

   Evidence extraction: Completed"
```

---

## Technical Debt

1. **Build System:** TypeScript actions need proper build pipeline
2. **File Handling:** Base64 encoding/decoding needs testing at scale
3. **Error Messages:** Need clear user-facing errors for:
   - Invalid file formats
   - Missing required documents
   - Session creation failures
4. **Performance:** Large file uploads may timeout (need progress indicators)

---

## User Feedback Summary

1. "There's a fundamental UX problem here" - User frustrated with hanging MCP calls
2. "I don't want the user to have to specify a directory" - Filesystem paths inappropriate for UX
3. "The user should have the option to upload documents at any time" - Need flexible upload system
4. "The MCP server / Agent actions should gracefully handle directory management and file management" - Automatic file organization required

---

## Next Steps

1. **Immediate:** Fix TypeScript build for REGISTRY_START_REVIEW and REGISTRY_REVIEW_UPLOAD actions
2. **Test:** Run Test 1.1.2 with new action to verify upload prompt
3. **Validate:** Test file upload with actual PDFs
4. **Document:** Create user-facing guide for file upload workflow
5. **Polish:** Add progress indicators and error handling

---

## Related Files

- `characters/actions/registryStartReview.ts` - Start review action
- `characters/actions/registryReviewUpload.ts` - Upload handler action
- `characters/actions/plugin.ts` - Plugin registration
- `tests/1.1.2-create-session.js` - Session creation test
- `/home/ygg/Workspace/RegenAI/regen-registry-review-mcp` - MCP server with upload tools
