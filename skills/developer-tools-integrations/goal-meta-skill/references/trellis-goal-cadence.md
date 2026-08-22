# Trellis Goal Cadence

Optional adapter. Load this file only when the `/goal` outcome is Trellis
task or child-task implementation. Do not inject this cadence into ordinary
code or doc work just because `.trellis/` exists.

This skill only drafts `/goal` text. It does not run commits or
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

## File-pointer goals

If the contract is in `.planning/goal-<slug>.md`, put this cadence in that
file's Contract section. The short `/goal` still points at Verification
and Stop/Pause in that file.
