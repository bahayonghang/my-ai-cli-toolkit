---
name: file-sorter
description: "Use when the user wants to categorize, sort, organize, or suggest renames for files in a local folder such as Downloads, or for files that share one parent directory. Builds a review plan with stable file-family categories, optional whitelist, project-root protection, and dry-run apply; moves or renames only after explicit approval of that plan. Use for 整理文件, 分类归档, Downloads 整理, 重命名建议, 审阅后再移动. Do not use for Git worktree isolation, Windows process cleanup, repository source-layout refactors, duplicate deletion, cloud-drive sync, or installing the AI File Sorter desktop app."
category: developer-tools-integrations
tags:
  - files
  - organize
  - categorize
  - rename
  - dry-run
version: 0.1.0
argument-hint: [path]
allowed-tools: Read, Glob, Grep, Bash(python *), Bash(py *)
metadata:
  owner: lyh
  review_cadence: quarterly
  mode: governed
---

In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path. On Windows, `py -3` may replace `python`.

Default: scan and assemble a review plan. `--execute` is forbidden until the user approves the shown `plan_id` in this turn.

## Routing

- Local folder / same-parent files, categorize, organize, rename suggestions: this skill.
- Windows dev process cleanup: `windows-dev-process-cleanup`.
- Git worktree create/list/remove: `git-worktree`.
- Commit: `git-commit`.
- Repository source-layout refactors, duplicate deletion, Drive sync, PARA cabinets: refuse.

## Workflow

1. Scan (absolute `--root` only):

```text
python "<skill-dir>/scripts/file_sorter.py" scan --root <abs> [--recursive] [--output <scan.json>]
```

If `ok_to_scan` is false, report `skipped` and stop.

2. Propose `category` / `subcategory` / optional `suggested_name` from [taxonomy.md](references/taxonomy.md). Use document excerpts only when the name is vague (max about 8000 characters). Use an image description only when the host already has vision. Screenshots describe on-screen content; do not label ordinary images as Installers or Operating Systems. Do not compute `target_dir`.

3. Assemble:

```text
python "<skill-dir>/scripts/file_sorter.py" assemble-plan --scan <scan.json> --proposals <proposals.json> [--mode more-consistent|more-refined] [--operation categorize|rename|categorize-and-rename] [--whitelist <whitelist.json>] [--output <plan.json>]
```

Default mode is `more-consistent`. Default operation is `categorize`.

4. Show `plan_id`, items, rejected, skipped. Preview apply:

```text
python "<skill-dir>/scripts/file_sorter.py" apply --plan <plan.json>
```

5. After this-turn approval of that `plan_id`:

```text
python "<skill-dir>/scripts/file_sorter.py" apply --plan <plan.json> --execute
```

6. Undo with the sidecar from `undo_path` only after showing it and getting approval:

```text
python "<skill-dir>/scripts/file_sorter.py" undo --undo <plan.undo.json> --execute
```

Do not call `mv`, `Move-Item`, or delete user files. Helper default is dry-run.

## Output

Report `plan_id`, `ok_to_apply`, destination paths, skipped reasons, and whether apply was dry-run or executed. Mark install proof, provider comparison, and human blind review as `missing evidence`.

## Resources

- [taxonomy.md](references/taxonomy.md)
- [scan-safety.md](references/scan-safety.md)
- [review-apply.md](references/review-apply.md)
- [naming.md](references/naming.md)
