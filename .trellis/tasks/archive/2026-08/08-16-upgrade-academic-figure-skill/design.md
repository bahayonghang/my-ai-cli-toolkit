# Design — academic-figure v1.1.0 能力整合

依据：`research/` 下 7 份分析记录（figures4papers / paper-plot-skills / nature-skills /
scipilot-figure-skill / kdense-scientific-visualization / agent-figure-gallery / pubfig）。

## 目标

把 7 个参考项目中与科研绘图直接相关、且现有 skill 缺失的能力，以最小结构变更并入
academic-figure，保持现有 3 模式契约与测试不回归。

## 非目标

- 不 vendor 参考图库、二进制资产、上游整仓代码。
- 不重写现有 from-data / from-image 的 9 个脚本与 8 个风格文档（只补署名与修指针）。
- 不引入 R 栈、Figma 工作流、AI 图形摘要路由（现有路由表已外送）。
- 不发布（qiaomu-meta publish 流程不触发）。

## 许可证约束（决定吸收方式）

| 来源 | 许可证 | 吸收方式 |
| --- | --- | --- |
| figures4papers | 无 LICENSE | 只按事实性设计规则自行改写，不复制代码/文本/图片 |
| paper-plot-skills | 无 LICENSE | 内容已在既有提交中入库；本次补来源标注，不再新增复制 |
| nature-skills (nature-figure) | Apache-2.0 | 可移植脚本与文档结构，保留版权与出处声明 |
| AgentFigureGallery | MIT | 集成指引 + 工作流思想，标注来源 |
| K-Dense scientific-visualization | MIT | 检查项与口径以文档形式改写，不搬脚本 |
| pubfig | MIT | 集成指引，标注版本 0.3.0 |

## 能力 → 落点映射（研究修订版）

| 来源 | 吸收能力 | 落点 |
| --- | --- | --- |
| SciPilot | advise 模式：数据画像行内协议（不移植 profile_data.py，避免 pandas/scipy 依赖）→ 论证目标确认 → 决策三轴 + 样本量阈值表推荐 → 拦截 → 交接 | 新增 `references/modes/advise.md`（协议）+ `references/chart-selection.md`（决策框架，改写自 chart_selection.md + data_profiling.md 要点）；SKILL.md 路由表加一行 |
| SciPilot + K-Dense | P1–P18 拦截清单 + 四步拦截协议（说明命中项 → 审稿人视角 → 替代方案 → 询问并留痕）；K-Dense 误导性编码条目并入去重 | 新增 `references/viz-pitfalls.md`；advise 与 journal-spec 引用 |
| SciPilot | 视觉自检闭环：渲染 PNG 预览 → `visual_qa.audit_layout`（缺字 FAIL/裁切/刻度重叠）→ AI 读图 8 项清单 → 回改对应表 → 3 轮上限 | 新增 `references/visual-review.md` + 移植 `scripts/visual_qa.py`（MIT 头注，仅依赖 matplotlib）+ `tests/visual-qa.test.mjs`（无 matplotlib 时 skip）；journal-spec 第 6 步前插入 |
| SciPilot | CJK 字体优先级链（10 项 sans + 7 项 serif 混排）与三平台安装提示；按最终尺寸导出不二次缩放 + 灰度预览产物 | `references/matplotlib-recipes.md` CJK 段扩充；导出规则并入 `references/qa-checklist.md`（不移植 export_figure.py / setup_style.py / layout_tools.py / check_figure.py） |
| nature-skills | 渲染后逐 Panel 审计表 + 「遮住该 Panel」测试 + 5 pt 字形地板（mathtext 缩放风险）+ 不确定度跨面板一致性 | `references/qa-checklist.md` 增量小节 |
| nature-skills | 零依赖 PDF 字号审计脚本 `audit_pdf_text.py`（Tf 算子扫描，`--min-pt`） | 移植为 `scripts/audit_pdf_text.py`（Apache-2.0 头注 + 出处），qa-checklist 引用；配 `tests/audit-pdf-text.test.mjs`（镜像 pref-script 测试模式） |
| nature-skills | 多 Panel 布局模式增量（hero panel、专用图例面板、非对称布局、组中组分组条、深色影像板、条内文字亮度自适应等，现有 Cross-cutting 未覆盖部分） | 新增 `references/panel-layout-patterns.md`；`chart-recipes.md` Cross-cutting 节尾加指针 |
| nature-skills | 图注写作规范（骨架、时态、自洽性、长度门、中文图注） | 新增 `references/figure-legend-conventions.md` |
| nature-skills | 按论点归组数据表 + 配对差值检查；素材复用四级阶梯 + 变换守卫 | 前者补入 `references/figure-contract.md`；后者以短节并入 `references/modes/from-data.md`，`from-image.md` 交叉引用 |
| K-Dense | 投稿阶段维度（initial/final）与「不推断期刊要求、核对官方现行说明」约束；图类型 × DPI × 格式对照；Science/Cell 短卡片 | `references/journal-specs.md` 增量（保守数值 + 来源） |
| K-Dense | 导出后机器检查清单（格式 / 有效 DPI / 最终宽高 mm / 色彩模式 / 透明度 / 文件大小；pass/fail/review/unknown 四态）；误导性编码条目（与 SciPilot 拦截清单去重）；WCAG/灰度数值口径；溯源清单字段 | `references/qa-checklist.md` 增量小节（文档化，不搬脚本） |
| K-Dense | style 临时上下文、精确物理尺寸时不用 `bbox_inches="tight"` 的取舍 | `references/matplotlib-recipes.md` 增量 |
| figures4papers | 语义调色板角色（蓝=提出方法/绿=改进/红=基线/灰=背景/金=单点强调）+ 两档字号线宽体系（展示尺度，显式标注不适用期刊单栏）+ 统一导出契约思想（多格式一次导出、自动建目录）+ 超宽面板比例规则 | 新增 `references/design-theory.md`（全部自行改写，标注「无 LICENSE，仅参考设计规则」） |
| AgentFigureGallery | 「先取参考、后写代码；查看源脚本而非只看截图」规则；外部工具集成指引（检测 → query/gallery/prefer/bundle 六步 → 偏好语义 → 降级说明） | 规则并入 `references/modes/from-image.md`；新增 `references/agent-figure-gallery-integration.md`（结构仿 industrytslib-integration.md） |
| pubfig | 可选绘图后端集成指引：检测条件、两路径判定（41 kind 命中表）、JSON spec 契约（validate-spec → render）、`save_figure`/`batch_export` 行为、期刊覆盖差异（仅 nature/science/cell，IEEE/Elsevier/中文回落本 skill 卡片）、调色板出处澄清（ggsci 衍生） | 新增 `references/pubfig-integration.md`；`modes/journal-spec.md` 集成检查步提及 |
| paper-plot-skills | 差异校对结论：上游无新增；补 5 个风格文档来源论文行、修 3 个失效原图指针、校正 from-image.md「7 papers」表述 | `references/styles/*.md` 5+3 处小修；`modes/from-image.md` 1 处 |
| 全体 | 来源与许可证总登记 | 新增 `references/attribution.md`；SKILL.md Resources 引用 |

## 文件清单

新增（15）：`references/modes/advise.md`、`references/chart-selection.md`、
`references/viz-pitfalls.md`、`references/visual-review.md`、
`references/design-theory.md`、`references/panel-layout-patterns.md`、
`references/figure-legend-conventions.md`、
`references/agent-figure-gallery-integration.md`、`references/pubfig-integration.md`、
`references/attribution.md`、`scripts/visual_qa.py`、`scripts/audit_pdf_text.py`、
`tests/visual-qa.test.mjs`、`tests/audit-pdf-text.test.mjs`、`agents/interface.yaml`。

修改（12 组）：`SKILL.md`、`references/modes/journal-spec.md`、
`references/modes/from-data.md`、`references/modes/from-image.md`、
`references/qa-checklist.md`、`references/journal-specs.md`、
`references/figure-contract.md`、`references/chart-recipes.md`、
`references/matplotlib-recipes.md`、`references/plotly-recipes.md`、
`references/styles/*.md`（8 个中 5 补来源 + 3 修指针）、`evals/evals.json`。

## advise 模式设计（唯一的路由变更）

- 入口意图：有数据但未指定图型/风格（"不知道用什么图"、"怎么展示这份数据"、
  "what chart should I use"），或用户指定图型触发拦截规则。
- 流程：数据画像（行内 pandas 协议，不新增脚本）→ 确认论证目标（问一次）→
  决策表推荐（推荐 + 理由 + 1–2 备选）→ 拦截检查 → 交接 journal-spec（默认）
  或 from-data（命中目录风格时）。
- 输出契约：推荐意见 + 交接后按目标模式契约产图；advise 本身不产图。
- 路由优先级不变：显式期刊目标最高（journal-spec）；命名目录风格进 from-data；
  既有 17 条评测路由结论全部不变。

## SKILL.md 变更

- Pick a mode 表加 advise 行；Resolve conflicts 补一条；Output contracts 表加 advise 行。
- Resources 节登记全部新增 references 与 `scripts/audit_pdf_text.py`。
- description 重写：双语触发短语覆盖新能力（选图建议、投稿审计、参考图筛选、
  pubfig 后端），无尖括号、≤1024 字符；近邻边界避开 dataviz / BI / 图像生成 /
  literature-mentor / paper-workbench。
- tags 增补；version 1.0.0 → 1.1.0。
- 新增 `agents/interface.yaml`（仓库既有样式：interface + compatibility）。

## 评测计划

- 扩展 evals/evals.json（人审 fixture）：新增约 6 条 —— advise 路由、拦截场景
  （n=5 均值柱）、投稿前文件审计（review-only + audit_pdf_text）、pubfig 后端、
  参考图筛选（已装 AgentFigureGallery）、"EDA 探索无发表目标"负例。既有 17 条不动。
- 触发边界门：trigger 用例存本任务 `research/`（仓库 skill-authoring-conventions
  的既定做法），运行 qiaomu-meta trigger_eval.py；语义配置不适配时记 missing evidence。

## 验证与回滚

- 验证顺序：`just skills-check` → `just python-check` → `just node-test` →
  `just docs-sync`（frontmatter 变更后必须，docs/ 再生成页一并提交）→ `just ci`。
- qiaomu validate_skill.py 对 skill 目录执行一次，结果记入任务。
- 回滚：变更集中于 skill 目录与 docs/ 再生成页，单次 revert 可回滚。
  `ref/repo/plot_ref/` 在 gitignore 内，不参与提交。
