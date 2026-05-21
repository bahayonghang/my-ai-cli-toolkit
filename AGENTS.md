# Repository Guidelines

## Project Structure & Module Organization
This repository organizes content at the repo root. Installable skills live under `skills/<category>/<skill-name>/`; platform-scoped commands/agents/prompts/rules sit under `platforms/<platform>/`; runtime hook assets for Claude Code are at `platforms/claude/hooks/`; shared validation scripts live in `scripts/`. Check scoped guidance files such as `platforms/codex/rules/AGENTS.md` before editing a nested area that provides its own instructions.

## Build, Test, and Development Commands
Use `just` from the repository root:

- `just ci` — full local CI: skills metadata check, Python compile check, Node skill tests, `git diff --check`.
- `just lint` — `skills-check` + `python-check`.
- `just skills-check` — runs `scripts/check.py` over `skills/`.
- `just python-check` — byte-compiles every `*.py` under `skills/`, `platforms/`, and `scripts/` (skips `scaffolds`).
- `just node-test` — discovers and runs Node skill tests under `skills/**/tests/*.mjs`.

## Coding Style & Naming Conventions
Follow existing language conventions instead of introducing local variants. Markdown should stay concise; use kebab-case for content directory names and skill slugs. Python scripts under `skills/`, `platforms/`, and `scripts/` must remain byte-compilable (`just python-check`). Node skill scripts target plain Node >= 20 and live alongside their `tests/*.mjs`. Keep `SKILL.md` frontmatter in the documented top-level form: `name`, `description`, `category`, `tags`, `version`.

## Testing Guidelines
Prefer targeted checks while iterating: `just skills-check` for metadata changes, `just node-test` for Node skill changes, and `just python-check` for Python edits. Run `just ci` once from the repository root before finishing or opening a PR. When adding or changing a Node skill, add or update a matching test file in its `tests/` directory.

## Commit & Pull Request Guidelines
Use Conventional Commits with an optional scope and emoji, for example `feat(skills): ✨ add drawio skill` or `chore(platforms): 🧹 prune dead command source`. Keep subjects imperative and scoped. Run `just ci` before committing and fix any failures. Pull requests should summarize the change, list the verification commands used (typically `just ci`), and link related issues; include screenshots only when a skill or platform asset has a visible artifact worth showing.
