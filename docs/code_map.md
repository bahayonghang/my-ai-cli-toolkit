# `docs/` Code Map

Use this map for `docs/**` navigation. Behavioral rules and required commands live in `docs/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
VitePress documentation site plus generated catalog pages for skills, hooks, and platform commands/prompts.

## Internal Routing
- `.vitepress/config.mts` — VitePress config, sidebar imports, and site metadata.
- `.vitepress/generated/catalog.mjs` — generated sidebar/catalog module from `docs/scripts/sync_docs_catalog.py`.
- `scripts/sync_docs_catalog.py` — source-to-docs generator for skills, hooks, commands, and platform catalog pages.
- `scripts/ensure_docs_deps.py` — docs dependency bootstrap used by `just docs-check`.
- `package.json` / `package-lock.json` — docs-site Node dependencies and VitePress scripts.
- `index.md` / `en/index.md` — authored bilingual landing pages.
- `skills.md`, `en/skills.md`, `skills/**`, `en/skills/**` — generated skill index and detail pages.
- `hooks.md`, `en/hooks.md`, `commands.md`, `en/commands.md` — generated hook and platform catalog pages.

## Search Anchors
- `GENERATED_DIR`, `CATALOG_MODULE` — generated catalog targets.
- `discover_skills`, `discover_hooks`, `discover_platforms` — source discovery paths in the sync script.
- `GeneratedFile(` — list of files produced by the sync script.
- `npm --prefix docs run build` — VitePress build command wrapped by `just docs-check`.

## Generated and Ignored Notes
- `node_modules/` is dependency output.
- `.vitepress/cache/` and `.vitepress/dist/` are VitePress cache/build output.
- `.vitepress/generated/catalog.mjs` and the generated skill/hook/command pages are produced by `sync_docs_catalog.py`.
