# Chart Recipes

Standalone (non-industrytslib) recipes for the chart families this skill covers,
organized to mirror the industrytslib visualization families so the two paths
stay aligned. If the project uses industrytslib, prefer
`industrytslib-integration.md`; use this file only for the standalone path or for
families that library does not expose.

Read the matched family below **after** you have resolved the journal-style and
library axes and loaded the matching library recipe. Families 1–10 assume:

- rcParams (matplotlib) or the layout template (plotly) are already applied via
  `matplotlib-recipes.md` or `plotly-recipes.md`.
- Numeric journal values are **not** repeated here — pull them from the resolved
  card in `journal-specs.md`. The skeletons use named stand-ins for those values:

| Symbol                             | Meaning (from `journal-specs.md` card)                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `W`, `H`                           | figure width / height in **inches**; square panels use `(W, W)`        |
| `W_px`, `H_px`                     | same size in plotly logical pixels, `round(W*72)` / `round(H*72)` (`plotly-recipes.md` sizing) |
| `DPI`                              | raster resolution for the target journal + image type                  |
| `FONT_PT`                          | body font size in points                                               |
| `LW`                               | data line width                                                        |
| `OKABE_ITO`                        | colorblind-safe categorical palette, defined in the palette section of `matplotlib-recipes.md` |
| `NEUTRAL_GRAY`                     | neutral color for ground truth and context series, defined in the same section |
| `JOURNAL_TEMPLATE`, `JOURNAL_FONT` | plotly template name + font family from `plotly-recipes.md`            |

Export is vector-first (`.pdf`/`.svg`/`.eps` per the card); raster fallbacks use
`DPI`. matplotlib embeds fonts with `pdf.fonttype=42`; plotly's kaleido v1 does
**not** support EPS (export PDF/SVG then convert). See the library recipes.
Every matplotlib skeleton builds the figure with `layout="constrained"` and
saves it at the card size; see "Export at final size" in `qa-checklist.md`.

---

## 1. Time series (时序)

- **Archetype**: quantitative grid — one aligned time axis per variable, small
  multiples stacked so scales stay comparable.
- **Journal params**: wide aspect favors the double-column width; watch tick font
  (`FONT_PT`) and `LW`; direct-label each channel instead of a legend.

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(n_vars, 1, figsize=(W, H), sharex=True, layout="constrained")
for ax, (name, series) in zip(axes, variables.items()):
    ax.plot(t, series, color=OKABE_ITO[0], lw=LW)
    ax.set_ylabel(name)                       # direct label, no legend
    ax.spines[["top", "right"]].set_visible(False)
axes[-1].set_xlabel("Time")
fig.savefig("timeseries.pdf")   # vector-first per spec card
```

Step plot (`chart-selection.md` row "Time + continuous", alternate): for values
that stay constant between samples (counts per interval, set points), replace
`ax.plot(t, series, ...)` with `ax.step(t, series, where="post", ...)`.

```python
import plotly.graph_objects as go
from plotly.subplots import make_subplots

fig = make_subplots(rows=n_vars, cols=1, shared_xaxes=True)
for i, (name, series) in enumerate(variables.items(), start=1):
    fig.add_trace(go.Scatter(x=t, y=series, name=name,
                             line=dict(color=OKABE_ITO[0], width=LW)), row=i, col=1)
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=H_px, showlegend=False)
fig.write_image("timeseries.pdf")   # PDF/SVG vector; EPS unsupported in kaleido v1
```

## 2. True vs predicted comparison (真实/预测对比)

- **Archetype**: quantitative grid with a hero panel — the main comparison is the
  hero; residuals/controls go in quieter subordinate panels.
- **Journal params**: keep ground-truth neutral (`NEUTRAL_GRAY`) and prediction a
  signal color; optional confidence band uses low alpha.

```python
fig, ax = plt.subplots(figsize=(W, H), layout="constrained")
ax.plot(t, y_true, color=NEUTRAL_GRAY, lw=LW, label="Ground truth")
ax.plot(t, y_pred, color=OKABE_ITO[0], lw=LW, label="Prediction")
ax.fill_between(t, lo, hi, color=OKABE_ITO[0], alpha=0.15, lw=0)   # optional CI band
ax.set_xlabel("Time"); ax.set_ylabel("Value")
ax.legend(frameon=False, loc="best")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("pred.pdf")
```

```python
fig = go.Figure()
fig.add_trace(go.Scatter(x=t, y=y_true, name="Ground truth", line=dict(color=NEUTRAL_GRAY, width=LW)))
fig.add_trace(go.Scatter(x=t, y=y_pred, name="Prediction",  line=dict(color=OKABE_ITO[0], width=LW)))
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=H_px, legend=dict(bgcolor="rgba(0,0,0,0)"))
fig.write_image("pred.pdf")
```

## 3. Boxplot (箱线)

- **Archetype**: quantitative grid — feature distributions or per-model error
  spreads side by side.
- **Journal params**: keep boxes one color family with black edges; grayscale
  print survives because position + edge carry the signal.

```python
fig, ax = plt.subplots(figsize=(W, H), layout="constrained")
bp = ax.boxplot(data_by_group, patch_artist=True, widths=0.6)
for patch, c in zip(bp["boxes"], OKABE_ITO):
    patch.set_facecolor(c); patch.set_alpha(0.8); patch.set_edgecolor("black")
ax.set_xticklabels(group_labels)
ax.set_ylabel("Absolute error")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("box.pdf")
```

```python
fig = go.Figure()
for name, vals, c in zip(group_labels, data_by_group, OKABE_ITO):
    fig.add_trace(go.Box(y=vals, name=name, marker_color=c))
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=H_px, showlegend=False)
fig.write_image("box.pdf")
```

## 4. Distribution (分布)

- **Archetype**: quantitative grid — train/test overlay to expose drift.
- **Journal params**: overlay with alpha so both histograms read; two colors from
  different families (not red/green) for the split.

```python
fig, ax = plt.subplots(figsize=(W, H), layout="constrained")
ax.hist(train, bins=40, density=True, color=OKABE_ITO[0], alpha=0.5, label="Train")
ax.hist(test,  bins=40, density=True, color=OKABE_ITO[5], alpha=0.5, label="Test")
ax.set_xlabel(feature_name); ax.set_ylabel("Density")
ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("dist.pdf")
```

```python
fig = go.Figure()
fig.add_trace(go.Histogram(x=train, histnorm="probability density", name="Train",
                           marker_color=OKABE_ITO[0], opacity=0.5))
fig.add_trace(go.Histogram(x=test, histnorm="probability density", name="Test",
                           marker_color=OKABE_ITO[5], opacity=0.5))
fig.update_layout(template=JOURNAL_TEMPLATE, barmode="overlay",
                  font=dict(family=JOURNAL_FONT, size=FONT_PT), width=W_px, height=H_px)
fig.write_image("dist.pdf")
```

## 5. Correlation heatmap (相关性热力图)

- **Archetype**: image plate + quant — one dominant matrix panel; the colorbar is
  the quantitative key.
- **Journal params**: square panel; **diverging** map centered at 0 (`RdBu_r`),
  never a rainbow map; label ticks with feature names.

```python
fig, ax = plt.subplots(figsize=(W, W), layout="constrained")  # square
im = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)  # diverging, centered at 0
ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=90)
ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels)
cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04); cbar.set_label("Pearson r")
fig.savefig("corr.pdf")
```

```python
fig = go.Figure(go.Heatmap(z=corr, x=labels, y=labels, colorscale="RdBu", zmid=0,
                           colorbar=dict(title="Pearson r")))
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=W_px)
fig.write_image("corr.pdf")
```

## 6. Training loss (训练损失 — train/val, VAE, GAN)

- **Archetype**: quantitative grid — convergence curves; log-scale when the loss
  spans orders of magnitude.
- **Journal params**: thin lines (`LW`); shared legend; VAE multi-component uses
  one line per component. GAN generator and discriminator losses go on two
  panels stacked on a shared x axis (`sharex=True`), not on a second y axis
  (pitfall P2 in `viz-pitfalls.md`).

```python
fig, ax = plt.subplots(figsize=(W, H), layout="constrained")
ax.plot(epochs, train_loss, color=OKABE_ITO[0], lw=LW, label="Train")
ax.plot(epochs, val_loss,   color=OKABE_ITO[5], lw=LW, label="Validation")
ax.set_xlabel("Epoch"); ax.set_ylabel("Loss")
ax.set_yscale("log")                     # if loss spans orders of magnitude
ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("loss.pdf")
```

```python
# GAN: generator and discriminator loss on two stacked panels, shared x axis
fig, (ax_g, ax_d) = plt.subplots(2, 1, figsize=(W, H), sharex=True, layout="constrained")
ax_g.plot(epochs, g_loss, color=OKABE_ITO[0], lw=LW); ax_g.set_ylabel("Generator loss")
ax_d.plot(epochs, d_loss, color=OKABE_ITO[5], lw=LW); ax_d.set_ylabel("Discriminator loss")
ax_d.set_xlabel("Epoch")
for ax in (ax_g, ax_d):
    ax.spines[["top", "right"]].set_visible(False)
fig.savefig("gan_loss.pdf")
```

```python
fig = go.Figure()
fig.add_trace(go.Scatter(x=epochs, y=train_loss, name="Train",      line=dict(color=OKABE_ITO[0], width=LW)))
fig.add_trace(go.Scatter(x=epochs, y=val_loss,   name="Validation", line=dict(color=OKABE_ITO[5], width=LW)))
fig.update_yaxes(type="log")
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=H_px)
fig.write_image("loss.pdf")
```

## 7. Interval prediction (区间预测)

- **Archetype**: quantitative grid — point prediction plus a shaded prediction
  interval; a companion panel can bucket interval-wise error.
- **Journal params**: band alpha ~0.2; state the nominal coverage (e.g. 90% PI) in
  the legend; keep the point line above the band.

```python
fig, ax = plt.subplots(figsize=(W, H), layout="constrained")
ax.plot(t, y_true, color=NEUTRAL_GRAY, lw=LW, label="Ground truth")
ax.plot(t, y_pred, color=OKABE_ITO[0], lw=LW, label="Prediction")
ax.fill_between(t, lower, upper, color=OKABE_ITO[0], alpha=0.2, lw=0, label="90% PI")
ax.set_xlabel("Time"); ax.set_ylabel("Value"); ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("interval.pdf")
```

```python
fig = go.Figure()
fig.add_trace(go.Scatter(x=t, y=upper, line=dict(width=0), showlegend=False))
fig.add_trace(go.Scatter(x=t, y=lower, fill="tonexty", line=dict(width=0),
                         fillcolor="rgba(230,159,0,0.2)", name="90% PI"))
fig.add_trace(go.Scatter(x=t, y=y_pred, name="Prediction", line=dict(color=OKABE_ITO[0], width=LW)))
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=H_px)
fig.write_image("interval.pdf")
```

## 8. Dimensionality reduction — t-SNE / UMAP (降维)

- **Archetype**: quantitative grid (single hero scatter) — clusters carry the
  claim; compute the embedding upstream (`sklearn` TSNE / `umap-learn`).
- **Journal params**: square panel; small markers, no edge; one categorical color
  per class; enlarge legend markers with `markerscale`.

```python
fig, ax = plt.subplots(figsize=(W, W), layout="constrained")
for cls, c in zip(classes, OKABE_ITO):
    m = labels == cls
    ax.scatter(emb[m, 0], emb[m, 1], s=8, color=c, edgecolors="none", label=str(cls))
ax.set_xlabel("t-SNE 1"); ax.set_ylabel("t-SNE 2")
ax.legend(frameon=False, markerscale=2, loc="best")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("tsne.pdf")
```

```python
fig = go.Figure()
for cls, c in zip(classes, OKABE_ITO):
    m = labels == cls
    fig.add_trace(go.Scatter(x=emb[m, 0], y=emb[m, 1], mode="markers", name=str(cls),
                             marker=dict(size=4, color=c)))
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT),
                  width=W_px, height=W_px)
fig.write_image("tsne.pdf")
```

## 9. npy sequence batch (npy 序列批量)

- **Archetype**: quantitative grid — per-variable small multiples of true vs
  predicted sequences loaded from `.npy` arrays.
- **Journal params**: cap panels per figure so tick fonts stay at `FONT_PT`;
  reuse the true/pred color pair from family 2 for a shared visual vocabulary.

```python
fig, axes = plt.subplots(rows, cols, figsize=(W, H), sharex=True, layout="constrained")
for ax, v in zip(axes.ravel(), range(n_vars)):
    ax.plot(seq_true[:, v], color=NEUTRAL_GRAY, lw=LW)
    ax.plot(seq_pred[:, v], color=OKABE_ITO[0], lw=LW)
    ax.set_title(var_names[v], fontsize=plt.rcParams["axes.titlesize"])
    ax.spines[["top", "right"]].set_visible(False)
fig.supxlabel("Step")
fig.savefig("sequences.pdf")
```

```python
fig = make_subplots(rows=rows, cols=cols, subplot_titles=var_names, shared_xaxes=True)
for v in range(n_vars):
    r, c = v // cols + 1, v % cols + 1
    fig.add_trace(go.Scatter(y=seq_true[:, v], line=dict(color=NEUTRAL_GRAY, width=LW), showlegend=False), row=r, col=c)
    fig.add_trace(go.Scatter(y=seq_pred[:, v], line=dict(color=OKABE_ITO[0], width=LW), showlegend=False), row=r, col=c)
fig.update_layout(template=JOURNAL_TEMPLATE, font=dict(family=JOURNAL_FONT, size=FONT_PT), width=W_px, height=H_px)
fig.write_image("sequences.pdf")
```

## 10. Regression metrics formatting (回归指标格式化)

- **Archetype**: supporting annotation, not a standalone chart — metrics annotate a
  hero panel or become a small table; the raw numbers ship as source data.
- **Journal params**: annotation font ≤ legend size; keep it inside the axes with a
  light box so it never overlaps data.

```python
# in-panel annotation (LaTeX-safe if text.usetex is on per matplotlib-recipes.md)
txt = f"$R^2={r2:.3f}$\nRMSE$={rmse:.3f}$\nMAPE$={mape:.1f}\\%$"
ax.text(0.02, 0.98, txt, transform=ax.transAxes, va="top", ha="left",
        fontsize=plt.rcParams["legend.fontsize"],
        bbox=dict(boxstyle="round", fc="white", ec="0.7", alpha=0.8))
```

For a standalone metrics table use `matplotlib.axes.Axes.table` or export a clean
CSV as the source-data file. industrytslib projects should instead use
`MetricsFormatter` (see `industrytslib-integration.md`, regression-metrics family).

---

## Runnable recipes with figstyle (11–20)

Sections 11–20 run as written. They do not use the stand-in symbols above.
Each code block starts with the same opening lines:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")
```

- Replace `<skill-dir>` with the loaded skill directory.
- The values `3.5`, `8`, and `"Arial"` are placeholders. Replace `width_in`,
  `font_pt`, `font_family`, and the `figsize` width with the values of the
  resolved card in `journal-specs.md`.
- `figstyle` is `scripts/figstyle.py`. It sets the fonts, removes the top and
  right spines, and embeds TrueType fonts (`pdf.fonttype = 42`).
- `OKABE_ITO` and `NEUTRAL_GRAY` in `figstyle` are equal to the palette section
  of `matplotlib-recipes.md`.
- The data comes from `numpy.random.default_rng(0)`, so each run gives the same
  figure. Replace the data block with your data.
- Export: `save_figure(fig, "figs/<name>", formats=("pdf", "png"), dpi=300)`
  writes the full canvas, so the file width equals the card width. Do not add
  `bbox_inches="tight"`. Change `formats` and `dpi` to the card values (for
  example, Elsevier accepts no PNG: use `formats=("pdf", "tiff")`).
- A section that shows a seaborn form also shows a pure matplotlib form. The
  pure form needs only matplotlib and numpy. The seaborn form draws into the
  `ax` of the pure form.

Each section has the same order: when to use (the `chart-selection.md` row),
data shape, code, journal export, and common errors (the `viz-pitfalls.md` ID).

## 11. Grouped, stacked, and 100% stacked bars (分组柱与堆叠柱)

- **When to use**: `chart-selection.md` axis 2 row "Composition" (stacked bar);
  data-shape rows "1 categorical, composition" (value-sorted horizontal bar,
  single stacked bar) and "Composition of a total" (stacked bar, 100% stacked
  bar). Use grouped bars for one score per method and dataset (one value per
  cell, no spread). The catalog families `f4p_bar_grouped_datasets` and
  `f4p_bar_stacked_composition` give the poster-size versions.
- **Data shape**: a matrix of values, rows = series (methods or parts),
  columns = categories (datasets or groups).

Grouped bars, with a hatch per series so the grayscale copy stays readable:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, label_bars, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: rows = methods, columns = datasets ---
datasets = ["D1", "D2", "D3"]
methods = ["Baseline", "Ablation", "Ours"]
scores = np.array([[61.2, 58.4, 70.3],
                   [64.8, 60.1, 72.9],
                   [69.5, 66.7, 77.4]])

hatches = ["", "//", ".."]
x = np.arange(len(datasets))
width = 0.8 / len(methods)
for i, (name, row) in enumerate(zip(methods, scores)):
    offset = (i - (len(methods) - 1) / 2) * width
    bars = ax.bar(x + offset, row, width, color=OKABE_ITO[i], edgecolor="black",
                  linewidth=0.6, hatch=hatches[i], label=name)
    label_bars(ax, bars, fmt="{:.1f}", padding=1, fontsize=6)
ax.set_xticks(x, datasets)
ax.set_ylabel("Accuracy (%)")
ax.set_ylim(0, 100)                 # accuracy has a natural zero (P4)
ax.legend(ncols=3, loc="upper left")
save_figure(fig, "figs/grouped_bar", formats=("pdf", "png"), dpi=300)
```

Stacked counts and the 100% stacked share of the same data, side by side:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, label_bars, text_color_for, OKABE_ITO

apply_style("journal", journal={"width_in": 7.16, "font_pt": 8, "font_family": ["Arial"]})
fig, (ax_abs, ax_pct) = plt.subplots(1, 2, figsize=(7.16, 2.6), layout="constrained")

# --- data: rows = parts of the total, columns = groups ---
groups = ["Cohort A", "Cohort B", "Cohort C", "Cohort D"]
parts = ["Correct", "Partly correct", "Wrong"]
counts = np.array([[52, 40, 61, 33],
                   [18, 25, 12, 20],
                   [10, 15,  7, 27]])

share = 100 * counts / counts.sum(axis=0)
colors = [OKABE_ITO[4], OKABE_ITO[0], OKABE_ITO[3]]   # check-palette: PASS, grayscale PASS
hatches = ["", "//", ".."]
x = np.arange(len(groups))
for ax, values, fmt in ((ax_abs, counts, "{:.0f}"), (ax_pct, share, "{:.0f}%")):
    bottom = np.zeros(len(groups))
    for name, row, color, hatch in zip(parts, values, colors, hatches):
        bars = ax.bar(x, row, 0.6, bottom=bottom, color=color, edgecolor="black",
                      linewidth=0.6, hatch=hatch, label=name)
        # label_bars draws an outline around each label, so the hatch does not hide it
        label_bars(ax, bars, fmt=fmt, label_type="center",
                   color=text_color_for(color), fontsize=6)
        bottom += row
    ax.set_xticks(x, groups)
ax_abs.set_ylabel("Count")
ax_pct.set_ylabel("Share (%)")
ax_pct.set_ylim(0, 100)
handles, labels = ax_abs.get_legend_handles_labels()
fig.legend(handles[::-1], labels[::-1], loc="outside right center")   # top part first
save_figure(fig, "figs/stacked_bar", formats=("pdf", "png"), dpi=300)
```

A single stacked bar is the second block with one group. For the composition
of one categorical variable, a value-sorted horizontal bar is the first choice:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, label_bars, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.0), layout="constrained")

# --- data ---
labels = np.array(["Retrieval", "Planning", "Tool use", "Memory", "Reflection"])
values = np.array([12.4, 30.1, 22.7, 8.9, 25.9])

order = np.argsort(values)          # largest value at the top
bars = ax.barh(labels[order], values[order], height=0.6, color=OKABE_ITO[4])
label_bars(ax, bars, fmt="{:.1f}%", padding=2, fontsize=7)
ax.set_xlabel("Share of errors (%)")
ax.set_xlim(0, values.max() * 1.15)
save_figure(fig, "figs/sorted_hbar", formats=("pdf", "png"), dpi=300)
```

- **Journal export**: put a double-column card width in `width_in` and in the
  `figsize` width (second block: 7.16 in, IEEE double column).
- **Common errors**: a pie chart for the composition (P3); a y axis that does
  not start at zero for counts or shares (P4); more than about seven series
  (P7); color as the only encoding in a grayscale print (P13). Keep the same
  color and hatch per part in every panel.

## 12. Mean ± error bars (均值 ± 误差柱)

- **When to use**: `chart-selection.md` axis 2 rows "Comparison" (bar with
  error bars) and "Uncertainty" (error bars or a confidence band); axis 3 row
  "n ≥ 30". The boundary row "Bar with error vs box" applies: use a bar only
  when n ≥ 30 and the distribution has one peak. The second block covers the
  claim rows "A and B diverge most at t = 3" (line with an error band) and
  "Between-subject variability is large" (spaghetti plot). The catalog family
  `f4p_bar_mean_std` gives the poster-size version.
- **Data shape**: one sample per group (first block); a subjects × time points
  matrix per condition (second block).

Mean ± SD bars with the value above the error cap:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: one sample per group, n >= 30 ---
rng = np.random.default_rng(0)
groups = ["Control", "Drug A", "Drug B"]
samples = [rng.normal(m, 6, 40) for m in (42, 55, 61)]

means = np.array([s.mean() for s in samples])
sds = np.array([s.std(ddof=1) for s in samples])
x = np.arange(len(groups))
ax.bar(x, means, 0.6, yerr=sds, capsize=3, color=OKABE_ITO[:3], edgecolor="black",
       linewidth=0.6, error_kw={"elinewidth": 0.8, "capthick": 0.8})
for xi, m, s in zip(x, means, sds):
    ax.annotate(f"{m:.1f}", (xi, m + s), xytext=(0, 2), textcoords="offset points",
                ha="center", va="bottom", fontsize=6)   # 2 pt above the error cap
ax.set_xticks(x, groups)
ax.set_ylabel("Response (a.u.)")
ax.set_ylim(0, (means + sds).max() * 1.2)
ax.text(0.02, 0.98, f"Mean ± SD, n = {len(samples[0])} per group",
        transform=ax.transAxes, va="top", fontsize=6)   # declare the error type (P9)
# For values such as 1e5, call figstyle.sci_ticks(ax) for scientific tick labels.
save_figure(fig, "figs/mean_sd_bar", formats=("pdf", "png"), dpi=300)
```

Repeated measures: mean ± 95% CI band per condition, one thin line per subject:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: per condition, 30 subjects x 5 time points ---
rng = np.random.default_rng(0)
t = np.arange(1, 6)
data = {
    "Drug A": 40 + 5 * t + rng.normal(0, 4, (30, 1)) + rng.normal(0, 2, (30, 5)),
    "Drug B": 40 + 2 * t + rng.normal(0, 4, (30, 1)) + rng.normal(0, 2, (30, 5)),
}

for (name, y), color in zip(data.items(), [OKABE_ITO[4], OKABE_ITO[5]]):
    ax.plot(t, y.T, color=color, lw=0.4, alpha=0.25)          # one line per subject
    mean = y.mean(axis=0)
    half = 1.96 * y.std(axis=0, ddof=1) / np.sqrt(len(y))     # normal-approximation 95% CI
    ax.fill_between(t, mean - half, mean + half, color=color, alpha=0.25, lw=0)
    ax.plot(t, mean, color=color, lw=1.5, marker="o", ms=3, label=f"{name} (n = {len(y)})")
ax.set_xticks(t)
ax.set_xlabel("Time point")
ax.set_ylabel("Response (a.u.)")
ax.margins(y=0.12)                  # this response has no natural zero
ax.legend(loc="upper left")
# Caption: "band = 95% CI of the mean (normal approximation); thin lines = subjects" (P9).
save_figure(fig, "figs/mean_ci_spaghetti", formats=("pdf", "png"), dpi=300)
```

- **Journal export**: default `formats=("pdf", "png")`. The text above the
  error caps uses 6 pt; keep it at or above the card minimum.
- **Common errors**: a mean bar at small n (P1; below n = 30 use section 14 or
  13); an error type that is not declared (P9; state SD, SEM, or CI, and n); a
  bar axis that does not start at zero (P4); a line through categorical x
  values (P6).

## 13. Strip plot and beeswarm (strip / beeswarm)

- **When to use**: `chart-selection.md` axis 3 rows "n < 3" (plot every point)
  and "3 ≤ n < 10" (strip plot, beeswarm, or dot plot); data-shape row
  "1 categorical + 1 continuous, n < 10".
- **Data shape**: one small sample per group; the groups can have different n.

Pure matplotlib beeswarm with a median line and n in the tick labels:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: one small sample per group ---
rng = np.random.default_rng(0)
groups = ["WT", "KO-1", "KO-2"]
samples = [rng.normal(10, 1.5, 6), rng.normal(13, 2.0, 8), rng.normal(12, 1.0, 5)]


def swarm_offsets(y, dx, dy):
    """Return x offsets so that no two markers overlap (greedy placement)."""
    placed, offsets = [], np.zeros(len(y))
    for k in np.argsort(y):
        for step in range(2 * len(y) + 1):
            cand = (step + 1) // 2 * dx * (1 if step % 2 else -1)
            if all(((cand - px) / dx) ** 2 + ((y[k] - py) / dy) ** 2 >= 1
                   for px, py in placed):
                break
        offsets[k] = cand
        placed.append((cand, y[k]))
    return offsets


all_y = np.concatenate(samples)
dy = np.ptp(all_y) / 25             # approximate marker diameter in data units
for i, (y, color) in enumerate(zip(samples, OKABE_ITO)):
    ax.scatter(i + swarm_offsets(y, 0.07, dy), y, s=14, color=color,
               edgecolors="black", linewidths=0.4, zorder=3)
    ax.hlines(np.median(y), i - 0.25, i + 0.25, color="black", lw=1)
ax.set_xticks(range(len(groups)), [f"{g}\n(n = {len(y)})" for g, y in zip(groups, samples)])
ax.set_xlim(-0.6, len(groups) - 0.4)
ax.set_ylabel("Expression (a.u.)")
ax.margins(y=0.12)
save_figure(fig, "figs/beeswarm", formats=("pdf", "png"), dpi=300)
```

seaborn form (needs seaborn):

```python
import seaborn as sns
x_labels = np.repeat(groups, [len(y) for y in samples])
sns.swarmplot(x=x_labels, y=all_y, hue=x_labels, palette=OKABE_ITO[:len(groups)],
              size=4, edgecolor="black", linewidth=0.4, legend=False, ax=ax)
```

- **Dot plot alternate**: draw one marker per group at the mean with an error
  bar, `ax.errorbar(x, means, yerr=sds, fmt="o", capsize=2)`, and state the
  error type (P9).
- **Journal export**: default `formats=("pdf", "png")`. Small markers
  (`s=14`) must stay separate at the final width; examine them in the preview.
- **Common errors**: a box plot or a mean bar at n < 10 (P1); jitter so large
  that points move into the next group; no n in the figure or the caption (P9).

## 14. Box plot with raw points (箱线加原始点)

- **When to use**: `chart-selection.md` axis 3 row "10 ≤ n < 30" (box plot and
  a strip plot of the raw points); data-shape row "1 categorical + 1
  continuous, n ≥ 10"; axis 2 row "Comparison". The boundary row "Bar with
  error vs box" selects the box when n ≥ 10 or the shape is unknown.
- **Data shape**: one sample per group, n from about 10 to 30.

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import to_rgba
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: one sample per group, 10 <= n < 30 ---
rng = np.random.default_rng(0)
groups = ["Model A", "Model B", "Model C"]
samples = [rng.normal(50, 8, 18), rng.normal(58, 10, 22), rng.normal(63, 7, 15)]

x = np.arange(len(groups))
bp = ax.boxplot(samples, positions=x, widths=0.5, patch_artist=True,
                showfliers=False,   # the raw points already show every outlier
                medianprops={"color": "black", "lw": 1})
for patch, color in zip(bp["boxes"], OKABE_ITO):
    patch.set_facecolor(to_rgba(color, 0.5))
    patch.set_edgecolor("black")
for xi, y in zip(x, samples):
    jitter = rng.uniform(-0.12, 0.12, len(y))
    ax.scatter(xi + jitter, y, s=6, color="black", alpha=0.6, edgecolors="none", zorder=3)
ax.set_xticks(x, [f"{g}\n(n = {len(y)})" for g, y in zip(groups, samples)])
ax.set_ylabel("Score")
ax.margins(y=0.12)
save_figure(fig, "figs/box_points", formats=("pdf", "png"), dpi=300)
```

seaborn form (needs seaborn):

```python
import seaborn as sns
x_labels = np.repeat(groups, [len(y) for y in samples])
y_all = np.concatenate(samples)
sns.boxplot(x=x_labels, y=y_all, hue=x_labels, palette=OKABE_ITO[:len(groups)],
            showfliers=False, width=0.5, legend=False, ax=ax)
sns.stripplot(x=x_labels, y=y_all, color="black", size=2.5, jitter=0.12, alpha=0.6, ax=ax)
```

- **Journal export**: default `formats=("pdf", "png")`.
- **Common errors**: outliers drawn two times (fliers plus raw points; set
  `showfliers=False`); a box plot at n < 10 (use section 13); no n per group
  (P9). matplotlib 3.9 renames `boxplot(labels=...)` to `tick_labels`;
  `ax.set_xticks(x, labels)` works in all versions.

## 15. Violin plot (小提琴)

- **When to use**: `chart-selection.md` axis 2 row "Comparison" (box plot or
  violin); axis 3 rows "10 ≤ n < 30" (with a strip overlay) and "n ≥ 30";
  data-shape row "1 continuous, distribution" (alternate). A violin shows a
  bimodal shape that a box hides.
- **Data shape**: one sample per group, n ≥ 30 (or 10–30 with raw points).

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: one sample per group, n >= 30; group C is bimodal ---
rng = np.random.default_rng(0)
groups = ["A", "B", "C"]
samples = [rng.normal(52, 6, 60), rng.normal(58, 9, 60),
           np.concatenate([rng.normal(45, 4, 30), rng.normal(68, 4, 30)])]

x = np.arange(len(groups))
parts = ax.violinplot(samples, positions=x, widths=0.7, showextrema=False,
                      bw_method="scott")   # record the bandwidth rule (M4)
for body, color in zip(parts["bodies"], OKABE_ITO):
    body.set_facecolor(color)
    body.set_edgecolor("black")
    body.set_linewidth(0.6)
    body.set_alpha(0.6)
q1, med, q3 = np.array([np.percentile(y, [25, 50, 75]) for y in samples]).T
ax.vlines(x, q1, q3, color="black", lw=2.5)                        # interquartile range
ax.scatter(x, med, s=12, color="white", edgecolors="black", linewidths=0.6, zorder=3)
ax.set_xticks(x, [f"{g}\n(n = {len(y)})" for g, y in zip(groups, samples)])
ax.set_ylabel("Latency (ms)")
ax.margins(y=0.12)
save_figure(fig, "figs/violin", formats=("pdf", "png"), dpi=300)
```

The seaborn form is
`sns.violinplot(x=x_labels, y=y_all, cut=0, inner="quart", bw_method="scott", ax=ax)`,
with `x_labels` and `y_all` built as in the seaborn form of section 14. Set
`cut=0`, because the seaborn default draws density past the data range.

- **Journal export**: default `formats=("pdf", "png")`.
- **Common errors**: a violin at n < 10 (use section 13); a bandwidth that is
  not reported (M4); density past the data range (seaborn `cut` default); no
  raw points for 10 ≤ n < 30 (add the scatter of section 14).

## 16. Kernel density estimate (KDE)

- **When to use**: `chart-selection.md` axis 2 row "Distribution" (histogram or
  KDE); data-shape row "1 continuous, distribution" (first choice). Use the
  histogram of family 4 when the bin counts matter. The catalog family
  `f4p_concept_density` gives the poster-size density illustration.
- **Data shape**: one continuous sample per group.

Pure numpy Gaussian KDE, with the bandwidth in the legend:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: one sample per group ---
rng = np.random.default_rng(0)
data = {"Train": rng.normal(0.0, 1.0, 400),
        "Test": np.concatenate([rng.normal(0.4, 0.8, 150), rng.normal(2.5, 0.5, 50)])}


def kde_1d(x, grid):
    """Gaussian KDE with the Silverman rule-of-thumb bandwidth."""
    bw = 1.06 * x.std(ddof=1) * len(x) ** (-1 / 5)
    z = (grid[:, None] - x[None, :]) / bw
    return np.exp(-0.5 * z**2).sum(axis=1) / (len(x) * bw * np.sqrt(2 * np.pi)), bw


grid = np.linspace(-4, 5, 400)
for (name, x), color in zip(data.items(), [OKABE_ITO[4], OKABE_ITO[5]]):
    dens, bw = kde_1d(x, grid)
    ax.fill_between(grid, dens, color=color, alpha=0.25, lw=0)
    ax.plot(grid, dens, color=color, lw=1.2, label=f"{name} (n = {len(x)}, h = {bw:.2f})")
ax.set_xlabel("Feature value")
ax.set_ylabel("Density")
ax.margins(y=0.12)
ax.set_ylim(bottom=0)               # density has a natural zero (P4)
ax.legend(loc="upper right")
save_figure(fig, "figs/kde", formats=("pdf", "png"), dpi=300)
```

The seaborn form is
`sns.kdeplot(x=x, bw_method="silverman", fill=True, color=color, ax=ax)`, with
one call per group.

- **Journal export**: default `formats=("pdf", "png")`.
- **Common errors**: a bandwidth that is chosen after you see the result, or
  that is not reported (M4); a KDE at small n (below about 30, show the points,
  section 13); two colors that differ only in red and green (P13).

## 17. Scatter with a fit line (散点加拟合线)

- **When to use**: `chart-selection.md` axis 2 row "Relation" (scatter plot
  with a fit line); data-shape rows "2 continuous" (scatter + fit line,
  alternates 2D KDE and hexbin) and "3–20 continuous variables" (pair grid
  alternate); axis 3 row "Total points > 10⁴" (alpha, hexbin, or 2D KDE);
  boundary rows "Line vs scatter" and "Heat map vs pair grid".
- **Data shape**: two continuous arrays of the same length (first and second
  blocks); an n × k matrix with 2–8 variables (third block).

Scatter, least-squares line, and a 95% bootstrap band:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data ---
rng = np.random.default_rng(0)
x = rng.uniform(0, 10, 80)
y = 1.8 * x + 4 + rng.normal(0, 2.5, x.size)

slope, intercept = np.polyfit(x, y, 1)
r = np.corrcoef(x, y)[0, 1]
grid = np.linspace(x.min(), x.max(), 100)
boot = np.empty((500, grid.size))
for b in range(500):                 # bootstrap the fit, numpy only
    idx = rng.integers(0, x.size, x.size)
    s_b, i_b = np.polyfit(x[idx], y[idx], 1)
    boot[b] = s_b * grid + i_b
lo, hi = np.percentile(boot, [2.5, 97.5], axis=0)
ax.scatter(x, y, s=10, color=OKABE_ITO[4], edgecolors="none", alpha=0.8)
ax.fill_between(grid, lo, hi, color=OKABE_ITO[5], alpha=0.2, lw=0, label="95% bootstrap CI")
ax.plot(grid, slope * grid + intercept, color=OKABE_ITO[5], lw=1.2,
        label=f"y = {slope:.2f}x + {intercept:.2f}")
ax.text(0.02, 0.98, f"r = {r:.2f}, n = {x.size}", transform=ax.transAxes, va="top")
ax.set_xlabel("Dose (mg)")
ax.set_ylabel("Response (a.u.)")
ax.margins(y=0.12)
ax.legend(loc="lower right")
save_figure(fig, "figs/scatter_fit", formats=("pdf", "png"), dpi=300)
```

More than 10⁴ points: hexbin, and a 2D KDE on a subsample:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure

apply_style("journal", journal={"width_in": 7.16, "font_pt": 8, "font_family": ["Arial"]})
fig, (ax_hex, ax_kde) = plt.subplots(1, 2, figsize=(7.16, 2.8), layout="constrained",
                                     sharex=True, sharey=True)

# --- data: 20 000 points ---
rng = np.random.default_rng(0)
x = rng.normal(0, 1, 20_000)
y = 0.6 * x + rng.normal(0, 0.8, x.size)

hb = ax_hex.hexbin(x, y, gridsize=40, cmap="viridis", mincnt=1)
fig.colorbar(hb, ax=ax_hex, label="Count")
sub = rng.choice(x.size, 1500, replace=False)       # memory grows with grid cells x points
xs, ys = x[sub], y[sub]
hx = xs.std(ddof=1) * xs.size ** (-1 / 6)           # Scott's rule in 2D
hy = ys.std(ddof=1) * ys.size ** (-1 / 6)
gx, gy = np.meshgrid(np.linspace(-4, 4, 60), np.linspace(-4, 4, 60))
zx = (gx.ravel()[:, None] - xs) / hx
zy = (gy.ravel()[:, None] - ys) / hy
dens = np.exp(-0.5 * (zx**2 + zy**2)).sum(axis=1) / (xs.size * 2 * np.pi * hx * hy)
levels = np.linspace(0.05, 1.0, 8) * dens.max()     # lowest level > 0: empty area stays white
cs = ax_kde.contourf(gx, gy, dens.reshape(gx.shape), levels=levels, cmap="viridis")
fig.colorbar(cs, ax=ax_kde, label="Density", format="%.2f")
for ax in (ax_hex, ax_kde):
    ax.set_xlabel("x")
ax_hex.set_ylabel("y")
ax_hex.set_title("Hexbin, n = 20 000")
ax_kde.set_title(f"2D KDE, subsample n = {xs.size}")
save_figure(fig, "figs/hexbin_kde2d", formats=("pdf", "png"), dpi=300)
```

Pair grid for 2–8 variables. seaborn `pairplot(df, corner=True)` draws the same
grid, but it needs seaborn and pandas:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
names = ["A", "B", "C", "D"]
k = len(names)
fig, axes = plt.subplots(k, k, figsize=(3.5, 3.5), layout="constrained", sharex="col")

# --- data: n x k matrix ---
rng = np.random.default_rng(0)
cov = np.array([[1.0, 0.7, 0.2, 0.0], [0.7, 1.0, 0.3, 0.1],
                [0.2, 0.3, 1.0, -0.5], [0.0, 0.1, -0.5, 1.0]])
data = rng.multivariate_normal(np.zeros(k), cov, 150)

for i in range(k):
    for j in range(k):
        ax = axes[i, j]
        ax.tick_params(labelsize=6)
        if i == j:
            ax.hist(data[:, i], bins=15, color=OKABE_ITO[4])
            ax.set_yticks([])
        elif i > j:
            ax.scatter(data[:, j], data[:, i], s=2, color=OKABE_ITO[4], edgecolors="none")
        else:                        # upper triangle: the correlation value only
            r = np.corrcoef(data[:, i], data[:, j])[0, 1]
            ax.text(0.5, 0.5, f"r = {r:.2f}", ha="center", va="center",
                    transform=ax.transAxes, fontsize=7)
            ax.set_axis_off()
        if j > 0:
            ax.tick_params(labelleft=False)
        if j == 0:
            ax.set_ylabel(names[i])
        if i == k - 1:
            ax.set_xlabel(names[j])
save_figure(fig, "figs/pair_grid", formats=("pdf", "png"), dpi=300)
```

- **Journal export**: default `formats=("pdf", "png")`. With many points, pass
  `rasterized=True` to `ax.scatter` to keep the PDF small; the axes and the
  text stay vector.
- **Common errors**: a line through unordered points (P6; see the boundary row
  "Line vs scatter"); a band type that is not declared (P9); a log axis without
  a label for the scale (M3); opaque markers that hide the density at n > 10⁴.

## 18. Annotated heat map (带数值标注的热图)

- **When to use**: `chart-selection.md` data-shape rows "Matrix data" (heat
  map with a uniform colormap), "Binary classifier performance"
  (confusion-matrix heat map), and "More than 20 continuous variables"
  (clustered heat map, second block). For a correlation matrix of 3–20
  variables, use family 5. The catalog family `f4p_heatmap_annotated` gives
  the poster-size versions (column normalization, summary rows).
- **Data shape**: a 2D matrix of counts or values, with row and column labels.

Confusion matrix. The color shows the row share, the text shows the count and
the share, and the tick labels show the row totals:

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import Normalize
from figstyle import apply_style, save_figure, text_color_for

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 3.0), layout="constrained")

# --- data: rows = true class, columns = predicted class ---
classes = ["Cat", "Dog", "Fox", "Owl"]
counts = np.array([[48,  5,  2,  0],
                   [ 6, 41,  7,  1],
                   [ 3,  9, 35,  3],
                   [ 0,  1,  2, 52]])

row_pct = 100 * counts / counts.sum(axis=1, keepdims=True)
cmap = plt.get_cmap("viridis")
norm = Normalize(vmin=0, vmax=100)  # fixed limits, equal in every compared panel (M5)
im = ax.imshow(row_pct, cmap=cmap, norm=norm)
for i in range(len(classes)):
    for j in range(len(classes)):
        ax.text(j, i, f"{counts[i, j]}\n{row_pct[i, j]:.0f}%", ha="center", va="center",
                fontsize=6, color=text_color_for(cmap(norm(row_pct[i, j]))))
ax.set_xticks(range(len(classes)), classes)
ax.set_yticks(range(len(classes)),
              [f"{c} (n = {t})" for c, t in zip(classes, counts.sum(axis=1))])
ax.set_xlabel("Predicted class")
ax.set_ylabel("True class")
ax.spines[:].set_visible(False)
ax.tick_params(length=0)
fig.colorbar(im, ax=ax, shrink=0.8, label="Share of true class (%)")   # P5
save_figure(fig, "figs/confusion_heatmap", formats=("pdf", "png"), dpi=300)
```

Clustered heat map for more than 20 variables. The pure form orders the
variables by spectral seriation (the Fiedler vector of the graph Laplacian of
`|r|`), with numpy only. seaborn `clustermap` adds dendrograms, but it needs
scipy.

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 3.2), layout="constrained")

# --- data: 200 samples x 24 variables in 3 hidden blocks, shuffled ---
rng = np.random.default_rng(0)
latent = rng.normal(size=(200, 3))
X = latent @ np.repeat(np.eye(3), 8, axis=0).T + rng.normal(0, 0.8, (200, 24))
perm = rng.permutation(24)
X, names = X[:, perm], [f"V{p + 1}" for p in perm]

corr = np.corrcoef(X, rowvar=False)
A = np.abs(corr)
laplacian = np.diag(A.sum(axis=1)) - A
fiedler = np.linalg.eigh(laplacian)[1][:, 1]        # second-smallest eigenvalue
order = np.argsort(fiedler)
im = ax.imshow(corr[np.ix_(order, order)], cmap="RdBu_r", vmin=-1, vmax=1)
labels = [names[o] for o in order]
ax.set_xticks(range(len(labels)), labels, rotation=90, fontsize=5)
ax.set_yticks(range(len(labels)), labels, fontsize=5)
ax.spines[:].set_visible(False)
ax.tick_params(length=0)
fig.colorbar(im, ax=ax, shrink=0.8, label="Pearson r")
save_figure(fig, "figs/clustered_heatmap", formats=("pdf", "png"), dpi=300)
```

Spectral seriation is one ordering rule. State the rule in the caption, because
the order changes what the reader sees.

- **Journal export**: `imshow` is stored as one raster image inside the PDF;
  the text and the colorbar labels stay vector. Keep the cell text at or above
  the card minimum (6 pt here). Tick labels at 5 pt are below the minimum of
  some cards; in that case, split the figure ("When to split the figure" in
  `chart-selection.md`).
- **Common errors**: `jet` or `rainbow` (P14); no colorbar or no unit (P5);
  color limits that change between compared panels (M5); a diverging map for
  data with no center, or a sequential map for signed data (P14).

## 19. ROC and PR curves (ROC 与 PR 曲线)

- **When to use**: `chart-selection.md` data-shape row "Binary classifier
  performance" (ROC or PR curve first; the confusion-matrix heat map of
  section 18 is the alternate). Use PR when the positive class is rare; the PR
  chance line equals the prevalence.
- **Data shape**: the true labels (0 or 1) and one score array per model.

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from figstyle import apply_style, save_figure, OKABE_ITO, NEUTRAL_GRAY

apply_style("journal", journal={"width_in": 7.16, "font_pt": 8, "font_family": ["Arial"]})
fig, (ax_roc, ax_pr) = plt.subplots(1, 2, figsize=(7.16, 3.2), layout="constrained")

# --- data: labels and one score array per model ---
rng = np.random.default_rng(0)
y_true = (rng.random(600) < 0.25).astype(int)       # prevalence about 0.25
scores = {"Model A": 1.4 * y_true + rng.normal(0, 1, y_true.size),
          "Model B": 0.8 * y_true + rng.normal(0, 1, y_true.size)}


def roc_pr(y, s):
    """Return fpr, tpr, recall, precision. Tied scores form one threshold."""
    order = np.argsort(-s, kind="stable")
    y, s = y[order], s[order]
    keep = np.r_[s[1:] != s[:-1], True]             # last index of each tied run
    tp = np.cumsum(y)[keep]
    fp = np.cumsum(1 - y)[keep]
    fpr = np.r_[0, fp / fp[-1]]
    tpr = np.r_[0, tp / tp[-1]]
    recall = np.r_[0, tp / tp[-1]]
    precision = np.r_[1, tp / (tp + fp)]
    return fpr, tpr, recall, precision


for (name, s), color, ls in zip(scores.items(), [OKABE_ITO[4], OKABE_ITO[5]], ["-", "--"]):
    fpr, tpr, recall, precision = roc_pr(y_true, s)
    auc = np.sum(np.diff(fpr) * (tpr[1:] + tpr[:-1]) / 2)   # trapezoid rule
    ap = np.sum(np.diff(recall) * precision[1:])             # average precision
    ax_roc.plot(fpr, tpr, color=color, ls=ls, lw=1.2, label=f"{name} (AUC = {auc:.2f})")
    # steps-pre: precision[n] holds on (recall[n-1], recall[n]], the same rule as AP
    ax_pr.plot(recall, precision, color=color, ls=ls, lw=1.2, drawstyle="steps-pre",
               label=f"{name} (AP = {ap:.2f})")
ax_roc.plot([0, 1], [0, 1], color=NEUTRAL_GRAY, ls=":", lw=0.8, label="Chance")
prevalence = y_true.mean()
ax_pr.axhline(prevalence, color=NEUTRAL_GRAY, ls=":", lw=0.8,
              label=f"Chance (prevalence = {prevalence:.2f})")
ax_roc.set(xlabel="False positive rate", ylabel="True positive rate")
ax_pr.set(xlabel="Recall", ylabel="Precision")
for ax, loc in ((ax_roc, "lower right"), (ax_pr, "upper right")):
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1.02)
    ax.set_aspect("equal")
    ax.legend(loc=loc, fontsize=6)
save_figure(fig, "figs/roc_pr", formats=("pdf", "png"), dpi=300)
```

If scikit-learn is already in the project, `sklearn.metrics.roc_curve` and
`precision_recall_curve` give the same arrays. The recipe does not import it.

- **Journal export**: default `formats=("pdf", "png")`. Square panels
  (`set_aspect("equal")`) keep the chance diagonal at 45°.
- **Common errors**: an accuracy-only bar for an imbalanced class (the "Do not
  use" column of `chart-selection.md`); color as the only line encoding (P13;
  the recipe adds a line style); no chance line; an AUC or AP without the
  test-set size in the caption (P9).

## 20. Significance brackets (显著性括号)

- **When to use**: `chart-selection.md` axis 2 row "Difference" (box plot with
  a significance annotation) and the claim row "A and B differ at t = 3"
  (paired box plot with a significance bracket).
- **Data shape**: a subjects × conditions matrix (paired) or one sample per
  group, plus the p-values that the user supplies. The recipe draws the
  brackets only. It does not run a statistical test.

```python
import sys; sys.path.insert(0, "<skill-dir>/scripts")
import matplotlib; matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from matplotlib.colors import to_rgba
from figstyle import apply_style, save_figure, OKABE_ITO, NEUTRAL_GRAY

apply_style("journal", journal={"width_in": 3.5, "font_pt": 8, "font_family": ["Arial"]})
fig, ax = plt.subplots(figsize=(3.5, 2.6), layout="constrained")

# --- data: 20 subjects x 3 conditions (paired), at t = 3 ---
rng = np.random.default_rng(0)
conditions = ["Placebo", "Drug A", "Drug B"]
subject = rng.normal(0, 3, (20, 1))
values = subject + np.array([50, 56, 58]) + rng.normal(0, 2.5, (20, 3))
# p-values from the user's test; only the comparisons that the claim needs (P15)
p_values = {(0, 1): 0.0004, (1, 2): 0.048}


def format_p(p):
    return "p < 0.001" if p < 0.001 else f"p = {p:.3f}"


def add_bracket(ax, x1, x2, y, h, text):
    ax.plot([x1, x1, x2, x2], [y, y + h, y + h, y], color="black", lw=0.8)
    ax.text((x1 + x2) / 2, y + h, text, ha="center", va="bottom", fontsize=6)


x = np.arange(len(conditions))
ax.plot(x, values.T, color=NEUTRAL_GRAY, lw=0.4, alpha=0.6, zorder=1)   # one line per subject
bp = ax.boxplot(values, positions=x, widths=0.45, patch_artist=True, showfliers=False,
                medianprops={"color": "black", "lw": 1}, zorder=2)
for patch, color in zip(bp["boxes"], OKABE_ITO):
    patch.set_facecolor(to_rgba(color, 0.6))
    patch.set_edgecolor("black")

top, span = values.max(), np.ptp(values)
step, h = 0.10 * span, 0.02 * span
pairs = sorted(p_values.items(), key=lambda kv: kv[0][1] - kv[0][0])   # short span first
for level, ((i, j), p) in enumerate(pairs):
    add_bracket(ax, i, j, top + step * (level + 0.5), h, format_p(p))
ax.set_ylim(values.min() - 0.15 * span, top + step * (len(pairs) + 1))   # room for the brackets
ax.set_xticks(x, conditions)
ax.set_ylabel("Response at t = 3 (a.u.)")
# Caption: name the test and the correction, for example
# "paired t-test, Holm-corrected, n = 20 subjects" (P9, P15).
save_figure(fig, "figs/significance_brackets", formats=("pdf", "png"), dpi=300)
```

Stars are an alternative label (`*` p < 0.05, `**` p < 0.01, `***` p < 0.001).
Define the star thresholds in the caption. An exact p-value gives more
information.

- **Journal export**: default `formats=("pdf", "png")`. The bracket text uses
  6 pt; keep it at or above the card minimum.
- **Common errors**: a bracket on every pair (P15); no test name or correction
  (P9); brackets that cross (the recipe sorts them by span and stacks them);
  a bracket that the top of the axes clips (P17; the recipe raises `ylim`).

---

## Cross-cutting layout patterns

Adapted from nature-figure's `design-theory.md` and `common-patterns.md` — these
are journal- and library-agnostic and apply on top of any family above.
nature-figure derives these patterns from the scripts of
`ChenLiu-1996/figures4papers` (CC BY-NC 4.0); see `attribution.md`.

- **Hero panel + subordinate row.** Give the primary evidence more area than the
  controls: `gridspec.GridSpec(2, k, height_ratios=[2.2, 1.0])` puts the hero on
  the top row (roughly 45–60% of height) and quieter validation panels below.
- **Legend-only axes.** For dense multi-panel figures, dedicate the last grid cell
  to the legend and call `ax.set_axis_off()` so data panels stay clean and the
  legend is not repeated per panel.
- **Direct labels over legends.** For stable line identities, channels, and fixed
  spatial regions, annotate at the line end (`ax.annotate`) instead of a legend —
  it cuts eye travel. Reserve legends for categories that move between panels.
- **Data-driven y range plus headroom.** When values sit in a narrow band, do not
  anchor to 0–100. Apply the y-axis headroom in `layout-defaults.md`
  (`ax.margins(y=0.12)`), so the effect stays visible and the series does not
  touch the frame.
- **Alpha-gradient ablation.** Encode an ordered ablation as one hue with rising
  alpha, `alphas = np.linspace(0.2, 1.0, n)`, rather than n unrelated colors.
- **Hatch for grayscale-safe bars.** Add `hatch` patterns
  (`['/', '\\', '.', 'x', 'o', '+']`) with black edges so bars stay distinguishable
  in grayscale print (IEEE/Nature both require grayscale readability).
- **Brightness-aware in-bar text.** Choose black or white for a value label by the
  bar's luminance, `0.299*R + 0.587*G + 0.114*B` above/below a mid threshold.
- **One shared color family across panels.** Fix a `{condition: color}` map once and
  reuse it in every panel; keep green/red only for gain/loss or directional cues.

For the multi-panel structures this list does not cover — wide multi-metric rows,
grouped-within-grouped bars, hatched bands, event annotations, spanning hero
panels, dark image plates, and aligned panel labels — see
`panel-layout-patterns.md`.
