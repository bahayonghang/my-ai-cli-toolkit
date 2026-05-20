# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo shape

This repository now contains a single working area: `content/` — installable skills, platform-scoped commands/agents/prompts/rules, hooks, and the curated third-party skill registry. The old `mcs/` Rust workspace and `docs/` site have been removed.

Before editing a scoped area, check the nested guidance files:

- `content/CLAUDE.md` — overall content layout
- `content/skills/CLAUDE.md` — skill authoring conventions and category list

## Core commands

Use `just` from the repository root:

- `just ci` — full local CI: skills metadata check, Python compile check, Node skill tests, `git diff --check`
- `just lint` — `skills-check` + `python-check`
- `just skills-check` — runs `content/skills/check.py`
- `just python-check` — compiles every `*.py` under `content/` (skips `scaffolds`)
- `just node-test` — runs `codex-companion` and `skill-map` Node tests
- `just check-deps` / `just info` — environment diagnostics

## Non-obvious repo rules

- `platforms.toml` is load-bearing: it defines install targets, base dirs, and the `skills_subdir` / `commands_subdir` for each platform. Don't add a new platform without updating it.
- Some platforms have `commands_source = ""` (skills-only) or use a fallback command source; check `platforms.toml` before assuming a platform owns its own commands directory.
- The curated third-party registry lives at `content/community-skills-registry/`. Do not put `SKILL.md` files there — installable skills belong under `content/skills/<category>/<skill-name>/`.
- New skills must use the existing categories under `content/skills/` (`development-workflows`, `developer-tools-integrations`, `git-github-collaboration`, `docs-writing-publishing`, `research-learning-knowledge`, `visual-media-design`); don't invent new top-level folders casually.

## Validation and commits

- Run targeted checks while iterating (`just skills-check` for metadata, `just node-test` for the affected test file).
- Run `just ci` before finishing or opening a PR.
- Use Conventional Commits; add a scope when it clarifies the change (e.g. `feat(skills):`, `chore(platforms):`).
