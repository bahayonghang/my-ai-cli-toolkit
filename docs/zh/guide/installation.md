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

### 远程交互式安装器

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

这两个脚本会：

- 先让你选择 `project` 或 `global` 安装范围
- 使用 `npx skills ls --json` 检查该范围内已安装的技能
- 在两种来源之间切换：
  - 从本仓库 GitHub source 安装一方 skills
  - 从 `content/skills/external-skills/` 中选择第三方 skills
- 自动从 GitHub 下载候选元数据：
  - 一方 skills：`content/skills/catalog.json`
  - 第三方 skills：`content/skills/external-skills/index.toml` 与 `categories/*.toml`
- 在选择前自动隐藏已安装的技能

当选择 `project` 范围时，当前 shell 工作目录会被视为安装目标。

### 只安装一方 skills catalog

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

当你只需要一方 skills 目录，不需要仓库级 MCS 工具链，也不需要 external-skills 的交互流程时，这是最快路径。

### 无交互式安装全部一方 skills

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a iflow-cli -a kiro-cli -a qwen-code -a trae -a trae-cn
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
just skills-install
```

如果你想显式指定本地安装脚本，也可以使用：

```bash
just skills-install-sh
just skills-install-ps1
```

`just skills-install` 会按当前平台选择默认脚本：

- Windows -> `skills-install.ps1`
- macOS / Linux -> `skills-install.sh`

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

它们的 commands、agents 或 guidance 仍然使用各自平台目录。

### 平台路径总览

| 平台 | Skills 路径 | 平台托管附加内容 |
|------|-------------|------------------|
| Claude | `~/.claude/skills/` | commands：`~/.claude/commands/`，agents：`~/.claude/agents/`，guidance：`~/.claude/CLAUDE.md` |
| Codex | `~/.agents/skills/` | guidance：`~/.codex/AGENTS.md` |
| Gemini | `~/.agents/skills/` | commands：`~/.agents/commands/` |
| Qwen | `~/.qwen/skills/` | commands：`~/.qwen/commands/` |
| Kiro | `~/.kiro/skills/` | commands：`~/.kiro/steering/` |
| Qoder | `~/.qoder/skills/` | commands：`~/.qoder/commands/` |
| Trae | `~/.trae/skills/` | commands：`~/.trae/commands/` |
| Trae CN | `~/.trae-cn/skills/` | commands：`~/.trae-cn/commands/` |
| OpenCode | `~/.agents/skills/` | commands：`~/.config/opencode/commands/` |
| iFlow | `~/.iflow/skills/` | commands：`~/.iflow/commands/` |
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
