# Regen Network Notion Knowledge Base Integration

## Overview

On August 20, 2025, we integrated 606 indexed documents from Regen Network's Notion workspace into the GAIA agents' knowledge base.

## Integration Details

- **Source Location**: `/home/regenai/project/indexing/notion/`
- **Target Location**: `/opt/projects/GAIA/knowledge/regen-network/notion/`
- **Number of Documents**: 606 markdown files
- **Database Backup**: Created at `/opt/projects/GAIA/backups/20250820_213407/eliza_backup.sql` (716MB)

## Content Structure

```
/opt/projects/GAIA/knowledge/regen-network/notion/
├── manifest.json      # Index manifest with metadata
└── pages/            # 606 indexed Notion pages
```

## Content Categories

The indexed content includes:

### Methodology & Science
- CarbonPlus methodology documentation
- Grazing methodology development
- Soil organic carbon frameworks
- Peer review processes
- Scientific research and literature reviews

### Governance & Community
- DeSci (Decentralized Science) initiatives
- Environmental Stewardship programs
- Token economics working group materials
- Community development calls and meetings

### Projects & Implementation
- Impact agriculture monitoring
- Bioregional development (Argentina, Brazil, Ecuador)
- Registry integration and credit classes
- Farmer onboarding and land steward programs

### Technical Documentation
- Registry 2.0 architecture
- Methodology library development
- Data modules and infrastructure
- Integration guides and APIs

## How Agents Use This Knowledge

The GAIA agents automatically ingest this content through their `KNOWLEDGE_PATH` setting:
- All agents have `KNOWLEDGE_PATH: /opt/projects/GAIA/knowledge`
- Content is loaded on startup and indexed for RAG (Retrieval Augmented Generation)
- Agents can now answer questions about Regen Network methodologies, projects, and governance

## Maintenance

To update the Notion knowledge base:

1. Re-run the crawler:
   ```bash
   cd /home/regenai/project/indexing/notion
   # Run crawler scripts
   ```

2. Backup current database:
   ```bash
   docker exec gaia-postgres-1 pg_dump -U postgres eliza > backups/$(date +%Y%m%d_%H%M%S)/eliza_backup.sql
   ```

3. Copy new content:
   ```bash
   cp -r /home/regenai/project/indexing/notion/storage/pages /opt/projects/GAIA/knowledge/regen-network/notion/
   cp /home/regenai/project/indexing/notion/storage/manifest.json /opt/projects/GAIA/knowledge/regen-network/notion/
   ```

4. Restart agents to load new content

## Important Notes

- This content is derived from Regen Network's internal Notion and should be treated as confidential
- Do NOT place README or meta-documentation files within the knowledge directory as they will be ingested by agents
- The knowledge directory should only contain actual knowledge content, not documentation about the system