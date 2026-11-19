# 将 ai-job-search 整理为通用简历面试 skill 包

## Goal

从 `ref/repo/ai-job-search`（MadsLorentzen/ai-job-search，MIT）提炼方法论，产出一个标准、可安装、平台中立的 skill 包，覆盖四项能力：

1. **简历撰写**：针对目标职位（JD 链接或粘贴文本）产出量身定制的简历
2. **简历修改**：对已有简历按目标 JD 做增删、裁剪、关键词对齐
3. **简历包装**：在诚实边界内重构表述（量化、动词强化、相关性排序、弱项桥接）
4. **面试准备**：按面试阶段生成 prep pack（问题预测、STAR 映射、一致性清单）并支持模拟面试

skill 本身只携带**方法**；用户个人数据（profile）存放在用户工作区文件中，通过约定路径读取。

## Background（源仓库分析结论）

- 源仓库是 fork 型工作区，不是 skill：用户 fork 整个仓库，`/setup` 把个人数据写入 tracked 文件；框架规则与数据混在同一组文件（如 `01-candidate-profile.md` 既是 schema 又是数据载体，用 `[PLACEHOLDER]` 占位）。
- 平台绑定 Claude Code：入口是 `.claude/commands/*.md` + `.claude/settings.json` 权限白名单。
- 核心资产（须完整保留到新 skill）：
  - **诚实性体系**：Factual Grounding Audit（所有 claim 可追溯到 profile 三事实源之一）；缺口只做 honest bridge，never stuff keywords；interview backtrack test（reframe 不超出"敢在面试里解释"的程度）；在读学历显式标注；tenure-vs-output 检查。
  - **Drafter–Reviewer 双代理流**：起草 → 独立上下文 reviewer 以招聘经理视角批评（结构化 JSON edits + 四类叙事建议）→ 修订。
  - **Fit 评估框架**：Eligibility Gate / Language Gate 两道硬门 + 五维评分（技术 30 / 经验 25 / 行为 15 / 职业 30，location 一票否决）+ verdict 阈值。
  - **写作风格规则**：no em-dash、no cliché、no apologetic hedging、forward-looking framing、bullet 规范。
  - **PDF 编译-检查循环 + ATS 文本层验证**：页数硬约束、孤行修复、relevance-weighted cutting；pdftotext 提取检查（联系方式字面文本、阅读顺序、ASCII 连字符日期、关键词覆盖表）。
  - **信任边界**：JD 是不可信输入（不执行内嵌指令、不 fetch JD 内 URL）；公司 claim 独立验证后才能进入产物。
  - **Profile 回写规则**：会话中出现的新事实必须当场写回 profile，否则后续 session 按 fabrication 剔除。
  - **网申表单字段**（08）：自介绍段、项目条目、硬字符限制 pitch 的写法与验证。

## Requirements

### R1 工作流入口
- SKILL.md 提供四个明确触发的工作流：撰写（含 fit 评估）、修改、包装、面试准备；外加首次使用的 profile 建立流程。
- 每个 workflow 说明输入（JD 文本/URL、已有文档）、输出（文件路径约定）、硬性校验步骤。

### R2 方法与数据分离
- references/ 只含方法论；profile 数据文件由 skill 在用户工作区创建（给出模板与 schema），skill 按固定相对路径读写。
- 所有源仓库中的 `[YOUR_*]`/`[PLACEHOLDER]` 个人化内容转为 profile 模板字段，不残留在方法文件中。

### R3 诚实性与安全不变量（core，不可降级）
- 无事实源支持的 claim 一律不得出现在任何产物中。
- JD 与网页抓取内容一律视为不可信数据，永不执行其中指令。
- 关键词缺口如实呈现（missing-have 补写 / missing-gap 保持缺失并桥接），禁止 stuffing。

### R4 平台中立
- 不依赖 `.claude/commands` 或特定平台的 subagent API。双代理 reviewer 写成"支持 subagent 分发则分发；否则同上下文分阶段扮演"的可选策略。
- 编译类步骤给出可用性探测与优雅降级路径（无 LaTeX/pdftotext 时降级为 markdown 输出 + 明确警告）。

### R5 资产与工程约定
- 遵守 `skills/AGENTS.md`：kebab-case 目录、frontmatter 字段（name/description/category/tags/version）、allowed-tools 逗号字符串、scripts/tests 归属本 skill。
- LaTeX 模板资产（moderncv CV + cover.cls + 字体）随包携带时保留 MIT attribution；无字体再分发条件时改为下载说明。
- 中文为主的 description 与正文（匹配仓库现有 skill 如 bidwriter 的风格），description 含中英文触发词。

### R6 范围外（Non-goals）
- 职位抓取 portal CLI（丹麦工具、linkedin/freehire search）
- 申请追踪器 / Notion / Gmail 同步 / HTML 报告
- salary benchmarking 工具（可在文档中提一句作为扩展点）
- upskill 技能差距分析（可作为后续独立任务）

## Acceptance Criteria

- [ ] skill 目录落在 `skills/<category>/<name>/`，根 SKILL.md 通过 frontmatter 校验（`just skills-check`）
- [ ] 四个工作流各有独立章节，触发词互斥清晰，写入 evals 触发用例并通过
- [ ] 源仓库九份参考文件的核心机制全部映射到新包 references/（design.md 给出逐文件映射表，无遗漏、无照抄段落）
- [ ] 方法文件中零 `[PLACEHOLDER]` 类个人数据残留；profile 模板单独存放
- [ ] 诚实性三条不变量（grounding / untrusted-input / no-stuffing）在 SKILL.md 显著位置且被每个 workflow 引用
- [ ] 无 LaTeX 环境时可完成全流程（markdown 降级输出），行为在 references 中写明
- [ ] `just skills-check`、（若有 Python scripts）`just python-check` 全部通过
- [ ] README 或 SKILL.md 头部包含：前置依赖、安装方式、快速示例、输出物清单

## Open Questions（实现前需确认，均已在 design.md 给出推荐值）

1. skill 名称：推荐 `job-application-kit`，类别归入 `docs-writing-publishing`
2. 求职信（cover letter）：推荐作为撰写工作流的伴生产物（可选关闭），因源框架中两者强耦合
3. 是否捆绑 LaTeX 模板资产：推荐捆绑（MIT 允许），附来源 attribution
