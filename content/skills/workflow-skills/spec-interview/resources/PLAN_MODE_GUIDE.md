# AI Plan 模式对接指南

当 `spec.md` 确认保存后，引导用户启动对应工具的 Plan 模式。

## 引导语模板

> 规格访谈已结项并输出 `spec.md` 喵！(*^▽^*)
> 现在主人可以使用您顺手的工具执行后续的落地工作流啦：

## 命令行 AI 工具

| 工具 | 启动命令 |
|------|---------|
| Claude Code | `claude -p "请阅读 spec.md 并执行开发"` 或使用 `\plan` |
| Codex CLI | `codex -p "请阅读 spec.md 并执行开发"` |
| Qwen CLI | `qwen -p "请阅读 spec.md 并执行开发"` |
| Gemini CLI | `gemini -p "请阅读 spec.md 并执行开发"` |

## IDE 插件工具

| 工具 | 操作方式 |
|------|---------|
| RooCode | 切换至 "Plan" 模式，指令："请根据项目根目录的 spec.md 执行开发流" |
| Cline | 切换至 "Plan" 模式，指令同上 |
| Cursor | 使用 Agent 模式，指令同上 |

## 当前会话继续

如果用户选择在当前会话中继续：
> "好哒主人，浮浮酱已经准备就绪，请发令开始 Execution 执行吧喵！"
