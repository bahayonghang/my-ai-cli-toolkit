# Style: f4p_bar_ablation（消融柱：基线线、下降箭头与透明度梯度）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_CellSpliceNet`、`figure_ImmunoStruct`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：消融柱（竖向与横向），完整模型为基线  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_CellSpliceNet/plot_ablation.py`、`<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/plot_bars.py`、`<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/raw_data.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_CellSpliceNet/ablation.png`、`<skill-dir>/assets/originals/figures4papers/figure_ImmunoStruct/bars_ablation_IEDB.png`、`<skill-dir>/assets/originals/figures4papers/figure_ImmunoStruct/bars_ablation_Cancer.png`  
**输出文件**：`ablation.png`（`plot_ablation.py`）；`plot_bars.py` 输出 4 张图，本风格对应 `bars_ablation_IEDB.png` 与 `bars_ablation_Cancer.png`（另两张见 `f4p_bar_mean_std`）

---

## 适用场景

- 去掉一个组件后性能下降多少：完整模型画一条虚线基线，每个消融变体画下降箭头与差值。
- 组件组合较多（12 种）时，用横向柱与组件名组合标签，并用同一颜色的透明度梯度表示顺序。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `plot_ablation.py` (13, 13)；`bars_ablation_IEDB.png` (24, 8)；`bars_ablation_Cancer.png` (28, 6) |
| 布局 | `plot_ablation.py`：单轴，图例在图上方 `bbox_to_anchor=(0.50, 1.08)`；IEDB：`add_subplot(1, 3, k)` 横向柱；Cancer：`add_subplot(1, 4, k)` 竖向柱，图例单元 `(1, 4, 4)` |
| 字号 | 全局 `font.size = 24`；`tick_params(labelsize=36, length=10, width=2)`（`plot_ablation.py`）；标签 `fontsize=` 24–54 |
| 线宽 | `axes.linewidth = 3`；基线虚线 `linewidth=4, alpha=0.7`；下降箭头 `lw=4` |
| 配色 | CellSpliceNet：`#0F4D92` `#B4E6B4` `#AFE6E6` `#FFE080` `#D3D3D3`；ImmunoStruct：`#3775BA`（RGB `(0.215686, 0.458824, 0.729412)`）的透明度梯度 `np.linspace(0.2, 1.0, 12)`，Cancer 用三级 `[1.0, 0.7, 0.4]` |
| 坐标 | `plot_ablation.py`：`ax.set_ylim([0.0, ymax + 0.5])` 为图例留白，y 刻度 `[0.0, 0.25, 0.50, 0.75, 1.0]`；`plot_bars.py`：每个面板固定范围，例如 `set_xlim([0.75, 0.9])`、`set_ylim([0.68, 0.80])` |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX |
| DPI | 300；`plot_bars.py` 为 600 |

## 关键技法

1. 柱内文字颜色按亮度选择：`is_dark()` 计算 `0.299*r + 0.587*g + 0.114*b < 128`，深色柱用白字。
2. 完整模型的值画虚线基线 `ax.axhline(..., linestyle='--', linewidth=4, alpha=0.7)`；
   从基线到每根消融柱画红色下降箭头，并标出 `−0.xx`。
3. 横向消融柱带 `xerr`，误差线黑色 `ecolor='k'`。
4. 组件编码标签：`'11001'` 由 `decode_ablation()` 译为 `'Structure + Sequence + Transfer Learning'`。
5. 同一颜色的透明度梯度表示消融顺序，不增加新颜色。

## 数据替换要点

- CellSpliceNet `data_ablation` 的键：`methods`、`colors`、`result`；`result` 为一维数组，第一个值是完整模型。
- ImmunoStruct 的数据在 `raw_data.py`：`data_ablation_IEDB` 的键为 `ablations`（组件编码字符串，长度等于组件数）、
  `components`、`metrics`、`mean`、`std`；`data_ablation_Cancer` 用 `coeffs` 列表代替组件编码。
- 消融变体数变化时同步透明度梯度的个数（`np.linspace(0.2, 1.0, n)`）。
- 下降箭头与差值由数据计算，替换数据后不要手写差值。
- `plot_bars.py` 的固定轴范围截断了柱的起点（`references/viz-pitfalls.md` P4）。替换数据后按新数据重设范围。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_CellSpliceNet/plot_ablation.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_ImmunoStruct/plot_bars.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
