# Claude Code Companion

当用户希望使用 **Claude Code 原生的 companion 式工作流**，而不是一次性直接执行时，使用这个 skill。

它适合这类场景：

- 先 review 再改代码
- 继续之前的任务，但先明确恢复的是哪一步
- 把诊断、实现、验证拆成清晰阶段
- 用更克制、更可验证的方式推进多步骤任务

和 `codex-companion` 不同，这个 skill **不承诺** Codex 风格的持久 runtime 线程或 `status / result / cancel` 生命周期命令。它是面向 Claude Code 的 workflow skill。

## 最适合

- Claude Code 内的多步骤实现
- review-first 执行
- 基于当前仓库状态与对话上下文继续任务
- 带明确验证步骤的 follow-up 工作

## 说明

- 要明确说明“继续”的依据来自当前上下文还是 provider 原生持久化能力。
- 优先选择小步、可审查、可验证的下一步。
- 完成前要做事实性验证。
