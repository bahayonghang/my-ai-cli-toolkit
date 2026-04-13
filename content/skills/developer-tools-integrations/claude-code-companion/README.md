# Claude Code Companion

`claude-code-companion` defines a **companion-style workflow** for Claude Code itself.

It is meant for cases where the user wants Claude Code to behave less like a one-shot assistant and more like a structured collaborator: review first, then implement, then verify; or resume a prior effort with explicit scope and bounded next steps.

## Best for

- staged implementation work inside Claude Code
- review-first execution
- continuing an earlier Claude Code task from repository context
- clarifying whether a task should be handled directly now or as a follow-up flow

## What it is not

This skill does **not** claim Codex-style app-server threads, native job ids, or Codex runtime lifecycle commands.

If the user specifically wants:
- background Codex jobs
- resumable Codex task threads
- `status / result / cancel`

use [codex-companion](../codex-companion/README.md) instead.

## Suggested usage

| Goal | Example phrasing |
|---|---|
| review first | “先帮我 review 这个改动，再决定要不要改” |
| continue safely | “继续上次 Claude Code 那个任务，但先说清楚下一步要做什么” |
| bounded follow-up | “按刚才确认的方案继续实现，先做最小一部分” |
| verification-aware flow | “改完以后把验证过程也带上” |

## Operating guidance

1. Reconstruct the current goal from repo state and conversation context.
2. Be explicit about what is being resumed.
3. Prefer a review-first path when requirements are still moving.
4. Keep implementation bounded and verifiable.
5. State clearly whether continuity comes from current context only, rather than a provider-native persistent runtime.

## Relationship to sibling skills

| Skill | Positioning |
|---|---|
| `claude-code-companion` | Claude Code-native staged workflow |
| `codex-companion` | Codex runtime lifecycle + task orchestration |
| `gemini-companion` | Gemini CLI companion workflow |
| `qwen-companion` | Qwen CLI companion workflow |
