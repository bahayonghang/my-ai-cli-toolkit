# 安装

## 前置要求

- Git
- Rust 工具链（`cargo`），用于 `mcs/`
- Node.js + npm，用于文档站点和 `mcs-web/ui`
- 可选：如果只想直接安装技能目录，可使用 `npx`

## 克隆仓库

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings
```

## 主要使用方式

### 1. 启动终端界面

```bash
just mcs
```

该命令会构建并运行 Rust workspace 中的 `mcs-tui`。

### 2. 启动 Web 应用

```bash
just web
```

该命令会同时启动 Axum 后端（`mcs-web`）和 React 前端。

### 3. 本地浏览文档站点

```bash
just doc
```

### 4. 只安装 skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

当你只需要技能目录，不需要仓库级 MCS 工具链时，这是最快的路径。

## 平台路径

权威平台路径定义在 `platforms.toml` 中，并与 `mcs-core` 内置默认值合并。

### 共享技能目录平台

下列平台会把 skills 安装到共享目录 `~/.agents/skills/`：

- Amp
- Cline
- Codex
- Cursor
- Gemini
- GitHub Copilot
- Kimi
- OpenCode

它们的 commands / workflows 仍然使用各自平台目录。

### 平台路径总览

| 平台 | Skills 路径 | Commands / Workflows 路径 |
|------|-------------|---------------------------|
| Claude | `~/.claude/skills/` | `~/.claude/commands/` |
| Codex | `~/.agents/skills/` | `~/.codex/prompts/` |
| Gemini | `~/.agents/skills/` | `~/.agents/commands/` |
| Qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| Kiro | `~/.kiro/skills/` | `~/.kiro/steering/` |
| Qoder | `~/.qoder/skills/` | `~/.qoder/commands/` |
| Trae | `~/.trae/skills/` | `~/.trae/commands/` |
| Trae CN | `~/.trae-cn/skills/` | `~/.trae-cn/commands/` |
| OpenCode | `~/.agents/skills/` | `~/.config/opencode/commands/` |
| iFlow | `~/.iflow/skills/` | `~/.iflow/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/workflows/` |

## 项目根检测

`mcs-core` 会向上查找，直到发现 `content/skills/`，再把该目录识别为项目根目录。因此：

- 当前仓库模型是 `content/skills/`，不是顶层 `skills/`
- 推荐始终在仓库根目录运行 `just mcs` 或 `just web`

## 技能存储模型

MCS 会在 `~/.mcs/skills/` 中维护 canonical skill store：

- 优先使用 symlink 安装
- 自动回退到 copy 安装
- 一次性迁移元数据写入 `~/.mcs/migrations/`

具体操作见 [MCS TUI](/zh/guide/mcs)，实现细节见 [MCS 架构](/zh/guide/mcs-architecture)。
