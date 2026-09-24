# Mode: from-image

Select the authoritative `from-image` output contract in `SKILL.md`, then
analyze the image and use the accumulated style knowledge.

## Reference first

1. **Get a reference before you write the final plotting code.** Do not draw
   first and look for a model afterward.
2. **When a source script or a style template exists, read that source. Do not
   infer from the screenshot alone.** A preview image does not show the rcParams,
   the tick direction, the spine width, or the export settings. Two figures that
   look alike on screen can differ at final print size.
3. **When no reference fits, say so and analyze from scratch** (step 3 below). Do
   not force a template that answers a different question.

How much of a matched template you may keep is set by the four levels in
`from-data.md#template-reuse-ladder`.

> Rules 1 and 2 follow `Dsadd4/AgentFigureGallery` (MIT). That tool can also
> supply references from a local library, with a human selection step; see
> `../agent-figure-gallery-integration.md` and `../attribution.md`.

## Workflow

### 1. Measure proportions

```python
python -c "from PIL import Image; img=Image.open('fig.png'); print(img.size, f'AR={img.size[0]/img.size[1]:.2f}')"
```

Set `figsize=(FW, FH)` so `FW/FH` matches the original AR exactly.

### 2. Match to existing style

First read the style-to-script catalog in `from-data.md`. If the image matches
one of those entries, read `../styles/<name>.md` for exact parameters and adapt
`<skill-dir>/scripts/<script>.py`. Compare against the source figures in
`<skill-dir>/assets/originals/` to confirm the visual match. Runtime dependencies
and LaTeX caveats are recorded in `from-data.md#runtime-dependencies`.

figures4papers match table. The originals are under
`<skill-dir>/assets/originals/figures4papers/`, resized to a long edge of at most 1800 px;
the style documents list the exact files.

| Visual cues in the uploaded image                                                             | Style family                  |
| --------------------------------------------------------------------------------------------- | ----------------------------- |
| 100% stacked bars, hatch per layer, gold values with a black outline, separate hatch legend   | `f4p_bar_stacked_composition` |
| One plain bar panel per category, hidden x ticks, legend in its own panel, ↓/↑ in titles      | `f4p_bar_panel_legend`        |
| Mean bars with error caps, value text above the caps, dark-blue proposed method, light others | `f4p_bar_mean_std`            |
| Bars grouped by dataset with a one-bar gap, scientific-notation y ticks                       | `f4p_bar_grouped_datasets`    |
| Dashed full-model baseline with red drop arrows, or horizontal bars in one blue alpha ramp    | `f4p_bar_ablation`            |
| Heat map colored per column with a summary row, or a count heat map with `(n=…)` tick labels  | `f4p_heatmap_annotated`       |
| Hyperparameter sweep panels, faded dashed reference line, one panel with a twin y axis        | `f4p_line_sweep`              |
| Line whose segments grow more opaque along the x axis                                         | `f4p_line_alpha_graded`       |
| Radar with polygon grid and tick values printed on every spoke, different range per benchmark | `f4p_radar_multirange`        |
| Overlapping Gaussian curves with a gap arrow; KDE contour clouds along curved paths           | `f4p_concept_density`         |
| Shaded spheres with points, great-circle arrows, a 3D panel with arrows                       | `f4p_sphere_illustration`     |
| 3D surface with a smooth colormap, optionally gray hole patches                               | `f4p_surface_landscape`       |
| Red transition-matrix heat map beside a point cloud with probability-weighted edges           | `f4p_graph_diffusion`         |
| Two stacked cumulative-area panels over months, hatched areas, event labels with arrows       | `f4p_trend_month_events`      |

### 3. If no match → analyze from scratch

Read `../reproduction_guide.md` for the full analysis checklist covering:

- Font family detection (serif vs sans-serif, LaTeX vs not)
- Spine & tick style (L-shape, 4-sided, arrows, in/out direction)
- Color identification (tab10 vs custom)
- Grid style (dashed, dotted, none)
- Special elements (insets, broken axes, radar grids, annotation boxes)

`<skill-dir>/scripts/classwise_iou_table.py` is a worked from-scratch example
(a pure-table results figure built directly from an uploaded screenshot).

### 4. Build & iterate

```
Write script → python "<skill-dir>/scripts/<script>.py" [out.png] → visually compare → fix proportions/colors → re-run
```

Key iteration checklist:

- [ ] AR matches original (measure with PIL)
- [ ] Font family correct (serif for LaTeX papers, sans-serif for system fonts)
- [ ] Colors within ±10 RGB of original
- [ ] Spine style matches (L vs 4-sided)
- [ ] Tick direction matches (in vs out)
- [ ] Grid style matches
- [ ] Legend placement matches
- [ ] Annotations/labels position matches

## Accumulated experience

From the 10 source figures in `<skill-dir>/assets/originals/` — nine figures from
eight named papers, plus one user screenshot — key lessons:

- **Smooth training curves**: use EMA with `alpha=0.95-0.97` before plotting, not raw noisy data
- **Radar labels**: `label_r = 1.10-1.15` (NOT 1.2+, which creates excess whitespace)
- **Inset figures**: measure left/right panel pixel ratio from original → set `add_axes` widths accordingly
- **Broken axis**: use two subplots with `wspace=0.05`, break symbol only at bottom spine
- **t-SNE annotation boxes**: unified dark edge color `#2C3E50`, cluster-color facecolor with `alpha=0.28`
- **Confidence bands**: `fill_between` with `alpha=0.18-0.22`, same color as line

## Resources

- **Analysis guide**: `../reproduction_guide.md` — step-by-step checklist for new images
- **Style library**: `../styles/` — 8 pre-built style parameter files plus 14
  figures4papers families (`f4p_*.md`)
- **Script templates**: `<skill-dir>/scripts/` — 8 working style scripts + `classwise_iou_table.py`;
  `<skill-dir>/scripts/figures4papers/` — 24 ported scripts + `raw_data.py`
- **Originals**: `<skill-dir>/assets/originals/` — paper figures used in development;
  `<skill-dir>/assets/originals/figures4papers/` — 29 figures4papers outputs
- **External reference library**: `../agent-figure-gallery-integration.md` — optional,
  only when AgentFigureGallery is already installed
