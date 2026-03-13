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
3. Read `resources/INTERVIEW_PRINCIPLES.md`, `resources/OPENSPEC_INTERVIEW_DIMENSIONS.md`, and `resources/BRAINSTORMING_INTEGRATION.md`. If the user says "skip brainstorming", skip all new steps (2.5, 3.5, Phase 1.5).
   - **Step 2.5 — Scope Decomposition Check**: If 3+ independent subsystems detected, propose splitting into separate changes per the brainstorming protocol.
   - **Step 3.5 — Visual Companion Offer**: If the project involves UI/frontend work, offer the browser visual companion per the protocol (see `resources/VISUAL_COMPANION.md` and `scripts/`).
4. Execute 4 interview phases. Each phase: ask via `AskUserQuestion` (2-4 convergent options), then write artifact. If user says "skip", advance with gathered info.
   - **Phase 1 → proposal.md**: Business goals, MVP scope, risk preview, capability identification.
   - **Phase 1.5 → Approach Proposal** [new]: After Phase 1 completes, propose 2-3 implementation approaches with tradeoffs per `BRAINSTORMING_INTEGRATION.md`. Selected approach is added to proposal.md's "What Changes" section.
   - **Phase 2 → specs/\<cap\>/spec.md**: Requirements per capability in WHEN/THEN scenarios (ADDED/MODIFIED/REMOVED).
   - **Phase 3 → design.md**: Technical decisions, architecture tradeoffs (Context/Goals/Non-Goals/Decisions). Enhanced: rejected approaches from Phase 1.5 are documented in an "Alternatives Considered" section.
   - **Phase 4 → tasks.md**: Implementation breakdown as hierarchical checkbox list.
5. Use `openspec instructions <artifact> --change "<name>" --json` before writing each artifact. Fallback: `resources/ARTIFACT_TEMPLATES.md`.
6. If high-risk operations detected, read `resources/RISK_PROTECTION.md` and get explicit authorization.
7. On completion, run `openspec status --change "<name>"`. Guide user to `/opsx:apply` or `/opsx:verify`. See `resources/EXAMPLES.md` for a full walkthrough.

## Constraints

- Double-quote paths, use `/` separator. Prefer `rg` over `grep`.
- **Never** auto-execute Git write operations (`commit`, `push`).
- All questions via `AskUserQuestion` with clickable `options` — no plain-text A/B/C.

## Skip Brainstorming

If the user says "skip brainstorming" or "跳过头脑风暴" at any point, skip steps 2.5 (scope decomposition), 3.5 (visual companion), and Phase 1.5 (approach proposal), falling back to the original interview flow.
