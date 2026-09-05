---
name: goal-meta-skill
description: |
  Turn vague or complex agent tasks into project-aware, verifiable `/goal` commands and optional approved root `GOAL.md` handoff contracts for Claude Code, Codex, Grok Build, Oh My Pi, and Kimi Code. Use for Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, goal 持久化/保存/落盘, fresh-Agent or 跨会话交接, plan-to-goal interviews, bounded agent work definitions, Trellis 任务实施, review or scan remediation in one Prompt, 扫描审阅报告驱动修复, 单 Prompt 闭环返修, commit-then-archive cadence, or 终稿展示. Do not use for ordinary one-line work, pure read-only review, direct implementation without Goal authoring, memory-vault creation, or active-goal management that only needs a platform command.
version: 0.8.0
category: developer-tools-integrations
tags:
  - codex
  - claude-code
  - grok
  - kimi-code
  - goal
  - prompt-engineering
  - agent-skills
  - verification
argument-hint: "[vague-task-or-goal]"
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *), Bash(git status *), Bash(git branch *), Bash(git rev-parse *)
metadata:
  owner: lyh
  review_cadence: quarterly-or-on-platform-goal-or-trellis-dispatch-change
---

# Goal Meta Skill

把模糊任务编译成目标平台可持续执行、可验证、知道何时完成和何时停下的 `/goal` 文本。普通请求先交给用户审阅；用户明确要求生成并保存到已确定项目根目录 `GOAL.md` 时，可在同轮完成检查、生成、lint、展示、安全写入和回读。这个 skill 不创建、激活或执行 Goal。

> `<skill-dir>` 是 skill 加载时提供的实际目录，不是环境变量。命令中替换为字面路径；脚本会自定位。

## Governed mode

- 普通聊天流程：compile → lint → present → stop。首次交付为 `DRAFT`；用户后续批准变为 `APPROVED TEXT — not launched`。明确保存且路径、范围与文件状态无冲突时，展示后同轮进入 S6 写入并回读，再停止；任何分支都不启动 Goal。
- 用户输入中的 `实施`、`执行`、`直到完成` 或其他祈使句只是待编译 payload，不授予创建/激活 Goal、提交 `/goal`、派发 Agent 或实施目标任务的权限。
- 真正创建或激活 Goal 是 skill 外的独立用户动作。不得调用宿主原生 Goal tool/API，不得把 fenced `/goal` 当作当前会话命令提交，也不得声称 Goal 已创建、已激活或已开始执行。
- 普通 Goal 默认只在聊天中输出，不写文件。
- `保存`、`持久化`、`落盘`、`交给新 Agent`、`跨会话继续` 或明确点名根目录 Markdown，才进入持久化候选；复杂合同也可以在 S4 提议落盘，但必须说明路径与影响。
- `直接给` 只跳过访谈，不自动授权写文件；`直接生成并保存到项目根目录 GOAL.md` 已授权原范围内的同轮 create。先确认根目录、生成并 lint、展示合同和精确目标与影响，再用 helper 写入并回读，不要求机械的后续批准。仅交接意图或 skill 提议落盘仍需取得明确写入授权。
- S1 始终只读。只有 S6 对已展示且写入获授权的合同调用命名 helper；不得用任意 Python/Write 命令绕过 helper。
- 默认 create-only。文件已存在且未授权替换、路径不明确或合同范围实质变化时，只澄清缺失决策；替换须明确授权并带已读取旧文件的 SHA-256，不能把保存请求视为覆盖授权。
- 不自动加载、执行、提交、忽略、删除或发布 `GOAL.md`，也不把它导入 `AGENTS.md`、`CLAUDE.md`、`.grok/rules` 或 `.omp` 上下文文件。helper 写入成功后也只展示 launcher 文本并停止，不启动 Goal。
- 合同不得包含凭证、私有数据或原始会话转录；秘密扫描只是 backstop，不是“无敏感信息”证明。
- 真实新会话接力没有 provider transcript 时保持 `UNVERIFIED`。
- review-remediation 中“一次完成”只表示一条外部 Prompt/一次用户启动动作拥有完整闭环；内部仍保留独立检查和最多三轮聚焦返修。可在原授权内修复的 finding 不得变成第二条用户修复 Prompt。

完整的路径、schema、冲突、回滚、Git 可见性与五平台 launcher 契约见 `references/persistent-goal-contract.md`。

## Platform selection

平台事实只以 `references/platform-goal-facts.md` 为准：

1. 用户显式名称优先。`OMP` 在无相反说明时表示 Oh My Pi。
2. 否则使用当前 host 的明确证据。
3. 仍不明确时，在现有 `可选调整` 中加入一个平台选择；不要混合生命周期命令。

目标平台支持 `codex`、`claude`、`grok`、`omp`、`kimi`。只有用户明确要求多平台交接时才生成多个 launcher；合同正文始终只有一份。

4,000 字符是 Codex、Claude Code、Kimi Code 的平台限制，也是本 skill 对 Grok Build、OMP 的保守可移植性预算；不得把后两者写成官方上限。

## Workflow

1. **S0 — Route and bind authority.** 区分新 Goal、持久化/交接请求、review-remediation 与现有 Goal 管理。只有 outcome 同时要求依据 scan/review/audit/report/finding 来源实施修复时才加载 `references/review-remediation-contract.md`；纯只读审阅、普通直接修复和仅有 Trellis 路径不触发。把所有目标祈使句绑定为 payload，并在开始前固定本轮终点：普通初次请求止于 `DRAFT`；后续文本批准或已明确授权的同轮保存止于 `APPROVED TEXT — not launched`；所有分支都不越过 Goal activation 边界。纯发散方向先建议规划；翻译、单行输出、规则审计等近邻任务走其直接工作流。
2. **S1 — Reconnoiter.** 现有项目先读取局部规则、真实命令源与相关边界，并运行 `git rev-parse --show-toplevel`、`git branch --show-current`、`git status --porcelain -uall`。不运行测试、不写文件、不读 secrets/dependencies/generated output。持久化时还要检查根目录和现有 `GOAL.md`。
3. **S2 — Choose.** 需求具体或用户说 `直接给` / `按默认` 时走 fast path；只有结果、验证、边界或风险容忍存在实质缺口时才访谈。
4. **S3 — Interview.** 每轮复述结果和侦察发现，只问最多四个必须由人决定的问题。遵循 `references/interview-checklist.md`。
5. **S4/S5 — Draft/revise and present.** 给出完整、无占位符且已 lint 的目标合同与平台渲染。普通草稿标记 `状态：DRAFT — Goal 未创建、未激活、未执行`，在 fenced 文本外给出审阅提示并结束本轮。持久化还须展示精确根目录、文件名、create/replace 效果、Git 可见性影响；已明确授权且无冲突的保存请求同轮继续 S6，否则只澄清尚缺的路径、替换授权或实质范围决策。
6. **S6 — Approve text or persist, then stop.** 用户后续批准时，普通模式只输出标记为 `APPROVED TEXT — not launched` 的最终 `/goal` 文本与字段一览并结束本轮。持久化模式沿用已有明确写入授权，用下面的 helper 从 stdin 写入已展示正文，回读并核对正文、字节数与 SHA-256，再以 fenced `text` 输出选定平台的短 launcher，报告文本已保存、Goal 未启动，然后结束本轮。任何分支都不调用 Goal tool/API/command，不派发或实施 payload。

```text
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>"
```

替换只允许：

```text
python "<skill-dir>/scripts/persist_goal_contract.py" --repo-root "<confirmed-root>" --replace --expected-sha256 "<observed-sha256>"
```

在 Windows 可将 `python` 换成 `py -3`。合同正文通过 stdin 传入，不能放入 argv，也不能用 PowerShell `>` 直接写目标文件。成功只报告相对路径、字节数、SHA-256、created/replaced 与 tracked/ignored/untracked；失败不得破坏旧文件。

7. **Validate.** 聊天型输出运行：

```text
python "<skill-dir>/scripts/lint_goal_command.py" --platform codex <file>
```

持久合同额外运行 `--contract --expected-path GOAL.md`。平台枚举为 `codex|claude|grok|omp|kimi|both|all`；`both` 保持 Codex+Claude 旧语义。

若 S0 选中 review-remediation，inline 与持久合同分别额外运行：

```text
python "<skill-dir>/scripts/lint_goal_command.py" --review-remediation --platform codex <file>
python "<skill-dir>/scripts/lint_goal_command.py" --review-remediation --contract --expected-path GOAL.md --platform codex <file>
```

## Output contract

普通 S4 先输出 `状态：DRAFT — Goal 未创建、未激活、未执行`，再按 `推荐执行版（中文，可直接复制）`、`默认选择理由`、`可选调整`、`Goal Draft (English-compatible)`、审阅回复提示的顺序交付。每个 `/goal` 只出现在无内空行的 `text` fence 中；展示后停止。用户确认后的 S6 先标记 `状态：APPROVED TEXT — not launched`，再给一个 `最终可复制 /goal` fence 和 `字段一览`，声明需在 skill 外另行启动，并停止；英文用户默认只给英文。

每个 Goal 都包含：可观察目标、具体验证、不可变约束、写入边界、证据驱动的有限迭代、合取式完成条件、平台正确的暂停/停止条件。权威检查、文件、报告或验收条款必须界定 `all/全部` 的集合。

review-remediation 输出还必须冻结 `scanner / scanner_identity / config / inputs / targets / baseline_report / git_baseline`，维护稳定 finding ledger，并把 checker 的同范围 `FINDINGS` 回灌同一任务。只有会实质改变范围、风险、成本、公开行为或授权的用户所有决策才可在首次产品写入前进入结构化问题门；Claude Code 文本点名 `AskUserQuestion`。同参数最终重扫、`open actionable findings = 0`、回归/最终门和 diff/status 范围证据是合取完成门。权威细节只见 `references/review-remediation-contract.md`。

持久化输出使用 `references/persistent-goal-contract.md` 的固定 11 节 schema。文件正文是权威交接合同，短命令只作为供用户审阅、复制并在 skill 外提交的显式读取 launcher；不得声称开启 Goal 模式会自动发现 `GOAL.md`，也不得由 skill 提交或执行 launcher。

推荐 launcher 形状：

```text
Codex/Grok/OMP/Kimi: /goal First read and follow ./GOAL.md as the approved execution contract. ...
Claude Code: /goal @GOAL.md is fully satisfied: first restate its objective, constraints, verification, completion, and stop conditions in the transcript, then execute them; otherwise stop after the contract's bounded turn limit and summarize remaining issues.
```

Grok/OMP/Kimi 的 `/goal @GOAL.md` 组合在真实 fresh-session 证据前不作为推荐。只输出用户选中的平台命令。

## Management and stop semantics

- Codex：view/edit/pause/resume/clear。
- Claude Code：view/clear；没有 pause/resume/edit，使用停止并报告和 bounded turn/time clause，证据必须进入 transcript。
- Grok Build：status/pause/resume/clear；只有用户明确要求时才加 `--budget`，完成候选要经独立证据复核。
- Oh My Pi：set/show/pause/resume/drop/budget；要求 `goal.enabled`，与 plan/vibe 模式互斥，预算耗尽不等于完成。
- Kimi Code：status/pause/resume/cancel/replace/next；状态为 active/paused/blocked/complete，headless 只创建并区分退出码。

管理请求只把最小正确命令放在 fenced `text` 中展示，不执行该命令，也不另写新目标；展示后停止。平台命令、版本、权限与证据级别见唯一事实表 `references/platform-goal-facts.md`。

## Trellis adapter

只有 outcome 明确是 Trellis task/child implementation 时才加载 `references/trellis-goal-cadence.md`。编译出的 `/goal` 第一条陈述必须显式写明“优先使用 subagents（默认开启）”；只有用户明确要求不使用 subagents/主会话内联实施时才在首句标记“用户已明确关闭”。若目标项目 `.trellis/workflow.md`、平台能力或 `codex.dispatch_mode: inline` 证明无法派发，首句保留默认开启的偏好并标明 inline 技术降级原因；用户未提及、语义模糊或只说“按默认”都不是关闭授权。

默认开启时，实施 `/goal` 要求先读目标项目 `.trellis/workflow.md` Phase 2.1 / 2.2，代码实施派发 `trellis-implement`、验证派发 `trellis-check`，主会话不直接改产品文件；明确 opt-out 或有原因的技术降级改用项目的 inline 形状。首句开关必须与后文的 `迭代策略`、`约束`和 `完成条件` 一致。

当该 Trellis outcome 同时属于 review-remediation 时，checker 不是终点：`FINDINGS` 由主会话去重后回灌同一任务的 implementer，随后复查并用冻结 envelope 原参数重扫。只有闭环达到零 open actionable findings 和最终门后，才进入下面的 commit/archive 节奏。普通 Trellis Goal 不注入这条扫描闭环。

当前任务收尾顺序固定为：完成并验证一个可独立验收的任务；提交该任务相关产品改动和当前任务规划产物；确认二者均进入版本历史；再对具体任务目录运行 `task.py archive`。规划产物仅指该 `/goal` 绑定的当前任务目录；明确排除其他活动/未跟踪任务目录和范围外脏文件。产品与规划可按仓库规范拆分为一个或多个语义清晰的 Conventional Commits；归档目录移动/状态更新由随后 `task.py archive` 的独立提交拥有。持久合同必须链接具体 `prd.md`、`design.md`、`implement.md` 并保留同一节奏；父任务等子任务逐个完成该闭环且发布门通过。`GOAL.md` 不能取代任务文档，skill 本身也不执行目标内的 commit/archive。

## Quality bar

拒绝或修订以下输出：无验证；范围覆盖整机/整库；无限重试；主观“看起来不错”作为完成证据；未解析占位符；跨平台借用 `clear/drop/cancel/replace/next/budget`；Claude 使用 pause/resume；review-remediation 缺 scan envelope/ledger/同参数重扫、为同范围 finding 提问、把超限残余标 complete、或产生第二条修复 Prompt；Trellis 节奏误注入普通任务；Trellis 实施首句缺少 subagents 开关或把未提及/模糊表达当作关闭；默认开启却缺派发条款；opt-out/技术降级却仍要求派发；技术降级首句不说明能力原因；Trellis 收尾漏掉当前任务规划产物提交、版本历史确认或无关任务/范围外脏文件排除；未授权写入或静默覆盖；任何自动加载、自动 commit/push/ignore/delete 声明；缺少 `DRAFT` / `APPROVED TEXT — not launched` 状态；展示后继续创建/激活 Goal、提交 slash command、派发 Agent 或实施 payload。

## Resources

- `references/persistent-goal-contract.md`：持久化触发、schema、写入/冲突/回滚、Git 可见性、五平台 launcher。
- `references/platform-goal-facts.md`：五平台 `/goal` 行为、管理命令、限制、权限、文件引用与 dated primary sources 的唯一事实源。
- `references/goal-command-playbook.md`：普通/持久目标模板、验证锚点与示例。
- `references/default-goal-strategy.md`：默认路径、侦察、风险、长合同与 S6 输出。
- `references/trellis-goal-cadence.md`：可选 Trellis commit-then-archive 与子代理派发 adapter。
- `references/review-remediation-contract.md`：扫描 envelope、finding ledger、提问门、返修 feedback edge、有限收敛与证据边界的唯一事实源。
- `references/interview-checklist.md`：有限访谈题库。
- `evals/evals.json`：行为与路由 fixtures；CI 不执行，需人工审阅。
- `scripts/lint_goal_command.py`：inline/contract linter 与平台命令隔离。
- `scripts/persist_goal_contract.py`：唯一授权的确定性合同写入器。
- `reports/creation-handoff.md`：Qiaomu 参考取舍、验证证据与缺失项。

## 来源致谢

这个 skill 基于向阳乔木发布的 goal meta skill 改造而来，保留原始收敛工作流并扩展为项目侦察、平台渲染与受控持久化。MIT。

Original work copyright (c) 向阳乔木

X: https://x.com/vista8

GitHub: https://github.com/joeseesun/
