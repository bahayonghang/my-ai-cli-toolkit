---
name: qwen-companion
description: >-
  Coordinate Qwen CLI companion workflows for staged review, bounded follow-up
  execution, and explicit continuation inside repository work. Use this skill
  when the user explicitly wants a Qwen-native companion process, wants help
  structuring Qwen review versus implementation, or needs a clear Qwen CLI
  workflow with scoped next steps instead of generic shell usage. Prefer this
  when the task is specifically about operating Qwen as a structured companion.
version: 0.1.0
category: developer-tools-integrations
tags:
  - qwen
  - qwen-cli
  - companion
  - workflow-orchestration
  - staged-execution
  - task-continuation
argument-hint: "[task-or-workflow-goal]"
allowed-tools:
  - Bash(qwen *)
  - Read
---

Use this skill when the user wants a **Qwen CLI companion workflow** with explicit phases and careful scope control.

## Best fit

Reach for `qwen-companion` when the user wants Qwen to:

- review or reason about a change before execution
- define the next bounded step in a multi-step task
- continue an earlier Qwen-guided flow with explicit limits
- operate as a structured companion rather than an ad-hoc command runner

## Positioning

| Skill | Best for |
|---|---|
| `qwen-companion` | Structured Qwen CLI companion workflow |
| `codex-companion` | Codex runtime lifecycle and persistent task handling |
| `claude-code-companion` | Claude Code-native staged workflow |
| `gemini-companion` | Gemini CLI staged companion workflow |

## Working model

Treat this skill as a workflow contract around Qwen CLI.

Do not claim provider-native persistent threads, resumable job ids, or Codex-style lifecycle commands unless the concrete Qwen environment truly supports them.

## Suggested flow

1. Clarify what the user wants Qwen to accomplish.
2. Decide whether the right mode is:
   - review-first,
   - second-pass analysis,
   - bounded execution,
   - or continuation with explicit scope.
3. Keep all continuity claims precise.
4. Verify outcomes from repository state, diffs, or tests before concluding.

## Guardrails

- Prefer explicit boundaries over vague autonomous claims.
- Keep tasks small and reviewable.
- Redirect Codex-style runtime lifecycle expectations to `codex-companion`.
