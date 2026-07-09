# industrytslib Integration

When a project already uses **industrytslib**, drive figures through its built-in
visualization system instead of the standalone recipes. That library ships a
registry-based plotter, matplotlib + plotly backends, five journal styles
(`ieee` / `elsevier` / `nature` / `springer` / `chinese_thesis`), and an export
pipeline. **Call it, never modify it.**

Every API name, module path, and backend note below is transcribed from the task
research report `research/industrytslib-viz-inventory.md`; the section tags (for
example "inv §1.1") point back to it. Do not invent method names — if a family is
not in the mapping table, use the generic path (B) below.

## Detection

Take the integration path when **either** holds:

1. The user explicitly names industrytslib (or asks to use "the project's plotter
   / create_plotter / journal styles").
2. The project's `pyproject.toml` / dependency list / source imports include
   `industrytslib` (grep for `from industrytslib` or `import industrytslib`).

Otherwise use the standalone path (`journal-specs.md` + a library recipe).

## Two paths

**(A) Family hit → call the plotter's business method.** The library only exposes
task-shaped methods (train/test/loss/box/corr/dist/attention/…), not generic
`scatter`/`bar`/`violin`. If the request maps to a family in the table below,
build a plotter and call that method:

```python
from industrytslib.utils.visualization import create_plotter   # inv §4.1

plotter = create_plotter("matplotlib", "MyProject", style="ieee")  # registry entry
# plotter.set_style("nature")            # runtime style switch, inv §4.1 (core/base.py:95)
# plotter.set_visualization_options(opts)  # language/labels/export, inv §4.1 (core/base.py:107)
plotter.plot_test_result(...)            # a family method from the table
```

Entry points (inv §4.1): `create_plotter(backend, project_name, style="ieee", visualization_options=None)`
(`core/registry.py:145`), `plotter_builder(plotter_type, project_name, style="ieee")`
(`__init__.py:57`), `plotter.set_style(style_name)` (`core/base.py:95`),
`plotter.set_visualization_options(options)` (`core/base.py:107`).

**(B) Family miss (generic scatter/bar/violin/…) → native matplotlib, reuse only
the journal style.** The library has no generic chart API, so draw with native
matplotlib and borrow just its style layer:

```python
from industrytslib.utils.visualization.styles import StyleManager   # inv §2.4
import matplotlib.pyplot as plt

StyleManager.apply_style_to_matplotlib("ieee")   # rcParams + fonts + prop_cycle, inv §2.4 (styles/manager.py)
fig, ax = plt.subplots()
# ... native matplotlib per chart-recipes.md ...
```

For a Chinese/CJK figure on the generic path, prefer
`apply_visualization_options_to_matplotlib(resolve_visualization_style_options({"style": "chinese_thesis", "language": "zh"}))`
(`core/style_options.py`, inv §4.1 / §5.3) — it force-injects a resolved CJK font
family, which bare `apply_style_to_matplotlib` does not.

**An explicit seaborn request is path (B), even when the chart type maps to a
plotter method.** The plotters do not use seaborn (inv §5.2: the library has no
seaborn violin/pairplot/jointplot/clustermap API), so "make a … figure with
seaborn" — including a seaborn t-SNE, which otherwise maps to `tsne_plotter` —
draws natively (seaborn + `chart-recipes.md`) and borrows only the style via
`apply_style_to_matplotlib`. For a strict sans-serif journal (Nature/Elsevier),
also apply caveat 1's font override, since the borrowed style renders serif/Times.

## Family → method mapping

Backend column: "both" = matplotlib + plotly; "mpl" / "plotly" = that backend only;
"dual" = the standalone chart class implements both. Locations are `module:line`
inside `src/industrytslib/utils/visualization/`.

| Family                  | Method (verbatim)                                                                                | Location                                                                         | Backend        | Inv  |
| ----------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | -------------- | ---- |
| Time series             | `plot_input_curve` / `plot_output_curve`                                                         | `backends/*/mixins/data_analysis_mixin.py:29` / `:114`                           | both           | §1.1 |
| Time series             | `TimeSeriesChart.plot`                                                                           | `charts/timeseries.py:34`                                                        | both           | §1.2 |
| Time series             | `plot_full_timeline_png`                                                                         | `analysis/sequence.py:1764`                                                      | mpl            | §1.4 |
| Time series             | `plot_full_timeline_html`                                                                        | `analysis/sequence.py:1504`                                                      | plotly         | §1.4 |
| True/pred               | `plot_train_result`                                                                              | `backends/*/mixins/training_mixin.py:26` (mpl) / `:20` (plotly)                  | both           | §1.1 |
| True/pred               | `plot_test_result` / `plot_test_result2`                                                         | `backends/*/mixins/evaluation_mixin.py:28` / `:147`                              | both           | §1.1 |
| True/pred               | `plot_train_result_ndarray` / `plot_test_result_ndarray`                                         | `backends/base_mixin.py:55` / `:135`                                             | both           | §1.1 |
| True/pred               | `ComparisonChart.plot_true_vs_pred` / `ComparisonChart.plot_enhanced`                            | `charts/comparison.py:33` / `:71`                                                | both           | §1.2 |
| Boxplot                 | `plot_test_result_boxplot`                                                                       | `backends/*/mixins/evaluation_mixin.py:292`                                      | both           | §1.1 |
| Boxplot                 | `plot_model_comparison_boxplot`                                                                  | `backends/*/mixins/evaluation_mixin.py:335`                                      | both           | §1.1 |
| Boxplot                 | `plot_input_boxplot` / `plot_output_boxplot`                                                     | `backends/*/mixins/data_analysis_mixin.py:199` / `:247`                          | both           | §1.1 |
| Boxplot                 | `BoxplotChart.plot_features` / `BoxplotChart.plot_model_comparison`                              | `charts/boxplot.py:33` / `:61`                                                   | both           | §1.2 |
| Distribution            | `plot_data_distribution`                                                                         | `backends/*/mixins/data_analysis_mixin.py:356`                                   | both           | §1.1 |
| Distribution            | `DistributionChart.plot_error_distribution`                                                      | `charts/distribution.py:33`                                                      | both           | §1.2 |
| Correlation heatmap     | `plot_correlation_matrix`                                                                        | `backends/*/mixins/data_analysis_mixin.py:295`                                   | both           | §1.1 |
| Correlation heatmap     | `HeatmapChart.plot_correlation`                                                                  | `charts/heatmap.py:37`                                                           | both           | §1.2 |
| Training loss           | `plot_loss`                                                                                      | `backends/*/mixins/training_mixin.py:113` (mpl) / `:82` (plotly)                 | both           | §1.1 |
| Training loss (VAE/DiT) | `DiffusionLossChart.plot_vae_losses` / `DiffusionLossChart.plot_dit_losses`                      | `charts/diffusion_loss.py:108` / `:389`                                          | dual           | §1.3 |
| Training loss (GAN)     | `GANLossChart.plot_losses` / `GANLossChart.plot_health_metrics`                                  | `charts/gan_loss.py:120` / `:469`                                                | dual           | §1.3 |
| Generative comparison   | `DiffusionComparisonChart.plot_all` / `.plot_timeseries_comparison` / `.plot_tsne_comparison`    | `charts/diffusion_comparison.py:397` / `:576` / `:1125`                          | plotly         | §1.3 |
| Generative comparison   | `GenerationComparisonChart.plot_label_comparison` / `.plot_feature_distribution`                 | `charts/diffusion_loss.py:600` / `:822`                                          | dual           | §1.3 |
| Interval                | `plot_interval_report`                                                                           | `analysis/interval.py:44`                                                        | mpl            | §1.4 |
| Interval                | `plot_error_distribution`                                                                        | `analysis/interval.py:175`                                                       | mpl            | §1.4 |
| Dim-reduction           | `tsne_plotter` / `umap_plotter`                                                                  | `analysis/dimensionality.py:52` / `:136`                                         | mpl            | §1.4 |
| Dim-reduction           | `input_tsne` / `sequence_tsne_pca_analysis`                                                      | `analysis/dimensionality.py:229` / `:429`                                        | mpl            | §1.4 |
| npy sequence            | `plot_sequences_from_npy` / `plot_npy_all`                                                       | `analysis/sequence.py:1314` / `:1871`                                            | plotly / both  | §1.4 |
| npy sequence            | `plot_npy_per_variable_random_batch` / `plot_npy_per_variable_paper_samples`                     | `analysis/sequence.py:1924` / `:2194`                                            | plotly         | §1.4 |
| Joint training          | `plot_joint_training_val_stage1` / `plot_joint_training_val_stage2` / `plot_joint_training_test` | `backends/*/mixins/specialized_mixin.py:24` / `:80` / `:148`                     | both           | §1.1 |
| Joint training          | `create_overlap_sequence_and_visualize`                                                          | `analysis/joint_training.py:72`                                                  | mpl            | §1.4 |
| Reliability             | `save_reliability_diagram`                                                                       | `analysis/reliability.py:73`                                                     | mpl            | §1.4 |
| Attention               | `plot_attention_heatmap` / `plot_attention_bar`                                                  | `backends/*/mixins/attention_mixin.py:22` / `:118`                               | mpl only       | §1.1 |
| Regression metrics      | `RegressionMetrics` / `OutlierDetector` / `MetricsFormatter`                                     | `metrics/regression.py:24` / `metrics/outlier.py:23` / `metrics/formatter.py:25` | n/a (non-plot) | §1.5 |
| Training report         | `TrainingReportGenerator`                                                                        | `report/training_report.py:160`                                                  | n/a (Markdown) | §1.6 |

Generic families (plain scatter / bar / pie / violin / pairplot / clustermap) have
**no** library method — take path (B).

## Three shortest examples

**Example 1 — true/pred time-series comparison (matplotlib, IEEE).** Methods:
`create_plotter` (inv §4.1), `plot_test_result` (inv §1.1, §4.2).

```python
from pathlib import Path
from industrytslib.utils.visualization import create_plotter

plotter = create_plotter("matplotlib", "MyProject", style="ieee")
plotter.plot_test_result(
    time_now="20260709_120000",
    true_list=y_true, pred_list=y_pred,
    save_path=Path("out/pred.png"),
    custom_title="Prediction vs Truth",
)
# shorter wrapper equivalent: ComparisonChart.plot_true_vs_pred (inv §1.2)
```

**Example 2 — correlation heatmap.** Method: `HeatmapChart.plot_correlation`
(inv §1.2, §4.2), which internally calls `plot_correlation_matrix` (inv §1.1).

```python
from pathlib import Path
from industrytslib.utils.visualization.charts import HeatmapChart

HeatmapChart(backend="matplotlib", style="ieee").plot_correlation(
    df, Path("out/corr.png"), title="Feature Correlation",
)
```

**Example 3 — t-SNE projection.** Method: `tsne_plotter` (inv §1.4, §4.2).

```python
from pathlib import Path
from industrytslib.utils.visualization import tsne_plotter   # lazy __getattr__ export

tsne_plotter(data, labels, perplexity=30.0, save_path=Path("out"), style="ieee")
```

## Export environment variables (inv §3.3)

Only the **plotly** path reads these; matplotlib PNG has no gate.

| Variable                        | Effect                                                 | Default           |
| ------------------------------- | ------------------------------------------------------ | ----------------- |
| `INDUSTRYTSLIB_EXPORT_PNG`      | `"1"/"true"/"yes"` enables PNG save on the plotly path | off (PNG skipped) |
| `INDUSTRYTSLIB_PNG_DPI`         | overrides the export PNG DPI                           | 600               |
| `INDUSTRYTSLIB_WEBGL_THRESHOLD` | point count above which plotly switches to WebGL       | 50000             |

## Caveats

1. **The library's elsevier/nature/springer styles render serif/Times, not sans.**
   Their docstrings claim Arial/Helvetica, but `_create_config()` does not override
   `font_family`/`font_name`, so they inherit the `StyleConfig` default serif +
   Times New Roman (inv §2.2). Nature and Elsevier officially want Helvetica/Arial
   (see `journal-specs.md`). For a strict submission, override `font.family` /
   `font.sans-serif` (via `set_visualization_options` or post-hoc rcParams) or take
   the standalone path.
2. **`get_available_styles()` returns 5 styles**, not 4 — `ieee`, `elsevier`,
   `nature`, `springer`, `chinese_thesis` (inv §2.5). The `__init__.py` docstring
   saying "4 styles" is stale; do not repeat it.
3. **plotly PNG export is off by default** — set `INDUSTRYTSLIB_EXPORT_PNG=1` or pass
   explicit `export_formats`, and ensure kaleido is installed (inv §3.2). matplotlib
   PNG is unaffected.
4. **Windows: FontManager does not scan `C:\Windows\Fonts`.** Its system-font
   discovery only lists Linux/macOS directories (inv §2.3). Before any Chinese
   figure, verify `FontManager.get_cjk_font_family()` returns non-`None`; SimSun /
   Microsoft YaHei are usually available via matplotlib's own registry, otherwise
   drop the font into a local `./fonts` directory or force injection with
   `apply_visualization_options_to_matplotlib(options)`.
