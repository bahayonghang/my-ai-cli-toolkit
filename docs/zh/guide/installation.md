# 安装

## 前置要求

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), 或 [Google Antigravity](https://antigravity.google/)

## 克隆仓库

```bash
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills
```

## 基础用法

### 安装所有技能

```bash
# 默认目标是 Claude
python3 install.py install-all
```

### 安装到指定目标

```bash
# 安装到 Gemini
python3 install.py --target gemini install-all

# 安装到 Codex
python3 install.py --target codex install-all

# 安装到 Qwen
python3 install.py --target qwen install-all

# 安装到 Antigravity
python3 install.py --target antigravity install-all
```

### 更新全局提示词

```bash
python3 install.py prompt-update
```

### 交互模式

```bash
python3 install.py interactive
```

## TUI 模式 (推荐)

如需现代化的可视化体验，可使用 TUI (终端用户界面)：

```bash
python3 install_tui.py
```

### 功能特性

- 🎯 可视化平台选择 (Claude/Codex/Gemini/Qwen/Antigravity)
- 📋 Skills 和 Commands/Workflows 双标签页界面
- ⌨️ 键盘快捷键快速操作
- 🔍 实时搜索过滤
- ✅ 多选批量安装
- 📁 支持嵌套目录的命令（如 `zcf/git-commit`）

### 键盘快捷键

| 按键 | 功能 |
|------|------|
| `Tab` | 切换 Skills/Commands 标签页 |
| `i` / `Enter` | 安装当前聚焦项 |
| `Space` | 切换选择状态 |
| `s` | 安装选中项 |
| `a` | 安装全部 |
| `Ctrl+A` | 全选 |
| `Ctrl+D` | 取消全选 |
| `/` | 搜索 |
| `t` | 切换平台 |
| `q` | 退出 |

### 依赖要求

- Python 3.10+
- [Textual](https://textual.textualize.io/) 库

```bash
pip install textual
```

## 验证安装

检查已安装的技能：

```bash
python3 install.py installed
```

## 安装路径

| 目标 | Skills 路径 | Commands/Workflows 路径 |
|------|-------------|-------------------------|
| Claude | `~/.claude/skills/` | `~/.claude/commands/` |
| Codex | `~/.codex/skills/` | `~/.codex/prompts/` |
| Gemini | `~/.gemini/skills/` | `~/.gemini/commands/` |
| Qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
