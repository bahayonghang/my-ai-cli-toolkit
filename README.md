# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository with a Rust management workspace.

This repository is organized around two top-level areas:

- `content/`: installable skills, commands, agent definitions, runtime files, and external-skill registry data
- `mcs/`: the Rust workspace that powers discovery, install, diff, sync, TUI, and Web workflows

## Quick start

### Install skills directly from GitHub

If you only want to install skills, you do not need to clone this repository first.

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
```

## Repository layout

```text
.
├── content/
│   ├── skills/            # First-party skill catalog
│   ├── community-skills-registry/  # Third-party skill registry (TOML metadata)
│   ├── commands/          # Slash commands and workflow sources
│   ├── agents/            # Markdown agent definitions
│   ├── hooks/             # Runtime hook assets
│   └── memorys/           # Platform-specific runtime memory / prompt files
├── docs/                  # VitePress documentation site
├── mcs/                   # Rust workspace: mcs-core, mcs-tui, mcs-web
├── platforms.toml         # Platform install mapping
└── justfile               # Common entrypoints
```

The curated third-party registry lives at `content/community-skills-registry/`.

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

For Codex-related skills:

- `docs/skills/ai-llm-skills/codex.md` and `docs/zh/skills/ai-llm-skills/codex.md` cover the direct Codex CLI workflow, including the `gpt-5.4` default model plus the recommended `codex exec` and live web-search patterns.
- `docs/skills/ai-llm-skills/codex-companion.md` and `docs/zh/skills/ai-llm-skills/codex-companion.md` cover the plugin-style companion runtime for background jobs, resumable tasks, and `status / result / cancel` lifecycle management inside Codex.

For structured code review and audit workflows, see `docs/skills/workflow-skills/code-auditor.md` and `docs/zh/skills/workflow-skills/code-auditor.md`. Those pages document the renamed `code-auditor` skill, including language-adaptive reporting and severity-based findings.

## License

MIT
