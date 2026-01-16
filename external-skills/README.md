# External Skills Installer

外部技能安装工具 - 支持通过 npm/npx/pip/git 安装的第三方技能喵～

## 依赖安装

```bash
# CLI 模式
pip install typer rich tomli  # Python < 3.11 需要 tomli
# 或
pip install typer rich        # Python >= 3.11

# TUI 模式 (额外依赖)
pip install textual
```

## 使用方法

### TUI 模式 (推荐)

现代化终端界面，支持键盘导航、搜索过滤、实时安装进度显示：

```bash
python -m tui
```

TUI 功能特性：
- 🎯 平台选择界面 - 支持 Claude/Codex/Gemini/Kiro/Windsurf/Cursor/Copilot
- 📋 技能列表浏览 - 显示类型图标、名称、描述、支持状态
- 🔍 实时搜索过滤 - 按 `/` 键触发，支持名称和描述匹配
- 📖 技能详情查看 - 按 `d` 或 `Enter` 查看完整信息
- ✅ 依赖检查 - 按 `c` 键检查技能所需依赖
- 📦 一键安装 - 按 `i` 键安装，实时显示进度和命令输出
- ⌨️ Vim 风格导航 - 支持 `j/k` 或方向键

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

### CLI 模式

#### 列出所有外部技能

```bash
python install.py list
```

#### 查看技能详情

```bash
python install.py info ui-ux-pro-max
```

#### 检查依赖

```bash
python install.py check ui-ux-pro-max
```

#### 安装技能

```bash
# 安装到 Claude Code
python install.py install ui-ux-pro-max --target claude

# 安装到其他平台
python install.py install ui-ux-pro-max --target codex
python install.py install ui-ux-pro-max --target kiro
python install.py install ui-ux-pro-max --target windsurf

# 指定项目目录
python install.py install ui-ux-pro-max --target claude --project /path/to/project

# 跳过全局安装（已安装过 CLI）
python install.py install ui-ux-pro-max --target claude --skip-install

# Dry-run 模式（只显示命令）
python install.py install ui-ux-pro-max --target claude --dry-run
```

#### 仅初始化（已安装 CLI）

```bash
python install.py init ui-ux-pro-max --target claude
```

## 技能类型

| 类型 | 说明 | 示例 |
|------|------|------|
| `npm-cli` | 全局安装 npm 包后执行 init | uipro-cli |
| `npx` | 直接通过 npx 执行 | npx some-skill install |
| `pip-cli` | 全局安装 pip 包后执行 | pip install skill && skill init |
| `git` | 克隆仓库后执行安装脚本 | git clone && python install.py |

## 注册新技能

编辑 `registry.toml` 添加新技能：

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
| `description` | ✓ | 技能描述 |
| `type` | ✓ | 安装类型: npm-cli, npx, pip-cli, git |
| `package` | - | npm/pip 包名 |
| `install_command` | - | 全局安装命令 |
| `init_command` | - | 初始化命令 |
| `init_args` | - | 初始化参数，`{target}` 会被替换为目标平台 |
| `target_map` | - | 目标平台映射 (本项目 -> 外部工具) |
| `supported_targets` | ✓ | 支持的目标平台列表 |
| `requires` | - | 前置依赖 (node, python3, git 等) |
| `repo` | - | Git 仓库地址 (git 类型) |
| `branch` | - | Git 分支 (默认 main) |
| `post_clone` | - | 克隆后执行的命令 |
| `homepage` | - | 项目主页 |
| `license` | - | 许可证 |

## 当前支持的技能

| 技能 | 类型 | 描述 |
|------|------|------|
| `ui-ux-pro-max` | npm-cli | UI/UX 设计智能技能 |

## 与主安装脚本的关系

- `install.py` (根目录) - 安装本仓库内的本地技能
- `external-skills/install.py` - 安装第三方外部技能

两者独立运行，互不影响。
