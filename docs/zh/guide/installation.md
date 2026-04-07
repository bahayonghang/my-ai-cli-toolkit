# 安装

## 前置要求

按使用场景准备最小环境：

- 只做 skills 安装：
  - Node.js
  - `npx`
- 使用仓库本地工作流：
  - Git
  - Rust 工具链（`cargo`），用于 `mcs/`
  - Node.js + npm，用于文档站点和 `mcs-web/ui`
  - 可选：`just`，用于本地任务入口

## 不克隆仓库，直接安装 skills

如果你只是想安装 skills，不必先克隆本仓库。

### 只安装一方 skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

当你只需要一方 skills 目录，不需要仓库级 MCS 工具链，也不需要 external-skills 的交互流程时，这是最快路径。

### 无交互式安装全部一方 skills

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

## 需要本地工具时再克隆仓库

只有当你要使用 Rust TUI、Web、文档站点，或本地 `just` 包装命令时，才需要克隆仓库。

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings
```

### 主要本地入口

```bash
just mcs
just web
just doc
```

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

这表示 MCS 对共享库平台组的默认安装映射，不代表这些平台只识别这一条原生技能发现路径。以 GitHub Copilot 为例，它仍可识别自己支持的原生 skills 位置；MCS 只是把这一组平台统一安装到共享库。

它们的 commands、agents 或 guidance 仍然使用各自平台目录。

### 平台路径总览

| 平台 | Skills 路径 | 平台托管附加内容 |
|------|-------------|------------------|
| Claude | `~/.claude/skills/` | commands：`~/.claude/commands/`，agents：`~/.claude/agents/`，guidance：`~/.claude/CLAUDE.md` |
| Amp | `~/.agents/skills/` | 无额外托管入口 |
| Cline | `~/.agents/skills/` | 无额外托管入口 |
| Codex | `~/.agents/skills/` | commands：`~/.codex/prompts/`，guidance：`~/.codex/AGENTS.md` |
| Cursor | `~/.agents/skills/` | commands：`~/.cursor/commands/` |
| Gemini | `~/.agents/skills/` | commands：`~/.agents/commands/` |
| GitHub Copilot | `~/.agents/skills/` | 无额外托管入口 |
| Kimi | `~/.agents/skills/` | 无额外托管入口 |
| Qwen | `~/.qwen/skills/` | commands：`~/.qwen/commands/` |
| Kiro | `~/.kiro/skills/` | commands：`~/.kiro/steering/` |
| Qoder | `~/.qoder/skills/` | commands：`~/.qoder/commands/` |
| Trae | `~/.trae/skills/` | commands：`~/.trae/commands/` |
| Trae CN | `~/.trae-cn/skills/` | commands：`~/.trae-cn/commands/` |
| OpenCode | `~/.agents/skills/` | commands：`~/.config/opencode/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | workflows：`~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | workflows：`~/.codeium/windsurf/workflows/` |

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
