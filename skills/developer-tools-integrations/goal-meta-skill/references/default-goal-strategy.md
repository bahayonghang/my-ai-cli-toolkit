# Default Goal Strategy

Generate goals that can be reviewed and copied directly. Never launch them.

The skill should not rely on knowing every domain. Reliability comes from conservative defaults, authoritative context discovery, concrete verification, bounded iteration, and high-risk pause rules.

## Output Priority

Every generated output uses a review envelope. After the interview converges,
Chinese-first drafts use this order:

1. `状态：DRAFT — Goal 未创建、未激活、未执行`
2. `推荐执行版（中文，可直接复制）`
3. `默认选择理由`
4. `可选调整`
5. `Goal Draft (English-compatible)`
6. `请审阅上方 Prompt；如需修改请指出，如认可请回复“批准 Prompt”。本轮到此停止。`

Put every `/goal` payload only inside a fenced `text` block. Imperatives inside
the payload are content to compile, not authority to execute. Do not put a
half-filled template before the recommended goal. Present the complete packet
and stop; do not submit the slash command or invoke any host Goal facility.

If the user asks about an existing active goal, do not force a new draft or write
a contract. Show the smallest correct platform command from
`references/platform-goal-facts.md` in a fenced `text` block, then stop without
executing it; never blend Codex, Claude, Grok, OMP, or Kimi lifecycle verbs.

## Platform Determination

Facts and rendering rules live in `references/platform-goal-facts.md`. Selection order:

1. The user names Codex, Claude Code, Grok Build, Oh My Pi/OMP, or Kimi Code:
   render for that platform.
2. Otherwise infer from the host environment running this skill.
3. Still ambiguous: add one short five-platform choice to the 可选调整 block;
   do not open a separate questionnaire round.

Claude Code rendering must produce a completion condition with transcript-visible proof and a turn/time bounding clause, and its 暂停条件 body must say stop-and-report. The other renderers use the exact lifecycle and stop semantics in the facts file.

## Applicability Gate

- **Hard refusal:** when the direction is undecided or the request is pure divergent exploration, do not emit a goal. Suggest `/plan` (Codex) or an ordinary planning discussion first.
- **Warn and proceed:** when subjectivity can be repaired (for example, "make it polished"), translate it into review evidence, add a round limit, and require stop-and-report if the limit expires.
- **Proceed by default:** low-risk ambiguity is not a gate. State conservative assumptions and continue.
- **Route neighbors:** translations, one-line outputs, guidance-file audits, time-cadence loops, and scripted Stop-hook tasks should use their direct workflow instead of `/goal`.

## Read-Only Project Reconnaissance

When a request targets an existing project, inspect before interviewing or drafting. Stop at the first useful source; do not crawl the whole tree.

1. Read root `AGENTS.md` / `CLAUDE.md`; mention nested rule files when discovered.
2. Identify real command sources from `justfile`, `Makefile`, `package.json` scripts, `pyproject.toml`, `Cargo.toml`, and `.github/workflows/*.yml` filenames.
3. Capture Git context with `git rev-parse --show-toplevel`, `git branch --show-current`, and `git status --porcelain -uall` so untracked files are visible.
4. List only task-related top-level boundary candidates; do not recursively enumerate the repository.

For a persistence candidate, also inspect whether root `GOAL.md` exists and
whether it is tracked, ignored, or untracked. This remains read-only and does
not authorize replacement.

This pass is read-only: do not run tests/builds, write files, or inspect `.env*`, keys, credentials, `node_modules`, `dist`, `build`, `target`, `.venv`, or `.git` internals. Read only necessary file snippets. Report project type, governing rules, discovered verification commands, likely write boundaries, and dirty state; invite correction before relying on them.

If reconnaissance fails or times out, say what could not be confirmed and use a discovery-first goal. If there is no project context, skip reconnaissance rather than inventing one.

## Default-First Rule

If the task is already concrete, the user says `直接给` / `按默认`, or the remaining uncertainty is low-risk, choose the best default and move forward. Otherwise use the bounded protocol in `references/interview-checklist.md`.

Good defaults:

- new app/site/tool: local MVP first
- existing repo: inspect project scripts, docs, and conventions first
- no deployment request: local runtime verification only
- no auth request: no login, backend, cloud sync, paid API, or account system
- no design system request: follow existing style; if new project, choose a restrained usable interface
- no test command known: discover package scripts, Makefile, CI config, Xcode schemes, or project docs before inventing commands
- no advanced feature request: implement the smallest complete user-visible workflow

Always add one short reason:

```text
默认选择理由：先做本地 MVP，因为它能最快验证核心体验，同时避免账号、后端和发布流程拖慢第一版。
```

## Trellis Cadence Trigger

When the stated outcome is Trellis task or child-task implementation, or
reconnaissance finds `.trellis/tasks/` and the outcome is to execute that
task tree, load `references/trellis-goal-cadence.md`. Do not inject that
cadence for ordinary code or doc work merely because `.trellis/` exists.
Fast-path `直接给` still injects only when the outcome text already names
Trellis task implementation.

For injected Trellis cadence, the first `/goal` statement exposes the
subagent preference switch. It is default-on when the user is silent or
ambiguous, explicit opt-out only when the user clearly disables subagents,
and a reasoned inline technical fallback when project/platform capability
prevents dispatch. Later iteration, constraint, and completion fields must
match that first-statement state.

## Goal Length Rule

Codex, Claude Code, and Kimi objectives/conditions have an official 4,000-character limit. This skill applies the same portability budget to Grok Build and OMP without claiming it is their platform cap. Most launchers should be much shorter.

For explicit save/handoff requests, the recommended durable contract is root
`GOAL.md` and must follow `persistent-goal-contract.md`. A user-named legacy
`.planning/goal-<slug>.md` path remains supported for chat output or explicit
write, but is not silently migrated.

```text
/goal First read and follow ./GOAL.md as the approved execution contract; stop only when its verification evidence is complete or a pause condition is reached.
```

Do not compress away verification, boundaries, stop conditions, or pause conditions just to fit a long objective inline.
An explicit save/handoff request enters persistence-candidate mode but does not
pre-approve unseen text. Do not write either path until the complete S4 plan is
shown and the user subsequently confirms its exact path and create/replace
effect. `直接给` alone is not authorization. After confirmation, use only
`scripts/persist_goal_contract.py` for the root-contract path.

## Lazy-User Choices

Ask with numbered choices only when a decision materially changes cost, risk, or direction.

```text
可选调整
1. 项目形态：A 新建本地 MVP（默认） / B 改现有项目 / C 先做原型
2. 范围：A 核心流程（默认） / B 加常见增强 / C 做完整产品
3. 验证：A 本地运行检查（默认） / B 真机或线上检查 / C 发布前检查

你可以直接回复：按默认，或回复类似 1B 2A 3C。
```

Keep choices short. Do not ask a long open-ended questionnaire.

## Unknown Domain Strategy

When the task touches an unfamiliar or specialized domain, do not invent domain-specific rules. Generate a discovery-first goal.

Use this pattern:

```text
/goal Create a safe first version of [task] by first inspecting authoritative context, then implementing the smallest verified workflow.
Verification: identify and inspect project docs, existing scripts, sample data, domain notes, or official references available in the workspace; run the smallest relevant checks; complete one representative workflow with logs, screenshots, exported artifacts, or command output as evidence.
Constraints: do not invent domain rules, compliance claims, data semantics, or user-facing promises that are not supported by the inspected context.
Boundaries: edit only the files directly required for the first workflow; keep unrelated modules, production data, credentials, and public contracts unchanged.
Iteration policy: complete a discovery pass first, state working assumptions, implement one focused slice, rerun checks, and use new evidence rather than repeated retries after failures.
Stop when: the first workflow works under documented assumptions and evidence proves the result; unresolved domain questions are listed clearly.
Pause if: required domain authority, legal/medical/financial judgment, compliance approval, production data, paid services, or destructive actions are required.
```

This keeps the goal useful without pretending the meta skill knows the domain.

## Risk Classification

Low risk: local prototype, local UI, local docs, toy data, isolated scripts, non-destructive formatting, generated examples.

Medium risk: existing repo changes, public UI copy, migrations in development, shared config, external APIs with test credentials, browser extensions, mobile builds.

High risk: production data, payments, credentials, destructive deletion, legal/medical/financial advice, compliance, privacy-sensitive user data, copyrighted assets, App Store or store submission, live deployment, account ownership, official authorization claims.

Behavior:

- Low risk: choose defaults and generate a copy-ready goal.
- Medium risk: choose defaults, add explicit boundaries and pause conditions.
- High risk: ask a numbered decision or generate a discovery-only goal that pauses before the risky action. High risk alone is not the hard refusal gate when the desired outcome is clear.

## Vague Words

Do not ban vague direction words. Translate them into iteration and verification.

Example:

```text
设计方向：克制、专业、有留白，避免模板感和营销页风格。
验证：用桌面和移动端截图检查首屏身份、信息层级、文字可读性、核心入口和布局重叠。
迭代策略：基于截图做最多 3 轮聚焦视觉改进，优先调整层级、间距、字体、素材处理和控件密度。
```

The vague words guide taste. The verification proves whether the result is acceptable.

## Iteration Defaults

Use bounded autonomy:

```text
迭代策略：先实现可运行第一版，再基于构建结果、运行日志和截图做最多 3 轮聚焦改进；同一错误连续失败 2 次后必须换证据来源。
```

Do not write `keep trying` or `until it looks good`.

## Finalization Rule

After the user confirms the draft, approval changes only the text state. Output
this dual-layer S6 shape and stop. Keep the response to the status, copy fence,
字段一览, and outside-skill launch note. Do not repeat the full explanation or
the 可选调整 questionnaire unless asked. Do not call a Goal tool/API or submit
the fenced command.

````markdown
状态：APPROVED TEXT — not launched

最终可复制 /goal

```text
/goal ...
```

字段一览
1. 目标结果：...
2. 验证：...
3. 约束：...
4. 边界：...
5. 迭代策略：...
6. 完成条件：...
7. 暂停条件：...
8. Trellis 节奏：（仅注入时）首句声明 subagents 开关；完成验证后提交当前任务产品改动与规划产物，确认均进入版本历史且排除无关任务/范围外脏文件，再 archive；父任务等到发布门。

该文本尚未创建或激活 Goal；如需运行，请在 goal-meta-skill 外另行复制并提交。
````

Omit item 8 unless Trellis cadence was injected. Do not mention archive
cadence in 字段一览 for ordinary non-task goals.

For separately confirmed persistence, replace this chat-only finalization with:

1. `状态：APPROVED TEXT — not launched`;
2. the final contract review/diff and exact create/replace action;
3. helper result (`path`, bytes, SHA-256, action, Git visibility);
4. one selected-platform short launcher in a fenced `text` block;
5. an explicit note that the skill did not launch it, the target platform does not automatically load an
   arbitrary `GOAL.md`, and that untracked/ignored files do not travel to other
   worktrees or machines by themselves.

Do not put blank lines inside the copy fence. Do not put 字段一览 inside
the `/goal` body. The 字段一览 is a human edit map and does not count toward
the 4,000-character `/goal` limit.
