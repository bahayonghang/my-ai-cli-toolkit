# QA Checklist

Walk this before delivering a figure or an export bundle. Adapted from
nature-figure's QA contract, generalized from single-journal (Nature) to the
multi-journal, multi-library scope of this skill. Two changes from the original:
the "backend exclusivity" row becomes **library + style consistency**, and every
size/font/DPI/format/color check defers to the resolved card in
`journal-specs.md` instead of hardcoded Nature values.

Journal rules change — verify the target journal's current author guide for final
submission. The pass conditions below are conservative defaults.

Three later sections carry other sources. The per-panel audit, the rendered
glyph floor, and the uncertainty consistency rule are adapted from
nature-figure's QA contract (`Yuan1z0825/nature-skills`, Apache-2.0, reviewed
2026-08-16). The post-export machine checks are adapted from the
`scientific-visualization` skill in `K-Dense-AI/claude-scientific-skills` (MIT,
reviewed 2026-08-16). The visual review loop and the final-size export rule are
adapted from scipilot-figure-skill (`Haojae/scipilot-figure-skill`, MIT,
reviewed 2026-08-16).

## Pre-submission checklist

| Check                       | Pass condition                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Core conclusion             | A one-sentence claim exists and every panel maps to it                                                                                      |
| Archetype                   | The figure has a declared archetype and panel hierarchy                                                                                     |
| Library + style consistency | One resolved library + journal style produced all plotting, previews, exports, and QA renders — no cross-library mixing                     |
| Final size                  | Width matches the resolved `journal-specs.md` card (single- or double-column); default height is 16:9 of that width (`layout-defaults.md`) and stays within the journal limit |
| Text size                   | Body/tick/legend text is at least the card's minimum at final size (do not shrink below it)                                                 |
| Panel labels                | Lowercase, bold, near top-left, at the card's panel-label size; consistent across all panels                                                |
| Editable text               | Vector text stays selectable/editable (`svg.fonttype="none"`, `pdf.fonttype=42`); no outlined text unless unavoidable                       |
| Font                        | Matches the card family — Times-family serif for IEEE, Helvetica/Arial sans for Nature/Elsevier, CJK for chinese-thesis — used consistently |
| Vector-first                | Line art / plots exported as vector (PDF/EPS/SVG per the card); raster only where required                                                  |
| Color mode                  | Matches the card (RGB default; CMYK only where the target journal requires it)                                                              |
| Color accessibility         | No rainbow colormaps; red/green is not the only encoding; grayscale print stays interpretable                                               |
| Legend strategy             | Shared legend or direct labels where possible; no repeated redundant legends                                                                |
| Statistics                  | `n`, repeats, center, spread, test, correction, and exact comparison are documented (see minimum below)                                     |
| Source data                 | Quantitative panels trace to a clean CSV/TSV/XLSX or script output                                                                          |
| Raster resolution           | Any raster meets the card DPI at final size (photo vs line-art vs combination thresholds differ per journal)                                |
| Font embedding              | Fonts embedded in PDF/EPS (`pdf.fonttype=42` / `ps.fonttype=42`) so no Type 3 fonts are rejected                                            |
| Export opens clean          | The exported SVG/PDF opens, text is selectable, labels do not overlap, and it reads at final printed size                                   |

## Per-panel audit

The table above audits the figure. This one audits each panel after the figure
is rendered. Fill one row per panel; an empty cell is a finding, not a blank.

| Panel | Unique claim | Center statistic | Spread | Replicate unit | Label | Collision check | Pass |
| ----- | ------------ | ---------------- | ------ | -------------- | ----- | --------------- | ---- |
| a     |              |                  |        |                |       |                 |      |
| b     |              |                  |        |                |       |                 |      |

Then run the cover test on every panel: cover it and re-read the claim. If the
argument still holds, remove the panel or merge it into another one.

## Text size floor at final size

- The card minimum applies to **every glyph in the rendered figure**, not to
  `font.size` in the source. Text set at the minimum can still render below it.
- mathtext superscripts and subscripts render at about 0.7 of the parent size:
  `$R^2$` set at 7 pt contains a glyph near 4.9 pt. Raise the parent size, or
  write the exponent as plain text.
- Audit the exported PDF, do not read the source:
  `python "<skill-dir>/scripts/audit_pdf_text.py" figure.pdf --min-pt 5`. Use
  the resolved card's minimum in place of `5`.

## Statistics legend minimum

For each quantitative panel, capture:

```text
n definition:
biological/technical or run-level replicates:
center statistic:
spread/interval:
test:
multiple-comparison correction:
p-value display:
source-data file:
```

For machine-learning / time-series model figures, also capture:

```text
train/validation/test split:
number of seeds or folds:
metric definition:
confidence interval or variability definition:
baseline definition:
```

## Uncertainty consistency across panels

- Panels that invite comparison use one uncertainty definition. If two panels
  must differ, say so in the caption and make the difference unmistakable.
- One `fill_between` or `errorbar` call is not evidence of coverage. Record the
  estimator, the interval level, `n`, and the replicate unit for each band.
- Fix the seed for a bootstrap interval. A resampled interval changes between
  runs, so an unseeded band is not reproducible.
- Keep missing, censored, and excluded observations distinct from zero. See M1
  in `viz-pitfalls.md`.

## Visual review before export

Run the loop in `visual-review.md` **before** the export block below: render a
PNG preview, run the machine audit in `<skill-dir>/scripts/visual_qa.py`, read
the preview against the ten perceptual items, fix at the source, and render
again. A missing-glyph `FAIL` blocks the export. Three rounds is the limit.

## Export checks

Run only the export block for the resolved library. If the library is missing,
stop and report the missing runtime/package (with the install command) instead of
producing a substitute export with the other library.

### matplotlib (+ seaborn)

```python
import matplotlib as mpl
mpl.rcParams["svg.fonttype"] = "none"   # keep SVG text editable
mpl.rcParams["pdf.fonttype"] = 42       # embed TrueType, avoid Type 3 rejection
mpl.rcParams["ps.fonttype"] = 42
# bbox_inches="tight" trims to the drawn content; drop it when the exported
# width must equal the card width (see "Export at final size" below).
fig.savefig("figure.pdf", bbox_inches="tight")            # vector-first
fig.savefig("figure.svg", bbox_inches="tight")
fig.savefig("figure.eps", bbox_inches="tight")            # if the journal needs EPS
fig.savefig("figure.tiff", dpi=DPI, bbox_inches="tight")  # raster fallback at card DPI
```

### plotly

```python
import plotly.io as pio
pio.defaults.default_width = None    # avoid overriding layout size (kaleido #378)
pio.defaults.default_height = None
fig.write_image("figure.pdf")        # vector
fig.write_image("figure.svg")        # vector
fig.write_image("figure.png", scale=2)   # raster; scale up density
# EPS: kaleido v1 dropped it — export PDF/SVG and convert, or pin kaleido<1.0.
# CJK: set layout.font.family to an installed CJK font before export.
```

After export, open the SVG/PDF and confirm text is selectable, labels do not
overlap, colors survive a grayscale check, and the figure reads at final printed
size.

## Export at final size

- Set `figsize` to the final physical size from the card and export at that
  size. Do not scale the figure in Word, LaTeX, or the submission system
  afterwards: scaling changes every effective font size and line width, so a
  compliant 7 pt label becomes a non-compliant one.
- `bbox_inches="tight"` trims to the drawn content and therefore changes the
  physical size. Do not use it when the width must match the card exactly. Use
  `layout="constrained"` to keep labels inside a fixed canvas instead.
- Write a grayscale copy next to the deliverable
  (`fig.savefig("figure_grayscale.png")` after converting the palette, or
  convert the exported raster with PIL) and confirm every series stays
  separable. Grayscale is a check, not a full color-vision simulation.

## Post-export machine checks

Measure the delivered file; do not infer its properties from the plotting code.
Give each row one of four verdicts: **pass**, **fail**, **review** (a human must
compare it against the card), or **unknown** (the file or the toolchain does not
carry the value — never guess it).

| Check                | How to measure                                                         | Pass condition                                     |
| -------------------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| Format               | File extension and container                                           | Matches the card; JPEG never for line art          |
| Effective raster DPI | Pixel width ÷ final width in inches                                    | At or above the card DPI for the image type        |
| Final width, height  | Page box in mm (vector) or pixels ÷ DPI (raster)                       | Matches the card column width                      |
| Color mode           | `RGB`, `CMYK`, or grayscale from the file                              | Matches the card                                   |
| Transparency         | Presence of an alpha channel                                           | Opaque background unless the target asks otherwise |
| File size            | Bytes on disk                                                          | Under the target's upload limit                    |
| Glyph floor          | `python "<skill-dir>/scripts/audit_pdf_text.py" figure.pdf --min-pt 5` | No glyph below the card minimum                    |

```bash
# raster: pixel size, color mode, embedded DPI
python -c "from PIL import Image; im=Image.open('figure.tiff'); print(im.size, im.mode, im.info.get('dpi'))"
# vector: page box in mm (1 pt = 1/72 in)
python -c "from pypdf import PdfReader; b=PdfReader('figure.pdf').pages[0].mediabox; print(float(b.width)/72*25.4, float(b.height)/72*25.4)"
```

Embedded DPI metadata alone adds no detail: the pixel count decides the
resolution. If PIL or pypdf is missing, record `unknown` and report the missing
package — do not substitute a value from the plotting code.
