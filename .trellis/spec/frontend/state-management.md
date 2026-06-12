# State Management

> How docs-site state is managed in this repository.

## Overview

There is no frontend store in this repo. Docs state is derived from files and generated catalog output. Use static markdown and build-time generation rather than client stores.

## State Categories

- Source state: `skills/`, `platforms/`, `docs/scripts/`, and authored docs pages.
- Generated state: `docs/.vitepress/generated/catalog.mjs`, `docs/skills.md`, `docs/en/skills.md`, `docs/hooks.md`, `docs/en/hooks.md`, `docs/commands.md`, and `docs/en/commands.md`.
- Local UI state: page-only and ephemeral, if a future docs widget needs it.
- URL state: VitePress route paths, including the `/en/` locale prefix.

## When to Use Global State

- Almost never for docs content.
- Only if a future interactive docs widget needs cross-component coordination, and even then keep it feature-local.
- Do not add a global store just to mirror skill or platform metadata.

## Server State

- None.
- The docs site does not fetch skill metadata at runtime; it builds from source files.

## Common Mistakes

- Mirroring generated catalog data into runtime state.
- Adding a global store for navigation or locale data that VitePress already provides.
- Persisting state that should simply be regenerated from repo files.

## Examples

- `docs/.vitepress/config.mts` imports generated sidebar arrays from `docs/.vitepress/generated/catalog.mjs`.
- `docs/index.md` and `docs/en/index.md` are static home pages.
- `docs/skills.md` and `docs/en/skills.md` are generated from source assets.
