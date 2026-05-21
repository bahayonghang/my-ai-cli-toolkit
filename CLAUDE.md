# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

This repository organizes content directly at the root: `skills/` (installable skill catalog), `platforms/` (platform-scoped commands/agents/prompts/rules), `platforms/claude/hooks/` (Claude Code hook assets), and `scripts/` (shared validation/maintenance scripts). The old `mcs/` Rust workspace, repo-local platform mapping file, and large archived skill bundles have been removed.

Before editing a scoped area, check any nested guidance file that still exists for that subtree, such as `platforms/codex/rules/AGENTS.md`.

## Core commands

Use `just` from the repository root:

- `just ci` — full local CI: skills metadata check, Python compile check, Node skill tests, `git diff --check`
- `just lint` — `skills-check` + `python-check`
- `just skills-check` — runs `scripts/check.py`
- `just python-check` — compiles every `*.py` under `skills/`, `platforms/`, and `scripts/` (skips `scaffolds`)
- `just node-test` — discovers and runs Node skill tests under `skills/**/tests/*.mjs`
- `just check-deps` — checks local tool availability

## Non-obvious repo rules

- Platform source assets live under `platforms/<platform>/`; do not assume a repo-local `platforms.toml` exists.
- Installable skills belong under `skills/<category>/<skill-name>/`; keep `SKILL.md` as the required entrypoint.
- Reuse the current category directories under `skills/` and avoid inventing new top-level folders casually.
- New skills should use top-level frontmatter fields: `name`, `description`, `category`, `tags`, and `version`.

## Validation and commits

- Run targeted checks while iterating (`just skills-check` for metadata, `just node-test` for Node skill tests, `just python-check` for Python scripts).
- Run `just ci` before finishing or opening a PR.
- Use Conventional Commits; add a scope when it clarifies the change (e.g. `feat(skills):`, `chore(platforms):`).
