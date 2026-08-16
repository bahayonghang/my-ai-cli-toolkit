# matplotlib (+ seaborn) Recipes

The matplotlib branch of the **library axis** (the library-axis step in
`modes/journal-spec.md`). Take the numbers
from the resolved card in `journal-specs.md` and drop them into one of the
presets below. seaborn is treated here as a matplotlib-layer API, not a separate
backend — specs still resolve down to rcParams.

Every technical claim in this file is grounded in this task's research report
`research/journal-specs-and-tooling.md` (toolchain §4, CJK §5); its source URLs
are collected at the bottom. Numbers that the research traced to a journal are
labelled as such (e.g. "spec card"); numbers that are presentational defaults
(line widths, aspect ratios) are labelled as defaults — journals do not mandate
them, so tune them freely. Anything the research did not establish is marked
`[missing evidence]`; do not invent it.

---

## Choose a route: SciencePlots vs pure rcParams

| Situation                                            | Route                                                                                    |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| LaTeX installed **and** target is `ieee` or `nature` | **SciencePlots** — least effort; it ships `ieee` and `nature` styles                     |
| No LaTeX available                                   | SciencePlots **with `no-latex`**, or pure rcParams                                       |
| Target is `elsevier`                                 | **Pure rcParams** — SciencePlots has no Elsevier style                                   |
| Chinese / CJK figure                                 | **Pure rcParams** (set the CJK font chain), or SciencePlots `no-latex` + manual CJK font |
| Zero extra dependency / full control                 | **Pure rcParams** — expand the spec-card numbers directly                                |

SciencePlots (PyPI, ~9K stars, actively maintained — v2.2.2 released 2026-02-25)
is a set of matplotlib `.mplstyle` sheets. It **defaults to LaTeX** (text goes
through `usetex`), so on a machine without LaTeX you must add `no-latex`. It
covers **IEEE and Nature only — no Elsevier style** — and CJK fonts need separate
handling.

```python
import matplotlib.pyplot as plt
import scienceplots                    # v1.1.0+: the import is required to register styles
plt.style.use(["science", "ieee"])     # or ["science", "nature"]
# no LaTeX on this machine:
plt.style.use(["science", "ieee", "no-latex"])
# in a notebook, if styles don't show up: plt.style.reload_library()
```

SciencePlots also ships colorblind-safe color cycles you can stack, e.g.
`bright` (7-color, colorblind-safe) or `std-colors`:
`plt.style.use(["science", "ieee", "bright"])`. On Windows, LaTeX usually must be
added to `PATH` manually.

---

## Pure-rcParams presets

Copy the preset for the resolved journal and apply it with
`mpl.rcParams.update(...)`. `figure.figsize` uses the spec-card column width in
inches; font sizes and DPI are spec-card values; `pdf.fonttype`/`ps.fonttype = 42`
embed TrueType fonts to avoid Type-3 rejection.

```python
import matplotlib as mpl
from cycler import cycler

# Colorblind-safe categorical default (Okabe-Ito, 8 colors) — see palette section.
OKABE_ITO = ["#E69F00", "#56B4E9", "#009E73", "#F0E442",
             "#0072B2", "#D55E00", "#CC79A7", "#000000"]

# --- IEEE: single 3.5 in / double 7.16 in; ~9-10 pt (old FAQ 8 pt); B/W line art >600 dpi; PS/EPS/PDF ---
IEEE_RCPARAMS = {
    "figure.figsize": (3.5, 2.6),      # single-column 3.5 in wide (spec card); height is a default
    "savefig.dpi": 600,                # IEEE B/W line art >600 dpi (spec card); use 300 for color/grayscale
    "savefig.format": "pdf",           # IEEE prefers vector PS/EPS/PDF (spec card)
    "savefig.bbox": "tight",
    "font.family": "serif",
    "font.serif": ["Times New Roman", "Times", "DejaVu Serif"],  # IEEE Times family (spec card)
    "font.size": 9,                    # ~9-10 pt at full size (spec card)
    "axes.titlesize": 9, "axes.labelsize": 9,
    "xtick.labelsize": 8, "ytick.labelsize": 8, "legend.fontsize": 8,
    "axes.linewidth": 0.8,             # default, not journal-mandated
    "lines.linewidth": 1.2,            # default, not journal-mandated
    "pdf.fonttype": 42, "ps.fonttype": 42,     # embed TrueType (report §4.2)
    "axes.prop_cycle": cycler(color=OKABE_ITO),
}

# --- Elsevier: single ~90 mm (3.54 in) / double ~190 mm (7.48 in); 7 pt (sub >=6 pt); line 1000 / halftone 300 / combo 500 dpi; EPS/PDF/TIFF, not PNG ---
ELSEVIER_RCPARAMS = {
    "figure.figsize": (3.54, 2.66),    # ~90 mm single column (spec card, secondary-sourced)
    "savefig.dpi": 1000,               # line-art minimum (spec card); 300 halftone / 500 combination
    "savefig.format": "pdf",           # EPS/PDF vector; PNG is NOT accepted by Elsevier (spec card)
    "savefig.bbox": "tight",
    "font.family": "sans-serif",
    "font.sans-serif": ["Arial", "Helvetica", "DejaVu Sans"],   # from Elsevier allowed set (spec card)
    "font.size": 7,                    # body 7 pt at final size (spec card)
    "axes.titlesize": 7, "axes.labelsize": 7,
    "xtick.labelsize": 6, "ytick.labelsize": 6, "legend.fontsize": 6,  # >=6 pt (spec card)
    "axes.linewidth": 0.6,             # default, not journal-mandated
    "lines.linewidth": 1.0,            # default, not journal-mandated
    "pdf.fonttype": 42, "ps.fonttype": 42,
    "axes.prop_cycle": cycler(color=OKABE_ITO),
}

# --- Nature: single 89 mm (3.5 in) / double 183 mm (7.2 in); 5-7 pt, panel labels 8 pt bold; sans-serif Helvetica/Arial; photo >=300 dpi; vector AI/EPS/PDF/SVG ---
NATURE_RCPARAMS = {
    "figure.figsize": (3.5, 2.6),      # 89 mm single column (spec card)
    "savefig.dpi": 300,                # photo minimum (spec card); prefer vector for line art
    "savefig.format": "pdf",           # editable vector preferred (spec card)
    "savefig.bbox": "tight",
    "font.family": "sans-serif",
    "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans"],   # Nature prefers Helvetica/Arial (spec card)
    "font.size": 7,                    # max 7 pt, min 5 pt (spec card)
    "axes.titlesize": 7, "axes.labelsize": 7,
    "xtick.labelsize": 6, "ytick.labelsize": 6, "legend.fontsize": 6,
    "axes.linewidth": 0.6,             # default, not journal-mandated
    "lines.linewidth": 1.0,            # default, not journal-mandated
    "pdf.fonttype": 42, "ps.fonttype": 42,
    "axes.prop_cycle": cycler(color=OKABE_ITO),
}

PRESETS = {"ieee": IEEE_RCPARAMS, "elsevier": ELSEVIER_RCPARAMS, "nature": NATURE_RCPARAMS}


def apply_journal_style(journal):
    """Apply a journal preset. Call AFTER any seaborn theme so spec numbers win."""
    mpl.rcParams.update(PRESETS[journal])
```

Panel labels for Nature are 8 pt bold (spec card) — set them per-annotation
(`ax.text(..., fontsize=8, fontweight="bold")`), not via the global `font.size`.
`figure.figsize` heights and `*.linewidth` above are sensible defaults; the
journal-traced numbers are the widths, font sizes, DPI, formats, and fonts.

### Vector export & font embedding

```python
fig.savefig("figure.pdf")     # vector; fonttype=42 already embeds TrueType
fig.savefig("figure.eps")     # for journals that require EPS (IEEE/Elsevier)
fig.savefig("figure.svg")     # editable vector (Nature-friendly)
```

`pdf.fonttype = 42` / `ps.fonttype = 42` embed TrueType fonts so the exporter does
not emit Type-3 fonts, which journals reject. After export, open the file and
confirm text is real text (selectable), not outlines.

---

## seaborn synergy

seaborn's theme setters (`set_theme` / `set_context` / `set_style`) write into
matplotlib rcParams. Because a later `rcParams.update` wins, **call seaborn
first, then apply the journal preset** so the spec-card numbers (figsize, font
size, DPI, fonttype) override seaborn's paper-context scaling.

```python
import seaborn as sns
# 1) seaborn theme first: paper context scales labels/linewidths for print;
#    "ticks" + despine gives clean axes; colorblind palette is CVD-safe (10 colors).
sns.set_theme(context="paper", style="ticks", palette="colorblind", font="sans-serif")
# equivalently: sns.set_context("paper", font_scale=1.0); sns.set_style("ticks")

# 2) journal preset second so spec numbers take precedence:
apply_journal_style("nature")

# 3) plot, then remove top/right spines for white/ticks styles:
ax = sns.scatterplot(data=df, x="x", y="y", hue="label")
sns.despine()      # drop top & right spines (pairs with "white"/"ticks")
```

- `set_context("paper")` scales fonts/线宽 to paper size; use `font_scale` to
  nudge type size independently.
- `set_style("whitegrid" | "ticks" | "white" | ...)`; for `white`/`ticks` add
  `sns.despine()`.
- `sns.color_palette("colorblind")` is a 10-color CVD-safe palette.

---

## Layout, scoped styles, and presentation scale

### Apply a preset in a scope, not globally

`plt.style.use(...)` and `mpl.rcParams.update(...)` change global state and stay
in force for every later figure in the session. Keep each preset a plain dict
and apply it in a context manager, so two figures in one script stay
independent.

```python
import matplotlib as mpl
import matplotlib.pyplot as plt

with mpl.rc_context(PRESETS["nature"]):     # scoped; global rcParams stay clean
    fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")
    ax.plot(x, y)
    fig.savefig("figure.pdf")
```

### Keep the exported size equal to the card width

- `layout="constrained"` at figure creation reserves room for titles, labels,
  and colorbars **inside** the canvas, so the saved size stays `figsize`.
- `fig.tight_layout()` switches constrained layout off. Do not call both.
- `bbox_inches="tight"` trims the saved file to the drawn content, so the saved
  width is not `figsize`. The presets above set `savefig.bbox = "tight"`, which
  is safe while a slightly narrower figure is acceptable. When the card width
  must be exact, drop that key and rely on `layout="constrained"`.
- Export at the final physical size and do not rescale the figure in Word or
  LaTeX: rescaling changes every effective font size and line width.

### Presentation scale

Poster and slide figures use a larger type and line-width tier than the journal
presets above. See `design-theory.md` for that tier and for the semantic palette
roles; do not apply presentation numbers to a single-column journal figure.

---

## CJK (Chinese) text

Two failure modes: Chinese glyphs render as boxes, and the minus sign renders as
a box. Fix both. The priority chains and the install hints below are adapted
from scipilot-figure-skill (`Haojae/scipilot-figure-skill`, MIT, reviewed
2026-08-16).

```python
import matplotlib.pyplot as plt
from matplotlib import font_manager

# Sans chain for Nature/Elsevier-style cards. First installed name wins.
CJK_SANS = ["Noto Sans CJK SC", "Noto Sans SC", "Source Han Sans SC",
            "Source Han Sans CN", "SimHei", "Microsoft YaHei",
            "PingFang SC", "Heiti SC", "WenQuanYi Zen Hei", "Arial Unicode MS"]
# Serif chain for a Chinese thesis or a Song-body journal.
CJK_SERIF = ["Noto Serif CJK SC", "Noto Serif SC", "Source Han Serif SC",
             "Source Han Serif CN", "SimSun", "STSong", "Songti SC"]

installed = {f.name for f in font_manager.fontManager.ttflist}
chain = [name for name in CJK_SANS if name in installed]
if not chain:
    raise RuntimeError("No CJK font found; install Noto Sans CJK SC first")
plt.rcParams["font.sans-serif"] = chain + ["DejaVu Sans"]
plt.rcParams["axes.unicode_minus"] = False      # U+2212 minus -> box in SimHei
```

Install a CJK font when the chain is empty:

| Platform      | Command                                                                                                               |
| ------------- | --------------------------------------------------------------------------------------------------------------------- |
| Debian/Ubuntu | `sudo apt install fonts-noto-cjk`                                                                                     |
| Fedora/RHEL   | `sudo dnf install google-noto-sans-cjk-fonts`                                                                         |
| macOS         | `brew install --cask font-noto-sans-cjk-sc`                                                                           |
| Windows       | Download https://github.com/notofonts/noto-cjk/releases, then right-click the `.ttf`/`.otf` and install for all users |

List what matplotlib currently indexes before you blame the code:

```bash
python -c "from matplotlib import font_manager; print(sorted({f.name for f in font_manager.fontManager.ttflist}))"
```

matplotlib indexes fonts at import, so restart the process after an install. If
the new font still does not appear, clear the cache directory reported by
`matplotlib.get_cachedir()`. The cache refresh on Windows is unverified here.

- matplotlib defaults to the Unicode minus U+2212, which fonts like SimHei often
  lack → box. `axes.unicode_minus = False` falls back to ASCII `-`.
- The font must already be installed and cover the glyphs used (Windows:
  `C:\Windows\Fonts\`, e.g. `simhei.ttf`).
- Jupyter caveat: `plt.rc_context({"font.sans-serif": "SimHei"})` may not take —
  use `plt.rcParams.update(...)` instead (matplotlib issue #20738).
- For a single text object you can pass `FontProperties(fname=...)` instead of a
  global change.
- **SciencePlots + Chinese:** the `science` style defaults to LaTeX; CJK then
  needs the `pgf` backend + `xeCJK` (`\setCJKmainfont{SimHei}` preamble), or use
  `["science", "no-latex"]` and then set the CJK font + `axes.unicode_minus =
False` as above.
- A missing glyph only produces a warning; matplotlib still writes the file.
  Run the audit in `visual-review.md` before export.

When a journal card wants sans-serif (Nature/Elsevier), put the CJK family in
`font.sans-serif`; for a serif thesis look, put it in `font.serif` and set
`font.family = "serif"`.

---

## Colorblind-safe palette (default)

IEEE and Nature require figures to stay readable in grayscale and to avoid
red–green as the only distinction, so **color is never the only channel** — add
line style and marker as redundant channels.

**Categorical — Okabe-Ito (8 colors, CVD-safe, adopted by Nature Methods):**

```python
OKABE_ITO = ["#E69F00",  # orange
             "#56B4E9",  # sky blue
             "#009E73",  # bluish green
             "#F0E442",  # yellow
             "#0072B2",  # blue
             "#D55E00",  # vermillion
             "#CC79A7",  # reddish purple
             "#999999"]  # gray (8th); use "#000000" black as the alternate 8th
```

Alternative categorical — **Paul Tol `bright` (7 colors):**
`["#4477AA", "#EE6677", "#228833", "#CCBB44", "#66CCEE", "#AA3377", "#BBBBBB"]`.

**Continuous / sequential:** `viridis` or `cividis` (matplotlib built-in,
perceptually uniform, CVD-robust, grayscale-safe): `cmap="viridis"`.

matplotlib also ships a built-in `tableau-colorblind10` style:
`plt.style.use("tableau-colorblind10")`.

**Rules:** keep categorical sets to ≤6–8 colors; Okabe-Ito/Tol for categorical,
viridis/cividis for continuous; never rely on red–green alone; keep categorical
colors close in lightness; simulate deuteranopia/protanopia after plotting.

**Grayscale redundancy** (for IEEE/Nature grayscale readability): distinguish
series by `linestyle` and `marker` in addition to color.

```python
styles = ["-", "--", "-.", ":"]
markers = ["o", "s", "^", "D"]
for i, (x, y) in enumerate(series):
    ax.plot(x, y, color=OKABE_ITO[i], linestyle=styles[i % 4],
            marker=markers[i % 4], markersize=3)
```

---

## Sources (from research report §4–5)

- matplotlib customizing / rcParams: https://matplotlib.org/stable/users/explain/customizing.html
- SciencePlots README: https://github.com/garrettj403/SciencePlots/blob/master/README.md
- SciencePlots gallery: https://github.com/garrettj403/SciencePlots/wiki/Gallery
- SciencePlots PyPI: https://pypi.org/project/SciencePlots/
- SciencePlots examples (pgf/xeCJK note): https://github.com/garrettj403/SciencePlots/blob/master/examples/plot-examples.py
- seaborn aesthetics: https://seaborn.pydata.org/tutorial/aesthetics.html
- seaborn set_context: https://seaborn.pydata.org/generated/seaborn.set_context.html
- seaborn set_style: https://seaborn.pydata.org/generated/seaborn.set_style.html
- seaborn set_theme: https://seaborn.pydata.org/generated/seaborn.set_theme.html
- matplotlib Chinese text (rcParams + unicode_minus): https://www.squash.io/how-to-use-matplotlib-for-chinese-text-in-python/
- jdhao Chinese matplotlib guide: https://jdhao.github.io/2017/05/13/guide-on-how-to-use-chinese-with-matplotlib/
- rc_context CJK issue #20738: https://github.com/matplotlib/matplotlib/issues/20738
- Okabe-Ito hex reference: https://conceptviz.app/blog/okabe-ito-palette-hex-codes-complete-reference
- colorblindr palettes.R (authoritative hex): https://rdrr.io/github/clauswilke/colorblindr/src/R/palettes.R
- Okabe & Ito "Color Universal Design": https://jfly.uni-koeln.de/color/
- Paul Tol colour schemes (SRON PDF): https://personal.sron.nl/~pault/data/colourschemes.pdf
- viridis intro: https://github.com/sjmgarnier/viridis/blob/master/vignettes/intro-to-viridis.Rmd
