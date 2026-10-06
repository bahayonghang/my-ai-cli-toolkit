# Attribution

This skill absorbs capabilities from seven upstream projects. The table records
what each project contributed, and how. "Rewritten" means the rule or the number
comes from the upstream document, but every sentence here is original. "Ported"
means a source file was carried over. The file keeps its upstream copyright
header, or a first-line source comment when the upstream file has no header.

All snapshots are shallow clones that were read on 2026-08-16. The
figures4papers snapshot was read again on 2026-09-24.

| Project                                                                                                                          | License                    | Snapshot                      | Contribution and method                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ChenLiu-1996/figures4papers](https://github.com/ChenLiu-1996/figures4papers)                                                    | **CC BY-NC 4.0**           | `3c181f8`, 2026-09-06         | **Ported** (code and images): 24 plot scripts and `raw_data.py` in `scripts/figures4papers/`, and 29 source figures in `assets/originals/figures4papers/`. The 14 `styles/f4p_*.md` documents describe them. See the port record below. **Rewritten** (facts only): design facts in `design-theory.md` and `panel-layout-patterns.md`; the bar patterns in `chart-recipes.md` and three snippets in `panel-layout-patterns.md`, which reach this skill through nature-figure. |
| [Trae1ounG/paper-plot-skills](https://github.com/Trae1ounG/paper-plot-skills)                                                    | **None**                   | `cde5e84`, 2026-04-20         | The eight style documents, nine scripts, and ten source figures behind `from-data` and `from-image`. **Copied** in an earlier commit, with two edits. See the next section.                                                                                                                                                                                                                                                                                                   |
| [Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills) (skill `nature-figure`, manifest 2.5.0)                  | Apache-2.0                 | `7316aff`, 2026-08-16         | The figure contract in `figure-contract.md`; the per-panel audit and the 5 pt glyph floor in `qa-checklist.md`; `figure-legend-conventions.md`; `panel-layout-patterns.md`; the template reuse ladder in `modes/from-data.md`. **Rewritten.** `scripts/audit_pdf_text.py` is **ported**.                                                                                                                                                                                      |
| [Haojae/scipilot-figure-skill](https://github.com/Haojae/scipilot-figure-skill)                                                  | MIT, (c) 2026 Haojae       | `43098dd`, 2026-06-15         | The advisor protocol in `modes/advise.md`; `chart-selection.md`; the P1–P18 list in `viz-pitfalls.md`; `visual-review.md`; the CJK font chain in `matplotlib-recipes.md`. **Rewritten.** `scripts/visual_qa.py` is **ported**.                                                                                                                                                                                                                                                |
| [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) (skill `scientific-visualization`) | MIT, (c) 2025 K-Dense Inc. | `336c4f8`, 2026-08-15         | The submission phase dimension and the figure type by DPI by format table in `journal-specs.md`; the post-export machine checks and the greyscale criterion in `qa-checklist.md`; the misleading-encoding rows M1–M7 in `viz-pitfalls.md`, with the provenance fields in row M7. **Rewritten.** No script was copied.                                                                                                                                                         |
| [Dsadd4/AgentFigureGallery](https://github.com/Dsadd4/AgentFigureGallery)                                                        | MIT                        | `62f6094`, 2026-05-29         | The reference-first rule and the CLI workflow, in `agent-figure-gallery-integration.md`. **Described only.** No candidate asset, index file, or script was copied.                                                                                                                                                                                                                                                                                                            |
| [Galaxy-Dawn/pubfig](https://github.com/Galaxy-Dawn/pubfig)                                                                      | MIT                        | `4eec116`, 2026-04-23, v0.3.0 | The optional backend guide in `pubfig-integration.md`: the 41 plot kinds, the JSON spec contract, and the export behavior. **Described only.**                                                                                                                                                                                                                                                                                                                                |

## Projects without a license

`paper-plot-skills` carries no LICENSE file. A recursive search for `licen`,
`copying`, and `notice` found none in that repository. Copyright therefore stays
with the author, and no redistribution right is granted.

- `paper-plot-skills` content is already in this repository from an earlier
  commit. This file records that history; it is not a new decision to copy.

## figures4papers (CC BY-NC 4.0)

- **License fact.** Commit `3c181f8` (2026-09-06) added a root `LICENSE` file
  with the text of Creative Commons Attribution-NonCommercial 4.0 International.
  The file names no copyright holder. The earlier snapshot `6790a93`
  (2026-08-06) did not contain that file. Between the two snapshots only `LICENSE`
  and `README.md` changed; every figure script is byte-identical.
- **Rewritten content.** `design-theory.md` and parts of
  `panel-layout-patterns.md` restate design facts (numbers, layout rules, color
  roles) in original words. The cross-cutting patterns in `chart-recipes.md` and
  three snippets in `panel-layout-patterns.md` reach this skill through
  nature-figure, which derives them from figures4papers scripts. Each of those
  places names the figures4papers source.
- **User decision, 2026-09-24.** This project is open source and non-commercial.
  The user allows a port of figures4papers scripts and source figures into this
  skill under these conditions:
  1. Credit figures4papers in the acknowledgement section of the skill README.
  2. Add a port record table to this file. Each row gives the upstream path,
     the snapshot `3c181f8`, and the changes made during the port. CC BY
     requires a statement of changes; the table holds it.
  3. Keep ported files under `scripts/figures4papers/` and
     `assets/originals/figures4papers/`, so the CC BY-NC 4.0 material stays
     separate from the rest of the skill.
- **Scope of the terms.** Ported files keep the CC BY-NC 4.0 terms: use for
  non-commercial purposes only, with attribution. The MIT license of this
  repository does not cover them. The source figures also appear in published
  papers, so publisher rights can apply in addition.

Third-party note: `nature-skills` carries an Apache-2.0 root license, but its
`skills/nature-figure/assets/figures4papers/` directory is excluded from it. That
directory keeps its own `THIRD_PARTY_NOTICES.md`. Do not treat it as licensed.

## Port record for figures4papers

Source: `ChenLiu-1996/figures4papers` at snapshot `3c181f8` (2026-09-06),
CC BY-NC 4.0. Port date: 2026-09-24. Each upstream path below is relative to the
repository root. Each skill path is relative to this skill.

**Generic changes (G).** The port applied these changes to all 24 plot scripts.
It did not change figsize, axis limits, colors, font sizes, or data.

1. Line 1 is a comment with the upstream path, the snapshot `3c181f8`, the
   license `CC BY-NC 4.0`, and a pointer to this file.
2. `matplotlib.use('Agg')` runs before the first `pyplot` import.
3. The first positional argument is the output directory (default: the current
   directory). Each `./figures/<name>` save path becomes
   `os.path.join(OUT_DIR, '<name>')`, and the script creates `OUT_DIR`. File
   names do not change.
4. The environment variable `ACADEMIC_FIGURE_DPI` overrides the DPI. The
   default is the upstream value of that script.
5. When a script sets a font, `font.family = 'helvetica'` becomes
   `'sans-serif'`, and `font.sans-serif` is set to
   `['Helvetica', 'Arial', 'DejaVu Sans']`.
6. After each save, the script prints one line `saved: <absolute path>`.

**TeX switch (T).** The six usetex scripts set `text.usetex` only when a `latex`
executable is on `PATH` and `ACADEMIC_FIGURE_NO_TEX` is not `1`. Otherwise they
set `mathtext.fontset = 'cm'`. No raw TeX command appears in the figure.

| Upstream path                                           | Path in this skill                                                             | Changes                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `figure_Brainteaser/plot_brute_force.py`                | `scripts/figures4papers/figure_Brainteaser/plot_brute_force.py`                | G                                                                                                                                                                                                                                                                                                      |
| `figure_Brainteaser/plot_correctness_by_category.py`    | `scripts/figures4papers/figure_Brainteaser/plot_correctness_by_category.py`    | G                                                                                                                                                                                                                                                                                                      |
| `figure_Brainteaser/plot_correctness_by_subcategory.py` | `scripts/figures4papers/figure_Brainteaser/plot_correctness_by_subcategory.py` | G                                                                                                                                                                                                                                                                                                      |
| `figure_Brainteaser/plot_rewriting.py`                  | `scripts/figures4papers/figure_Brainteaser/plot_rewriting.py`                  | G                                                                                                                                                                                                                                                                                                      |
| `figure_Brainteaser/plot_selfcorrection_math.py`        | `scripts/figures4papers/figure_Brainteaser/plot_selfcorrection_math.py`        | G                                                                                                                                                                                                                                                                                                      |
| `figure_CellSpliceNet/plot_ablation.py`                 | `scripts/figures4papers/figure_CellSpliceNet/plot_ablation.py`                 | G                                                                                                                                                                                                                                                                                                      |
| `figure_CellSpliceNet/plot_comparison.py`               | `scripts/figures4papers/figure_CellSpliceNet/plot_comparison.py`               | G                                                                                                                                                                                                                                                                                                      |
| `figure_Cflows/diffusion_swiss_roll.py`                 | `scripts/figures4papers/figure_Cflows/diffusion_swiss_roll.py`                 | G without item 5 (upstream sets no font). Fix F3. Adds `os.makedirs(OUT_DIR)`; upstream created no directory                                                                                                                                                                                           |
| `figure_Cflows/plot_comparison_Ablation.py`             | `scripts/figures4papers/figure_Cflows/plot_comparison_Ablation.py`             | G                                                                                                                                                                                                                                                                                                      |
| `figure_Cflows/plot_comparison_GeneRegulatory.py`       | `scripts/figures4papers/figure_Cflows/plot_comparison_GeneRegulatory.py`       | G                                                                                                                                                                                                                                                                                                      |
| `figure_Cflows/plot_comparison_Trajectory.py`           | `scripts/figures4papers/figure_Cflows/plot_comparison_Trajectory.py`           | G                                                                                                                                                                                                                                                                                                      |
| `figure_Dispersion/plot_idea.py`                        | `scripts/figures4papers/figure_Dispersion/plot_idea.py`                        | G, T. All labels are valid mathtext; no string changed                                                                                                                                                                                                                                                 |
| `figure_Dispersion/plot_illustration.py`                | `scripts/figures4papers/figure_Dispersion/plot_illustration.py`                | G, T. All labels are valid mathtext; no string changed                                                                                                                                                                                                                                                 |
| `figure_ImmunoStruct/plot_bars.py`                      | `scripts/figures4papers/figure_ImmunoStruct/plot_bars.py`                      | G (default DPI 600, the upstream value). Fix F4                                                                                                                                                                                                                                                        |
| `figure_ImmunoStruct/raw_data.py`                       | `scripts/figures4papers/figure_ImmunoStruct/raw_data.py`                       | Data module. Line-1 comment only                                                                                                                                                                                                                                                                       |
| `figure_RNAGenScape/plot_comparison.py`                 | `scripts/figures4papers/figure_RNAGenScape/plot_comparison.py`                 | G, T. Without TeX: `\texttt` becomes `\mathtt`, `\textit` becomes `\mathit`, `\textbf` becomes `\mathbf`, `\%` becomes `%`; the tick match tests `'RNAGenScape' in text`; the disabled `PLOT_DE_NOVO_SPEED` branch writes the group names without `\underbrace`. With TeX, every string is as upstream |
| `figure_RNAGenScape/plot_hole_manifold.py`              | `scripts/figures4papers/figure_RNAGenScape/plot_hole_manifold.py`              | G without item 5 (upstream sets no font). Module-level code kept, as upstream                                                                                                                                                                                                                          |
| `figure_RNAGenScape/plot_manifold.py`                   | `scripts/figures4papers/figure_RNAGenScape/plot_manifold.py`                   | G without item 5 (upstream sets no font). Fix F6                                                                                                                                                                                                                                                       |
| `figure_RNAGenScape/plot_sweep.py`                      | `scripts/figures4papers/figure_RNAGenScape/plot_sweep.py`                      | G, T. Labels use `$\uparrow$`, valid mathtext                                                                                                                                                                                                                                                          |
| `figure_VIGIL/plot_ablation.py`                         | `scripts/figures4papers/figure_VIGIL/plot_ablation.py`                         | G. Fix F5                                                                                                                                                                                                                                                                                              |
| `figure_VIGIL/plot_comparison_radar.py`                 | `scripts/figures4papers/figure_VIGIL/plot_comparison_radar.py`                 | G                                                                                                                                                                                                                                                                                                      |
| `figure_VIGIL/plot_concept.py`                          | `scripts/figures4papers/figure_VIGIL/plot_concept.py`                          | G. The text argument `fontfamily='helvetica'` becomes `fontfamily='sans-serif'`, so the fallback list applies                                                                                                                                                                                          |
| `figure_VIGIL/plot_posttraining.py`                     | `scripts/figures4papers/figure_VIGIL/plot_posttraining.py`                     | G. Two text arguments `fontfamily='helvetica'` become `fontfamily='sans-serif'`                                                                                                                                                                                                                        |
| `figure_ophthal_review/plot_composition.py`             | `scripts/figures4papers/figure_ophthal_review/plot_composition.py`             | G, T. All labels are valid mathtext; no string changed                                                                                                                                                                                                                                                 |
| `figure_ophthal_review/plot_trend.py`                   | `scripts/figures4papers/figure_ophthal_review/plot_trend.py`                   | G, T. Fixes F1 and F2. Layout change: the label `'GPT-4*'` becomes `'GPT-4**'`, so it clears the two-line 2023-02 label                                                                                                                                                                                |
| 29 PNG files in `figure_*/figures/`                     | `assets/originals/figures4papers/<project>/`, same file names                  | Resized with Pillow `thumbnail((1800, 1800), LANCZOS)` and saved with `optimize=True`. The plan limit was 2400 px; at 2400 px the total was 8.53 MiB, above the 8 MB limit, so the long edge is 1800 px (total 5.86 MiB). `manifold.png` stays 1000×700. PDF copies not ported                         |

The 14 style documents `references/styles/f4p_*.md` are new text. They describe
the ported scripts; no upstream Markdown was copied.

**Upstream defects fixed during the port.**

| ID  | File                                                         | Upstream defect                                                                                                             | Fix                                                           |
| --- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| F1  | `figure_ophthal_review/plot_trend.py` (upstream lines 20-21) | The dict key `'2023-02'` appears twice, so the `'Bard'` event is lost                                                       | One key `'2023-02'` with the label `'Bard\nLlaMA 1'`          |
| F2  | `figure_ophthal_review/plot_trend.py` (upstream line 35)     | The key `'2023-9'` does not match the zero-padded month axis, so the `GPT-4v` event does not appear                         | Key changed to `'2023-09'`                                    |
| F3  | `figure_Cflows/diffusion_swiss_roll.py`                      | No random seed, so every run draws a different point cloud                                                                  | `np.random.seed(0)` at the start of `__main__`                |
| F4  | `figure_ImmunoStruct/plot_bars.py` (upstream line 27)        | Sets `svg.fonttype = 'none'` but exports PNG only                                                                           | PNG output and `svg.fonttype` kept; `pdf.fonttype = 42` added |
| F5  | `figure_VIGIL/plot_ablation.py` (upstream line 18)           | `'$\beta$'` is not a raw string, so `\b` is a backspace; `'$\lambda$'` is an invalid escape (SyntaxWarning on Python 3.12+) | The two dict keys and the two `*_key` lookups are raw strings |
| F6  | `figure_RNAGenScape/plot_manifold.py` (upstream line 61)     | `savefig` sets no DPI, so the output is 100 dpi                                                                             | Saves at `ACADEMIC_FIGURE_DPI`, default 300                   |

## Record for the copied paper-plot-skills content

| Item                                       | Upstream path                                         | Path in this skill                 |
| ------------------------------------------ | ----------------------------------------------------- | ---------------------------------- |
| 8 style parameter documents                | `plot-from-data/references/*.md`                      | `references/styles/`               |
| 8 style scripts + `classwise_iou_table.py` | `plot-from-data/scripts/`, `plot-from-image/scripts/` | `scripts/`                         |
| 10 source figures (PNG)                    | `originals/`                                          | `assets/originals/`                |
| Reproduction guide                         | `plot-from-image/references/`                         | `references/reproduction_guide.md` |

Two edits were made during the transfer. Both are intentional:

1. **Path rewrite.** Upstream paths such as `repro/<script>.py` became the
   `<skill-dir>/scripts/<script>.py` placeholder form that this repository needs.
2. **Output parameterization.** Upstream hard-coded the output to an absolute
   path on the author's machine. Each script now reads the output path from
   `sys.argv[1]`, and writes to the current directory when no argument is given.

## Copyright of the source figures

The ten PNG files under `assets/originals/` are figures from published papers.
Copyright belongs to the authors of each paper, not to `paper-plot-skills` and
not to this repository. Each style document names its source paper in the
`**来源论文**：` line. Use these figures for visual comparison during
reproduction only. Do not republish one, and do not present a reproduction as
the original result.

`classwise_iou.png` is different: it comes from a user screenshot filed as
issue 1 of the upstream repository.
