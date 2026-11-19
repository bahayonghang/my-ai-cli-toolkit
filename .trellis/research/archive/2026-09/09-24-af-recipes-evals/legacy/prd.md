# 补齐 academic-figure 图型 recipe 与评测用例

父任务：`.trellis/tasks/09-24-academic-figure-f4p-upgrade`。证据：父任务
`research/skill-audit.md` C5、S4、S5，`research/figures4papers-catalog.md` G7、G12。

## Goal

让 `chart-selection.md` 推荐的每个图型在 `chart-recipes.md` 中都有可运行的 recipe；
扩充 evals，覆盖四个模式、冲突规则、展示级分支与新目录风格。

## Requirements

- R1：新增 recipe。`chart-recipes.md` 为以下图型各写一节：分组柱与堆叠柱（含 100%
  堆叠）、均值 ± 误差柱、strip / beeswarm、箱线加原始点、小提琴、KDE、散点加拟合线、
  带数值标注的热图、ROC 与 PR 曲线、显著性括号。每节含适用条件（引用
  `chart-selection.md` 对应行）、最小代码、期刊导出方式。
- R2：recipe 代码调用 `scripts/figstyle.py` 的 `apply_style` 与 `save_figure`；配色
  使用 `OKABE_ITO`；不使用 seaborn 以外的新依赖，使用 seaborn 的节写出纯 matplotlib
  替代写法。
- R3：`chart-selection.md` 的推荐表每一行都指向一个存在的 recipe 节或目录风格。
- R4：evals。`evals/evals.json` 增加用例：冲突规则 2（同时明确要求精确模仿与期刊
  合规，询问一次）；advise 移交给 from-data；海报或幻灯片请求进入展示级分支；
  Science 或 Cell 目标；plotly 图进入视觉审阅分支；目录无法容纳的数据形状走
  「Build anew」；至少 3 个按 figures4papers 风格族出图的请求（自然语言，不写文件名）。
- R5：trigger 用例。新增 `evals/trigger_cases.json`，格式与
  `skills/developer-tools-integrations/storage-analyzer/evals/trigger_cases.json`
  相同；`should_trigger` 取自 evals 的正向用例，`negative_patterns` 取自 5 个转出用例。

## Acceptance Criteria

- [ ] AC1：R1 列出的 10 类图型在 `chart-recipes.md` 中各有一节；每节代码块在装有
      matplotlib 的环境中可直接运行（用临时脚本逐节执行，记录结果；依赖 seaborn 的节
      在缺少 seaborn 时运行其纯 matplotlib 替代写法）。
- [ ] AC2：`chart-selection.md` 推荐表中每个图型名都能在 `chart-recipes.md` 或
      `references/styles/` 找到对应条目（逐行核对，结果写入 check 记录）。
- [ ] AC3：`evals/evals.json` 为合法 JSON，每个新用例含 `id`、`prompt`、
      `expected_output`、`files`、`assertions`；R4 的每一项至少一个用例。
- [ ] AC4：`evals/trigger_cases.json` 为合法 JSON，键集合与 storage-analyzer 的文件相同。
- [ ] AC5：`just skills-check` 与 `just node-test` 通过。评测未被 CI 执行，交接说明把
      触发行为标为 `missing evidence`。

## Out of Scope

- 不修改 `figstyle.py`；需要新函数时回到 `af-figstyle-module` 修改其 PRD。
- 不运行真实提供商触发复测。
