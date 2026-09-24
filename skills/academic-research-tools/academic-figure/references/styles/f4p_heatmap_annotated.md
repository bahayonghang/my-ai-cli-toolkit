# Style: f4p_heatmap_annotated（带标注热图：按列归一化、汇总行与计数标注）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_RNAGenScape`、`figure_ophthal_review`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：按列归一化的结果热图 + 汇总行；计数热图；对数 y 轴吞吐量柱  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_comparison.py`、`<skill-dir>/scripts/figures4papers/figure_ophthal_review/plot_composition.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_RNAGenScape/results_comparison_optimization.png`、`<skill-dir>/assets/originals/figures4papers/figure_RNAGenScape/results_comparison_speed.png`、`<skill-dir>/assets/originals/figures4papers/figure_ophthal_review/composition_heatmap.png`  
**输出文件**：`results_comparison_speed.png`（对数柱）与 `results_comparison_optimization.png`（热图），来自 `plot_comparison.py`；`composition_heatmap.png`，来自 `plot_composition.py`

---

## 适用场景

- 方法 × 指标的结果表改为热图，每列方向不同（越高越好或越低越好），需要每列独立着色。
- 需要一行汇总（主方法相对最佳基线的提升百分比）。
- 两个分类变量的计数矩阵（任务 × 临床阶段），行、列合计写在刻度标签中。
- 推理速度跨数量级的对比：对数 y 轴柱图（`results_comparison_speed.png`）。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | 对数柱 (9, 5)；结果热图 (20, 9)；计数热图 (14, 10) |
| 布局 | `add_subplot(1, 2, k)`；`tight_layout(pad=1)`，热图为 `pad=2`；计数热图为单轴 |
| 字号 | 全局 `font.size = 16`；标签 `fontsize=` 12–32；主方法的 y 刻度字号更大 |
| 线宽 | `axes.linewidth = 2`；计数热图单元格白色分隔线 `linewidths=1, linecolor='white'` |
| 配色 | RNAGenScape：`#cdcdcd` `#767676` `#4d4d4d` `#272727` `#c4ece7` `#ecc4c4` `#ecc4e7` `#ea84dd` `#d5e29b` `#bdd35c` `#9fbc1d` `#8ead03` `#0f4d92`；Median change 面板的 "+" 列用 `Reds`、"−" 列用 `Blues_r`，Success rate 面板全部用 `Reds`（下限 `max(50, 列最小值)`）；汇总行文字 forestgreen / darkred；计数热图 `cmap='Reds'`，`vmin=0, vmax=20` |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；有 LaTeX 时 `text.usetex = True` |
| DPI | 300 |

## 关键技法

1. 按列归一化：每列单独一次 `imshow`，各用自己的 `Normalize` 与色图。
2. 汇总行以 NaN 写入图像，`set_bad` 显示为白色，再用文字标出 `+x.x %`（正值 forestgreen，负值 darkred）。
3. 单元格文字颜色按单元格亮度选择：`0.299*r + 0.587*g + 0.114*b < 0.5` 时用白字。
4. `set_frame_on(False)`、`invert_yaxis()`；方法名用等宽字体（TeX 为 `\texttt`，降级时为 `\mathtt`）。
5. 对数柱：`ax.set_ylim(ymin, ymax * 20)` 留白，数值标在 `val * 1.1`。
6. 计数热图：`sns.heatmap(annot=True, fmt='d', ...)`，行、列合计以 `($n=…$)` 附在刻度标签后。
7. 关闭的分支 `PLOT_DE_NOVO_SPEED = False` 用 `\underbrace` 在柱下画分组括号；只在 TeX 下画括号，
   降级时只写组名。

## 数据替换要点

- `plot_comparison.py` 的数据是模块级列表：`options`、`colors`、`results_inference`、
  `results_openvaccine_delta_pos`、`results_openvaccine_pct_pos` 等；各列表长度等于方法数。
- 汇总行由数据计算，替换数据后不要手写百分比。
- 对数轴要求数值严格为正（`references/modes/from-data.md` 模板复用阶梯的变换检查）。
- `plot_composition.py` 的 `DATA['clinical_stage']` 为列名；`DATA['pub_by_category'][类别][任务]` 为长度等于
  阶段数的计数列表。上游构造了类别层的数组，但图中不画类别层。
- 连续色图必须带色条（`references/viz-pitfalls.md` P5）；计数热图的 `vmax` 按新数据的最大值设定。

## 可选依赖与降级

- LaTeX：可选。脚本检测 `latex` 是否在 `PATH` 上；不可用或设置 `ACADEMIC_FIGURE_NO_TEX=1` 时关闭 `text.usetex`，改用 mathtext （`mathtext.fontset = 'cm'`），图中不出现未解析的 TeX 命令。
- seaborn：`plot_composition.py` 需要 `seaborn.heatmap`。缺少 seaborn 时测试跳过该脚本。
  纯 matplotlib 写法：`ax.imshow(counts, cmap='Reds', vmin=0, vmax=20)`，逐格 `ax.text` 写计数，
  `fig.colorbar` 加色条，用白色网格线分隔单元格。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_comparison.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_ophthal_review/plot_composition.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
