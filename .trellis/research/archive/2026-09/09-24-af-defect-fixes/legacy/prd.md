# 修复 academic-figure 一致性缺陷与脚本健康问题

父任务：`.trellis/tasks/09-24-academic-figure-f4p-upgrade`。证据来源：父任务
`research/skill-audit.md`（编号 S、A、B）与 `research/figures4papers-catalog.md`
（第 2 节声明核验、第 4.3 节代码相似片段）。

## Goal

修正 skill 中与上游现状不符的记录、文件之间互相矛盾的规则、无证据的设计声明，
以及现有 9 个风格脚本的运行问题。本任务不增加新图型。

## Requirements

- R1：许可证记录（A1、A2）。`attribution.md` 把 figures4papers 记为 CC BY-NC 4.0、
  快照 `3c181f8`（2026-09-06）；「Projects without a license」一节只保留
  paper-plot-skills；新增 figures4papers 一节，写明用户决定（2026-09-24）：本项目
  开源、非商用，允许移植 figures4papers 的脚本与原图，并在 README 与移植记录表中
  注明来源。`design-theory.md:3-6` 与 `panel-layout-patterns.md:9-12` 同步更新。
  `chart-recipes.md:306` 与 `panel-layout-patterns.md:40-47,56-57,66-70` 标明其
  原始来源为 figures4papers（经 nature-figure 转述）。
- R2：无证据的设计声明（catalog 第 2 节）。`design-theory.md:74`（手动设定刻度位置）、
  `:75`（黑色柱边框作为通用规则）、`:84`（`fill_between` 表示不确定性）改为与
  figures4papers 脚本一致的表述，或删除；保留的数值附脚本出处。
- R3：导出与布局规则统一（A6、A7、A14、A17、A18）。期刊图只用
  `layout="constrained"`，预设与 recipe 不再默认 `bbox_inches="tight"`；只在导出
  宽度不需要等于卡片宽度时允许 `tight`。`tight_layout` 只用于展示级图。
- R4：配色规则统一（A8、A9）。Okabe-Ito 8 色表只定义一处（含黑色）；中性灰使用
  独立常量 `NEUTRAL_GRAY`；「颜色亮度接近」改为「按亮度拉开，保证灰度副本可区分」。
- R5：recipe 与 pitfall 冲突（A10）。GAN recipe 改为两个上下排列、`sharex=True`
  的面板，不使用 `twinx()`。
- R6：plotly 尺寸规则（A11、A15、A16）。只保留一条字号与 `scale` 换算规则，使
  9 pt 在导出图中为 9 pt；`modes/journal-spec.md` 为 plotly 写明视觉审阅分支
  （kaleido 导出 PNG → `render_preview` → 跳过 `audit_layout` → 逐项感知检查）。
- R7：过时声明与指针（A3、A4、A5、A13）。`attribution.md:16` 的 WCAG 与出处字段
  声明与 `qa-checklist.md` 一致；删除指向未随 skill 发布的 `research/*.md` 的指针；
  修正过时步骤号；风格文档字体与脚本一致。
- R8：无 LaTeX 降级（A12、S2）。使用 usetex 的现有脚本（`bar_spice.py`、
  `line_selfdistill.py`、`scatter_tsne.py` 及审计列出的其余脚本）检测 `latex`；
  不可用时改用 mathtext 与 `fontweight` 的等价标签。`from-data.md:78-80` 与
  `interface.yaml:28` 改为新的降级说明；`interface.yaml` 的 `network` 写明可选的
  本地回环服务（AgentFigureGallery UI）。
- R9：脚本健康（B1、B2、B3、B5、B6）。9 个风格脚本在导入 `pyplot` 前选择 `Agg`；
  成功信息打印实际输出路径；`bar_memevolve.py` 的增益标签与 `ylim` 由数据计算；
  `scatter_break.py` 在缺少 scipy 时退回 `numpy.interp` 并打印一条警告；
  `visual_qa.py` 的 `--preview` 对栅格输入写出预览文件。
- R10：回归测试。新增 Node 测试：(a) 在临时目录运行 9 个风格脚本，强制无 LaTeX
  模式，断言退出码为 0 且输出 PNG 存在；缺少 matplotlib 时整体跳过并给出原因。
  (b) `SKILL.md` 与 `references/modes/*.md` 中反引号内的 `references/`、`scripts/`、
  `assets/` 路径均存在。

## Acceptance Criteria

- [ ] AC1：`grep -rn "no LICENSE\|None\*\*" references/attribution.md` 不再命中
      figures4papers 行；`design-theory.md` 与 `panel-layout-patterns.md` 的来源行
      写 CC BY-NC 4.0 与 `3c181f8`。
- [ ] AC2：`design-theory.md` 中每条数值规则都能在 catalog 第 2 节找到 VERIFIED 或
      PARTIAL 的证据；三条无证据规则已改写或删除。
- [ ] AC3：`grep -rn "bbox_inches=\"tight\"\|savefig.bbox" references/` 只命中说明
      例外的一句；期刊 recipe 的 `plt.subplots(` 调用均带 `layout="constrained"`。
- [ ] AC4：Okabe-Ito 列表在 references 中只出现一次定义；`NEUTRAL_GRAY` 有定义。
- [ ] AC5：`chart-recipes.md` 的 GAN recipe 不含 `twinx`。
- [ ] AC6：`plotly-recipes.md` 与 `qa-checklist.md` 的 plotly 字号换算规则相同；
      按该规则导出的 9 pt 文本在 PDF 中经 `audit_pdf_text.py` 测得不低于 8.5 pt
      （有 kaleido 时实测，否则标 `missing evidence`）。
- [ ] AC7：在 `PATH` 中去掉 `latex` 后运行 `scatter_tsne.py`，输出 PNG 中无
      `\textbf` 字面文本（人工查看 PNG，结果写入 check 记录）。
- [ ] AC8：新增测试在本机通过；`scatter_break.py` 在无 scipy 环境下退出码为 0。
- [ ] AC9：`PYTHONUTF8=1 just skills-check`、`just python-check`、`just node-test`
      通过。

## Out of Scope

- 不增加新图型、新风格或辅助模块（其他子任务负责）。
- B4（`--data file.json` 参数）不实现。
- 不改 `version`，不运行 `just docs-sync`（父任务集成时执行）。
