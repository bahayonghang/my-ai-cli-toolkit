---
name: agents-md-improver
description: >-
  Audit and improve Codex AGENTS.md guidance files and companion code_map.md
  navigation maps in repositories. Use when the user asks to check, audit,
  update, optimize, or fix AGENTS.md files; asks for Codex project guidance
  maintenance; mentions nested AGENTS.md conflicts, code maps, stale commands,
  scoped instructions, sandbox or approval boundaries; or says "优化 AGENTS.md",
  "审计 AGENTS.md", "检查 nested AGENTS.md", "更新 Codex 项目指导", or "生成
  code_map.md".
version: 1.0.0
category: developer-tools-integrations
tags:
  - codex
  - agents-md
  - repository-guidance
  - codex-cli
  - codex-app
  - audit
  - documentation
argument-hint: "[audit-or-update-goal]"
allowed-tools:
  - Read
  - Glob
  - Grep
  - Edit
  - Write
  - Bash(git *)
  - Bash(find *)
  - Bash(Get-ChildItem *)
  - Bash(Get-Content *)
  - Bash(Select-String *)
---

# AGENTS.md Improver

Audit and improve Codex `AGENTS.md` guidance files and companion `code_map.md` navigation maps so future Codex CLI, Codex App, and native subagent sessions receive concise, accurate, scoped project instructions and fast code search entry points.

**Default mode is report-first.** Output a quality report and proposed diff before writing. If the user explicitly asks to implement an approved plan, continue directly to targeted edits and verification.

## Core Semantics

- An `AGENTS.md` file governs the directory that contains it and every descendant directory.
- A deeper `AGENTS.md` adds or overrides guidance for its subtree.
- System, developer, and direct user instructions outrank any `AGENTS.md` content.
- Repository `AGENTS.md` files are project guidance. User-level `~/.codex/AGENTS.md` is global preference guidance and should not be edited unless explicitly requested.
- `AGENTS.md` carries durable behavioral constraints, commands, and safety rules. `code_map.md` carries navigational structure, search anchors, entry points, and generated/ignored directory notes.
- Every created or updated `AGENTS.md` should explicitly name the relative `code_map.md` path agents must read before broad grep or repo-wide search, for example `See ./code_map.md before broad grep` or `For this subtree, start with platforms/codex/code_map.md`.
- Preserve hook-managed marker blocks such as `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->` and `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`.

## Workflow

### Phase 1: Discovery

Find scoped guidance files:

```bash
# POSIX shells
find . \( -name AGENTS.md -o -name code_map.md \) \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './target/*' \
  -not -path './dist/*' \
  -not -path './build/*' \
  -not -path './.omx/state/*'

# PowerShell
Get-ChildItem -Recurse -Force -Include AGENTS.md,code_map.md |
  Where-Object { $_.FullName -notmatch '\\.git|node_modules|target|dist|build|\\.omx\\state' } |
  Select-Object -ExpandProperty FullName
```

Exclude generated, vendored, dependency, cache, and build-output directories from guidance creation scans, including `.git/`, `node_modules/`, `target/`, `dist/`, `build/`, `.omx/state/`, `vendor/`, generated docs output, coverage output, and language-specific package caches.

Discover candidate directories for new nested `AGENTS.md` plus local `code_map.md` before proposing writes. Score only real source subtrees that show one or more of:

- independent manifests or command files such as `package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, `Makefile`, `justfile`, or CI/workflow fragments
- independent runtime, entry point, test command, deployable package, or service boundary
- distinct language stack, framework, generated-source policy, or data/credential safety boundary
- high internal complexity where a local map would prevent broad grep or repeated rediscovery
- public API/contract surfaces that are frequently edited or shared by multiple packages

Also note, but do not edit by default:

```text
~/.codex/AGENTS.md
.codex/agents/
.codex/skills/
```

Classify each file:

| Type | Location | Purpose |
|---|---|---|
| root guidance | `./AGENTS.md` | repo-wide commands, architecture, gates, safety boundaries |
| nested scoped guidance | `./<subtree>/AGENTS.md` | local commands, ownership, generated files, conventions |
| root code map | `./code_map.md` | repo navigation, top-level routing, search anchors, ignored/generated paths |
| nested code map | `./<subtree>/code_map.md` | subtree entry points, internal routing, upstream/downstream boundaries |
| user global guidance | `~/.codex/AGENTS.md` | user-wide preferences, outside repo scope |
| generated/runtime guidance | `.omx/.../AGENTS.md` or similar | runtime state; usually read-only/no-edit |

### Phase 2: Evidence Collection

For every repo guidance file, verify claims against the repository:

- commands in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, CI files
- actual directory structure and entry points
- existing `code_map.md` files, map pointers in `AGENTS.md`, and whether map content is navigational rather than behavioral
- test/lint/typecheck/build commands
- generated, vendored, secret, data, or deployment-sensitive paths
- nested guidance overlap or conflicts
- unrepresented key subprojects that score high enough for nested guidance creation
- Codex-specific surfaces: `.codex/skills`, `.codex/agents`, `AGENTS.md` scope rules, sandbox/approval notes
- optional OMX sections only when present in the repo or current user environment

### Phase 3: Quality Assessment

Use `references/quality-criteria.md` for detailed scoring, including the nested `AGENTS.md` creation scorecard.

Quick checklist:

| Criterion | Weight | Check |
|---|---:|---|
| scope and override clarity | 20 | file explains what subtree it governs and how it relates to parent guidance |
| executable commands and gates | 20 | build/test/lint/typecheck commands are real and scoped |
| architecture and ownership | 15 | enough map to route future edits without restating obvious code |
| safety and permissions | 15 | sandbox, approvals, secrets, destructive operations, external services are clear |
| Codex workflow fit | 15 | skills/subagents/plugins/OMX guidance is accurate and not overpromised |
| conciseness and currency | 15 | current, dense, non-duplicative, no stale file paths |

For each candidate nested subtree, record:

- creation score and decision: create (`>=60`), candidate only (`40-59`), or do not create (`<40`)
- nearest applicable `code_map.md` path and whether a local nested map should be created
- reason not to create guidance for generated, vendored, dependency, or low-signal directories

Grades:

- **A (90-100)**: scoped, current, executable, and concise
- **B (70-89)**: useful with minor gaps
- **C (50-69)**: basic but missing key operational detail
- **D (30-49)**: sparse, stale, or confusing
- **F (0-29)**: missing, misleading, or unsafe

### Phase 4: Report Before Editing

Always provide this report before edits unless the user already approved an implementation plan.

```markdown
## AGENTS.md Quality Report

### Summary
- Files found: X
- Root guidance: present/missing
- Root code map: present/missing
- Nested scoped files: X
- Nested code maps: X
- Average score: X/100
- Files needing update: X
- Candidate nested guidance dirs: X create / X candidate-only / X skipped

### Scope Map
| File | Governs | Parent guidance | Notes |
|---|---|---|---|
| `AGENTS.md` | repo root | none | ... |
| `packages/api/AGENTS.md` | `packages/api/**` | root | ... |

### Code Map Coverage
| Map | Covers | Referenced by | Notes |
|---|---|---|---|
| `code_map.md` | repo root | `AGENTS.md` | ... |

### Nested Guidance Candidates
| Directory | Score | Decision | Evidence |
|---|---:|---|---|
| `packages/api/` | 75 | create `packages/api/AGENTS.md` + `packages/api/code_map.md` | independent tests, deploy boundary |

### File-by-File Assessment

#### 1. `AGENTS.md`
**Score: XX/100 (Grade: X)**

| Criterion | Score | Notes |
|---|---:|---|
| scope and override clarity | X/20 | ... |
| executable commands and gates | X/20 | ... |
| architecture and ownership | X/15 | ... |
| safety and permissions | X/15 | ... |
| Codex workflow fit | X/15 | ... |
| conciseness and currency | X/15 | ... |

**Issues**
- ...

**Proposed changes**
- ...
```

### Phase 5: Targeted Updates

When approved or already authorized by a plan:

1. Preserve existing human-authored guidance unless it is demonstrably stale.
2. Keep root guidance global and short.
3. Keep architecture/search navigation in `code_map.md`; keep behavioral rules, commands, and safety constraints in `AGENTS.md`.
4. Move subtree-specific detail to the narrowest applicable nested `AGENTS.md` instead of duplicating it everywhere.
5. Create nested guidance only when candidate scoring justifies it; list lower-scoring candidates in the report instead of adding noise.
6. Ensure every updated `AGENTS.md` names the exact relative `code_map.md` path agents should read first.
7. Preserve marker blocks exactly unless the user explicitly asks to repair them.
8. Prefer additions or surgical rewrites over wholesale replacement.
9. Remove stale commands only after verifying current replacements.
10. Do not add generic advice that Codex already knows.

### Phase 6: Verification

Run the smallest checks that prove the edits:

- `git diff --check`
- command existence checks for newly documented commands when cheap
- targeted checks that generated `AGENTS.md` files reference an explicit relative `code_map.md` path
- targeted checks that generated or vendored directories were not assigned meaningless nested guidance
- repo docs or lint gates when AGENTS.md is part of a larger docs change
- targeted search for stale names or paths removed by the update

If a documented full gate is expensive, state whether it was run or why it was not.

## Reference Files

- `references/quality-criteria.md` — scoring rubric and red flags
- `references/templates.md` — root, monorepo package, frontend/backend/docs templates
- `references/update-guidelines.md` — what to add, avoid, and preserve

## Common Issues to Flag

- root `AGENTS.md` missing commands required by CI or local development
- root `AGENTS.md` missing an explicit `./code_map.md` pointer when a root map exists or should exist
- nested `AGENTS.md` contradicts parent guidance without saying why
- nested `AGENTS.md` only says "read the code map" without naming the relative map path
- `AGENTS.md` bloated with directory index content that belongs in `code_map.md`
- low-score, generated, vendored, dependency, or build-output directories receiving unnecessary nested guidance
- stale paths after a refactor
- Claude-only guidance copied into Codex files without AGENTS.md scope semantics
- dangerous operations not gated by explicit approval language
- external production services or credentials not called out
- skills/subagents/plugins described as available when they are only aspirational
- OMX workflows documented as universal Codex features instead of environment-specific enhancements

## Final Output After Edits

```markdown
## AGENTS.md Update Summary

### Files changed
- `AGENTS.md` — ...
- `packages/api/AGENTS.md` — ...
- `code_map.md` — ...
- `packages/api/code_map.md` — ...

### What improved
- scope/override clarity
- command/gate accuracy
- safety boundaries
- map-first search flow with explicit relative `code_map.md` paths

### Verification
- `git diff --check` — passed
- `<targeted command>` — passed/failed/skipped with reason

### Remaining risks
- ...
```
