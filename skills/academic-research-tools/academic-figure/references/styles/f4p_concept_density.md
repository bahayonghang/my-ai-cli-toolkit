# Style: f4p_concept_density（概念示意：重叠分布与 KDE 流形）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_VIGIL`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：概念示意图：左为三条重叠的概率曲线与间隔箭头，右为两个 KDE 密度流形与路径  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_concept.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_VIGIL/concept.png`  
**输出文件**：`concept.png`

---

## 适用场景

- 方法动机图或示意图：说明两个分布的间隔、分布偏移，或数据流形上的路径。
- 数据是合成的，只表达概念，不报告测量值。图注须写明为示意。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (24, 6) |
| 布局 | `plt.subplots(1, 2)`，`subplots_adjust(wspace=0.25)`，再用 `set_position` 手工平移右侧面板 |
| 字号 | 全局 `font.size = 18`；轴标签 `fontsize=28`，图例与刻度 24，图中文字 18–24 |
| 线宽 | `axes.linewidth = 1.5`；曲线与路径 `linewidth=` 1.6–3.0 |
| 配色 | 左：`#6F6F6F` `#0F4D92` `#D88F8A`；右：`#2E74B5` `#1f77b4` `#6F6F6F` `#6b7280` `#D62728` |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`；文字参数 `fontfamily='sans-serif'`（移植时由 `'helvetica'` 改写）；不使用 LaTeX |
| DPI | 300 |

## 关键技法

1. 归一化高斯曲线 + `fill_between(..., alpha=0.12)`；分布间隔用双向箭头 `arrowstyle="<->"`。
2. 流形中心线：`CubicSpline(..., bc_type="natural")` 过若干控制点。
3. 沿中心线的切向与法向在管状区域内采样点，点的分布为沿曲线的高斯混合。
4. `gaussian_kde` 在 280×280 网格上估计密度；等高线取分位数水平
   `np.quantile(zz, np.linspace(0.72, 0.99, 10))`；散点 `alpha=0.10`。
5. 每条路径上等距放 10 个白边红色星形标记；主方法路径用平滑阶跃 `3u² − 2u³` 混合两条中心线。
6. `annotate` 箭头配白底圆角文字框。

## 数据替换要点

- 数据为合成数据。左图参数（均值、标准差）在 `plot_distribution()` 中，右图的控制点与随机数生成器在
  `plot_manifold()` 中。
- 用于实测数据时，改用有色条的密度图，并记录 KDE 带宽（`references/modes/from-data.md` 的变换检查）。

## 可选依赖与降级

- scipy：必需（`scipy.stats.gaussian_kde`、`scipy.interpolate.CubicSpline`）。缺少 scipy 时脚本无法运行，
  测试跳过该脚本。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_concept.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
