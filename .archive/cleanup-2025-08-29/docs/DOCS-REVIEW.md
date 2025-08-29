# Documentation Review and Consolidation Plan

## Essential Docs to KEEP (5 files)
- **AGENT-STARTUP-GUIDE.md** - Production critical, actively used
- **README.md** - Project overview
- **TELEGRAM-BOT-SETUP.md** - User guide for Regen team
- **AGENT-OPERATIONS.md** - Detailed operations guide
- **KOI-SYSTEM.md** - KOI infrastructure documentation

## Potentially Redundant Docs (22 files)

### Category 1: Outdated Deployment Docs (DELETE)
- **DEPLOYMENT-QUICK-REFERENCE.md** - Old deployment info
- **DEPLOYMENT-WORKFLOW.md** - Superseded by current practice
- **DEVELOPMENT-WORKFLOW.md** - Old workflow
- **STABLE-DEPLOYMENT-WORKFLOW.md** - Our planning doc, ideas captured
- **IMMEDIATE-SAFETY-ACTIONS.md** - Actionable items extracted

### Category 2: Analysis/Planning Docs (DELETE after extracting key info)
- **DOCKER-FILE-ANALYSIS.md** - Analysis complete
- **MESSAGE-FLOW-ANALYSIS.md** - Analysis complete
- **MODEL-PERFORMANCE-COMPARISON.md** - Test results, archive
- **ELIZAOS-GITHUB-ISSUE-STRATEGY.md** - One-time analysis
- **REFACTORING-SUGGESTION.md** - Ideas captured
- **GITHUB-SETUP.md** - Basic GitHub info

### Category 3: Plugin Issues/Troubleshooting (CONSOLIDATE into one doc)
- **ELIZA_KNOWLEDGE_PLUGIN_ISSUES.md** - Old issues
- **PLUGIN-DEVELOPMENT.md** - Generic info
- **PLUGIN-KNOWLEDGE-CHANGES.md** - Old changelog
- **RAG_TROUBLESHOOTING_GUIDE.md** - Old issues
- **TROUBLESHOOTING-PLUGINS.md** - Old issues
- **DJANGO-ADMIN-TROUBLESHOOTING.md** - Could be useful

### Category 4: Telegram Docs (CONSOLIDATE into TELEGRAM-BOT-SETUP.md)
- **TELEGRAM-ENV-WORKAROUND.md** - Workaround applied
- **TELEGRAM-MENTION-ONLY-MODE.md** - Feature documented
- **TELEGRAM-SETUP-LESSONS.md** - Lessons learned
- **TELEGRAM-TECHNICAL-REFERENCE.md** - Might be useful to keep

### Category 5: Process Docs (MERGE into AGENT-OPERATIONS.md)
- **NOTION-INTEGRATION.md** - Process documented

## Consolidation Strategy

### Option A: Aggressive Cleanup (Recommended)
Keep only 5 essential + 1 troubleshooting guide:
- AGENT-STARTUP-GUIDE.md
- README.md
- TELEGRAM-BOT-SETUP.md
- AGENT-OPERATIONS.md
- KOI-SYSTEM.md
- TROUBLESHOOTING.md (new, consolidates all issues)

### Option B: Moderate Cleanup
Keep essentials + useful references:
- 5 essential docs
- TELEGRAM-TECHNICAL-REFERENCE.md
- DJANGO-ADMIN-TROUBLESHOOTING.md
- Consolidated TROUBLESHOOTING.md

### Option C: Conservative
Keep essentials + category consolidations:
- 5 essential docs
- TROUBLESHOOTING.md (all plugin/django issues)
- TELEGRAM-REFERENCE.md (all telegram docs)
- DEPLOYMENT-HISTORY.md (what we tried and learned)

## Recommendation

Go with **Option A**: Reduce from 27 docs to 6 total. 

Key information from deleted docs should be:
1. Extracted and added to CLAUDE.md if critical
2. Moved to project wiki if historical
3. Archived in .archive/ if potentially useful later

This gives us a clean, maintainable documentation set where every file has a clear purpose and is actively maintained.