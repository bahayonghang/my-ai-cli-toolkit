# External Skills TUI

Modern terminal user interface for managing external skills installation.

## Overview

External Skills TUI is a Textual-based terminal application that provides an intuitive interface for browsing, searching, and installing third-party skills from npm/npx/pip/git sources.

## Features

- 🎯 **Platform Selection** - Choose target platform at startup (Claude/Codex/Gemini/Kiro/Windsurf/Cursor/Copilot)
- 📋 **Skill Browser** - Browse all registered external skills with type icons and descriptions
- 🔍 **Real-time Search** - Filter skills by name or description instantly
- 📖 **Detail View** - View complete skill information including dependencies and supported platforms
- ✅ **Dependency Check** - Verify required dependencies before installation
- 📦 **One-click Install** - Install skills with real-time progress and command output
- ⌨️ **Vim-style Navigation** - Support for j/k keys and arrow keys

## Installation

```bash
# Install dependencies
pip install textual typer rich

# For Python < 3.11
pip install tomli
```

## Usage

```bash
# Run from external-skills directory
cd external-skills
python -m tui
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑/↓` or `j/k` | Navigate up/down |
| `Enter` or `d` | View skill details |
| `i` | Install selected skill |
| `c` | Check dependencies |
| `/` | Open search |
| `Esc` | Close panel / Go back |
| `q` | Quit application |

## Screens

### Platform Selection Screen

The first screen shown at startup. Select your target AI coding assistant platform:

- **Claude** - `~/.claude/`
- **Codex** - `~/.codex/`
- **Gemini** - `~/.gemini/`
- **Kiro** - `~/.kiro/`
- **Windsurf** - `~/.codeium/windsurf/`
- **Cursor** - `~/.cursor/`
- **Copilot** - `~/.copilot/`

### Main Screen

After selecting a platform, the main screen displays:

1. **Header** - Application title and current platform badge
2. **Skill List** - All available skills with:
   - Type icon (📦 npm-cli, ⚡ npx, 🐍 pip-cli, 🔗 git)
   - Skill name
   - Description
   - Support status for current platform
3. **Footer** - Keyboard shortcuts reference

### Detail Panel

Press `d` or `Enter` to view skill details:

- Description
- Installation type
- Package name
- Required dependencies
- Supported platforms
- Homepage URL
- License

### Progress Panel

During installation, shows:

- Current step indicator
- Progress bar
- Real-time command output log
- Success/failure status

## Skill Types

| Type | Icon | Description |
|------|------|-------------|
| `npm-cli` | 📦 | Global npm package with init command |
| `npx` | ⚡ | Direct npx execution (no global install) |
| `pip-cli` | 🐍 | Python package with CLI |
| `git` | 🔗 | Git repository with install script |

## Architecture

```
external-skills/tui/
├── app.py              # Main application class
├── styles.tcss         # Textual CSS styles
├── __init__.py
├── __main__.py         # Entry point
├── components/
│   ├── skill_list.py   # SkillItem and SkillListView
│   └── ...
├── screens/
│   ├── platform_select.py  # Platform selection screen
│   ├── main_screen.py      # Main skill browser screen
│   └── ...
└── core/
    ├── manager.py      # ExternalSkillManager
    ├── models.py       # Data models
    └── ...
```

## Requirements

- Python >= 3.10
- Textual >= 0.40.0
- typer
- rich
- tomli (Python < 3.11)

## Related

- [External Skills CLI](/guide/installation#external-skills) - Command-line interface
- [Skill Manager](/skills/skill-manager) - Community skills browser
