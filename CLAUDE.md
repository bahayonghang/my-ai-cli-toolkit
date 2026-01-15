# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyClaude Skills is a collection of Claude Code skills and prompts for AI-assisted development workflows. It provides a unified skill format (`SKILL.md`) and cross-platform installation to multiple targets: Claude Code, Codex CLI, Gemini CLI, Qwen Code, Google Antigravity, and Windsurf.

## Common Commands

```bash
# Install all skills (default target: Claude)
python install.py install-all

# Install to specific target
python install.py --target gemini install-all
python install.py --target codex install-all
python install.py --target qwen install-all
python install.py --target antigravity install-all
python install.py --target windsurf install-all

# List available/installed skills
python install.py list
python install.py installed

# Install specific skill(s)
python install.py install <skill-name> [skill2...]

# Sync prompts/CLAUDE.md to global config
python install.py prompt-update
python install.py prompt-diff

# TUI mode (requires Python 3.10+ and textual)
python install_tui.py

# Run tests
pytest tests/

# Run single test file
pytest tests/test_install_properties.py -v

# Documentation (VitePress)
cd docs && npm install && npm run dev
```

## Architecture

### Core Components

- **`install.py`**: Main installer with `SkillManager` class handling skill discovery, installation, and prompt management. Target configs define installation paths for each platform.

- **`tui/`**: Textual-based TUI application
  - `app.py` - Main app entry
  - `core/manager.py` - Installation manager with async progress support
  - `core/formatters.py` - Display formatting utilities
  - `core/models.py` - Data models (Item, Platform)
  - `components/` - UI components (header, footer, item_list)
  - `styles.tcss` - Textual CSS styles

### Content Structure

- **`skills/<name>/SKILL.md`**: Skill definitions with YAML frontmatter (`name`, `description`, optional `license`). May include subdirectories: `config/`, `tips/`, `references/`, `scripts/`, `cookbook/`

- **`commands/<platform>/`**: Slash commands per platform
  - `claude/` - Markdown files (`.md`)
  - `gemini/` - TOML files (`.toml`)
  - `antigravity/`, `windsurf/` - Markdown workflows
  - Nested directories supported (e.g., `zcf/git-commit.md`)

- **`prompts/CLAUDE.md`**: Global workflow configuration synced via `prompt-update`

### Installation Targets

| Target | Skills Path | Commands Path |
|--------|-------------|---------------|
| claude | `~/.claude/skills/` | `~/.claude/commands/` |
| codex | `~/.codex/skills/` | `~/.codex/prompts/` |
| gemini | `~/.gemini/skills/` | `~/.gemini/commands/` |
| qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
| windsurf | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/workflows/` |

## Skill Definition Format

```yaml
---
name: skill-name
description: Brief description for listing
license: MIT  # optional
---

# Skill Title

Detailed instructions and documentation...
```

## Code Conventions

- Python 3.10+ required for TUI (Textual library)
- Tests use pytest with hypothesis for property-based testing
- Comments in English
- Follow existing patterns in `install.py` and `tui/` modules
