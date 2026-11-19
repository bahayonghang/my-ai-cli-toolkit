# 新增 academic-figure house-style 辅助模块

父任务：`.trellis/tasks/09-24-academic-figure-f4p-upgrade`。证据：父任务
`research/skill-audit.md` C1、C4，`research/figures4papers-catalog.md` G2–G4、G6、
G10、G25–G27 与 `api.md` 核验（第 2.2 节：上游只写了接口，没有实现）。

## Goal

提供一个可导入的 Python 模块 `scripts/figstyle.py`，把 skill 中以文字描述的样式、
导出契约与配色检查变成可执行代码。新 recipe 与展示级分支调用该模块。

## Requirements

- R1：配色常量。`OKABE_ITO`（与 `matplotlib-recipes.md` 色表一致）、`NEUTRAL_GRAY`、
  figures4papers 语义色 `F4P_PALETTE`（catalog 第 2.1 节第 13 行的 hex 值，按
  proposed / improvement / baseline / neutral / highlight 角色命名）。
- R2：样式预设。`apply_style(tier, *, journal=None)`：`tier` 取 `display`（24 pt、
  线宽 3）、`compact`（15–16 pt、线宽 2）、`journal`（读取传入的期刊卡片参数：
  宽度、字号、字体）。三者都关闭上、右 spine，图例无边框，设置字体回退链
  `["Helvetica", "Arial", "DejaVu Sans"]`，`pdf.fonttype = 42`、`ps.fonttype = 42`、
  `svg.fonttype = "none"`。返回可用作上下文管理器的对象，退出时恢复 rcParams。
- R3：导出契约。`save_figure(fig, base_path, formats=("pdf", "png"), dpi=300, *, match_width=True)`：
  格式白名单 pdf、svg、eps、png、jpg、jpeg、tif、tiff，其余格式抛 `ValueError`；
  创建父目录；返回写出的 `Path` 列表；`match_width=True` 时不使用
  `bbox_inches="tight"`，保证导出宽度等于 `figsize` 宽度。
- R4：布局与标注辅助。`legend_panel(ax, handles, labels, **kw)`（关闭坐标轴后放图例）；
  `split_legends(ax_color, ax_hatch, ...)`（颜色图例与填充图例分开，使用代理柱）；
  `label_bars(ax, bars, fmt, *, stroke=True)`（柱值标注，可选 `path_effects` 描边）；
  `text_color_for(bg_hex)`（按相对亮度返回黑或白）；`sci_ticks(ax, axis="y")`。
- R5：配色检查。`check_palette(colors)` 返回每对颜色在正常视觉、红绿色盲
  （deuteranopia、protanopia）、蓝黄色盲（tritanopia）模拟与灰度下的最小差值，
  并给出 PASS / WARN 结论；阈值写成模块常量。CLI：`python figstyle.py check-palette "#hex" ...`
  输出 JSON。
- R6：依赖。只依赖 matplotlib 与 numpy；不依赖 scipy、seaborn。可按
  `sys.path.insert(0, "<skill-dir>/scripts")` 导入，与现有脚本自定位方式一致。
- R7：测试。新增 `tests/figstyle.test.mjs`，缺少 matplotlib 时跳过并给出原因；覆盖：
  格式白名单拒绝、父目录创建、返回路径、`match_width=True` 时 PNG 像素宽度等于
  `figsize` 宽度 × dpi、rcParams 在上下文退出后恢复、`text_color_for` 对深色与浅色
  背景的结果、`check_palette` 对红绿对给出 WARN、对 Okabe-Ito 前 4 色给出 PASS。

## Acceptance Criteria

- [ ] AC1：`python scripts/figstyle.py --help` 退出码为 0 并列出 `check-palette` 子命令。
- [ ] AC2：R7 列出的每一项都有对应测试，并在本机通过。
- [ ] AC3：`matplotlib-recipes.md` 与 `design-theory.md` 各增加一行，指向
      `scripts/figstyle.py` 的对应函数；两处文字不重复模块内的数值。
- [ ] AC4：`just python-check` 与 `just node-test` 通过。

## Out of Scope

- 不改写现有 9 个风格脚本与移植脚本来调用本模块（目录脚本保持自包含）。
- 不实现 `api.md` 中的 `make_*` 绘图函数；图型代码写在 recipe 中。
