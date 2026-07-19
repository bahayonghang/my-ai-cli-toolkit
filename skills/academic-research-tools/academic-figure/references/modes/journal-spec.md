# Mode: journal-spec

Create or review a figure under the authoritative `journal-spec` output
contract in `SKILL.md`. Work the six steps in order.

## Protocol

1. **Figure contract.** Read `../figure-contract.md` and lock the claim before
   plotting: core conclusion (one sentence) → evidence chain / panel mapping →
   prototype class (quantitative grid / schematic-led / image+quant /
   asymmetric) → journal export contract.
2. **Journal-style axis.** Resolve in priority order: explicit request >
   submission context (target journal) > saved preference
   (`python "<skill-dir>/scripts/academic_figure_pref.py" get journal_style`) >
   ask once ("Target journal style? ieee / elsevier / nature, or springer /
   chinese-thesis"). After the user answers, persist it with the matching
   `set` command.
3. **Library axis.** Resolve: explicit request > project context (libraries
   already imported; an industrytslib project uses its matplotlib/plotly
   backend) > saved preference
   (`python "<skill-dir>/scripts/academic_figure_pref.py" get library`) >
   default matplotlib. Recommend plotly only when interactive/web output is
   needed. Seaborn is a matplotlib-layer API, not a separate axis.
4. **industrytslib integration check.** If the user names industrytslib, or the
   project's dependencies/imports include `industrytslib`, read
   `../industrytslib-integration.md` and drive figures through
   `create_plotter(...)` / `plotter.set_style(...)`. Call the library without
   modifying it. Otherwise take the standalone path.
5. **Load references on demand.** Read only what the resolved axes need: the
   matched card in `../journal-specs.md`, one library recipe
   (`../matplotlib-recipes.md` or `../plotly-recipes.md`), and the matched
   family section in `../chart-recipes.md`.
6. **Export and QA.** Export under the selected `journal-spec` contract, then
   walk every applicable item in `../qa-checklist.md` before delivering.

## Completion criterion

The mode is complete only when the figure contract is locked, the requested
figure or review is delivered under the resolved journal/library axes, and
every applicable QA checklist item passes.
