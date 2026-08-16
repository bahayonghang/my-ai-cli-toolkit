# Visualization Pitfalls

Intercept the request before you draw. When a request matches a row below, do
not silently comply and do not silently refuse.

Adapted from the `viz_pitfalls` reference of scipilot-figure-skill
(`Haojae/scipilot-figure-skill`, MIT, reviewed 2026-08-16). Rows M1–M7 are
adapted from the misleading-encoding chapter of the `scientific-visualization`
skill in `K-Dense-AI/claude-scientific-skills` (MIT, reviewed 2026-08-16); they
carry only the items that P1–P18 do not already state.

## Interception protocol

1. Name the matched row by its identifier.
2. Give the reviewer's view in one sentence.
3. Give one executable replacement.
4. Ask whether the user keeps the original plan. Follow the final answer, and
   keep the record of the advice.

Template:

> A mean bar chart for three groups of five samples matches P1: a bar hides the
> distribution and the sample size, so a reviewer cannot judge the evidence. Use
> a box plot with an overlaid strip plot — five points stay visible. Do you want
> the mean bar chart anyway?

## Semantic layer (P1–P18)

| ID  | Do not                                            | Reviewer's view                                                                               | Do this instead                                                                                                                |
| --- | ------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| P1  | Mean-only bar chart                               | n = 3 and n = 300 draw the same bar; a bimodal or skewed shape disappears                     | Box plot or violin with an overlaid strip plot; below n = 10 plot the raw points only                                          |
| P2  | Dual y axis                                       | Each axis range is free, so the apparent match or divergence is an authoring choice           | Share one axis, plot the two variables against each other, or stack two panels on a shared x axis                              |
| P3  | Pie chart or any 3D chart                         | People read length about three times better than angle; perspective distorts values           | Value-sorted horizontal bar; stacked bar for parts of a total; 2D heat map or contour for a third dimension                    |
| P4  | Truncated y axis                                  | A 2% rise reads as a doubling                                                                 | Start proportions at zero or a stated baseline; use a log axis across orders of magnitude; draw and declare a break            |
| P5  | Continuous color without a colorbar               | The reader cannot map a shade to a value, and shades differ between figures                   | Add a colorbar with variable name and unit; lock `vmin`/`vmax` across compared figures                                         |
| P6  | Line through categorical points                   | A line claims a continuous relation between categories                                        | Bar, box, or dot plot; for ordered discrete levels a thin guide line needs a caption note                                      |
| P7  | More than about seven colors                      | The reader cannot hold the mapping, and a color that changes between figures forces a re-read | Up to five colors plus a redundant channel; direct labels for 6–12 series; one shared palette for the manuscript               |
| P8  | Missing or unreadable legend                      | Internal names such as `Series1` carry no meaning                                             | Human-readable labels; put the legend in empty space or outside the axes; `frameon=False`                                      |
| P9  | Undeclared error type                             | SD, SEM, and CI differ by a factor of √n or more, and the conclusion can invert               | State center, spread type, n, test, correction, and symbol meaning in the caption                                              |
| P10 | Chartjunk                                         | Dense gridlines, gradients, and shadows bury the data                                         | Light or no grid, despine, one color per data class, simple markers                                                            |
| P11 | Resolution or format below spec                   | JPEG artefacts, 72 dpi screenshots, and Type 3 fonts fail at production                       | Vector for data charts, ≥300 dpi raster for photographs, `pdf.fonttype=42`; see `qa-checklist.md`                              |
| P12 | Several claims in one figure                      | Several claims read as no claim                                                               | One figure, one conclusion; panels under one figure number cover facets of one theme                                           |
| P13 | Red and green as the only encoding                | About 8% of men have a color-vision deficiency and see two identical gray lines               | Okabe-Ito or the seaborn `colorblind` palette, plus line style or marker; check a grayscale preview                            |
| P14 | `rainbow` / `jet` / `hsv` colormap                | The maps are perceptually non-uniform, and the yellow band creates a false peak               | `viridis` / `magma` / `cividis` for one-directional data; `RdBu_r` / `PiYG` with a declared center for diverging data          |
| P15 | Significance stars on every pair                  | Small-sample significance is often noise, and uncorrected comparisons flag p-hacking          | Annotate only the comparisons the claim needs; state test and correction; report an effect size                                |
| P16 | Missing glyphs: CJK text, minus sign, Greek       | matplotlib only warns and still writes the file, so boxes appear after export                 | Set the CJK font chain and `axes.unicode_minus = False` (`matplotlib-recipes.md`); the layout audit fails on any missing glyph |
| P17 | Clipped text, or a legend over the data           | A clipped label removes information; a legend over data hides data                            | Build with `layout="constrained"`; move the legend outside the axes or direct-label; rotate long tick labels                   |
| P18 | Panel labels placed in each axes' own coordinates | Labels do not line up, and mixed `a` and `(a)` reads as careless                              | Anchor every label at the axes-fraction (0, 1) corner and apply one shared point offset (`panel-layout-patterns.md`)           |

## Misleading encoding (M1–M7)

| ID  | Do not                                                              | Do this instead                                                                                                                                                                                |
| --- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1  | Show missing, censored, or excluded values as zero, or bridge a gap | Keep the three cases distinct; break the line at a gap; give a legend entry or a neutral `bad` color; record exclusions in caption and methods                                                 |
| M2  | Scale a magnitude by radius or diameter                             | Scale area or volume to the value; prefer position on a common scale (P3 covers the 3D case)                                                                                                   |
| M3  | Transform a scale without disclosure                                | Label the scale and base; declare the policy for zero and negative values; read equal distances as ratios; for signed data use a symmetric log or two-slope norm with a declared linear region |
| M4  | Choose bins or smoothing after seeing the result                    | Record bin edges, the inclusion rule, and the bandwidth or window; show sensitivity to reasonable choices; do not let interpolation imply unmeasured observations                              |
| M5  | Change normalization or color limits between compared panels        | State the formula and reference; fit normalization on the correct data partition; hold the limits common, or make the difference unmistakable                                                  |
| M6  | Adjust part of an image                                             | Apply brightness, contrast, and color to the whole image; never erase, clone, or enhance a feature; mark splices and composites; use a calibrated scale bar                                    |
| M7  | Deliver a figure with no provenance                                 | Keep three layers: raw data, the transformation record (filters, normalization, seeds), and the export manifest                                                                                |

## Where the other layers catch the rest

- Form layer: size, DPI, format, font embedding, and the export checks live in
  `qa-checklist.md`.
- Render layer: P16–P18 appear only after the figure is rendered. The loop in
  `visual-review.md` catches them before export, not after submission.
