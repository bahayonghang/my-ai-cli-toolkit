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

- **Quick Tier** (targeted 1–5 slide edit, bug fix, config tweak, `--warnings promote` fix, or migration check):
  1. Read the target `.typ` file (and `globals.typ` if present) plus the matching reference below.
  2. Apply the minimal, scoped change adhering to Hard `0.8.0` Rules.
  3. Run `python scripts/touying_check.py audit <target> --strict-warnings` and `python scripts/touying_check.py compile <main.typ>` (or `typst compile --warnings promote` when supported) and inspect rendered pages if layout changed.
- **Full Tier** (brand-new deck, multi-file refactor, custom theme, or multi-mode `presentation` / `handout` / `article` deck):
  1. Clarify audience, aspect ratio (`16-9` / `16-10` / `4-3`), language/fonts, and required export modes.
  2. **Open the closest tier before authoring**: inspect [Graded Examples Index](examples/README.md) (`01-minimal` through `06-bundle-pdfpc`) and start from the closest verified `0.8.0` pattern.
  3. For custom or high-craft themes, propose up to **3 restrained visual direction prototypes** (palette, typography scale, header/footer density) and confirm one before building out all slides.
  4. Structure multi-file decks cleanly (`globals.typ` + `main.typ` + `sections/*.typ`), then verify with `touying_check.py audit --strict-warnings` and `compile` across every target mode (with `--warnings promote` / strict warning promotion) and visually inspect rendered slide pages.

## 4. Task Routing & Graded Examples

Load only the reference or graded example tier needed for the current subtask (open the closest tier in [Graded Examples Index](examples/README.md) before authoring):

| Task | Resource |
| --- | --- |
| Core configs (`config-page`, `config-common`, `config-info`, `config-colors`, `config-methods`, `config-store`, `touying-get-config`), multi-file layout, headings/labels, overflow controls | [Core 0.8.0 Contract](references/core-0.8.md) |
| Upgrading `0.6.x` / `0.7.x` decks, themes, bibliographies, covers, or speaker notes to `0.8.0` | [Migration Guide (to 0.8.0)](references/migration-0.8.md) |
| Compiler errors, `--warnings promote` failures, overflow/mark panics, input validation, `touying_check.py` rules & exit codes | [Troubleshooting](references/troubleshooting.md) |
| Graded `0.8.0` templates (`01-minimal` .. `06-bundle-pdfpc`) — open closest tier first | [Graded Examples Index](examples/README.md) |

Deterministic CLI checks (stdlib Python, cross-platform):
```bash
python scripts/touying_check.py doctor --json
python scripts/touying_check.py audit <path-or-dir> --strict-warnings --json
python scripts/touying_check.py compile <main.typ> [--modes presentation,handout,article] [--bundle] --json
```

## 5. Hard 0.8.0 Rules

- **Version & compiler baseline**: default to `#import "@preview/touying:0.8.0": *` and target Typst `0.15.0+`.
- **Page & slide config**: configure pages via `config-page(...)` and `config-common(...)`, never raw `#set page(...)`. Set heading split depth via `config-common(slide-level: n)`.
- **Mark boundaries (`context` & `measure`)**: never place `#pause`, `#meanwhile`, `#only`, or `#uncover` inside `context` blocks or measured containers. Inside theme callbacks, use `utils.methods(self)` (with explicit `repeat:`) or wrap helper components with `touying-fn-wrapper-raw` (avoid baking positional body into `.with(...)`).
- **Slide customization & wrapping**: pass per-slide rules via `#slide(setting: body => ...)` or `config-common(subslide-preamble: ...)` rather than wrapping `body` manually in `slide-fn` or misusing deferred `touying-set-config`. Wrap custom slide functions with `touying-slide-wrapper`.
- **Covers (deprecated replacement)**: use `utils.alpha-changing-cover` (preserves hues) or `utils.color-changing-cover` (faster compile) instead of deprecated `utils.semi-transparent-cover`.
- **Math animations (deprecated replacement)**: write native Typst math animations (`$ frac(a #pause + b, c) $`, `$ mat(a, #pause b; c, d) $`) directly instead of deprecated `touying-equation`.
- **Footnote bibliography**: enable via boolean `config-common(show-bibliography-as-footnote: true)` and emit a real `#bibliography("ref.bib")` (use `only("h", bibliography(...))` on multi-subslide slides, or `hide(...)` to suppress the list) instead of removed `magic.bibliography()`.
- **Speaker-note panel & modes**: customize presenter panels via `config-common(notes-fn: ...)` built on `touying-notes` instead of removed `config-methods(show-only-notes: ...)`. Use top-level `#handout-only[..]`, `#presentation-only[..]`, `#slides-only[..]`, `#article-only[..]`, `#article-text[..]`, or `config-common(export-mode: ...)`.
- **Recall & subslide flow**: use plural `touying-recall(<lbl>, subslides: ...)` (`auto` = all subslides of a slide or final state of a labelled element; `none` = last subslide only). Remember `#pause` after `#uncover`/`#only`/`#alternatives` no longer snaps past their reserved subslides, and negative ints on `#only`/`#uncover`/`#animate` panic (use `#waypoint(<end>)` + `get-last(<end>)`).
- **Appendix**: place `#show: appendix` after the main deck (freezes `utils.last-slide-number`; pair with `config-common(freeze-slide-counter: true)` if numerator should also freeze).

## 6. Closing Gate

- Run `python scripts/touying_check.py audit <target> --strict-warnings` and `python scripts/touying_check.py compile <main.typ>` before declaring success.
- Never report a deck as compiling cleanly or visually verified unless you actually ran `touying_check.py compile` / `typst compile --warnings promote` (for every active `export-mode` or `--bundle` if applicable) and inspected rendered output pages when layout changed.
- If `typst` CLI is missing (`status: "skipped"`, `missing_evidence: true`) or rendering/visual inspection could not run, state the exact check that was skipped as `missing evidence` rather than guessing pass status.
