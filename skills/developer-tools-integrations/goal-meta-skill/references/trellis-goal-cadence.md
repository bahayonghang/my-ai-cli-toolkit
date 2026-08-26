# Trellis Goal Cadence

Optional adapter. Load this file only when the `/goal` outcome is Trellis
task or child-task implementation. Do not inject this cadence into ordinary
code or doc work just because `.trellis/` exists.

This skill drafts `/goal` text and may persist an explicitly approved contract.
It does not execute the contract's commits or
`python ./.trellis/scripts/task.py archive`.

Archive facts used here (do not copy Trellis script internals into
`SKILL.md`): `task.py archive` writes `status=completed`, moves the task
directory into `.trellis/tasks/archive/`, and unless disabled creates its
own archive commit. If a parent that still lists children is archived, it
clears `parent` on children that can still be found. Distilled from
`trellis-archive-semantics.md` in task `08-22-goal-meta-trellis-cadence`.

## Detection

Inject when any of these hold:

1. The user names Trellis task implementation, a child task, or a
   `.trellis/tasks/` directory.
2. Read-only reconnaissance finds `.trellis/workflow.md` or
   `.trellis/tasks/` and the stated outcome is to execute that task tree.

Do not inject when `.trellis/` is only present and the outcome is an
ordinary bug fix, doc edit, or other non-task work.

If detection is uncertain, add one numbered choice to the existing
可选调整 block instead of a new interview round:

`注入 Trellis 提交归档节奏：A 是（默认，当 outcome 是实施任务时） / B 否`

Fast-path `直接给` / `按默认` stays conservative: inject only when the
outcome text already says Trellis task implementation.

## Sub-agent dispatch

Last verified: 2026-08-25.

These are Trellis facts, not `/goal` lifecycle facts. Do not copy them
into `platform-goal-facts.md`. Do not copy Trellis script internals into
`SKILL.md`.

Dispatch uses the same Detection gate as commit-then-archive. Inject
only when the outcome is Trellis task or child-task implementation.
Presence of `.trellis/` alone is not a reason.

This skill must not assert that a target project has a given agent.
Generated `/goal` text must require the executing agent to read that
project's `.trellis/workflow.md` Phase 2.1 / 2.2 first, and to confirm
the actual dispatch protocol and agent names.

| Platform | Dispatch shape | Evidence |
| --- | --- | --- |
| Claude Code | `Task` / `Agent` tool; `subagent_type` is `trellis-implement` / `trellis-check` / `trellis-research` | `local-probe`: this machine has `.claude/agents/trellis-*.md`; `workflow.md:475-488` lists Claude Code in the dispatch group |
| Codex | `.trellis/config.yaml` `codex.dispatch_mode`: `auto` dispatches, `inline` does not | `local-probe`: this machine's `config.yaml:125-145` records default `auto` and `inline` |
| Oh My Pi | Dispatch group; agent names match Claude Code | `local-probe`: `.trellis/workflow.md` dispatch group (`:475-488`) |
| Grok Build | `spawn_subagent` with `subagent_type` set to the Trellis agent name | `local-probe`: `.trellis/workflow.md` platform note (`:223`) and pull group (`:490-502`) |
| Kimi Code | Built-in `coder` / `explore` sub-agents with `.kimi-code/skills/trellis-<role>/SKILL.md` | `local-probe`: `.trellis/workflow.md` platform note (`:223`) and pull group (`:490-502`) |

No row in this table uses the `official` evidence label. Platform
documentation does not define Trellis agent names. The table samples one
project's `.trellis/workflow.md`.

### Generated `/goal` fields

Put dispatch into three fields. Do not add dispatch to `暂停条件` /
`Pause if`. A missing agent or unsupported platform is a reconnaissance
finding: switch to the inline shape before implementation. It is not a
runtime pause event.

**`迭代策略` / Iteration policy** — who runs, in what order, and what to
read first:

先读 `.trellis/workflow.md` 的 Phase 2.1 / 2.2 确认本项目派发协议与
agent 名；一次完成一个可独立验收的 Trellis 任务，代码实施派发
`trellis-implement`、验证派发 `trellis-check`；然后用 Conventional
Commits 提交该任务相关产品文件；再运行
`python ./.trellis/scripts/task.py archive` with the concrete task
directory.

**`约束` / Constraints** — who may write product files:

主会话不直接 Edit/Write 产品文件；产品改动由 `trellis-implement` 完成。

Put that sentence in `Constraints`, not in `Boundaries`. Who writes is a
behavior constraint, not a path permission.

**`完成条件` / Stop when** — dispatch evidence. Codex may cite commands
and artifacts. Claude Code evidence must be transcript-visible:

每个任务的代码实施由 `trellis-implement` 完成、验证由 `trellis-check`
完成，派发记录出现在对话中。

### Inline exceptions

Do not inject dispatch clauses when any of these hold:

1. The target platform is in that project's `workflow.md` inline group
   (this machine: `codex-inline`, Kilo, Antigravity, Devin).
2. The target platform is Codex and `.trellis/config.yaml`
   `codex.dispatch_mode` is `inline`.
3. The user explicitly asks the main session to implement inline.

On an exception, `迭代策略` uses that project's inline shape (this
machine: `trellis-before-dev` → edit → `trellis-check`). `约束` must not
forbid the main session from editing product files.

## Commit then archive

Encode in `迭代策略` / Iteration policy and `完成条件` / Stop when:

1. Finish one independently verifiable Trellis task (leaf or child).
2. Commit that task's related product files. Use Conventional Commits.
   Do not push. Do not amend. Limit the commit to that task's files.
3. Then run `python ./.trellis/scripts/task.py archive` with the concrete
   task directory, for example
   `python ./.trellis/scripts/task.py archive .trellis/tasks/08-22-checkout-discount`.
4. Repeat for the next child.

Write the concrete task directory in the executable `/goal`. Do not leave
placeholder tokens.

The archive commit belongs to `task.py archive`. The executing agent must
not fold product files into that commit, and must not force-add `.trellis/`
with `git add -f .trellis/`. Encode that prohibition in `约束` /
Constraints of the generated `/goal`.

## Parent and 发布门

Archiving a parent while children remain active sets those children's
`parent` field to `null` and moves the parent directory. Do not archive
the parent until all of these hold:

1. Every child has been archived on its own.
2. Direct parent-task product changes, if any, are already committed.
3. The 发布门 in this same contract has passed, or missing checks are
   reported and the agent pauses (Codex) or stops and reports (Claude Code).

Write that deferral in `约束` / Constraints and `完成条件` / Stop when:
parent archive waits until 发布门 because it would clear child `parent`
links. 发布门 means the parent-level verification or release check named
in the goal. Use reconnaissance commands. User-named checks win. When
this repository names no extra check, default to `just ci`.

发布门 is not "archive the parent as soon as children finish". It is not
"wait for a GitHub Release", unless this goal is itself a release task.

## Pause text

`暂停条件` / `Pause if` must include:

- dirty files outside the current task scope
- archive auto-commit failure
- a request to archive a parent that still has active children (that
  archive would set those children's `parent` field to `null`)
- a request to run `git add -f .trellis/`
- the usual credential, production-data, and destructive-operation blockers

Claude Code: keep the `暂停条件` / `Pause if` label, write the body as
stop-and-report, and keep a turn/time bounding clause. Do not recommend
`/goal pause` or `/goal resume`.

Codex: pause is valid.

## Persisted and legacy file-pointer goals

For root `GOAL.md`, Required reading must link the concrete task's `prd.md`,
`design.md`, and `implement.md`. Put commit-then-archive in Iteration policy and
Completion conditions, and keep the named parent 发布门. Also put the dispatch
clauses from Sub-agent dispatch into Iteration policy, Constraints, and
Completion conditions, unless an inline exception applies. The contract remains a
compressed handoff; current Trellis artifacts stay authoritative.

If the user explicitly keeps a legacy `.planning/goal-<slug>.md`, put the same
cadence in that file's Contract section. The short `/goal` points at
Verification and Stop/Pause in the selected file.
