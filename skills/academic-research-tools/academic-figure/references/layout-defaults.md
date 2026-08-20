# Layout Defaults

Default canvas, y-axis headroom, and type size for **new** figures. This file is
the single source for those numbers. Recipes and checklists point here.

Apply this file in **journal-spec** and after an **advise** hand-off. Do not
apply the canvas or headroom rows to **from-image** mimicry, or to a catalog
style script under `from-data`, unless the user asks for a new figure rather
than a reproduction.

---

## 1. Canvas

Completion: `figsize` (or plotly `width`/`height`) is set, and the ratio matches
the row below unless an exception applies.

| Condition | Width | Height |
| --------- | ----- | ------ |
| Journal card resolved | Card single- or double-column width | `width × 9/16`, then cap at the card max height |
| No card (`chinese-thesis` with no physical size, or journal unset) | `8.0` in | `4.5` in |
| User names a ratio or a size | User value | User value |

`16:9` means `width / height = 16/9` (±0.02). Worked single-column heights:

- IEEE / Nature `3.5` in → `1.97` in
- Elsevier `3.54` in → `1.99` in

**Square families** keep a square panel: correlation heatmap, radar, t-SNE /
UMAP, and any recipe that already uses `figsize=(W, W)`.

**from-image** keeps the source pixel ratio. A catalog script keeps its own
`figsize`.

After SciencePlots `plt.style.use(...)`, set `figure.figsize` again from this
table. The style sheet would otherwise restore a shorter default.

```python
WIDTH = 8.0                       # or the card width in inches
HEIGHT = WIDTH * 9 / 16
fig, ax = plt.subplots(figsize=(WIDTH, HEIGHT), layout="constrained")
```

```python
width_px = round(WIDTH * DPI)
height_px = round(width_px * 9 / 16)
```

---

## 2. Y-axis headroom (line and area)

Completion: on a linear cartesian line or `fill_between` chart, the data does
not touch the top or the bottom of the axes.

- Call `ax.margins(y=0.12)` after the series are drawn. Do not call
  `ax.set_ylim(data_min, data_max)`.
- A log y-axis uses the same `ax.margins(y=0.12)` call (matplotlib applies it
  in display space). Do not add a linear 12% of the raw values onto a log axis.
- **P4 proportions and counts with a natural zero:** keep `ymin = 0` (or the
  stated baseline). Expand only the top: `ymax = vmax * 1.12`.
- A bar chart that starts at zero keeps that baseline. This section does not
  require a gap above the tallest bar.

plotly: set `yaxis.range` to the same padded limits, or raise `rangemode` only
when P4 applies (`tozero`) and then extend the top by 12%.

---

## 3. Type size vs the data rectangle

Completion: labels stay subordinate to the plot box. On a single-panel cartesian
figure, after `layout="constrained"`, the axes window box is at least **0.68** of
the figure width and **0.58** of the figure height.

| Path | Body | Tick / legend |
| ---- | ---- | ------------- |
| Journal card | Card body size (IEEE ~9 pt, Elsevier/Nature ~7 pt) | Card tick size |
| No card | 10–11 pt | Body minus 1 pt |

- Set `axes.labelsize` to the body size. Do not raise it so that Chinese glyphs
  “look larger”. Fix missing CJK glyphs with the font chain in
  `matplotlib-recipes.md`.
- Do not apply the Display (24 pt) or Compact (15–16 pt) tiers in
  `design-theory.md` unless the user asked for a poster or a slide.
- When the plot box is below the fractions above, reduce label and tick sizes.
  Do not enlarge `figsize` in order to keep an oversized font.

---

## 4. Exceptions

| Case | Rule |
| ---- | ---- |
| User sets `figsize`, ratio, or `ylim` | Keep the user value |
| from-image / catalog style script | Match the source figure |
| Square family | Square panel |
| Polar, broken axis, twin y | Follow the family recipe; skip the single-panel fraction check |
| Dual y (P2) | Still intercept P2; do not “fix” it with headroom alone |
