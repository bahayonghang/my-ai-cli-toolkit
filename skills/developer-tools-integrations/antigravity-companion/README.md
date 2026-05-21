# Antigravity Companion

`antigravity-companion` gives Antigravity a **companion-style operating model**.

Use it when the user wants Antigravity to work in explicit stages — for example, review first, then advise on the next step, then handle a bounded task — instead of treating Antigravity as a one-shot command wrapper.

## Best for

- Antigravity-based review-first workflows
- second-opinion analysis through Antigravity
- staged follow-up work with explicit scope
- continuing an Antigravity-guided task without overstating runtime guarantees

## Boundaries

This skill is intentionally conservative.

It does **not** promise:
- Codex-style persistent threads
- guaranteed job ids
- `status / result / cancel` lifecycle commands
- hidden background runtimes

unless the concrete Antigravity setup explicitly supports them.

## Suggested usage

| Goal | Example phrasing |
|---|---|
| review first | “先用 Antigravity 看一遍这个方案，再决定要不要动代码” |
| second opinion | “让 Antigravity 从风险和遗漏测试的角度再看一次” |
| bounded next step | “让 Antigravity 帮我定义下一步最小动作” |
| continue with limits | “继续这个 Antigravity 流程，但别假设有隐藏持久线程” |

## Relationship to sibling skills

| Skill | Positioning |
|---|---|
| `antigravity-companion` | Antigravity staged companion workflow |
| `codex-companion` | Codex-specific runtime lifecycle and background jobs |
| `claude-code-companion` | Claude Code-native companion workflow |
