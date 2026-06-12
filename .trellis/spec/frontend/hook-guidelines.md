# Hook Guidelines

> How reusable docs-site behavior is handled in this repository.

## Overview

This repo does not use a frontend hook or composable layer today. The only `hooks/` directory in the repository belongs to `platforms/claude/hooks/` runtime hooks, not UI hooks. For the docs site, keep shared behavior in `docs/scripts/` or `docs/.vitepress/config.mts`.

## Custom Hook Patterns

- Prefer no hook at all when Markdown or generated catalog pages can solve the problem.
- If a docs widget needs repeated behavior, keep the composable page-local and name it after its purpose, not after generic state.
- Do not create a repo-wide docs hook layer.

## Data Fetching

- There is no runtime data fetching in the docs site.
- Catalog content is generated from repository files at build time.
- Do not add client-side fetching for skill or platform metadata.

## Naming Conventions

- If a composable is ever added, name it `useX` and colocate it with the docs feature that needs it.
- Keep helper functions named for the task they perform, not as generic hooks when they are just build-time utilities.

## Common Mistakes

- Treating `platforms/claude/hooks/` as if it were a frontend hook layer.
- Moving catalog-generation logic into page-local pseudo-hooks.
- Adding composables for state that should remain in Markdown or generated pages.

## Examples

- `docs/.vitepress/config.mts` contains the shared navigation and sidebar wiring.
- `docs/scripts/sync_docs_catalog.py` contains the reusable generation logic.
- `docs/index.md` and `docs/en/index.md` need no custom hook at all.
