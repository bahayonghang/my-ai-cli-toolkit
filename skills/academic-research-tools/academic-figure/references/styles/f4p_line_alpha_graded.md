# Style: f4p_line_alpha_graded（透明度渐变折线）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_VIGIL`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：训练步数上的折线，每段透明度随步数升高  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_posttraining.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_VIGIL/comparison_posttraining.png`  
**输出文件**：`comparison_posttraining.png`

---

## 适用场景

- 训练或迭代过程的少量检查点（5 个步数）上，比较 3 个方法的指标。
- 用透明度表示时间推进，后期的线段更实，不增加颜色。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (9, 8) |
| 布局 | 单轴 |
| 字号 | 全局 `font.size = 24`；轴标签 `fontsize=28`；刻度与图例 `labelsize=20` / `fontsize=20` |
| 线宽 | `axes.linewidth = 3`；曲线线段 `LineCollection(linewidths=3)`；参考线 `linewidth=4, alpha=0.3` |
| 配色 | `#D88F8A` `#8BCF8B` `#0F4D92`（主方法深蓝） |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`；文字参数 `fontfamily='sans-serif'`（移植时由 `'helvetica'` 改写） |
| DPI | 300 |

## 关键技法

1. `LineCollection`：把折线拆成相邻两点的线段，每段 `alpha` 从 0.3 线性升到 0.9。
2. `LineCollection` 不进入图例，所以用自定义 `Line2D` 句柄构造图例。
3. SFT 参考线为虚线 `alpha=0.3, linewidth=4`。

## 数据替换要点

- `data_posttraining` 的键：`methods`、`colors`、`steps`、`results`；`steps` 为 `[0, 200, 400, 600, 800]`，
  `results` 是（方法数 × 步数）数组。
- 步数变化时，透明度梯度按线段数重新计算，不需要手改。
- 横轴为连续步数时可以连线；横轴为类别时不要连线（`references/viz-pitfalls.md` P6）。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_posttraining.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
