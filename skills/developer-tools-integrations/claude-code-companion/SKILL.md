---
name: claude-code-companion
description: >-
  Coordinate Claude Code companion-style workflows for multi-step implementation,
  bounded review, follow-up execution, and session-to-session continuation inside
  Claude Code. Use this skill when the user explicitly wants a Claude Code-native
  companion workflow, wants help structuring background or follow-up work in
  Claude Code, or needs clear guidance on when to use direct Claude Code actions
  versus a persistent companion-style process. Prefer this over generic advice
  whenever the task is specifically about Claude Code orchestration, review-first
  execution, or continuing a previous Claude Code task safely.
version: 0.1.0
category: developer-tools-integrations
tags:
  - claude-code
  - companion
  - workflow-orchestration
  - follow-up-execution
  - review-first
  - task-continuation
argument-hint: "[task-or-workflow-goal]"
allowed-tools:
  - Bash(claude *)
  - Bash(just *)
  - Read
---

Use this skill when the user wants a **Claude Code-native companion workflow** rather than a one-off command.

## Best fit

Reach for `claude-code-companion` when the user wants one or more of these outcomes:

- break a Claude Code task into review-first, implementation, and verification stages
- continue a prior Claude Code effort without overpromising hidden persistent threads
- coordinate bounded follow-up work after an earlier review or diagnosis
- decide when work should stay in the foreground versus be structured as a follow-up process
- standardize how Claude Code handles multi-step task continuation inside the current repository

## Positioning

| Skill | Best for |
|---|---|
| `claude-code-companion` | Companion-style orchestration inside Claude Code itself |
| `codex-companion` | Codex-specific background jobs, resumable Codex task threads, and runtime lifecycle commands |
| direct Claude Code usage | Simple one-shot reads, edits, tests, and short implementation loops |

## Working model

Claude Code does **not** automatically guarantee the same runtime model as Codex app-server threads. Treat this skill as a workflow contract, not a promise of Codex-style background infrastructure.

When using this skill:

1. Clarify the user goal and success criteria.
2. Decide whether the task needs:
   - direct execution now,
   - a review-first flow,
   - a staged follow-up flow,
   - or a resume-from-context flow.
3. Prefer the smallest safe next step.
4. Keep claims precise: if a task is being resumed from repository context rather than a provider-native persistent thread, say so explicitly.
5. Before claiming completion, verify the affected code paths, docs, or tests.

## Suggested flow

### 1. Review-first flow
Use this when the user wants validation before edits.

- Inspect the relevant diff, files, or behavior
- Summarize key risks
- Confirm whether implementation should proceed
- Apply changes only after the user wants action

### 2. Follow-up implementation flow
Use this when the user already approved a direction.

- restate the concrete target
- identify the minimum file set to touch
- implement in small steps
- run targeted verification
- report what changed and what still needs review

### 3. Continuation flow
Use this when the user says “continue”, “pick up where we left off”, or similar.

- recover the target from current repo state, task context, and prior conversation context
- explicitly say what is being resumed
- do not imply hidden provider-native thread continuity unless you actually have it
- pick the next highest-value bounded step

## Guardrails

- Do not imply Codex-style persistent task threads unless the underlying Claude Code workflow actually provides them.
- Prefer explicit review and verification over ambiguous “background magic”.
- Keep scope tight; if a task expands, reframe it before continuing.
- If the user needs Codex-specific runtime lifecycle commands like `status / result / cancel`, route them to `codex-companion` instead.

## References

If the task needs deeper Claude Code usage guidance, also inspect nearby repository guidance and the project’s Claude-related docs before deciding on the workflow.
