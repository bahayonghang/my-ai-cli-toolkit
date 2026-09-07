# My Claude Code Settings

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Cross-platform AI content repository: installable skills, platform-scoped source assets, and Claude Code runtime hooks.

The repository is organized at the root:

- `skills/` — first-party skill catalog
- `platforms/antigravity/` — command sources
- `platforms/claude/agents/` and `platforms/claude/hooks/` — Claude agent prompts and runtime hook assets
- `platforms/codex/agents/` — Codex agent templates (no `prompts/` directory)
- `scripts/` — shared validation, maintenance, and local live-link scripts

Five-harness native load, skill, hook, delegation, and permission bounds: [`docs/harnesses.md`](docs/harnesses.md) ([English](docs/en/harnesses.md)). Those pages are source bounds, not client-load proof.

## Quick start

### Install skills directly from GitHub

You do not need to clone this repository to install skills. This path uses the third-party `npx skills` CLI. It is not the local live-link installer, and the `-a` agent list below is only the usage already shown. Do not treat it as discovery proof for every client.

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

### Live-link first-party skills for local testing

After you clone this repository, you can live-link selected catalog skills into the current project. This is a different tool from `npx skills add`. The default destination is project-level `.agents/skills/` (never `.agent/`). Extra agent directories are linked only when that agent root already exists. The command refuses the user home directory so it cannot write `~/.trae/skills` or other user-global folders.

Static destination maps in `scripts/install_projects.py` (including `.claude/skills`, `.codex/skills`, `.grok/skills`, `.kimi-code/skills`, and `.omp/skills`) are a repo contract. They are not new-session discovery proof.

```bash
python scripts/install_projects.py --list
just install-projects --skill git-commit
just install-projects --category git-github-collaboration
python scripts/install_projects.py --project <other-repo> --skill git-commit
```

Use `python`, not `python3`. `just install-projects` with no flags opens an `npx skills`-style checkbox list for skills, then another list for agents (defaults to agents detected in the current project). The picker shows the absolute project path.


### Clone for local validation

Clone the repository only when you want to validate or contribute changes locally:

```bash
git clone https://github.com/bahayonghang/my-claude-code-settings.git
cd my-claude-code-settings

just ci
```

`just ci` runs `docs-check`, `skills-check`, `python-check`, `python-test`, `install-projects-test`, `node-test`, then `git diff --check`.

## Repository layout

```text
.
├── skills/                  # First-party skill catalog
│   └── <category>/<skill-name>/
├── platforms/
│   ├── antigravity/commands/
│   ├── claude/agents/       # Claude agent prompt assets
│   ├── claude/hooks/        # Claude Code runtime hooks
│   └── codex/agents/        # Codex agent templates only
├── scripts/                 # Shared validation and live-link installer
├── docs/                    # VitePress site; harness facts in docs/harnesses.md
└── justfile                 # Local validation entrypoints
```

## Active skill categories

The current first-party catalog under `skills/` uses these category directories:

- `academic-research-tools`
- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`

Not every skill is semantically equivalent on Claude Code, Codex, Grok Build, Kimi Code CLI, and OMP. See [`docs/harnesses.md`](docs/harnesses.md).

## Platform content

Platform-specific source files live under `platforms/<platform>/` when that platform has them. Runtime tools that consume this repository own their install/link target resolution, so this repo no longer carries a separate `platforms.toml` mapping file.

Current source trees:

- Claude Code: `platforms/claude/agents/` and `platforms/claude/hooks/`
- Codex: `platforms/codex/agents/` only
- Antigravity: `platforms/antigravity/commands/`

There is no `platforms/codex/prompts/` directory and no `platforms/grok/`, `platforms/kimi/`, or `platforms/omp/` source tree.

## License

MIT
