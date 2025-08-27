---
rid: koi:planning:planning-structure-analysis
created: 2025-01-15
last-modified: 2025-07-15
confidence: high
verification-status: structural-analysis-document
source-type: project-management-methodology-analysis
related:
  - koi:planning:living-documentation-workflow
  - koi:planning:dependency-matrix
  - koi:planning:sprint-development-template
  - koi:planning:milestone-1-core-agent-framework
accuracy-concerns:
  - planning-structures-evolve-with-project-maturity
  - redundancy-patterns-may-change-with-team-growth
  - methodology-preferences-subject-to-team-adaptation
---

# Planning Structure Analysis: Avoiding Redundancy

## Current Structure Assessment

We have three planning mechanisms:

1. **Roadmaps** - Long-term vision and milestones
2. **Sprints** - Time-boxed execution cycles
3. **Priorities** - Dynamic task ordering

## Potential Redundancy Issues

### The Overlap Problem

- Roadmaps contain tasks
- Sprints contain tasks
- Priorities contain tasks
- Risk: Same task in multiple places, getting out of sync

### The Hierarchy Question

- Are priorities extracted from roadmaps?
- Do sprints pull from priorities?
- Or do they all exist independently?

## Proposed Unified Approach

### 1. Single Source of Truth for Tasks

All tasks live in ONE place, with metadata that allows different views:

```
Task: "Create RegenAI Facilitator character"
- Milestone: 1.1.1
- Sprint: Sprint-01 (or unassigned)
- Priority: High
- Status: Pending
- Dependencies: [Character framework complete]
```

### 2. Different Lenses, Same Data

**Roadmap View**: Shows tasks grouped by milestone
**Sprint View**: Shows tasks assigned to current sprint
**Priority View**: Shows all pending tasks by priority

### 3. Dynamic Priority System

Instead of static lists, priorities could be:

```
priorities/
├── priority-algorithm.md (how we determine priority)
├── current-focus.md (what we're working on NOW)
└── backlog.md (everything else, with tags)
```

Priorities are calculated based on:

- Milestone deadlines
- Dependencies
- Team availability
- External factors

## Workflow Integration Points

### Research Tasks (like KOI)

1. Create research task with "investigation" tag
2. Research outputs go to appropriate docs
3. Decision recorded in journal
4. Implementation tasks created if needed

### Character Development

1. High-priority in current focus
2. Part of Milestone 1.1.1
3. Not yet assigned to sprint (awaiting research)

## Recommendation

**Keep it simple for now:**

- Use roadmaps for vision/milestones
- Use priorities for "what's next"
- Add sprints only when working with a team

**Avoid:**

- Duplicating tasks across documents
- Creating structure before we need it
- Over-engineering the system

The best system is the one that gets used. Let's start minimal and add complexity only when pain points emerge.
