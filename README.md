# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository with a Rust management workspace.

This repository is organized around two top-level areas:

- `content/`: installable skills, commands, agent definitions, runtime files, and external-skill registry data
- `mcs/`: the Rust workspace that powers discovery, install, diff, sync, TUI, and Web workflows

## Quick start

### Install skills directly from GitHub

If you only want to install skills, you do not need to clone this repository first.

Interactive installer:

```bash
# macOS / Linux
bash <(curl -fsSL https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.sh)
```

```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/bahayonghang/my-claude-code-settings/main/tools/scripts/skills-install/skills-install.ps1 | iex
```

Direct first-party catalog install:

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

Install all first-party skills non-interactively to specific agents:

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a iflow-cli -a kiro-cli -a qwen-code -a trae -a trae-cn
```

### Clone the repository for MCS, docs, or local workflows

Clone the repository when you want the Rust TUI, the web app, local docs, or local `just` entrypoints:

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

# Terminal UI
just mcs

# Web UI + backend
just web

# Documentation site
just doc

# Local interactive skills installer
just skills-install
```

## Interactive install scripts

The cross-platform scripts in `tools/scripts/skills-install/` are designed for direct remote execution and follow the same flow on both platforms:

1. Choose install scope: `project` or `global`
2. Detect installed skills with `npx skills ls --json`
3. Choose install mode:
   - first-party skills from this repository's GitHub source
   - third-party skills from `content/skills/external-skills/`
4. Download candidate metadata from GitHub:
   - first-party skills from `content/skills/catalog.json`
   - third-party skills from `content/skills/external-skills/index.toml` and `categories/*.toml`
5. Filter out already installed skills before selection
6. Run the resulting `npx skills add ...` commands

If you already cloned the repository, local convenience entrypoints remain available:

```bash
just skills-install
just skills-install-sh
just skills-install-ps1
```

For `project` scope, the current shell working directory is treated as the install target.

## Repository layout

```text
.
├── content/
│   ├── skills/            # First-party skill catalog + external-skills/ registry fragments
│   ├── commands/          # Slash commands and workflow sources
│   ├── agents/            # Markdown agent definitions
│   ├── hooks/             # Runtime hook assets
│   └── memorys/           # Platform-specific runtime memory / prompt files
├── docs/                  # VitePress documentation site
├── mcs/                   # Rust workspace: mcs-core, mcs-tui, mcs-web
├── platforms.toml         # Platform install mapping
└── justfile               # Common entrypoints
```

The curated third-party registry lives at `content/skills/external-skills/`.

## Skill categories

The first-party catalog under `content/skills/` currently uses these categories:

- `academic-skills`
- `ai-llm-skills`
- `diagram-skills`
- `document-skills`
- `git-github-skills`
- `media-skills`
- `skill-meta-skills`
- `tech-stack-skills`
- `workflow-skills`

For the browsable catalog, use the docs site or MCS.

## MCS workspace

The Rust workspace in `mcs/` currently contains:

- `mcs-core`: shared discovery, metadata, install, path, migration, and prompt logic
- `mcs-tui`: ratatui/crossterm terminal UI
- `mcs-web`: Axum backend plus React frontend hosting

Useful commands:

```bash
just mcs
just mcs-dev
just mcs-web
just mcs-web-server
just mcs-web-test
```

## Platform model

Platform paths are defined by:

1. built-in defaults in `mcs-core`
2. `platforms.toml` in this repository
3. optional user overrides in `~/.config/myclaude/platforms.toml`

Not every platform has its own independent source tree. For example, commands may install from a fallback source directory even if the target platform installs them to a different folder.

## Documentation

The VitePress site in `docs/` covers:

- installation
- MCS TUI
- MCS Web
- MCS architecture
- commands
- runtime files
- external skills
- skill catalog pages in English and Chinese

For the Codex CLI skill specifically, see `docs/skills/ai-llm-skills/codex.md` and `docs/zh/skills/ai-llm-skills/codex.md`. Those pages track the current Codex CLI syntax and now document the `gpt-5.4` default model plus the recommended `codex exec` and live web-search patterns.

## License

MIT
