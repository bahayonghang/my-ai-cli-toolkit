# Implementation notes — VitePress docs catalog

Spec: User-provided "Docs 信息架构与 Skill 详情页优化计划" in the current Codex task
Started: 2026-05-20

## Decisions

- Used `docs/.vitepress/config.mts` with VitePress locales `root` and `en` so Chinese can stay at `/` while English lives under `/en/`, matching the approved bilingual routing without adding custom router logic.
- Added `docs/scripts/sync_docs_catalog.py` as the single read-only content scanner/generator for skill pages, sidebars, hook summaries, and platform catalogs so docs drift can be checked by `just docs-check`.
- Kept the generated catalog source as committed Markdown + `docs/.vitepress/generated/catalog.mjs` rather than runtime-only VitePress data. This keeps GitHub Pages/static builds deterministic and makes docs drift visible in review.
- Used root `docs/skills/<category>/<skill>.md` for Chinese routes and `docs/en/skills/<category>/<skill>.md` for English routes, matching the current site convention from the approved plan.
- `docs-check` installs docs dependencies only if the local VitePress binary is absent. This avoids repeatedly deleting `docs/node_modules` on Windows, where locked `esbuild.exe` files can make `npm ci` fail with EPERM.

## Deviations

- Spec requested installing/locking VitePress dependencies without naming a version. Implemented with `vitepress@^2.0.0-alpha.17` instead of the latest stable `1.6.4` after audit evidence showed the stable line currently leaves unresolved moderate dev-server advisories; this remains confined to the docs-only package.
- The earlier docs-site note said the first release would stay hand-authored. The current approved IA plan supersedes that: skill overview/detail pages and scoped sidebar catalog data are now generated from `skills/` and `platforms/`.

## Tradeoffs

- Considered staying on VitePress 1.6.4 because it is the latest stable tag, but `npm audit` reports unresolved moderate advisories through Vite/esbuild with no fix available there. Upgraded the docs-only package to VitePress 2 alpha because this local docs site is isolated under `docs/` and the build verifies on Node 25.
- Chose a local `docs/package.json` and lockfile over root-level frontend tooling because the plan requires docs dependency management to remain isolated under `docs/`; this preserves the repository root as a content-only workspace.
- Considered making `docs-check` always run `npm ci`, but local verification hit Windows EPERM while unlinking locked native binaries. A conditional dependency installer preserves clean CI behavior while keeping local repeated checks stable.

## Open questions

- (none yet)
