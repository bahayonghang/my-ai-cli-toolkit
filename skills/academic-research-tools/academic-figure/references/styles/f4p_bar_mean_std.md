# Style: f4p_bar_mean_std（均值 ± 标准差柱）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_CellSpliceNet`、`figure_Cflows`、`figure_ImmunoStruct`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：多指标面板的均值柱 + 误差线，主方法用深蓝色，对比方法用浅色  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_CellSpliceNet/plot_comparison.py`、`<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_Ablation.py`、`<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_GeneRegulatory.py`、`<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/plot_bars.py`、`<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/raw_data.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_CellSpliceNet/comparison_worm.png`、`<skill-dir>/assets/originals/figures4papers/figure_CellSpliceNet/comparison_human.png`、`<skill-dir>/assets/originals/figures4papers/figure_Cflows/figX_comparison_Ablation.png`、`<skill-dir>/assets/originals/figures4papers/figure_Cflows/fig2_comparison_GeneRegulatory.png`、`<skill-dir>/assets/originals/figures4papers/figure_ImmunoStruct/bars_comparison_IEDB.png`、`<skill-dir>/assets/originals/figures4papers/figure_ImmunoStruct/bars_comparison_Cancer.png`  
**输出文件**：`comparison_worm.png`、`comparison_human.png`；`figX_comparison_Ablation.png/.pdf`；`fig2_comparison_GeneRegulatory.png/.pdf`；`plot_bars.py` 输出 4 张图，本风格对应 `bars_comparison_IEDB.png` 与 `bars_comparison_Cancer.png`（另两张见 `f4p_bar_ablation`）

---

## 适用场景

- 多个方法在几个指标上的定量比较，每个指标一个面板，数据有多次运行的均值与标准差。
- 主方法需要在视觉上突出（深蓝色），对比方法用一组浅色。
- 数值跨数量级或很小，需要科学计数刻度（`figure_Cflows`）。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `figure_CellSpliceNet` (45, 12)；`plot_comparison_Ablation.py` (35, 7)；`plot_comparison_GeneRegulatory.py` (36, 6)；`plot_bars.py` 比较图 (28, 6) |
| 布局 | `GridSpec(1, 3)`，每个面板自带图例（`ncols=2, columnspacing=0.6`）；`add_subplot(1, 5, k)`，图例单元 `(1, 5, 5)`；`add_subplot(1, 4, k)`，图例单元 `(1, 4, 4)` |
| 字号 | 全局 `font.size = 24`；标题与轴标签 `fontsize=` 30–54；`tick_params(labelsize=36)`（CellSpliceNet） |
| 线宽 | `axes.linewidth = 3`；误差线 `error_kw={'elinewidth': 2, 'capthick': 2, 'capsize': 15}`（CellSpliceNet）；`capsize=8, error_kw={'capthick': 2}`（Cflows）；`capsize=5`（ImmunoStruct） |
| 配色 | CellSpliceNet：`#0F4D92` + 红色梯度 `#D4685F` `#DA7B73` `#DF8E87` `#E5A19B` `#EBB4AF` `#F1C7C3` `#F6DAD8` `#FCEEED`；Cflows Ablation：`#AADCA9` `#8BCF8B` `#E9A6A1` `#B8C9E5` `#7097CA` `#3775BA`；GeneRegulatory：`#D0A3A3` `#EFE7B1` `#F4C2C2` `#D7C4E2` `#E5C09F` `#A8C6C2` `#B7D3B0` `#F5B5A0` `#3775BA`；ImmunoStruct IEDB：`#CFCECE` `#F4EEAC` `#FBDFE2` `#D9B9D4` `#DAA87C` `#DDF3DE` `#AADCA9` `#8BCF8B` `#3775BA`（Cancer 另加 `#92E3F9`） |
| 坐标 | 图例留白 `ax.set_ylim([0.0, ymax + 0.5])`；R² 可为负时下限 `-0.08`；ImmunoStruct 每个面板固定 y 范围（例如 `[0.5, 0.9]`） |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX |
| DPI | 300；`plot_bars.py` 为 600。Cflows 两个脚本另写同名 PDF |

## 关键技法

1. 标准差由多次运行计算：`result.std(axis=1)`；数值标在误差帽上方 `height + std + 0.02`。
2. 科学计数刻度：`ax.ticklabel_format(axis='y', style='sci', scilimits=(0, 0))`（Cflows）。
3. 数学符号 x 标签：`r'($|\mathcal{V}|$, $|\mathcal{E}|$) = (100, 137)'`（GeneRegulatory）。
4. 数据模块与绘图脚本分离：`from raw_data import ...`（ImmunoStruct）。
5. 主方法放在第一个（CellSpliceNet）或最后一个（Cflows、ImmunoStruct）位置，颜色固定为深蓝色。

## 数据替换要点

- CellSpliceNet `data_comparison` 的键：`methods`、`colors`、`metrics`、`result_worm`、`result_human`；
  每个指标是（方法数 × 运行次数）数组，脚本计算均值与标准差。`colors` 有 9 个值，对应 8 个方法，多出的一个不使用。
- Cflows `data_comparison_Ablation` 的键：`methods`、`colors`、`metrics`、`mean`、`std`；
  GeneRegulatory 另有 `datasets` 与 `metric`。
- ImmunoStruct 的数据在 `raw_data.py`：`data_comparison_IEDB`、`data_comparison_Cancer`，键为 `methods`、
  `colors`、`metrics`、`mean`、`std`。上游第三个指标的 `std` 存的是 `std / np.sqrt(5)`（标准误）。
- 在图注中写明误差类型（SD 或 SEM）与运行次数（`references/viz-pitfalls.md` P9）。
- ImmunoStruct 的固定 y 范围截断了柱的起点（P4）。替换数据后按新数据重设范围，不要沿用上游数值。
- 只有均值没有分布时，均值柱会隐藏分布（P1）；样本少时考虑箱线图加原始点。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_CellSpliceNet/plot_comparison.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_Ablation.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Cflows/plot_comparison_GeneRegulatory.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/plot_bars.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
