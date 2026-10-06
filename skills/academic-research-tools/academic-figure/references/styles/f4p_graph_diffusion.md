# Style: f4p_graph_diffusion（扩散矩阵热图与概率加权图）

**来源论文**：Chen Liu 等，figures4papers 项目 `figure_Cflows`（上游只给出项目名，未给出论文题目）  
**许可**：CC BY-NC 4.0，快照 `3c181f8`，仅限非商业用途；移植记录见 `references/attribution.md`  
**图表类型**：左为扩散（转移）矩阵热图，右为瑞士卷点云与按转移概率加权的边  
**复现代码**：`<skill-dir>/scripts/figures4papers/figure_Cflows/diffusion_swiss_roll.py`  
**原图**：`<skill-dir>/assets/originals/figures4papers/figure_Cflows/diffusion_swiss_roll.png`  
**输出文件**：`diffusion_swiss_roll.png`

---

## 适用场景

- 说明图上的扩散、随机游走或核相似度：同时显示转移矩阵与点云上的边。
- 数据为合成点云；用于方法示意，不报告测量值。

## 参数

| 项目 | 值 |
| ---- | -- |
| figsize | (16, 8) |
| 布局 | `plt.subplots(1, 2)`，`subplots_adjust(left=0, right=1, top=1, bottom=0, wspace=0.02)`；两轴均 `axis('off')` |
| 配色 | 矩阵 `cmap='Reds'`；节点 `cmap='viridis'`，白色边框 |
| 线宽 | 边为黑色 `linewidth=2`，透明度 `alpha=prob*2`；节点 `s=100, alpha=0.5`，白色边框 `linewidth=1` |
| 字体 | 上游未设字体，移植未改；图中无文字 |
| 导出 | `bbox_inches='tight'`，`facecolor='white'`，`pad_inches=1` |
| DPI | 300 |

## 关键技法

1. 高斯核转移矩阵：两两距离 → 高斯核 → 小于 0.01 的值置零 → 按行归一化。
2. `imshow(P, cmap='Reds')` 显示矩阵。
3. 只画概率高于阈值 `threshold = 0.02` 的边，透明度与概率成正比；节点按流形参数着色，`zorder=2` 放在边上方。
4. 移植时在 `__main__` 开头加 `np.random.seed(0)`，输出可复现。

## 数据替换要点

- `__main__` 调用 `generate_swiss_roll_2d(n_samples=500, noise=0.5)` 生成点云，调用
  `compute_diffusion_matrix(x, z, t, sigma=2)` 计算矩阵（函数缺省值 80、0.1、1.0 不使用）。替换为用户坐标时保留 `(x, z)` 与着色参数 `t` 的形状。
- 点数增加时边数按平方增长；调整阈值，避免边覆盖节点。
- 核宽 `sigma` 决定矩阵的稀疏程度，在图注中写明。

## 可选依赖与降级

- scipy：必需（`scipy.spatial.distance.pdist`、`squareform`）。缺少 scipy 时脚本无法运行，测试跳过该脚本。

## 运行

```bash
python "<skill-dir>/scripts/figures4papers/figure_Cflows/diffusion_swiss_roll.py" <输出目录>
```

- 第一个位置参数是输出目录，缺省为当前目录。输出文件名固定，与上游相同。
- 环境变量 `ACADEMIC_FIGURE_DPI` 覆盖 DPI；缺省值为上游值。
- 每写出一个文件，脚本打印一行 `saved: <绝对路径>`。
- 上表参数是海报与幻灯片尺寸（展示级）。复现脚本保留源图参数；期刊投稿图不直接套用，
  改走 journal-spec 模式。展示级分支的规则见 `references/modes/from-data.md`。
