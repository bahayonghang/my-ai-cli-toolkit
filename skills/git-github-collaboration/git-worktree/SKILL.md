---
name: git-worktree
description: Manage isolated Git worktrees under one repository convention root. Create a new-branch worktree, list trees, remove an owned tree, or show prune candidates after authorization. Checks that the repo .gitignore excludes the worktree root before any git worktree add. Use for 创建 worktree, 隔离工作区, 并行分支 checkout, list/remove/prune worktrees, .worktrees 规范, gitignore 检查. Not for commits (git-commit), pull requests or releases (gh-pr-release), GitHub templates (gh-bootstrap), or adopting someone else's worktree.
category: git-github-collaboration
tags:
  - git
  - worktree
  - isolation
  - agent-aware
version: 0.1.0
allowed-tools: Read, Bash
metadata:
  owner: lyh
  review_cadence: quarterly
  mode: governed
---

In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path. On Windows, `py -3` may replace `python`.

Use this workflow: `inspect -> ignore gate -> plan -> authorized execute -> record`.

## Routing

- Isolation worktree create / list / owned remove / authorized prune: this skill.
- Commit, split, checkpoint: `git-commit`.
- PR, review, merge, CI, Release, tag-build detached worktree: `gh-pr-release`.
- GitHub template bootstrap: `gh-bootstrap`.
- Adopt an existing foreign worktree, or add a worktree for an existing branch: refuse. MVP is `--mode new-branch` only.

If a native harness worktree tool exists, run the helper first. Call the native tool only when inspect/plan JSON already contains `worktree_path` and `ok_to_create=true`. Do not let the native tool pick an unchecked path.

## 1. Inspect

From the repository root:

```text
python "<skill-dir>/scripts/worktree_convention.py" inspect --repo-root <abs-repo> [--explicit-root <rel>] [--branch <name>]
```

Read `resolved_root`, `resolution_reason`, `registered_in_repo_roots`, `already_linked`, `gitignore_covers`, and `write_required`.

If `already_linked` is true and the user asked to create: report the current tree and stop. Do not nest worktrees.

This repository may already have a registered root such as `.claude/worktrees`. Do not invent a second default root.

## 2. Ignore gate (before any add)

Matching authority is `git check-ignore -v -z --stdin`. The helper already runs that.

- `gitignore_covers=true`: continue.
- `write_required=true`: show `proposed_line`. Run `ensure-ignore` without `--apply` first. Apply only after this-turn authorization:

```text
python "<skill-dir>/scripts/worktree_convention.py" ensure-ignore --repo-root <abs-repo> --apply
```

Do not `git add` or `git commit` the ignore line. If apply fails, stop. Global excludes or `.git/info/exclude` alone are not enough.

## 3. Plan create (new-branch only)

```text
python "<skill-dir>/scripts/worktree_convention.py" plan-create --repo-root <abs-repo> --mode new-branch --branch <name> [--start-point <ref>] [--owner <id>]
```

Execute `argv` only when `ok_to_create` is true. The argv is `git worktree add -b <branch> <path> <start-point>`. Do not add `--force` or `--ignore-other-worktrees`.

After a successful add:

```text
python "<skill-dir>/scripts/worktree_convention.py" record-meta --repo-root <abs-repo> --mode new-branch --branch <name> --owner <id>
```

## 4. List, remove, prune

```text
python "<skill-dir>/scripts/worktree_convention.py" plan-list --repo-root <abs-repo>
python "<skill-dir>/scripts/worktree_convention.py" plan-remove --repo-root <abs-repo> --path <path> [--owner <id>]
python "<skill-dir>/scripts/worktree_convention.py" plan-prune --repo-root <abs-repo>
```

Remove only when `ok_to_remove` is true. The helper uses `git status --porcelain -uall`, exact registered-path match, lock, in-progress Git state, submodule, and owner checks.

`plan-prune` always sets `ok_to_prune=false`. Show `dry_run_output`. Run `git worktree prune` only after this-turn authorization for those exact candidates.

## 5. Report

Report the absolute path, branch, resolution reason, ignore source, argv that ran, and any `missing evidence`. Do not claim a Production or Governed verification unless the matching report file exists.

## References

- [references/convention.md](references/convention.md) for root resolution and the ignore gate
- [references/safety.md](references/safety.md) for ownership, remove/prune, permissions, and rollback
