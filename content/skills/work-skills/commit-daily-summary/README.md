# commit-daily-summary

> 基于 git 提交生成当日工作日报，把原始 commit 压缩成按主题聚合、动作导向的可读总结。

## Work-Skills 系列对比

| Skill | 视角 | 数据源 | 适用场景 |
|-------|------|--------|----------|
| **commit-daily-summary** | git commits | `git log` | 快速日报、提交总结 |
| project-daily-summary | 多源聚合 | sessions + git | 跨项目/多会话汇总 |
| session-wrap | 当前会话 | 会话上下文 + git | 单次会话收尾 |

## 触发词

中文：总结我今天做了什么、总结我的提交、提交总结、今天提交总结、日报

English: summarize my commits, what did I do today, daily commit summary

## 安装

将整个目录复制到本地技能目录：

```text
~/.claude/commands/commit-daily-summary
~/.codex/skills/commit-daily-summary
```

或通过 MCS 安装。

## License

MIT
