# plotly (+ kaleido) Recipes

The plotly branch of the **library axis** (SKILL.md step 3). Reach for plotly when
the deliverable is interactive/web output; for a static print figure, matplotlib
is the default. Static export (png/pdf/svg) goes through the **Kaleido** engine.

Every technical claim here is grounded in this task's research report
`research/journal-specs-and-tooling.md` (plotly/kaleido §4.4, CJK §5); source URLs
are at the bottom. Font family/size come from `journal-specs.md`; anything the
research did not establish (notably plotly's pixel→physical-inch mapping for
vector export) is marked `[missing evidence]` — do not invent it.

---

## Journalized layout template

Build the layout from spec-card values: journal font family + size, a
colorblind-safe `colorway`, and pixel `width`/`height` sized from the column
width (see the sizing section). Nature/Elsevier read cleanest with a minimal,
borderless axis (bottom + left line only); this axis styling is standard plotly
layout config, not a journal-mandated spec.

```python
import plotly.graph_objects as go

# Colorblind-safe categorical default (Okabe-Ito) — see palette section.
OKABE_ITO = ["#E69F00", "#56B4E9", "#009E73", "#F0E442",
             "#0072B2", "#D55E00", "#CC79A7", "#000000"]

# Journal font family + size from journal-specs.md spec cards.
_JOURNAL_FONT = {
    "ieee":     dict(family="Times New Roman, Times, serif", size=9),  # IEEE Times ~9-10 pt
    "elsevier": dict(family="Arial, Helvetica, sans-serif",  size=7),  # Elsevier allowed set, 7 pt
    "nature":   dict(family="Helvetica, Arial, sans-serif",  size=7),  # Nature sans, 5-7 pt
}


def build_journal_layout(journal, width_px, height_px):
    """Return a plotly layout dict carrying journal font, size, colorway, and a
    minimal borderless axis. width_px/height_px come from mm->px sizing below."""
    minimal_axis = dict(showline=True, linecolor="black", linewidth=1,
                        mirror=False, ticks="outside", showgrid=False, zeroline=False)
    return go.Layout(
        font=_JOURNAL_FONT[journal],
        colorway=OKABE_ITO,
        width=width_px, height=height_px,
        margin=dict(l=50, r=15, t=15, b=45),   # tight margins; tune per figure
        paper_bgcolor="white", plot_bgcolor="white",
        xaxis=minimal_axis, yaxis=minimal_axis,
    )
```

---

## Sizing: mm → pixels

plotly `width`/`height` are in **pixels**. For a **raster** target (png) at a
chosen DPI, pixels follow standard arithmetic from the spec-card column width:

```
px = width_mm / 25.4 * dpi          # == width_inches * dpi
```

Representative raster pixel widths, computed from the `journal-specs.md` widths at
their raster DPI (single / double column):

| Journal  | Column widths    | Raster DPI         | px width (single / double) |
| -------- | ---------------- | ------------------ | -------------------------- |
| IEEE     | 3.5 in / 7.16 in | 300 (color)        | 1050 / 2148                |
| IEEE     | 3.5 in / 7.16 in | 600 (B/W line art) | 2100 / 4296                |
| Elsevier | 90 mm / 190 mm   | 300 (halftone)     | ~1063 / ~2244              |
| Elsevier | 90 mm / 190 mm   | 1000 (line art)    | ~3543 / ~7480              |
| Nature   | 89 mm / 183 mm   | 300 (photo)        | ~1051 / ~2161              |

```python
def mm_to_px(width_mm, dpi):
    return round(width_mm / 25.4 * dpi)
```

Set `width`/`height` to these pixel values and export with `scale=1`.

> **Vector export (pdf/svg) caveat — [missing evidence].** The research did not
> establish how plotly maps layout pixels to physical inches for vector output.
> The common browser model is 96 CSS px per inch (so 3.5 in ≈ 336 px), but this
> is not confirmed in the report — after exporting a PDF/SVG, open it and verify
> the physical size in a PDF reader before trusting the dimensions.

---

## Static export matrix (Kaleido)

`fig.write_image(...)` (or `plotly.io.write_image`) renders via Kaleido.

| Format     | Supported            | Notes                                                        |
| ---------- | -------------------- | ------------------------------------------------------------ |
| png        | yes                  | raster; `scale` multiplies resolution                        |
| jpg / jpeg | yes                  | raster                                                       |
| webp       | yes                  | raster                                                       |
| svg        | yes                  | vector, editable                                             |
| pdf        | yes                  | vector                                                       |
| **eps**    | **no in Kaleido v1** | `format="eps"` raises `ValueError`; removed — see workaround |

```python
fig.write_image("figure.png", scale=2)   # raster; scale=2 doubles pixel resolution
fig.write_image("figure.pdf")            # vector
fig.write_image("figure.svg")            # vector, editable
```

**EPS for IEEE/Elsevier.** Kaleido **v1 dropped EPS support** (`format="eps"`
raises `ValueError` pointing to SVG/PDF). Only Kaleido `< 1.0.0` supports EPS (and
it needs the `poppler` library). Two paths when a journal requires EPS:

1. Export **PDF or SVG** from plotly, then convert to EPS with an external tool.
2. Pin **Kaleido `< 1.0`** (v0) to export EPS directly (note Orca and Kaleido v0
   are unsupported after 2025-09).

Kaleido v1 requires plotly ≥ 6.1.1.

**Kaleido v1 needs a browser.** Version 1 no longer bundles Chrome, so static
export needs a compatible Chrome/Chromium installation on the machine. Treat a
missing browser as a blocker and report it instead of falling back to a raster
screenshot. (Cross-checked 2026-08-16 against the K-Dense
scientific-visualization snapshot dated 2026-07-23 for Kaleido 1.3.0, which
cites the plotly static-export page and the Kaleido repository below.)

### Known gotchas

**`scale` is not a DPI setting.** `width` and `height` are logical pixels and
`scale` multiplies the exported pixel count, so `scale=3` does not declare
"300 DPI". For a journal raster target, size the layout from the card width and
DPI (see the sizing section) and export with `scale=1`; state the DPI from that
arithmetic, not from `scale`. (Same 2026-07-23 snapshot cross-check as above.)

**`scale` does not help raster inside vector.** `scale` raises resolution for
raster output, but for raster **embedded in a vector export** it does _not_
increase that raster's resolution (Kaleido issue #58).

**Default width/height override.** `plotly.io.defaults.default_width` /
`default_height` can override your `layout` size so `write_image` ignores the
expected dimensions. Fix by setting both to `None` (Kaleido issue #378):

```python
import plotly.io as pio

pio.defaults.default_width = None
pio.defaults.default_height = None
```

---

## CJK (Chinese) text

```python
fig.update_layout(font=dict(family="Microsoft YaHei"))   # or "SimHei" / "Noto Sans CJK SC"
# axes/legend fonts can be set separately via their own `font` props
```

- For **Kaleido static export** (PDF/SVG), the render process must be able to find
  the CJK font, or the exported static image will still miss glyphs. Use a
  **system-installed, clearly named** font (e.g. Noto Sans CJK).
- `[missing evidence]` — the research found **no official plotly CJK page**; this
  is the general approach (`layout.font.family` + a system-installed font). Verify
  the exported static file actually shows the Chinese glyphs.

---

## Colorblind-safe palette

Same palette as the matplotlib recipe. Set it as the plotly `colorway`
(categorical) or a continuous `colorscale`:

- **Categorical — Okabe-Ito (8 colors, CVD-safe):** `#E69F00 #56B4E9 #009E73
#F0E442 #0072B2 #D55E00 #CC79A7 #000000` → pass as `layout.colorway`.
- **Continuous:** `colorscale="Viridis"` or `"Cividis"` (perceptually uniform,
  CVD-robust, grayscale-safe).
- Never rely on red–green alone; keep categorical sets ≤6–8 colors; simulate
  deuteranopia/protanopia after exporting.

---

## Sources (from research report §4.4–4.5, §5)

- plotly static image export: https://plotly.com/python/static-image-export/
- plotly 6.1 / Kaleido v1 changes (EPS removed): https://plotly.com/python/static-image-generation-changes/
- write_image API: https://plotly.github.io/plotly.py-docs/generated/plotly.io.write_image.html
- Kaleido repo: https://github.com/plotly/kaleido
- EPS error source: https://github.com/plotly/plotly.py/blob/master/plotly/io/_kaleido.py
- scale / raster-in-vector issue #58: https://github.com/plotly/Kaleido/issues/58
- default width/height issue #378: https://github.com/plotly/Kaleido/issues/378
- Okabe-Ito hex reference: https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference
- viridis intro: https://github.com/sjmgarnier/viridis/blob/master/vignettes/intro-to-viridis.Rmd
- Chrome requirement and `scale` cross-check: `skills/scientific-visualization`
  of `K-Dense-AI/claude-scientific-skills` (MIT), snapshot dated 2026-07-23,
  which sources both claims from the two plotly/Kaleido pages above.
