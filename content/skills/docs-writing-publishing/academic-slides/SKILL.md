---
name: academic-slides
description: Generate, revise, compile, or review academic slide decks in Typst Touying or LaTeX Beamer. Use when the user asks to create slides from a topic or paper, edit an existing deck, switch themes, compile to PDF, or review slide quality.
version: 1.2.0
category: docs-writing-publishing
tags: [slides, latex, typst, beamer, touying, academic]
argument-hint: [topic, paper path, or slide file path plus requested action]
allowed-tools: [Read, Write, Edit, Glob, Grep, Bash]
---

# Academic Slides

Generate or update academic slide decks with a predictable workflow and real compilation feedback. Supports **Typst Touying** and **LaTeX Beamer**.

## Task routing

Map the request to exactly one primary workflow first:

| Workflow | Typical triggers | Primary result |
|----------|------------------|----------------|
| `create` | "创建幻灯片", "make slides", topic only | New deck from topic or outline |
| `from-paper` | "论文转幻灯片", "paper to slides" | Talk deck derived from paper structure |
| `edit` | "编辑幻灯片", "添加一页", "改第 3 页" | Targeted page/content changes |
| `theme` | "切换主题", "换字体", "改配色" | Theme/layout update without rewriting content |
| `compile` | "编译", "build PDF" | Verified PDF output |
| `review` | "审查", "review slides" | Quality report with actionable fixes |

If the request mixes multiple actions, finish them in this order: `detect -> edit/create -> compile -> review`.

## Engine and theme heuristics

- If editing an existing file, infer the engine from the extension: `.typ` -> Typst Touying, `.tex` -> LaTeX Beamer.
- If the user explicitly asks for Touying, Typst, Beamer, or LaTeX, obey that request.
- Otherwise default to Typst because it is the faster authoring path in this skill.
- Prefer these known themes before inventing anything custom:
  - Typst: `university`, `metropolis`, `simple`, `dewdrop`, `aqua`
  - LaTeX: `metropolis`, `Madrid`, `Berlin`, `minimalist`
- If the user names an unsupported theme, map it to the closest supported one and say which mapping you used.

## Required inputs

1. If the user gives a file path, use it directly.
2. Otherwise detect a candidate deck with `python $SKILL_DIR/scripts/detect_file.py [--root DIR]`.
3. If nothing is found and the task is not `create` or `from-paper`, report the missing file and ask for a `.typ` or `.tex` path.
4. Default choices unless the user overrides them:
   - engine: `typst`
   - theme: `university`
   - language: `zh`
   - aspect ratio: `16:9`
   - output directory: `output/`

If topic, paper source, or talk duration is underspecified, make the narrowest reasonable assumption, continue, and surface the assumption in the handoff instead of blocking on low-risk ambiguity.

## Minimal reference loading

Read only the references needed for the active workflow:

- `$SKILL_DIR/resources/WORKFLOWS.md` for step details and argument defaults
- `$SKILL_DIR/resources/THEME_REFERENCE.md` before theme changes
- `$SKILL_DIR/resources/TYPST_SYNTAX.md` for Touying/Typst edits
- `$SKILL_DIR/resources/LATEX_SYNTAX.md` for Beamer edits
- `$SKILL_DIR/resources/REVIEW_CRITERIA.md` for review scoring
- `$SKILL_DIR/resources/ERROR_PATTERNS.md` when compilation fails

## Execution flow

### 1. Create or derive the deck

- For topic-based decks, build a talk arc: title -> outline -> background -> 2-3 core sections -> summary -> references/Q&A.
- For paper-based decks, preserve the paper's claims, equations, figures, and limitations; do not invent results that are absent from the source.
- When the user gives a duration, allocate slide count roughly from `$SKILL_DIR/resources/WORKFLOWS.md`; when absent, assume a concise academic talk rather than an exhaustive lecture.
- Keep each slide focused: roughly one idea per slide, no wall-of-text paragraphs, and usually no more than 6 bullets.
- If no local template exists, generate the deck directly using the syntax references instead of assuming a missing scaffold.

### 2. Edit precisely

- Prefer targeted edits over full rewrites.
- Use `python $SKILL_DIR/scripts/analyze_structure.py <file>` before changing an existing deck.
- Keep theme, section rhythm, numbering, and animation conventions consistent with surrounding slides.

### 3. Compile and recover

- Compile with `python $SKILL_DIR/scripts/compile.py <file>`.
- On failure, inspect the error, consult `$SKILL_DIR/resources/ERROR_PATTERNS.md`, fix the source, and retry up to 3 times.
- When placeholders or generated scaffolds are involved, run `python $SKILL_DIR/scripts/validate_template.py <file>` before the final handoff.

### 4. Review quality

- Use `python $SKILL_DIR/scripts/review_metrics.py <file>` for structural signals.
- Review against `$SKILL_DIR/resources/REVIEW_CRITERIA.md`.
- Flag issues in content accuracy, slide density, transition logic, theme consistency, and missing references or figure captions.

## Rules

- Use `$SKILL_DIR` for every skill-relative script or resource path.
- Do not fabricate paper content, citations, equations, experiment outcomes, or figure interpretations.
- Preserve formulas and figure placeholders when the source material is incomplete.
- Prefer incremental fixes to wholesale rewrites when the user already has a deck.
- Return the edited source path, selected engine/theme, compiled PDF path when available, and the remaining blockers or assumptions if compilation still fails.
