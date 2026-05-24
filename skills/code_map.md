# `skills/` Code Map

Use this map for `skills/**` navigation. Behavioral rules and required commands live in `skills/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
First-party installable skill catalog organized by category and skill slug.

## Internal Routing
- `developer-tools-integrations/` — repository, agent, Codex, Claude, and architecture tooling skills.
- `development-workflows/` — planning, review, handoff, and implementation workflow skills.
- `docs-writing-publishing/` — writing, document, and presentation-oriented skills.
- `git-github-collaboration/` — Git/GitHub issue, PR, CI, and commit workflow skills.
- `research-learning-knowledge/` — research and paper-workbench skills.
- `<category>/<skill>/SKILL.md` — skill entrypoint and frontmatter source.
- `<category>/<skill>/scripts/` — bundled executable helpers.
- `<category>/<skill>/tests/` — skill-local tests, usually Node `*.mjs` or Python tests.
- `<category>/<skill>/references/`, `assets/`, `templates/`, `evals/`, `agents/` — optional supporting material.

## Search Anchors
- `name:`, `description:`, `category:`, `tags:`, `version:` — frontmatter fields consumed by validators and docs generation.
- `argument-hint`, `allowed-tools` — optional skill metadata used by specific runtimes.
- `tests/*.mjs` — Node skill test entry points for `just node-test`.
- `scripts/check.py` — root validator for `just skills-check`.

## Generated and Ignored Notes
- `__pycache__/` and `*.pyc` are Python bytecode artifacts.
- Generated public docs for skills are under `docs/`, not this subtree.
