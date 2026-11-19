# implement.md — academic-figure 技能实施计划

执行约定：进入 Execute 阶段后按阶段派发 `trellis-implement`（提示词首行 `Active task: .trellis/tasks/07-09-academic-figure-skill`）；每阶段验证通过才进入下一阶段；上下文顺序 implement.jsonl → prd.md → design.md → implement.md。规格数值与 API 名一律取自 `research/` 三份报告，禁止凭记忆书写。

Windows 约束贯穿全程：Python 调用带 `PYTHONUTF8=1`；禁用 `rm -rf`（pre-bash hook 拦截，用 `mv` 到备份目录）。

## P0 前置检查 ✅ 2026-07-09
- [x] `git status` 干净（仅本任务工件为 untracked）
- [x] 确认 `research/` 三份报告在位

验证：`git status`。回滚点：尚无改动。

## P1 类目脚手架（R1/R13 · D1/D2）✅ 2026-07-09
- [x] 创建 `skills/academic-research-tools/academic-figure/` 目录骨架（references/ scripts/ tests/ evals/，暂以 .gitkeep 占位，P9 清理）
- [x] 写类目 `skills/academic-research-tools/AGENTS.md`
- [x] `skills/code_map.md` Internal Routing 增加 `academic-research-tools/` 一行
- [x] 计划外必要项：`scripts/check.py` 的 `CANONICAL_CATEGORY_SLUGS` 白名单注册新类目（checker 硬编码，不加则 skills-check 报错；单行最小改）

验证：目录结构与 D2 一致。回滚点：删除新目录 + 还原 code_map.md（单提交内聚）。

## P2 SKILL.md 路由器（R2/R7/R12 · D3/D8/D12）✅ 2026-07-09
- [x] frontmatter：顶层五字段齐备（skills-check 通过）
- [x] 正文 66 行：六步路由 + 近邻路由表（paper-plot / literature-mentor / paper-workbench）
- [x] `<skill-dir>` 字面替换写法

验证：`just skills-check`；对照 D8 逐触发词通读。评审门：description 触发边界建议用户过目。回滚点：`git checkout` 该文件。

## P3 期刊规格卡（R3 · D4）
- [ ] `references/journal-specs.md`：IEEE / Elsevier / Nature 三卡 + springer / chinese-thesis 扩展档；每个数值带来源 URL 或 `missing evidence` 标注；附"以目标刊 Guide for Authors 为准"免责说明（Elsevier 尺寸随刊变化）

验证（A5）：抽查 ≥5 个数值可回溯到 `research/journal-specs-and-tooling.md` 中的 URL。

## P4 库配方（R4/R6/R8 · D5/D6）
- [ ] `references/matplotlib-recipes.md`：三刊 rcParams preset、SciencePlots 路线 vs 纯 rcParams 路线的选择规则、seaborn `set_context("paper")`/`despine` 协同、`pdf.fonttype=42`/`ps.fonttype=42` 嵌字、CJK 字体链 + `axes.unicode_minus=False`
- [ ] `references/plotly-recipes.md`：期刊化 layout template、kaleido 导出格式矩阵、EPS 坑（kaleido v1 已弃 EPS → PDF/SVG 再转换或降级 v0）、CJK 依赖系统字体、色盲安全默认盘（Okabe-Ito / viridis）

验证：抽两份 recipe 各一个最小代码块本地运行（`PYTHONUTF8=1`；本机缺 matplotlib/plotly 环境则做 `py_compile` 语法级验证并在任务中记录 missing evidence）。

## P5 图表家族与 industrytslib 集成（R5 · D6）✅ 2026-07-09
- [x] `references/chart-recipes.md`（329 行：10 家族 + 跨刊布局模式节）
- [x] `references/industrytslib-integration.md`（179 行：检测规则、两档路径、33 行映射表、3 示例、env 三件套、4 条 caveat）

验证（A4）：映射表与示例共 73 个 API 名 grep 自查全部命中 `research/industrytslib-viz-inventory.md`，0 缺失。

## P6 契约与 QA（R7/R9 · D3）✅ 2026-07-09
- [x] `references/figure-contract.md`（127 行：五点契约改造版，双轴推断、最多问一次）
- [x] `references/qa-checklist.md`（94 行：多刊通用逐条 pass 表 + matplotlib/plotly 导出块）

验证：SKILL.md 引用的 7 个 references 文件名全部在盘（含 P3/P4 并行落盘的三份），互链一致。

## P7 偏好脚本与测试（D7）✅ 2026-07-09
- [x] `scripts/academic_figure_pref.py`（纯 stdlib；get/set/clear/path；ACADEMIC_FIGURE_CONFIG 覆盖）
- [x] `tests/pref-script.test.mjs`（node:test + 子进程 + 临时配置目录；python 缺失时优雅 skip）

验证：`PYTHONUTF8=1 just python-check` 通过（35 文件）；`just node-test` 通过（146 pass / 0 fail，新增 5 用例实跑全绿）。

## P8 evals 与近邻回写（R11/R12 · D9/D12）✅ 2026-07-09
- [x] `evals/evals.json`：10 条 = 6 正例 + 4 负例（含 2 条 paper-plot 路由负例）；房规 schema；UTF-8 JSON 校验通过；industrytslib 用例 API 已对照盘点报告核实
- [x] paper-plot description 末尾追加反向路由（已批准）："Route journal-submission-compliance figure requests (IEEE/Elsevier/Nature specs, vector export) to academic-figure."

验证（A6 部分）：`just skills-check` 两技能均 [OK]。逐例人工核查在 P10 干跑时一并复核。

## P9 文档与总检（R10）✅ 2026-07-09
- [x] `docs/scripts/sync_docs_catalog.py` 增加 academic-research-tools 中英标题（学术研究工具 / Academic Research Tools）
- [x] 清理 P1 的四个 `.gitkeep` 占位
- [x] `just docs-sync` → `just docs-check`（78 详情页重生成，构建通过）
- [x] `just ci` 退出码 0（5/5 步全绿）；变更文件 31 个均在范围内

验证（A1/A2/A7）：全绿；`git diff` 确认 docs 变更只含新类目/新技能。回滚点：docs/ 异常 → `git checkout docs/` 后重跑。

## P10 干跑验收（A3）✅ 2026-07-09
- [x] 三条路径干跑记录：`research/dry-run-report.md`（trellis-check 产出）
- [x] 路径 a IEEE+matplotlib：PASS（7.16in/Times/9pt/600dpi/PDF+EPS/fonttype=42）
- [x] 路径 b Elsevier+plotly：PASS（Arial 7pt/mm→px/kaleido EPS 替代路径/不出 PNG）
- [x] 路径 c Nature+seaborn+industrytslib：PASS（集成检测命中、t-SNE 映射正确、serif 偏差 caveat 正确暴露）
- [x] 核查中最小修复 1 处：industrytslib-integration.md 补"显式 seaborn 即使家族命中也走 path B（仅借样式）"消歧段
- [x] A1–A7 全 PASS（详见 dry-run-report.md 核查结论节）

已知边界（设计选择，保留）：eval 6 的裸"论文配图"与 paper-plot"把数据画成论文图"字面接近，按"无期刊名→问一次"消解。

## 提交策略（Phase 3 使用）
- `feat(skills): [AI] 新增 academic-research-tools 类目与 academic-figure 技能`（主体）
- `chore(skills): [AI] paper-plot 增加 academic-figure 反向路由`（若 P8 获批，独立提交）
- docs-sync 重生成若体量大可独立 `docs:` 提交
