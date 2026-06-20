---
name: code-refactor
description: "Implement safe, behavior-preserving code refactors after inspecting the existing project. Use when the user asks to refactor code, split large files or modules, extract functions or methods, reduce duplicated logic, rename confusing classes/functions/variables, improve code comments, remove unused or dead code, or says 重构代码, 拆分模块, 提取方法, 减少重复代码, 优化命名, 优化注释, 删除未调用代码. For broad refactor requests, plan safe slices and wait for approval; for narrow scoped requests, directly implement the smallest verifiable slice."
category: development-workflows
tags:
  - refactoring
  - code-quality
  - maintainability
  - modularity
  - cleanup
version: 0.1.0
argument-hint: "[path-or-refactor-goal]"
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Code Refactor

Refactor existing code without changing behavior. The skill's job is to make code easier to understand, modify, and test while keeping the observable contract stable.

Refactoring is not a license for broad cleanup. Treat every edit as a behavior-preserving transformation with evidence, a bounded target, and verification.

## Default Behavior

Choose the mode from the user's scope.

- **Broad request**: If the user says things like "refactor this module", "clean up this project", or "optimize the code structure", inspect first, propose safe refactor slices, and wait for user approval before broad edits.
- **Narrow request**: If the user names a file, function, duplicated block, dead symbol, or specific cleanup, directly implement the smallest safe slice and verify it.
- **Review-only request**: If the user asks for code quality review or maintainability findings without asking to edit, use a review skill such as `code-quality-review` instead.
- **Architecture/RFC request**: If the user wants deep-module design, module-boundary candidates, or an architecture RFC rather than a behavior-preserving refactor, treat that as a separate design effort and surface it instead of refactoring in place.

## Refactor Types

Classify the requested work before editing. A task may include more than one type, but execute one coherent slice at a time.

| Type                       | Use when                                                                            | Good outcome                                                               |
| -------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Module split               | A file or subsystem mixes unrelated responsibilities                                | Files align with functional modules, ownership, and test boundaries        |
| Function/method extraction | One function has multiple small behaviors or hidden phases                          | Public API stays small; private helpers name meaningful substeps           |
| Duplicate consolidation    | Similar logic appears repeatedly and may drift                                      | A shared helper removes real duplication without adding thin indirection   |
| Naming cleanup             | Names hide intent, encode stale details, or force readers to inspect implementation | Names are concise, intention-revealing, and consistent with local style    |
| Comment cleanup            | Comments repeat code, miss invariants, or hide key assumptions                      | Comments explain why, contracts, edge cases, and non-obvious decisions     |
| Dead-code removal          | Code appears uncalled, stale, or orphaned                                           | Removal is backed by call-site, export, framework, and verification checks |

## Workflow

1. **Establish scope**
   - Read repo guidance first: `AGENTS.md`, nested guidance, `code_map.md`, package docs, and nearby tests.
   - Identify the requested target and non-goals.
   - For broad scopes, produce a slice plan and stop for approval.

2. **Build evidence**
   - Search for similar code, call sites, exports, tests, and framework entrypoints.
   - Prefer structural or language-aware evidence over regex-only reasoning.
   - Note public API, generated files, vendored code, dynamic imports, reflection, routing, dependency injection, and config-driven entrypoints.

3. **Set a baseline**
   - Run the narrowest relevant existing checks before editing when practical.
   - If checks are unavailable or already failing, record that fact and identify the fallback smoke check.
   - For large changes, verify after each slice instead of waiting until the end.

4. **Plan the slice**
   - Name the refactor type and target files.
   - State what must not change: behavior, API surface, data formats, error semantics, logs, or ordering.
   - Prefer existing patterns and helpers. Do not introduce a new dependency for one cleanup unless the user approves it.

5. **Apply the refactor**
   - Use language-aware tools when available: TypeScript language service, `ts-morph`, `jscodeshift`, `ast-grep`, `rope`, OpenRewrite, IDE refactors, or project-native lint fixes.
   - For manual edits, keep the diff small and local. Avoid formatting churn outside the touched slice.
   - Remove imports, variables, helpers, files, or tests that your refactor makes unused.

6. **Verify and inspect**
   - Re-run targeted checks, then broader checks when the blast radius justifies them.
   - Inspect the diff for behavior drift, orphaned code, renamed public contracts, generated files, and accidental formatting changes.
   - If verification fails, fix within the same slice or roll back the slice before moving on.

7. **Report**
   - Summarize the slice, changed files, verification, and residual risk.
   - List follow-up refactor candidates separately. Do not implement follow-ups unless the user asked for them or they are required to finish the approved slice.

## Type-Specific Rules

### Module And File Splits

- Split by responsibility, ownership, data contract, or test boundary. Do not split only because a file is long.
- Keep public entrypoints stable where possible. If imports must change, update all call sites in the same slice.
- Move code with its closest tests or add a small boundary test when the split creates a new contract.
- Watch barrel exports, package exports, route registration, framework discovery, and generated docs.

### Function Or Method Extraction

- Extract the smallest coherent behavior with a name that removes explanation from the caller.
- Keep public methods few. Prefer private helpers for implementation phases.
- Avoid pass-through helpers that only rename one line and add navigation cost.
- Preserve exception behavior, async ordering, mutation timing, and side effects.

### Duplicate Code Consolidation

- Search first. If a canonical helper already exists, use it.
- Extract only when duplication is repeated enough or complex enough to justify a shared abstraction.
- Keep shared helpers close to the concept owner, not in a generic utility file by default.
- Do not merge code that only looks similar but has different business rules.

### Naming Cleanup

- Rename with language-service support when possible.
- Prefer names that describe role and intent, not implementation trivia.
- Preserve public API names unless the user approved the migration or all consumers are in scope.
- After renaming, search for stale names in tests, docs, comments, configs, and generated-facing metadata.

### Comment Cleanup

- Remove comments that merely narrate code.
- Add or rewrite comments for invariants, edge cases, external contracts, surprising decisions, and constraints future maintainers might break.
- Keep comments close to the logic they explain.
- Do not use comments to paper over unclear code when a small rename or extraction would make the code self-explanatory.

### Dead-Code Removal

- Treat dead-code removal as high-risk in dynamic frameworks and public packages.
- Check text references, imports, exports, reflection, dependency injection, routing, config, generated consumers, tests, scripts, and documentation.
- If a symbol is public or exported, prefer deprecation or a migration note unless the user approved removal.
- Delete tests only when they cover code that is truly removed and no longer express a public behavior.

## Structural Tooling Heuristics

Use the strongest tool already available in the project:

- **TypeScript / JavaScript**: TypeScript language service, `ts-morph`, `jscodeshift`, `ast-grep`, ESLint autofix.
- **Python**: `rope`, `ruff`, `pyright`, `mypy`, `vulture`, `autoflake`, project tests.
- **Java / JVM**: OpenRewrite recipes, IDE/language-server refactors, build and test tasks.
- **Polyglot structural rewrites**: `ast-grep` or Comby for bounded syntax-aware patterns.

If a tool is not installed, do not install it automatically. Explain the manual fallback or ask before adding dependencies.

## Stop Conditions

Stop and ask for approval or clarification when:

- The requested scope is broad and would touch multiple modules, public APIs, or generated-facing contracts.
- Baseline checks are absent or failing and the slice has behavior risk.
- Dead-code evidence is inconclusive.
- The refactor would require a new dependency, migration strategy, or public API rename.
- The best result is "leave this code alone". Say so and explain why.

## Output Contract

For direct implementation, report:

```markdown
## Scope

## Baseline

## Refactor Plan

## Edits Made

## Verification

## Residual Risk
```

For broad or risky requests, stop before editing and report:

```markdown
## Findings

## Recommended Refactor Slices

## Required Decision

## Verification Plan
```
