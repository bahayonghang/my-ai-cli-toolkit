# Frontend Development Guidelines

> Repo-side conventions for the VitePress docs site and generated catalog pages.

## Overview

`docs/` is the repository's frontend surface. It is a standalone VitePress site with authored bilingual home pages, generated catalog/index pages, and a small TypeScript config that wires navigation and sidebars from generated data. There is no separate SPA app or component library.

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Where the docs site, generated pages, and build files live | Documented |
| [Component Guidelines](./component-guidelines.md) | Markdown-first docs, when a Vue component is justified | Documented |
| [Hook Guidelines](./hook-guidelines.md) | No docs composable layer today; keep shared logic in scripts/config | Documented |
| [State Management](./state-management.md) | File-backed catalog state, local-only UI state, no global store | Documented |
| [Quality Guidelines](./quality-guidelines.md) | Build checks, generated output rules, bilingual parity | Documented |
| [Type Safety](./type-safety.md) | Typed VitePress config and generated-data shape discipline | Documented |

## How to Keep These Guidelines Current

1. Keep authored pages and generated pages distinct.
2. Update both languages when the site changes.
3. Regenerate catalog output rather than hand-editing generated pages.
4. Keep docs source linked to the real repo layout.

## Examples

- `docs/index.md` and `docs/en/index.md` are authored home pages.
- `docs/.vitepress/config.mts` wires nav and sidebar data.
- `docs/scripts/sync_docs_catalog.py` generates the catalog pages.
- `docs/skills/git-github-collaboration/git-commit.md` is a generated skill detail page.

**Language**: All documentation should be written in English.
