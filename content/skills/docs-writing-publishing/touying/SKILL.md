---
name: touying
description: Author, repair, compile, and theme Typst slide decks with Touying. Use when working with `.typ` presentations, Touying themes, animations, multi-file decks, speaker notes, or slide-structure issues.
category: docs-writing-publishing
tags: [typst, touying, slide-deck, animation, theme]
argument-hint: [path-to-typ-file or Touying task]
version: 1.2.0
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# Touying Author

## Preconditions

1. If `$ARGUMENTS` is empty, report: `Error: Provide a valid .typ file path or a Touying slide task.`
2. If a path is provided, verify it exists and ends with `.typ`.
3. If the task is "create a new deck" and no file exists yet, start from `$SKILL_DIR/examples/simple.typ` or `$SKILL_DIR/examples/default.typ`.
4. If the user is asking a Touying usage question rather than asking you to edit a file, answer from the docs instead of forcing a file-path workflow.

## Quick start

1. Import Touying + theme, apply with `#show: <theme>.with(...)`.
2. Use headings for slides; `#slide` only for custom layout/animation.
3. Centralize config in `globals.typ`, include content from separate files.

## Task routing

| Topic | Docs |
|-------|------|
| Getting started | `$SKILL_DIR/docs/start.md` |
| Multi-file layout | `$SKILL_DIR/docs/multi-file.md` |
| Slide/headings | `$SKILL_DIR/docs/sections.md` |
| Global styles | `$SKILL_DIR/docs/global-settings.md` |
| Page/layout | `$SKILL_DIR/docs/layout.md` |
| Animations | `$SKILL_DIR/docs/dynamic/*.md` |
| Speaker notes | `$SKILL_DIR/docs/external/pdfpc.md` |
| Themes | `$SKILL_DIR/docs/themes/*.md` |
| Integrations | `$SKILL_DIR/docs/integration/*.md` |
| Examples | `$SKILL_DIR/references/EXAMPLES.md` |
| Troubleshooting | `$SKILL_DIR/references/TROUBLESHOOTING.md` |

Choose the smallest relevant doc set instead of loading everything.

Known built-in theme docs in this skill tree: `aqua`, `dewdrop`, `metropolis`, `simple`, `stargazer`, `university`.

## Workflow

1. Classify the task: create, edit, restructure, theme, animate, compile, or troubleshoot.
2. Read only the docs needed for that task.
3. Prefer targeted edits to the existing deck instead of rewriting the whole file.
4. When troubleshooting, reproduce the issue from the actual source and consult `$SKILL_DIR/references/TROUBLESHOOTING.md` before changing syntax.
5. When switching themes, update the import, `#show` rule, font assumptions, and any appendix/wrapper helpers together rather than piecemeal.
6. If compilation is requested or needed for verification, run `typst compile <file>.typ`.
7. If compilation fails, fix one concrete problem at a time and retry up to 3 times.

## Key rules

- Use `config-page`/`config-common`, not `set page`.
- Set `slide-level` via `config-common(slide-level: n)`.
- Avoid `#pause` inside `context` blocks.
- Wrap custom slides with `touying-slide-wrapper`.
- Place `#show: appendix` after main deck.
- Keep theme configuration centralized instead of duplicating it per slide.
- Preserve valid Touying syntax even when the user describes desired visuals in vague prose.
- For multi-file decks, keep global config in one shared file and avoid scattering theme state across content slides.

## Templates

Use `$SKILL_DIR/examples/simple.typ` (minimal) or `$SKILL_DIR/examples/default.typ` (full).

## Handoff

Return the updated `.typ` path, the selected theme or structural approach, compile status, and any remaining Touying-specific blocker.

## Errors

- `Error: Provide a valid .typ file path.` — when the request is empty and not a create-new-deck task
- `Error: File not found.` — when the path does not exist
- `Error: Not a .typ file.` — when the extension is wrong
