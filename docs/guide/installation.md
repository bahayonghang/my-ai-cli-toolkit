# Installation

## Prerequisites

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Codex CLI](https://github.com/openai/codex), [Gemini CLI](https://geminicli.com), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), [Windsurf](https://windsurf.com/), or [Trae](https://www.trae.ai/)

## Clone Repository

```bash
git clone https://github.com/anthropics/my-claude-skills.git
cd my-claude-skills
```

## Basic Usage

### Install All Skills

```bash
# Default target is Claude
uv run python src/install.py install-all
```

### Install to Specific Target

```bash
# Install to Gemini
uv run python src/install.py --target gemini install-all

# Install to Codex
uv run python src/install.py --target codex install-all

# Install to Qwen
uv run python src/install.py --target qwen install-all

# Install to Antigravity
uv run python src/install.py --target antigravity install-all

# Install to Windsurf
uv run python src/install.py --target windsurf install-all
```

### Update Global Prompt

```bash
uv run python src/install.py prompt-update
```

### Interactive Mode

```bash
uv run python src/install.py interactive
```

## TUI Mode (Recommended)

For a modern, visual experience with update detection, use the TUI (Terminal User Interface):

```bash
uv run python src/install_tui.py
```

### Key Features

- 🎯 **Visual Platform Selection**: Choose from Claude/Codex/Gemini/Qwen/Antigravity/Windsurf
- 📊 **Table Layout**: Clean, aligned columns with clear headers
- 🔄 **Update Detection**: Automatically detects outdated installations
- 📋 **Tabbed Interface**: Separate tabs for Skills and Commands/Workflows
- ⌨️ **Keyboard Shortcuts**: Quick operations with intuitive keys
- 🔍 **Real-time Search**: Filter items as you type
- ✅ **Batch Operations**: Multi-select and install multiple items
- 🌏 **Chinese Support**: Full support for Chinese characters with proper alignment
- 📁 **Nested Directories**: Support for nested command structures (e.g., `zcf/git-commit`)

### Table Layout

```
  ☐ ✓ Name                     Description                                      Src Time     Tgt Time
--------------------------------------------------------------------------------------------------------
  ☐ ✓ article-cover            Generate professional article cover images as SV 01-02 15:43 01-02 15:43
  ☑ ⚠ document-writer          Write technical documents with proper structure, 01-21 14:30 01-07 12:36
  ☐ ○ paper-check              学术论文全流程检查工具，支持格式检查和内容分析（ 01-19 22:34 N/A        
```

**Column Meanings**:
- **☐/☑**: Selection status (unselected / selected)
- **✓/⚠/○**: Installation status (installed / needs update / not installed)
- **Src Time**: Source file modification time
- **Tgt Time**: Target file modification time (N/A if not installed)

### Quick Start

1. Launch TUI: `uv run python src/install_tui.py`
2. Select your platform
3. Browse items with ↑↓ or jk keys
4. Press `Space` to select items
5. Press `i` to install selected items
6. Items with ⚠ status need updates

### Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑↓` / `jk` | Navigate items |
| `Tab` | Switch Skills/Commands tabs |
| `Space` | Toggle selection |
| `i` | Install selected items |
| `Enter` | Install focused item |
| `a` | Select all |
| `/` | Search |
| `Esc` | Clear search / Back |
| `q` | Quit |

For detailed TUI documentation, see [TUI Guide](./tui.md).

### Requirements

- Python 3.10+
- Dependencies listed in `requirements.txt`

```bash
uv sync
```

## Verify Installation

Check installed skills:

```bash
uv run python src/install.py installed
```

## Installation Paths

| Target | Skills Path | Commands/Workflows Path |
|--------|-------------|-------------------------|
| Claude | `~/.claude/skills/` | `~/.claude/commands/` |
| Codex | `~/.codex/skills/` | `~/.codex/prompts/` |
| Gemini | `~/.gemini/skills/` | `~/.gemini/commands/` |
| Qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/workflows/` |
| Trae | `~/.trae/skills/` | `~/.trae/commands/` |
