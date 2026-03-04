# Installation

## Prerequisites

- Git
- Python 3.6+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Amp](https://ampcode.com/), [Cline](https://cline.bot/), [Codex CLI](https://github.com/openai/codex), [Cursor](https://cursor.com/), [Gemini CLI](https://geminicli.com), [GitHub Copilot](https://github.com/features/copilot), [Kimi Code](https://www.moonshot.cn/), [Qwen Code](https://qwenlm.github.io/qwen-code-docs/), [Google Antigravity](https://antigravity.google/), [Windsurf](https://windsurf.com/), [Trae](https://www.trae.ai/), or [OpenCode](https://opencode.ai/)

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

# Install to OpenCode
uv run python src/install.py --target opencode install-all
```

### Update Global Prompt

```bash
uv run python src/install.py prompt-update
```

### Interactive Mode

```bash
uv run python src/install.py interactive
```

## Quick Install (Claude Code)

The fastest way to install all skills directly into Claude Code is using `npx`:

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

## TUI Mode (Recommended)

For a modern, visual experience with update detection, use the Rust MCS TUI:

```bash
just mcs
```

### Key Features

- 🎯 **Visual Platform Selection**: Claude/Codex/Gemini/Qwen/Antigravity/Windsurf/OpenCode/etc.
- 🧱 **Two-Column Main View**: sidebar categories + item list
- 🔄 **Update Detection**: recursive, directory-aware status for skills
- ✅ **Batch Queue**: install/uninstall/sync with progress + notifications
- 🔍 **Search + Filters**: category/status/search combination
- 🌏 **Unicode Support**: better alignment for emoji/CJK text

### Quick Start

1. Launch TUI: `just mcs`
2. Select your platform
3. Browse items with `↑↓` or `j/k`
4. Press `Space` to select items
5. Press `i` to install selected items
6. Use `U` to update outdated items in current tab

### Essential Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↑↓` / `jk` | Navigate |
| `1` / `2` | Switch Skills/Commands |
| `Tab` | Switch focus (sidebar/list) |
| `Space` | Toggle selection |
| `i` | Install selected items |
| `Enter` | Install focused item |
| `u` / `x` | Uninstall focused / selected |
| `S` | Open multi-platform sync |
| `a` | Select all |
| `/` | Search |
| `Esc` | Back / close popup |
| `q` | Quit |

Legacy compatibility:

```bash
uv run python src/install_tui.py
```

The command above now forwards to MCS.

For detailed TUI documentation, see [MCS Guide](./mcs.md).

### Requirements

- Rust toolchain (`cargo`)
- Python remains required for CLI commands (`src/install.py`)

## Verify Installation

Check installed skills:

```bash
uv run python src/install.py installed
```

## Installation Paths

| Target | Skills Path | Commands/Workflows Path |
|--------|-------------|-------------------------|
| Claude | `~/.claude/skills/` | `~/.claude/commands/` |
| Amp | `~/.agents/skills/` | N/A (skills-only in MCS) |
| Cline | `~/.agents/skills/` | N/A (skills-only in MCS) |
| Codex | `~/.agents/skills/` | `~/.codex/prompts/` |
| Cursor | `~/.agents/skills/` | `~/.cursor/commands/` |
| Gemini | `~/.agents/skills/` | `~/.agents/commands/` |
| GitHub Copilot | `~/.agents/skills/` | N/A (skills-only in MCS) |
| Kimi Code CLI | `~/.agents/skills/` | N/A (skills-only in MCS) |
| OpenCode | `~/.agents/skills/` | `~/.config/opencode/commands/` |
| Qwen | `~/.qwen/skills/` | `~/.qwen/commands/` |
| Antigravity | `~/.gemini/antigravity/skills/` | `~/.gemini/antigravity/workflows/` |
| Windsurf | `~/.codeium/windsurf/skills/` | `~/.codeium/windsurf/workflows/` |
| Trae | `~/.trae/skills/` | `~/.trae/commands/` |

### Legacy Universal Skills Dirs (Manual Migration Only)

- MCS only warns when it detects legacy per-platform skills dirs for Universal platforms.
- MCS does **not** auto-migrate these directories.
- Typical legacy directories:
  - `~/.codex/skills/`
  - `~/.cursor/skills/`
  - `~/.copilot/skills/`
  - `~/.kimi/skills/`
  - `~/.amp/skills/`
  - `~/.cline/skills/`
  - `~/.config/opencode/skills/`

Manual migration example:

```bash
mkdir -p ~/.agents/skills
cp -R ~/.codex/skills/* ~/.agents/skills/
cp -R ~/.cursor/skills/* ~/.agents/skills/
```

### MCS Skill Storage Model

- MCS now stores a canonical copy of each installed skill in `~/.mcs/skills/`.
- Default behavior is symlink install: platform skills directories point to the canonical copy.
- If symlink creation is unavailable (for example Windows privilege limitations), MCS falls back to copy mode automatically.

### One-Time Migration

- On first startup after upgrade, MCS runs a one-time migration that converts existing direct-copy installs to the canonical + symlink model.
- Migration marker files are written under `~/.mcs/migrations/`:
  - `skills-symlink-v1.done`
  - `skills-symlink-v1.lock`
