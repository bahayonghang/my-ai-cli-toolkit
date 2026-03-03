# interview-openspec

Create complete OpenSpec artifacts through a phased Socratic interview. Each interview phase produces one artifact, enabling incremental progress.

## Overview

`interview-openspec` bridges requirements elicitation with the OpenSpec artifact workflow. Through structured Socratic questioning, it transforms a rough idea into four ready-to-implement OpenSpec artifacts: `proposal.md`, `specs/<capability>/spec.md`, `design.md`, and `tasks.md`. Each artifact is written immediately after its interview phase completes, so you can exit at any point with valid partial output.

## How It Differs From Similar Skills

| Skill | Output | Trigger |
|-------|--------|---------|
| `interview-plan` | Native Plan mode execution plan | Refine an existing draft/plan |
| `interview-openspec` | OpenSpec artifacts (proposal/specs/design/tasks) | Start a new OpenSpec change |
| `spec-interview` | Generic `spec.md` file | Standalone specification document |

## When to Use

- Starting a new OpenSpec change that needs requirements clarity
- Translating a vague feature request into structured OpenSpec artifacts
- Systematically eliciting requirements before implementation
- Ensuring every capability has testable WHEN/THEN scenarios

## Trigger

```
interview-openspec <change-name-or-description>
```

Examples:
- `interview-openspec add-user-authentication`
- `interview-openspec "I want to add CSV export to the dashboard"`

## Workflow

### Phase 1 → `proposal.md`
Interviews on **why** this change matters: business goals, MVP scope, capability identification, and risk preview. Uses KISS/YAGNI principles to challenge scope assumptions.

### Phase 2 → `specs/<capability>/spec.md`
Interviews on **what** each capability requires. Elicits WHEN/THEN scenarios for:
- ADDED requirements (new behavior)
- MODIFIED requirements (changed behavior)
- REMOVED requirements (deprecated behavior)

Also covers API contracts and UI/UX flows where applicable.

### Phase 3 → `design.md`
Interviews on **how** to implement: technical decisions, architecture tradeoffs, SOLID principles, edge cases, and resilience strategies.

### Phase 4 → `tasks.md`
Interviews on **implementation breakdown**: hierarchical checkbox task list with priorities, dependencies, and acceptance criteria.

## Interview Technique

All questions use `AskUserQuestion` with 2-4 clickable convergent options — no open-ended free-text questions. Independent questions are batched into a single call (up to 4 per round) to minimize interaction turns.

```
AskUserQuestion({
  questions: [{
    question: "What is the primary driver for this change?",
    header: "Motivation",
    options: [
      { label: "User request", description: "Top-voted feature from customers" },
      { label: "Compliance", description: "Regulatory or audit requirement" },
      { label: "Internal ops", description: "Operations team efficiency need" }
    ]
  }]
})
```

## OpenSpec CLI Integration

The skill calls the `openspec` CLI to ensure artifacts conform to the schema:

```bash
openspec new change "<name>"                     # Create change directory
openspec status --change "<name>" --json         # Get artifact sequence
openspec instructions <artifact> --change "<name>" --json  # Get artifact template
openspec status --change "<name>"                # Show completion status
```

## After Interview

Once all (or some) phases complete:

```bash
/opsx:apply    # Start implementation from tasks.md
/opsx:verify   # Validate artifacts against each other
/opsx:continue # Create a specific artifact manually
```

## Best Practices

- **Provide context upfront**: Mention existing tech stack, framework, and constraints before starting to avoid "vacuum architecture" discussions
- **Skip freely**: Say "skip" at any phase to advance with reasonable defaults
- **Interrupt safely**: Each artifact is written immediately — stop anytime and resume with `/opsx:continue`
- **Iterate**: After writing artifacts, use `/opsx:explore` to think through problems further before applying
