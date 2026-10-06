# Style: f4p_radar_multirange（每轴独立量程的雷达图）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_VIGIL`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：12 条辐条（4 个模型 × 3 个基准）、3 个方法的雷达图，每个基准有自己的量程与刻度  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_comparison_radar.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_VIGIL/comparison_radar.png`  
**输出文件**：`comparison_radar.png`

---

## 适用场景

- 多个基准的量纲或数值范围不同（例如 POPE 75–91，MathVista 30–61），需要每个基准独立映射半径。
- 辐条数较多（12 条），方法数少（3 个）。
- 与 `radar_dual_series` 的区别：`radar_dual_series` 把所有轴统一归一化到 `[0.35, 1]`，只画 2 个方法、
  8 条辐条；本风格每个基准有自己的刻度，并在每条辐条上标刻度值。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (12, 10)，`projection='polar'` |
| 布局 | 单个极坐标轴；`theta_zero_location('N')`，角度顺时针 `np.linspace(2π, 0, n)` |
| 字号 | 全局 `font.size = 24`；辐条标签与刻度值 `fontsize=` 12–15 |
| 线宽 | 方法曲线 `linewidth=2`；多边形网格与辐条 `linewidth=` 0.5–0.8 |
| 配色 | `#D88F8A` `#8BCF8B` `#0F4D92`（主方法深蓝）；填充 `alpha=0.05`，顶点画圆点 |
| 坐标 | 显示半径范围 45–90（`set_ylim(45, ...)`）；默认网格关闭 |
| 字体 | 字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']`（`font.family = 'sans-serif'`）；不使用 LaTeX（`$_{Adv}$` 为 mathtext） |
| DPI | 300，`bbox_inches='tight'` |

## 关键技法

1. 每个基准一组刻度 `benchmark_radii`（例如 `'MathVista': [30, 40, 50, 61]`），用该组的最小值与最大值
   把数值映射到显示范围 45–90。
2. 网格为逐级多边形（不用圆）；外边界与辐条手工绘制。
3. 每条辐条上画旋转的刻度值，跳过最内层。
4. 辐条标签半径 `r_max + 8 + 10·|sin θ|`，左右两侧的标签离图更远，避免与曲线重叠。

## 数据替换要点

- `data_comparison` 的键：`methods`、`colors`、`results`；`results` 的键为 `'模型\n基准'`，
  值为长度等于方法数的数组。
- `_task_suffix()` 取换行符后的部分作为基准名，用来查 `benchmark_radii`。新增基准时在 `benchmark_radii`
  中加一组刻度，刻度范围必须覆盖该基准的全部数值。
- 每轴量程不同，所以多边形面积不能在基准之间比较；在图注中写明每个基准的刻度范围。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_VIGIL/plot_comparison_radar.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
