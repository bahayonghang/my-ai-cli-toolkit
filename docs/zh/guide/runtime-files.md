# 运行时文件

## 概览

除了可安装的 skills 和 commands 之外，仓库里还存在一组运行时相关资源。

当前顶层运行时内容主要位于：

- `content/hooks/`
- `content/memorys/`
- 仓库根目录的 `CLAUDE.md`

## `content/hooks/`

这个目录存放 ClaudeKit hook 相关资源：

- `hooks.json`
- `inject-spec.py`
- `log-prompt.py`
- `pre-bash.py`

`hooks.json` 目前主要接入：

- Bash 的 `PreToolUse`
- `UserPromptSubmit` 日志记录

这些文件属于运行时集成资源，不是 installable skill。

## `content/memorys/`

这个目录存放平台相关的 runtime prompt / memory 文件：

- `content/memorys/claude/Unix/CLAUDE.md`
- `content/memorys/claude/Windows/CLAUDE.md`
- `content/memorys/codex/AGENTS.md`

应把它们视为运行时模板或 seed 文件，而不是普通 docs 页面。

## 根目录 `CLAUDE.md`

根目录 `CLAUDE.md` 记录的是仓库贡献者指导和当前代码架构约定。

它并不等同于：

- 用户机器上已安装的 Claude prompt
- 某个 skill 定义
- 运行时自动生成的 memory 文件

## 与 prompt 相关的说明

MCS 代码里仍保留了为定义 `prompt_file` 的平台做 prompt update 的能力，默认场景主要是 Claude。如果你要调整这部分行为，请同时查看：

- `platforms.toml`
- `mcs/mcs-core/src/core/prompt.rs`
- `content/memorys/` 与 `content/hooks/` 下的运行时资源

## 为什么文档里要单独说明

旧文档曾把 `prompts/` 当作主要运行时目录。对当前仓库来说，真实情况更宽：

- 根目录的贡献者说明
- `content/hooks/` 下的 hook 资源
- `content/memorys/` 下的平台 runtime 文件
- `mcs-core` 里的 prompt update 逻辑
