# QA Checklist

Walk this before delivering a figure or an export bundle. Adapted from
nature-figure's QA contract, generalized from single-journal (Nature) to the
multi-journal, multi-library scope of this skill. Two changes from the original:
the "backend exclusivity" row becomes **library + style consistency**, and every
size/font/DPI/format/color check defers to the resolved card in
`journal-specs.md` instead of hardcoded Nature values.

Journal rules change — verify the target journal's current author guide for final
submission. The pass conditions below are conservative defaults.

## Pre-submission checklist

| Check                       | Pass condition                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Core conclusion             | A one-sentence claim exists and every panel maps to it                                                                                      |
| Archetype                   | The figure has a declared archetype and panel hierarchy                                                                                     |
| Library + style consistency | One resolved library + journal style produced all plotting, previews, exports, and QA renders — no cross-library mixing                     |
| Final size                  | Width matches the resolved `journal-specs.md` card (single- or double-column); height is within the journal limit                           |
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
