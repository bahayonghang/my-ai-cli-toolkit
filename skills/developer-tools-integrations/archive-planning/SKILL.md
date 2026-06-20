---
name: archive-planning
description: Archive root-level planning files (`task_plan.md`, `findings.md`, and `progress.md`) into a timestamped `.plannings/` directory for the current feature. Use when Codex should run `$archive-planning [feature-name]`, close out an active plan, preserve completed planning context, or replace the deprecated Codex prompt workflow with a deterministic skill script.
version: 0.1.0
category: developer-tools-integrations
tags:
  - codex
  - planning
  - archive
  - project-state
argument-hint: "[feature-name]"
allowed-tools: Bash(python *), Bash(py *), Read
---

# Archive Planning

Archive the three active root planning files into one timestamped local folder:

```text
.plannings/<yyyyMMdd-HHmmss>-<feature-slug>/
```

Use the bundled script instead of reimplementing the move logic.

> In the commands below, `<skill-dir>` is this skill's base directory, announced
> when the skill loads. Substitute the literal path; it is not an environment
> variable. The script self-locates, so only the path to it must resolve.

## Run

From the project root:

```bash
python "<skill-dir>/scripts/archive_planning.py" "$ARGUMENTS"
```

If `$ARGUMENTS` is empty, omit it:

```bash
python "<skill-dir>/scripts/archive_planning.py"
```

The script treats the current working directory as the project root.

## Behavior contract

- Require all three root files before doing anything:
  - `task_plan.md`
  - `findings.md`
  - `progress.md`
- If any file is missing, stop, print every missing file, do not create `.plannings/`, and do not move anything.
- If a feature name argument is provided, use it for the archive slug.
- If no feature name is provided, infer it in this order:
  1. first line of `task_plan.md` matching `# 任务计划：xxx` or `# 任务计划: xxx`
  2. first valid content line under `## 目标` in `task_plan.md`
  3. first valid content line under `## 需求` in `findings.md`
  4. current project root directory name
- Move the three files into the archive directory. Do not copy them and do not leave root copies behind on success.
- Keep the operation scoped to those three files only; never archive nested planning files or unrelated notes.

## Output

Success prints the archive directory and moved file list. Failure prints the missing files plus a no-op guarantee.
