# goal-meta-skill 注入 Trellis 子代理派发条款

## Goal

让 `goal-meta-skill` 生成的 Trellis 任务实施 `/goal` 携带子代理派发要求：代码实施派发 `trellis-implement`、验证派发 `trellis-check`、主会话不直接编辑产品文件。要求覆盖适配器、范本、linter 与 evals 四层，并且不得注入到普通任务或内联模式平台。

## Background

用户报告：用这个 skill 生成 Trellis 实施 `/goal` 之后，执行 agent 没有使用子代理，而是主会话内联实施。

对整个 skill 包 16 个文件做 `grep -i "subagent|sub-agent|子代理|trellis-implement|trellis-check|trellis-research|派发|dispatch"`，**零命中**。skill 从未要求过派发，所以执行 agent 内联实施并不是执行偏差，是合同缺失。

### 四层缺口

**L1 适配器 —— `references/trellis-goal-cadence.md`（105 行）。**
Trellis 适配器只编码 commit-then-archive 与父任务发布门。5 个小节（Detection、Commit then archive、Parent and 发布门、Pause text、Persisted and legacy file-pointer goals）没有一节涉及实施主体是谁。

**L2 范本 —— `references/goal-command-playbook.md:287-311`。**
`Trellis Task Implementation` 是该用例的范本输出。Codex 版（`:292-299`）与 Claude Code condition 版（`:304-311`）都写「先读该任务 prd.md、design.md 与根 AGENTS.md，按任务边界修复……」，主语是执行 agent 自己。生成物因此是内联实施合同。`Drafting Rules` 的 `:229` 只说「outcome 是 Trellis 任务实施时加载 cadence 文件」，cadence 文件里没有派发，链条到此为止。

**L3 校验 —— `scripts/lint_goal_command.py:577-583`。**
契约 linter 的 Trellis 分支只校验两件事：`Required reading` 链接 `prd.md` / `design.md` / `implement.md`；`Iteration policy` + `Completion conditions` 保留 `commit` 与 `archive`。没有派发校验。内联 `/goal` 走 `lint_text`（`:338-387`），完全没有 Trellis 分支——内联 Trellis goal 得到零 Trellis 校验。

**L4 回归 —— `evals/evals.json` 与 `tests/`。**
4 个 Trellis 用例（id 15、16、17、29）共 18 条断言，无一涉及派发。`tests/lint-goal-command.test.mjs` 的 `trellis` 命中数为 0；`tests/persist-goal-contract.test.mjs` 只有一个 Trellis 用例，断言 commit-then-archive 与三份产物链接。

### 为什么修在这个 skill 比改 hook 有效

Claude Code 2.1.245 的系统提示含 `Do not call the AgentTool unless the user requested it`（二进制内置常量 `LLr`，经 `tengu_heron_brook` 注入，来源含 client data 覆盖、远端动态配置与门函数 `tzt(e)`，三条都在本地仓库之外）。该指令的谓词是「用户是否请求了」。

Trellis 本体把派发写成 `.trellis/workflow.md` 的 `Main-session default`，靠 `UserPromptSubmit` 钩子注入，谓词不匹配。对本仓库 5 个到达 `in_progress` 的历史会话实测：3 个在面包屑已含该规则时派发次数为 0，主会话编辑 7–29 次。详见 `research/host-directive-and-breadcrumb-evidence.md`。

`/goal` 正文是用户自己粘贴的话，因此把派发要求写进 `/goal` 直接满足「用户已请求」这个谓词，不需要与系统提示竞争。这是本任务的设计依据。

## Confirmed facts

- skill 路径：`skills/developer-tools-integrations/goal-meta-skill/`，当前 `version: 0.5.0`。
- 事实来源纪律：`references/platform-goal-facts.md:3-5` 声明自己是 `/goal` 生命周期、长度、预算、权限、headless、文件加载事实的唯一来源，其他 reference 不得发明或分叉这些声明。子代理派发不属于 `/goal` 生命周期事实，属于 Trellis 事实，归属 `trellis-goal-cadence.md`——该文件 `:11-16` 已有「Archive facts used here（不要把 Trellis 脚本内部细节抄进 SKILL.md）」的同类先例。
- 派发平台分组来源：目标项目的 `.trellis/workflow.md`。本机 `.trellis/workflow.md` 把平台分三组——派发组（含 Claude Code、Oh My Pi）在 `:475-488`，pull 组（含 Grok、Kimi Code）在 `:490-502`，内联组（`codex-inline`、Kilo、Antigravity、Devin）在 `:518-526`。Codex 走 `auto` 还是 `inline` 由 `.trellis/config.yaml` 的 `codex.dispatch_mode` 决定（本机 `config.yaml:125-145` 记录默认 `auto`）。
- 字符预算不构成约束：Codex Trellis 范本正文 916 字符、Claude 版 987 字符，各有约 3000 字符余量。
- 版本号硬绑定在 7 处：`SKILL.md:5`、`scripts/lint_goal_command.py:478-479`、`references/persistent-goal-contract.md:77`、`reports/creation-handoff.md:1,5`、`tests/persist-goal-contract.test.mjs:80`、`tests/lint-goal-command.test.mjs:258`。
- eval id 集合硬绑定：`tests/lint-goal-command.test.mjs:280-281` 断言前 18 条 id 恰为 1–18、其后 15 条恰为 19–33。新增 eval 必须同步该断言。
- 两套 eval 系统互不兼容（`.trellis/spec/guides/skill-authoring-conventions.md:212-252`）：仓库自带的 `evals/evals.json` 是人工审阅的行为回归 fixture，`just ci` 不执行它；`trigger_eval.py` 是另一套路由门，需要 `should_trigger` / `should_not_trigger` / `near_neighbor`。本任务不改 `description`，不涉及路由边界，因此不需要 `trigger_eval.py`。
- 真正在 CI 里跑的是 `tests/*.mjs`（`just node-test` 递归 `skills/**/tests/*.mjs`）。派发校验的回归保障必须落在 `.mjs` 测试里，不能只靠 `evals.json`。
- `just ci` 第 1 步是 `docs-check`；`SKILL.md` frontmatter 的 `version` 变更会让 docs catalog 漂移，需要跑 `just docs-sync`。
- `validate_skill.py` 对缺少 per-skill `README.md` / `manifest.json` 硬失败，属既有的有意 schema 偏离（同上 spec `:249-252`），本任务不补这两个文件。

## Requirements

1. 在 `references/trellis-goal-cadence.md` 新增派发一节，含：
   - 一张带 `Last verified` 日期与证据标签的 5 平台派发事实表，标签沿用 `platform-goal-facts.md` 的 `official` / `local-probe` / `community-observed` / `missing evidence` 词汇；
   - 生成的 `/goal` 必须要求执行 agent 先读目标项目 `.trellis/workflow.md` 的 Phase 2.1 / 2.2 确认本项目实际的派发协议与 agent 名，不得让 skill 单方面断言目标项目一定有某个 agent；
   - 内联例外：目标平台属内联组，或 Codex 的 `codex.dispatch_mode` 为 `inline` 时，不注入派发条款，改用该项目的内联形状。
2. 派发条款要落到 `/goal` 的三个字段：`迭代策略`（派发谁、什么顺序）、`约束`（主会话不得直接 Edit/Write 产品文件）、`完成条件`（派发证据）。Claude Code 版的完成条件必须是 transcript 可见的证据，符合现有 condition variant 风格。
3. 更新 `references/goal-command-playbook.md:287-311` 的两个 Trellis 范本，使其体现派发条款；保留现有 commit-then-archive 与父任务发布门措辞不变。
4. 注入门与归档节奏共用同一个判定：只有 outcome 明确是 Trellis 任务/子任务实施才注入。`.trellis/` 仅存在不构成注入理由（eval 17 的既有边界）。
5. `scripts/lint_goal_command.py` 增加派发校验：
   - 契约分支（`lint_persisted_contract` 的 `.trellis/tasks/` 条件内）要求 `Iteration policy` 或 `Completion conditions` 出现派发要求；
   - 内联分支要新增 Trellis 识别：文本含 `.trellis/tasks/` 且含归档节奏时，同样要求派发要求存在。
   - 校验必须能被内联例外豁免：文本明示内联模式时不报错。
6. `evals/evals.json` 的 4 个 Trellis 用例补派发断言；新增至少一个内联例外用例与一个「`.trellis/` 存在但非任务实施」的反例确认不注入。
7. `tests/lint-goal-command.test.mjs` 新增派发校验的正反用例，使 `just node-test` 能捕获回归。
8. 版本号从 `0.5.0` 升到 `0.6.0`，7 处同步；`reports/creation-handoff.md` 记录本次取舍、证据等级与缺失项。
9. `agents/interface.yaml` 的 `default_prompt` 末句（现为「For Trellis implementation, link concrete task artifacts and preserve commit-then-archive plus the parent release gate.」）补上派发要求。
10. `SKILL.md` 的 `Trellis adapter` 段与 `Quality bar` 拒收项同步；`SKILL.md` 保持路由与最小工作流，判断细节留在 reference 里。

## Acceptance Criteria

- [x] `grep -ri "trellis-implement" skills/developer-tools-integrations/goal-meta-skill/` 在 `references/trellis-goal-cadence.md`、`references/goal-command-playbook.md`、`scripts/lint_goal_command.py`、`evals/evals.json`、`tests/lint-goal-command.test.mjs` 五个文件各至少一处命中。
- [x] `trellis-goal-cadence.md` 的派发表含 5 个受支持平台各一行，每行带证据标签；Claude Code 之外的平台不得标为 `official`。
- [x] 派发表带 `Last verified: <日期>` 行，且该日期出现在 `tests/lint-goal-command.test.mjs` 的同步断言中。
- [x] `goal-command-playbook.md` 的 Codex 与 Claude Code 两个 Trellis 范本都含派发条款，且 `迭代策略`、`约束`、`完成条件` 三处都体现；两个范本正文仍各在 4,000 字符以内。
- [x] 现有 commit-then-archive 与父任务发布门措辞在两个范本中逐字保留（用 diff 确认只增不改）。
- [x] linter 行为四种输入正确：(a) Trellis 契约缺派发要求 → 报错；(b) 含派发要求 → 通过；(c) 明示内联模式且缺派发 → 通过；(d) 非 Trellis 文本缺派发 → 通过。
- [x] 内联 `/goal` 分支同样满足上述四种，且现有 20 个 `.mjs` 测试全部仍通过。
- [x] `evals/evals.json` 的 id 15、16、17、29 各含至少一条派发相关断言；id 17 的断言明确要求不注入派发条款；新增用例的 id 连续且 `tests/lint-goal-command.test.mjs:280-281` 的 id 断言已同步。
- [x] 版本号 7 处全部为 `0.6.0`：`grep -rn "0\.5\.0" skills/developer-tools-integrations/goal-meta-skill/ --include=*.md --include=*.py --include=*.mjs` 零命中（排除 `__pycache__`）。
- [x] `just node-test` 通过。
- [x] `just ci` 通过（含 `docs-check`；version 变更后先跑 `just docs-sync`）。
- [x] `python scripts/check.py skills` 通过。
- [x] `reports/creation-handoff.md` 标明哪些结论是 `design advantage`、哪些是 `validated advantage`、哪些是 `hypothesis`；「派发条款是否真的提高执行 agent 的派发率」必须标为待观测，不得写成已验证。

## Out of scope

- 修改本仓库 `.trellis/workflow.md`、`.trellis/config.yaml`、`.claude/settings.json`、`.claude/CLAUDE.md` 或新增仓库钩子。上一轮误创建的任务已移出仓库，那条路线不在本任务内。
- 改动 `references/platform-goal-facts.md` 的 `/goal` 生命周期事实或其 `Last verified: 2026-08-23` 日期。派发事实不进该文件。
- 改动 skill 的 `description` 与路由边界，因此不需要 `trigger_eval.py` 与 `semantic_config.json`。
- 新增 `README.md` / `manifest.json`（既有的有意 schema 偏离）。
- 修改 `scripts/persist_goal_contract.py` 的写入与冲突逻辑。
- 让 skill 自己执行 `/goal`、commit 或 `task.py archive`。既有边界不变。
- 为 Trellis 之外的工作流增加子代理条款。

## Resolved decisions

1. **平台矩阵：混合方案。** `trellis-goal-cadence.md` 落一张带日期与证据标签的派发表，Claude Code 标 `local-probe`（本机已实测 `.claude/agents/trellis-*.md` 存在、`workflow.md:475-488` 为派发组），其余四平台标为 `.trellis/workflow.md` 来源；同时要求生成的 `/goal` 侦察目标项目的 `workflow.md` 确认 agent 名与 `dispatch_mode`。用户 2026-08-25 选定。
2. **旧任务处置：删掉重建。** 上一轮面向仓库 `.trellis/` 配置的任务已移出仓库，其中的宿主指令与面包屑实测证据保留为本任务的 research 材料。用户 2026-08-25 选定。
