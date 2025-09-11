# Milestone B Upgrade Proposal: Information Pipelines Implementation

**Document Type**: Milestone Upgrade Proposal  
**Date**: September 2025  
**Status**: Sessions 1-6 Complete, Session 7 Architecture Defined  
**Version**: 1.0

## Executive Summary

This proposal outlines the implementation of automated information pipelines for Regen Network, building on the existing KOI infrastructure to deliver consistent, high-quality knowledge sharing through daily X posts and weekly digests with 20-minute podcasts powered by Google NotebookLM.

**Goal**: Automate consistent, high-quality knowledge sharing through daily X posts and a weekly digest with a 20-minute podcast, all powered by **Google NotebookLM**.

## Daily Bot — *"Regen Daily"*

- **Trigger:** 12:00 ET weekdays
- **Sources:** All sources from operational KOI infrastructure (forum.regen.network, GitHub repos, Medium, websites, Discord, Twitter, Notion, podcasts) + live ledger/governance data via Regen MCP server
- **Output:** Thread (3–5 posts): headline, stat, 2 links, CTA
- **Guardrails:** Draft-only week 1; style guide from David Fortson / Many Mangos; no speculation

**Acceptance Criteria**

- [ ]  5 weekday drafts produced; include stat + 2 links + CTA
- [ ]  Links valid; no leaks of non-public data

---

## Weekly Digest — *"Regen Weekly"*

- **Workflow:** Curated into NotebookLM → Outline → Brief → Script → Audio Overview
- **Sources:** All KOI data sources + live governance/ledger summaries via Regen MCP server ([regentokenomics.org](https://regentokenomics.org/weekly-meetups?utm_source=chatgpt.com)), transcripts (community calls, Builder Lab, AI standups, token econ WGs)
- **Brief:** 800–1200 words (Markdown, neutral tone)
- **Podcast:** 20 minutes, NotebookLM Audio Overview
- **Hosting:** Pathway to Planetary Regeneration Podcast feed (v0 may use Drive/public link)

**Acceptance Criteria**

- [ ]  2 consecutive Friday briefs (800–1200 words) with citations
- [ ]  2 consecutive 20-min audio overviews, clear & structured
- [ ]  Gregory approves Daily/Weekly in week 1; auto-publish after if quality passes
- [ ]  Permissions fully follow [Regen Knowledge Commons Spec](https://www.notion.so/WIP-Permissions-and-Access-Specification-for-Regen-Knowledge-Commons-V-2-25425b77eda180f59a1febe974ccf53e?pvs=21)

---

## Implementation Plan

### Architecture Overview
Build on existing KOI infrastructure:
- **koi-sensors**: Operational sensor network monitoring all Regen sources
- **koi-processor**: Production-ready BGE embedding pipeline with PostgreSQL storage
- **server-project/indexing**: Comprehensive data source configuration with 15,000+ documents
- **GAIA/mcp**: Existing Regen MCP server for live ledger and governance data

### Phase 1: Data Pipeline Enhancement (Week 1)
**Leverage Existing Infrastructure**
- **Data Sources**: Use all sources from operational `sources.yaml`:
  - GitHub repos (regen-ledger, regen-web, regenie-corpus, mcp)
  - GitLab (regen-public-docs whitepapers)
  - Discourse forums (forum.regen.network, regencommons.discourse.group)
  - Websites (docs.regen.network, guides.regen.network, registry.regen.network, regen.foundation)
  - Medium blog (regen-network.medium.com)
  - Twitter (@regennetwork - add if not in sources.yaml)
  - Discord, Notion, podcasts (when available)
- **KOI Event Bridge**: Extend to capture live ledger activity and governance updates via existing Regen MCP server
- **BGE Embeddings**: Utilize existing 1024-dimensional vectors for content similarity and curation
- **PostgreSQL**: Query existing knowledge base for intelligent content selection

**New Components**:
1. **Daily Content Curator** (`daily_curator.py`)
   - Query recent koi_memories for trending topics
   - Use BGE similarity search for related content
   - Generate stats from Regen MCP server (ledger activity, governance proposals)
   - Create 3-5 post thread structure

2. **Weekly Digest Aggregator** (`weekly_aggregator.py`)
   - Collect and rank content from past week across all sources
   - Generate 800-1200 word briefs with citations
   - Export curated content to NotebookLM format

### Phase 2: NotebookLM Integration (Week 2)
**Google NotebookLM Workflow**:
1. **Content Preparation**: Format weekly digest as sources for NotebookLM
2. **Audio Generation**: Use NotebookLM's Audio Overview feature for 20-min podcasts
3. **Quality Control**: Implement review pipeline before auto-publish

### Phase 3: X Bot Implementation (Week 3)
**Daily Bot "Regen Daily"**:
- **Scheduler**: 12:00 ET weekday trigger using existing KOI coordinator
- **Content Generator**: Use BGE semantic search + LLM for thread creation
- **Safety Guards**: Draft-only mode, style guide compliance, no speculation
- **Output Format**: Thread (3-5 posts) with headline, stat, 2 links, CTA

### Phase 4: Hosting & Distribution (Week 4)
**Weekly Podcast**:
- **Hosting**: Pathway to Planetary Regeneration Podcast feed integration
- **Backup**: Google Drive/public links for v0
- **Automation**: Friday publication schedule

## Repository Strategy
**Primary Development**: `/Users/darrenzal/projects/RegenAI/koi-sensors`
- Leverage existing sensor architecture
- Add new sensors for X posting and podcast generation
- Utilize operational KOI coordinator and event bridge

**Data Processing**: `/Users/darrenzal/projects/RegenAI/koi-processor`
- Extend BGE pipeline for content curation
- Add NotebookLM content formatting
- Implement quality scoring for content selection

**Live Data**: `/Users/darrenzal/projects/RegenAI/GAIA/mcp`
- Use existing Regen MCP server for governance and ledger data
- Integrate real-time credit classes, batches, projects, marketplace data

## Step-by-Step Session Milestones

### Session 1: Setup Twitter/X Sensor & Authentication ✅ COMPLETE (2025-09-10)
**Goal**: Configure Twitter sensor in KOI infrastructure with proper authentication
- [x] Add Twitter configuration to `/koi-sensors/indexing/twitter/config/twitter_sources.yaml`
- [x] Create Twitter sensor adapter in `/koi-sensors/sensors/twitter/twitter_scraper_playwright.py`
- [x] Implement scraping strategy (browser automation via Playwright - no auth required)
- [x] Test connection and fetch sample tweets from @regennetwork (16 tweets collected)
- [x] Verify Twitter content collection (4.5 years of historical data accessible)

**Accomplishments**:
- Created browser-based Twitter scraper using Playwright (no API keys needed)
- Successfully scraped 16 tweets from @regen_network spanning 2021-2025
- Captured engagement metrics (likes, retweets, replies)
- Created comprehensive documentation and setup scripts
- Ensured full replicability with requirements.txt and setup.sh
- Alternative scrapers documented as fallbacks

### Session 2: Create Ledger Query Interface ✅ COMPLETE (2025-09-10)
**Goal**: Build direct interface to query Regen Network blockchain for ledger/governance data
- [x] Create `/koi-sensors/sensors/ledger/` directory with full sensor implementation
- [x] Implement direct RPC/REST queries (bypassed limited MCP server for full access)
- [x] Add governance, ecocredit, and consensus query modules
- [x] Add stats generation functions (total credits, active proposals, etc.)
- [x] Test ledger → KOI event pipeline integration
- [x] Store query templates for daily/weekly use

**Accomplishments**:
- Built direct blockchain connection to Regen Network (RPC + REST endpoints)
- Created comprehensive query modules:
  - `governance_queries.py` - All proposals, votes, parameters
  - `ecocredit_queries.py` - Credit classes, batches, marketplace
  - `consensus_queries.py` - Validators, blocks, network status
  - `stats_aggregator.py` - Daily/weekly statistics generation
- Implemented KOI Event Bridge integration with proper RID generation
- Created reusable query templates for daily tweets and weekly digests
- Verified connectivity: Block height 23,193,922, Credit class C01 accessible
- Full test suite with sample outputs generated

### Session 3: Create GitHub/GitLab Sensor ✅ COMPLETE (2025-09-10)
**Goal**: Build sensor for repository documentation
- [x] Create `/koi-sensors/sensors/github/` directory (already existed)
- [x] Implement GitHub sensor for 4 repos (regen-ledger, regen-web, regenie-corpus, mcp)
- [x] Add GitLab sensor for regen-public-docs (whitepapers)
- [x] Test document extraction from repos (61 documents collected)
- [x] Send documents to KOI Event Bridge (integration ready)
- [x] Verify content indexing (documents properly structured with RIDs)

**Accomplishments**:
- Created `github_sensor.py` with full repository cloning and document extraction
- Created `gitlab_sensor.py` specialized for whitepapers and documentation
- Successfully collected 54 GitHub docs and 7 GitLab docs including whitepapers
- Implemented KOI Event Bridge integration with RID generation
- Created comprehensive test suite (`test_git_sensors.py`)
- Full documentation and README provided

### Session 4: Enhance Website Sensor ✅ COMPLETE (2025-09-10)
**Goal**: Complete website scraper for all Regen sites
- [x] Enhanced existing website sensor in `/koi-sensors/sensors/websites/`
- [x] Add scraping for docs.regen.network (16 pages, 42K chars)
- [x] Add scraping for guides.regen.network (34 pages, 74K chars)
- [x] Add scraping for registry.regen.network (50 pages, 314K chars)
- [x] Add scraping for regen.foundation (6 pages, 33K chars)
- [x] Add scraping for researchretreat.org/papers (4 pages, 15K chars)
- [x] Test content extraction and KOI integration (verified)
- [x] Fixed RID generation issue (removed colon characters)
- [x] Added research note about DeSci.com and discourse graphs to KOI Master Guide

**Accomplishments**:
- Enhanced website sensor with deep crawling capabilities
- Successfully crawled 110 pages across 5 websites
- Extracted 478,213 characters of content
- Fixed RID generation to comply with KOI standards
- Verified KOI Event Bridge integration
- Added Research Retreat papers as high-value academic content
- Documented DeSci research direction for future PDF processing
- Added discourse graphs methodology for structured knowledge extraction
- Created comprehensive test suite and documentation

**Reference**: See `/server-project/indexing/collectors/web_scraper.py` for BeautifulSoup scraping patterns and sitemap parsing

### Session 5: Create Discourse Forum Sensor ✅ COMPLETE (2025-09-10)
**Goal**: Build sensor for forum discussions
- [x] Create `/koi-sensors/sensors/discourse/` directory
- [x] Implement Discourse API client (standalone version without API keys)
- [x] Add forum.regen.network scraping (5 topics collected)
- [x] Add regencommons.discourse.group scraping (5 topics collected)
- [x] Extract governance discussions and proposals (auto-tagging implemented)
- [x] Send to KOI Event Bridge (ready for integration)

**Accomplishments**:
- Created `discourse_sensor.py` with full forum scraping capabilities
- Created `discourse_sensor_standalone.py` for immediate use without dependencies
- Successfully collected 10 topics across both forums (43,654 characters)
- Implemented automatic tagging for governance, ecocredits, marketplace, etc.
- Converted HTML posts to plain text with proper formatting
- Generated KOI-compatible documents with RIDs
- Created comprehensive test suite and documentation
- No API keys required - uses public endpoints

**Reference**: See `/server-project/indexing/collectors/discourse_integration.py` for Discourse API patterns and authentication

### Session 6: Create Medium Blog Sensor ✅ COMPLETE (2025-09-10)
**Goal**: Build sensor for blog posts
- [x] Create `/koi-sensors/sensors/medium/` directory
- [x] Implement Medium scraper for regen-network.medium.com (RSS + web scraping)
- [x] Extract blog posts with metadata (title, author, tags, content)
- [x] Handle historical posts (RSS returns 10, can scrape archives for 100+)
- [x] Test content extraction (5 articles collected successfully)
- [x] Send to KOI Event Bridge (full integration with RID generation)

**Accomplishments**:
- Created `medium_sensor.py` with RSS and multi-strategy web scraping
- Created `medium_sensor_standalone.py` for immediate testing without dependencies
- Successfully collected articles from RSS feed (10 available)
- Extracted clean text content from Medium's complex HTML
- Implemented auto-tagging based on content (governance, ecocredits, climate, etc.)
- Generated KOI-compatible RIDs: `orn:medium.article.{article_id}`
- Created comprehensive test suite with 5 test categories
- Documented collection strategies and fallback methods
- **Decision**: Kept Medium sensor separate from website sensor due to specialized scraping needs

**Reference**: See `/server-project/indexing/medium/` directory for Medium RSS parsing and content extraction

### Session 7: Build Daily Content Curator
**Goal**: Create the daily content selection and thread generation system

**Architecture Decision: Daily Content Curator Design**
The Daily Content Curator will be implemented as a **specialized processor component** within the KOI Processor that queries KOI nodes, rather than being a KOI node itself.

**Key Design Decisions:**
- **Component Type**: Processor/Aggregator (not a KOI node)
- **Location**: `/koi-processor/daily_curator.py`
- **Rationale**:
  - KOI nodes are data sources/sensors that monitor external sources and emit FUN events
  - The Daily Curator is a consumer/aggregator that queries and processes existing data
  - Maintains clean separation of concerns between data sensing (KOI nodes) and content curation (processor)
  - KOI protocol defines two node types: FULL (coordinators) and PARTIAL (sensors) - curator fits neither

**Architecture Flow:**
```
KOI Sensor Network (Full & Partial Nodes)
         ↓ (FUN Events: NEW/UPDATE/FORGET)
    KOI Coordinator (Full Node)
         ↓
   KOI Event Bridge v2
         ↓
  PostgreSQL + BGE Embeddings
         ↓
   Daily Content Curator ← COMPONENT LOCATION
         ↓
    X Bot / Weekly Digest
```

**Implementation Approach:**
- Query PostgreSQL for recent koi_memories (last 24-48 hours)
- Use BGE similarity search for content clustering and trending topics
- Query KOI Coordinator API at `http://localhost:8000` for recent events
- Direct ledger queries via sensor for live statistics
- Generate thread structure (3-5 posts with headline, stat, links, CTA)
- Apply style guide compliance and safety checks
- Output JSON format for X bot consumption

**Integration Points:**
- **PostgreSQL**: Direct queries to koi_memories table for recent content
- **BGE Server**: `http://localhost:8080` for similarity search
- **KOI Coordinator**: REST API for event polling and status
- **Ledger Sensor**: Stats aggregation via coordinator or direct queries

**Tasks:**
- [ ] Create `/koi-processor/daily_curator.py`
- [ ] Implement PostgreSQL query interface for recent content
- [ ] Integrate BGE similarity search for content clustering
- [ ] Build stats aggregation from ledger sensor data
- [ ] Create thread structure generator (3-5 posts)
- [ ] Add style guide compliance checks
- [ ] Generate first test thread output

**Reference**: See `/server-project/indexing/processors/` for BGE embedding generation and similarity search patterns

### Session 8: Implement Weekly Aggregator
**Goal**: Build weekly content collection and ranking system
- [ ] Create `/koi-processor/weekly_aggregator.py`
- [ ] Implement 7-day content collection from all sensors
- [ ] Build content ranking algorithm using BGE embeddings
- [ ] Create citation extraction and formatting
- [ ] Generate test 800-1200 word brief
- [ ] Export to Markdown format

### Session 9: NotebookLM Export Pipeline
**Goal**: Create content formatter for NotebookLM ingestion
- [ ] Create `/koi-processor/notebooklm_formatter.py`
- [ ] Build source document preparation functions
- [ ] Implement structured content export (JSON/CSV)
- [ ] Create metadata preservation system
- [ ] Test with sample weekly digest
- [ ] Document NotebookLM import process

### Session 10: X Bot Draft Generator
**Goal**: Build the X/Twitter bot that creates draft threads
- [ ] Create `/koi-sensors/bots/x_daily_bot.py`
- [ ] Implement thread composition from curator output
- [ ] Add link validation and shortening
- [ ] Create draft storage system (JSON/database)
- [ ] Build preview/review interface
- [ ] Generate 5 test draft threads

### Session 11: Scheduling & Automation
**Goal**: Set up automated triggers and scheduling
- [ ] Create `/koi-sensors/scheduler/daily_scheduler.py`
- [ ] Implement 12:00 ET weekday trigger
- [ ] Add Friday weekly digest trigger
- [ ] Create job queue and error handling
- [ ] Set up monitoring and alerting
- [ ] Test full automation cycle

### Session 12: Quality Control System
**Goal**: Implement review and approval workflow
- [ ] Create `/koi-processor/quality_control.py`
- [ ] Build content validation checks (no speculation, link validity)
- [ ] Implement style guide compliance scoring
- [ ] Create approval interface for Gregory
- [ ] Add auto-publish logic after week 1
- [ ] Set up rollback mechanisms

### Session 13: NotebookLM Audio Pipeline
**Goal**: Automate audio generation workflow
- [ ] Create `/koi-processor/audio_pipeline.py`
- [ ] Document manual NotebookLM Audio Overview process
- [ ] Build audio file retrieval system
- [ ] Implement 20-minute validation check
- [ ] Create audio storage and versioning
- [ ] Test with sample weekly digest

### Session 14: Podcast Publishing System
**Goal**: Set up podcast feed and distribution
- [ ] Create `/koi-processor/podcast_publisher.py`
- [ ] Implement RSS feed generation
- [ ] Set up Google Drive backup storage
- [ ] Create Pathway to Planetary Regeneration integration
- [ ] Build episode metadata system
- [ ] Publish test episode

### Session 15: Permissions & Access Control
**Goal**: Implement Regen Knowledge Commons permissions
- [ ] Create `/koi-processor/permissions.py`
- [ ] Implement permission checking per Commons spec
- [ ] Add content access logging
- [ ] Create audit trail for all generated content
- [ ] Test permission flows
- [ ] Document compliance verification

### Session 16: Monitoring Dashboard
**Goal**: Build system health and metrics dashboard
- [ ] Create `/koi-processor/dashboard.py`
- [ ] Implement pipeline status monitoring
- [ ] Add content generation metrics
- [ ] Create error tracking and alerts
- [ ] Build simple web interface
- [ ] Set up daily/weekly reports

### Session 17: Integration Testing
**Goal**: Test complete end-to-end pipeline
- [ ] Run full daily bot cycle with all sensors
- [ ] Execute weekly digest generation
- [ ] Test NotebookLM export and audio creation
- [ ] Verify all data sources are captured
- [ ] Check permission compliance
- [ ] Document any issues found

### Session 18: Production Deployment
**Goal**: Deploy to production environment
- [ ] Set up production database tables
- [ ] Configure production API keys and credentials
- [ ] Deploy all services with systemd/Docker
- [ ] Set up backup and recovery procedures
- [ ] Create operational runbook
- [ ] Schedule first production run

### Session 19: Documentation & Handoff
**Goal**: Create comprehensive documentation
- [ ] Write user guide for daily bot operation
- [ ] Document weekly digest workflow
- [ ] Create troubleshooting guide
- [ ] Build API documentation
- [ ] Record demo videos
- [ ] Prepare handoff materials for team

## Delivery Artifacts

- **Milestone A (Sessions 1-6):** ✅ COMPLETE - All data source sensors operational (Twitter ✅, Ledger ✅, GitHub ✅, Websites ✅, Discourse ✅, Medium ✅)
- **Milestone B (Sessions 7-12):** Daily content curator + weekly aggregator + X bot + quality control + initial automation
- **Milestone C (Sessions 13-19):** NotebookLM pipeline, audio generation, podcast publishing, monitoring dashboard, production deployment, complete documentation

## Data Source Coverage

### Completed Sensors
- ✅ **Twitter/X** (Session 1) - @regen_network posts via Playwright scraper (16 tweets, 4.5 years)
- ✅ **Ledger** (Session 2) - Direct blockchain queries for governance, ecocredits, consensus
- ✅ **GitHub/GitLab** (Session 3) - Core documentation and whitepapers (61 documents)
- ✅ **Websites** (Session 4) - docs, guides, registry, foundation sites (110 pages, 478K chars)
- ✅ **Discourse** (Session 5) - Forum discussions and governance (10 topics, 44K chars)
- ✅ **Medium** (Session 6) - Blog posts via RSS and scraping (10+ articles, 4.4K words per batch)

### Future Sensors (when resources available)
- 🔴 **Discord** - Blocked: needs bot token
- 🔴 **Notion** - Blocked: needs API access
- 🔴 **Podcast** - Blocked: needs transcription service


### General info about our KOI system: /Users/darrenzal/projects/RegenAI/koi-research/docs/KOI_MASTER_IMPLEMENTATION_GUIDE.md

## Important Reference: Server Project Directory
**Path**: `/Users/darrenzal/projects/RegenAI/server-project/`

This directory contains production-tested collectors and scripts from the server that demonstrate proven patterns for data collection and scraping. **Do not copy code directly**, but use it as a reference for understanding implementation approaches.

Key reference materials:
- `/server-project/indexing/collectors/` - Working implementations of various collectors
  - `git_collector.py` - GitHub/GitLab repository collection
  - `web_scraper.py` - Website scraping with BeautifulSoup
  - `discourse_integration.py` - Forum API integration
  - `twitter_collector.py` - Twitter data collection
  - `notion_transcript_collector.py` - Notion content extraction
- `/server-project/indexing/processors/` - Document processing and embedding generation
- `/server-project/indexing/scripts/` - Utility scripts for testing and running collectors
- `/server-project/indexing/config/sources.yaml` - Complete source configuration examples