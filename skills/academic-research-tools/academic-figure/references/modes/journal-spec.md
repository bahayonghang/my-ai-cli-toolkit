# Mode: journal-spec

Create or review a figure under the authoritative `journal-spec` output
contract in `SKILL.md`. Work the eight steps in order.

## Protocol

1. **Figure contract.** Read `../figure-contract.md` and lock the claim before
   plotting: core conclusion (one sentence) → evidence chain / panel mapping →
   prototype class (quantitative grid / schematic-led / image+quant /
   asymmetric) → journal export contract.
2. **Chart selection.** If the chart type is not already fixed, read
   `../chart-selection.md` and resolve the three decision axes: variable
   structure, argument intent, and data scale. If the request matches a row in
   `../viz-pitfalls.md`, run the four-step interception protocol in that file
   before you draw. When the user brings data and no chart type at all, run
   `advise.md` first and return here with the agreed chart type.
3. **Journal-style axis.** Resolve in priority order: explicit request >
   submission context (target journal) > saved preference
   (`python "<skill-dir>/scripts/academic_figure_pref.py" get journal_style`) >
   ask once ("Target journal style? ieee / elsevier / nature, or springer /
   chinese-thesis"). After the user answers, persist it with the matching
   `set` command.
4. **Library axis.** Resolve: explicit request > project context (libraries
   already imported; an industrytslib project uses its matplotlib/plotly
   backend) > saved preference
   (`python "<skill-dir>/scripts/academic_figure_pref.py" get library`) >
   default matplotlib. Recommend plotly only when interactive/web output is
   needed. Seaborn is a matplotlib-layer API, not a separate axis.
5. **industrytslib integration check.** If the user names industrytslib, or the
   project's dependencies/imports include `industrytslib`, read
   `../industrytslib-integration.md` and drive figures through
   `create_plotter(...)` / `plotter.set_style(...)`. Call the library without
   modifying it. Otherwise take the standalone path.
6. **Load references on demand.** Read only what the resolved axes need: the
   matched card in `../journal-specs.md`, `../layout-defaults.md` (canvas,
   y-axis headroom, type size), one library recipe
   (`../matplotlib-recipes.md` or `../plotly-recipes.md`), and the matched
   family section in `../chart-recipes.md`. Add
   `../figure-legend-conventions.md` when the deliverable includes the caption.
7. **Visual review before export.** Run the loop in `../visual-review.md`:
   render a PNG preview, run the machine audit in
   `<skill-dir>/scripts/visual_qa.py`, read the preview against the ten
   perceptual items, fix at the source, and render again. Three rounds is the
   limit. A missing-glyph `FAIL` blocks the export.
8. **Export and QA.** Export under the selected `journal-spec` contract, then
   walk every applicable item in `../qa-checklist.md`, including the post-export
   machine checks. For a PDF, audit the smallest rendered glyph with
   `python "<skill-dir>/scripts/audit_pdf_text.py" figure.pdf --min-pt 5`.

## Completion criterion

The mode is complete only when the figure contract is locked, the chart type is
resolved with any matched pitfall reported, the requested figure or review is
delivered under the resolved journal/library axes, the visual review loop
passes, and every applicable QA checklist item passes.
