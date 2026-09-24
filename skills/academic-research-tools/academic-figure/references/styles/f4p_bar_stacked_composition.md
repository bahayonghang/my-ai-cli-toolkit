# Style: f4p_bar_stacked_composition（100% 堆叠组成柱 + hatch 图例）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_Brainteaser`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：100% 堆叠柱（每个模型一根柱，子类比例之和为 1）；并排条件柱（hatch 编码条件）  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_brute_force.py`、`<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_rewriting.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_Brainteaser/brute_force.png`、`<skill-dir>/assets/originals/figures4papers/figure_Brainteaser/rewriting.png`  
**输出文件**：`brute_force.png`（`plot_brute_force.py`）、`rewriting.png`（`plot_rewriting.py`）

---

## 适用场景

- 每个模型（或方法）的结果分为几个互斥子类，需要比较各子类所占的比例。
- 多个条件（例如提示词）× 多个领域（例如数学、逻辑）并排比较。
- 颜色编码模型，hatch 编码子类或条件，两个图例分开放置。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `plot_brute_force.py` (52, 12)；`plot_rewriting.py` (24, 12) |
| 布局 | `GridSpec(2, 5)`：每行 4 个条件面板 + 1 个图例单元（`gs[4]`、`gs[9]`）；`plot_rewriting.py` 为 `GridSpec(2, 2)`，两个图例单元分别对应颜色与 hatch |
| 字号 | 全局 `font.size = 24`；标题、轴标签与柱内数值由 `fontsize=` 单独设为 20–36 |
| 线宽 | `axes.linewidth = 3`；柱边框黑色 `linewidth=2`；图例代理柱 `linewidth=3`；数值描边 `linewidth=4` |
| 配色 | `#DDF3DE` `#AADCA9` `#8BCF8B` `#F6CFCB` `#E9A6A1` `#FFF6CC` `#3775BA`（7 个模型）；`plot_rewriting.py` 用子集 `#8BCF8B` `#E9A6A1` `#3775BA`；柱内数值 `#FFD700` 加黑色描边 |
| 坐标 | y 轴 `[0, 1.01]`；隐藏 x 刻度；去掉上、右轴线 |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX |
| DPI | 300 |

## 关键技法

1. 堆叠：`bottom=np.cumsum(result, axis=1)[:, subtype_idx - 1]`，逐层叠加。
2. hatch 编码子类：`'hatch_styles': ['/', '\\', '', 'x']`；上层柱 `alpha=0.8`。
3. 描边数值：`path_effects.Stroke(linewidth=4, foreground='black')` 加金色文字，在浅色与深色柱上都可读。
4. 图例独占单元格：先画代理柱并取 handles，再调用 `b.remove()`，然后画图例并 `ax.set_axis_off()`。
   hatch 图例用白色代理柱，只显示 hatch。
5. 子类名用 mathtext 粗体强调关键词：`r'$\bf{Only}$ $\bf{Model}$ brute force'`。
6. `plot_rewriting.py` 的并排柱：`np.arange(n) + width * idx * 1.1`，每个条件一组 hatch。

## 数据替换要点

- `data_brute_force_math`、`data_brute_force_logic` 的键：`methods`、`colors`、`prompts`、`subtypes`、
  `hatch_styles`、`result`。`result[prompt]` 是（模型数 × 子类数）数组，每行之和为 1
  （上游以百分数存储后除以 100）。
- 模型数变化时同步 `colors` 的长度；子类数变化时同步 `subtypes` 与 `hatch_styles`。
- 条件数变化时调整 `GridSpec` 的列数：列数 = 条件数 + 1（图例单元）。
- `plot_rewriting.py` 的 `data_rewriting_math` 键为 `methods`、`colors`、`hatch_styles`、`fig1`、`fig2`、`result`；
  `fig1`、`fig2` 是两个面板的条件名，也是 `result` 的键。
- 原图 `brute_force.png` 由 15600×3600 缩放到 1800 px 宽，细节以脚本输出为准。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_brute_force.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_rewriting.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
