# trellis-plan-review 交接加入 AskUserQuestion 一次收口

## Goal

让 `trellis-plan-review` 发出的交接 Prompt 要求**修订者**在仍有用户所有确认项时，用宿主结构化问题工具一次收口并写回规划，从而一轮修订后规划可直接投入实施。用户不必再先打「请使用 AskUserQuestion」才能继续完善规划。

审阅者保持独立只读：不改规划产物、不调用提问工具、不 `task.py start`。

“一次完善然后实施”指 **同一条交接修订会话内**：读报告 → 必要时结构化提问 → 写回全部阻断/应修与用户答案 → 停止。不等于审阅者自己改规划，不等于跳过独立验证，也不等于本 skill 授权开工。

## Background and Confirmed Facts

1. 用户 2026-08-31 截图：TPR 修订后聊天罗列 start 前门 6 项，用户必须补一句「请使用askuserquestion解决确认选项，然后可以直接开工」。截图中的 `c3/share.rs` / Mihomo 等内容只作失败形态，不进入核心规则。详见 `research/current-gap-analysis.md`。
2. 审阅者硬门仍成立：`SKILL.md` 禁止编辑规划产物与产品代码，禁止产出修订后的规划，禁止 `task.py start`；唯一持久写入是 `.trellis/reviews/<root-task-name>.md`。
3. 成功聊天契约是结论行 + 报告路径 + 一份 `handoff-prompt.md` 围栏。审阅者今天不会在聊天里罗列确认清单；缺口在交接 Prompt 对**下一代理（修订者）**的义务。
4. `references/handoff-prompt.md:70-86` 与 `:134-149` 禁止声称已批准、禁止 start，但从未点名 `AskUserQuestion`，也没有「必须调用、禁止只写聊天等待提醒、同一轮写回」。
5. `evals/evals.json` #1/#7/#10 锁定审阅者只读且不生产终稿规划。#7 把写/修规划路由到项目自己的 Trellis 规划流。没有覆盖「修订者 dump-and-wait」的正反例。
6. `tests/tree-review-contract.test.mjs` 锁定 `version: 0.4.0` 与一作用域一份报告一份交接。
7. 审阅者 `allowed-tools` 不含 `AskUserQuestion`。保持：提问义务写在交接文本里，不给审阅者扩权。
8. 兄弟任务 `.trellis/tasks/08-31-goal-meta-ask-confirm` 把同一截图失败修在 **goal-meta 生成的 Trellis `/goal`**，并明确不改 `trellis-plan-review`。本任务是该缺口在 plan-review 包上的对应改动；开工授权仍归那条 `/goal`。
9. 包为 Production 结构（interface + `evals/evals.json` + 合同测试），无 README/manifest。仓库禁止为 Qiaomu 外部门禁新增 README/manifest/第二种包内 eval schema（`skills/development-workflows/AGENTS.md`；`.trellis/spec/guides/skill-authoring-conventions.md:291-294`）。
10. skills.sh 本次 `missing evidence`。SkillsMP 31 家族已检索；短名单与取舍见 `research/prior-art-research.md`。

## Key Decisions

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-31 | 改交接 Prompt / 修订者合同，不给审阅者增加 `AskUserQuestion`，审阅者仍不改规划 | 截图失败发生在 TPR 已写入之后；独立审阅身份与 eval #7 必须保留 |
| 2026-08-31 | 正向义务：有剩余用户所有确认项时必须调用结构化工具，禁止只把清单写进聊天等待提醒 | 截图失败链 |
| 2026-08-31 | 一次批次最多 4 题，含推荐项；答案写回当前作用域规划产物 | 避免「问一题→再完善规划」循环；与 08-31 / specifying-gates 上限一致 |
| 2026-08-31 | 本 skill 仍禁止 `task.py start`。用户「可以直接投入实施」解释为：修订会话结束后规划可被后续实施请求直接执行，不再需要提醒式规划轮 | 与独立审阅、eval #1/#10、兄弟任务开工权一致；截图「开工」由 08-31 的 `/goal` 承担 |
| 2026-08-31 | 负向门：仓库可回答事实、普通实现细节、无第三类项时的仪式提问，仍不得问 | 防止每步都问 |
| 2026-08-31 | 不改 frontmatter `description`，除非实施证明路由漏掉审阅触发 | AskUserQuestion 是交接输出，不是新触发面 |
| 2026-08-31 | 版本升到 `0.5.0` | 用户可见的交接合同变化 |
| 2026-08-31 | 不新增 README/manifest/包内第二种 eval schema；Qiaomu validate 差异记 `missing evidence` | 仓库 skill-authoring 约定 |

## Requirements

- R1: 审阅者独立只读合同不得回退。

  - R1.1: 审阅者仍不得编辑规划产物（`prd.md`、`design.md`、`implement.md`、jsonl、`task.json`）与产品代码。
  - R1.2: 审阅者仍不得运行 `task.py start` / `finish` / `archive`，不得声称规划已批准。
  - R1.3: `allowed-tools` 仍不含 `AskUserQuestion`。成功聊天仍只有结论行、一份报告路径、一份交接围栏。
  - R1.4: 报告仍给 Route 而非替用户做产品决定（`finding-contract.md`）。

- R2: 交接 Prompt 必须带结构化确认门的正向义务。

  - R2.1: 中英文 `handoff-prompt.md` 都要求修订者在写规划前将剩余阻塞项分为：仓库可回答事实、已批准范围内实现判断、用户所有且会改变范围/产品语义/风险/成本/授权的确认项（含 TPR Route 互斥产品选项、本轮修订新引入的 start 前门）。
  - R2.2: 第三类仍阻塞时，必须调用宿主结构化问题工具。Claude Code 文本点名 `AskUserQuestion`；Oh My Pi 使用 `ask`；Codex 使用实际可用的 `request_user_input`（或宿主当前等价名）；无工具时问一个简短编号题。必须先确认实际工具名。
  - R2.3: 禁止把确认清单只写进聊天并等待用户提醒「请使用 AskUserQuestion」。无第三类项时不得仪式性提问。
  - R2.4: 同一轮最多 4 题；每题带推荐项与互斥选项。截图式多确认项应合并进这一批。

- R3: 提问之后必须同一轮写回，使规划可投入实施。

  - R3.1: 回答后在同一修订会话写入当前作用域被决定的 `prd.md` / `design.md` / `implement.md` / jsonl（仅改被决定条款与被点名 TPR），不得再等第二条用户提醒去「继续完善规划」。
  - R3.2: 写回后又出现新的第三类项时，可以再来一轮结构化提问（仍 ≤4），但不得退回 dump-and-wait。
  - R3.3: 全部「阻断」和「应修」处理完、第三类项已提问并写回或已标明不处理后，修订会话停止。规划应可被一次后续实施请求执行。
  - R3.4: 修订者仍不得 `task.py start` / `finish` / `archive`，仍不得声称规划已获批准。

- R4: 负向门与路由边界不得回退。

  - R4.1: 不得为仓库可回答事实、普通实现细节、或无剩余用户决策时的仪式确认提问。
  - R4.2: 只读代码 diff 仍路由 `code-auditor` / `code-quality-review`。纯「现在就问我确认项」且没有审阅规划请求，不得触发本 skill。
  - R4.3: 本任务不修改 `goal-meta-skill`、Trellis runtime、`08-31-goal-meta-ask-confirm` 工件。

- R5: 确定性回归与仓库包结构。

  - R5.1: 长规则放 `references/revision-question-gate.md`；`handoff-prompt.md` 含可执行条款；`SKILL.md` 只加最短指针与 version `0.5.0`。
  - R5.2: `tests/tree-review-contract.test.mjs` 将版本锁到 `0.5.0`，并 fail-closed 检查交接模板含 AskUserQuestion、dump-forbidden、写回、仍禁止 start、负向排除。
  - R5.3: `evals/evals.json` 连续 id 增加：截图同构（交接要求一次收口写回且不 start）正例；近邻负例（当前会话「现在就用 AskUserQuestion 问我」不是规划审阅）。现有 #1–#10 只读/不修规划断言不回退。
  - R5.4: 同步 `agents/interface.yaml`、`references/report-template.md` 的 version。不新增 README/manifest/包内 `trigger_cases.json`。Qiaomu validate 若因 README/manifest 失败，记 `missing evidence`。

## Acceptance Criteria

- [ ] AC1 (R1): 审阅者 `allowed-tools` 仍无 `AskUserQuestion`；`SKILL.md` 硬门仍禁止改规划产物、禁止产出修订规划、禁止 `task.py start`。现有 eval #1/#7/#10 对应断言仍成立。
- [ ] AC2 (R2): 中英文 `handoff-prompt.md` 均点名 Claude `AskUserQuestion`、宿主等价与无工具回退，并要求第三类项在继续写规划前调用该工具。
- [ ] AC3 (R2, R3): 同模板禁止把确认清单只写进聊天等待提醒；要求一次 ≤4 题并在同一轮写回规划产物。
- [ ] AC4 (R3): 模板仍禁止 `task.py start`，且写明修订结束后规划可被后续实施请求执行，而不是本会话开工。
- [ ] AC5 (R4): 普通实现细节、仓库可回答事实、无第三类项时仪式提问不得出现在交接义务的正向路径；eval 近邻负例不把「现在就问我」路由到本 skill。
- [ ] AC6 (R5): `tree-review-contract.test.mjs` 锁定 `0.5.0` 与 AC2–AC4 关键词簇；缺正向义务或仍允许 dump-and-wait 的模板会使测试失败。
- [ ] AC7 (R5): `evals/evals.json` 含截图同构 recorded_fixture 与 AskUserQuestion 近邻负例；id 连续；#1–#10 不回退。
- [ ] AC8 (R1, R5): focused Node tests、`just skills-check`、`just docs-sync`、`just ci`、`git diff --check` 通过；版本绑定 `0.5.0`。
- [ ] AC9 (R4, R5): 不修改 `goal-meta-skill`、不写 README/manifest、不声称 Qiaomu package/release 全绿；provider 服从率标 `missing evidence`。

## Out of Scope

- 给审阅者增加 `AskUserQuestion` 或让审阅会话改规划。
- 让本 skill 的交接授权 `task.py start`（归 `08-31-goal-meta-ask-confirm` 生成的 `/goal`）。
- 修改 `goal-meta-skill`、Trellis `task.py` / workflow runtime、扫描器。
- 把 brainstorm「每消息一题」写进交接 Prompt。
- 保证任意 provider 实际调用该工具（`missing evidence`）。
- 激活/提交生成本任务的 Goal，或 push/PR/发布/安装。
- 把截图项目的产品决策写成通用规则。
- 新增 README、manifest、包内第二种 eval schema。

## Risks and Deferred Evidence

- 交接 Prompt 变长；长判断放 `revision-question-gate.md`，围栏内只留语义簇。
- 字符串合同测试可能奖励关键词堆叠；用正反关键词簇锁语义，不锁一整句。
- 「规划可投入实施」不是 Trellis 批准；盲区声明仍必须保留。
- skills.sh、provider 服从率、提醒次数下降均为 `missing evidence`。

## Open Questions

无阻塞产品问题。剩余项转为规划终审：用户批准本摘要后方可 `task.py start`。
