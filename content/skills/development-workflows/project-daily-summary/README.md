# project-daily-summary

> 按项目汇总当天的编码工作，整合会话、计划、完成事项、提交与未提交改动，输出高密度日报。

## Work-Skills 系列对比

| Skill | 视角 | 数据源 | 适用场景 |
|-------|------|--------|----------|
| commit-daily-summary | git commits | `git log` | 快速日报、提交总结 |
| **project-daily-summary** | 多源聚合 | sessions + git | 跨项目/多会话汇总 |
| session-wrap | 当前会话 | 会话上下文 + git | 单次会话收尾 |

## 平台支持

通过 `references/` 目录按需加载平台适配：

- **Codex** — `references/codex-sessions.md`
- **Claude Code** — `references/claude-code-sessions.md`
- **Git-only fallback** — 无 session 时自动降级到纯 git 证据

## 触发词

中文：项目日报、今日工作总结、按项目总结今天、总结今天所有会话

English: daily report, summarize today's work by project

## 安装

将整个目录复制到本地技能目录：

```text
~/.claude/commands/project-daily-summary
~/.codex/skills/project-daily-summary
```

或通过 MCS 安装。

## License

MIT
