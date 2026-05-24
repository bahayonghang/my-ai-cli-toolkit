# Repository Code Map

Use this map for navigation and search routing. Behavioral rules, required commands, and safety constraints live in `AGENTS.md`.

## Top-Level Routing
- `skills/<category>/<skill-name>/` — first-party installable skills; start here for skill behavior, frontmatter, bundled scripts, tests, references, and evals.
- `platforms/<platform>/` — platform-scoped source assets such as commands, agents, prompts, rules, and hooks.
- `platforms/codex/` — Codex agent/rule templates; start with `platforms/codex/code_map.md` before editing this subtree.
- `platforms/claude/hooks/` — Claude Code runtime hook assets and hook JSON.
- `scripts/` — shared repository validation and maintenance scripts.
- `docs/` — VitePress documentation site and generated catalog pages; `docs/scripts/sync_docs_catalog.py` owns catalog synchronization.
- `.github/workflows/` — GitHub Actions CI; mirrors root `just ci` across OS matrix.
- `ref/` — ignored third-party/reference checkout area, not first-party source.
- `.planning/` — durable implementation state for approved local plans.

## Key Entrypoints
- `justfile` — local command source of truth for docs, skill, Python, Node, and aggregate CI gates.
- `scripts/check.py` — skill metadata validator used by `just skills-check`.
- `docs/scripts/sync_docs_catalog.py` — scans `skills/` and `platforms/` to generate docs catalog/sidebar content.
- `platforms/codex/agents/*.toml` — reusable Codex native subagent templates.
- `platforms/codex/rules/AGENTS.md` — distributable Codex rule artifact; treat as source content when maintaining this repository.

## Search Anchors
- `name:` in `SKILL.md` — skill identifier/frontmatter entry point.
- `category:` in `SKILL.md` — public skill category used by validators and docs generation.
- `docs-check`, `skills-check`, `python-check`, `node-test`, `ci:` — root `justfile` verification recipes.
- `discover_platforms` — platform catalog discovery in `docs/scripts/sync_docs_catalog.py`.
- `model = "gpt-` — explicit model pinning in Codex agent templates; avoid stale pins unless intentional.
- `platforms.toml` — absence indicates current platform consumers own install/link target resolution.

## Generated, Vendored, and Ignored Paths
- `.git/`, `.omx/`, `.claude/`, `.agents/`, `.codex/`, `.antigravitycli/` — local runtime or activation state, not public source content.
- `ref/` — ignored third-party/reference checkout area.
- `docs/node_modules/` — dependency install output.
- `docs/.vitepress/cache/`, `docs/.vitepress/dist/` — generated docs cache/build output.
- `__pycache__/`, `*.pyc` — Python bytecode artifacts.
- `.planning/`, `.plannings/`, root `task_plan.md`, `findings.md`, `progress.md` — local durable planning artifacts ignored by git.

## Verification Command Index
- `just docs-sync` — update generated docs catalog after skill/platform metadata changes.
- `just docs-check` — check docs catalog drift and build the VitePress site.
- `just skills-check` — validate `skills/` metadata.
- `just python-check` — byte-compile Python under `skills/`, `platforms/`, and `scripts/`.
- `just node-test` — run Node skill tests under `skills/**/tests/*.mjs`.
- `just ci` — full local finish-line gate.
- `git diff --check` — whitespace sanity check used by `just ci`.
