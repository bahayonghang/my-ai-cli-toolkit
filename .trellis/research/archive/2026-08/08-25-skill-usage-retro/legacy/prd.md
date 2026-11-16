# skill-session-review

## Goal

做一个可复用的 Production skill `skill-session-review`：用户给出已有 skill 的名字或路径后，在本机四个平台的会话库中检索该 **skill 实例** 被实际调用的对话，分析使用情况（步骤是否被遵守、哪里被绕过、用户纠正了什么、输出是否符合合同），把反馈报告写到当前工作区 `reports/skill-session-review/<skill-name>.md`，并给出可复制交接 Prompt。用户随后用 qiaomu-meta 改原 skill。本 skill 不改目标 `SKILL.md`，不调用 qiaomu-meta，不做调用次数统计。

## Background

skill 写完之后，真实会话里会出现漏步骤、绕过门禁、用户纠正、触发不准、输出合同漂移。qiaomu-meta 是作者，SkillOps 只吃显式反馈，禁止隐式扫私聊后改规则。本机已有 `trellis-session-insight`（召回对话）和 `trellis-plan-review`（审阅落盘 + 交接 Prompt），没有「按具名 skill 的使用情况写反馈报告」这条诊断闭环。

公开目录接近物（`x-skill-improve`、Sun-sunshine06、Dwsy `improve-skill`、Consiliency planner）都不能同时做到：Claude + Grok + Codex + Oh My Pi、使用情况而非用量、只出报告、交接给 qiaomu-meta。克隆在 `ref/repo/skill-usage-retro/`。

## Confirmed facts

- 任务目录：`.trellis/tasks/08-25-skill-usage-retro/`。分支 `dev`。
- 包路径：`skills/developer-tools-integrations/skill-session-review/`。`name` 与目录名均为 `skill-session-review`。`category` 为 `developer-tools-integrations`。遵守该目录 `AGENTS.md`：`` `<skill-dir>` ``、`evals/evals.json` 的 `assertions`、frontmatter 后 `just docs-sync`。
- 近邻：`agents-md-improver` / `claude-context-improver` 审指导文件；`goal-meta-skill` 写 Goal；改写 skill 走 qiaomu-meta。`AGENTS.md` 提到的 `agent-skill-review` 目录不存在，不复活该名字。
- qiaomu-meta：`C:\Users\lyh\.grok\skills\qiaomu-meta\`。SkillOps 禁止隐式扫私聊后自动改 skill。
- 会话源：Claude `~/.claude/projects/<encoded-cwd>/*.jsonl`（`Skill` tool / `attributionSkill` / 注入 `Base directory for this skill:`）；Grok `~/.grok/sessions/<encoded-cwd>/<session-id>/chat_history.jsonl`（`<skills_referenced>`）；Codex `~/.codex/sessions/**/rollout-*.jsonl`；Oh My Pi `~/.omp/agent/sessions/<encoded-cwd>/*.jsonl`。`~/.pi/agent/sessions` 为空。`trellis mem --platform pi` 在 CLI 0.6.15 返回空，不能当 Oh My Pi 检索层。OpenCode 排除。
- 本机同名不同路径：`skills/development-workflows/trellis-plan-review/SKILL.md` 与 `C:\Users\lyh\.skillsmanage\skills\trellis-plan-review\SKILL.md` 同时存在。路径输入必须按实例匹配，不得只按 frontmatter `name` 聚合。
- `evals/evals.json` 是人工审阅的行为 fixture，`just ci` 不执行。Production 触发门走 qiaomu-meta `trigger_eval.py` + 任务内 `research/trigger-cases.json`（实现时再写入具体 cases）。
- 报告先例：`trellis-plan-review` 落盘 + 对话只给结论、路径、可复制交接 Prompt。本 skill 报告不得写入目标 skill 目录。
- 根 `.gitignore` 目前没有 `reports/` 规则。仓库根 `reports/` 目录存在且为空。各 skill 包内的 `skills/**/reports/` 仍需被 git 跟踪。
- 不套用 `governed-file-writing.md` 的根直接子文件 + SHA 替换门：目的地是嵌套路径，覆盖同名是产品决定。写入仍用路径受限 helper。gitignore 以仓库根 `.gitignore` 是否含精确行 `reports/skill-session-review/` 为权威；全局 excludes 与 `.git/info/exclude` 不算已覆盖。缺行则追加，不 `git add`。

## Requirements

- R1：输入是已存在 skill 的名字或路径。路径按规范化绝对路径精确匹配该实例。名字解析本机候选；多于一个实例则报告歧义并停止，不静默跨副本聚合。输出是使用情况反馈报告：每条发现问题须覆盖步骤偏差、用户纠正（若该会话有）、缺口、可复用改进建议。不是工作流回顾、调用次数表、未使用 skill 清理。
- R2：只把 `invoked` 会话当作改进依据。每条候选标 `available` / `loaded` / `invoked`。读目标 `SKILL.md` 只能标 `loaded`。`available` 与 `loaded` 不得单独作为 `UPDATE SKILL` 依据；无法确认调用则 `INCONCLUSIVE`。关键词命中标低置信，不得单独作为改进依据。
- R3：每条发现引用会话 id、平台、可核对证据（会话文件路径 + 短摘录或工具记录定位），并给出四选一裁决：`UPDATE SKILL`、`COMPLIANCE GAP`、`ONE-OFF`、`INCONCLUSIVE`。
- R4：同一模式在至少两个 `invoked` 会话出现才可升为必须建议。单次摩擦默认 `ONE-OFF` 或 `INCONCLUSIVE`。沿用 qiaomu 泛化门。
- R5：落盘报告 + 可复制交接 Prompt。不编辑目标 skill 任何文件，不调用 qiaomu-meta，不应用 patch。交接 Prompt 读者是后续 qiaomu-meta Agent。不含「见上一条消息」。
- R6：报告不含完整私聊。每条发现最多 2 段摘录，每段最多 200 个 Unicode 字符。禁止整段粘贴 `user_query` 或注入的完整 `SKILL.md`。密钥类字符串写成 `[REDACTED]`。超出该合同的 PII 风险标 `UNVERIFIED`，不假装已扫尽。
- R7：不做改写原 skill、调用次数统计、清理未使用 skill、从零创作新 skill、以 CLAUDE.md/AGENTS.md 为主改对象、sleep-cycle replay、本任务内公开发布。
- R8：`description` 触发：分析某 skill 的使用情况、这个 skill 用着有什么问题、根据历史对话反馈改进这个 skill。不触发：skill 用了几次、哪些 skill 没用过、继续上次会话、优化 CLAUDE.md、创建新 skill、用 qiaomu-meta 改这个 skill。行为 fixture 用仓库 `evals/evals.json`。触发门用 qiaomu-meta `trigger_eval.py` 跑任务内 `research/trigger-cases.json`（实现时写入），`--cases` 用绝对路径，`recommended_threshold` 0.34，全部 case 通过。
- R9：四个平台适配器都存在。缺目录时报告写覆盖说明，不失败退出。默认 `--scope global`：扫描该平台本机全部会话根。`--scope cwd` 才限定当前仓库编码目录。四平台同一语义。Grok 必须匹配 `.../<encoded-cwd>/<session-id>/chat_history.jsonl`。
- R10：包 `name`、目录名、`category` 如 Goal 所述。
- R11：报告路径为当前工作区仓库根 `reports/skill-session-review/<skill-name>.md`（UTF-8 LF）。同名覆盖。仓库根 `.gitignore` 必须含精确行 `reports/skill-session-review/`；缺则追加，不 `git add`。只忽略这一子目录，不忽略 `skills/**/reports/`。全局 excludes 与 `.git/info/exclude` 不算已覆盖。

## Acceptance Criteria

- [ ] AC1（R9）：四个平台适配器都存在。某平台无会话目录时 JSON `coverage.<platform>` 为 `missing-store`，进程退出 0。Oh My Pi 只扫 `~/.omp/agent/sessions`，不扫空的 `~/.pi`。
- [ ] AC2（R9）：默认 `--scope global` 时，Claude/Grok/Oh My Pi 不限定当前 cwd 编码目录；`--scope cwd` 时四平台都只扫当前仓库对应目录。Grok 能列出带 `<session-id>` 子目录的 `chat_history.jsonl`。fixture 至少覆盖两个 cwd 与多个 Grok session 子目录。
- [ ] AC3（R2）：扫描输出为每条候选标 `available` / `loaded` / `invoked`。Codex `host_skills` 与仅读 `SKILL.md` 不得标 `invoked`。Oh My Pi 仅 `read`/bash 打开 `SKILL.md` 标 `loaded`。`invoked` 需要结构化调用字段，或加载之后出现该 skill 工作流标记 / 输出合同证据。
- [ ] AC4（R1）：路径输入只聚合规范化路径等于该实例的会话。名字输入若解析到多个 `SKILL.md` 路径，报告列出候选并停止，不写改进建议。
- [ ] AC5（R1）：落盘报告的每条 `SSR-NN` 含步骤偏差、用户纠正（无则写「无」）、缺口、可复用建议四个字段，模板在 `references/finding-contract.md` 与 `report-template.md`。
- [ ] AC6（R3）：每条 `SSR-NN` 含会话 id、平台、证据定位（文件路径 + 行或工具记录）、裁决标签。仅对话出现 skill 路径的候选不得进入必须建议。
- [ ] AC7（R4）：同一模式只在一个 `invoked` 会话出现时，裁决为 `ONE-OFF` 或 `INCONCLUSIVE`，不得标为必须改 `SKILL.md`。至少两个 `invoked` 会话才可升为必须建议。
- [ ] AC8（R5）：成功后存在 `<repo>/reports/skill-session-review/<skill-name>.md`。对话给出路径和一个 `text` fence 交接 Prompt。Prompt 含报告路径与目标 skill 路径，不含「见上一条消息」。同名再跑覆盖同一文件。
- [ ] AC9（R5）：目标 skill 目录无本 skill 写入。运行过程不调用 qiaomu-meta 去改目标 skill，不写出 `diff.patch` 或直接改 `SKILL.md`。
- [ ] AC10（R5）：`allowed-tools` 的 Write 仅用于报告文件、根 `.gitignore` 追加、helper `--input` 临时文件。
- [ ] AC11（R6）：单条发现摘录不超过 2 段、每段不超过 200 字符。完整 `user_query` 或完整注入 `SKILL.md` 不得出现。`sk-` / `ghp_` / `Bearer ` 类片段在 fixture 中变为 `[REDACTED]`。未覆盖的 PII 在报告盲区写 `UNVERIFIED`。
- [ ] AC12（R8）：仓库 `evals/evals.json` 正例覆盖使用情况 / 根据对话反馈改进。该文件不作为 CI 触发证明。
- [ ] AC13（R8）：`python <qiaomu-meta>/scripts/trigger_eval.py <skill-dir> --cases <绝对路径 research/trigger-cases.json>` 对全部 should_trigger / should_not_trigger / near_neighbor 通过，阈值 0.34。该命令写入 `implement.md`，`just ci` 不代替它。安装版 CLI 以 skill 目录为位置参数读取 `SKILL.md`，没有 `--description-file`。
- [ ] AC14（R10）：路径 `skills/developer-tools-integrations/skill-session-review/`，`name: skill-session-review`。`just skills-check` 与本 skill 测试通过。`just docs-sync` 后 `just ci` 通过。
- [ ] AC15（R11）：writer 拒绝 `..`、绝对名、目标 skill 目录。合法名写入 `reports/skill-session-review/<name>.md`。
- [ ] AC16（R11）：覆盖判定只认仓库根 `.gitignore` 含精确行 `reports/skill-session-review/`。全局 excludes 或 `.git/info/exclude` 命中而根文件缺行时仍追加。已有该行则不重复。不 `git add`。
- [ ] AC17（R7）：`evals/evals.json` 负例覆盖 resume、改 CLAUDE.md、从零创建 skill、只问调用次数、清理未使用 skill、用 qiaomu-meta 改 skill。

## Out of scope

- 改写、patch、优化原始 skill；调用 qiaomu-meta 执行改写。
- 把本能力做进 qiaomu-meta 本体。
- 安装或依赖第三方 optimizer 运行时。
- 自动 replay、改模型权重、夜间 sleep cron。
- 扫描 Basic Memory / LYHNotes / 原生 Agent memory 作为主会话源。
- 未使用 skill 清理、skill 压缩、token 优化。
- 本任务内公开发布。
- OpenCode 会话。
- `governed-file-writing.md` 的 SHA 替换合同。

## Key decisions

- 独立 skill，不并入 qiaomu-meta。
- 只出报告和交接 Prompt，不改目标 skill。
- 会话源：Claude、Grok、Codex、Oh My Pi（`~/.omp`）。
- 检索域默认全局；`--scope cwd` 才限当前仓库。四平台同一语义。
- 路径输入按实例匹配；名字多候选则报歧义。不跨副本静默聚合。
- Codex/Oh My Pi：读 `SKILL.md` = `loaded`，不是 `invoked`。
- 包路径：`skills/developer-tools-integrations/skill-session-review/`。
- Production：`evals/evals.json` 行为 fixture + qiaomu `trigger_eval.py` 任务内 cases。
- 报告：`<repo>/reports/skill-session-review/<skill-name>.md`；gitignore 以根 `.gitignore` 精确行为权威。
- 先验采用语义，不执行第三方克隆里的脚本。
- 本轮按 TPR-01–TPR-08 修订规划；提示 TPR-09/TPR-10 已处理。规划修订不是实施批准。
