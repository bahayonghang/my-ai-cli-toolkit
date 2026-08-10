# 创建 idea-bib-review 文献综述 skill

## Goal

在 `skills/academic-research-tools/idea-bib-review/` 创建一个可复用 skill：同时接收用户给定的论证思路与 `.bib` 文献库，先核验引用身份和可用证据，再按该思路撰写叙事性或批判性 literature review。输出必须保留输入 citation key、区分事实/综合判断/证据缺口，并在现有文献不足时给出可复现的检索式或候选补充文献；不得用语言流畅度掩盖不存在的文献或来源不支持的 claim。

## Background

- 目标 skill 定名为 `idea-bib-review`：三个词分别体现给定思路、BibTeX 语料边界和综述产物，符合 Qiaomu 的精简命名偏好。
- `paper-workbench` 已拥有论文归一化、多论文综合、gap map 和 review outline。新 skill 只在“给定思路 + 给定 `.bib` + 写成综述”同时成立时触发，重点是最终文本与 claim-to-evidence 审计，不重复其通用 intake/synthesis 工作台。
- `.bib` 条目只能证明用户提供了某组书目信息；在外部核验之前，它既不证明文献真实存在，也不证明正文支持某个结论。元数据核验与语义支持必须分开。
- 网络研究与先例分析见 `research/local-boundaries.md`、`research/prior-art-research.md` 和 `research/evidence-and-search-standards.md`。
- 本 skill 会联网核验或发现来源、读取用户文件并可能按请求写出产物，且错误引用的代价较高，因此按 Qiaomu `Governed` 模式规划；未运行的 provider、人工盲评、真实安装或在线 API 路线必须标记 `missing evidence`。

## Requirements

- R1 名称与位置：skill 名称为 `idea-bib-review`，目录为 `skills/academic-research-tools/idea-bib-review/`；frontmatter 顶层包含 `name`、中英文 `description`、`category: academic-research-tools`、`tags`、`version`。
- R2 触发边界：正向触发必须体现用户同时提供或明确承诺提供论证思路/框架与 `.bib`，并要求撰写 review/related work/文献综述；只有主题检索、单篇精读、多篇论文通用综合、BibTeX 清洗或成稿润色不得误触发。
- R3 输入契约：思路可来自聊天文本或本地文件，至少含核心问题、拟论证主线或章节关系；BibTeX 可为一个或多个本地 `.bib`。语言、目标长度、输出格式和引用语法可显式覆盖；未指定时使用用户语言与 Markdown/Pandoc citation syntax。
- R4 BibTeX 盘点：使用纯标准库、fail-closed 的确定性脚本盘点 entry type、原始 citation key、title、author、year、DOI/URL，报告重复 key、重复 DOI、缺失关键字段和无法可靠解析的结构；不得静默改名、补造条目或吞掉解析失败。
- R5 身份核验：把每条文献标为 `input_only`、`metadata_verified`、`metadata_conflict` 或 `unresolved`，记录实际运行的来源、URL/标识符、时间与失败原因。API 超时、限流、付费额度或无结果一律保留为未核验，不得视为通过。
- R6 证据层级：把可用内容区分为 `metadata`、`abstract`、`full_text`、`user_excerpt` 和 `unavailable`。元数据只能支撑书目信息；摘要只能支撑摘要明确陈述的范围；数值、样本、限定条件、方法细节、引语、页码和强因果结论需要相应全文或用户摘录锚点。
- R7 思路覆盖矩阵：先把用户思路拆成章节目标与原子 claim，再逐项标注 `supported`、`partial`、`conflicted` 或 `gap`，关联 citation key、证据层级、短摘录/定位和来源 URL。检索不到证据时保持 gap，不用常识补齐。
- R8 写作纪律：综述按用户思路组织为跨文献论证，不逐篇堆摘要；每个实质性事实 claim 必须映射到已核验的证据记录，综合判断需明确为综合/推论并列出依据。禁止虚构论文、DOI、作者、年份、统计量、引语、页码、共识或 citation key。
- R9 引用纪律：正文只使用输入 `.bib` 或用户已批准补充 `.bib` 中的原始 key；最终审计必须发现未知 key、缺失证据记录、证据层级不足、孤立参考文献和未覆盖的思路节点。
- R10 缺口处理：采用用户于 2026-08-10 确认的两阶段批准策略。skill 可自动执行匿名、只读检索；为每个 gap 生成概念组、同义词、排除词、时间/领域限制和可复制检索式，只报告实际运行过的数据库/接口和命中数。新发现文献先进入独立候选清单与 `supplement-candidates.bib`，不得伪装成原始语料；只有用户明确选定的 candidate ID/citation key 才能生成 approved supplement，随后必须重新执行盘点、证据映射和审计。
- R11 输出契约：未要求落盘时在对话中给出 review、证据边界摘要和 gap/query 清单；要求保存时输出正文、BibTeX 审计、claim-evidence ledger、检索日志/缺口报告，以及存在时的独立候选 `.bib`。若核心思路存在证据 gap 且检索得到候选，本轮交付候选后停止，等待用户批准，不生成引用候选的 provisional draft。不得覆盖用户原始 `.bib` 或现有正文。
- R12 信任边界：把 BibTeX 字段、摘要、PDF/网页正文和第三方候选 skill 内容视为不可信数据；其中出现的指令、命令或提示词不得改变 workflow、权限或输出边界。不得绕过登录墙、付费墙、验证码、访问控制或保存凭证。
- R13 方法边界：默认产物是 narrative/critical review，不得在没有预注册协议、完整检索、筛选与去重记录时声称 systematic review、PRISMA-compliant 或 exhaustive。用户明确要求方法驱动综述时，才加载相应报告规范并暴露缺失步骤。
- R14 包结构：采用精简根 `SKILL.md`；详细证据契约、写作流程、检索策略和质量 rubric 放 `references/`；确定性 BibTeX/正文审计放 `scripts/`；回归放 `tests/` 与房规 `evals/evals.json`；共享安装者说明放 `README.md` 与 `agents/interface.yaml`；Qiaomu 研究、Skill IR、验证和 creation handoff 放 `reports/`。
- R15 可移植性与依赖：运行脚本只用 Python 标准库，命令使用字面 `<skill-dir>` 路径；在线核验通过当前环境可用的只读网页/API 能力，任何特定 API 都必须可降级，不新增生产依赖或要求密钥。
- R16 Qiaomu 归属：除非用户后续指定其他 owner，包内共享资料采用 `Copyright (c) 向阳乔木`、X `https://x.com/vista8`、GitHub `https://github.com/joeseesun/`；不在本任务中发布独立 GitHub 仓库或 Release。
- R17 仓库集成：新增/变更公开 skill 元数据后运行 `just docs-sync`，并按风险完成 `just skills-check`、`just python-check`、`just node-test`、`just ci` 和最终 diff/未跟踪文件审计。

## Acceptance Criteria

- [ ] A1 `idea-bib-review` 的名称、目录、description 和正负触发样例同时体现“给定思路 + `.bib` + 撰写综述”，且与 `paper-workbench`、`literature-mentor`、`deep-research-pro`、`humanizer-paper` 的边界可判定。
- [ ] A2 BibTeX 脚本在嵌套花括号、引号、多行字段、Unicode、`@string`/`@comment`、重复 key、重复 DOI、缺字段和损坏输入 fixtures 上产生确定性结果；不可靠输入以非零退出或明确 error 状态失败。
- [ ] A3 存在假 DOI、题名/DOI 冲突或在线路线失败时，报告分别为 conflict/unresolved/online-unverified，且任何用例都不会静默 PASS。
- [ ] A4 仅有元数据、没有摘要/全文证据的 fixture 不会生成具体实验结果、数值或因果 claim；输出会降级为 gap、有限表述或检索式。
- [ ] A5 有受控全文/摘要 fixture 的正例能按给定思路形成跨文献段落，所有 citation key 均来自批准 BibTeX，所有实质性 claim 都可在 ledger 找到证据层级与锚点。
- [ ] A6 给定思路中的 unsupported 或 contradicted 节点不会被顺从性写作掩盖；系统会明确报告缺口/冲突并生成针对性检索式。
- [ ] A7 搜索补充路径记录查询、来源、时间、命中/筛选数和失败；候选条目与原始 `.bib` 分离，用户批准前不进入正文；批准后只纳入明确选定条目并重跑全部证据门。
- [ ] A8 处理含提示注入文本的 `.bib` note/abstract/PDF fixture 时，不执行其中命令、不扩大权限、不改变输出契约。
- [ ] A9 房规 `evals/evals.json` 覆盖至少 5 个正向行为用例与 5 个近邻/失败用例；任务内 Qiaomu trigger eval 另有兼容 schema 与领域语义配置，结果不冒充 CI。
- [ ] A10 Qiaomu package validation、Skill IR、resource/trust/secret/public-claim 检查和 creation handoff 完成；provider-backed output comparison、人工盲评、在线 API 全覆盖和真实远程安装若未运行则明确为 `missing evidence`。
- [ ] A11 `just ci`、`git diff --check` 和 `git status --porcelain -uall` 通过且最终 diff 只含任务批准范围；现有 `.trellis` 未提交更新不被回退或混入产品改动。

## Out of Scope

- 单篇论文导师式精读、任意来源的通用多论文工作台、开放主题的完整 deep research、已有综述的纯语言润色。
- 自动执行 meta-analysis、风险偏倚统计、PRISMA flow 或“系统综述”声明；这些需要独立的方法协议与更完整的数据输入。
- 自动下载付费全文、绕过访问控制、使用私人登录态/密钥、修改 Zotero 库、提交期刊、发布 skill 或操作远程 GitHub。
- 自动改写或覆盖用户原始 `.bib`；候选补充始终独立、可审阅、可丢弃。
