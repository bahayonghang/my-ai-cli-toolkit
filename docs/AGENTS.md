# Docs Subtree Guidelines

This `AGENTS.md` governs `docs/**` and narrows the root guidance for the VitePress documentation site. Root `AGENTS.md` still applies. Before broad search in this subtree, read `./code_map.md`.

## Subtree Purpose
`docs/` contains the VitePress site, bilingual documentation entry points, and generated catalog pages produced from first-party `skills/` and `platforms/` source assets.

## Local Rules
- Keep VitePress configuration and dependency changes in `docs/.vitepress/config.mts`, `docs/package.json`, and `docs/package-lock.json`.
- `docs/scripts/sync_docs_catalog.py` owns catalog synchronization. Do not hand-edit generated outputs it writes: `docs/.vitepress/generated/catalog.mjs`, `docs/skills/**`, `docs/en/skills/**`, `docs/skills.md`, `docs/en/skills.md`, `docs/hooks.md`, `docs/en/hooks.md`, `docs/commands.md`, and `docs/en/commands.md`.
- For generated catalog changes, edit the source skill/platform/hook content or the sync script, then run `just docs-sync` or `just docs-check`.
- Do not edit dependency/cache/build output under `docs/node_modules/`, `docs/.vitepress/cache/`, or `docs/.vitepress/dist/`.

## Verification
- For docs generator or catalog-impacting changes, run `just docs-check`; use `just docs-sync` first when expected generated files must be refreshed.
- For VitePress config or dependency changes, run `just docs-check`.
- For small authored prose changes outside generated pages, run `git diff --check`; prefer `just docs-check` when navigation, links, or build behavior could be affected.
