# Type Safety

> Type safety patterns in the docs-site frontend.

## Overview

Type safety matters mainly in `docs/.vitepress/config.mts` and any future Vue/TypeScript helpers. The rest of the docs site is markdown-driven. Prefer narrow, explicit object shapes and avoid `any`.

## Type Organization

- Keep site config types next to `docs/.vitepress/config.mts`.
- Do not duplicate catalog shapes in page files.
- Keep content shape knowledge in `docs/scripts/sync_docs_catalog.py`, which produces the generated catalog module.
- If you add a TypeScript helper, colocate it with the docs feature that uses it and export the minimum shape needed.

## Validation

- There is no runtime validator for docs page content.
- The build and generator are the validation boundary.
- Use the Python generator and VitePress build to catch mismatches between source content and generated pages.

## Common Patterns

- Explicit nav and sidebar arrays in `docs/.vitepress/config.mts`.
- Generated catalog imports rather than hard-coded repeated data.
- Bilingual page pairs that share structure but not copy-pasted config objects.

## Forbidden Patterns

- `any` for catalog or site config data.
- Broad casts that hide a mismatch between the generator and the docs config.
- Duplicating generated catalog shapes in multiple files.
- Hard-coding generated page data in both the source file and a local runtime copy.

## Examples

- `docs/.vitepress/config.mts`
- `docs/.vitepress/generated/catalog.mjs`
- `docs/scripts/sync_docs_catalog.py`
