# academic-slides

Academic slide generation with dual engines. Supports **Typst Touying** and **LaTeX Beamer**.

## Overview

Academic Slides helps you generate, edit, compile, and review academic presentation slides. It provides a complete workflow from topic/outline to polished PDF output, with support for both Typst and LaTeX ecosystems.

## Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| create | "create slides" | Generate from topic/outline |
| from-paper | "paper to slides" | Extract from paper |
| edit | "edit slides" | Modify pages |
| theme | "switch theme" | Switch theme/font |
| compile | "compile" | Build PDF |
| review | "review" | Quality check |

## Scripts

Run `python scripts/<name>.py`:

- `detect_file.py` — Find .typ/.tex files
- `compile.py <file>` — Compile to PDF
- `validate_template.py <file>` — Check placeholders
- `analyze_structure.py <file>` — Parse structure
- `review_metrics.py <file>` — Quality scores

## Resources

- `WORKFLOWS.md` — Workflow steps
- `THEME_REFERENCE.md` — Theme configuration
- `REVIEW_CRITERIA.md` — Review standards
- `TYPST_SYNTAX.md` — Typst syntax reference
- `LATEX_SYNTAX.md` — LaTeX syntax reference
- `ERROR_PATTERNS.md` — Common error fixes

## Defaults

| Setting | Default |
|---------|---------|
| Engine | Typst |
| Theme | university |
| Language | zh |
| Aspect Ratio | 16:9 |
| Output | `output/` |
