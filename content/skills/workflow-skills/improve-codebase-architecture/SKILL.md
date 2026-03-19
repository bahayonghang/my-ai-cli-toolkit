---
name: improve-codebase-architecture
description: Review a codebase for architectural friction, rank deep-module refactoring opportunities, and draft RFCs for safer interfaces and boundary-test strategies. Use when the user wants to improve architecture, identify refactoring seams, consolidate tightly coupled modules, deepen shallow modules, redesign an interface around a core concept, replace brittle unit tests with boundary tests, or turn an architecture review into an RFC or issue draft.
version: 1.1.0
category: workflow
tags:
  - architecture
  - refactoring
  - testability
  - modularity
  - rfc
---

# Improve Codebase Architecture

Find architectural friction the way a future maintainer or coding agent experiences it. Favor deep modules: a small interface hiding substantial implementation complexity.

Read `$SKILL_DIR/references/deepening-guide.md` before classifying dependencies, judging test strategy, or drafting the RFC.

## Workflow

1. Decide scope. If the user gives a path, subsystem, ticket, or architectural theme, stay inside it. Otherwise explore until you can name the highest-friction areas.
2. Explore the codebase using whatever discovery tools are available.
   - If subagents are available, you may run one exploration pass and 2-4 design passes in parallel.
   - If subagents are unavailable, do the same work sequentially. Do not fail just because parallelism is unavailable.
   - Treat friction as evidence: cross-file bouncing, redundant adapters, shallow modules, hidden orchestration, and tests that protect internals instead of behavior.
3. Surface 3-5 candidate deepening opportunities. For each candidate, report:
   - `Cluster`
   - `Why they're coupled`
   - `Dependency category`
   - `Test impact`
   - `Expected leverage`
   - `Migration cost / risk`
   - `Confidence`
4. If no candidate is strong enough, say so explicitly and stop. Do not invent an RFC just to satisfy the workflow.
5. Ask the user which candidate to explore. If the user only wanted an architectural review, stop after the candidate list and recommendation.
6. Frame the problem space for the chosen candidate before proposing an interface:
   - Constraints the new interface must satisfy
   - Dependencies it must rely on
   - Non-goals
   - Likely failure modes
   - A rough illustrative code sketch that grounds the constraints without committing to a design
7. Design 2-4 materially different interfaces.
   - With subagents: give each one a distinct design goal.
   - Without subagents: produce the same diversity of designs yourself, one by one.
   - Useful design goals:
     - Minimize interface surface
     - Optimize for common caller ergonomics
     - Maximize extension flexibility
     - Isolate cross-boundary dependencies with ports and adapters
8. For each design, include:
   1. Interface signature
   2. Usage example
   3. Complexity hidden internally
   4. Dependency strategy
   5. Trade-offs
   6. Failure modes
   7. Migration shape
9. Compare the designs in prose, then give a clear recommendation. If a hybrid is best, say exactly which parts should be combined.
10. Draft the RFC as Markdown using the template in `$SKILL_DIR/references/deepening-guide.md`.
11. Save the draft locally as `./architecture-rfc-<candidate-slug>.md`.
12. Only create a GitHub issue if all of these are true:
   - The user explicitly asks for an issue
   - `gh` is installed and authenticated
   - The draft is already complete
   Otherwise, return the Markdown draft and the suggested `gh issue create` next step without executing it.

## Working heuristics

- Prefer seams where the bugs live in orchestration, not in leaf helpers.
- Prefer module boundaries that let tests assert observable behavior instead of call order or internal state.
- Prefer designs that reduce navigation cost for both humans and agents.
- Be suspicious of "extract function for testability" if the real coupling stayed in the caller.
- Do not let current file layout dictate the future interface.

## Output contract

When presenting candidate opportunities, always include:
- `Cluster`
- `Why they're coupled`
- `Dependency category`
- `Test impact`
- `Expected leverage`
- `Migration cost / risk`
- `Confidence`

When presenting the final recommendation, always include:
- The chosen design or hybrid
- Why it wins
- What should remain outside the module
- Which existing tests become redundant
- Which new boundary tests matter most

## Failure handling

- If dependency classification is uncertain, name the uncertainty and what evidence is missing.
- If the codebase is too large, narrow scope before claiming confidence.
- If the best answer is "leave this area alone for now," say that plainly.
- Never mutate remote systems by default. Draft first, publish second.
