# Panel Layout Patterns

Layout patterns for multi-panel figures, journal- and library-agnostic. Apply
them on top of any family in `chart-recipes.md`, whose "Cross-cutting layout
patterns" section holds the core set; this file adds only the rest.

Adapted from nature-figure's `common-patterns.md` (`Yuan1z0825/nature-skills`,
skill `nature-figure`, Apache-2.0, reviewed 2026-08-16), without the upstream
poster-scale numbers. The wide-canvas ratio and the hidden-tick rule restate
design facts observed in `ChenLiu-1996/figures4papers` (HEAD `6790a93`, no
LICENSE — rules only, rewritten, no copied code). The panel-label recipe follows
the anchor-plus-offset mechanism in scipilot-figure-skill's `layout_tools.py`
(MIT, `Haojae/scipilot-figure-skill`); the code below is original.

> **Scale warning.** These patterns come from poster- and slide-scale figures.
> Keep the ratios and the structure; take every absolute size from the resolved
> card in `journal-specs.md`. See `design-theory.md` for the display-scale limit.

---

## Wide multi-metric row

Put one metric per panel in a single row and make the canvas about 3–4× wider
than high, so the reader scans the metrics left to right. Combine it with a
legend-only cell. At journal width this fits the double-column card only; when
it does not fit, split the metrics over two rows rather than shrink the font
below the card minimum.

- Hide the x-tick text when the legend or the panel title already names every
  method: `ax.set_xticks([])` drops ticks and labels, `ax.set_xticklabels([])`
  keeps the tick marks. Keep the labels when the x axis is the only place that
  carries the category names.

## Grouped bars inside grouped datasets

Two nesting levels (methods inside datasets) need manual x positions and one
legend entry per method:

```python
n_methods = len(methods)
tick_pos = []
for i, dataset in enumerate(datasets):
    x0 = i * (n_methods + 1)                       # one bar-width gap per group
    ax.bar(np.arange(n_methods) + x0, values[dataset], color=method_colors,
           label=methods if i == 0 else ["_nolegend_"] * n_methods)
    tick_pos.append(x0 + (n_methods - 1) / 2)
ax.set_xticks(tick_pos); ax.set_xticklabels(datasets)
```

## Hatched fill-between for grayscale

A filled band survives grayscale print when it carries a hatch. The hatch draws
a border artifact, so erase it with a second transparent pass:

```python
ax.fill_between(x, 0, y, color=fill_color, hatch="///", edgecolor="black", label=name)
ax.fill_between(x, 0, y, facecolor="none", edgecolor="white", linewidth=2)
```

## Event annotations on a trend line

Anchor each annotation on its data point and offset the text by a fraction of
the y range, so neighboring events stack instead of collide:

```python
dy = 0.1 * (ax.get_ylim()[1] - ax.get_ylim()[0])   # rank stacks nearby events
for i, label, rank in events:
    ax.annotate(label, xy=(i, y[i]), xytext=(i, y[i] + (1 + 0.8 * rank) * dy),
                ha="center", va="bottom", arrowprops=dict(arrowstyle="-|>", lw=1.0,
                color="black", shrinkA=0, shrinkB=0, mutation_scale=8))
```

## Asymmetric hero panel that spans cells

Use this when one panel is conceptually central but does not belong on its own
row. The hero spans rows or columns inside a mixed grid. Do not give every panel
equal area when the evidence is not equally important.

```python
gs = fig.add_gridspec(3, 4, hspace=0.25, wspace=0.28)
ax_a = fig.add_subplot(gs[0, :2]); ax_b = fig.add_subplot(gs[0, 2])
ax_c = fig.add_subplot(gs[1, :2]); ax_d = fig.add_subplot(gs[1, 2])
ax_hero = fig.add_subplot(gs[:, 3])                # spans all three rows
```

## Dark image plate

For microscopy, volume rendering, or fluorescence grids, use a tight grid of
axes with black faces, no ticks, and no spines. Keep black inside the plate
cells only, put channel labels, scale bars, and crop guides on the plate, and
hold crop geometry and scale-bar position identical across the grid.

```python
gs = fig.add_gridspec(3, 5, hspace=0.08, wspace=0.04)
for i in range(15):
    ax = fig.add_subplot(gs[i // 5, i % 5])
    ax.set_facecolor("black"); ax.set_xticks([]); ax.set_yticks([])
    for spine in ax.spines.values():
        spine.set_visible(False)
```

## Two more structures

- **Parallel-column triptych.** For outcome-over-time figures, give each column
  one subject and each row one evidence type (trajectory, effect size, summary
  proportion). Add one shared legend strip above the first row, and mark the
  null value in the effect-size row with a dashed reference line.
- **Direct labels inside filled regions.** For stacked areas and phase diagrams,
  write the category name in a stable, large part of its own region instead of
  building a large legend. Add a thin white or black stroke when the fill varies.

## Aligned panel labels

Panel labels drift when each axes has a different tick-label width. Anchor every
label at the top-left corner of its axes in axes-fraction space, then apply one
common offset in points:

```python
import string

def add_panel_labels(fig, axes=None, template="{}", dx_pt=-18.0, dy_pt=2.0,
                     fontsize=8, fontweight="bold"):
    """Label panels a, b, c ... on one horizontal and one vertical line."""
    if axes is None:
        axes = [ax for ax in fig.axes if ax.get_subplotspec() is not None]
        axes.sort(key=lambda ax: (-ax.get_position().y1, ax.get_position().x0))
    return [ax.annotate(template.format(letter), xy=(0, 1), xycoords="axes fraction",
                        xytext=(dx_pt, dy_pt), textcoords="offset points",
                        ha="right", va="bottom",
                        fontsize=fontsize, fontweight=fontweight)
            for ax, letter in zip(axes, string.ascii_lowercase)]
```

- Panels in one column share a left edge and panels in one row share a top edge,
  so one shared offset in points puts every label on a line, whatever the panel
  size. Axes without a subplotspec (colorbars, insets) are skipped.
- Call it after the layout engine has run (`fig.canvas.draw()`, or after
  `tight_layout()`); otherwise the sort reads stale positions.
- Case and brackets follow the journal: Nature uses lowercase bold at 8 pt
  (`template="{}"`), IEEE and Elsevier commonly use `(a)` (`template="({})"`).
