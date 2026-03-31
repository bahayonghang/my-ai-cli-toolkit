---
name: touying
description: "Author Typst slide decks with Touying: create slides, apply themes, configure animations, add speaker notes, and manage multi-file layouts. Use when working with .typ presentations, Touying themes, slide decks, or typst presentation animations."
category: document-processing
tags: [typst, touying, slide-deck, animation, theme]
argument-hint: path-to-typ-file
allowed-tools: Read, Write, Glob, Grep
---

# Touying Author

## Quick start

1. Import Touying + theme, apply with `#show: <theme>.with(...)`.
2. Use headings for slides; `#slide` only for custom layout/animation.
3. Centralize config in `globals.typ`, include content from separate files.
4. Compile and verify: `typst compile deck.typ` — fix errors before iterating.

```typst
#import "@preview/touying:0.6.1": *
#import themes.university: *
#show: university-theme.with(config-info(title: [My Talk], author: [Author]))

= Introduction
Content for the first slide.

= Details
- Point one
- Point two
```

## Task routing

| Topic | Docs |
|-------|------|
| Getting started | `docs/start.md` |
| Multi-file layout | `docs/multi-file.md` |
| Slide/headings | `docs/sections.md` |
| Global styles | `docs/global-settings.md` |
| Page/layout | `docs/layout.md` |
| Animations | `docs/dynamic/*.md` |
| Speaker notes | `docs/external/pdfpc.md` |
| Themes | `docs/themes/*.md` |
| Integrations | `docs/integration/*.md` |
| Examples | `references/EXAMPLES.md` |
| Troubleshooting | `references/TROUBLESHOOTING.md` |

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
