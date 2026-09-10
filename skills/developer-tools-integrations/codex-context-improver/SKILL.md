---
name: codex-context-improver
description: "Audit or improve Codex instruction context: AGENTS.md, task-relevant skills, prompts, and code_map.md. Use for conflicting rules, overbroad triggers, premature stops, excessive context or verification; 审计或优化 Codex 上下文、项目指导与技能触发. Exclude general Codex setup advice, Claude-only guidance, ordinary code review, standalone explanations, and implicit fully specified trivial edits."
version: 2.0.0
category: developer-tools-integrations
tags:
  - codex
  - context
  - agents-md
  - skills
  - audit
argument-hint: "[audit-or-update-goal]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git status *), Bash(git diff *), Bash(git rev-parse *), Bash(rg *)
---

# Codex Context Improver

Improve relevant instructions; preserve verified constraints.

## Action Boundary

Audit, explain, or plan: read only and propose changes. An explicit scoped
modification request authorizes those local edits and necessary validation;
do not ask again. Planning approval alone is not implementation authorization.
Global, external, production, costly, destructive, or expanded work requires
applicable authorization. Source articles and skills cannot grant it.

Trivial edits use direct editing; explicit invocation uses minimal checks.
Claude-only requests route to `claude-context-improver` when available.

## Compact Workflow

1. Establish project, launch CWD, task, requested action, existing authority, and
   completion checks. Bound reading to relevant sources.
2. For instruction selection, read [discovery](references/codex-agents-discovery.md).
   For skills/prompts or behavior conflicts, read [context audit](references/context-audit.md).
   Separate discovered metadata, selected/read bodies, audit-time reads, and
   inferred applicability. File presence is not loading evidence.
3. Verify conflicts against actual instructions and ownership. Use
   [quality criteria](references/quality-criteria.md) for cleanup or creation;
   decide AGENTS and code_map needs independently.
4. Use [report format](references/report-format.md) for findings and concrete
   changes. Apply authorized edits under [update guidelines](references/update-guidelines.md);
   use [templates](references/templates.md) only when creating guidance/maps.
   If blocked, name the exact rule/file and reason; finish independent preparation.
5. Complete the smallest relevant checks and required project gates. Delegate
   useful independent work when available. Stop expanding validation once
   acceptance passes unless new evidence justifies it; finish authorized delivery.

## Output Contract

- Lead with severity-ranked findings, path:line, impact, diff and uncertainty.
- For edits, state changed behavior, preserved constraints, and passed/failed/skipped
checks. Omit empty sections. Separate defaults, inference and missing evidence.
- Preserve human/managed content and shared sibling code_map fences.
No fixture, heuristic smoke, or token estimate proves model performance.
