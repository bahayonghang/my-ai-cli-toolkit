# Recipe run record and chart-selection mapping

- Date: 2026-09-24
- Scope: `skills/academic-research-tools/academic-figure/references/chart-recipes.md`
  sections 11–20 (AC1); `references/chart-selection.md` recommendation tables (AC2).
- Environment: Python 3.14.7, matplotlib 3.11.2, numpy 2.5.3. seaborn and scipy
  are not installed. No package was installed.

## AC1: run of each new code block

### Method

A throwaway runner (`%TEMP%/af-recipes-run/run_blocks.py`, not shipped with the
skill) did these steps:

1. Read `chart-recipes.md` from `## 11. ` up to `## Cross-cutting layout patterns`.
2. Extracted every ```` ```python ```` block and replaced `<skill-dir>` with the
   absolute skill path.
3. Skipped a block that contains `import seaborn` when seaborn is not
   importable. Each such block is a seaborn form, and its section also has a
   pure matplotlib form that ran.
4. Wrote each block to its own temp directory and ran it with
   `python -W error::UserWarning block.py`. A `UserWarning` (for example a
   missing glyph or a constrained-layout failure) makes the run fail.
5. PASS = exit 0 and at least one file in `figs/`.

The shared opening snippet above section 11 is a template fragment. The runner
does not run it; every section block repeats it and ran.

### Result (final run, directory `final2`)

| Block  | Section                             | Result | Files written                                        |
| ------ | ----------------------------------- | ------ | ---------------------------------------------------- |
| s11_b1 | 11 grouped bars                     | PASS   | `grouped_bar.pdf`, `grouped_bar.png`                 |
| s11_b2 | 11 stacked + 100% stacked           | PASS   | `stacked_bar.pdf`, `stacked_bar.png`                 |
| s11_b3 | 11 value-sorted horizontal bar      | PASS   | `sorted_hbar.pdf`, `sorted_hbar.png`                 |
| s12_b1 | 12 mean ± SD bars                   | PASS   | `mean_sd_bar.pdf`, `mean_sd_bar.png`                 |
| s12_b2 | 12 mean ± 95% CI + spaghetti        | PASS   | `mean_ci_spaghetti.pdf`, `mean_ci_spaghetti.png`     |
| s13_b1 | 13 beeswarm (pure matplotlib)       | PASS   | `beeswarm.pdf`, `beeswarm.png`                       |
| s13_b2 | 13 seaborn form                     | SKIP   | seaborn not installed; s13_b1 is the pure form       |
| s14_b1 | 14 box + raw points (pure)          | PASS   | `box_points.pdf`, `box_points.png`                   |
| s14_b2 | 14 seaborn form                     | SKIP   | seaborn not installed; s14_b1 is the pure form       |
| s15_b1 | 15 violin                           | PASS   | `violin.pdf`, `violin.png`                           |
| s16_b1 | 16 KDE (numpy)                      | PASS   | `kde.pdf`, `kde.png`                                 |
| s17_b1 | 17 scatter + fit + bootstrap band   | PASS   | `scatter_fit.pdf`, `scatter_fit.png`                 |
| s17_b2 | 17 hexbin + 2D KDE                  | PASS   | `hexbin_kde2d.pdf`, `hexbin_kde2d.png`               |
| s17_b3 | 17 pair grid                        | PASS   | `pair_grid.pdf`, `pair_grid.png`                     |
| s18_b1 | 18 confusion-matrix heat map        | PASS   | `confusion_heatmap.pdf`, `confusion_heatmap.png`     |
| s18_b2 | 18 clustered heat map (seriation)   | PASS   | `clustered_heatmap.pdf`, `clustered_heatmap.png`     |
| s19_b1 | 19 ROC + PR                         | PASS   | `roc_pr.pdf`, `roc_pr.png`                           |
| s20_b1 | 20 significance brackets            | PASS   | `significance_brackets.pdf`, `significance_brackets.png` |

Total: 16 PASS, 0 FAIL, 2 SKIP (seaborn forms). Sections 15 and 16 give their
seaborn form as a one-line inline call, not as a block.

### Layout audit and preview review

For each block, a second throwaway script appended
`visual_qa.print_report(visual_qa.audit_layout(fig))` and a per-axes headroom
diagnostic (checker values next to `ax.dataLim`).

- No block has a missing-glyph, clipped-text, tick-overlap, or plot-box issue.
- 7 blocks PASS. 9 blocks WARN on y headroom only. Each WARN has one of these
  causes:

| Cause                                                                                                                                             | Blocks                         | Real defect |
| ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ | ----------- |
| `_finite_y_values` reads the marker path of a scatter `PathCollection` (unit shape near 0), not the data. `ax.dataLim` headroom is 0.097 per side. | s13_b1, s14_b1, s15_b1, s17_b1 | No          |
| Colorbar axes are counted as data axes; the colorbar mesh fills its axes.                                                                         | s17_b2, s18_b1, s18_b2         | No          |
| Density has a natural zero; `set_ylim(bottom=0)` is intended (P4). Top headroom is 0.107.                                                         | s16_b1                         | No          |
| ROC and PR axes are fixed to [0, 1] probability ranges.                                                                                           | s19_b1                         | No (intended) |

These are limits of the checker in `scripts/visual_qa.py`, which this task does
not own. They are recorded here for the owner of that file.

Defects that the audit or the preview review found, fixed before the final run:

1. Violin used `ax.margins(y=0.08)`; headroom 0.069. Changed to 0.12.
2. KDE top headroom 0.048. Added `ax.margins(y=0.12)` before `set_ylim(bottom=0)`.
3. Scatter-fit headroom 0.045. Added `ax.margins(y=0.12)`.
4. Bracket plot bottom headroom 0.043. Set the lower y limit explicitly.
5. Stacked bars: labels inside hatched segments were hard to read. Changed to
   `figstyle.label_bars` (outlined text).
6. 2D KDE: the lowest contour level filled the full grid with one dark color.
   Levels now start at 5% of the peak, so the empty area stays white.
7. 2D KDE colorbar showed four decimals; added `format="%.2f"`.
8. Mean ± SD: the value text touched the error cap; now 2 pt above it.

Previews read by eye after the fixes: grouped bar, stacked bar, beeswarm,
violin, KDE, hexbin + 2D KDE, pair grid, confusion heat map, clustered heat map
(the seriation recovers the three hidden blocks), ROC + PR, significance
brackets, mean ± SD, spaghetti.

## AC2: chart-selection recommendations to recipe or style

Scope: every chart name in the "first choice", "alternate", and default
columns of `chart-selection.md`. "Do not use" entries are not recommendations
and are not mapped. `f4p_*` families are planned by `09-24-af-f4p-port`
(design section 1); their style documents did not exist when this record was
written.

### Axis 2 — argument intent

| Intent       | Recommended chart                       | Target                                                                                |
| ------------ | --------------------------------------- | ------------------------------------------------------------------------------------- |
| Distribution | Histogram or KDE, box plot as alternate | Family 4 (histogram); section 16 (KDE); family 3 / section 14 (box)                   |
| Comparison   | Box plot or violin, bar with error bars | Section 14 (box + points); section 15 (violin); section 12 (bar with error); `f4p_bar_mean_std` |
| Relation     | Scatter plot with a fit line            | Section 17, block 1                                                                   |
| Trend        | Line plot with an uncertainty band      | Family 7 (interval band); section 12 block 2; style `line_confidence_band`            |
| Composition  | Stacked bar                             | Section 11 block 2; `f4p_bar_stacked_composition`                                     |
| Correlation  | Correlation heat map or pair grid       | Family 5 (heat map); section 17 block 3 (pair grid)                                   |
| Difference   | Box plot with significance annotation   | Section 20                                                                            |
| Uncertainty  | Error bars or a confidence band         | Section 12 (both blocks); family 7                                                    |

### Axis 3 — data scale

| Sample size        | Recommended chart                             | Target                                                           |
| ------------------ | --------------------------------------------- | ---------------------------------------------------------------- |
| n < 3              | Plot every point                              | Section 13                                                       |
| 3 ≤ n < 10         | Strip plot, beeswarm, or dot plot             | Section 13 (beeswarm block; dot-plot alternate bullet)           |
| 10 ≤ n < 30        | Box plot or violin with a strip overlay       | Section 14; section 15 (common-errors bullet adds the points)     |
| n ≥ 30             | Box plot, violin, or bar with error bars      | Sections 14, 15, 12                                              |
| Total points > 10⁴ | Scatter alpha 0.1–0.3, hexbin, or a 2D KDE    | Section 17 block 2 (hexbin, 2D KDE); section 17 export bullet (`rasterized=True`) |

### Data shape to chart type

| Data shape                           | First choice / alternate                           | Target                                                                               |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1 continuous, distribution           | KDE or histogram / box plot or violin              | Section 16, family 4 / sections 14, 15                                               |
| 1 categorical, composition           | Value-sorted horizontal bar / single stacked bar   | Section 11 block 3 / section 11 block 2 with one group                               |
| 1 categorical + 1 continuous, n ≥ 10 | Box plot + strip plot / violin, bar with error     | Section 14 / sections 15, 12                                                         |
| 1 categorical + 1 continuous, n < 10 | Strip plot or beeswarm / dot plot                  | Section 13                                                                           |
| 2 continuous                         | Scatter + fit line / 2D KDE, hexbin                | Section 17 blocks 1 and 2                                                            |
| Time + continuous                    | Line + uncertainty band / step plot, scatter       | Family 7, `line_confidence_band` / family 1 step-plot note, section 17; `f4p_trend_month_events` (monthly cumulative trend) |
| 3–20 continuous variables            | Correlation heat map / pair grid                   | Family 5 / section 17 block 3                                                        |
| More than 20 continuous variables    | Clustered heat map / PCA or UMAP scatter           | Section 18 block 2 / family 8                                                        |
| Matrix data                          | Heat map, uniform colormap / table                 | Section 18 block 1; `f4p_heatmap_annotated` / family 10 (`Axes.table`, CSV)          |
| Composition of a total               | Stacked bar, treemap / 100% stacked bar            | Section 11 block 2; `f4p_bar_stacked_composition` / section 11 block 2. **Treemap: no target** (see gaps) |
| Binary classifier performance        | ROC or PR curve / confusion-matrix heat map        | Section 19 / section 18 block 1                                                      |

### One dataset, several claims

| Claim                                | Chart                                     | Target                    |
| ------------------------------------ | ----------------------------------------- | ------------------------- |
| Drug A is faster than drug B overall | Box plot, all time points pooled          | Section 14; family 3      |
| A and B diverge most at t = 3        | Line plot, hue = drug, with an error band | Section 12 block 2        |
| Between-subject variability is large | Spaghetti plot, thick mean                | Section 12 block 2        |
| A and B differ at t = 3              | Paired box plot with significance bracket | Section 20                |

### Chart semantic boundaries

| Pair                  | Target                                          |
| --------------------- | ----------------------------------------------- |
| Line vs scatter       | Family 1 / family 7 (line); section 17 (scatter) |
| Bar with error vs box | Section 12; section 14                          |
| Heat map vs pair grid | Family 5, section 18; section 17 block 3        |

### Gaps

- **Treemap** ("Composition of a total", first choice together with stacked
  bar). matplotlib has no treemap. The common package (`squarify`) is a new
  dependency, which R2 excludes. The stacked bar in the same cell has a recipe.
  Owner decision: accept the gap, or drop treemap from the table.
  Check resolution: `chart-selection.md` now has a note under the data-shape
  table. The note points to section 11 and allows `squarify` only on user
  request.

All other chart names have a target. Result: 1 gap in about 45 chart names.

## Trigger cases (R5) — local scoring only

`evals/trigger_cases.json` was scored with a throwaway copy of the documented
qiaomu formula (`|prompt ∩ description| / max(3, min(5, |description|))` ≥
`recommended_threshold`, negative-pattern veto) against the current
`SKILL.md` description (1.2.0). The qiaomu `trigger_eval.py` is not installed
on this machine, so the result is not a tool run.

- Description concepts: advise, compliance, figure, publication, style,
  tooling (required concepts present).
- Result: 20/20 (12 should_trigger, 5 should_not_trigger, 3 near_neighbor).
- The case-12 negative pattern is `讲讲` (a substring of eval 12). It also
  vetoes the near neighbor "讲讲这篇论文里 Figure 3 的结论". A lexical
  scorer cannot separate reading a paper figure from drawing one without it.
- Provider trigger behavior, human review, and telemetry: `missing evidence`.
  CI does not run `evals.json` or `trigger_cases.json`.
