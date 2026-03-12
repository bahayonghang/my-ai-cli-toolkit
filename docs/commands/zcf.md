# ZCF Git Utility Commands

Git workflow utilities for branch management, rollback operations, worktree handling, and project initialization.

## Commands

### `git-cleanBranches`

**Description**: Safely find and clean merged or stale Git branches with dry-run support.
**Usage**: `/zcf:git-cleanBranches [--base <branch>] [--stale <days>] [--remote] [--force] [--dry-run] [--yes]`

Discovers branches that have been merged into the base branch or are older than the stale threshold. Supports custom base branch, protected branch lists, remote branch cleanup, and a dry-run mode for safe preview before deletion.

### `git-rollback`

**Description**: Interactively rollback a Git branch to a historical version.
**Usage**: `/zcf:git-rollback [--branch <branch>] [--target <rev>] [--mode reset|revert] [--depth <n>] [--dry-run] [--yes]`

Lists branches, shows version history, and requires confirmation before executing. Supports both `reset` (rewrite history) and `revert` (preserve history) modes. The `--depth` flag controls how many commits to display.

### `git-worktree`

**Description**: Manage Git worktrees with smart defaults and IDE integration.
**Usage**: `/zcf:git-worktree <add|list|remove|prune|migrate> [path] [-b <branch>] [-o|--open] [--track] [--guess-remote] [--detach] [--checkout] [--lock] [--migrate-from <source-path>] [--migrate-stash]`

Creates worktrees in a sibling directory (`../.zcf/{project}/`). Supports IDE auto-open (`-o`), content migration from other paths, stash migration, and standard git worktree operations (list, remove, prune).

### `init-project`

**Description**: Initialize project AI context with root-level and module-level CLAUDE.md indexes.
**Usage**: `/zcf:init-project <project summary or name>`

Analyzes the project structure and generates CLAUDE.md files at the root and module levels, providing AI assistants with structured project context for better code understanding.

## Examples

```bash
# Preview stale branch cleanup
/zcf:git-cleanBranches --stale 30 --dry-run

# Clean merged branches with confirmation
/zcf:git-cleanBranches --base main --yes

# Rollback with revert (safe for shared branches)
/zcf:git-rollback --branch feature/auth --mode revert

# Create a worktree and open in IDE
/zcf:git-worktree add -b feature/new-api -o

# Initialize AI context for a project
/zcf:init-project "E-commerce platform with microservices"
```

## Notes

- `git-cleanBranches` defaults to dry-run mode for safety; use `--yes` to skip confirmation.
- `git-rollback` always requires confirmation unless `--yes` is passed.
- Worktrees are created at `../.zcf/{project-name}/` to keep the main repo clean.
- `init-project` generates CLAUDE.md files that help AI assistants understand project structure.
