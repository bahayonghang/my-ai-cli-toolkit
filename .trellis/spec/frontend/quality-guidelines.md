# Quality Guidelines

> Code quality standards for the docs-site frontend.

## Overview

Quality means the docs site stays bilingual, generated output stays generated, and the build still passes. Keep the docs source aligned with the real repository layout and the generated pages synchronized with their source assets.

## Forbidden Patterns

- Hand-editing files produced by `docs/scripts/sync_docs_catalog.py`.
- Updating only one language when the content is meant to exist in both Chinese and English.
- Introducing a component, hook, or store layer just to hide simple docs markup.
- Leaving stale links or mismatched page titles after a nav/sidebar change.

## Required Patterns

- Run `just docs-sync` after changing skill, platform, or hook source content.
- Run `just docs-check` after changes that affect generated pages, config, or navigation.
- Use `git diff --check` for markdown and config edits.
- Run `just ci` when the change touches docs generation or repo-wide source shape.
- Keep navigation and sidebar config in `docs/.vitepress/config.mts`.

## Testing Requirements

- `just docs-check` is the primary docs-site verification command.
- `just docs-sync` refreshes generated output before checking it in.
- `git diff --check` should be clean for authored markdown and generated docs.

## Code Review Checklist

- Are the Chinese and English pages aligned?
- Were generated files updated through the generator rather than by hand?
- Do nav and sidebar entries still point to the correct pages?
- Are headings, links, and page titles still semantic and readable?

## Examples

- `docs/index.md` and `docs/en/index.md` are authored landing pages.
- `docs/skills.md` / `docs/en/skills.md` and `docs/hooks.md` / `docs/en/hooks.md` are generated index pages.
- `docs/scripts/sync_docs_catalog.py` owns generated content.
