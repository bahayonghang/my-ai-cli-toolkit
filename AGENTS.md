# Repository Guidelines

This `AGENTS.md` governs the repository root and all descendants unless a deeper `AGENTS.md` narrows the scope. Before broad search or repo-wide grep, read `./code_map.md` and use its routing/search anchors to choose targeted files.

## Project Structure & Module Organization
This repository organizes content at the repo root. Installable skills live under `skills/<category>/<skill-name>/`; platform-scoped commands/agents/prompts/rules sit under `platforms/<platform>/`; runtime hook assets for Claude Code are at `platforms/claude/hooks/`; shared validation scripts live in `scripts/`. Keep navigation/search detail in `code_map.md`, not in this file. Check scoped guidance files such as `platforms/codex/AGENTS.md` and `platforms/claude/AGENTS.md` before editing a nested area that provides its own instructions.

## Build, Test, and Development Commands
Use `just` from the repository root:

- `just ci` — full local CI: `docs-check`, `skills-check`, `python-check`, `install-projects-test`, `node-test`, then `git diff --check`.
- `just lint` — `skills-check` + `python-check`.
- `just skills-check` — runs `scripts/check.py` over `skills/`.
- `just python-check` — byte-compiles every `*.py` under `skills/`, `platforms/`, and `scripts/` (skips `scaffolds`).
- `just install-projects` — live-links selected first-party skills into the current project (default `.agents/skills`).
- `just install-projects-test` — runs `scripts/test_install_projects.py`.
- `just node-test` — discovers and runs Node skill tests under `skills/**/tests/*.mjs`.

## Coding Style & Naming Conventions
Follow existing language conventions instead of introducing local variants. Markdown should stay concise; use kebab-case for content directory names and skill slugs. Python scripts under `skills/`, `platforms/`, and `scripts/` must remain byte-compilable (`just python-check`). Node skill scripts target plain Node >= 20 and live alongside their `tests/*.mjs`. Keep `SKILL.md` frontmatter in the documented top-level form: `name`, `description`, `category`, `tags`, `version`.

## Testing Guidelines
Prefer targeted checks while iterating: `just skills-check` for metadata changes, `just node-test` for Node skill changes, and `just python-check` for Python edits. Run `just ci` once from the repository root before finishing or opening a PR. When adding or changing a Node skill, add or update a matching test file in its `tests/` directory.

## Safety and Generated Paths
Do not edit generated, dependency, runtime, or local-only state by hand unless the task is explicitly about recovery for that path. Common skip paths include `.git/`, `.omx/`, `.claude/`, `.agents/`, `.codex/`, `.antigravitycli/`, `ref/`, `.planning/`, `.plannings/`, `docs/node_modules/`, `docs/.vitepress/cache/`, `docs/.vitepress/dist/`, and `__pycache__/`. When changing public skill metadata or platform catalog content, run `just docs-sync` or `just docs-check` so generated docs stay aligned.

## Codex Workflow Notes
Project-local Codex activation files may live under `.codex/`, but that directory is ignored and should stay local unless the repository policy changes. The source-of-truth Codex agent templates live under `platforms/codex/agents/`; keep reusable templates free of stale hardcoded model names unless a task explicitly requires a pinned model.

## Commit & Pull Request Guidelines
Use Conventional Commits with an optional scope and emoji, for example `feat(skills): ✨ add drawio skill` or `chore(platforms): 🧹 prune dead command source`. Keep subjects imperative and scoped. Run `just ci` before committing and fix any failures. Pull requests should summarize the change, list the verification commands used (typically `just ci`), and link related issues; include screenshots only when a skill or platform asset has a visible artifact worth showing.
<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->
