# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个围绕跨平台 AI 内容与 Rust 管理工作区构建的仓库。

当前仓库主要由两部分组成：

- `content/`：可安装技能、平台级 commands/agents/prompts/rules、hooks、外部技能注册表
- `mcs/`：负责 discovery、install、diff、sync、TUI、Web 的 Rust workspace

## 快速开始

### 直接从 GitHub 安装 skills

如果你只是想安装 skills，不需要先克隆本仓库。

直接安装一方 skills catalog：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

把全部一方 skills 无交互式安装到指定 Agent：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

### 用 skills-manage 管理 skills

如果你更想用桌面界面管理 skills，直接用 [skills-manage](https://github.com/iamzhihuix/skills-manage)。

它可以统一管理 `~/.agents/skills/` 共享目录，从 GitHub 导入 skills，并把 skills 安装或链接到已支持的 agent 客户端。

这个仓库可以直接接到这条链路里：

- `content/skills/` 用作一方 skills 源
- `content/community-skills-registry/` 用作第三方 skills 注册表元数据源

### 在需要 MCS、文档或本地工作流时再克隆仓库

只有当你要使用 Rust TUI、Web、文档站点，或者本地 `just` 入口时，才需要克隆仓库：

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

# 终端界面
just mcs

# Web UI + 后端
just web

# 文档站点
just doc
```

## 仓库结构

```text
.
├── content/
│   ├── skills/            # 一方技能目录
│   ├── community-skills-registry/  # 第三方技能注册表（TOML 元数据）
│   ├── hooks/             # 运行时 hook 资源
│   └── platforms/
│       └── <platform>/
│           ├── commands/  # 平台 command / workflow 源（存在时）
│           ├── agents/    # 平台 agent 定义（存在时）
│           ├── prompts/   # 平台 prompt packs（存在时）
│           └── rules/     # 平台基础指导文件（存在时）
├── docs/                  # VitePress 文档站点
├── mcs/                   # Rust workspace：mcs-core、mcs-tui、mcs-web
├── platforms.toml         # 平台安装映射
└── justfile               # 常用入口命令
```

当前第三方技能注册表位于 `content/community-skills-registry/`。

## 技能分类

`content/skills/` 下的一方 catalog 当前使用以下规范分类：

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`
- `visual-media-design`

完整可浏览目录请使用文档站点或 MCS。

## MCS 工作区

`mcs/` Rust workspace 当前包含：

- `mcs-core`：共享的 discovery、metadata、install、path、migration、prompt 逻辑
- `mcs-tui`：基于 ratatui/crossterm 的终端界面
- `mcs-web`：Axum 后端与 React 前端托管

常用命令：

```bash
just mcs
just mcs-dev
just mcs-web
just mcs-web-server
just mcs-web-test
```

## 平台模型

平台路径由以下三层决定：

1. `mcs-core` 内置默认值
2. 本仓库的 `platforms.toml`
3. 可选的用户覆盖 `~/.config/myclaude/platforms.toml`

并不是每个平台都拥有完全独立的源目录。例如 commands 可能来自 fallback source，但安装到不同平台专属路径。

## 文档

`docs/` 中的 VitePress 站点覆盖：

- 安装
- MCS TUI
- MCS Web
- MCS 架构
- 命令系统
- 运行时文件
- 外部技能
- 中英文技能目录页

其中与 companion / developer tools 相关的技能说明包括：

- `docs/skills/developer-tools-integrations/codex-companion.md` 与 `docs/zh/skills/developer-tools-integrations/codex-companion.md`：面向 Codex companion runtime，覆盖 task、review、status、result、cancel prompt 流程。
- `docs/skills/developer-tools-integrations/claude-code-companion.md` 与 `docs/zh/skills/developer-tools-integrations/claude-code-companion.md`：面向 Claude Code 原生 companion 工作流，强调 review-first、后续执行与显式续接。
- `docs/skills/developer-tools-integrations/gemini-companion.md` 与 `docs/zh/skills/developer-tools-integrations/gemini-companion.md`：面向 Gemini CLI 的 companion 工作流，强调 review-first 编排与有边界的 follow-up。
- `docs/skills/developer-tools-integrations/lsp-manager.md` 与 `docs/zh/skills/developer-tools-integrations/lsp-manager.md`：记录 LSP 安装和管理支持。
- `docs/skills/developer-tools-integrations/rust-cli-tui-developer.md` 与 `docs/zh/skills/developer-tools-integrations/rust-cli-tui-developer.md`：记录 Rust CLI/TUI 开发工作流。

如果要查看结构化代码审计与 review 工作流，请参见 `docs/skills/development-workflows/code-auditor.md` 与 `docs/zh/skills/development-workflows/code-auditor.md`。这两页对应已经改名后的 `code-auditor` skill，包含语言自适应输出和按严重级别组织 findings 的说明。

## License

MIT
