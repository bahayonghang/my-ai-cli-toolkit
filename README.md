# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository: installable skills, platform-scoped commands/agents/prompts/rules, and runtime hooks.

The repository is organized at the root:

- `skills/` — first-party skill catalog
- `platforms/<platform>/` — platform-scoped commands, agents, prompts, rules
- `platforms/claude/hooks/` — runtime hook assets for Claude Code
- `scripts/` — shared validation and maintenance scripts

## Quick start

### Install skills directly from GitHub

You do not need to clone this repository to install skills.

Direct first-party catalog install:

```bash
npx skills add bahayonghang/my-claude-code-settings/skills
```

Install all first-party skills non-interactively to specific agents:

```bash
npx skills add bahayonghang/my-claude-code-settings/skills --skill '*' -g -y -a universal -a antigravity -a claude-code -a kiro-cli -a qwen-code -a trae -a trae-cn
```

### Manage skills with skills-manage

If you prefer a desktop UI for skill management, use [skills-manage](https://github.com/iamzhihuix/skills-manage).

It can manage a shared `~/.agents/skills/` library, import skills from GitHub, and install or link them into supported agent clients from one place.

Use `skills/` as the first-party source for this repository.

### Clone for local validation

Clone the repository only when you want to validate or contribute changes locally:

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

just ci
```

`just ci` runs skills metadata validation, Python compile checks, Node skill tests, and `git diff --check`.

## Repository layout

```text
.
├── skills/             # First-party skill catalog
│   └── <category>/<skill-name>/
├── platforms/
│   └── <platform>/
│       ├── commands/   # Platform command / workflow sources when present
│       ├── agents/     # Platform agent definitions when present
│       ├── prompts/    # Platform prompt packs when present
│       ├── rules/      # Platform base guidance files when present
│       └── hooks/      # Runtime hook assets (currently under platforms/claude/)
├── scripts/            # Shared validation and maintenance scripts
└── justfile            # Local validation entrypoints
```

## Active skill categories

The current first-party catalog under `skills/` uses these category directories:

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`

## Platform content

Platform-specific source files live under `platforms/<platform>/`. Runtime tools that consume this repository own their install/link target resolution, so this repo no longer carries a separate `platforms.toml` mapping file.

## License

MIT
