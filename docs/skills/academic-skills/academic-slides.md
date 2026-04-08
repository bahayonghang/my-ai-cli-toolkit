# Academic Slides

Generate, edit, compile, and review academic slide decks with a single workflow surface. The skill supports both **Typst Touying** and **LaTeX Beamer**, so it works for fast iteration as well as more traditional conference-slide pipelines.

## Workflows

| Workflow | Trigger | Action |
|----------|---------|--------|
| create | "创建幻灯片" | Generate from topic/outline |
| from-paper | "论文转幻灯片" | Extract from paper |
| edit | "编辑幻灯片" | Modify pages |
| theme | "切换主题" | Switch theme/font |
| compile | "编译" | Build PDF |
| review | "审查" | Quality check |

## Scripts (Layer 0)

Run `python scripts/<name>.py`:

- `detect_file.py` — Find .typ/.tex files
- `compile.py <file>` — Compile to PDF
- `validate_template.py <file>` — Check placeholders
- `analyze_structure.py <file>` — Parse structure
- `review_metrics.py <file>` — Quality scores

## Resources (Layer 2)

Load via `Read resources/<name>.md`:

- `WORKFLOWS.md` — Workflow steps
- `THEME_REFERENCE.md` — Theme config
- `REVIEW_CRITERIA.md` — Review standards
- `TYPST_SYNTAX.md` — Typst syntax
- `LATEX_SYNTAX.md` — LaTeX syntax
- `ERROR_PATTERNS.md` — Error fixes

## Defaults

Engine: Typst | Theme: university | Lang: zh | Aspect: 16:9 | Output: `output/`
