# Brainstorming Integration Protocol

This document defines three optional brainstorming enhancements during the interview process. All enhancements can be skipped at once if the user says "skip brainstorming".

## 1. Scope Decomposition Check (Step 2.5)

### Trigger Conditions

After analyzing the project context via `openspec status`, trigger if any of:
- 3 or more independent subsystems/modules detected
- Requirements span multiple bounded contexts
- Clearly separable deliverables exist that could be independent changes

### Protocol

Use `AskUserQuestion` to confirm with the user:

```
questions: [
  {
    question: "This project spans multiple independent subsystems. Should we split into separate changes?",
    header: "Scope",
    options: [
      { label: "Split changes", description: "Create separate OpenSpec changes for each subsystem, interview one at a time" },
      { label: "Keep unified", description: "Treat as a single change, interview all subsystems together" },
      { label: "Focus on core", description: "Interview only the core subsystem now, defer the rest" }
    ]
  }
]
```

If the user chooses to split, create separate changes via `openspec new change` for each subsystem and proceed with the first one.

## 2. Visual Companion Offer (Step 3.5)

### Trigger Conditions

Offer only when:
- The project involves UI/frontend development
- Requirements include layout, component design, or visual style decisions
- The user explicitly mentions interface design needs

### Protocol

Use `AskUserQuestion` to offer:

```
questions: [
  {
    question: "This project involves UI design decisions. Enable the browser visual companion? It shows mockups and layout options you can click to select.",
    header: "Visual",
    options: [
      { label: "Enable", description: "Start browser companion — visual questions shown as interactive HTML mockups" },
      { label: "No thanks", description: "Discuss all questions in the terminal as text" }
    ]
  }
]
```

If the user enables it:
1. Read `resources/VISUAL_COMPANION.md` for the full operation guide
2. Run `scripts/start-server.sh --project-dir <project-path>` to start the server
3. For subsequent visual design questions, follow the interaction loop in VISUAL_COMPANION.md
4. Run `scripts/stop-server.sh $SCREEN_DIR` to clean up after the interview

### Per-Question Decision

Once enabled, not every question uses the browser. Decide per question:
- **Visual questions** (layout comparison, component styling) → browser
- **Conceptual questions** (tech choices, architecture decisions) → terminal

## 3. Approach Proposal Protocol (Phase 1.5)

### Trigger Timing

After Phase 1 (Proposal interview) completes, before Phase 2 (Specs). This is the natural decision point — we understand the "Why" and now need to decide "How" at a high level.

### Protocol

Based on information gathered in Phase 1, propose 2-3 implementation approaches, each containing:
- Approach name (concise label)
- Core idea (1-2 sentences)
- Tradeoff analysis (advantages and disadvantages)
- Recommendation rationale (if applicable)

Use `AskUserQuestion` to present the choice:

```
questions: [
  {
    question: "Based on the proposal interview, here are viable implementation approaches:",
    header: "Approach",
    options: [
      {
        label: "A: <name>",
        description: "<core idea>. Pros: <...>. Cons: <...>"
      },
      {
        label: "B: <name>",
        description: "<core idea>. Pros: <...>. Cons: <...>"
      },
      {
        label: "C: <name> (Recommended)",
        description: "<core idea>. Pros: <...>. Cons: <...>"
      }
    ]
  }
]
```

### Integration with OpenSpec Artifacts

After the user selects an approach:

**proposal.md** — Add the selected approach to the "What Changes" section:
```markdown
## Selected Approach
<Approach name>: <core idea and key decisions>
```

**design.md** (Phase 3) — Enhance the "Decisions" section with the selected approach rationale, and add rejected approaches to an "Alternatives Considered" section:
```markdown
## Alternatives Considered
- **<Rejected approach A>**: <why it was not chosen>
- **<Rejected approach B>**: <why it was not chosen>
```

### Approach Count Guidelines

- **Simple projects** (single tech stack, clear path): propose 2 approaches
- **Complex projects** (multi-stack, architectural decisions): propose 3 approaches
- **Trivial projects** (only one reasonable path): skip proposal, state the recommended path and confirm

## Skip Mechanism

The user can say any of the following at any point during the interview to skip all brainstorming enhancements:
- `skip brainstorming`
- `跳过头脑风暴`
- `just the basics`

When skipped, the interview falls back to the original step sequence (Steps 1-7) without scope decomposition, visual companion, or approach proposals.
