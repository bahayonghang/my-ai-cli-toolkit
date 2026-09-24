# 移植 figures4papers 全部可用绘图脚本

父任务：`.trellis/tasks/09-24-academic-figure-f4p-upgrade`。证据：父任务
`research/figures4papers-catalog.md` 第 1 节（逐脚本清单）、第 3 节（差距 G1–G24）、
推荐 9（上游错误）；`research/skill-audit.md` C2、C3。

## Goal

把 figures4papers（CC BY-NC 4.0，快照 `3c181f8`）的 24 个绘图脚本及其输出图移植为
academic-figure 的目录风格，使 from-data 与 from-image 能按这些风格出图，并为
海报、幻灯片、README 图提供展示级分支。

## Background

- 用户决定（2026-09-24）：本项目开源、非商用，移植所有可用的功能与脚本，在 README
  注明参考了 figures4papers。
- 上游 25 个 `.py` 文件中，`figure_ImmunoStruct/raw_data.py` 是数据模块，随
  `plot_bars.py` 一起移植；其余 24 个是绘图脚本。
- 上游 `assets/` 的 10 张示意图不是 Python 生成，不在移植范围。

## Requirements

- R1：脚本移植。24 个绘图脚本与 `raw_data.py` 放在
  `scripts/figures4papers/<project>/`，保留上游文件名。每个文件第一行注释写明上游
  路径、快照 `3c181f8` 与 CC BY-NC 4.0。
- R2：运行契约。每个脚本在导入 `pyplot` 前选择 `Agg`；第一个位置参数为输出目录
  （缺省为当前目录），输出文件名与上游相同；环境变量 `ACADEMIC_FIGURE_DPI` 覆盖
  DPI（缺省保留上游值）；成功后逐行打印写出的路径；字体使用回退链
  `["Helvetica", "Arial", "DejaVu Sans"]`；保留上游 `figsize`、`ylim`、配色与字号。
- R3：无 LaTeX 降级。上游 6 个 usetex 脚本沿用 `af-defect-fixes` 的 `USE_TEX` 机制
  （检测 `latex` 与 `ACADEMIC_FIGURE_NO_TEX=1`）；降级时图中不出现未解析的 TeX 命令。
- R4：上游错误修正。修正 catalog 推荐 9 列出的问题：`plot_trend.py:20-21` 重复日期键；
  `plot_trend.py:35` 的 `'2023-9'` 使 GPT-4v 事件不显示；`diffusion_swiss_roll.py`
  无随机种子；`plot_bars.py:27` 设置 `svg.fonttype` 却只导出 PNG（保留 PNG，另加
  `pdf.fonttype = 42`）；`VIGIL/plot_ablation.py:18` 的非 raw 字符串；
  `plot_manifold.py:61` 未设 DPI（改为 300）。每项修正写入移植记录表。
- R5：原图。上游 `figure_*/figures/` 下的 PNG 缩放到长边不超过 2400 px，放在
  `assets/originals/figures4papers/<project>/`，文件名不变；PDF 副本不移植。
  该目录总大小不超过 8 MB。
- R6：风格文档。按图型分为 14 个风格族，每族一份 `references/styles/f4p_<family>.md`，
  格式与现有 `references/styles/*.md` 相同：来源论文、适用场景、参数（figsize、
  字号、线宽、配色 hex、布局）、关键技法、数据替换要点、可选依赖、对应脚本与原图。
  风格族与脚本的对应关系见 `design.md` 第 1 节。
- R7：路由。`modes/from-data.md` 的风格→脚本表加入 14 个风格族；新增「展示级分支」
  一节：海报、幻灯片、README 图，无期刊目标，未指定风格时，按图型选风格族，并使用
  `figstyle.apply_style("display")`；输出 matplotlib 脚本、300 dpi PNG 与同名 PDF。
  `modes/from-image.md` 的风格匹配表加入 14 个风格族。
- R8：3D 边界。`viz-pitfalls.md` 的 P3 写明：数据图不用 3D；概念示意图（球面、
  能量曲面）允许 3D，须在图注中说明为示意。
- R9：移植记录。`references/attribution.md` 增加移植记录表：上游路径、skill 路径、
  改动（R2 通用改动与 R4 专项修正）。
- R10：测试。新增 `tests/f4p-scripts.test.mjs`：设 `ACADEMIC_FIGURE_NO_TEX=1`、
  `ACADEMIC_FIGURE_DPI=40`，在临时目录运行每个脚本，断言退出码为 0 且上游文件名的
  PNG 全部存在。缺少 matplotlib 时整体跳过；缺少 scipy、seaborn、dateutil 时只跳过
  依赖它们的脚本，并在跳过原因中写出模块名。

## Acceptance Criteria

- [ ] AC1：`scripts/figures4papers/` 下有 24 个绘图脚本与 `raw_data.py`；每个文件
      第一行注释含上游路径、`3c181f8` 与 `CC BY-NC 4.0`。
- [ ] AC2：R10 测试在本机通过；跳过的脚本数量与本机缺少的模块一致，并打印原因。
- [ ] AC3：按缺省 DPI 运行 `plot_trend.py`，输出图中显示 GPT-4v 事件标签（人工查看，
      写入 check 记录）。
- [ ] AC4：`assets/originals/figures4papers/` 总大小不超过 8 MB，每张图长边不超过
      2400 px。
- [ ] AC5：14 份风格文档存在；每份列出的脚本与原图路径均存在。本任务把
      `references/styles/f4p_*.md` 加入 `af-defect-fixes` 路径存在性测试的扫描范围。
- [ ] AC6：`modes/from-data.md` 与 `modes/from-image.md` 的表格各含 14 个新风格族。
- [ ] AC7：`attribution.md` 移植记录表覆盖 25 个文件；R4 的 6 项修正各有一行说明。
- [ ] AC8：`just python-check` 与 `just node-test` 通过。

## Out of Scope

- 不把移植脚本改写为调用 `figstyle`（目录脚本保持自包含）。
- 不增加 `--data file.json` 参数；数据仍在脚本顶部数据区替换。
- 不移植上游 `scientific-figure-making/` 的 Markdown 文本。其中的设计事实已在
  `design-theory.md`，由 `af-defect-fixes` 按 catalog 核验结果修正。
