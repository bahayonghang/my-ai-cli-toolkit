# 命令概览

本节文档围绕 `content/commands/` 中实际提供的命令目录展开。

## 如何理解这个命令目录

- 源文件位于 `content/commands/`
- 安装目标和最终落盘目录由 `platforms.toml` 与 `mcs-core` 共同决定
- 某些平台会通过 `fallback_commands_source` 复用其他平台的源目录

## 阅读时需要区分两层

1. **源目录**：仓库当前在 `content/commands/` 里实际保存了什么
2. **安装平台**：MCS 为某个平台安装时，会把这些命令放到哪里

二者相关，但并不总是一一对应。

## 建议从这里开始

- [目录](/zh/commands/catalog)：当前源目录、平台映射、命令家族

## 命令家族

| 家族 | 说明 | 命令 |
|------|------|------|
| [cc](/zh/commands/cc) | 命令创建与代理编写 | create-command, meta-agent |
| [cli](/zh/commands/cli) | CLI 工具初始化与代码审查 | cli-init, codex-review |
| [gh](/zh/commands/gh) | Git 操作与 GitHub 集成 | commit, fix-issue, review-pr |
| [issue](/zh/commands/issue) | GitHub Issue 管理 | discover, discover-by-prompt, execute, new, plan, queue |
| [kiro](/zh/commands/kiro) | Kiro IDE 集成 | design, execute, spec, task, vibe |
| [memory](/zh/commands/memory) | 记忆系统管理 | 14 个命令，涵盖记忆生成、加载和更新 |
| [task](/zh/commands/task) | 任务管理 | breakdown, create, execute, replan |
| [workflow](/zh/commands/workflow) | 开发工作流 | 约 30 个命令，包含 brainstorm、session、tools、ui-design 子族 |
| [zcf](/zh/commands/zcf) | Git 工具集 | git-cleanBranches, git-rollback, git-worktree, init-project |

## 独立命令

- [export-summary](/zh/commands/export-summary)：会话上下文导出流程
- [import-summary](/zh/commands/import-summary)：上下文导入流程
- [工具命令](/zh/commands/utilities)：enhance-prompt, version

## 相关指南

- [命令系统](/zh/guide/commands)
- [安装](/zh/guide/installation)
