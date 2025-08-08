---
rid: koi:planning:sprint-milestone-1.1.1-core-agent-deployment
created: 2025-01-15
last-modified: 2025-07-15
confidence: high
verification-status: active-sprint-tracking-document
source-type: development-sprint-specification
related:
  - koi:planning:milestone-1-core-agent-framework
  - koi:planning:sprint-template
  - koi:planning:regenai-agent-archetypes
  - koi:technical:elizaos-ecological-plugin-architecture
accuracy-concerns:
  - sprint-progress-updates-in-real-time
  - technical-requirements-may-evolve-during-implementation
  - team-availability-could-affect-delivery-timelines
  - infrastructure-dependencies-subject-to-external-changes
---

# Sprint: Milestone 1.1.1 Core Agent Framework Deployment

**Team:** @Shawn Anderson @Darren Zal

## Deliverables Checklist

### 1.1.1 Core agent framework deployed on cloud infrastructure

- [ ] ElizaOSv2
  - [x] Create v1.2.0 branch for regen AI
  - [ ] Create character file templates for each of the four agent archetypes
  - [ ] Run the webui locally
  - [ ] Run local development database
- [ ] Django
  - [ ] Connect to ElizaOS Local database
- [ ] Docker
  - [ ] Run ElizaOSv2 and Django
  - [ ] Expose Django Admin Dashboard
  - [ ] Expose ElizaOS ClientUI
  - [ ] Expose ElizaOS API

## Resources & Links

- Eliza OS GitHub: https://github.com/elizaOS/eliza
- Documentation: https://eliza.how/
- Regen Ledger GitHub: https://github.com/regen-network/regen-ledger
- Regen JS SDK: https://github.com/regen-network/regen-js

## Execution Steps

### Day 1-2: Set up Eliza OS v2 environment

```bash
# Install ElizaOS CLI
bun install -g @elizaos/cli

# Create Regen Network agent project
elizaos create regen-agents --type project

# Set up multi-agent structure
elizaos create narrative-agent --type agent
elizaos create politician-agent --type agent
elizaos create advocate-agent --type agent
elizaos create voice-of-nature-agent --type agent
```

### Day 2-3: Configure agent personalities using Eliza's character system

- Eliza provides a flexible character system to create diverse agents using character files
- Create character files for each of the 4 agent types
- Leverage Eliza's built-in runtime management

## Notes

- Eliza OS v2 is the first open-source web3-friendly AI Agent Operating System
- Remember: 5 agents total (added RegenAI Facilitator as orchestrator)
