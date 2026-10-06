# Design：figures4papers 移植

## 1. 风格族与脚本

| 风格族（`f4p_<family>.md`） | 脚本（`scripts/figures4papers/…`）                                                                                                                                                 | 关键技法（catalog 差距号）                                                        |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `bar_stacked_composition`   | `figure_Brainteaser/plot_brute_force.py`、`plot_rewriting.py`                                                                                                                      | 100% 堆叠、每层 hatch、描边数值、颜色与 hatch 分开的图例（G1–G3）                 |
| `bar_panel_legend`          | `figure_Brainteaser/plot_correctness_by_category.py`、`plot_correctness_by_subcategory.py`、`plot_selfcorrection_math.py`                                                          | 每类一个面板、图例独占单元格、标题中的 ↓/↑                                        |
| `bar_mean_std`              | `figure_CellSpliceNet/plot_comparison.py`、`figure_Cflows/plot_comparison_Ablation.py`、`plot_comparison_GeneRegulatory.py`、`figure_ImmunoStruct/plot_bars.py`（comparison 输出） | 均值 ± 标准差、误差帽上方数值、科学计数刻度（G7、G10）                            |
| `bar_grouped_datasets`      | `figure_Cflows/plot_comparison_Trajectory.py`                                                                                                                                      | 数据集内分组柱（G8）                                                              |
| `bar_ablation`              | `figure_CellSpliceNet/plot_ablation.py`、`figure_ImmunoStruct/plot_bars.py`（ablation 输出）                                                                                       | 基线线与下降箭头、透明度梯度、横向柱与组件编码标签（G5、G6）                      |
| `heatmap_annotated`         | `figure_RNAGenScape/plot_comparison.py`、`figure_ophthal_review/plot_composition.py`                                                                                               | 按列归一化、汇总行、带符号百分比、计数标注、对数柱、`\underbrace` 分组（G11–G14） |
| `line_sweep`                | `figure_VIGIL/plot_ablation.py`、`figure_RNAGenScape/plot_sweep.py`                                                                                                                | 超参扫描、参考线、双 y 轴、宽度比（G15）                                          |
| `line_alpha_graded`         | `figure_VIGIL/plot_posttraining.py`                                                                                                                                                | `LineCollection` 透明度渐变（G16）                                                |
| `radar_multirange`          | `figure_VIGIL/plot_comparison_radar.py`                                                                                                                                            | 每轴量程、多边形网格、每条辐条刻度（G17）                                         |
| `concept_density`           | `figure_VIGIL/plot_concept.py`                                                                                                                                                     | 重叠高斯、间隔箭头、KDE 流形与等高线（G18、G19）                                  |
| `sphere_illustration`       | `figure_Dispersion/plot_idea.py`、`plot_illustration.py`                                                                                                                           | 手工球面着色、SLERP 测地线、`Arrow3D`（G20）                                      |
| `surface_landscape`         | `figure_RNAGenScape/plot_manifold.py`、`plot_hole_manifold.py`                                                                                                                     | 3D 曲面、自定义色图、灰色空洞（G21）                                              |
| `graph_diffusion`           | `figure_Cflows/diffusion_swiss_roll.py`                                                                                                                                            | 扩散矩阵热图与概率加权边（G22）                                                   |
| `trend_month_events`        | `figure_ophthal_review/plot_trend.py`                                                                                                                                              | 月度累积面积、hatch 去边、堆叠事件标签（G23）                                     |

`plot_bars.py` 输出 4 张图，同时属于 `bar_mean_std` 与 `bar_ablation`。两份文档都
列出该脚本，并写明各自对应的输出文件名。

## 2. 输出契约与现有脚本的差异

现有 9 个风格脚本的第一个参数是输出文件路径。部分移植脚本输出多张图，所以移植脚本的
第一个参数是输出目录。`modes/from-data.md` 的表格增加「参数」列说明该差异。

## 3. 通用改动模板

```python
# Ported from ChenLiu-1996/figures4papers <path> @ 3c181f8, CC BY-NC 4.0. See references/attribution.md.
import os, sys, shutil
import matplotlib
matplotlib.use("Agg")
from matplotlib import pyplot as plt

OUT_DIR = sys.argv[1] if len(sys.argv) > 1 else "."
DPI = int(os.environ.get("ACADEMIC_FIGURE_DPI", "300"))   # default = upstream value of this script
USE_TEX = shutil.which("latex") is not None and os.environ.get("ACADEMIC_FIGURE_NO_TEX") != "1"
```

- 上游的 `os.makedirs('./figures/', ...)` 与 `savefig('./figures/x.png')` 改为
  `os.path.join(OUT_DIR, 'x.png')`，并创建 `OUT_DIR`。
- `plt.rcParams['font.family'] = 'helvetica'` 改为 `font.family = "sans-serif"`，
  另设 `font.sans-serif` 回退链。

## 4. 原图缩放

- 本机有 Pillow 12.3.0。用 `Image.thumbnail((2400, 2400), Image.LANCZOS)` 后以
  `optimize=True` 保存。缩放命令只在实施时运行一次，不随 skill 发布。
- 总大小超过 8 MB 时，把长边降到 1800 px 后重做。

## 5. 测试的依赖探测

- 测试表为每个脚本声明所需模块：scipy（`diffusion_swiss_roll.py`、`plot_concept.py`）、
  seaborn（`plot_composition.py`）、dateutil（`plot_trend.py`）。测试先运行
  `python -c "import <mod>"`；模块缺失时跳过该脚本。
- 期望输出文件名写在测试表中，来源为 catalog 第 1.3 节。
