---
name: agents-md-improver
description: >-
  Audit and improve Codex AGENTS.md guidance files in repositories. Use when the
  user asks to check, audit, update, optimize, or fix AGENTS.md files; asks for
  Codex project guidance maintenance; mentions nested AGENTS.md conflicts,
  stale commands, scoped instructions, sandbox or approval boundaries; or says
  "优化 AGENTS.md", "审计 AGENTS.md", "检查 nested AGENTS.md", or "更新 Codex
  项目指导".
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

Audit and improve Codex `AGENTS.md` guidance files so future Codex CLI, Codex App, and native subagent sessions receive concise, accurate, scoped project instructions.

**Default mode is report-first.** Output a quality report and proposed diff before writing. If the user explicitly asks to implement an approved plan, continue directly to targeted edits and verification.

## Core Semantics

- An `AGENTS.md` file governs the directory that contains it and every descendant directory.
- A deeper `AGENTS.md` adds or overrides guidance for its subtree.
- System, developer, and direct user instructions outrank any `AGENTS.md` content.
- Repository `AGENTS.md` files are project guidance. User-level `~/.codex/AGENTS.md` is global preference guidance and should not be edited unless explicitly requested.
- Preserve hook-managed marker blocks such as `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->` and `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`.

## Workflow

### Phase 1: Discovery

Find scoped guidance files:

```bash
# POSIX shells
find . -name AGENTS.md -not -path './.git/*' -not -path './node_modules/*' -not -path './target/*'

# PowerShell
Get-ChildItem -Recurse -Force -Filter AGENTS.md |
  Where-Object { $_.FullName -notmatch '\\.git|node_modules|target' } |
  Select-Object -ExpandProperty FullName
```

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
| user global guidance | `~/.codex/AGENTS.md` | user-wide preferences, outside repo scope |
| generated/runtime guidance | `.omx/.../AGENTS.md` or similar | runtime state; usually read-only/no-edit |

### Phase 2: Evidence Collection

For every repo guidance file, verify claims against the repository:

- commands in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, CI files
- actual directory structure and entry points
- test/lint/typecheck/build commands
- generated, vendored, secret, data, or deployment-sensitive paths
- nested guidance overlap or conflicts
- Codex-specific surfaces: `.codex/skills`, `.codex/agents`, `AGENTS.md` scope rules, sandbox/approval notes
- optional OMX sections only when present in the repo or current user environment

### Phase 3: Quality Assessment

Use `references/quality-criteria.md` for detailed scoring.

Quick checklist:

| Criterion | Weight | Check |
|---|---:|---|
| scope and override clarity | 20 | file explains what subtree it governs and how it relates to parent guidance |
| executable commands and gates | 20 | build/test/lint/typecheck commands are real and scoped |
| architecture and ownership | 15 | enough map to route future edits without restating obvious code |
| safety and permissions | 15 | sandbox, approvals, secrets, destructive operations, external services are clear |
| Codex workflow fit | 15 | skills/subagents/plugins/OMX guidance is accurate and not overpromised |
| conciseness and currency | 15 | current, dense, non-duplicative, no stale file paths |

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
- Nested scoped files: X
- Average score: X/100
- Files needing update: X

### Scope Map
| File | Governs | Parent guidance | Notes |
|---|---|---|---|
| `AGENTS.md` | repo root | none | ... |
| `packages/api/AGENTS.md` | `packages/api/**` | root | ... |

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
3. Move subtree-specific detail to the narrowest applicable nested `AGENTS.md` instead of duplicating it everywhere.
4. Preserve marker blocks exactly unless the user explicitly asks to repair them.
5. Prefer additions or surgical rewrites over wholesale replacement.
6. Remove stale commands only after verifying current replacements.
7. Do not add generic advice that Codex already knows.

### Phase 6: Verification

Run the smallest checks that prove the edits:

- `git diff --check`
- command existence checks for newly documented commands when cheap
- repo docs or lint gates when AGENTS.md is part of a larger docs change
- targeted search for stale names or paths removed by the update

If a documented full gate is expensive, state whether it was run or why it was not.

## Reference Files

- `references/quality-criteria.md` — scoring rubric and red flags
- `references/templates.md` — root, monorepo package, frontend/backend/docs templates
- `references/update-guidelines.md` — what to add, avoid, and preserve

## Common Issues to Flag

- root `AGENTS.md` missing commands required by CI or local development
- nested `AGENTS.md` contradicts parent guidance without saying why
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

### What improved
- scope/override clarity
- command/gate accuracy
- safety boundaries

### Verification
- `git diff --check` — passed
- `<targeted command>` — passed/failed/skipped with reason

### Remaining risks
- ...
```
