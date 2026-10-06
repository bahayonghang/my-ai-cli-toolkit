# Style: f4p_bar_panel_legend（分面板柱 + 图例单元格）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_Brainteaser`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：每个类别一个面板的简单柱图，所有面板共用一个图例单元格  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_correctness_by_category.py`、`<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_correctness_by_subcategory.py`、`<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_selfcorrection_math.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_Brainteaser/correctness_by_category.png`、`<skill-dir>/assets/originals/figures4papers/figure_Brainteaser/correctness_by_subcategory.png`、`<skill-dir>/assets/originals/figures4papers/figure_Brainteaser/selfcorrection_math.png`  
**输出文件**：`correctness_by_category.png`、`correctness_by_subcategory.png`、`selfcorrection_math.png`（与脚本同名）

---

## 适用场景

- 多个模型在多个类别（或子类别、错误类型）上的单一指标比较，每个类别一个面板。
- 模型数固定且较多（7 个），用颜色区分模型，x 刻度隐藏，由共用图例说明。
- 指标方向需要标明时（越低越好或越高越好），在面板标题中加 `$\downarrow$` / `$\uparrow$`。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `plot_correctness_by_category.py` (36, 12)；`plot_correctness_by_subcategory.py` (96, 12)；`plot_selfcorrection_math.py` (36, 12) |
| 布局 | `GridSpec(2, 4)`，图例单元 `gs[3]`；`GridSpec(2, 13)`，图例单元 `gs[11:12]`；`GridSpec(2, 5)`，图例跨 `gs[8:]` |
| 字号 | 全局 `font.size = 24`；标题与轴标签 `fontsize=` 28–36 |
| 线宽 | `axes.linewidth = 3` |
| 配色 | `#DDF3DE` `#AADCA9` `#8BCF8B` `#F6CFCB` `#E9A6A1` `#FFF6CC` `#3775BA`；`plot_selfcorrection_math.py` 去掉 `#FFF6CC` |
| 坐标 | y 轴 `[0, 1]`；隐藏 x 刻度；去掉上、右轴线 |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX |
| DPI | 300 |

## 关键技法

1. 一个类别一个面板，同一模型在所有面板中同色、同顺序。
2. 图例独占一个 `GridSpec` 单元：代理柱取 handles 后移除，再 `ax.set_axis_off()`。
3. 面板标题中的 `$\downarrow$` / `$\uparrow$` 标明指标方向（`plot_selfcorrection_math.py`）。
4. 隐藏 x 刻度（`ax.set_xticks([])`），模型名只在图例中出现一次。

## 数据替换要点

- `data_math_by_category`、`data_logic_by_category` 的键：`methods`、`colors`、`subtypes`、`result`；
  `result[类别]` 是长度等于模型数的数组，取值 0–1。
- `plot_selfcorrection_math.py` 的数据为 `data_math_correcting_llm`、`data_math_correcting_human`。
- 类别数变化时调整 `GridSpec` 的列数与图例单元的位置。
- 原图 `correctness_by_subcategory.png` 由 28800×3600 缩放到 1800×225，文字不可读，以脚本输出为准。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_correctness_by_category.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_correctness_by_subcategory.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Brainteaser/plot_selfcorrection_math.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
