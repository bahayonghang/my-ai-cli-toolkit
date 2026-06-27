---
name: paper-plot
description: >
  Generate or reproduce publication-quality matplotlib figures in real academic
  paper styles. Two modes: (from-data) pick a pre-built paper style and fill in
  your numbers; (from-image) reproduce an uploaded paper figure as a matplotlib
  script. Use when the user wants to "plot this data", "make a bar/line/scatter/
  radar chart", "用某风格画我的数据", "把数据画成论文图", names a style from the
  catalog (bar_paired_delta, bar_grouped_hatch, line_confidence_band,
  line_training_curve, line_loss_with_inset, scatter_tsne_cluster,
  scatter_broken_axis, radar_dual_series), or uploads a paper figure and asks to
  "复现这张图" / "reproduce this figure" / "照着这个图画". This skill draws and
  reproduces figures; it does NOT read, summarize, or compare paper content —
  route single-paper deep reading to literature-mentor and multi-paper
  intake/synthesis to paper-workbench.
category: research-learning-knowledge
tags: [matplotlib, plotting, figures, paper, reproduction, visualization]
version: 1.0.0
---

# Paper Plot

Produce paper-quality matplotlib figures, either by filling a pre-built style with
your data or by reproducing an uploaded paper figure. All outputs are `dpi=300` PNG.

> `<skill-dir>` below is this skill's directory — substitute the absolute path
> announced when the skill loads. On Windows, prefix script runs with
> `PYTHONUTF8=1` when reading/writing UTF-8 (see [resources](#resources)).

## Pick a mode

| You have… | Mode | Read |
|-----------|------|------|
| Data + a target style (or a style name) | **from-data** | `references/modes/from-data.md` |
| A paper figure image to recreate | **from-image** | `references/modes/from-image.md` |

If unsure which style fits the data, from-data explains how to infer it from the
data shape; from-image explains how to match an image to a style or build from scratch.

## Style catalog (from-data)

| Style | Type | Script | 适用场景 |
|-------|------|--------|---------|
| `bar_paired_delta` | 柱状图 | `scripts/bar_memevolve.py` | Baseline vs method 配对对比 + 增益箭头 |
| `bar_grouped_hatch` | 柱状图 | `scripts/bar_spice.py` | 多方法消融，主方法斜线填充，柱顶数值 |
| `line_confidence_band` | 折线图 | `scripts/line_selfdistill.py` | 带置信区间的训练曲线 |
| `line_training_curve` | 折线图 | `scripts/line_aime.py` | 垂直断点线 + 水平参考线 |
| `line_loss_with_inset` | 折线图 | `scripts/line_loss_inset.py` | L 形 spine + 局部放大 inset |
| `scatter_tsne_cluster` | 散点图 | `scripts/scatter_tsne.py` | t-SNE 聚类 + 注释框 |
| `scatter_broken_axis` | 散点图 | `scripts/scatter_break.py` | 折断 X 轴，多 marker 系列 |
| `radar_dual_series` | 雷达图 | `scripts/radar_dora.py` | 双方法多维对比，正八边形网格 |

Per-style exact parameters (rcParams, colors, font sizes, spines, ticks) live in
`references/styles/<style>.md` — read the matching file before generating.

## Running a script

```bash
# default output name in the current directory:
python <skill-dir>/scripts/<script>.py
# or choose the output path:
python <skill-dir>/scripts/<script>.py my_figure.png
```

Each script embeds its data near the top (clearly marked) — copy the script, swap
the data block, then run. The output path is `argv[1]` (defaults to a `*_repro.png`
name in the working directory). `line_selfdistill.py` emits two figures
(`argv[1]`, `argv[2]`).

## Dependencies & caveats

- Needs `matplotlib`, `numpy`. `scatter_break.py` also needs `scipy`; the
  `usetex=True` styles (`bar_grouped_hatch`, `line_confidence_band`,
  `line_loss_with_inset`, `scatter_tsne_cluster`) require a working LaTeX install —
  swap to `text.usetex: False` if LaTeX is unavailable.

## Resources

- **Modes**: `references/modes/from-data.md`, `references/modes/from-image.md`
- **Styles**: `references/styles/` — 8 parameter files
- **From-scratch analysis**: `references/reproduction_guide.md`
- **Scripts**: `scripts/` — 8 style scripts + `classwise_iou_table.py` (from-image example)
- **Gallery**: `assets/originals/` — 10 paper figures used to derive the styles (visual reference for from-image matching)
