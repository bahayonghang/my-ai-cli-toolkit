---
description: Archive root planning files into a timestamped .plannings folder
allowed-tools: Read(**), Bash(*)
argument-hint: "[FEATURE_NAME]"
---

## Usage

`/archive-planning [FEATURE_NAME]`

## Objective

Move the active planning files from the current project root into a timestamped archive:

```text
.plannings/<yyyyMMdd-HHmmss>-<feature-slug>/
```

Required root-level files:

- `task_plan.md`
- `findings.md`
- `progress.md`

This prompt archives by **moving** these files. Do not copy them and do not leave the active root-level planning files behind after a successful archive.

## Execution Rules

1. Treat the current working directory as the project root.
2. Read the optional prompt argument as a single feature name:
   - If `$ARGUMENTS` is non-empty after trimming, it overrides automatic detection.
   - If `$ARGUMENTS` is empty, detect the feature name from the planning files.
3. Before creating `.plannings/`, verify that all three required files exist at the project root.
   - If any file is missing, stop.
   - Report every missing file.
   - Do not create an archive directory and do not move any files.
4. Create exactly one archive directory under `.plannings/`.
5. Move the three required files into that directory.
6. Print the archive directory and the moved file list.

## Automatic Feature Name Detection

Use the first valid result from this priority order:

1. The first line of `task_plan.md` when it matches `# 任务计划：xxx` or `# 任务计划: xxx`.
2. The first valid content line under `## 目标` in `task_plan.md`.
3. The first valid content line under `## 需求` in `findings.md`.
4. The current project root directory name.

When scanning a section, stop at the next level-2 heading (`## ...`). Ignore blank lines, Markdown list/checklist markers, comments, horizontal rules, headings, and template placeholders.

Treat a candidate as invalid when it is empty or still looks like a template placeholder, including values such as `xxx`, `TODO`, `TBD`, `待填写`, `待补充`, `功能名`, `项目名`, `<...>`, `{...}`, `示例`, or `请填写`.

## Slug Rules

Convert the selected feature name into a path segment:

- Remove Windows/macOS/Linux path-invalid characters: control characters plus `< > : " / \ | ? *`.
- Collapse all whitespace into a single `-`.
- Trim leading/trailing spaces, dots, and hyphens.
- Preserve Chinese characters and other valid Unicode text.
- If the slug is empty or still a placeholder after sanitization, fall back to the project root directory name and sanitize again.

Use a local timestamp formatted as `yyyyMMdd-HHmmss`. If the computed archive directory already exists, append `-2`, `-3`, etc. until the target is unique.

## Recommended Implementation Notes

- Prefer a small Python or shell script so the preflight check, directory creation, and moves are deterministic.
- Keep the script scoped to the three required files only.
- Do not archive files from nested directories.
- Do not modify unrelated files.

## Output Requirements

On success, print:

- `Archive directory: .plannings/<yyyyMMdd-HHmmss>-<feature-slug>/`
- `Moved files:`
  - `task_plan.md`
  - `findings.md`
  - `progress.md`

On failure, print:

- `Archive aborted: required planning files are missing.`
- The missing file list.
- `No archive directory was created and no files were moved.`
