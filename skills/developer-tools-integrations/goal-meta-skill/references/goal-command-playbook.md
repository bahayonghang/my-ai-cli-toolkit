# Goal Command Playbook

## What This Skill Produces

This skill compiles a reviewable `/goal` command for Codex, Claude Code, Grok
Build, Oh My Pi, or Kimi Code, and optionally persists one approved root
`GOAL.md` handoff. It never submits or launches the command.

For Chinese users, the body of the goal can be fully Chinese, but the slash command should still start with `/goal`. Do not use `/目标` as the executable command unless the current client explicitly supports that alias.

A normal prompt tells the agent what to do now. A goal defines a durable operating contract: what outcome matters, how completion is proven, what must not change, where work may happen, how to iterate, when to stop, and when to pause.

Default stance: give the best copy-ready goal once the request is concrete. For material unknowns, use the bounded discussion in `references/interview-checklist.md`; low-risk unknowns still get conservative defaults and one short reason.

## Platform Goal Commands

`references/platform-goal-facts.md` is the sole lifecycle/length/budget/headless
fact source. Select one platform from explicit user wording, then host evidence,
then a bounded choice. Management requests receive only the minimal command for
that platform; never blend `clear`, `drop`, `cancel`, `replace`, `next`, `show`,
or `budget`.

Codex, Claude Code and Kimi officially cap objectives/conditions at 4,000
characters. The same number is only a goal-meta portability budget for Grok and
OMP. For an explicitly approved handoff, write the useful contract to root
`GOAL.md` and return a short platform renderer:

```text
/goal First read and follow ./GOAL.md as the approved execution contract; restate its Verification and Completion conditions, then work until they are evidenced or a pause condition is reached.
```

The default remains chat-only. An explicit generate-and-save request for root
`GOAL.md` authorizes same-turn creation when the root and scope are established
and no file conflict exists. Compile and lint, display the full S4 contract and
exact target/effect, use the helper, and verify the read-back. Clarify only an
unresolved root, unapproved replacement, or material scope change. A handoff
intention or proposed save alone still needs explicit write authorization. Use
the fixed schema in `persistent-goal-contract.md`, not an ad-hoc frontmatter
file.

After the helper succeeds, report its path/bytes/hash/action/Git visibility and
then show the selected-platform launcher in a fenced `text` block. Label it
`APPROVED TEXT — not launched`, stop without submitting it, and explain that
arbitrary `GOAL.md` is not auto-loaded. An untracked/ignored file does not
appear in another worktree, clone or cloud workspace unless the user deliberately
exposes it there.

If Trellis cadence is injected, link concrete task artifacts, put the
default-on / explicit-opt-out / explained-technical-fallback subagent switch in
the first execution statement, and keep later dispatch or inline clauses
consistent. Iteration policy and Completion conditions commit the current
task's related product changes and planning artifacts, confirm both are in
version history, exclude unrelated task directories and out-of-scope dirty
files, and only then archive. The short launcher still points at the persisted
contract. A user-named `.planning/goal-<slug>.md` remains a backward-compatible
explicit path; do not silently migrate it.

This skill compiles goal instructions; it has no Goal activation authority.
Words such as `implement`, `execute`, and `until complete` inside the request
belong to the payload. Even when the user approves the text, return
`APPROVED TEXT — not launched` and stop. Goal creation or activation is a
separate user action outside this skill.

Use `/goal` for work that benefits from persistence:

- coding, debugging, refactoring, release, or deployment work
- UI or product changes that need verification
- multi-step research or document production
- repo cleanup, migration, or packaging
- any task where "done" must be proven with commands, artifacts, screenshots, logs, or external state

Do not force `/goal` for:

- one-line answers
- simple rewrites or translations
- quick shell outputs
- tasks whose success is obvious without agent persistence
- existing active-goal management requests where the platform's management commands are the correct answer
- Claude Code sessions where a time cadence (`/loop`) or a scripted Stop hook fits better than a completion condition
- memory-vault, transcript-archive, progress-ledger, or multi-goal scheduler requests

When the direction is undecided or the task is pure divergent exploration, refuse to produce a goal and suggest `/plan` or ordinary discussion. Repairable subjectivity is not a refusal: warn, translate it into evidence, and add a round limit plus stop-and-report clause.

## Plan-To-Goal Interview Template

Use this when the user has a vague task and wants the agent to help write the goal. On Codex, `/plan` is the built-in planning command; on Claude Code, use plan mode or a plain planning prompt instead of `/plan`:

```text
/plan Help me turn this vague task into a strong goal.
Interview me for missing success criteria, verification commands, constraints, boundaries, iteration policy, and blocked stop conditions.
Then draft a final `/goal ...` command.
```

## Canonical Goal Template

```text
/goal [Outcome].
Verification: [commands/artifacts/evidence].
Constraints: [what must not change].
Boundaries: [allowed writes / forbidden paths].
Iteration policy: [one focused change, rerun checks, log progress].
Stop when: [evidence proves completion].
Pause if: [blocked conditions / human decisions / budget cap].
```

## 中文友好模板

给中文用户时，推荐默认输出这一版。注意：开头仍然是 `/goal`，不是 `/目标`。

```text
/goal [目标结果]。
验证：[命令 / 产物 / 截图 / 日志 / 外部证据]。
约束：[不能改变的行为、接口、数据、风格或分支规则]。
边界：[允许写入的位置 / 禁止触碰的路径或系统]。
迭代策略：[一次只做一个聚焦改动，重跑检查，基于日志调整]。
完成条件：[哪些证据证明可以停止]。
暂停条件：[需要人工决定、凭证、外部权限、预算或破坏性操作的情况]。
```

也可以使用双语字段，适合要兼顾中文可读性和英文模板兼容性的场景：

```text
/goal [目标结果]。
Verification（验证）：[命令 / 产物 / 截图 / 日志 / 外部证据]。
Constraints（约束）：[不能改变的行为、接口、数据、风格或分支规则]。
Boundaries（边界）：[允许写入的位置 / 禁止触碰的路径或系统]。
Iteration policy（迭代策略）：[一次只做一个聚焦改动，重跑检查，基于日志调整]。
Stop when（完成条件）：[哪些证据证明可以停止]。
Pause if（暂停条件）：[需要人工决定、凭证、外部权限、预算或破坏性操作的情况]。
```

### Review-remediation overlay

Use only for a Goal that implements a named scan/review/audit/report/finding
source. Keep the ordinary fields above, then embed the canonical contract from
`review-remediation-contract.md` without inventing a second authority source:

- freeze `scanner / scanner_identity / config / inputs / targets /
  baseline_report / git_baseline` before product writes;
- keep one stable finding ledger with the canonical fields and statuses;
- make `PASS | FINDINGS | BLOCKED` the checker vocabulary and feed actionable
  same-scope `FINDINGS` back to implementation in the same task;
- name the one user-question gate before first product write; Claude Code uses
  `AskUserQuestion`, but same-scope findings and ordinary implementation choices
  never qualify;
- allow at most three focused rounds, with same-signature no-progress and
  round-cap residuals ending `BLOCKED` rather than complete;
- require original-parameter same-envelope rescan, zero open actionable
  findings, regression/final gates, and diff/status scope evidence;
- explicitly forbid requesting or emitting a second repair Prompt.

Lint this overlay with `--review-remediation`. It applies equally to inline
text and the matching sections of an approved persisted contract. The skill
still presents the DRAFT/APPROVED TEXT and stops without launching it.

## 双语草案策略

当用户使用中文、任务还在收敛中，先标记
`状态：DRAFT — Goal 未创建、未激活、未执行`，再给可直接复制的推荐版和英文兼容镜像：

1. `推荐执行版（中文，可直接复制）`：给用户直接复制，字段名用中文。
2. `Goal Draft (English-compatible)`：给团队文档或偏英文的 Codex / Claude Code 会话复制使用，字段名用英文。

两份草案必须语义一致，不能一份扩大范围、一份缩小范围。英文版是兼容镜像，不是重新发挥。

普通聊天型 S4 把每份 `/goal` 正文放进 `text` 围栏，围栏内不要空行；围栏外要求用户审阅，然后停止本轮。用户确认后的 S6 形状见 `references/default-goal-strategy.md`：标记 `APPROVED TEXT — not launched`，在 `最终可复制 /goal` 围栏外再给 `字段一览`，然后再次停止。

如果用户明确说“只要中文版”或“只要英文版”，遵从用户要求。

````markdown
状态：DRAFT — Goal 未创建、未激活、未执行

推荐执行版（中文，可直接复制）

```text
/goal 基于用户需求创建第一版本地 MVP，先读取项目已有命令和约束，实现核心用户可见流程，并避免改动无关系统。
验证：运行项目提供的最小相关检查，启动本地应用或对应运行环境，完整走通一次核心流程，并用日志、截图或命令输出作为证据。
约束：不加入账号、付费服务、生产变更、破坏性操作或无关功能，除非用户明确要求。
边界：只写入新项目目录，或只修改现有项目中与该功能直接相关的文件。
迭代策略：一次实现一个聚焦工作流，每次有意义改动后重跑检查，重试前先读日志，最多做 3 轮聚焦改进后报告剩余风险。
完成条件：核心流程有运行证据证明可用，检查通过或明确说明缺少配置。
暂停条件：需要凭证、付费、生产数据、破坏性操作、法律/医疗/金融判断、版权素材或所有权不清时暂停。
```

默认选择理由：先做本地 MVP，因为它能最快验证核心体验，同时避免账号、后端和发布流程拖慢第一版。

可选调整
1. 项目形态：A 新建本地 MVP（默认） / B 改现有项目 / C 先做原型
2. 范围：A 核心流程（默认） / B 加常见增强 / C 做完整产品
3. 验证：A 本地运行检查（默认） / B 真机或线上检查 / C 发布前检查

Goal Draft (English-compatible)

```text
/goal Create a first-version local MVP for the requested task, inspect project-provided commands before changing code, implement the core user-visible workflow, and keep unrelated systems unchanged.
Verification: run the smallest project-provided checks, start the local app or relevant runtime, complete the core workflow once, and capture logs/screenshots or command output as evidence.
Constraints: do not add accounts, paid services, production changes, destructive operations, or unrelated features unless requested.
Boundaries: write only inside the new project directory or the directly related existing project files.
Iteration policy: implement one focused workflow at a time, rerun checks after meaningful changes, inspect logs before retrying, and make at most 3 focused improvement rounds before reporting remaining risks.
Stop when: the core workflow is proven by runtime evidence and checks pass or missing checks are explicitly reported.
Pause if: credentials, payments, production data, destructive changes, legal/medical/financial decisions, copyrighted assets, or unclear ownership is required.
```

请审阅上方 Prompt；如需修改请指出，如认可请回复“批准 Prompt”。本轮到此停止。
````

The six practical elements are:

| Element      | Question it answers             | Good content                                                         |
| ------------ | ------------------------------- | -------------------------------------------------------------------- |
| Outcome      | What should be true at the end? | A user-visible or repo-visible result                                |
| Verification | How do we prove it?             | Commands, tests, builds, screenshots, logs, API checks, files        |
| Constraints  | What must not change?           | Behavior, public API, data shape, style, secrets, branch rules       |
| Boundaries   | Where may the agent write?      | Allowed directories, forbidden paths, no unrelated refactors         |
| Iteration    | How should failures be handled? | One focused change, rerun checks, inspect logs before retrying       |
| Stop/Pause   | When does work end or wait?     | Completion evidence, auth blockers, destructive choices, budget caps |

中文对应：

| 要素      | 回答的问题           | 好内容                                         |
| --------- | -------------------- | ---------------------------------------------- |
| 目标结果  | 最后要变成什么状态？ | 用户可见或仓库可见的结果                       |
| 验证      | 怎么证明完成？       | 命令、测试、构建、截图、日志、API 检查、文件   |
| 约束      | 什么不能变？         | 行为、公开 API、数据结构、风格、密钥、分支规则 |
| 边界      | 可以写哪里？         | 允许目录、禁止路径、不做无关重构               |
| 迭代策略  | 失败后怎么继续？     | 小步改动、重跑检查、先读日志再换策略           |
| 完成/暂停 | 什么时候停止或等人？ | 完成证据、登录/权限阻塞、破坏性选择、预算上限  |

## Verification Anchors

Bind every completion condition to an authoritative enumeration source or a deterministic check. Valid anchors include command exit codes and test/lint/build output, benchmark or report values, artifact paths or file lists, and named source material such as issue acceptance criteria or project docs.

Numbered completion conditions are the recommended style, not a hard requirement and not a demand to invent counts. A broad term such as `all`, `every`, `所有`, `全部`, or `clean up` is defective only when no enumerated source or check defines its set. `all tests in test/auth pass` is valid because the named suite is the evidence source.

Classify proposed verification before placing it in the goal:

| Class       | Use in the goal                                                                 |
| ----------- | ------------------------------------------------------------------------------- |
| Safe-quick  | Run after focused changes and at completion.                                    |
| Long        | Run at planned checkpoints or the final gate, not after every small edit.       |
| Destructive | Never put in an iteration loop; stop for authorization and recovery planning.   |
| Flaky       | Record failures, retry only within a stated bound, and corroborate another way. |

Baseline capture may be recommended when before/after evidence matters, but this skill only drafts the instruction and does not run the command.

For review-remediation, the baseline is mandatory and broader than a before/after
number: it is the full scan envelope named above. If the scanner, configuration,
corpus, targets, or input enumeration drifts, instruct the executor to establish
a new baseline or stop `BLOCKED`; never label a drifted comparison clean.

## Read-First And Checkpoint Patterns

Prefer a read-first opening when source context exists: name the files, docs, issue, logs, or plan the agent must inspect before changing anything. For longer work, require checkpoints and a short progress log tied to verification evidence.

```text
Iteration policy: first read AGENTS.md, the linked issue, and the affected tests; then work in focused checkpoints, record each checkpoint's changed scope and check output, and inspect new evidence before changing strategy.
```

Budget, turn, or time wording is always a soft stop clause. Say, for example, `Treat 20 turns as a soft stop: report progress and remaining work when reached.` `Community-observed` Codex evidence says goal text does not configure the platform runtime budget; `budget-limited` is an official runtime state. Claude's evaluator officially judges turn/time clauses from the transcript.

## Drafting Rules

- Write the outcome as a result, not as "work on X".
- Keep the executable `/goal` objective within 4,000 characters. Use a file pointer for longer contracts.
- Put exact commands in `Verification` when the repo exposes them.
- If exact commands are unknown, make discovery part of the goal: read package scripts, Makefile, CI config, Xcode schemes, project docs, or local runbooks first.
- Put artifacts in `Verification` when commands are not enough: changed files, screenshots, exported PDFs, published URL, GitHub PR, logs, or API response.
- Put "what must not change" in `Constraints`, not in `Boundaries`.
- Put filesystem and repo permissions in `Boundaries`.
- In `Iteration policy`, require a new source of evidence after repeated failures.
- In `Stop when`, define proof, not a feeling.
- Number `Stop when` conditions when it improves scanability; do not invent a count when a named suite, source, report, or artifact already enumerates completion.
- In `Pause if`, include anything that needs human judgment or external permission.
- If the domain is unfamiliar or specialized, do not invent domain rules. Require an initial discovery pass over authoritative project docs, sample data, official references, or user-provided material.
- Allow model taste and implementation judgment inside the boundary, but do not allow scope expansion or weaker verification.
- At S4, put the `/goal` body in a `text` fence with no blank lines inside the fence.
- For ordinary chat-only authoring, label the S4 packet `DRAFT`, ask for review outside the fence, and stop without launching or executing the payload.
- After text confirmation, chat-only S6 is `APPROVED TEXT — not launched` plus `最终可复制 /goal` and 字段一览 as defined in `references/default-goal-strategy.md`; stop again without submitting it. Explicitly authorized persistence follows that reference's persistence finalization, including same-turn creation when no conflict exists.
- When the outcome is Trellis task implementation, load `references/trellis-goal-cadence.md`. That file owns commit-then-archive, parent 发布门, sub-agent dispatch, and inline exceptions. Do not invent placeholder tokens in executable drafts.

## Strong Examples

### Bug Fix

```text
/goal Fix the checkout discount bug so percentage coupons apply once per order and fixed-value coupons still stack with gift-card credit.
Verification: run the repo's checkout unit tests, add or update a regression test for percentage coupons, and run the smallest relevant lint/typecheck command from package scripts.
Constraints: do not change public coupon API names, database schema, gift-card behavior, or unrelated checkout UI copy.
Boundaries: edit only checkout pricing logic, coupon tests, and directly required fixtures; do not touch payment provider configuration or migration files.
Iteration policy: make one focused change at a time, rerun the failing check after each change, and inspect test output before changing strategy.
Stop when: the regression test fails before the fix, passes after the fix, and the relevant lint/typecheck command passes.
Pause if: payment credentials, production data, a schema migration, or a product decision about stacking rules is required.
```

Claude Code condition variant (same contract, condition-first with transcript proof and a bounding clause; `Pause if` becomes stop-and-report):

```text
/goal The checkout discount bug is fixed: the new percentage-coupon regression test failed before the fix and passes after it, the repo's checkout unit tests and smallest lint/typecheck command exit 0 with output shown in the conversation, and git diff touches only checkout pricing logic, coupon tests, and required fixtures; or stop after 20 turns and summarize remaining issues.
```

### UI Polish

```text
/goal Make the editor toolbar usable on mobile without horizontal overflow or overlapping controls.
Verification: run the configured frontend checks, open the local app, capture desktop and mobile screenshots, and confirm no text/control overlap in the toolbar.
Constraints: preserve existing editor commands, keyboard shortcuts, saved document format, and visual identity.
Boundaries: edit only toolbar layout/components/styles and directly related tests; do not redesign the editor shell or change document serialization.
Iteration policy: adjust one layout issue at a time, rerun checks, and use screenshots to compare before/after.
Stop when: checks pass and screenshots show the toolbar fits at desktop and mobile widths with all primary controls accessible.
Pause if: the design requires removing a primary command, adding a new design system dependency, or changing product navigation.
```

Claude Code condition variant (screenshot judgment cannot be seen by the transcript evaluator, so the condition cites checks and reported measurements instead):

```text
/goal The editor toolbar works on mobile: the configured frontend checks exit 0 with output shown in the conversation, and a layout check (test, DOM measurement, or viewport audit run by Claude) reported in the conversation confirms no horizontal overflow or overlapping controls at desktop and mobile widths; or stop after 15 turns and summarize remaining issues.
```

### Skill Creation

```text
/goal Create a local agent skill named goal-example-skill that packages the provided workflow into a reusable SKILL.md, README.md, optional agents/openai.yaml metadata, references, evals, and a lightweight validation script.
Verification: inspect the generated files, run YAML/JSON syntax checks if present, run the validation script on a sample output, and confirm the skill directory exists under ~/.agents/skills/goal-example-skill or the requested skill root.
Constraints: keep the skill concise, Chinese-first when appropriate, and include appropriate copyright/contact metadata; do not publish to GitHub unless explicitly requested.
Boundaries: write only under ~/.agents/skills/goal-example-skill and any explicitly requested temporary verification files; do not modify existing unrelated skills.
Iteration policy: create the minimal package first, validate structure, then add only references or scripts that improve reliability.
Stop when: all required files exist, validation passes, and the README explains usage, boundaries, and local checks.
Pause if: the workflow requires private credentials, external publishing, unclear ownership, or a naming change from the user.
```

Claude Code condition variant:

```text
/goal The goal-example-skill package is complete: all required files exist under the requested skill root (file listing shown in the conversation), YAML/JSON syntax checks and the validation script exit 0 with output in the conversation, and no files outside the skill directory changed per git status; or stop after 12 turns and summarize remaining issues.
```

### Trellis Task Implementation

Codex (commit the child-task product and planning artifacts, then archive; keep the parent until 发布门 `just ci`):

```text
/goal 优先使用 subagents（默认开启）；实施 Trellis 子任务 .trellis/tasks/08-22-checkout-discount：先读该任务 prd.md、design.md 与根 AGENTS.md，按任务边界修复结账百分比优惠重复应用；每完成一个可独立验收的任务，提交当前任务相关产品改动和当前任务规划产物，确认二者均进入版本历史后，再运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount。
验证：运行 just test-checkout 与 just ci，保存退出码和输出；用 git status --porcelain -uall 确认产品提交只含 src/checkout/ 与 tests/checkout/。
约束：不 push、不 amend；禁止 git add -f .trellis/；产品改动与归档前规划产物不得进入归档提交；其他活动或未跟踪任务目录保留不改且不纳入提交，范围外脏文件保留不改；不修改 .trellis/scripts/；父任务 .trellis/tasks/08-22-checkout 在发布门 just ci 通过前不归档，以免把未归档子任务的 parent 写成 null。主会话不直接 Edit/Write 产品文件；产品改动由 trellis-implement 完成。
边界：只修改 src/checkout/、tests/checkout/ 和当前任务直接需要的文件；不改无关脏文件。
迭代策略：先读 .trellis/workflow.md 的 Phase 2.1 / 2.2 确认本项目派发协议与 agent 名；代码实施派发 trellis-implement、验证派发 trellis-check；一次完成一个可独立验收的 Trellis 任务；用语义清晰的 Conventional Commits 提交当前任务相关产品改动和当前任务规划产物，确认二者均进入版本历史；然后运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount；再处理下一个子任务。
完成条件：1. 子任务的相关产品改动和当前任务规划产物均已提交并进入版本历史，且无关任务目录和范围外脏文件未被纳入。2. 子任务随后已由 python ./.trellis/scripts/task.py archive 独立归档。3. 发布门 just ci 退出码为 0。4. 父任务在发布门通过前保持未归档。5. 每个任务的代码实施由 trellis-implement 完成、验证由 trellis-check 完成。
暂停条件：任务范围外出现脏文件；归档自动提交失败；父任务仍有未归档子任务却被要求归档；出现 git add -f .trellis/ 请求；需要凭证、生产数据或破坏性操作。
```

Claude Code condition variant (transcript-visible proof, bounding clause, stop-and-report; do not recommend pause or resume management commands):

```text
/goal 优先使用 subagents（默认开启）；Trellis 子任务 .trellis/tasks/08-22-checkout-discount 已实施：百分比优惠只应用一次的回归证据已出现在对话中，just test-checkout 与 just ci 退出码为 0 且输出贴进对话，可独立验收的任务先提交当前任务相关产品改动和当前任务规划产物，确认二者均进入版本历史后再运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount，git status --porcelain -uall 证明相关产品/规划提交未混入归档提交，父任务 .trellis/tasks/08-22-checkout 在发布门 just ci 通过前未归档；否则在 20 轮后停止并总结剩余问题。
验证：运行 just test-checkout 和 just ci 并展示退出码；把 git status --porcelain -uall 与归档命令输出贴进对话。
约束：不 push、不 amend；禁止 git add -f .trellis/；产品改动与归档前规划产物不得进入归档提交；其他活动或未跟踪任务目录保留不改且不纳入提交，范围外脏文件保留不改；不修改 .trellis/scripts/；父任务在发布门 just ci 通过前不归档，以免把未归档子任务的 parent 写成 null。主会话不直接 Edit/Write 产品文件；产品改动由 trellis-implement 完成。
边界：只修改 src/checkout/、tests/checkout/ 和当前任务直接需要的文件；不改无关脏文件。
迭代策略：先读 .trellis/workflow.md 的 Phase 2.1 / 2.2 确认本项目派发协议与 agent 名；代码实施派发 trellis-implement、验证派发 trellis-check；一次完成一个可独立验收的 Trellis 任务；用语义清晰的 Conventional Commits 提交当前任务相关产品改动和当前任务规划产物，确认二者均进入版本历史；然后运行 python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount；再处理下一个子任务。
完成条件：1. 子任务的相关产品改动和当前任务规划产物均已提交并进入版本历史，且无关任务目录和范围外脏文件未被纳入。2. 子任务随后已由 python ./.trellis/scripts/task.py archive 独立归档。3. just ci 退出码为 0 且出现在对话中。4. 父任务在发布门通过前保持未归档。5. 每个任务的代码实施由 trellis-implement 完成、验证由 trellis-check 完成，派发记录出现在对话中。
暂停条件：任务范围外出现脏文件、归档自动提交失败、父任务仍有未归档子任务却被要求归档、出现 git add -f .trellis/ 请求、需要凭证或破坏性操作时，停止并报告，等待人工决定。
```

## Anti-Patterns

Weak:

```text
/goal Improve the app.
```

Better:

```text
/goal Reduce the dashboard's first-screen clutter so a returning user can see today's key metrics and complete the primary action without scrolling.
Verification: run frontend checks, open the local app, capture desktop and mobile screenshots, and verify no text overlap or hidden primary action.
Constraints: keep existing data sources, routing, auth flow, and analytics events unchanged.
Boundaries: edit only dashboard view components, layout styles, and directly related tests.
Iteration policy: change one visual/workflow issue at a time, rerun checks, and compare screenshots after each meaningful layout change.
Stop when: checks pass and screenshots show the key metrics plus primary action in the first viewport on desktop and mobile.
Pause if: new product priorities, new analytics events, or backend API changes are required.
```

Avoid:

- verification like `make sure it works`
- boundaries like `edit whatever is needed`
- iteration like `keep trying`
- stop conditions like `when it seems good`
- pause conditions omitted for auth, payment, destructive operations, or private data
- recommending `/goal pause` or `/goal resume` to a Claude Code user (the commands do not exist there; offer `/goal clear` plus re-setting, or interrupting)
- Claude Code conditions whose only evidence is a screenshot or human confirmation (the evaluator reads the transcript and runs no tools)
- Claude Code conditions with no turn or time bounding clause
- writes `GOAL.md` without explicit authorization, silently replaces it, or
  claims a new Agent automatically loads it
- borrows another platform's management command or calls the Grok/OMP 4,000
  portability budget an official platform limit
- Trellis implementation `/goal` that omits dispatch clauses while the
  target platform is in the dispatch group
- Trellis implementation whose first `/goal` statement omits the default-on
  subagent switch, infers opt-out from silence, or hides a capability fallback
  without its workflow/platform/`dispatch_mode` reason
- first-statement default-on, explicit opt-out, or technical-fallback state
  that contradicts later dispatch/inline clauses
- Trellis closeout that archives after product files only, omits current-task
  planning artifacts or version-history confirmation, or includes unrelated
  task directories / out-of-scope dirty files
- treating imperative payload text as permission to create/activate a Goal,
  submit the slash command, dispatch agents, or implement the target task
- continuing after a `DRAFT` or `APPROVED TEXT — not launched` review packet
