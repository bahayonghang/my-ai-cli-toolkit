# Display-Scale Design Theory

Source: `ChenLiu-1996/figures4papers` (snapshot `3c181f8`, 2026-09-06),
licensed CC BY-NC 4.0. Every rule below restates, in this skill's own wording,
a design fact observed in the figure scripts of that repository. A path in
brackets, such as `[CellSpliceNet/plot_ablation.py:76]`, names the upstream
script that shows the fact. The license terms and the port decision are in
`attribution.md`.

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

Upstream counts: 24 pt with line width 3 in 14 scripts; 15–16 pt with line
width 2 in 4 scripts (for example `[RNAGenScape/plot_sweep.py:30]`).

- Use one tier per figure. Do not mix the two.
- Both tiers hide the top and right spines and use frameless legends.
- **Journal exception.** The journal cards put body text between 5 and 10 pt.
  The display tier is three to five times that size, so it never applies to a
  submission figure. A generic paper figure with no card uses 10–11 pt
  (`layout-defaults.md`). Do not apply Display 24 pt or Compact 15–16 pt unless
  the user asked for a poster or a slide.
- Declare a font fallback stack, because Helvetica is absent on most Windows and
  Linux systems: `["Arial", "Helvetica", "DejaVu Sans"]` in `font.sans-serif`.
  Upstream sets `font.family = 'helvetica'` with no fallback in 19 scripts; the
  fallback stack is this skill's addition.
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
- When a panel shows a fixed range, such as 0 to 1, pass an explicit tick list
  with `ax.set_yticks([...])` (`[CellSpliceNet/plot_ablation.py:76]`,
  `[VIGIL/plot_ablation.py:73]`). Other panels keep the default locator.
- Black bar edges (line width 2–3) occur in 2 of the 12 upstream bar scripts,
  and both of them also use a hatch (`[Brainteaser/plot_brute_force.py:126]`,
  `[Brainteaser/plot_rewriting.py]`). Add black edges when bars carry a hatch;
  they are not a general rule.
- Encode an ordered ablation as one hue with rising alpha, 0.2 to 1.0
  (`[ImmunoStruct/plot_bars.py:80]`).
- Add a hatch when two bars share one hue (`[Brainteaser/plot_brute_force.py:24]`).
  See `panel-layout-patterns.md` for the layout side of these figures.

## Trend and scatter encoding

- Keep 2–4 primary curves per axes; more curves need small multiples.
- Use line width 2–3 with controlled alpha, and keep the grid minimal or absent
  (`[RNAGenScape/plot_sweep.py:52-65]`, `[VIGIL/plot_ablation.py:64-66]`).
- Upstream uses `fill_between` for filled density curves and cumulative areas
  (`[VIGIL/plot_concept.py:59-63]`, `[ophthal_review/plot_trend.py:89-110]`),
  not for uncertainty bands. For an uncertainty band, follow the uncertainty
  rules in `qa-checklist.md`.
- Conceptual scenes lower the alpha of dense geometry and drop the ticks; a
  saturated warm accent plus arrows then carries the reading path.

## Export contract

One call should write every format the deliverable needs. The upstream scripts
call `savefig` once per format; the helper contract below is this skill's own.
Whatever helper you write, hold this contract:

- Accept a base path without an extension plus a format list, and write every
  format from the same figure object.
- Create the parent directories.
- Restrict formats to a whitelist — pdf, svg, eps, png, jpg, jpeg, tif, tiff —
  and fail on anything else.
- Return the written paths, so the caller can log or check them.
- Default the raster DPI to 300, and raise it to 600 for dense bar panels.
  Upstream uses dpi 300 in 27 of 32 save calls and dpi 600 for the dense
  ImmunoStruct bars (`[ImmunoStruct/plot_bars.py:70]`).
- Run the layout pass once before saving. A display figure uses
  `tight_layout(pad=2)` (23 of 27 upstream calls); a compact multi-panel
  figure can use a smaller pad. A journal figure uses `layout="constrained"`
  instead (`matplotlib-recipes.md`).
- Select a non-interactive backend (`matplotlib.use("Agg")`) before the pyplot
  import in batch runs. Upstream scripts do not do this; it is this skill's rule.
- Write outputs under a `figures/` directory with stable base names.

For a submission figure, the format list, DPI, and color mode come from the
resolved journal card, and the export rows in `qa-checklist.md` are the gate.
