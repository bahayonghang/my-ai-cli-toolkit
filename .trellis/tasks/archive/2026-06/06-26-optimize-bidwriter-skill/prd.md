# 优化 bidwriter 技能：扩展为通用招投标平台并重构 frontmatter

- Date: 2026-06-26
- Status: Planning
- Task: `.trellis/tasks/06-26-optimize-bidwriter-skill`

## Goal

把 `skills/docs-writing-publishing/bidwriter` 从"专精工程三类（工程咨询 / 建筑设计 / 市政工程）"的标书技能，升级为**通用招投标文件编写平台**：在保留工程建设类深度强项的同时，覆盖 IT/信息化、软件开发、货物采购、服务采购等各类招投标。本次为一次性全面优化，**frontmatter（尤其 `description` 路由面）是重点交付项**，同时把一篇实测文章暴露的真实触发词与避坑实践并入正文与 references。

## Background / Source

触发本次优化的素材是一篇公众号实测文章《AI 标书制作 Skill 全网实测：从 Claude 到 DeepSeek》。文章提供两类可落地信号：

1. **真实工作流**：解析 → 策略 → 生成 → 质检 四步（与 bidwriter 现有三阶段一致）。
2. **避坑清单（5 条）与一个核心亮点**，是当前 skill 的缺口：
   - 坑①：扫描件 / 图片型 PDF 不能直接解析，需先 OCR。
   - 坑②：不要让 AI 直接拍商务报价数字，AI 只给报价逻辑。
   - 坑③：必须明确交付物格式（已基本覆盖）。
   - 坑④：把评分细则单独拎出逐条核对（已覆盖）。
   - 坑⑤：数字 / 单位名称 / 人名 / 金额必须人工逐一复核（"AI 帮 80%，20% 人工审核定生死"）。
   - 亮点：技术指标点对点响应——对"增益≥60dB"这类参数，自动给出"我方典型值 65dB"的**满足 / 优于 / 偏离**超配响应。

文章实测用例是"政府政务云平台采购（IT/软件类，260 万）"，恰好落在当前 skill 的领域灰区，印证了扩展为通用招投标平台的必要性。

## User Decisions (confirmed this session)

- **领域范围**：全面扩展为通用招投标平台（新增 IT/货物/服务类模板与标准库；工程类保留为深度强项）。
- **优化范围**：全面优化——frontmatter + 正文（SKILL.md）+ 全部 references + evals + 新增 `agents/interface.yaml`。

## Confirmed Facts

- 目标技能目录：`skills/docs-writing-publishing/bidwriter`，当前文件：
  - `SKILL.md`（185 行）
  - `references/SCORING_GUIDE.md`、`references/CHAPTER_TEMPLATES.md`、`references/TERMINOLOGY.md`、`references/STANDARDS.md`
  - `evals/evals.json`（4 条：3 正向 + 1 负向）
  - 暂无 `agents/interface.yaml`。
- 当前 `description` 仅定位"专精工程咨询、建筑设计、市政工程"，排除项为"通用商务写作、营销文案、学术论文"。缺触发词：废标 / 废标风险、否决性条款、评分标准提取、合规性检查、逐条响应 / 响应对照表、技术方案撰写、投标策略、政府采购、IT/货物/服务类。
- references 中**已可跨领域复用**的部分：`TERMINOLOGY.md` 的"招投标术语"段、`STANDARDS.md` 的"招标法规与计价规范"段、`SCORING_GUIDE.md` 的评标方法 / 逐条响应 / 亮点设计 / 扣分项。**工程专属**的部分：CHAPTER_TEMPLATES 的工程三类补充、建筑设计 / 市政术语、建筑 / 市政规范。
- 真实法规差异：工程建设走《招标投标法》；政府采购货物 / 服务走《政府采购法》（财政部令第 87 号）。当前 STANDARDS 只覆盖前者，是扩展必须补的硬缺口。
- frontmatter 校验规则（`scripts/check.py`）：
  - `description` 必须存在、**不得含尖括号 `<` `>`**、长度 ≤ 1024。
  - `category` 必须为 `docs-writing-publishing` 且与目录一致。
  - 允许的顶层键：`name, description, category, tags, version, metadata, allowed-tools, license, argument-hint`（其余键只告警）。
- `skills/AGENTS.md`：顶层 `name/description/category/tags/version`；公开元数据变更后需 `just docs-sync` / `just docs-check`。
- 生成文档存在：`docs/skills/docs-writing-publishing/bidwriter.md` 与 `docs/en/skills/docs-writing-publishing/bidwriter.md`（由 `docs/scripts/sync_docs_catalog.py` 生成）。
- `agents/interface.yaml` 是本仓库既有约定（11 个技能已有），schema 为 `interface:` 下 `display_name` / `short_description` / `default_prompt` 三字段。
- 既有无关改动（不在本任务范围）：`docs/skills/developer-tools-integrations/image-to-ui-skill.md` 与其英文版处于 modified 状态。

## Requirements

### A. Frontmatter（重点）

1. 重写 `description`，把定位从"专精工程三类"改为"通用招投标平台，工程建设类为深度强项"，并在一句话内覆盖各领域。
2. 补齐缺失的真实触发词（中英双语）：废标 / 废标风险、否决性条款、评分标准提取 / 评分细则 / 评分项核对、合规性检查、逐条响应 / 响应对照表、技术方案撰写、投标策略、偏离表、政府采购、RFP response 等。
3. 锐化排除项以稳住负向路由：明确排除营销软文、年会致辞、产品文案、学术论文、与招投标无关的文档（须能挡住 eval 4 的"年会致辞 + 营销软文"）。
4. `description` 必须满足 `check.py` 约束：无尖括号、≤1024 字符。
5. `tags` 增补通用招投标维度（如 `procurement`、`rfp`、`招投标`、`政府采购`），保留既有工程类标签。
6. `version` 由 `1.0.0` 升为 `1.1.0`（向后兼容的能力扩展）。

### B. SKILL.md 正文

7. `角色定义` 由"工程咨询专家 / 一级注册建筑师"改为可按项目领域适配的"资深招投标顾问"，保留工程建设深度作为强项表述。
8. 输入处理新增 OCR 前置规则（坑①）：扫描件 / 图片型 PDF 必须先 OCR 成可读文本再解析，不得直接对图片型 PDF 抽取评分项。
9. `关键规则` 新增两条并强化既有"禁止编造"：
   - 报价金额由人决定，AI 只输出报价逻辑 / 结构，不擅自填写具体报价数字（坑②）。
   - 关键数字、单位名称、人名、金额、项目名编号必须人工逐条复核；显式声明"AI 完成约 80%，人工复核是中标关键"（坑⑤）。
10. 技术标响应引入"技术指标点对点响应"概念：对参数类要求用"招标要求 | 我方响应 | 满足 / 优于 / 偏离"表格，能优于处标注超配值；详细模式落在 SCORING_GUIDE，SKILL.md 给出指针。
11. `投标类型` / `常见投标类型速查` 增补 IT 与信息化、软件开发、货物采购、服务采购类。

### C. references

12. `CHAPTER_TEMPLATES.md` 新增 IT/信息化、货物采购、服务采购类章节补充模板（与既有工程三类补充并列）。
13. `SCORING_GUIDE.md` 新增"技术指标点对点响应表（满足/优于/偏离 + 超配响应）"模式，并补货物 / 服务类评分维度差异。
14. `TERMINOLOGY.md` 新增 IT/信息化与货物 / 服务采购术语（如 SLA、等保、信创、RFP、POC、运维、并发、可用性、政府采购、单一来源、竞争性磋商）。
15. `STANDARDS.md` 新增《政府采购法》及财政部令第 87 号等货物 / 服务采购法规，以及 IT/信息安全相关标准（如等保 2.0 GB/T 22239）。

### D. 资产、评测与文档

16. 新增 `agents/interface.yaml`，沿用本仓库三字段 schema，措辞体现"通用招投标"定位。
17. 扩充 `evals/evals.json`：新增 IT/软件类、货物 / 服务采购类正向用例，保留并可加强负向用例，覆盖新触发词。
18. 公开元数据 / 内容变更后重新生成 docs（`just docs-sync`），保证 `just docs-check` 通过。

## Acceptance Criteria

- [ ] `python scripts/check.py skills/docs-writing-publishing/bidwriter` 通过且无 error（`description` 无尖括号、≤1024、`category` 匹配）。
- [ ] 新 `description` 同时包含：通用招投标定位 + 至少覆盖"废标、评分标准提取、合规性检查、逐条响应、政府采购、IT/货物/服务"等新触发词 + 明确排除营销软文 / 年会致辞 / 学术论文。
- [ ] `SKILL.md` 正文含：OCR 前置规则、报价数字不由 AI 拍板、人工复核为中标关键、技术指标满足/优于/偏离响应、IT/货物/服务类投标类型。
- [ ] 四个 references 均按需新增对应领域内容；`STANDARDS.md` 含《政府采购法》/ 财政部令第 87 号。
- [ ] `skills/docs-writing-publishing/bidwriter/agents/interface.yaml` 存在且为合法 YAML、含 `display_name`/`short_description`/`default_prompt`。
- [ ] `evals/evals.json` 为合法 JSON，新增 IT/软件 与 货物/服务 正向用例各≥1，且保留负向用例；所有 `assertions` 与新行为一致。
- [ ] `just skills-check` 通过。
- [ ] `just docs-sync` 后 `just docs-check` 通过；生成的 `docs/skills/docs-writing-publishing/bidwriter.md` 与英文版反映新描述。
- [ ] `git diff` 仅限 bidwriter 技能包及其对应生成文档；不触碰 image-to-ui-skill 等无关改动。
- [ ] 条件允许时 `just ci` 通过；若因 docs 依赖等不可行，如实记录失败 / 跳过原因。

## Out of Scope

- 重命名技能 slug 或迁移目录（保持 `bidwriter` 与现路径）。
- 新增运行时脚本或外部依赖（OCR 仅作为流程提示，不内置实现）。
- 真正接入外部投标 SaaS / 模型 API。
- 重写或优化其他技能包。
- 在规划文件评审通过、`task.py start` 之前进行任何实现改动。

## Assumptions

- 这是内容 + 元数据优化任务，非运行时 / 自动化任务。
- 扩展为通用平台采取"加法"策略：保留工程类既有能力与模板，新增领域并列补充，不删除既有工程深度内容。
- 1.1.0 的 semver 判断：定位扩展但行为向后兼容（工程类用法不退化），故为 minor。若评审认为重定位属破坏性，可改 2.0.0。
- 生成文档应随公开技能变更一并更新。

## Open Questions

- 暂无阻塞规划的问题。若评审希望把"通用招投标"进一步收窄（例如只加 IT 不加货物/服务），在 design 评审时调整领域清单即可。
