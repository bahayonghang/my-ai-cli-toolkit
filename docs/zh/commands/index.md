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
- [export-summary](/zh/commands/export-summary)：核心上下文导出流程
- [import-summary](/zh/commands/import-summary)：上下文导入流程
- [git-commit](/zh/commands/git-commit)：Conventional Commit 辅助命令

## 相关指南

- [命令系统](/zh/guide/commands)
- [安装](/zh/guide/installation)
