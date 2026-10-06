# Style: f4p_bar_grouped_datasets（数据集内分组柱）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_Cflows`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：分组柱：每个数据集一组，组内每个方法一根柱，组间空一根柱的宽度  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_Trajectory.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_Cflows/fig2_comparison_Trajectory.png`  
**输出文件**：`fig2_comparison_Trajectory.png` 与同名 PDF

---

## 适用场景

- 多个方法在多个数据集上的比较，每个指标一个面板，面板内按数据集分组。
- 只有均值时可用；有标准差时优先用 `f4p_bar_mean_std` 的误差线写法。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (36, 6) |
| 布局 | `add_subplot(1, 4, k)`：3 个指标面板 + 1 个图例单元 `(1, 4, 4)` |
| 字号 | 全局 `font.size = 24`；标题与轴标签 `fontsize=` 30–36 |
| 线宽 | `axes.linewidth = 3` |
| 配色 | `#DDF3DE` `#AADCA9` `#8BCF8B` `#3775BA`（主方法为最后一个，深蓝色） |
| 坐标 | 科学计数 y 刻度；x 刻度在每组中心，标签为数据集名 |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX |
| DPI | 300；另写同名 PDF |

## 关键技法

1. 组内位置：`np.arange(num_methods) + dataset_idx * (num_methods + 1)`，组间留一根柱的空位。
2. x 刻度放在每组中心：组内位置的均值。
3. 科学计数刻度：`ax.ticklabel_format(axis='y', style='sci', scilimits=(0, 0))`。

## 数据替换要点

- `data_comparison_Trajectory` 的键：`methods`、`colors`、`metrics`、`datasets`、`mean`；
  `mean[指标][数据集]` 是长度等于方法数的数组。
- 上游数值预先乘以比例因子（`* 1e-3`、`* 1e-2`）。替换数据时保持同一指标内的单位一致，
  并在轴标签或图注中写明单位。
- 方法数变化时同步 `colors` 的长度；指标数变化时调整 `add_subplot` 的列数。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_Trajectory.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
