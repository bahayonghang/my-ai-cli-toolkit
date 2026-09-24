# Style: f4p_sphere_illustration（球面概念示意）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_Dispersion`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：概念示意图：手工着色的球面、球面上的点与测地线，一个 3D 面板  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_Dispersion/plot_idea.py`、`<skill-dir>/scripts/figures4papers/figure_Dispersion/plot_illustration.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_Dispersion/idea.png`、`<skill-dir>/assets/originals/figures4papers/figure_Dispersion/illustration.png`  
**输出文件**：`idea.png`（`plot_idea.py`）、`illustration.png`（`plot_illustration.py`）

---

## 适用场景

- 表示向量在单位球面上的分布、角度扩散、去相关或正交化等几何概念。
- 只用于示意图。数据图不用 3D（`references/viz-pitfalls.md` P3）；使用本风格时图注须写明为示意。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | `plot_idea.py` (18, 6)；`plot_illustration.py` (24, 8) |
| 布局 | `add_subplot(1, 3, k)`；`add_subplot(1, 4, k)`，第 3 个面板 `projection="3d"` |
| 字号 | 未设全局字号；文字与图例 `fontsize=24`，3D 坐标轴字母 `fontsize=36` |
| 线宽 | 箭头与测地线 `lw=` 1–4 |
| 配色 | `plot_idea.py`：球面 `#cde5f8`，点 `#6a98cb`；`plot_illustration.py`：点 `#0c2458`，扩散箭头 `#b64342`，钝角情形 `#42949e`，范数箭头 `#9a4d8e`；球面阴影 `cmap='gray'`，椭球 `cm.Blues` 副本并 `set_bad("white")` |
| 字体 | `font.family = 'sans-serif'`，字体回退链 `['Helvetica', 'Arial', 'DejaVu Sans']` |
| DPI | 300 |

## 关键技法

1. 手工球面着色（Lambert 模型，不用 `LightSource`）：在 512×512 网格上取高度 `z = sqrt(1 - r²)`，
   计算单位法向量，光照方向 `[-0.5, 0.5, 0.8]`，强度 `I = max(0, n·l)`。`plot_idea.py` 取
   `clip(-0.5 + 2.0*I, 0, 1)`，再 `imshow(..., cmap='gray', alpha=0.3)`；`plot_illustration.py` 加环境光
   `clip(0.3 + 0.9*I, 0, 1)`，`alpha=0.5`。
2. 大圆弧：SLERP 插值；弧线两端缩短并用两个 `FancyArrowPatch` 画箭头。
3. 3D 箭头：`Arrow3D(FancyArrowPatch)` 实现 `do_3d_projection`。
4. 3D 坐标轴整理：`quiver` 画坐标轴箭头，隐藏背景面与轴线，不画刻度；`view_init(elev=30, azim=-60)`。
5. 图例用 mathtext 标记的代理句柄：`Line2D([], [], marker=r'$\rightarrow$', linestyle="None")`。
6. 行内标签放在白底圆角框中：`bbox=dict(facecolor="white", edgecolor="none", boxstyle="round,pad=0.2")`。

## 数据替换要点

- 数据为合成几何。`plot_idea.py` 用 `np.random.seed(1)` 与 `sample_points_in_ball()` 生成点；
  `plot_illustration.py` 的四个面板各由一个函数绘制（`plot_angular_spread`、`plot_decorrelation`、
  `plot_l2_repel`、`plot_orthogonalization`）。
- 替换时改点数、角度范围与颜色；不要把实测数据画成 3D 散点。

## 可选依赖与降级

- LaTeX：可选。脚本检测 `latex` 是否在 `PATH` 上；不可用或设置 `ACADEMIC_FIGURE_NO_TEX=1` 时关闭 `text.usetex`，改用 mathtext （`mathtext.fontset = 'cm'`），图中不出现未解析的 TeX 命令。
  两个脚本的标签（`$\rightarrow$`、`${\ell_2}$` 等）都是合法 mathtext，降级时不需要替换字符串。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_Dispersion/plot_idea.py" <输出目录>
python "<skill-dir>/scripts/figures4papers/figure_Dispersion/plot_illustration.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
