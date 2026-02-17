# 安装

## 前置要求

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), [Windsurf](https://windsurf.com/), [Trae](https://www.trae.ai/), 或 [OpenCode](https://opencode.ai/)

## 克隆仓库

```bash
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills
```

## 基础用法

### 安装所有技能

```bash
# 默认目标是 Claude
uv run python src/install.py install-all
```

### 安装到指定目标

```bash
# 安装到 Gemini
uv run python src/install.py --target gemini install-all

# 安装到 Codex
uv run python src/install.py --target codex install-all

# 安装到 Qwen
uv run python src/install.py --target qwen install-all

# 安装到 Antigravity
uv run python src/install.py --target antigravity install-all

# 安装到 Windsurf
uv run python src/install.py --target windsurf install-all

# 安装到 OpenCode
uv run python src/install.py --target opencode install-all
```

### 更新全局提示词

```bash
uv run python src/install.py prompt-update
```

### 交互模式

```bash
uv run python src/install.py interactive
```

## TUI 模式 (推荐)

如需现代化可视化体验，推荐使用 Rust MCS TUI：

```bash
just mcs
```

### 功能特性

- 🎯 可视化平台选择 (Claude/Codex/Gemini/Qwen/Antigravity/Windsurf/OpenCode)
- 🧱 双栏主界面（侧栏分类 + 列表）
- 🔄 递归目录级更新检测
- ✅ 批量任务队列（含进度与通知）
- 🔍 实时搜索与状态过滤
- 📁 支持嵌套目录命令（如 `zcf/git-commit`）

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `1` / `2` | 切换 Skills/Commands |
| `Tab` | 在侧栏和列表之间切换焦点 |
| `i` / `Enter` | 安装选中项 / 当前聚焦项 |
| `u` / `x` | 卸载当前项 / 选中项 |
| `U` | 更新当前标签页过期项 |
| `S` | 打开多平台同步弹窗 |
| `Space` | 切换选择状态 |
| `a` | 全选/清空 |
| `/` | 搜索 |
| `Esc` | 返回/关闭弹窗 |
| `q` | 退出程序 |

兼容旧命令：

```bash
uv run python src/install_tui.py
```

上述命令现会自动转发到 MCS。

### 依赖要求

- 需要 Rust 工具链（`cargo`）
- Python 仍用于 CLI 安装脚本（`src/install.py`）

## 验证安装

检查已安装的技能：

```bash
uv run python src/install.py installed
```

## 安装路径

| 目标 | Skills 路径 | Commands/Workflows 路径 |
|------|-------------|-------------------------|
| Claude | `~/.claude/skills/` | `~/.claude/commands/` |
| Codex | `~/.codex/skills/` | `~/.codex/prompts/` |
| Gemini | `~/.gemini/skills/` | `~/.gemini/commands/` |
| Qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/workflows/` |
| Trae | `~/.trae/skills/` | `~/.trae/commands/` |
| OpenCode | `~/.config/opencode/skills/` | `~/.config/opencode/commands/` |
