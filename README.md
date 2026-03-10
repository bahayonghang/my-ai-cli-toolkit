# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository with a Rust management workspace.

This repository is organized around two top-level areas:

- `content/`: installable skills, commands, agent definitions, runtime files, and external-skill registry data
- `mcs/`: the Rust workspace that powers discovery, install, diff, sync, TUI, and Web workflows

## Quick start

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

# Terminal UI
just mcs

# Web UI + backend
just web

# Documentation site
just doc
```

## Repository layout

```text
.
├── content/
│   ├── skills/            # First-party skill catalog
│   ├── commands/          # Slash commands and workflow sources
│   ├── agents/            # Markdown agent definitions
│   ├── external-skills/   # Third-party skill registry and installer tooling
│   ├── hooks/             # Runtime hook assets
│   └── memorys/           # Platform-specific runtime memory / prompt files
├── docs/                  # VitePress documentation site
├── mcs/                   # Rust workspace: mcs-core, mcs-tui, mcs-web
├── platforms.toml         # Platform install mapping
└── justfile               # Common entrypoints
```

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

## Direct skill-only install

If you only want the first-party skill catalog and do not need the full repository workflow:

```bash
npx skills add bahayonghang/my-claude-code-settings/content/skills
```

## License

MIT
