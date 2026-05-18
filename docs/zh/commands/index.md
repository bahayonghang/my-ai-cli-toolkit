# 命令概览

本节文档只描述当前真实存在于 `content/platforms/*/commands/` 下的命令源。

## 如何理解这个命令目录

- 当某个平台在仓库里有命令源时，源文件位于 `content/platforms/<platform>/commands/`。
- 安装目标和最终落盘目录由 `platforms.toml` 与 `mcs-core` 共同决定。
- 某些平台会声明 fallback 源，但 fallback 只有在对应源目录实际存在时才有意义。

## 当前 live 源

| 平台源 | 当前存在的命令 |
|--------|----------------|
| Claude | `init-projects.md` |
| Gemini | `export-summary`、`import-summary`、`plan/new`、`plan/impl` |
| Antigravity | `export-summary`、`import-summary` |
| Trae | `export-summary`、`import-summary` |
| Windsurf | `export-summary`、`import-summary` |

## 阅读时需要区分两层

1. **源目录**：仓库当前在 `content/platforms/*/commands/` 里实际保存了什么。
2. **安装平台**：MCS 为某个平台安装时，会把这些命令放到哪里。

二者相关，但并不总是一一对应。例如 Codex 的 prompt 源位于 `content/platforms/codex/prompts/`，而不是 live `commands/` 源树。

## 建议从这里开始

- [目录](/zh/commands/catalog)：当前源目录、平台映射和命令清单。
- [export-summary](/zh/commands/export-summary)：Gemini、Antigravity、Trae、Windsurf 使用的上下文导出流程。
- [import-summary](/zh/commands/import-summary)：Gemini、Antigravity、Trae、Windsurf 使用的上下文导入流程。

## 历史命令家族页面

`cc`、`cli`、`gh`、`issue`、`kiro`、`memory`、`task`、`workflow`、`zcf`、`utilities` 等旧页面仅作为历史参考保留。由于当前 `content/platforms/*/commands/` 中已没有对应命令源家族，它们不再进入 live sidebar。

## 相关指南

- [命令系统](/zh/guide/commands)
- [安装](/zh/guide/installation)
