# bidwriter 通用化优化 · 技术设计

- Date: 2026-06-26
- Status: Draft for review

## Summary

以"加法 + 重定位"方式把 bidwriter 升级为通用招投标平台：frontmatter 重写路由面，正文与 references 在保留工程三类深度的基础上并列新增 IT/信息化、货物采购、服务采购领域，并把文章暴露的避坑实践（OCR 前置、报价不由 AI 拍板、人工复核、技术指标超配响应）固化进规则与模板。改动集中在单个技能包 + 其生成文档，不引入脚本或运行时依赖。

## Scope And Boundaries

In scope:
- `skills/docs-writing-publishing/bidwriter/SKILL.md`
- `skills/docs-writing-publishing/bidwriter/references/{SCORING_GUIDE,CHAPTER_TEMPLATES,TERMINOLOGY,STANDARDS}.md`
- `skills/docs-writing-publishing/bidwriter/evals/evals.json`
- 新增 `skills/docs-writing-publishing/bidwriter/agents/interface.yaml`
- `just docs-sync` 后生成的 `docs/skills/docs-writing-publishing/bidwriter.md` 与 `docs/en/skills/docs-writing-publishing/bidwriter.md`，及 catalog 相关生成文件

Out of scope:
- slug / 目录重命名
- 新脚本 / 运行时依赖 / 外部 API
- 其他技能包、平台 hook、justfile、校验脚本
- `docs/.../image-to-ui-skill.md`（既有无关改动）

## 单任务 vs 父子拆分

本次五类交付（frontmatter+正文、references、evals、interface.yaml、docs）虽各自可验证，但语义强耦合：广义 `description` 若没有对应的广义模板与法规支撑会自相矛盾，必须一起发布才连贯。故采用**单任务**而非父子树，降低集成成本。

## Frontmatter 设计（重点）

### 目标

`description` 是唯一路由面。新版要同时做到：① 重定位为通用招投标；② 高召回覆盖真实触发词；③ 稳健负向边界；④ 满足 `check.py`（无 `<` `>`、≤1024 字符）。

### 提议定稿（实现以此为准，措辞可微调，语义须保留）

```yaml
name: bidwriter
description: "智能招投标文件编写专家，覆盖工程咨询、建筑设计、市政工程、IT 与信息化、软件开发、货物采购、服务采购等各类招投标，工程建设类为深度强项。能解析招标文件、提取评分标准与废标条款、制定投标策略、分章节撰写技术标与商务标、做技术指标逐条响应与合规性及废标风险审核。当用户提到：标书、投标、招标、投标文件、技术标、商务标、招标响应、投标方案、编写标书、写标书、招标文件分析、评分标准提取、评分细则、评分项核对、废标风险、否决性条款、合规性检查、逐条响应、响应对照表、技术方案撰写、投标策略、偏离表、政府采购、bid document、bid proposal、tender、RFP response、proposal writing 时使用此技能。不适用于通用商务写作、营销软文、年会致辞、产品文案、学术论文，或与招投标无关的文档。"
category: docs-writing-publishing
tags:
  - bidwriting
  - tender
  - proposal
  - procurement
  - rfp
  - engineering
  - construction
  - municipal
  - 标书
  - 投标
  - 招投标
  - 政府采购
version: 1.1.0
```

### 设计说明

- **结构**：保持"能力陈述 + 触发词清单 + 排除项"三段式（yao-meta 路由所需），与现版同构，仅扩域 + 补词 + 锐化排除。
- **正向召回**：把 evals 与文章暴露的真实说法显式入列，尤其 eval 3 的"废标 / 合规 / 逐条响应"此前完全缺失。
- **负向边界**：排除项新增"营销软文、年会致辞、产品文案"，直接对齐 eval 4 的负向用例。
- **约束自检**：定稿无尖括号；长度约 300 余字符，远低于 1024 上限。
- **领域顺序**：工程三类在前以延续"深度强项"心智，IT/货物/服务紧随，体现广度。

## 正文（SKILL.md）改造策略

1. **角色定义**：改为"资深招投标顾问，按项目领域适配专业身份"；保留"工程建设领域 15 年深度经验"作为强项陈述，新增"亦覆盖 IT/信息化、货物与服务采购"。删除把全技能钉死在"一级注册建筑师"的单一定位。
2. **输入处理（坑①）**：在"检查输入 / 解析招标文件"前新增前置判断——若招标文件为扫描件或图片型 PDF，先用 OCR（如 MinerU / WPS OCR）转可读文本再解析，禁止直接对图片型 PDF 抽取评分项。以"提示 + 不要假设具体工具存在"的口吻写，符合现有"输出格式"段风格。
3. **关键规则**：在现有 7 条基础上
   - 强化"禁止编造"，并新增"报价金额由人决定，AI 仅给报价逻辑与结构，不擅自填写具体报价数字"（坑②）。
   - 新增"关键数字 / 单位名称 / 人名 / 金额 / 项目名编号必须人工逐条复核"，并点明"AI 完成约 80%，人工复核是中标关键"（坑⑤）。
4. **技术指标点对点响应**：在 Phase 2 撰写原则或输出格式处加入"参数类要求用 招标要求 | 我方响应 | 满足/优于/偏离 表格，能优于处标注超配值（如 增益≥60dB → 我方 65dB）"，详细方法指向 SCORING_GUIDE。
5. **投标类型**：`项目初始化` 的投标类型与 `常见投标类型速查` 表新增 IT 与信息化、软件开发、货物采购、服务采购行（给出核心章节重点 / 评分侧重 / 典型篇幅）。

文体保持与现版一致：简体中文、表格化、`<skill-dir>` 字面占位引用 references。

## references 改造策略

| 文件 | 新增内容 | 复用既有 |
|------|----------|----------|
| `CHAPTER_TEMPLATES.md` | "IT/信息化项目"（需求理解、技术架构、实施方案、信息安全/等保、运维服务、售后）、"货物采购"（产品技术参数响应、供货与到货、质保、培训服务）、"服务采购"（服务方案、人员配置、绩效与 SLA、应急保障）三段补充，与工程三类补充并列 | 八大通用章节框架不动 |
| `SCORING_GUIDE.md` | "技术指标点对点响应表"小节（满足/优于/偏离判定 + 超配响应写法 + 偏离表呈现）；货物 / 服务类评分维度差异（如产品参数响应度、SLA、实施与售后）；可补"经评审最低价 / 综合评估"在货物服务下的差异 | 评标方法、逐条响应、亮点设计、扣分项、自评清单保留 |
| `TERMINOLOGY.md` | "IT 与信息化术语"段（SLA、等保、信创、RFP、POC、并发、可用性、私有化部署、运维）与"政府采购术语"补充（政府采购、单一来源、竞争性磋商、竞争性谈判、框架协议） | "招投标术语"段已通用，保留 |
| `STANDARDS.md` | "政府采购法规"段（《政府采购法》、政府采购货物和服务招标投标管理办法/财政部令第 87 号、政府采购法实施条例）与"信息化/信息安全标准"段（等保 2.0 GB/T 22239、信息技术服务运维 ITSS 等） | 建筑/市政/工程咨询规范、招标投标法、质量体系保留 |

原则：**纯加法**，不删除既有工程内容；新增段落沿用既有表格 schema（术语：术语/英文/释义；标准：编号/名称/适用场景）。

## agents/interface.yaml 设计

新文件，沿用本仓库 schema：

```yaml
interface:
  display_name: "BidWriter"
  short_description: "Draft and audit tender/bid documents across engineering, IT, goods and services procurement"
  default_prompt: "Use $bidwriter to parse a tender, extract scoring and veto clauses, and draft a compliant, point-by-point bid response."
```

措辞体现通用招投标定位（不再只提工程）。

## evals 设计

在现有 4 条基础上扩充（保持 `evals.json` schema：`id/prompt/expected_output/files/assertions`）：

- 保留 eval 1/2/3（评分提取、技术方案撰写、合规废标检查），按需微调 assertions 以纳入新表述。
- 新增正向：IT/政务云类（贴合文章用例，如"政务云平台采购，按评分项规划技术标并做技术参数逐条响应"）。
- 新增正向：货物或服务采购类（如"一批服务器货物采购，按财政部令 87 号做参数响应表与商务响应"）。
- 保留并可加强负向 eval 4（年会致辞 + 营销软文不触发），可再加一条负向（纯学术论文）。

目标：正向覆盖新领域与新触发词，负向守住扩域后最易误触发的边界（营销 / 文案 / 学术）。

## Validation Design

确定性检查优先于主观评审：

```bash
python scripts/check.py skills/docs-writing-publishing/bidwriter
python -c "import json,sys; json.load(open('skills/docs-writing-publishing/bidwriter/evals/evals.json',encoding='utf-8'))"
python -c "import yaml; yaml.safe_load(open('skills/docs-writing-publishing/bidwriter/agents/interface.yaml',encoding='utf-8'))"
just skills-check
just docs-sync
just docs-check
just ci   # 条件允许时作为收尾门禁
```

主观评审点见 implement.md 的 Review Points（路由召回 / 负向边界 / 领域连贯性 / 避坑落地）。

## Risks And Mitigations

- 风险：扩域后 `description` 过宽，误触发普通文案 / 营销。
  - 缓解：排除项显式列出营销软文 / 年会致辞 / 产品文案 / 学术论文，并用 eval 4（及新增学术负向）回归。
- 风险：工程深度被稀释，老用户体验下降。
  - 缓解：纯加法，不删工程内容；description 与角色均保留"工程为深度强项"表述。
- 风险：货物 / 服务采购法规写错（《政府采购法》体系与《招标投标法》体系混淆）。
  - 缓解：STANDARDS 明确分体系列出，并在引用规范处提示"工程建设走招标投标法、政府采购货物服务走政府采购法"。
- 风险：`description` 触碰 `check.py` 约束（尖括号 / 超长）。
  - 缓解：定稿已自检；实现后以 `check.py` 兜底。
- 风险：docs 生成漂移或 `just ci` 因 docs 依赖较重而不可行。
  - 缓解：先 `just docs-sync` 再 `just docs-check`；`ci` 不可行时如实记录，不隐藏。

## Rollback Plan

改动为技能包内容 + 其生成文档。若评审或验证显示扩域损害了技能意图或路由：
- 仅回退 bidwriter 技能包文件与重新生成的 bidwriter 文档，不触碰其他包。
- 可分文件回退（frontmatter / 某个 reference / evals / interface.yaml 相互独立可还原）。
- 保留回退点见 implement.md。
