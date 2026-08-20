# Visual Review Loop

A figure that no one looks at ships with boxes for CJK glyphs, clipped labels, a
legend over the data, and misaligned panel labels. Close the loop before export,
not after review.

```text
draw -> 1 render a PNG preview -> 2 machine audit -> 3 agent reads the PNG
                                                        |
        5 pass  <-  4 fix at the source, render again  <-+
```

Adapted from the `visual_review` reference of scipilot-figure-skill
(`Haojae/scipilot-figure-skill`, MIT, reviewed 2026-08-16). The bundled
`scripts/visual_qa.py` is a port of the same project's script; the fix actions
below point to this skill's own references.

## Why a raster preview

A vector PDF or SVG does not show pixel-level overlap, so rasterize first. The
machine layer finds deterministic defects, the agent finds perceptual defects,
and both layers must pass.

| Layer         | Tool                                 | Finds                                                                                       |
| ------------- | ------------------------------------ | ------------------------------------------------------------------------------------------- |
| Machine audit | `scripts/visual_qa.py::audit_layout` | Missing glyphs, clipped text, overlapping tick labels, y-axis headroom, plot-box fraction   |
| Agent review  | The checklist below, read the PNG    | Legend over data, annotation overlap, panel-label alignment, color and grayscale separation |

## Step 1 — render the preview

```python
import sys
sys.path.insert(0, r"<skill-dir>/scripts")
from visual_qa import render_preview, audit_layout, print_report

preview = render_preview(fig, "figs/_preview.png", dpi=150)   # before export
```

Use 150 dpi, and render **before** the vector export while a fix is cheap.

## Step 2 — machine audit

```python
print_report(audit_layout(fig))
```

A `FAIL` (almost always a missing glyph) must be fixed first. Record each `WARN`
and confirm it in step 3. To see the audit on a deliberately bad layout, run
`python "<skill-dir>/scripts/visual_qa.py" demo`.

## Step 3 — read the preview

Open the PNG with the Read tool and check the ten items one by one. Do not
scan the image and call it good.

1. **Glyphs.** Boxes instead of CJK characters, minus signs, `±`, `×`, `μ`, `Δ`,
   Greek letters, superscripts, or subscripts.
2. **Clipped text.** A title, axis label, legend, or value label cut by the
   canvas edge, including the bottom of rotated tick labels.
3. **Overlap.** A legend over points, lines, or bars; annotations over each
   other; tick labels that collide.
4. **Panel labels.** The labels line up in a row and in a column, at one size,
   one weight, and one style — no mix of `a` and `(a)`.
5. **Panel spacing.** No panel overlaps a neighbour; no y-axis label reaches
   into the panel on its left; the colorbar touches no data.
6. **Color.** Every category is separable, red and green are not the only cue,
   and the grayscale preview stays separable.
7. **Data completeness.** No point, curve, error-bar cap, or bar top is cut by
   the axis limits.
8. **Cross-panel consistency.** One variable keeps one color, one marker, and
   one unit; axes that invite comparison share their range.
9. **Axis headroom.** On a linear cartesian line or area chart, the series does
   not touch the top or bottom of the axes. Apply `layout-defaults.md`.
10. **Data over chrome.** Axis labels and tick labels stay smaller than the data
    rectangle. The plot box occupies most of the canvas (`layout-defaults.md`).

## Step 4 — fix at the source

Never retouch the preview image.

| Finding                         | Fix                                                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Missing glyphs                  | Set the CJK font chain and `axes.unicode_minus = False` (`matplotlib-recipes.md`)                            |
| Clipped text                    | Build with `layout="constrained"`; shorten or wrap the text; `bbox_inches="tight"` changes the physical size |
| Legend over data                | `ax.legend(loc="upper left", bbox_to_anchor=(1.02, 1.0), frameon=False)`, or direct-label the series         |
| Annotations overlap             | Change the `xytext` offset, or annotate fewer items                                                          |
| Tick labels collide             | `ax.tick_params(axis="x", rotation=30)`, fewer ticks, or shorter labels                                      |
| Panel labels misaligned         | Anchor at the axes-fraction (0, 1) corner with one shared point offset (`panel-layout-patterns.md`)          |
| Panels overlap                  | `layout="constrained"` at figure creation                                                                    |
| Colors not separable            | Okabe-Ito or the seaborn `colorblind` palette, plus line style or marker (`matplotlib-recipes.md`)           |
| Data clipped by the axis limits | Widen `set_xlim` / `set_ylim`, or apply the headroom in `layout-defaults.md`                                 |
| Curve kisses the y limits       | `ax.margins(y=0.12)` (`layout-defaults.md`); do not set `ylim` to the data min and max                       |
| Labels crowd out the plot       | Reduce label and tick sizes; do not apply Display-scale 24 pt fonts on a paper figure (`layout-defaults.md`) |

## Step 5 — render again and re-read

Go back to step 1 after every fix. Stop when the machine audit reports no `FAIL`
and the ten items pass, or when the user accepts a remaining item.

## Loop discipline

- Re-render after each change. An unrendered fix is an unverified fix.
- Three rounds is the limit. If round three still fails, the chart type is wrong
  (return to `chart-selection.md`) or the figure holds too many dimensions
  (split it — see P12 in `viz-pitfalls.md`).
- Tell the user what each round found and what changed.
