# Directory Structure

> How backend-side operational code is organized in this repository.

## Overview

The repo does not have a service backend. This section covers the files that act like backend plumbing for the repository itself: validators, generators, runtime hooks, and skill-local helpers. Keep executable code next to the owning asset so the source tree stays easy to scan and generated output stays isolated.

## Directory Layout

```text
scripts/
└── check.py

docs/scripts/
├── ensure_docs_deps.py
└── sync_docs_catalog.py

platforms/
└── <platform>/
    ├── agents/
    ├── commands/
    ├── prompts/
    ├── rules/
    └── hooks/
        ├── hooks.json
        ├── pre-bash.py
        ├── inject-spec.py
        └── log-prompt.py

skills/
└── <category>/
    └── <skill-name>/
        ├── SKILL.md
        ├── scripts/
        ├── tests/
        ├── references/
        ├── assets/
        ├── evals/
        └── agents/
```

## Module Organization

- Shared validation and repo-wide maintenance live in `scripts/`.
- Docs catalog generation lives in `docs/scripts/`; the generated pages live under `docs/` and must not be hand-edited.
- Claude runtime hook logic lives under `platforms/claude/hooks/`; `hooks.json` declares wiring and Python files contain executable behavior.
- Platform source assets live under `platforms/<platform>/`, grouped by the runtime concept they export: `commands/`, `agents/`, `prompts/`, `rules/`, or `hooks/`.
- Skill-local helpers stay inside the owning skill package under `skills/<category>/<skill-name>/scripts/`; tests stay under that skill's `tests/` directory.
- Do not create a top-level `src/`, `backend/`, or shared utility package unless multiple existing owners genuinely need the same code.

## Naming Conventions

- Use kebab-case for skill categories, skill slugs, and public content directories.
- Keep required entrypoint filenames exact: `SKILL.md`, `AGENTS.md`, `code_map.md`, and `hooks.json`.
- Python scripts use descriptive action names such as `check.py`, `sync_docs_catalog.py`, `pre-bash.py`, and `log-prompt.py`.
- Node skill tests use `tests/*.mjs` so `just node-test` can discover them.

## Examples

- `scripts/check.py` is the repo-wide skill metadata validator.
- `docs/scripts/sync_docs_catalog.py` is the source-to-docs generator.
- `platforms/claude/hooks/pre-bash.py` is a small runtime hook executable.
- `skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py` is a skill-owned helper.
