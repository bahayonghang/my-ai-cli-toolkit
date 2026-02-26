---
name: interview-openspec
description: Create OpenSpec artifacts (proposal, specs, design, tasks) through Socratic interview. Use when starting a new OpenSpec change that needs structured requirements elicitation.
argument-hint: [change-name-or-description]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion, TodoWrite
---

# OpenSpec Interview

Phased Socratic interview that produces OpenSpec artifacts incrementally. Each phase maps to one artifact; user may exit after any phase.

## Steps

1. If `$ARGUMENTS` is empty, use `AskUserQuestion` to ask what to build. Derive kebab-case name.
2. Run `openspec new change "<name>"` and `openspec status --change "<name>" --json`.
3. Read `resources/INTERVIEW_PRINCIPLES.md` and `resources/OPENSPEC_INTERVIEW_DIMENSIONS.md`.
4. Execute 4 interview phases. Each phase: ask via `AskUserQuestion` (2-4 convergent options), then write artifact. If user says "skip", advance with gathered info.
   - **Phase 1 → proposal.md**: Business goals, MVP scope, risk preview, capability identification.
   - **Phase 2 → specs/\<cap\>/spec.md**: Requirements per capability in WHEN/THEN scenarios (ADDED/MODIFIED/REMOVED).
   - **Phase 3 → design.md**: Technical decisions, architecture tradeoffs (Context/Goals/Non-Goals/Decisions).
   - **Phase 4 → tasks.md**: Implementation breakdown as hierarchical checkbox list.
5. Use `openspec instructions <artifact> --change "<name>" --json` before writing each artifact. Fallback: `resources/ARTIFACT_TEMPLATES.md`.
6. If high-risk operations detected, read `resources/RISK_PROTECTION.md` and get explicit authorization.
7. On completion, run `openspec status --change "<name>"`. Guide user to `/opsx:apply` or `/opsx:verify`. See `resources/EXAMPLES.md` for a full walkthrough.

## Constraints

- Double-quote paths, use `/` separator. Prefer `rg` over `grep`.
- **Never** auto-execute Git write operations (`commit`, `push`).
- All questions via `AskUserQuestion` with clickable `options` — no plain-text A/B/C.
