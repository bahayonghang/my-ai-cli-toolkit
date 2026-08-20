# Worktree convention

## Root resolution

Resolve paths from `git rev-parse --show-toplevel`. Compare realpath results. The final root must stay inside that repository.

Order:

1. A legal `--explicit-root`
2. Roots derived from linked worktrees already registered inside the repository (`git worktree list --porcelain`)
3. Existing known directories, in this order: `.worktrees/`, `.claude/worktrees/`, `.agents/worktrees/`, `worktrees/`
4. Default `.worktrees/`

If any registered or existing in-repo root is present, do not invent a second default root. When several registered roots exist, prefer the known-directory order above.

`--explicit-root` must be a relative path. Reject absolute paths, `.` / `..` segments, `.git`, repository-root itself, and symlink or realpath escape.

Slug: replace `/` and `\` in the branch name with `-`. Reject empty names, `.`, `..`, and leftover separators.

Worktree path: `<repo>/<resolved_root>/<slug>`.

## Ignore gate

Matching authority:

```text
git check-ignore -v -z --stdin
```

The helper writes `<resolved_root>/` plus a NUL to stdin. A pass requires:

1. `check-ignore` succeeds
2. The source file is a `.gitignore` inside the repository
3. The source is not `.git/info/exclude` and not `core.excludesFile`

Do not hand-write a gitignore matcher. Parent rules such as `.agents/` covering `.agents/worktrees/` count only when `check-ignore` says they match.

`ensure-ignore` without `--apply` only prints `proposed_line`. `--apply` snapshots the current bytes, appends `<resolved_root>/`, and restores the snapshot if the gate still fails.

`plan-create` calls the same apply path when `write_required` is true and the caller is not already in a linked worktree. A create request is enough authorization for that one-line append. The JSON field `ignore_wrote` records whether this invocation wrote. Do not stage or commit that line.

## Create mode

MVP accepts only `--mode new-branch`. The planned argv is:

```text
git worktree add -b <branch> <path> <start-point>
```

Refuse: missing mode, any other mode, existing local branch, existing remote-tracking branch of the same name, path already present, path already registered, ignore gate still failing after apply, unresolved start-point.

Default start-point: `refs/remotes/origin/HEAD` when it resolves, else local `main`, else local `master`. Do not silently use `HEAD`.
