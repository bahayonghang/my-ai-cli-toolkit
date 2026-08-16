# Display-Scale Design Theory

Source: `ChenLiu-1996/figures4papers` (HEAD `6790a93`, 2026-08-06). That
repository ships **no LICENSE file**, so nothing here is copied. Every rule
below is restated in this skill's own wording from the design facts observed in
that repository; no code, text, or image is reused.

**Scope.** These rules describe a house style for poster, slide, and repository
README figures built with matplotlib. A submission figure takes its type sizes,
line widths, DPI, and color mode from the resolved card in `journal-specs.md`,
never from this file. Read this file when the deliverable is a display-scale
figure, or when you need the reasoning behind a semantic color role.

---

## Two-tier type and line system

| Tier    | Use                                                | Base font | Axes line width |
| ------- | -------------------------------------------------- | --------- | --------------- |
| Display | large bar and comparison panels on posters, slides | 24 pt     | 3               |
| Compact | analytic subfigures inside a document              | 15–16 pt  | 2               |

- Use one tier per figure. Do not mix the two.
- Both tiers hide the top and right spines and use frameless legends.
- **Journal exception.** The journal cards put body text between 5 and 10 pt.
  The display tier is three to five times that size, so it never applies to a
  submission figure.
- Declare a font fallback stack, because Helvetica is absent on most Windows and
  Linux systems: `["Arial", "Helvetica", "DejaVu Sans"]` in `font.sans-serif`.
- Turn on `text.usetex` only when the labels need real math and a LaTeX
  installation is present. `svg.fonttype = "none"` keeps SVG text editable.

```python
DISPLAY_SCALE = {              # posters and slides only, never a journal figure
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"],
    "font.size": 24,           # 15-16 for the compact tier
    "axes.linewidth": 3,       # 2 for the compact tier
    "axes.spines.top": False,
    "axes.spines.right": False,
    "legend.frameon": False,
    "svg.fonttype": "none",
}
```

## Semantic color roles

| Role                | Hue family   | Meaning                            |
| ------------------- | ------------ | ---------------------------------- |
| Proposed method     | blue         | the method the paper introduces    |
| Improvement         | green        | positive variants, ablation gains  |
| Baseline / contrast | red or pink  | prior methods and alternatives     |
| Background category | neutral gray | context series that carry no claim |
| Single callout      | gold accent  | one highlighted value per figure   |

- Fix the role map once per paper and reuse it in every figure, so the reader
  learns the code once.
- Vary lightness inside one hue for the members of a role. Do not give each
  category an unrelated saturated hue.
- **Accessibility conflict.** A red-against-green pair is the classic
  color-vision-deficiency failure, and IEEE and Nature both ask you to avoid it.
  For a submission figure, keep the role structure but map the roles onto the
  colorblind-safe palette in `matplotlib-recipes.md`, and add a second channel
  (marker shape, hatch, or a direct label). The roles then survive grayscale.
- When the categorical palette already uses green and red for identity, reserve
  green and red markers for direction (gain and loss) only.

## Bar encoding at display scale

- Print the value above or inside each bar, so the reader gets exact numbers
  without a grid.
- Set the tick positions explicitly instead of leaving them to the locator.
- Give bars black edges at line width 1.5–3, so neighbors separate in print.
- Encode an ordered ablation as one hue with rising alpha, 0.2 to 1.0.
- Add a hatch when two bars share one hue. See `panel-layout-patterns.md` for
  the layout side of these figures.

## Trend and scatter encoding

- Keep 2–4 primary curves per axes; more curves need small multiples.
- Use line width 2–3 with controlled alpha, and keep the grid minimal or absent.
- Use `fill_between` for uncertainty, and state in the legend what the band is.
- Conceptual scenes lower the alpha of dense geometry and drop the ticks; a
  saturated warm accent plus arrows then carries the reading path.

## Export contract

One call should write every format the deliverable needs. Whatever helper you
write, hold this contract:

- Accept a base path without an extension plus a format list, and write every
  format from the same figure object.
- Create the parent directories.
- Restrict formats to a whitelist — pdf, svg, eps, png, jpg, jpeg, tif, tiff —
  and fail on anything else.
- Return the written paths, so the caller can log or check them.
- Default the raster DPI to 300, and raise it to 600 for dense bar panels.
- Run the layout pass once before saving: padded `tight_layout` for display
  figures, with a smaller pad for compact multi-panel figures.
- Select a non-interactive backend (`matplotlib.use("Agg")`) before the pyplot
  import in batch runs.
- Write outputs under a `figures/` directory with stable base names.

For a submission figure, the format list, DPI, and color mode come from the
resolved journal card, and the export rows in `qa-checklist.md` are the gate.
