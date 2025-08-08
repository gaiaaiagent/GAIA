---
rid: koi:resources:gaiaai-rfc-response-links-collection
created: 2025-07-02
last-modified: 2025-07-15
confidence: high
verification-status: project-resource-links-collection
source-type: project-documentation-references
related:
  - koi:transcript:gaiaai-team-partnership-response-meeting
  - koi:proposal:gaia-regen-partnership-strategic-vision
  - koi:tokenomics:regen-fixed-cap-dynamic-supply-model
accuracy-concerns:
  - notion-links-may-require-authentication-access
  - google-doc-sharing-permissions-may-have-changed
  - file-download-links-may-have-expiration-timestamps
  - ip-license-frameworks-evolving-rapidly
---

# GAIA AI RFC Response Documentation Links

## Core Partnership Documentation

https://regennetwork.notion.site/Gaia-AI-RFC-1fa25b77eda18071a92cdc048fd5883d
https://forum.regen.network/discussion/26631-Fixed%20Cap,%20Dynamic%20Supply
Transcript for meeting with gregory: https://file.notion.so/f/f/7afd522c-2eb9-4a3a-85fd-37054c3e10e4/220be103-bb8d-487a-b763-46d58cdd9ecb/Darrens_Meeting_Notes_(2).txt?table=block&id=201b9462-fa82-806f-b39f-dcb3804ec781&spaceId=7afd522c-2eb9-4a3a-85fd-37054c3e10e4&expirationTimestamp=1748995200000&signature=s8F3ZPOXvOST-k13rgy_c1ria0ST1Bh29p9WNo6NTkc&downloadName=transcript.txt
Our response in Notion: https://gaiaai.notion.site/Gaia-AI-x-Regen-RFC-207b9462fa8280ac9fced6e7ab428e5e
IP license ideas
https://wiki.p2pfoundation.net/Copyfair
https://www.story.foundation/

Re: Fixed Cap, Dynamic Supply - Taking the Next Steps
https://docs.google.com/document/d/1VN5Y9hYnChivyZmJLQc_MG8jPiIk-cguImoKUv85b7M/edit?tab=t.0#heading=h.techw13vdvm0

Carrying-capacity model by Zargham:
https://github.com/mzargham/carrying-capacity/blob/main/carrying_capacity.ipynb

regen/Token/Fixed Cap, Dynamic Supply
https://forum.regen.network/discussion/26631-Fixed%20Cap,%20Dynamic%20Supply

Anchoring Ethical Capital Formation: The Case for a Fixed Cap, Dynamic Supply in $REGEN Tokenomics
https://medium.com/@gregorylandua/anchoring-ethical-capital-formation-the-case-for-a-fixed-cap-dynamic-supply-in-regen-tokenomics-a8d2e0d1719d

1 — Availability & Capacity
What
Detail
When
Core team
Colin Ewan (systems & token design), Darren Zal (knowledge-graph & agent orchestration), Shawn Anderson (data pipelines & governance automation), plus two senior full-stack/LLM engineers on call
Ready now
Relevant track record
• Deployed multi-agent A/B narrative pods for three Web3 clients (110k aggregate followers)
• Built cross-chain governance dashboards (Cosmos ↔︎ EVM)
• Designed and executed token-liquidity playbooks (>$50 m TVL moved)
2023-24
Capacity
3 FTE equivalents for Phase 1 (June → July) scaling to 5 FTE if Phases 2-3 proceed
Phase 1 kick-off the week of 17 June 2025
Immediate deliverables
① “Atlas” agent to ingest & index Discord, forum, Commonwealth/Discourse archives ↔︎ KOI RIDs
② “Chorus” narrative A/B pod live on X & Discord
③ Phase-1 sprint retro + Phase-2 spec
≤ 30 days

2 — Token Alignment
We are prepared to make $REGEN the sole on-chain coordination and incentive layer for the joint agent stack, provided:
Founding stake – Gaia AI receives 5 % of total $REGEN supply, vesting linearly over 24 months, in lieu of launching a Gaia token.

Operating runway – Phase-based USDC/T) budget to avoid forced token sales while liquidity is thin (proposed: USD $30k for the initial 90-day pilot, released in monthly tranches).

Optional future primitives – We reserve the right to design domain-specific “data credits” or synthetic KPIs pegged to $REGEN (not competing L1 tokens) if/when they unlock new utility.

This structure keeps incentives singular, aligns us long-term, and lets us work lean without downward pressure on the market.

3 — Collaborative Design Approach
Layer
Our Plan
Differentiation
Knowledge ingestion
“Atlas” agent uses our scrape-and-vector pipeline to index Discord, Telegram, Twitter, forum threads, on-chain events. All objects get KOI RIDs for full semantic traceability.
Gives Regen a living, query-able knowledge graph from day 1.
Narrative experimentation
“Chorus” pod (3-5 LLM agents) runs multivariate prompt stacks; real-time engagement metrics auto-feed back to KOI. Human overseers (Regen Ops Pod) approve/redirect.
Tight RL loop: message → metric → on-chain memory → next prompt.
Cross-chain execution
Modular gateway written in CosmJS + Ethers.js. Validator-hosted TEEs (via Vitwit) hold agent keys; same agents can post governance messages on Regen, sign Cosmos txs, and ping Base/Solana liquidity contracts.
One agent ID, many chains – prevents narrative/liq siloing.
Governance & liquidity flows
“Sovereign” agent drafts, simulates and posts governance proposals; monitors bonding-curve/liquidity health; triggers LP-incentive adjustments.
Bridges the marketing work directly into treasury performance.
Security & guard-rails
Multi-sig policy layer + real-time anomaly detection; every agent action is hashed and written to KOI for auditability.
Verifiable provenance -> institutional comfort.

Road-mapping:
We’ll deliver a detailed Gantt + costed milestones within 10 days of green-light. Phasing maps 1-to-1 with the one-pager: 0-30 d prototype, 30-90 d cross-chain expansion, 90-365 d on-chain autonomous ops.

Next Steps Requested
Confirm budget envelope for Phase 1 so we can draft an SOW.

Share the dynamic mint/burn token-design forum links Gregory mentioned (for our modelling).

Provide Regen’s current API/infra endpoints and any NDA if required.

If the parameters above look directionally correct, we can have an executable SOW back to you by 14 June.
Looking forward to weaving our agent tech into the Regen movement.
— Colin, Darren & Shawn, for Gaia AI
