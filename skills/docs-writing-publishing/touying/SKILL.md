---
name: touying
description: "Author Typst slide decks with the Touying package. Use when creating or editing .typ presentations: applying or building Touying themes (metropolis, dewdrop, aqua, stargazer, university, simple), turning headings or #slide into slides, incremental reveals and animations (#pause, dynamic content), speaker notes via pdfpc, and config-common/config-page layout. Do not use for non-Typst decks such as HTML, PPT/PowerPoint, reveal.js, or Marp, for ordinary non-presentation Typst documents, or for plain Markdown or prose slides."
category: docs-writing-publishing
tags: [typst, touying, slide-deck, animation, theme]
version: 1.0.0
argument-hint: path-to-typ-file
allowed-tools: Read, Write, Glob, Grep
---

# Touying Author

## Quick start

1. Import Touying + theme, apply with `#show: <theme>.with(...)`.
2. Use headings for slides; `#slide` only for custom layout/animation.
3. Centralize config in `globals.typ`, include content from separate files.

## Task routing

| Topic             | Docs                            |
| ----------------- | ------------------------------- |
| Getting started   | `docs/start.md`                 |
| Multi-file layout | `docs/multi-file.md`            |
| Slide/headings    | `docs/sections.md`              |
| Global styles     | `docs/global-settings.md`       |
| Page/layout       | `docs/layout.md`                |
| Animations        | `docs/dynamic/*.md`             |
| Speaker notes     | `docs/external/pdfpc.md`        |
| Themes            | `docs/themes/*.md`              |
| Integrations      | `docs/integration/*.md`         |
| Examples          | `references/EXAMPLES.md`        |
| Troubleshooting   | `references/TROUBLESHOOTING.md` |

## Key rules

- Use `config-page`/`config-common`, not `set page`.
- Set `slide-level` via `config-common(slide-level: n)`.
- Avoid `#pause` inside `context` blocks.
- Wrap custom slides with `touying-slide-wrapper`.
- Place `#show: appendix` after main deck.

## Templates

Use `examples/simple.typ` (minimal) or `examples/default.typ` (full).

## Errors

If `$ARGUMENTS` empty or no `.typ` file: "Error: Provide a valid .typ file path."
