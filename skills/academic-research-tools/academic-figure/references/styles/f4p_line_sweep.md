# Style: f4p_line_sweep（超参扫描折线）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_VIGIL`、`figure_RNAGenScape`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：超参数扫描折线（多面板），带参考线；一个面板使用双 y 轴  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_ablation.py`、`<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_sweep.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_VIGIL/ablation_curves.png`、`<skill-dir>/assets/originals/figures4papers/figure_RNAGenScape/results_sweep.png`  
**输出文件**：`ablation_curves.png`（`figure_VIGIL/plot_ablation.py`）、`results_sweep.png`（`plot_sweep.py`）

---

## 适用场景

- 一个或多个超参数取几个离散值时，比较多个方法的指标变化。
- 需要一条基线参考线（例如只做 SFT 的结果）与一条主方法参考线。
- 横轴是非均匀的数值（例如 `[1, 5, 10, 20, 40]`），但希望刻度只出现在取值处。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `figure_VIGIL/plot_ablation.py` (27, 6)；`plot_sweep.py` `(4.5 * len(keys), 4)`，即 (9, 4) |
| 布局 | `plt.subplots(1, 3, gridspec_kw={'width_ratios': [1.1, 1, 1]})`，`tight_layout(pad=0.5)` + `subplots_adjust(wspace=0.3)`；`plot_sweep.py` 为 `add_subplot(1, 2, k)` |
| 字号 | VIGIL 全局 24，轴标签 `fontsize=28`，刻度 `labelsize=24`；`plot_sweep.py` 全局 15 |
| 线宽 | VIGIL `axes.linewidth = 3`，曲线 `linewidth=3`，参考线 `linewidth=4`；`plot_sweep.py` `axes.linewidth = 2`，曲线 `linewidth=3` |
| 配色 | VIGIL：`#D88F8A` `#8BCF8B` `#0F4D92`（主方法深蓝）；`plot_sweep.py`：`#ea84dd` `#0f4d92` |
| 坐标 | 百分比刻度 `f'{item:.0%}'`；y 轴标签等宽字体 `fontfamily='monospace'`；`MaxNLocator(nbins=5)`；`ax.set_xticks(x_values)` |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`） |
| DPI | 300 |

## 关键技法

1. 参考线：SFT 结果为虚线 `alpha=0.3, linewidth=4`；主方法在 25% 数据处的结果为点线。
2. 宽度比 `[1.1, 1, 1]` 给带长刻度标签的第一个面板留出空间。
3. 第三个面板用 `ax2 = ax.twinx()`：右侧轴线重新打开，标签 `rotation=270`，左轴系列 `alpha=0.4`；
   每个 x 位置写一行 "Mean = …"。
4. 数值横轴只在取值处画刻度：`ax.set_xticks(x_values)`，轴仍为线性。

## 数据替换要点

- VIGIL `data_ablation` 的键：`methods`、`colors`、`r'$\beta$'`、`r'$\lambda$'`、`data_fraction`、`results`；
  `results['data_fraction']` 与 `results[r'$\beta$']` 是（方法数 × 取值数）数组；`results[r'$\lambda$']` 只有主方法，
  是（2 个指标 × 取值数）数组，第二行画在右侧 y 轴；`results['SFT']` 是参考线的值。
  键为 raw 字符串（移植时修正，见 `references/attribution.md`）；新增参数时同样用 raw 字符串。
- `plot_sweep.py` 的 `results_increase`、`results_decrease` 是从指标名到取值列表的字典；`x_values` 与列表长度一致。
- 双 y 轴对应 `references/viz-pitfalls.md` P2。复现源图时保留；新图优先改为共享 x 轴的上下两个面板。

## 可选依赖与降级

- LaTeX：只有 `plot_sweep.py` 使用，可选。脚本检测 `latex` 是否在 `PATH` 上；不可用或设置 `ACADEMIC_FIGURE_NO_TEX=1` 时关闭 `text.usetex`，改用 mathtext （`mathtext.fontset = 'cm'`），图中不出现未解析的 TeX 命令。
  标签中只有 `$\uparrow$`，mathtext 可以直接绘制。
- `figure_VIGIL/plot_ablation.py` 不使用 LaTeX。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_ablation.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_sweep.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
