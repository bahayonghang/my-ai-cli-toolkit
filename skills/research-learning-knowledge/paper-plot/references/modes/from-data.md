# Mode: from-data

Generate a paper-quality figure by picking a style template and filling it with
user data. All outputs are `dpi=300` PNG.

## Workflow

```
1. 确认用户的图类型和数据
2. 选择对应 style（如不确定，询问用户或根据数据形状推断）
3. 读取对应 ../styles/<style_name>.md 获取精确参数
4. 复制对应 <skill-dir>/scripts/<script>.py，替换数据区（脚本顶部有清晰注释标注数据区）
5. 运行：python <skill-dir>/scripts/<script>.py [输出路径.png]
6. 检查输出，必要时微调颜色/标签/字号
```

## Style → script map

| Style                  | Type   | Script                | 适用场景                               |
| ---------------------- | ------ | --------------------- | -------------------------------------- |
| `bar_paired_delta`     | 柱状图 | `bar_memevolve.py`    | Baseline vs method 配对对比 + 增益箭头 |
| `bar_grouped_hatch`    | 柱状图 | `bar_spice.py`        | 多方法消融，主方法斜线填充，柱顶数值   |
| `line_confidence_band` | 折线图 | `line_selfdistill.py` | 带置信区间的训练曲线                   |
| `line_training_curve`  | 折线图 | `line_aime.py`        | 垂直断点线 + 水平参考线                |
| `line_loss_with_inset` | 折线图 | `line_loss_inset.py`  | L 形 spine + 局部放大 inset            |
| `scatter_tsne_cluster` | 散点图 | `scatter_tsne.py`     | t-SNE 聚类 + 注释框                    |
| `scatter_broken_axis`  | 散点图 | `scatter_break.py`    | 折断 X 轴，多 marker 系列              |
| `radar_dual_series`    | 雷达图 | `radar_dora.py`       | 双方法多维对比，正八边形网格           |

(scripts under `<skill-dir>/scripts/`)

## Data substitution tips

每个脚本的数据区在文件顶部，通常是 `np.array(...)` 或字典。替换规则：

- 保持数组维度和类型不变
- 若类别数变化（如从 4 组改为 6 组），同步调整颜色列表和宽度计算
- x 轴标签、图例标签直接修改对应字符串列表
- 输出路径由 `argv[1]` 控制（缺省写入当前目录的 `*_repro.png`）；
  `line_selfdistill.py` 产出两张图，分别由 `argv[1]`、`argv[2]` 控制

## Detailed style parameters

Read the corresponding file in `../styles/` for exact `rcParams`, colors, font
sizes, spine settings, and tick directions before generating:

- Bar: `../styles/bar_paired_delta.md`, `../styles/bar_grouped_hatch.md`
- Line: `../styles/line_confidence_band.md`, `../styles/line_training_curve.md`, `../styles/line_loss_with_inset.md`
- Scatter: `../styles/scatter_tsne_cluster.md`, `../styles/scatter_broken_axis.md`
- Radar: `../styles/radar_dual_series.md`
