---
name: antigravity-companion
description: >-
  Coordinate Antigravity companion workflows for staged review, focused task
  execution, follow-up analysis, and clear continuation boundaries. Use this
  skill when the user explicitly wants an Antigravity-native companion process,
  wants help deciding how Antigravity should review versus implement, or needs a
  structured Antigravity workflow instead of ad-hoc shell usage. Prefer this
  whenever the task is specifically about operating Antigravity as a companion
  rather than a single one-off command.
version: 0.1.0
category: developer-tools-integrations
tags:
  - antigravity
  - companion
  - workflow-orchestration
  - review-first
  - follow-up-analysis
argument-hint: "[task-or-workflow-goal]"
allowed-tools:
  - Bash(antigravity *)
  - Read
---

Use this skill when the user wants an **Antigravity companion workflow** with explicit stages and boundaries.

## Best fit

Use `antigravity-companion` when the user wants Antigravity to:

- review or analyze before implementation
- act as a structured second-pass companion rather than an ad-hoc command
- continue a previous Antigravity-guided effort with explicit scope
- separate planning/review work from execution work
- stay within a clear Antigravity-native workflow instead of generic shell usage

## Positioning

| Skill | Best for |
|---|---|
| `antigravity-companion` | Structured Antigravity companion workflow |
| `codex-companion` | Codex runtime lifecycle and persistent Codex task handling |
| `claude-code-companion` | Claude Code-native staged workflow |
| direct Antigravity usage | short one-off Antigravity commands |

## Working model

Treat this skill as a **workflow layer** around Antigravity.

Do not promise hidden persistent threads, job ids, or provider-native runtime lifecycle features unless they are actually available in the concrete Antigravity environment being used.

## Suggested flow

1. Clarify the target and success criteria.
2. Decide whether Antigravity should:
   - review first,
   - provide a second opinion,
   - help stage follow-up work,
   - or execute a bounded focused task.
3. Keep the workflow explicit.
4. Verify any claimed outcome against files, diffs, or test results.

## Guardrails

- Do not overpromise Codex-style lifecycle controls.
- Prefer precise workflow framing over “background magic”.
- If the user needs provider-specific persistent runtime semantics, state the limitation clearly.
- If the task is actually about Codex lifecycle commands, redirect to `codex-companion`.
