---
rid: koi:tokenomics:regen-fixed-cap-dynamic-supply-model
created: 2025-07-15
last-modified: 2025-07-15
confidence: medium-high
verification-status: technical-proposal-analysis
source-type: tokenomics-model-specification
related:
  - koi:research:token-economics-governance-mapping
  - koi:analysis:regen-network-comprehensive-research
  - koi:governance:community-proposal-analysis
accuracy-concerns:
  - tokenomics-model-may-be-theoretical-not-implemented
  - supply-equations-require-validation-against-current-system
  - implementation-timeline-and-status-unclear
  - technical-parameters-may-need-adjustment-in-practice
---

# Regen Network Tokenomics Analysis: Fixed Cap, Dynamic Supply Model

## Executive Summaries

### 1. "Re: Fixed Cap, Dynamic Supply - Taking the Next Steps" (Google Doc)

**Main Contributors**: Will (original proposal author), technical implementation author, Zargham (supply equation), Regen Network community

**Key Concepts**: The document presents a detailed technical implementation blueprint for a fixed cap, dynamic supply tokenomics model. The core innovation balances economic stability through a fixed token cap with adaptability through dynamic supply mechanisms that respond to network conditions.

**Technical Mechanisms**:

- **Core Supply Equation**: `S[t+1] = S[t] + r(C-S[t]) - B[t]` where S is supply, C is cap, r is regrowth rate, B is burn rate
- **Regrowth Rate Formula**: `r = 0.02 × (1 + S_staked/S_total) × (1 - ΔCO₂/50 ppm)`
- **Burn Mechanisms**: Transaction burns (30% of gas fees + 0.01% of volume) and ecological burns based on EcoScore
- **Self-stabilization**: Minting naturally slows as supply approaches cap

**Implementation Details**:

- Cosmos SDK integration with specific protobuf definitions
- Module integrations across x/staking, x/ecocredit, x/data, and x/params
- 30-day governance recalibration cycles
- Phased rollout starting with marketplace fee burns
- Parameter visualization tooling and CADCAD simulations

### 2. "Carrying-capacity model by Zargham" (GitHub)

**Author**: Michael Zargham, Ph.D. - Founder of BlockScience, systems engineer specializing in cryptoeconomics

**Key Concepts**: Applies ecological carrying capacity models to tokenomics using control theory and dynamical systems. The framework adapts Verhulst's logistic growth equation to token economies with environmental constraints.

**Mathematical Framework**:

- State-space representation: `ẋ(t) = A(t)x(t) + B(t)u(t)` for system dynamics
- Carrying capacity K as maximum sustainable token supply
- Linear Time-Expanding (LTE) models for growing participant networks
- Lyapunov stability analysis for equilibrium
- Integration of game theory for multi-agent interactions

**Technical Contributions**:

- Generalized Dynamical Systems (GDS) adapted for blockchain
- Stochastic elements for uncertainty modeling
- cadCAD framework for simulation and policy exploration
- Control feedback mechanisms for sustainable growth

### 3. "regen/Token/Fixed Cap, Dynamic Supply" (Forum Post)

_Note: Direct access was restricted, but contextual evidence suggests this was the community discussion forum where the tokenomics model was debated and refined through stakeholder feedback._

### 4. "Anchoring Ethical Capital Formation" by Gregory Landua (Medium)

**Author**: Gregory Landua - Co-founder/CEO of Regen Network, regenerative entrepreneur with MS in Regenerative Entrepreneurship

**Core Thesis**: Traditional tokenomics fail to align economic incentives with ecological regeneration. Fixed cap, dynamic supply creates scarcity-based value while enabling functional expansion through community governance.

**Key Principles**:

- **Regenerative Economics**: Based on John Fullerton's framework and Eight Forms of Capital
- **Ethical Capital Formation**: Public good infrastructure with transparency and community ownership
- **Multi-Capital Accounting**: Beyond financial metrics to include ecological health
- **Biomimicry**: Token mechanics mirroring natural system feedback loops

**Vision**: System-level transformation from extractive to regenerative economic models, creating blockchain-based ecological accounting as global infrastructure for a multi-trillion dollar ecosystem service economy.

## Venn Diagram Analysis: Overlapping Contexts and Relationships

### Core Overlapping Concepts

**Universal Agreement on Fixed Cap, Dynamic Supply**
All resources converge on this model as the foundational innovation, with each providing complementary perspectives:

- Mathematical proof (Zargham)
- Technical implementation (Google Doc)
- Ethical justification (Landua)
- Community validation (Forum)

**Ecological Integration**

- Google Doc specifies CO₂ metrics and EcoScore integration
- Zargham provides carrying capacity mathematical framework
- Landua frames as regenerative economic transformation
- All view tokenomics as serving ecological goals

**Self-Stabilizing Feedback Mechanisms**

- Technical implementation through burn/mint dynamics (Google Doc)
- Mathematical stability analysis (Zargham)
- Natural system mimicry (Landua)

### Unique Contributions by Resource

**Google Doc**: Concrete Cosmos SDK implementation, specific formulas, governance cycles, phased roadmap

**Zargham**: Control theory application, mathematical rigor, simulation frameworks, stability proofs

**Landua**: Ethical framework, vision articulation, regenerative principles, stakeholder inclusion

**Forum**: Community refinement, practical concerns, consensus building (inferred)

### How Resources Build Upon Each Other

The resources form a comprehensive stack:

1. **Theoretical Foundation** (Zargham) → **Implementation Blueprint** (Google Doc)
2. **Ethical Vision** (Landua) → **Technical Specifications** (Google Doc)
3. **Community Discussion** (Forum) → **Refined Implementation** (Google Doc)

Cross-references demonstrate interdependence:

- Google Doc explicitly cites Zargham's supply equation
- Implementation details reference forum proposal
- All align with Regen Network's regenerative mission

### Complementary Relationships

**Mathematical ↔ Practical**: Zargham's theory needs Google Doc's parameters; implementation needs mathematical validation

**Vision ↔ Technical**: Landua's why complements Google Doc's how; ethics guide technical choices

**Theory ↔ Community**: Academic models refined through community feedback; discussions grounded in theory

### Areas of Tension

1. **Complexity Balance**: Sophisticated mathematical models vs. phased "start simple" implementation
2. **Governance Speed**: Fixed 30-day cycles vs. need for responsive adjustments
3. **Stakeholder Scope**: Technical token-holder focus vs. inclusive non-token governance vision

### Synthesis

Together, these resources represent a holistic approach to regenerative tokenomics that is:

- **Mathematically rigorous** through carrying capacity models and control theory
- **Ethically grounded** in regenerative economics and multi-capital accounting
- **Technically feasible** with detailed Cosmos SDK implementation paths
- **Community-validated** through participatory refinement

The fixed cap, dynamic supply model emerges as an innovative solution that prevents inflationary dilution while enabling functional evolution, creating economic systems aligned with planetary health through complementary theoretical, practical, ethical, and community perspectives.
