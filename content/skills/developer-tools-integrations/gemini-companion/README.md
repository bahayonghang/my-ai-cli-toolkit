# Gemini Companion

`gemini-companion` gives Gemini CLI a **companion-style operating model**.

Use it when the user wants Gemini to work in explicit stages — for example, review first, then advise on the next step, then handle a bounded task — instead of treating Gemini as a one-shot command wrapper.

## Best for

- Gemini-based review-first workflows
- second-opinion analysis through Gemini CLI
- staged follow-up work with explicit scope
- continuing a Gemini-guided task without overstating runtime guarantees

## Boundaries

This skill is intentionally conservative.

It does **not** promise:
- Codex-style persistent threads
- guaranteed job ids
- `status / result / cancel` lifecycle commands
- hidden background runtimes

unless the concrete Gemini setup explicitly supports them.

## Suggested usage

| Goal | Example phrasing |
|---|---|
| review first | “先用 Gemini 看一遍这个方案，再决定要不要动代码” |
| second opinion | “让 Gemini 从风险和遗漏测试的角度再看一次” |
| bounded next step | “让 Gemini 帮我定义下一步最小动作” |
| continue with limits | “继续这个 Gemini 流程，但别假设有隐藏持久线程” |

## Relationship to sibling skills

| Skill | Positioning |
|---|---|
| `gemini-companion` | Gemini CLI staged companion workflow |
| `codex-companion` | Codex-specific runtime lifecycle and background jobs |
| `claude-code-companion` | Claude Code-native companion workflow |
| `qwen-companion` | Qwen CLI companion workflow |
