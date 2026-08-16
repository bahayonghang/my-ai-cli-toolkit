# Attribution

This skill absorbs capabilities from seven upstream projects. The table records
what each project contributed, and how. "Rewritten" means the rule or the number
comes from the upstream document, but every sentence here is original. "Ported"
means a source file was carried over, with its upstream copyright header kept.

All snapshots are shallow clones that were read on 2026-08-16.

| Project                                                                                                                          | License                    | Snapshot                      | Contribution and method                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [ChenLiu-1996/figures4papers](https://github.com/ChenLiu-1996/figures4papers)                                                    | **None**                   | `6790a93`, 2026-08-06         | Semantic palette roles, the two-tier font and line-width system, the wide-panel ratio rule, and the unified export contract, in `design-theory.md`. **Rewritten.** No code, text, or image was copied.                                                                                                          |
| [Trae1ounG/paper-plot-skills](https://github.com/Trae1ounG/paper-plot-skills)                                                    | **None**                   | `cde5e84`, 2026-04-20         | The eight style documents, nine scripts, and ten source figures behind `from-data` and `from-image`. **Copied** in an earlier commit, with two edits. See the next section.                                                                                                                                     |
| [Yuan1z0825/nature-skills](https://github.com/Yuan1z0825/nature-skills) (skill `nature-figure`, manifest 2.5.0)                  | Apache-2.0                 | `7316aff`, 2026-08-16         | The figure contract in `figure-contract.md`; the per-panel audit and the 5 pt glyph floor in `qa-checklist.md`; `figure-legend-conventions.md`; `panel-layout-patterns.md`; the template reuse ladder in `modes/from-data.md`. **Rewritten.** `scripts/audit_pdf_text.py` is **ported**.                        |
| [Haojae/scipilot-figure-skill](https://github.com/Haojae/scipilot-figure-skill)                                                  | MIT, (c) 2026 Haojae       | `43098dd`, 2026-06-15         | The advisor protocol in `modes/advise.md`; `chart-selection.md`; the P1–P18 list in `viz-pitfalls.md`; `visual-review.md`; the CJK font chain in `matplotlib-recipes.md`. **Rewritten.** `scripts/visual_qa.py` is **ported**.                                                                                  |
| [K-Dense-AI/claude-scientific-skills](https://github.com/K-Dense-AI/claude-scientific-skills) (skill `scientific-visualization`) | MIT, (c) 2025 K-Dense Inc. | `336c4f8`, 2026-08-15         | The submission phase dimension and the figure type by DPI by format table in `journal-specs.md`; the post-export machine checks, the WCAG and greyscale criteria, and the provenance fields in `qa-checklist.md`; the misleading-encoding rows M1–M7 in `viz-pitfalls.md`. **Rewritten.** No script was copied. |
| [Dsadd4/AgentFigureGallery](https://github.com/Dsadd4/AgentFigureGallery)                                                        | MIT                        | `62f6094`, 2026-05-29         | The reference-first rule and the CLI workflow, in `agent-figure-gallery-integration.md`. **Described only.** No candidate asset, index file, or script was copied.                                                                                                                                              |
| [Galaxy-Dawn/pubfig](https://github.com/Galaxy-Dawn/pubfig)                                                                      | MIT                        | `4eec116`, 2026-04-23, v0.3.0 | The optional backend guide in `pubfig-integration.md`: the 41 plot kinds, the JSON spec contract, and the export behavior. **Described only.**                                                                                                                                                                  |

## Projects without a license

`figures4papers` and `paper-plot-skills` carry no LICENSE file. A recursive search
for `licen`, `copying`, and `notice` found none in either repository. Copyright
therefore stays with the author, and no redistribution right is granted.

- From `figures4papers`, this skill keeps **factual design rules only**: numeric
  parameters, layout principles, and color roles. Facts of that kind are not
  copyrightable expression. Every sentence in `design-theory.md` is original.
  Do not copy a script or an image from that repository into this one.
- `paper-plot-skills` content is already in this repository from an earlier
  commit. This file records that history; it is not a new decision to copy.

Third-party note: `nature-skills` carries an Apache-2.0 root license, but its
`skills/nature-figure/assets/figures4papers/` directory is excluded from it. That
directory keeps its own `THIRD_PARTY_NOTICES.md`. Do not treat it as licensed.

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
