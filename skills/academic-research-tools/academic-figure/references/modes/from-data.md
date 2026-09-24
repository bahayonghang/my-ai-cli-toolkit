# Mode: from-data

Select the authoritative `from-data` output contract in `SKILL.md`, then pick a
style template and fill it with user data.

## Workflow

```
1. 确认用户的图类型和数据
2. 选择对应 style（如不确定，询问用户或根据数据形状推断）
3. 读取对应 ../styles/<style_name>.md 获取精确参数
4. 复制对应 <skill-dir>/scripts/<script>.py，替换数据区（脚本顶部有清晰注释标注数据区）
5. 运行：python "<skill-dir>/scripts/<script>.py" [输出路径.png]
   figures4papers 风格族：python "<skill-dir>/scripts/figures4papers/<project>/<script>.py" [输出目录]
6. 检查输出，必要时微调颜色/标签/字号
```

## Style → script map

「参数」列说明第一个位置参数：原有 8 个风格脚本取输出文件路径；figures4papers 移植脚本
（`f4p_*`）可能输出多张图，所以取输出目录，文件名固定为上游文件名。

| Style                         | Type   | Script                                                                                                                                                                                                 | 参数     | 适用场景                                               |
| ----------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------ |
| `bar_paired_delta`            | 柱状图 | `bar_memevolve.py`                                                                                                                                                                                     | 输出文件 | Baseline vs method 配对对比 + 增益箭头                 |
| `bar_grouped_hatch`           | 柱状图 | `bar_spice.py`                                                                                                                                                                                         | 输出文件 | 多方法消融，主方法斜线填充，柱顶数值                   |
| `line_confidence_band`        | 折线图 | `line_selfdistill.py`                                                                                                                                                                                  | 输出文件 | 带置信区间的训练曲线                                   |
| `line_training_curve`         | 折线图 | `line_aime.py`                                                                                                                                                                                         | 输出文件 | 垂直断点线 + 水平参考线                                |
| `line_loss_with_inset`        | 折线图 | `line_loss_inset.py`                                                                                                                                                                                   | 输出文件 | L 形 spine + 局部放大 inset                            |
| `scatter_tsne_cluster`        | 散点图 | `scatter_tsne.py`                                                                                                                                                                                      | 输出文件 | t-SNE 聚类 + 注释框                                    |
| `scatter_broken_axis`         | 散点图 | `scatter_break.py`                                                                                                                                                                                     | 输出文件 | 折断 X 轴，多 marker 系列                              |
| `radar_dual_series`           | 雷达图 | `radar_dora.py`                                                                                                                                                                                        | 输出文件 | 双方法多维对比，正八边形网格                           |
| `f4p_bar_stacked_composition` | 柱状图 | `figures4papers/figure_Brainteaser/plot_brute_force.py`、`plot_rewriting.py`                                                                                                                           | 输出目录 | 100% 堆叠组成柱，hatch 编码子类，颜色与 hatch 图例分开 |
| `f4p_bar_panel_legend`        | 柱状图 | `figures4papers/figure_Brainteaser/plot_correctness_by_category.py`、`plot_correctness_by_subcategory.py`、`plot_selfcorrection_math.py`                                                               | 输出目录 | 每个类别一个面板，图例独占一个单元格                   |
| `f4p_bar_mean_std`            | 柱状图 | `figures4papers/figure_CellSpliceNet/plot_comparison.py`、`figure_Cflows/plot_comparison_Ablation.py`、`figure_Cflows/plot_comparison_GeneRegulatory.py`、`figure_ImmunoStruct/plot_bars.py`（比较图） | 输出目录 | 多指标面板的均值 ± 标准差柱，误差帽上方数值            |
| `f4p_bar_grouped_datasets`    | 柱状图 | `figures4papers/figure_Cflows/plot_comparison_Trajectory.py`                                                                                                                                           | 输出目录 | 数据集内分组柱，科学计数刻度                           |
| `f4p_bar_ablation`            | 柱状图 | `figures4papers/figure_CellSpliceNet/plot_ablation.py`、`figure_ImmunoStruct/plot_bars.py`（消融图）                                                                                                   | 输出目录 | 基线线 + 下降箭头；横向消融柱 + 透明度梯度             |
| `f4p_heatmap_annotated`       | 热图   | `figures4papers/figure_RNAGenScape/plot_comparison.py`、`figure_ophthal_review/plot_composition.py`                                                                                                    | 输出目录 | 按列归一化热图 + 汇总行；计数热图；对数柱              |
| `f4p_line_sweep`              | 折线图 | `figures4papers/figure_VIGIL/plot_ablation.py`、`figure_RNAGenScape/plot_sweep.py`                                                                                                                     | 输出目录 | 超参扫描，参考线，宽度比，一个面板双 y 轴              |
| `f4p_line_alpha_graded`       | 折线图 | `figures4papers/figure_VIGIL/plot_posttraining.py`                                                                                                                                                     | 输出目录 | 训练步数折线，线段透明度渐变                           |
| `f4p_radar_multirange`        | 雷达图 | `figures4papers/figure_VIGIL/plot_comparison_radar.py`                                                                                                                                                 | 输出目录 | 每个基准独立量程，多边形网格，每条辐条标刻度           |
| `f4p_concept_density`         | 示意图 | `figures4papers/figure_VIGIL/plot_concept.py`                                                                                                                                                          | 输出目录 | 重叠高斯与间隔箭头；KDE 流形与等高线                   |
| `f4p_sphere_illustration`     | 示意图 | `figures4papers/figure_Dispersion/plot_idea.py`、`plot_illustration.py`                                                                                                                                | 输出目录 | 手工着色球面、SLERP 测地线、`Arrow3D`                  |
| `f4p_surface_landscape`       | 示意图 | `figures4papers/figure_RNAGenScape/plot_manifold.py`、`plot_hole_manifold.py`                                                                                                                          | 输出目录 | 3D 能量曲面，自定义色图，灰色空洞                      |
| `f4p_graph_diffusion`         | 示意图 | `figures4papers/figure_Cflows/diffusion_swiss_roll.py`                                                                                                                                                 | 输出目录 | 扩散矩阵热图 + 概率加权边的点云                        |
| `f4p_trend_month_events`      | 面积图 | `figures4papers/figure_ophthal_review/plot_trend.py`                                                                                                                                                   | 输出目录 | 月度累积面积，hatch 去边，堆叠事件标签                 |

(scripts under `<skill-dir>/scripts/`; the `f4p_*` scripts are CC BY-NC 4.0, see
`../attribution.md`)

## Data substitution tips

每个脚本的数据区在文件顶部，通常是 `np.array(...)` 或字典。替换规则：

- 保持数组维度和类型不变
- 若类别数变化（如从 4 组改为 6 组），同步调整颜色列表和宽度计算
- x 轴标签、图例标签直接修改对应字符串列表
- 输出路径由 `argv[1]` 控制（缺省写入当前目录的 `*_repro.png`）；
  `line_selfdistill.py` 产出两张图，分别由 `argv[1]`、`argv[2]` 控制。
  脚本成功后打印实际输出路径
- `bar_memevolve.py` 的增益标签（`+x.x%`）与 y 轴范围由 `baseline`、`method`
  计算，替换数据后不要手写这两项
- `f4p_*` 脚本的第一个参数是输出目录（缺省为当前目录），输出文件名与上游相同；
  环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI。每写出一个文件打印一行 `saved: <路径>`。
  各族的数据字典与替换要点写在对应的 `../styles/f4p_*.md`

## Template reuse ladder

A template renders its own bundled example. That fact does not prove it fits your
data. Assign the template to one level before you edit it:

| Level                  | Use when                                                             | Allowed changes                                     |
| ---------------------- | -------------------------------------------------------------------- | --------------------------------------------------- |
| Exact reuse            | Meaning, data shape, and transformations all match                   | Data values, labels, and output path                |
| Structural adaptation  | Meaning and dimensionality match, field names or group counts differ | The above, plus an explicit field map               |
| Style-only inheritance | The chart family helps, but the statistic or structure differs       | Palette, typography, spacing, marker, legend only   |
| Build anew             | The template answers a different question                            | Do not force it. Draw from `../figure-contract.md`. |

**Check every transformation that you inherit against the new data.** A log axis
needs strictly positive values. A ratio needs a finite denominator and a stated
rule for a zero denominator. Min-max scaling needs a non-constant finite range.
Binning and density estimation need enough distinct observations; record the bin
width or the bandwidth. When a check fails, drop to style-only inheritance or
build anew. Do not change the transform silently.

> Adapted from the asset adaptation reference of `nature-figure`
> (`Yuan1z0825/nature-skills`, Apache-2.0). See `../attribution.md`.

## Detailed style parameters

Read the corresponding file in `../styles/` for exact `rcParams`, colors, font
sizes, spine settings, and tick directions before generating:

- Bar: `../styles/bar_paired_delta.md`, `../styles/bar_grouped_hatch.md`
- Line: `../styles/line_confidence_band.md`, `../styles/line_training_curve.md`, `../styles/line_loss_with_inset.md`
- Scatter: `../styles/scatter_tsne_cluster.md`, `../styles/scatter_broken_axis.md`
- Radar: `../styles/radar_dual_series.md`
- figures4papers bar: `../styles/f4p_bar_stacked_composition.md`, `../styles/f4p_bar_panel_legend.md`,
  `../styles/f4p_bar_mean_std.md`, `../styles/f4p_bar_grouped_datasets.md`, `../styles/f4p_bar_ablation.md`
- figures4papers heat map, line, radar, area: `../styles/f4p_heatmap_annotated.md`,
  `../styles/f4p_line_sweep.md`, `../styles/f4p_line_alpha_graded.md`,
  `../styles/f4p_radar_multirange.md`, `../styles/f4p_trend_month_events.md`
- figures4papers concept illustrations: `../styles/f4p_concept_density.md`,
  `../styles/f4p_sphere_illustration.md`, `../styles/f4p_surface_landscape.md`,
  `../styles/f4p_graph_diffusion.md`

## 展示级分支

figures4papers 风格族是海报与幻灯片尺寸（14 个脚本为全局字号 24 pt、轴线宽 3；4 个脚本为
15–16 pt、轴线宽 2；概念示意脚本为 18 pt 或不设全局字号）。本分支属于 from-data 模式，
不新增第五个模式，沿用 from-data 的输出契约。

**进入条件（同时满足）**：

1. 用户要求海报、幻灯片或 README 图；
2. 没有期刊或学位论文目标。有目标时走 journal-spec（`SKILL.md` 冲突规则 1）；
3. 用户没有指定目录风格。指定时按该风格走本文件的常规流程。

图型未定时，先走 advise（`SKILL.md` 冲突规则 3），advise 交接后再进入本分支。

**步骤**：

1. 按图型从上表选最接近的 `f4p_*` 风格族：

   | 图型                               | 风格族                                                                                           |
   | ---------------------------------- | ------------------------------------------------------------------------------------------------ |
   | 方法比较，有均值与标准差           | `f4p_bar_mean_std`                                                                               |
   | 方法 × 数据集比较，只有均值        | `f4p_bar_grouped_datasets`                                                                       |
   | 多个类别各一个面板                 | `f4p_bar_panel_legend`                                                                           |
   | 构成比例（和为 1）                 | `f4p_bar_stacked_composition`                                                                    |
   | 消融                               | `f4p_bar_ablation`                                                                               |
   | 方法 × 指标结果表、计数矩阵        | `f4p_heatmap_annotated`                                                                          |
   | 超参扫描                           | `f4p_line_sweep`                                                                                 |
   | 训练步数上的少量检查点             | `f4p_line_alpha_graded`                                                                          |
   | 多个基准，量程不同                 | `f4p_radar_multirange`                                                                           |
   | 按月累积趋势与事件                 | `f4p_trend_month_events`                                                                         |
   | 概念示意（分布、球面、曲面、扩散） | `f4p_concept_density`、`f4p_sphere_illustration`、`f4p_surface_landscape`、`f4p_graph_diffusion` |

   没有一族适用时，按模板复用阶梯的 Build anew 处理，仍使用下面的 display 预设。

2. 读该族的风格文档，取布局、配色与关键技法。
3. 新脚本调用 `figstyle.apply_style("display")`（`<skill-dir>/scripts/figstyle.py`），
   并用 `save_figure` 同时写 PNG 与 PDF：

   ```python
   import sys; sys.path.insert(0, "<skill-dir>/scripts")
   import matplotlib; matplotlib.use("Agg")
   import matplotlib.pyplot as plt
   from figstyle import apply_style, save_figure

   apply_style("display")          # 24 pt, axis line width 3
   fig, ax = plt.subplots(figsize=(12, 8), layout="constrained")
   # ... draw with the family's palette and techniques ...
   save_figure(fig, "out/figure", formats=("png", "pdf"), dpi=300, match_width=False)
   ```

4. 数据形状与某个移植脚本完全一致（Exact reuse）时，可以复制该脚本替换数据。
   脚本自带的 rcParams 保留，另加一次同名 PDF 导出。
5. 交付：matplotlib 脚本、300 dpi PNG、同名 PDF。

概念示意族（球面、曲面）使用 3D。数据图不用 3D；概念示意图的图注须写明为示意
（`../viz-pitfalls.md` P3）。

## Runtime dependencies

- All scripts require `matplotlib` and `numpy`. Each script selects the
  non-interactive `Agg` backend before it imports `pyplot`.
- `scatter_break.py` uses `scipy` for the few-shot spline. Without `scipy`, it
  draws that curve with linear interpolation (`numpy.interp`) and prints one
  warning.
- `bar_spice.py`, `line_selfdistill.py`, `line_loss_inset.py`, and
  `scatter_tsne.py` use `text.usetex` when a `latex` executable is on `PATH`.
  Without `latex`, or with the environment variable `ACADEMIC_FIGURE_NO_TEX=1`,
  they switch to mathtext (`mathtext.fontset = "cm"`) and the Computer Modern
  fonts that matplotlib ships: `cmr10` for body text, `cmb10` for bold, and
  `cmti10` for italic. No raw TeX command appears in the figure. Do not edit
  `text.usetex` by hand in a copied script.
- `f4p_*` scripts: six use the same `USE_TEX` switch (both
  `figure_Dispersion` scripts, `figure_RNAGenScape/plot_comparison.py` and
  `plot_sweep.py`, both `figure_ophthal_review` scripts). Optional modules:
  `scipy` for `figure_Cflows/diffusion_swiss_roll.py` and
  `figure_VIGIL/plot_concept.py`, `seaborn` for
  `figure_ophthal_review/plot_composition.py`, `dateutil` for
  `figure_ophthal_review/plot_trend.py`. These scripts have no fallback: a
  missing module stops the script, and `tests/f4p-scripts.test.mjs` skips it
  with the module name as the reason.
