# 命令系统

## 源目录结构

当某个平台在仓库中有命令源时，命令源文件位于 `content/platforms/<platform>/commands/`。

当前 live 源目录包括：

- `content/platforms/antigravity/commands/`
- `content/platforms/claude/commands/`
- `content/platforms/gemini/commands/`
- `content/platforms/trae/commands/`
- `content/platforms/windsurf/commands/`

当前 live 命令文件刻意保持很小：

- Claude：`archive-planning.md`、`init-projects.md`
- Gemini：`export-summary`、`import-summary`、`plan/new`、`plan/impl`
- Antigravity / Trae / Windsurf：`export-summary`、`import-summary`

Codex prompt 源位于 `content/platforms/codex/prompts/`，而不是 `content/platforms/codex/commands/`。其中包含 `archive-planning.md`、`init-projects.md` 等 Codex 专属 prompt-style commands。

## 安装模型

并不是每一个安装目标平台都要在 `content/platforms/*/commands/` 里拥有同名源目录。

MCS 根据平台配置读取：

- `commands_source`
- 可选的 `fallback_commands_source`

`platforms.toml` 与 `mcs-core` 默认配置中的典型例子：

- Codex 会把 prompt-like commands 安装到 `prompts/`；仓库里也有 Codex 专属 prompt 源 `content/platforms/codex/prompts/`。
- Qwen、Kiro、Qoder、OpenCode 等平台可以声明 fallback command source，即使它们自己的源树不存在。
- Trae CN 复用 `trae`。
- Antigravity、Windsurf 这类 app 型平台安装到 `workflows/`。

## 命令最终安装到哪里

| 平台类型 | 安装目录 |
|----------|----------|
| Claude 类 CLI | `commands/` |
| Codex | `prompts/` |
| Kiro | `steering/` |
| Antigravity / Windsurf | `workflows/` |

精确的每个平台路径见 [安装](/zh/guide/installation)，权威配置以 `platforms.toml` 与 `mcs-core` 默认值为准。

## 推荐使用方式

- 用 `just mcs` 管理终端工作流。
- 用 `just web` 管理浏览器工作流。
- 在 [/zh/commands/](/zh/commands/) 查看当前仓库实际提供的命令目录。

## 历史说明

旧文档曾引用大规模 Claude 命令家族和 `zcf` 树，但这些源已经从 `content/platforms/*/commands/` 中移除。相关页面仅作为兼容参考保留。当前维护的工作流是 `mcs/` workspace，加上当前真实存在的 `content/platforms/*/commands/` 与 `content/platforms/codex/prompts/` 源目录。
