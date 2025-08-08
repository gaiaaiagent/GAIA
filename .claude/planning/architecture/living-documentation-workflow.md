---
rid: koi:planning:living-documentation-workflow
created: 2025-01-15
last-modified: 2025-07-15
confidence: high
verification-status: workflow-methodology-specification
source-type: documentation-process-framework
related:
  - koi:planning:planning-structure-analysis
  - koi:journal:session-02
  - koi:architecture:content-indexing-strategy-15k-docs
  - koi:integration:blockscience-koi-semantic-traceability
accuracy-concerns:
  - documentation-workflows-evolve-with-team-experience
  - living-documentation-principles-require-cultural-adoption
  - workflow-effectiveness-depends-on-consistent-practice
  - integration-with-koi-system-still-developing
---

# Living Documentation Workflow

## The Challenge of Living Documents

Traditional documentation dies because it's treated as a separate activity from doing the work. Living documentation stays alive by being integral to the work itself - not an afterthought but part of the thinking and doing process.

## Workflow Sequencing for RegenAI

### 1. Discovery Phase (Questions Drive Documentation)

**When:** Start of any new work
**Documents Updated:** Journal entries begin immediately
**Process:**

- Questions arise → Document them in journal
- Research happens → Findings go directly into relevant planning docs
- Conversations occur → Key insights captured in real-time
- **Key:** Documentation happens DURING discovery, not after

### 2. Design Phase (Documentation IS Design)

**When:** After initial discovery
**Documents Updated:** Feature specs, architecture decisions, character frameworks
**Process:**

- Design thinking happens IN the documents
- Multiple iterations saved as versions (not overwritten)
- Decisions documented with rationale and alternatives considered
- **Key:** The document is the design workspace, not a record of design

### 3. Implementation Phase (Code and Docs Co-evolve)

**When:** During active development
**Documents Updated:** READMEs, inline documentation, journal reflections
**Process:**

- Major code changes trigger documentation updates
- Discoveries during coding feed back to design docs
- Journal captures "aha" moments and pivots
- **Key:** Documentation changes happen in same commit as code changes

### 4. Reflection Phase (Scheduled Breathing)

**When:** End of session, week, sprint
**Documents Updated:** Journal synthesis, index updates, framework refinements
**Process:**

- Journal entries synthesize immediate experience
- Weekly: Update priorities and roadmaps based on progress
- Sprint end: Major documentation refactoring if needed
- **Key:** Scheduled reflection prevents drift

## Update Triggers (When Documents Change)

### Immediate Triggers

- **New Understanding:** Update relevant docs immediately when assumptions change
- **Design Pivot:** Document why and what changed
- **External Input:** New requirements, feedback, or resources
- **Failure/Success:** Both teach - document lessons immediately

### Periodic Triggers

- **Daily:** Journal entry if significant work done
- **Weekly:** Priority updates, roadmap check
- **Sprint:** Comprehensive review of all planning docs
- **Monthly:** Framework and philosophy refinements

### Event Triggers

- **Before Starting New Feature:** Review/update relevant docs
- **After Major Milestone:** Retrospective documentation
- **When Onboarding Someone:** Docs get tested and improved
- **When Confused:** Update docs to prevent future confusion

## Preventing Staleness

### 1. Documentation as Thinking Tool

Don't document what you did - document WHILE you think. The act of writing clarifies thought. This means:

- Character development happens IN the character doc
- Architecture decisions are made IN the architecture doc
- Problems are solved IN the journal

### 2. Version Everything, Delete Nothing

Instead of updating in place:

- Keep v1, v2, v3 of character files
- Archive old roadmaps with dates
- Journal entries never edited, only added
  This creates a living history showing evolution

### 3. Cross-Reference Liberally

Living documents reference each other:

- Journal entries link to specs they're implementing
- Feature docs reference journal discoveries
- Character files cite source materials
  This web of connections keeps documents relevant

### 4. Make Documents Actionable

Each document should answer: "What do I do with this?"

- Roadmaps have checkboxes
- Frameworks have question prompts
- Templates have fill-in sections
  Active documents stay alive

### 5. Embrace Incompleteness

Living documents have:

- "Questions Emerging" sections
- "To Be Determined" markers
- "Last Updated" timestamps
- "Confidence Level" indicators
  Honest incompleteness invites updates

## RegenAI-Specific Workflow

### For Character Development

1. **Source Gathering:** URLs, transcripts → Resource library
2. **Character Sketching:** Initial ideas → Character draft doc
3. **Collaborative Refinement:** Q&A session → Updated character doc
4. **Implementation:** Character file creation → Technical doc updates
5. **Testing:** User interactions → Journal insights → Character refinements

### For Feature Development

1. **Requirement Capture:** User need → Feature spec started
2. **Technical Design:** Research → Architecture doc updated
3. **Implementation:** Code + documentation together
4. **Integration:** Cross-feature impacts → Multiple doc updates
5. **Reflection:** What we learned → Journal + framework updates

## The Meta-Pattern

Living documentation follows a breathing rhythm:

- **Inhale:** Gather information, ask questions, explore
- **Hold:** Synthesize, connect, understand
- **Exhale:** Document, share, teach
- **Pause:** Reflect, review, refine

This rhythm happens at multiple scales:

- Within a session (minutes/hours)
- Across a day
- Through a week
- Over a sprint

## Signs Documentation is Dying

Watch for:

- Documents not opened for weeks
- "I'll document that later" becoming never
- Confusion despite existing documentation
- Fear of updating "finished" documents
- Documentation sprints separate from work

## Signs Documentation is Living

Look for:

- Documents with recent timestamps throughout
- Team members naturally updating docs
- Questions in docs getting answered over time
- Documentation driving decisions
- New team members successfully self-onboarding

## Practical Implementation

### Daily Practice

- Start each session by reviewing relevant docs
- Keep documentation open while working
- Commit documentation with code
- End sessions with journal reflection

### Weekly Practice

- Review all touched documents
- Update priorities based on learning
- Archive completed work
- Refresh roadmaps

### Monthly Practice

- Refactor documentation structure if needed
- Extract patterns from journals to frameworks
- Update high-level vision docs
- Celebrate documentation evolution

## The Core Principle

Documentation lives when it's inseparable from the work itself. It's not about documenting what you did - it's about thinking through documentation, designing in documentation, and learning via documentation. The documents aren't records; they're living participants in the development process.

For RegenAI, this means our character files will evolve with each interaction, our frameworks will refine with each implementation, and our journals will capture the real story of bringing regenerative AI to life.
