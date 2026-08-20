# Chart Recipes

Standalone (non-industrytslib) recipes for the chart families this skill covers,
organized to mirror the industrytslib visualization families so the two paths
stay aligned. If the project uses industrytslib, prefer
`industrytslib-integration.md`; use this file only for the standalone path or for
families that library does not expose.

Read the matched family below **after** you have resolved the journal-style and
library axes and loaded the matching library recipe. Every recipe assumes:

- rcParams (matplotlib) or the layout template (plotly) are already applied via
  `matplotlib-recipes.md` or `plotly-recipes.md`.
- Numeric journal values are **not** repeated here — pull them from the resolved
  card in `journal-specs.md`. The skeletons use named stand-ins for those values:

| Symbol                             | Meaning (from `journal-specs.md` card)                                 |
| ---------------------------------- | ---------------------------------------------------------------------- |
| `W`, `H`                           | figure width / height in **inches**; square panels use `(W, W)`        |
| `W_px`, `H_px`                     | same size in pixels for plotly, `round(W*DPI)` / `round(H*DPI)`        |
| `DPI`                              | raster resolution for the target journal + image type                  |
| `FONT_PT`                          | body font size in points                                               |
| `LW`                               | data line width                                                        |
| `OKABE_ITO`                        | colorblind-safe categorical palette (hex list) from the library recipe |
| `JOURNAL_TEMPLATE`, `JOURNAL_FONT` | plotly template name + font family from `plotly-recipes.md`            |

Export is vector-first (`.pdf`/`.svg`/`.eps` per the card); raster fallbacks use
`DPI`. matplotlib embeds fonts with `pdf.fonttype=42`; plotly's kaleido v1 does
**not** support EPS (export PDF/SVG then convert). See the library recipes.

---

## 1. Time series (时序)

- **Archetype**: quantitative grid — one aligned time axis per variable, small
  multiples stacked so scales stay comparable.
- **Journal params**: wide aspect favors the double-column width; watch tick font
  (`FONT_PT`) and `LW`; direct-label each channel instead of a legend.

```python
import matplotlib.pyplot as plt

fig, axes = plt.subplots(n_vars, 1, figsize=(W, H), sharex=True)
for ax, (name, series) in zip(axes, variables.items()):
    ax.plot(t, series, color=OKABE_ITO[0], lw=LW)
    ax.set_ylabel(name)                       # direct label, no legend
    ax.spines[["top", "right"]].set_visible(False)
axes[-1].set_xlabel("Time")
fig.savefig("timeseries.pdf", bbox_inches="tight")   # vector-first per spec card
```

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
- **Journal params**: keep ground-truth neutral (`OKABE_ITO[7]`) and prediction a
  signal color; optional confidence band uses low alpha.

```python
fig, ax = plt.subplots(figsize=(W, H))
ax.plot(t, y_true, color=OKABE_ITO[7], lw=LW, label="Ground truth")
ax.plot(t, y_pred, color=OKABE_ITO[0], lw=LW, label="Prediction")
ax.fill_between(t, lo, hi, color=OKABE_ITO[0], alpha=0.15, lw=0)   # optional CI band
ax.set_xlabel("Time"); ax.set_ylabel("Value")
ax.legend(frameon=False, loc="best")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("pred.pdf", bbox_inches="tight")
```

```python
fig = go.Figure()
fig.add_trace(go.Scatter(x=t, y=y_true, name="Ground truth", line=dict(color=OKABE_ITO[7], width=LW)))
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
fig, ax = plt.subplots(figsize=(W, H))
bp = ax.boxplot(data_by_group, patch_artist=True, widths=0.6)
for patch, c in zip(bp["boxes"], OKABE_ITO):
    patch.set_facecolor(c); patch.set_alpha(0.8); patch.set_edgecolor("black")
ax.set_xticklabels(group_labels)
ax.set_ylabel("Absolute error")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("box.pdf", bbox_inches="tight")
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
fig, ax = plt.subplots(figsize=(W, H))
ax.hist(train, bins=40, density=True, color=OKABE_ITO[0], alpha=0.5, label="Train")
ax.hist(test,  bins=40, density=True, color=OKABE_ITO[5], alpha=0.5, label="Test")
ax.set_xlabel(feature_name); ax.set_ylabel("Density")
ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("dist.pdf", bbox_inches="tight")
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
fig, ax = plt.subplots(figsize=(W, W))               # square
im = ax.imshow(corr, cmap="RdBu_r", vmin=-1, vmax=1)  # diverging, centered at 0
ax.set_xticks(range(len(labels))); ax.set_xticklabels(labels, rotation=90)
ax.set_yticks(range(len(labels))); ax.set_yticklabels(labels)
cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04); cbar.set_label("Pearson r")
fig.savefig("corr.pdf", bbox_inches="tight")
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
- **Journal params**: thin lines (`LW`); shared legend; GAN G/D uses a second y
  axis via `ax.twinx()`, VAE multi-component uses one line per component.

```python
fig, ax = plt.subplots(figsize=(W, H))
ax.plot(epochs, train_loss, color=OKABE_ITO[0], lw=LW, label="Train")
ax.plot(epochs, val_loss,   color=OKABE_ITO[5], lw=LW, label="Validation")
ax.set_xlabel("Epoch"); ax.set_ylabel("Loss")
ax.set_yscale("log")                     # if loss spans orders of magnitude
ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("loss.pdf", bbox_inches="tight")
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
fig, ax = plt.subplots(figsize=(W, H))
ax.plot(t, y_true, color=OKABE_ITO[7], lw=LW, label="Ground truth")
ax.plot(t, y_pred, color=OKABE_ITO[0], lw=LW, label="Prediction")
ax.fill_between(t, lower, upper, color=OKABE_ITO[0], alpha=0.2, lw=0, label="90% PI")
ax.set_xlabel("Time"); ax.set_ylabel("Value"); ax.legend(frameon=False)
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("interval.pdf", bbox_inches="tight")
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
fig, ax = plt.subplots(figsize=(W, W))
for cls, c in zip(classes, OKABE_ITO):
    m = labels == cls
    ax.scatter(emb[m, 0], emb[m, 1], s=8, color=c, edgecolors="none", label=str(cls))
ax.set_xlabel("t-SNE 1"); ax.set_ylabel("t-SNE 2")
ax.legend(frameon=False, markerscale=2, loc="best")
ax.spines[["top", "right"]].set_visible(False)
fig.savefig("tsne.pdf", bbox_inches="tight")
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
fig, axes = plt.subplots(rows, cols, figsize=(W, H), sharex=True)
for ax, v in zip(axes.ravel(), range(n_vars)):
    ax.plot(seq_true[:, v], color=OKABE_ITO[7], lw=LW)
    ax.plot(seq_pred[:, v], color=OKABE_ITO[0], lw=LW)
    ax.set_title(var_names[v], fontsize=plt.rcParams["axes.titlesize"])
    ax.spines[["top", "right"]].set_visible(False)
fig.supxlabel("Step"); fig.tight_layout()
fig.savefig("sequences.pdf", bbox_inches="tight")
```

```python
fig = make_subplots(rows=rows, cols=cols, subplot_titles=var_names, shared_xaxes=True)
for v in range(n_vars):
    r, c = v // cols + 1, v % cols + 1
    fig.add_trace(go.Scatter(y=seq_true[:, v], line=dict(color=OKABE_ITO[7], width=LW), showlegend=False), row=r, col=c)
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

## Cross-cutting layout patterns

Adapted from nature-figure's `design-theory.md` and `common-patterns.md` — these
are journal- and library-agnostic and apply on top of any family above.

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
