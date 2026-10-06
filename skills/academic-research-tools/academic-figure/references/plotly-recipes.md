# plotly (+ kaleido) Recipes

The plotly branch of the **library axis** (step 4 of `modes/journal-spec.md`). Reach for plotly when
the deliverable is interactive/web output; for a static print figure, matplotlib
is the default. Static export (png/pdf/svg) goes through the **Kaleido** engine.

Every technical claim here comes from the plotly, Kaleido, and CJK research of
2026-07; source URLs are at the bottom. Font family/size come from
`journal-specs.md`; anything the research did not establish (notably the page
size of a vector export) is marked `[missing evidence]` — do not invent it.

---

## Journalized layout template

Build the layout from spec-card values: journal font family + size, a
colorblind-safe `colorway`, and logical-pixel `width`/`height` sized from the
column width (see the sizing section). Nature/Elsevier read cleanest with a minimal,
borderless axis (bottom + left line only); this axis styling is standard plotly
layout config, not a journal-mandated spec.

```python
import plotly.graph_objects as go

# OKABE_ITO: copy the list from the palette section of matplotlib-recipes.md.

# Journal font family + size from journal-specs.md spec cards. The size is the
# point size at final print size: on the 72 px/in canvas, 1 logical px = 1 pt.
_JOURNAL_FONT = {
    "ieee":     dict(family="Times New Roman, Times, serif", size=9),  # IEEE Times ~9-10 pt
    "elsevier": dict(family="Arial, Helvetica, sans-serif",  size=7),  # Elsevier allowed set, 7 pt
    "nature":   dict(family="Helvetica, Arial, sans-serif",  size=7),  # Nature sans, 5-7 pt
}


def build_journal_layout(journal, width_px, height_px):
    """Return a plotly layout dict carrying journal font, size, colorway, and a
    minimal borderless axis. width_px/height_px are logical pixels at 72 per
    inch (sizing section below)."""
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

## Sizing: one rule for canvas, font, and scale

This is the only size rule for plotly in this skill. `qa-checklist.md` and
`chart-recipes.md` refer to it.

1. **Canvas.** Size the layout in logical pixels at 72 per inch:
   `width_px = round(width_in * 72)`, with `width_in = width_mm / 25.4` from the
   card. Set `height` to `round(width_px * 9 / 16)` unless the family is square
   (`layout-defaults.md`).
2. **Font.** Write the card point size directly as `font.size`. At 72 px per
   inch one logical pixel is one point, so `size=9` is 9 pt at final size.
3. **Raster export.** Export with `scale = DPI / 72`. The output then has
   `width_in * DPI` pixels, and the text keeps its point size at card width.
4. **Vector export.** Export PDF or SVG with no `scale`. See the caveat below.

```python
def plotly_canvas(width_mm, aspect=9 / 16):
    """Return (width_px, height_px) in logical pixels at 72 per inch."""
    width_px = round(width_mm / 25.4 * 72)
    return width_px, round(width_px * aspect)

fig.update_layout(build_journal_layout("ieee", *plotly_canvas(88.9)))
fig.write_image("figure.png", scale=300 / 72)   # 1050 px wide = 3.5 in at 300 dpi
fig.write_image("figure.pdf")                    # vector
```

Logical widths and raster scales from the `journal-specs.md` widths:

| Journal  | Column widths    | Logical px width (single / double) | Raster DPI         | `scale` | Output px width (single / double) |
| -------- | ---------------- | ---------------------------------- | ------------------ | ------- | --------------------------------- |
| IEEE     | 3.5 in / 7.16 in | 252 / 516                          | 300 (color)        | 4.167   | 1050 / 2150                       |
| IEEE     | 3.5 in / 7.16 in | 252 / 516                          | 600 (B/W line art) | 8.333   | 2100 / 4300                       |
| Elsevier | 90 mm / 190 mm   | 255 / 539                          | 300 (halftone)     | 4.167   | ~1063 / ~2246                     |
| Elsevier | 90 mm / 190 mm   | 255 / 539                          | 1000 (line art)    | 13.889  | ~3542 / ~7486                     |
| Nature   | 89 mm / 183 mm   | 252 / 519                          | 300 (photo)        | 4.167   | 1050 / ~2163                      |

> **Vector export (pdf/svg) caveat — [missing evidence].** The research did not
> establish the page size that Kaleido writes for a PDF. If Kaleido maps 72
> logical px to one inch, the page is `width_in` wide and the fonts are at card
> size. If it maps 96 px to one inch (the browser CSS model), the page is 0.75
> of `width_in`; the text-to-canvas ratio stays correct, but every glyph is 0.75
> of its point size until the page is placed at card width. After export, read
> the page box with the post-export command in `qa-checklist.md` and report the
> measured width. If it is not `width_in`, run `audit_pdf_text.py` with
> `--min-pt` multiplied by the measured ratio, and state the ratio in the
> delivery note.

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
fig.write_image("figure.png", scale=DPI / 72)   # raster; see the sizing rule
fig.write_image("figure.pdf")                   # vector
fig.write_image("figure.svg")                   # vector, editable
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
"300 DPI". With the 72 px per inch canvas of the sizing rule, `scale = DPI / 72`
gives the card DPI at card width; state the DPI from that arithmetic, not from
`scale`. (Same 2026-07-23 snapshot cross-check as above.)

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

- **Categorical — Okabe-Ito (8 colors, CVD-safe):** copy `OKABE_ITO` from the
  palette section of `matplotlib-recipes.md` and pass it as `layout.colorway`.
  Use `NEUTRAL_GRAY` from the same section for ground truth.
- **Continuous:** `colorscale="Viridis"` or `"Cividis"` (perceptually uniform,
  CVD-robust, grayscale-safe).
- Never rely on red–green alone; keep categorical sets ≤6–8 colors; simulate
  deuteranopia/protanopia after exporting.

---

## Sources

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
