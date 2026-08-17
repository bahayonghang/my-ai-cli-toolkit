---
name: managing-git-worktrees
description: 'Manages Git worktrees safely: add, list, remove, prune, lock/unlock. Activates on "git worktree", parallel branch work, or errors like "already checked out".'
---

# Managing Git Worktrees

## Safety Rules (MUST follow)

1. **Never discard uncommitted work** - Check `git -C <path> status --porcelain` before destructive operations
2. **Inspect before mutate** - Run `--dry-run` before `prune`, `list` before `remove`
3. **Avoid `--ignore-other-worktrees`** - Treat as last resort, require explicit confirmation
4. **Quote paths with spaces** - Use forward slashes

## Command Reference

| Task | Command |
|------|---------|
| List all | `git worktree list` |
| List (machine) | `git worktree list --porcelain` |
| Add existing branch | `git worktree add <path> <branch>` |
| Add new branch | `git worktree add -b <new-branch> <path> <start-point>` |
| Add detached | `git worktree add --detach <path> <commit-ish>` |
| Remove (clean only) | `git worktree remove <path>` |
| Prune dry-run | `git worktree prune --dry-run` |
| Prune | `git worktree prune` |
| Lock | `git worktree lock <path>` |
| Unlock | `git worktree unlock <path>` |

## Workflow: Add Worktree for New Task

```bash
git worktree add -b <new-branch> ../wt/<new-branch> <start-point>
git -C ../wt/<new-branch> status
```

If start-point is ambiguous:

```bash
git show-ref --heads --remotes | grep <branch-name>
```

## Workflow: Add Worktree for Existing Branch

```bash
git branch --list <branch>
git worktree list --porcelain
git worktree add <path> <branch>
```

## Error: "branch is already checked out"

Resolution order (safest first):

1. **Use existing worktree** - Check path via `git worktree list --porcelain`
2. **Create new branch** - `git worktree add -b <new-branch> <path> <branch>`
3. **Detached HEAD** - `git worktree add --detach <path> $(git rev-parse <branch>)`
4. **Force (last resort)** - Requires explicit user confirmation:
   ```bash
   git switch --ignore-other-worktrees <branch>
   ```

## Workflow: Cleanup

```bash
git worktree list --porcelain
git -C <path> status --porcelain
git worktree remove <path>
git worktree prune --dry-run
git worktree prune
```

Locked worktree removal (requires explicit confirmation):

```bash
git worktree unlock <path>
git worktree remove <path>
# or force (double --force for locked):
git worktree remove --force --force <path>
```

## Response Guidelines

1. Brief recommendation (1-3 sentences)
2. Copy-paste command block
3. Safety note if destructive
4. Fallback if first attempt may fail
