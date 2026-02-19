# External Skills Installer

外部技能安装工具 - 支持通过 npm/npx/pip/git/vercel 安装的第三方技能。

## 快速开始

### 安装依赖

```bash
# CLI 模式（必需）
uv add typer rich tomli  # Python < 3.11 需要 tomli
# 或
uv add typer rich        # Python >= 3.11

# TUI 模式（可选）
uv add textual
```

### 使用方法

#### CLI 模式

```bash
# 列出所有技能（带推荐标记）
uv run python install.py list

# 检测已安装的 AI agents
uv run python install.py agents

# 查看技能详情
uv run python install.py info vercel-react-best-practices

# 检查依赖
uv run python install.py check vercel-react-best-practices

# 安装技能到指定平台
uv run python install.py install vercel-react-best-practices --target claude

# 安装到其他平台
uv run python install.py install ui-ux-pro-max --target codex
uv run python install.py install ui-ux-pro-max --target kiro

# 指定项目目录
uv run python install.py install ui-ux-pro-max --target claude --project /path/to/project

# 跳过全局安装（已安装过 CLI）
uv run python install.py install ui-ux-pro-max --target claude --skip-install

# Dry-run 模式（只显示命令）
uv run python install.py install ui-ux-pro-max --target claude --dry-run

# 仅初始化（已安装 CLI）
uv run python install.py init ui-ux-pro-max --target claude
```

**CLI 功能特性：**
- 自动检测已安装的 AI agent 平台
- 符号链接安装（Windows 自动降级为复制）
- 推荐技能标记
- ASCII Art Banner 和友好的颜色输出
- 支持 Vercel Skills CLI (`npx skills add`)

#### TUI 模式

现代化终端界面，支持键盘导航、搜索过滤、实时安装进度显示：

```bash
uv run python install_tui.py
```

TUI 功能特性：
- 平台选择界面 - 支持 Claude/Codex/Gemini/Kiro/Windsurf/Cursor/Copilot
- 技能列表浏览 - 显示类型图标、名称、描述、支持状态
- 实时搜索过滤 - 按 `/` 键触发，支持名称和描述匹配
- 技能详情查看 - 按 `d` 或 `Enter` 查看完整信息
- 依赖检查 - 按 `c` 键检查技能所需依赖
- 一键安装 - 按 `i` 键安装，实时显示进度和命令输出
- Vim 风格导航 - 支持 `j/k` 或方向键

快捷键：
| 按键 | 功能 |
|------|------|
| `↑/↓` 或 `j/k` | 上下导航 |
| `Enter` 或 `d` | 查看详情 |
| `i` | 安装技能 |
| `c` | 检查依赖 |
| `/` | 搜索 |
| `Esc` | 返回/关闭 |
| `q` | 退出 |

## 技能类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `npm-cli` | 全局安装 npm 包后执行 init | uipro-cli |
| `npx` | 直接通过 npx 执行 | npx some-skill install |
| `pip-cli` | 全局安装 pip 包后执行 | pip install skill && skill init |
| `git` | 克隆仓库后执行安装脚本 | git clone && python install.py |
| `vercel` | 使用 Vercel Skills CLI | npx skills add |

## 注册新技能

编辑 `registry.toml` 添加新技能。

### Vercel 类型技能（推荐）

适用于使用 Vercel Skills CLI 的技能：

```toml
[skills.my-vercel-skill]
description = "My awesome Vercel skill"
type = "vercel"
repo = "https://github.com/user/my-skill-repo"
skill_name = "my-skill"
install_method = "symlink"  # symlink | copy
scope = "global"            # global | project
supported_targets = ["claude", "codex", "kiro", "all"]
requires = ["node"]
homepage = "https://github.com/user/my-skill-repo"
license = "MIT"
recommended = false  # 是否推荐安装
```

### 传统类型技能

```toml
[skills.my-new-skill]
description = "My awesome skill"
type = "npm-cli"
package = "my-skill-cli"
install_command = "npm install -g my-skill-cli"
init_command = "my-skill init"
init_args = ["--ai", "{target}"]
supported_targets = ["claude", "codex", "kiro"]
requires = ["node"]
homepage = "https://github.com/user/my-skill"
license = "MIT"
```

### 配置字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `description` | Y | 技能描述 |
| `type` | Y | 安装类型: npm-cli, npx, pip-cli, git, vercel |
| `package` | - | npm/pip 包名 |
| `repo` | - | Git 仓库地址（git/vercel 类型） |
| `skill_name` | - | 技能名称（vercel 类型） |
| `install_method` | - | 安装方式: symlink（推荐）, copy |
| `scope` | - | 安装范围: global, project |
| `install_command` | - | 全局安装命令 |
| `init_command` | - | 初始化命令 |
| `init_args` | - | 初始化参数，`{target}` 会被替换为目标平台 |
| `target_map` | - | 目标平台映射 (本项目 -> 外部工具) |
| `supported_targets` | Y | 支持的目标平台列表 |
| `requires` | - | 前置依赖 (node, python3, git 等) |
| `branch` | - | Git 分支 (默认 main) |
| `post_clone` | - | 克隆后执行的命令 |
| `homepage` | - | 项目主页 |
| `license` | - | 许可证 |
| `recommended` | - | 是否推荐安装 |

## 当前支持的技能

| 技能 | 类型 | 描述 | 推荐 |
|------|------|------|------|
| `ui-ux-pro-max` | npm-cli | UI/UX 设计智能技能 | |
| `agent-browser` | vercel | Vercel Labs 浏览器自动化 | |
| `vercel-react-best-practices` | vercel | Vercel React 最佳实践 | |
| `remotion-best-practices` | vercel | Remotion 视频开发最佳实践 | |
| `find-skills` | vercel | 技能发现元技能 | ⭐ |
| `planning-with-files` | git | 文件化规划插件 | |

> ⭐ 推荐安装的元技能，帮助 AI 自动发现和建议技能

## 文件结构

| 文件 | 说明 |
|------|------|
| `install.py` | CLI 安装工具 |
| `install_tui.py` | TUI 交互式安装 |
| `registry.toml` | 技能注册表 |

与根目录 `install.py`（安装本仓库内的本地技能）独立运行，互不影响。

## 参考资料

- [Vercel Skills CLI](https://github.com/vercel-labs/skills) - 灵感来源
- [Well-known Agent Skill Discovery](https://github.com/vercel-labs/skills#well-known-agent-skill-discovery)
