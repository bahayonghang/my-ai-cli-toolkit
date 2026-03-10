# 命令系统

## 源目录结构

命令源文件位于 `content/commands/`，先按平台分组，再按命令家族分层。

当前顶层目录包括：

- `antigravity/`
- `claude/`
- `gemini/`
- `trae/`
- `windsurf/`

这些目录下又继续按命令家族拆分，例如：

- `claude/cc/`
- `claude/gh/`
- `claude/issue/`
- `claude/kiro/`
- `claude/memory/`
- `claude/task/`
- `claude/workflow/`
- `claude/zcf/`
- `gemini/plan/`
- `gemini/zcf/`

## 安装模型

并不是每一个安装目标平台都要在 `content/commands/` 里拥有同名源目录。

MCS 根据平台配置读取：

- `commands_source`
- 可选的 `fallback_commands_source`

`platforms.toml` 中的典型例子：

- Codex 使用 `commands_source = "codex"`，并回退到 `claude`
- Qwen 回退到 `claude`
- Trae CN 复用 `trae`
- Antigravity、Windsurf 这类 app 型平台安装到 `workflows/`

## 命令最终安装到哪里

| 平台类型 | 安装目录 |
|----------|----------|
| Claude 类 CLI | `commands/` |
| Codex | `prompts/` |
| Kiro | `steering/` |
| Antigravity / Windsurf | `workflows/` |

精确的每个平台路径见 [安装](/zh/guide/installation)，权威配置以 `platforms.toml` 为准。

## 推荐使用方式

- 用 `just mcs` 管理终端工作流
- 用 `just web` 管理浏览器工作流
- 在 [/zh/commands/](/zh/commands/) 查看当前仓库实际提供的命令目录

## 历史说明

旧文档里曾把 `install.sh`、`install.ps1`、`src/install.py` 当作主要命令安装入口。对当前仓库来说，这已经不是主路径。当前维护的工作流是 `mcs/` workspace 加上 `content/commands/` 源目录本身。
