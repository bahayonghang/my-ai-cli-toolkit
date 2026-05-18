# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository with a Rust management workspace.

This repository is organized around two top-level areas:

- `content/`: installable skills, platform-scoped commands/agents/prompts/rules, hooks, and external-skill registry data
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
npx skills add bahayonghang/my-claude-code-settings/content/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

### Manage skills with skills-manage

If you prefer a desktop UI for skill management, use [skills-manage](https://github.com/iamzhihuix/skills-manage).

It can manage a shared `~/.agents/skills/` library, import skills from GitHub, and install or link them into supported agent clients from one place.

This repository fits that workflow:

- use `content/skills/` as the first-party source
- use `content/community-skills-registry/` as the third-party registry metadata source

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
│   ├── hooks/             # Runtime hook assets
│   └── platforms/
│       └── <platform>/
│           ├── commands/  # Platform command / workflow sources when present
│           ├── agents/    # Platform agent definitions when present
│           ├── prompts/   # Platform prompt packs when present
│           └── rules/     # Platform base guidance files when present
├── docs/                  # VitePress documentation site
├── mcs/                   # Rust workspace: mcs-core, mcs-tui, mcs-web
├── platforms.toml         # Platform install mapping
└── justfile               # Common entrypoints
```

The curated third-party registry lives at `content/community-skills-registry/`.

## Skill categories

The first-party catalog under `content/skills/` currently uses these canonical categories:

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`
- `visual-media-design`

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

For companion and developer-tool integrations:

- `docs/skills/developer-tools-integrations/codex-companion.md` and `docs/zh/skills/developer-tools-integrations/codex-companion.md` cover the Codex companion runtime for task, review, status, result, and cancel prompt flows.
- `docs/skills/developer-tools-integrations/claude-code-companion.md` and `docs/zh/skills/developer-tools-integrations/claude-code-companion.md` describe a Claude Code-native companion workflow for staged review, follow-up execution, and explicit continuation.
- `docs/skills/developer-tools-integrations/gemini-companion.md` and `docs/zh/skills/developer-tools-integrations/gemini-companion.md` describe a Gemini CLI companion workflow for review-first orchestration and bounded follow-up work.
- `docs/skills/developer-tools-integrations/lsp-manager.md` and `docs/zh/skills/developer-tools-integrations/lsp-manager.md` document LSP setup and management support.
- `docs/skills/developer-tools-integrations/rust-cli-tui-developer.md` and `docs/zh/skills/developer-tools-integrations/rust-cli-tui-developer.md` document Rust CLI/TUI development workflows.

For structured code review and audit workflows, see `docs/skills/development-workflows/code-auditor.md` and `docs/zh/skills/development-workflows/code-auditor.md`. Those pages document the renamed `code-auditor` skill, including language-adaptive reporting and severity-based findings.

## License

MIT
