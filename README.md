# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository: installable skills, platform-scoped commands/agents/prompts/rules, and runtime hooks.

The repository is organized around a single working area:

- `content/skills/` — first-party skill catalog
- `content/hooks/` — runtime hook assets
- `content/platforms/<platform>/` — platform-scoped commands, agents, prompts, rules

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

Use `content/skills/` as the first-party source for this repository.

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
├── content/
│   ├── skills/      # First-party skill catalog
│   ├── hooks/       # Runtime hook assets
│   └── platforms/
│       └── <platform>/
│           ├── commands/  # Platform command / workflow sources when present
│           ├── agents/    # Platform agent definitions when present
│           ├── prompts/   # Platform prompt packs when present
│           └── rules/     # Platform base guidance files when present
└── justfile         # Local validation entrypoints
```

## Active skill categories

The current first-party catalog under `content/skills/` uses these category directories:

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`

## Platform content

Platform-specific source files live under `content/platforms/<platform>/`. Runtime tools that consume this repository own their install/link target resolution, so this repo no longer carries a separate `platforms.toml` mapping file.

## License

MIT
