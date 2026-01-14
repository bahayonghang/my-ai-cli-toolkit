# 导入会话上下文 (Import Summary)

`/import-summary` 命令允许您通过读取由 `/export-summary` 生成的总结文件，来恢复上一次会话的上下文。

## 用法

```bash
/import-summary [文件名]
```

*   **`[文件名]`** (可选): 上下文文件的路径。如果未指定，默认使用 `session_context.md`。

## 描述

开启一个新的会话通常意味着丢失了刚才完成的工作、做出的架构决策以及下一步具体要做什么的"记忆"。

`/import-summary` 命令通过摄取结构化的 **交接总结 (Handoff Summary)** 来解决这个问题。它指示 AI：
1.  读取指定的 Markdown 文件。
2.  内化目标、成就和待办事项。
3.  将内部状态与项目的连续性对齐。

## 工作流

1.  **会话 A 结束时**: 运行 `/export-summary`。生成 `session_context.md` 文件。
2.  **会话 B 开始时**: 运行 `/import-summary`。
3.  **结果**: AI 立刻明白：
    *   "啊，我们正在构建登录流程。"
    *   "我们已经完成了 `auth_service.py`。"
    *   "下一步是编写单元测试。"

## 平台支持

| 平台 | 支持情况 | 默认文件 |
|----------|---------|-------------|
| Claude Code | ✅ | `session_context.md` |
| Gemini CLI | ✅ | `session_context.md` |
| Codex CLI | ❌ | 暂不支持 |
