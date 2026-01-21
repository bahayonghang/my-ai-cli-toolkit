# Introduction

MyClaude Skills is a curated collection of Claude Code skills and prompts for enhanced AI-assisted development workflows.

## What are Skills?

Skills are reusable AI instruction modules that enhance Claude Code's capabilities in specific domains. Each skill is defined in a `SKILL.md` file with:

- Clear instructions for the AI
- Domain-specific knowledge
- Best practices and patterns
- Optional supporting files (configs, tips, references)

## Core Features

- **Modular Design** - Each skill is self-contained and focused on a specific task
- **Easy Installation** - Simple CLI commands or modern TUI interface
- **Update Detection** - Automatically detect outdated installations
- **Cross-Platform** - Works on Linux, macOS, and Windows
- **Multi-Target** - Supports Claude Code, Codex CLI, Gemini, Qwen, Antigravity, and Windsurf
- **Chinese Support** - Full support for Chinese characters in TUI

## Installation Methods

### TUI (Recommended)

Modern terminal interface with visual feedback and update detection:

```bash
python install_tui.py
```

Features:
- 📊 Table layout with clear columns
- 🔄 Automatic update detection
- ⌨️ Keyboard shortcuts
- 🌏 Chinese character support

[Learn more about TUI →](/guide/tui)

### CLI

Traditional command-line interface:

```bash
python install.py install-all
```

[Learn more about CLI →](/guide/installation)

## Available Skills

| Skill | Description |
|-------|-------------|
| article-cover | Generate professional SVG cover images |
| codex | Codex CLI integration for code analysis |
| excalidraw | Create hand-drawn style diagrams |
| frontend-design | Build production-grade frontend interfaces |
| gemini-image | AI image generation via Gemini API |
| research | Technical research with citations |
| spec-interview | Refine technical specs through questioning |
| tech-blog | Write technical blog posts |
| tech-design-doc | Generate technical design documents |

## Next Steps

- [TUI Guide](/guide/tui) - Modern terminal interface (recommended)
- [Installation](/guide/installation) - Set up MyClaude Skills
- [Commands](/guide/commands) - Learn available CLI commands
- [Creating Skills](/guide/creating-skills) - Build your own skills
