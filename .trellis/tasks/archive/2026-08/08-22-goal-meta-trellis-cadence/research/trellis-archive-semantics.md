# Trellis archive semantics (evidence for goal-meta-skill)

Date: 2026-08-22. Source: this repository's Trellis scripts and workflow.

## Archive command

`python ./.trellis/scripts/task.py archive <task-dir>` is implemented by
`cmd_archive` in `.trellis/scripts/common/task_store.py`.

Observed behavior:

1. Writes `status=completed` and `completedAt` on the task.
2. Moves the task directory from `.trellis/tasks/<name>/` to
   `.trellis/tasks/archive/<year-month>/<name>/`.
3. Unless `--no-commit` or `session_auto_commit: false`, runs
   `_auto_commit_archive` and creates a `chore(task): archive ...` commit
   scoped to the archived task paths (and any child `task.json` files it
   edited).
4. If this task has `children`, archive sets each still-findable child's
   `parent` field to `null` before the parent directory moves.

Evidence anchors:

- Workflow contract: `.trellis/workflow.md` — `task.py archive` writes
  `status=completed`, moves the directory, and auto-commits; Phase 3.4
  requires work commits first, then archive, then journal.
- Finish-work skill: `.agents/skills/trellis-finish-work/SKILL.md` — code
  commits are Phase 3.4; archive is a later auto-commit; dirty product
  files must be committed before archive.
- Parent unlink: `.trellis/scripts/common/task_store.py` `cmd_archive`
  (`If this is a parent, clear parent field in all children`).
- Child progress: `.trellis/scripts/common/tasks.py` `children_progress`
  treats a child missing from the active set as done.

## Implication for generated `/goal` text

- Product commits for a leaf or child task must land before `task.py archive`.
- Archiving a parent while children are still active clears `parent` on those
  children and moves the parent path. Parent archive belongs after the
  parent-level 发布门, after every child has been archived on its own.
- The archive commit is owned by `task.py archive`. The executing agent must
  not fold product edits into that commit, and must not `git add -f .trellis/`.
