# Style: f4p_surface_landscape（3D 能量曲面示意）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_RNAGenScape`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：概念示意图：3D 曲面（能量地形），以及带灰色空洞的同一曲面  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_manifold.py`、`<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_hole_manifold.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_RNAGenScape/manifold.png`、`<skill-dir>/assets/originals/figures4papers/figure_RNAGenScape/manifold_holes.png`  
**输出文件**：`manifold.png`（`plot_manifold.py`）、`manifold_holes.png`（`plot_hole_manifold.py`）

---

## 适用场景

- 表示优化地形、数据流形或流形上的缺失区域等概念。
- 只用于示意图。数据图不用 3D（`references/viz-pitfalls.md` P3）；实测的第三维改用 2D 热图或等高线。
  使用本风格时图注须写明为示意。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `plot_manifold.py` (10, 7)；`plot_hole_manifold.py` (14, 6) |
| 布局 | 单个 `projection='3d'` 轴；`add_subplot(1, 2, i, projection="3d")` |
| 字号 | 未设全局字号；`plot_hole_manifold.py` 面板标题 `fontsize=14` |
| 线宽 | 曲面网格线 `linewidth=0`（`plot_manifold.py`）或 `0.05` |
| 配色 | `plot_manifold.py`：`cmap='coolwarm'`，`alpha=0.95`；`plot_hole_manifold.py`：自定义色图 `#e9f5ec` `#d9f0e1` `#c9e5d3` `#a9cbb8` `#7f9e8a` `#4f5c4f`，空洞为灰色 RGBA `[0.7, 0.7, 0.7, 0.5]` |
| 视角 | `set_box_aspect([1, 1, 0.5])`，`view_init(elev=20, azim=50)`；隐藏背景面与轴线 |
| 字体 | 上游未设字体，移植未改 |
| DPI | 300（`plot_manifold.py` 上游未设 DPI，移植时改为 300） |

## 关键技法

1. `plot_surface(facecolors=...)`：先用色图计算每个网格点的颜色，再把空洞处的颜色改为灰色。
2. 自定义色图：`LinearSegmentedColormap.from_list` 由 6 个绿色值构成。
3. 空洞中心用拒绝采样生成，互不重叠：`np.random.default_rng(42)`，`num_patches = 30`，
   半径 `r = 0.3`，中心最小间距 `1.6 * r`；曲面最高点周围 `r_forbid = 0.9` 以内不放空洞。
4. 3D 坐标轴整理：隐藏背景面，轴线透明，压扁 z 方向。

## 数据替换要点

- 曲面由 `function(x, y)` 定义，网格为 `np.linspace(-3, 3, 200)`。替换曲面时只改该函数与网格范围。
- `plot_hole_manifold.py` 没有 `__main__` 保护，导入该文件就会运行绘图。复制后按需要加保护。
- 原图 `manifold.png` 为上游 100 dpi 输出（1000×700）；移植脚本以 300 dpi 输出 3000×2100。

## 可选依赖与降级

- 只需要 matplotlib 与 numpy。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_manifold.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_RNAGenScape/plot_hole_manifold.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
