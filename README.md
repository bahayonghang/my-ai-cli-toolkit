# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository: installable skills, platform-scoped commands/agents/prompts/rules, hooks, and a curated third-party skill registry.

The repository is organized around a single working area:

- `content/skills/` — first-party skill catalog
- `content/community-skills-registry/` — third-party skill registry (TOML metadata)
- `content/hooks/` — runtime hook assets
- `content/platforms/<platform>/` — platform-scoped commands, agents, prompts, rules

Platform install paths and per-platform structure are defined in `platforms.toml`.

## Quick start

### Install skills directly from GitHub

You do not need to clone this repository to install skills.

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

### Clone for local validation

Clone the repository only when you want to validate or contribute changes locally:

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

just ci
```

`just ci` runs the same checks as GitHub Actions: skills metadata validation, Python compile check, Node skill tests, and `git diff --check`.

## Repository layout

```text
.
├── content/
│   ├── skills/                     # First-party skill catalog
│   ├── community-skills-registry/  # Third-party skill registry (TOML metadata)
│   ├── hooks/                      # Runtime hook assets
│   └── platforms/
│       └── <platform>/
│           ├── commands/  # Platform command / workflow sources when present
│           ├── agents/    # Platform agent definitions when present
│           ├── prompts/   # Platform prompt packs when present
│           └── rules/     # Platform base guidance files when present
├── platforms.toml                  # Platform install mapping
└── justfile                        # Local validation entrypoints
```

## Skill categories

The first-party catalog under `content/skills/` uses these canonical categories:

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`
- `visual-media-design`

## Platform model

Platform paths are resolved in this order:

1. built-in defaults inside the install tooling
2. `platforms.toml` in this repository
3. optional user overrides at `~/.config/myclaude/platforms.toml`

Not every platform has its own independent source tree. Some platforms install commands from a fallback source directory even when they target a different folder on disk; check `platforms.toml` before adding a new platform.

## License

MIT
