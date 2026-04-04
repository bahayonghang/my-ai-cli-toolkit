# session-wrap

> 面向**当前会话**的收尾 skill，压缩已完成工作、关键决策、验证情况、经验风险与下一步建议，可选生成结构化 handoff note。

## Work-Skills 系列对比

| Skill | 视角 | 数据源 | 适用场景 |
|-------|------|--------|----------|
| commit-daily-summary | git commits | `git log` | 快速日报、提交总结 |
| project-daily-summary | 多源聚合 | sessions + git | 跨项目/多会话汇总 |
| **session-wrap** | 当前会话 | 会话上下文 + git | 单次会话收尾 |

## 触发词

中文：总结会话、会话总结、收尾、会话收尾、结束会话、总结本次会话

English: wrap up this session, summarize the current session, session closeout

## 特色功能

- **Handoff Note**：可生成结构化交接文档（参见 `references/handoff-format.md`），记录决策、未完成项和环境状态
- **Save/Export**：支持保存到文件或集成 OMC notepad / Claude Code session summary

## 安装

将整个目录复制到本地技能目录：

```text
~/.claude/commands/session-wrap
~/.codex/skills/session-wrap
```

或通过 MCS 安装。

## License

MIT
