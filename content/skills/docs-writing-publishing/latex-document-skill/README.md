# LaTeX Document Skill

Human maintainer guide for `latex-document-skill`. For agent execution rules, see `SKILL.md`.

## Overview

This skill covers four areas:

- Author LaTeX documents from templates or scratch.
- Compile `.tex` sources into PDFs and previews.
- Convert between document formats, including PDF-to-LaTeX workflows.
- Run PDF utilities such as form filling, merge, split, optimize, extraction, and validation.

The repository currently contains:

| Area | Count | Notes |
|---|---:|---|
| Templates | 27 `.tex` + 1 `.bib` | Stored in `assets/templates/` |
| Scripts | 27 | Stored in `scripts/` |
| Reference guides | 26 | Stored in `references/` |
| PDF conversion profiles | 4 | Stored in `references/profiles/` |
| Example renders | many | Stored in `examples/` |

## Directory Layout

| Path | Purpose |
|---|---|
| `SKILL.md` | Minimal agent contract and routing logic |
| `README.md` | Human-facing maintenance guide |
| `assets/templates/` | Reusable LaTeX templates and sample bibliography |
| `scripts/` | Deterministic helpers for compile, convert, diff, charts, and PDF work |
| `references/` | Context documents loaded on demand by workflow |
| `references/profiles/` | PDF-to-LaTeX conversion profiles |
| `examples/` | Rendered output previews |
| `tests/` | Script validation and fixture coverage |

## Supported Workflows

| Workflow | Main assets |
|---|---|
| Resume, report, letter, paper, thesis, poster, presentation, exam, cheat sheet | `assets/templates/*.tex` |
| Compile and preview LaTeX | `scripts/compile_latex.sh` |
| Markdown, DOCX, HTML, and LaTeX conversion | `scripts/convert_document.sh`, `references/format-conversion.md` |
| PDF-to-LaTeX | `scripts/pdf_to_images.sh`, `scripts/validate_latex.py`, `references/pdf-conversion.md`, `references/profiles/*.md` |
| PDF forms and annotation fill | `scripts/pdf_check_form.py`, `scripts/pdf_extract_fields.py`, `scripts/pdf_fill_form.py`, `scripts/pdf_fill_annotations.py` |
| PDF merge, extract, optimize, encrypt | `scripts/pdf_merge.sh`, `scripts/pdf_extract_pages.sh`, `scripts/pdf_optimize.sh`, `scripts/pdf_encrypt.sh` |
| Citation, lint, package, and document analysis | `scripts/fetch_bibtex.sh`, `scripts/latex_citation_extract.sh`, `scripts/latex_lint.sh`, `scripts/latex_package_check.sh`, `scripts/latex_analyze.sh`, `scripts/latex_wordcount.sh` |
| Charts and diagrams | `scripts/generate_chart.py`, `scripts/mermaid_to_image.sh`, `scripts/graphviz_to_pdf.sh`, `scripts/plantuml_to_pdf.sh` |
| Mail merge and latexdiff | `scripts/mail_merge.py`, `scripts/latex_diff.sh` |

## Template Inventory

### Career

- `resume-classic-ats.tex`
- `resume-modern-professional.tex`
- `resume-executive.tex`
- `resume-technical.tex`
- `resume-entry-level.tex`
- `resume.tex`
- `cover-letter.tex`
- `academic-cv.tex`

### Academic and Long-Form

- `academic-paper.tex`
- `thesis.tex`
- `book.tex`
- `lecture-notes.tex`
- `lab-report.tex`
- `homework.tex`

### Presentation and Poster

- `presentation.tex`
- `poster.tex`
- `poster-landscape.tex`

### Business and General

- `report.tex`
- `letter.tex`
- `invoice.tex`
- `exam.tex`

### Interactive and Batch

- `fillable-form.tex`
- `conditional-document.tex`
- `mail-merge-letter.tex`

### Cheat Sheets

- `cheatsheet.tex`
- `cheatsheet-exam.tex`
- `cheatsheet-code.tex`

### Supporting Asset

- `references.bib`

## Reference Map

| Need | Read |
|---|---|
| Poster layout and conference sizing | `references/poster-design-guide.md` |
| Cheat sheet density and layout | `references/cheatsheet-guide.md` |
| Beamer usage | `references/beamer-guide.md` |
| Citations and bibliography | `references/bibliography-guide.md` |
| Tables and images | `references/tables-and-images.md` |
| Charts | `references/charts-and-graphs.md`, `references/python-charts.md` |
| Mermaid, Graphviz, PlantUML | `references/mermaid-diagrams.md`, `references/graphviz-plantuml.md` |
| PDF operations | `references/pdf-operations.md` |
| PDF-to-LaTeX | `references/pdf-conversion.md`, `references/pdf-extraction-prompts.md`, `references/profiles/*.md` |
| Long-form writing quality | `references/long-form-best-practices.md` |
| Visual and font packages | `references/visual-packages.md`, `references/font-guide.md`, `references/packages.md` |
| Collaboration and QA | `references/collaboration-guide.md`, `references/debugging-guide.md`, `references/qa-test-report.md` |
| Script entry points | `references/script-tools.md` |

## Maintenance Rules

- Keep `SKILL.md` as a routing file. Do not move tutorial content or large examples back into it.
- Put workflow detail in `references/` and reusable files in `assets/`.
- Use `$SKILL_DIR` for every skill-relative path in `SKILL.md`.
- When adding a deterministic operation, prefer a script in `scripts/` over prose instructions.
- When adding a new template or script, update this README and the most relevant reference guide.
- Keep folder name and `SKILL.md` `name` field aligned.
- Preserve portability: no machine-specific paths in templates, scripts, or instructions.

## Validation

Run the test suite from the skill root:

```bash
bash tests/run_all_tests.sh
```

Run focused checks when changing a specific area:

```bash
bash tests/test_compile_latex.sh
bash tests/test_analysis_tools.sh
python tests/test_pdf_forms.py
python tests/test_python_scripts.py
```

## Notes

- This README is for human maintainers. Agent-facing behavior belongs in `SKILL.md` and `references/`.
- If future audits require a zero-warning result, the remaining simplification step is to relocate this file outside the skill root or replace it with a narrower maintainer note.
