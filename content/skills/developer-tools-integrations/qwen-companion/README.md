# Qwen Companion

`qwen-companion` gives Qwen CLI a **structured companion workflow** for repository work.

Use it when the user wants explicit stages — review, bounded execution, continuation with clear limits — instead of a loose one-command Qwen interaction.

## Best for

- Qwen-based review-first flows
- bounded follow-up work
- next-step definition in a multi-step task
- continuation with explicit scope and verification

## Boundaries

This skill does **not** automatically imply:
- persistent native task threads
- provider-managed job lifecycle commands
- hidden background orchestration

unless the active Qwen environment truly exposes those capabilities.

## Suggested usage

| Goal | Example phrasing |
|---|---|
| review first | “先让 Qwen 看一下这个改动方向对不对” |
| bounded execution | “让 Qwen 只做下一步最小改动，不要扩散范围” |
| continuation | “继续这个 Qwen 流程，但先明确现在是接着做哪一步” |
| second-pass reasoning | “让 Qwen 再从边界条件和失败路径角度检查一下” |

## Relationship to sibling skills

| Skill | Positioning |
|---|---|
| `qwen-companion` | Qwen CLI staged companion workflow |
| `codex-companion` | Codex-specific runtime lifecycle and background jobs |
| `claude-code-companion` | Claude Code-native companion workflow |
| `gemini-companion` | Gemini CLI staged companion workflow |
