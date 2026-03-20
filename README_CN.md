# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个围绕跨平台 AI 内容与 Rust 管理工作区构建的仓库。

当前仓库主要由两部分组成：

- `content/`：可安装技能、命令、agent 定义、运行时文件、外部技能注册表
- `mcs/`：负责 discovery、install、diff、sync、TUI、Web 的 Rust workspace

## 快速开始

### 直接从 GitHub 安装 skills

如果你只是想安装 skills，不需要先克隆本仓库。

交互式安装器：

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

直接安装一方 skills catalog：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

把全部一方 skills 无交互式安装到指定 Agent：

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a iflow-cli -a kiro-cli -a qwen-code -a trae -a trae-cn
```

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

# 本地交互式 skills 安装器
just skills-install
```

## 交互式安装脚本

`tools/scripts/skills-install/` 下的跨平台脚本默认面向“远程直接执行”场景，两端流程一致：

1. 选择安装范围：`project` 或 `global`
2. 通过 `npx skills ls --json` 识别已安装 skills
3. 选择安装模式：
   - 从本仓库 GitHub source 安装一方 skills
   - 从 `content/skills/external-skills/` 选择第三方 skills
4. 从 GitHub 下载候选元数据：
   - 一方 skills：`content/skills/catalog.json`
   - 第三方 skills：`content/skills/external-skills/index.toml` 与 `categories/*.toml`
5. 在选择前自动过滤掉已安装 skills
6. 执行对应的 `npx skills add ...` 命令

如果你已经克隆仓库，仍可使用本地便捷入口：

```bash
just skills-install
just skills-install-sh
just skills-install-ps1
```

当选择 `project` 范围时，当前 shell 工作目录会被视为安装目标。

## 仓库结构

```text
.
├── content/
│   ├── skills/            # 一方技能目录与 external-skills/ 注册表分片
│   ├── commands/          # Slash command / workflow 源文件
│   ├── agents/            # Markdown agent 定义
│   ├── hooks/             # 运行时 hook 资源
│   └── memorys/           # 平台相关 runtime memory / prompt 文件
├── docs/                  # VitePress 文档站点
├── mcs/                   # Rust workspace：mcs-core、mcs-tui、mcs-web
├── platforms.toml         # 平台安装映射
└── justfile               # 常用入口命令
```

当前第三方技能注册表位于 `content/skills/external-skills/`。

## 技能分类

`content/skills/` 当前使用以下分类：

- `academic-skills`
- `ai-llm-skills`
- `diagram-skills`
- `document-skills`
- `git-github-skills`
- `media-skills`
- `skill-meta-skills`
- `tech-stack-skills`
- `workflow-skills`

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

其中 Codex CLI skill 的说明见 `docs/skills/ai-llm-skills/codex.md` 与 `docs/zh/skills/ai-llm-skills/codex.md`。这两页会同步维护当前 Codex CLI 写法，并已更新为默认模型 `gpt-5.4` 以及推荐的 `codex exec` 与实时网络搜索用法。

## License

MIT
