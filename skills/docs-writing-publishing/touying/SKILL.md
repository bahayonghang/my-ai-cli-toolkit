---
name: touying
description: |
  Author, refactor, migrate, or troubleshoot Typst slide decks using @preview/touying:0.8.0 (Typst 0.15.0+). Use when creating or editing .typ presentations, multi-file globals.typ decks, built-in or custom themes, slide headings or #slide, incremental animations (#pause, #uncover, #only, #animate), speaker notes (#speaker-note, .pdfpc), or multi-mode export (presentation, handout, article), including Chinese and English requests (制作/创建/重构/排查/迁移 Typst Touying 幻灯片、演示文稿与讲义). Excludes non-Typst web or office slides (HTML, reveal.js, PPT, Marp), ordinary non-slide Typst papers or reports, and XeLaTeX thesis defense decks (academic-defense-beamer).
category: docs-writing-publishing
tags:
  - typst
  - touying
  - slide-deck
  - animation
  - theme
  - presentation
version: 2.0.0
argument-hint: "[path-to-typ-file-or-project]"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Touying (`@preview/touying:0.8.0` / Typst `0.15.0+`)

Author, refactor, migrate, and verify Typst presentations with Touying `0.8.0`.

## 1. Trigger & Exclusions

Use this skill ONLY for Typst-based presentations built with Touying. Immediately decline and route elsewhere when the request asks for:
- **Web or office slide tools**: `HTML`, `reveal.js`, `PPT` / `.pptx`, Google Slides, Keynote, or `Marp`.
- **Ordinary non-slide Typst documents**: papers, CVs, essays, or multi-page prose reports without slide structure (unless explicitly dual-targeting Touying `export-mode: "article"`).
- **XeLaTeX thesis defense decks**: Chinese or academic LaTeX Beamer defense templates (route to `academic-defense-beamer`).

## 2. Workspace Intent Gate

Before creating files or scaffolding a new project, inspect the working directory:
1. If `$ARGUMENTS` is provided, verify it exists and ends with `.typ`. On invalid input, report:
   - `"Error: Provide a valid .typ file path."` (empty or missing target when required)
   - `"Error: File not found."` (path does not exist)
   - `"Error: Not a .typ file."` (wrong extension)
2. Search for `typst.toml`, canonical deck entrypoints (`main.typ`, `slides.typ`, `presentation.typ`), and shared `globals.typ`.
3. **Reuse existing structure**: preserve the project's existing entrypoint, theme selection, custom utilities, and `globals.typ` split. Never blindly overwrite or re-initialize an existing presentation repository.

## 3. Complexity Tiers (Quick vs Full)

- **Quick Tier** (1–5 slide edit, bug fix, config tweak, warning fix, or migration):
  1. Read target `.typ` (`globals.typ` if present) and the matching reference below.
  2. Apply the minimal change following Hard `0.8.0` Rules.
  3. Run `python scripts/touying_check.py audit <target> --strict-warnings` and `compile <main.typ>` (with `--warnings promote` / strict warning promotion); inspect rendered pages on layout edits.
- **Full Tier** (new deck, multi-file refactor, custom theme, or multi-mode export):
  1. Clarify audience, aspect ratio, fonts, and required export modes (`presentation`, `handout`, `article`).
  2. **Open the closest tier first**: inspect [Graded Examples Index](examples/README.md) (`01-minimal`..`06-bundle-pdfpc`) and outline sections, `slide-level`, and visual metaphors.
  3. For custom/high-craft themes, follow [Visual Craft & Layout Diversity](references/visual-craft.md): define per-slide visual metaphors, cap bullet-only slides, and compare **3 restrained direction prototypes** with parameterized palettes on real content before building out.
  4. Structure multi-file decks (`globals.typ` + `main.typ` + `sections/*.typ`), then run `touying_check.py audit --strict-warnings`, `compile` for every target mode, and inspect rendered slides.

## 4. Task Routing & Graded Examples

Load only the reference or example tier needed (open the closest tier in [Graded Examples Index](examples/README.md) before authoring):

| Task | Resource |
| --- | --- |
| Core configs (`config-page`/`common`/`info`/`colors`/`methods`/`store`), multi-file layout, headings, overflow | [Core 0.8.0 Contract](references/core-0.8.md) |
| Animations (`#pause`, `#jump`, `#item-by-item`, `#touying-raw`), Waypoints, `#animate`/`swap`, `#touying-render`, `#touying-recall`, native math, `#measure`, covers | [Animations & Waypoints](references/animations-waypoints.md) |
| Output modes (`slides`/`presentation`/`handout`/`article`), `--input export-mode=`, mode markers/labels, `handout-subslides`, `config-article`, `themes.article` | [Output Modes & Article Mode](references/output-modes-article.md) |
| Upgrading `0.6.x`/`0.7.x` decks, themes, bibliographies, covers, or notes to `0.8.0` | [Migration Guide (to 0.8.0)](references/migration-0.8.md) |
| Built-in 8 themes (`default`, `simple`, `metropolis`, `dewdrop`, `university`, `aqua`, `stargazer`, `themes.article`), layout helpers, custom themes, `notes-fn`, `.pdfpc`/bundle, bib footnotes | [Themes, Notes & Export](references/themes-notes-export.md) |
| Lambda `touying-reduce` / `touying-reducer-bindings` (CeTZ/Fletcher/Lilaq/Alchemist), Codly, Theorion, Pinit, MiTeX, `touying-exporter`, Tylina, `gistd` | [Integrations & Ecosystem](references/integrations.md) |
| Per-slide visual metaphors, layout topology caps, parameterized palettes, 3-direction prototyping, anti-slop Do Not rules | [Visual Craft & Layout Diversity](references/visual-craft.md) |
| Compiler errors, warning failures, overflow/mark panics, input validation, `touying_check.py` exit codes & rules | [Troubleshooting](references/troubleshooting.md) |
| Graded `0.8.0` templates (`01-minimal`..`06-bundle-pdfpc`) — open closest tier first | [Graded Examples Index](examples/README.md) |

```bash
# Run from the touying skill directory or prefix <skill-dir>/
python scripts/touying_check.py doctor --json
python scripts/touying_check.py audit <path-or-dir> --strict-warnings --json
python scripts/touying_check.py compile <main.typ> [--modes presentation,handout,article] [--bundle] --json
```

## 5. Hard 0.8.0 Rules

- **Version & baseline**: default to `#import "@preview/touying:0.8.0": *` on Typst `0.15.0+`.
- **Page & slide config**: use `config-page(...)` and `config-common(...)`, never raw `#set page(...)`; set split depth via `config-common(slide-level: n)`.
- **Mark boundaries**: never place `#pause`, `#meanwhile`, `#only`, or `#uncover` inside `context` or measured blocks. In theme callbacks use `utils.methods(self)` (with explicit `repeat:`) or `touying-fn-wrapper-raw` with positional `body` (avoid `.with(...)`).
- **Slide wrapping**: apply per-slide rules via `#slide(setting: body => ...)` or `subslide-preamble`, not manual `body` wrapping in `slide-fn`; wrap custom slide functions with `touying-slide-wrapper`.
- **Deprecated replacements**: use `utils.alpha-changing-cover` / `utils.color-changing-cover` instead of deprecated `utils.semi-transparent-cover`; use native math (`$ frac(a #pause + b, c) $`) instead of deprecated `touying-equation`.
- **Footnote bibliography**: set boolean `config-common(show-bibliography-as-footnote: true)` with a real `#bibliography("ref.bib")` (`only("h", bibliography(...))` on multi-subslide slides, or `hide(...)`), never removed `magic.bibliography()`.
- **Speaker notes & modes**: use `config-common(notes-fn: ...)` on `touying-notes` instead of removed `config-methods(show-only-notes: ...)`. Use `#handout-only`, `#presentation-only`, `#slides-only`, `#article-only`, `#article-text`, or `export-mode`.
- **Recall, flow & render**: use plural `touying-recall(<lbl>, subslides: ...)` (`auto` = all/final; `none` = last). `#pause` after `#uncover`/`#only`/`#alternatives` no longer snaps past reserved subslides, and negative ints on flow primitives panic (use `#waypoint` + `get-last`). Use `#animate` / `swap(stretch: true)`, `#touying-render`, `#measure`, and `config-article(wrap:, linearize:, available-fields:, title-block-fn:)`.
- **Appendix**: place `#show: appendix` after main deck (freezes `utils.last-slide-number`; pair with `freeze-slide-counter: true` if needed).

## 6. Closing Gate

- Run `python scripts/touying_check.py audit <target> --strict-warnings` and `compile <main.typ>` before reporting success.
- Never claim clean compile or visual readiness without real `touying_check.py compile` (every active `export-mode` / `--bundle`) and page inspection; report unexecuted checks or missing `typst` (`status: "skipped"`) as `missing evidence`.
