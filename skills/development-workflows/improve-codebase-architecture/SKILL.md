---
name: improve-codebase-architecture
description: "Review a codebase for architectural friction, rank deep-module refactoring opportunities, and draft RFCs for safer interfaces and boundary-test strategies. Use when the user wants to improve architecture, identify refactoring seams, consolidate tightly coupled modules, deepen shallow modules, redesign an interface around a core concept, replace brittle unit tests with boundary tests, or turn an architecture review into an RFC or issue draft. Chinese trigger phrases also apply: 架构改进, 抽象太浅, 模块拆得太碎, 接口太多, 测试钉死实现细节, 想写架构 RFC, 这块代码改一改, 模块边界乱."
version: 1.3.0
category: development-workflows
tags:
  - architecture
  - refactoring
  - testability
  - modularity
  - rfc
argument-hint: "[path-or-subsystem]"
allowed-tools: Read, Glob, Grep, Bash, Write, Agent
---

# Improve Codebase Architecture

Find architectural friction the way a future maintainer or coding agent experiences it. Favor deep modules: a small interface hiding substantial implementation complexity. The deep-module idea comes from Ousterhout's *A Philosophy of Software Design* — use it as the bar for "is this module worth carving out," not as decoration.

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
7. Design 2-4 materially different interfaces. If time or evidence is short, one well-grounded design beats two strawmen — do not pad the count.
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
10. Draft the RFC as Markdown using the template in `$SKILL_DIR/references/deepening-guide.md`. See `$SKILL_DIR/references/example-rfc.md` for a worked example showing how each template section connects in a real (small) case — read it for shape, not for content to copy.
11. Save the draft locally. Default to `.plannings/architecture-rfc-<candidate-slug>.md`; if `.plannings/` does not exist, create it. Ask the user before writing anywhere else, and never default to the repository root — root files get lost and pollute diffs.
12. Only create a GitHub issue if all of these are true:
   - The user explicitly asks for an issue
   - `gh` is installed and authenticated
   - The draft is already complete

   If any condition fails, do not silently skip. Return the full Markdown draft (already saved locally), a ready-to-paste issue body, and the suggested `gh issue create` command so the user can finish via web UI or shell when they choose.

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
