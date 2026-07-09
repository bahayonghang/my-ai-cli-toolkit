---
name: academic-figure
description: >
  Create, revise, or review publication-ready academic paper figures that meet
  journal submission specs — IEEE, Elsevier, and Nature, with Springer and
  chinese-thesis as extended presets — using matplotlib (with seaborn) or plotly.
  For industrytslib projects it automatically drives that library's built-in
  visualization system (create_plotter plus a journal style). Use when the user
  asks for 论文配图、学术图表、期刊图、投稿图、科研绘图、出图、IEEE 图、中文学位论文配图,
  or for a "publication-ready figure", "journal figure", "IEEE/Elsevier/Nature
  style plot", or "submission-grade figure". Do NOT use to reproduce a specific
  paper's figure or mimic one paper's visual style — route that to paper-plot.
  Also out of scope: dashboards and BI walls, AI image generation or graphical
  abstracts, R/ggplot2 plotting, and Illustrator/Figma post-processing.
category: academic-research-tools
tags:
  [
    academic-figures,
    matplotlib,
    seaborn,
    plotly,
    ieee,
    elsevier,
    nature,
    publication,
  ]
version: 0.1.0
---

# Academic Figure

Route a "make me a journal-compliant figure" request across two axes — **journal
style** (ieee / elsevier / nature, plus springer / chinese-thesis) and
**library** (matplotlib(+seaborn) / plotly) — then either drive an industrytslib
project's built-in visualization system or generate a standalone spec-compliant
figure. Argue the figure first; write code last.

> `<skill-dir>` below is this skill's directory — substitute the absolute path
> announced when the skill loads. On Windows, prefix Python runs with
> `PYTHONUTF8=1`.

## Routing protocol

Work the six steps in order.

1. **Figure contract.** Read `references/figure-contract.md` and lock the claim
   before plotting: core conclusion (one sentence) → evidence chain / panel
   mapping → prototype class (quantitative grid / schematic-led / image+quant /
   asymmetric) → journal export contract.
2. **Journal-style axis.** Resolve in priority order: explicit request >
   submission context (target journal) > saved preference
   (`python <skill-dir>/scripts/academic_figure_pref.py get journal_style`) >
   ask once ("Target journal style? ieee / elsevier / nature, or springer /
   chinese-thesis"). After the user answers, persist it with the matching `set`.
3. **Library axis.** Resolve: explicit request > project context (libraries
   already imported; an industrytslib project uses its matplotlib/plotly
   backend) > saved preference
   (`python <skill-dir>/scripts/academic_figure_pref.py get library`) > default
   matplotlib (recommend plotly only when interactive/web output is needed).
   seaborn is not a separate axis — it is a matplotlib-layer API and specs still
   resolve down to rcParams.
4. **industrytslib integration check.** If the user names industrytslib, or the
   project's dependencies/imports include `industrytslib`, read
   `references/industrytslib-integration.md` and drive figures through
   `create_plotter(...)` / `plotter.set_style(...)` — call the library, never
   modify it. Otherwise take the standalone path (journal specs + a library
   recipe).
5. **Load references on demand.** Read only what the resolved axes need: the
   matched card in `references/journal-specs.md`, one library recipe
   (`references/matplotlib-recipes.md` or `references/plotly-recipes.md`), and
   the matched family section in `references/chart-recipes.md`.
6. **Export & QA.** Export per the spec card (vector-first, `fonttype=42`,
   colorblind-safe default palette), then walk every item in
   `references/qa-checklist.md` before delivering.

## Route elsewhere

| Request                                                                                | Route to                                                                       |
| -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Reproduce a specific paper's figure, name a paper-plot style folder, or "照着这个图画" | **paper-plot** (`skills/research-learning-knowledge/paper-plot`)               |
| Deep-read or summarize a single paper                                                  | **literature-mentor** (`skills/research-learning-knowledge/literature-mentor`) |
| Intake or synthesize across many papers                                                | **paper-workbench** (`skills/research-learning-knowledge/paper-workbench`)     |

## Resources

- **Contract & QA**: `references/figure-contract.md`, `references/qa-checklist.md`
- **Journal specs**: `references/journal-specs.md` — IEEE / Elsevier / Nature cards + springer / chinese-thesis extensions
- **Library recipes**: `references/matplotlib-recipes.md`, `references/plotly-recipes.md`
- **Chart families**: `references/chart-recipes.md`
- **industrytslib**: `references/industrytslib-integration.md`
- **Preference CLI**: `scripts/academic_figure_pref.py` — persists `library` and `journal_style`

_References and scripts are populated in later build phases; the filenames above are the stable contract._
