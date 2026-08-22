# Goal Interview Checklist

Ask only the questions needed to write a safe and testable goal. If reconnaissance or a low-risk assumption can answer it, do not ask the user.

Prefer numbered choices with defaults; use open questions for intent or priority when choices would distort the answer. Ask at most four questions per round. The user should be able to reply with `按默认` or `1B 2A 3C`.

First distinguish whether the user wants a new goal or active-goal management. If they want to inspect, edit, pause, resume, or clear the current goal, answer from `references/platform-goal-facts.md` instead of interviewing. Codex supports `/goal edit`; its accounting-retention behavior is explicitly `community-observed`. Claude Code has no edit/pause/resume command — offer clear-and-reset-later or interruption.

Then determine the target platform (`references/platform-goal-facts.md`): explicit statement wins, otherwise infer from the host environment, otherwise add the platform choice below.

## Two-Phase Protocol

### Phase A: Understand And Interview

1. Restate the intended outcome and the assumptions already safe to make.
2. Report project reconnaissance: rules, real verification commands, likely write boundaries, and dirty state. Invite corrections.
3. Ask only human-owned unknowns across outcome, verification, boundaries, and risk tolerance, with at most four questions in the round.
4. Repeat only when the answer exposes another material human decision. The user may say `按默认` at any point to continue.

Do not emit a premature goal during Phase A. Skip directly to Phase B when requirements are concrete or the user asks for a direct/default draft.

### Phase B: Draft, Revise, Finalize

Present the complete platform-rendered draft, invite corrections, and revise it until the user confirms. Put each `/goal` body in a `text` fence with no blank lines inside the fence. After confirmation, output `最终可复制 /goal` plus 字段一览; do not emit another questionnaire.

## Applicability Gate

- Direction undecided or pure divergent exploration: refuse to draft a goal and suggest `/plan` or discussion first.
- Repairable subjectivity: warn, then draft with observable review evidence, a round limit, and a stop-and-report condition.
- Low-risk ambiguity: state defaults and proceed.
- One-line or near-neighbor work: route to the direct workflow rather than manufacturing a goal.

## Fast Interview

Use these choices for a very vague but low-risk task. Include choice 0 only when the platform is ambiguous, and never exceed four choices in one round:

0. 平台：A Claude Code / B Codex
1. 项目形态：A 新建本地 MVP（默认） / B 改现有项目 / C 先做原型
2. 范围：A 核心流程（默认） / B 加常见增强 / C 做完整产品
3. 验证：A 本地运行检查（默认） / B 真机或线上检查 / C 发布前检查

你可以直接回复：按默认，或回复类似 `1B 2A 3C`。

Use open-ended questions only when choices would hide an important decision.

## Targeted Questions

### Outcome

- Is the desired result a code change, a document, a published artifact, a clean repo state, a deployment, or a verified diagnosis?
- Who is the user or reviewer of the final result?
- Is a "first version" acceptable, or does the task require production-ready completeness?
- Is the requested contract short enough for an inline `/goal`, or should the detailed instructions live in a file that the goal points to?

### Verification

- Are there project-provided commands: `package.json` scripts, Makefile targets, `scripts/`, CI config, Xcode schemes, pytest markers, or deployment checks?
- Does the task need live verification: browser screenshot, mobile viewport, API call, GitHub PR status, published URL, or exported file?
- Should the agent add or update tests, or only run existing checks?

### Constraints

- What public behavior, file format, API contract, schema, or UX should stay unchanged?
- Are secrets, credentials, production data, user content, or private notes in scope?
- Is direct push to default branch forbidden?

### Boundaries

- Which directories are allowed?
- Which files, generated artifacts, caches, or unrelated modules must not be touched?
- Are docs, tests, mocks, or fixtures allowed?

### Iteration Policy

- Should the agent make one focused change and rerun checks after each change?
- After repeated failures, should it inspect logs, search docs, reduce to a minimal repro, or pause?
- Is there a soft stop clause for attempts, time, or tokens? For Codex, label the evidence that goal text does not set a runtime budget as `community-observed`; Claude's evaluator-judged soft-boundary behavior is official.
- If the outcome is Trellis task implementation, load `references/trellis-goal-cadence.md` rather than inventing archive order.

### Stop And Pause

- What evidence proves completion strongly enough to stop?
- What blocker requires the user: login, 2FA, paid service, destructive deletion, legal/medical/financial decision, account ownership, or product direction?
- Should partial success be reported with remaining manual steps, or should the agent continue until the full outcome is proven?
- If the goal would exceed the shared 4,000 character limit, is the standard `.planning/goal-<slug>.md` path acceptable? Output its content by default; write only on explicit request.
- Claude Code only: what turn or time bounding clause fits (for example `or stop after 20 turns`), and is every piece of completion evidence something Claude's own output can show in the transcript?

## Phase A Output Shape

```text
我的理解：[outcome and safe assumptions]
项目侦察：[rules, real commands, boundary candidates, dirty state, or the stated discovery fallback]

需要你决定（最多 4 项）
1. [material decision]: A [recommended default] / B [alternative]

你可以直接回复：按默认，或回复类似 1B。
```

## Phase B Draft Shape

````markdown
Recommended Executable Goal

```text
/goal Create a first-version local MVP for the requested task, inspect project-provided commands before changing code, implement the core user-visible workflow, and keep unrelated systems unchanged.
Verification: run the smallest project-provided checks, start the local app or relevant runtime, complete the core workflow once, and capture logs/screenshots or command output as evidence.
Constraints: do not add accounts, paid services, production changes, destructive operations, or unrelated features unless requested.
Boundaries: write only inside the new project directory or the directly related existing project files.
Iteration policy: implement one focused workflow at a time, rerun checks after meaningful changes, inspect logs before retrying, and make at most 3 focused improvement rounds before reporting remaining risks.
Stop when: the core workflow is proven by runtime evidence and checks pass or missing checks are explicitly reported.
Pause if: credentials, payments, production data, destructive changes, legal/medical/financial decisions, copyrighted assets, or unclear ownership is required.
```

Default Reason
- [one concise reason]

Optional Adjustments
1. [decision]: A [recommended] / B [alternative] / C [higher-cost option]

You can reply
- Use defaults, or reply like 1B 2A 3C.
````

## 中文输出形状

中文用户优先用这一版。命令前缀仍然写 `/goal`，不要写 `/目标`。默认先给中文推荐执行版，再给英文兼容版，除非用户明确只要一种语言。S4 把 `/goal` 放进 `text` 围栏；确认后的 S6 再输出 `最终可复制 /goal` 和围栏外 `字段一览`。

````markdown
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

你可以直接回复：按默认，或回复类似 1B 2A 3C。

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
````

S6 after confirmation (see `references/default-goal-strategy.md`):

````markdown
最终可复制 /goal

```text
/goal 基于用户需求创建第一版本地 MVP，先读取项目已有命令和约束，实现核心用户可见流程，并避免改动无关系统。
验证：运行项目提供的最小相关检查，启动本地应用或对应运行环境，完整走通一次核心流程，并用日志、截图或命令输出作为证据。
约束：不加入账号、付费服务、生产变更、破坏性操作或无关功能，除非用户明确要求。
边界：只写入新项目目录，或只修改现有项目中与该功能直接相关的文件。
迭代策略：一次实现一个聚焦工作流，每次有意义改动后重跑检查，重试前先读日志，最多做 3 轮聚焦改进后报告剩余风险。
完成条件：核心流程有运行证据证明可用，检查通过或明确说明缺少配置。
暂停条件：需要凭证、付费、生产数据、破坏性操作、法律/医疗/金融判断、版权素材或所有权不清时暂停。
```

字段一览
1. 目标结果：第一版本地 MVP，核心用户可见流程可走通。
2. 验证：项目最小相关检查、本地运行、日志或截图。
3. 约束：无账号、付费、生产变更或无关功能。
4. 边界：新项目目录或直接相关文件。
5. 迭代策略：一次一个聚焦工作流，最多 3 轮。
6. 完成条件：运行证据证明核心流程可用。
7. 暂停条件：凭证、付费、生产数据或破坏性操作。
````

Keep the interview short. The goal is to reduce ambiguity, not make the user fill out a form.
