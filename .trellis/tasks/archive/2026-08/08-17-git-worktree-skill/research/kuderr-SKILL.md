---
name: git-wt
description: >
  Fast git worktree manager. Use when the user wants to create, list, switch
  between, or clean up git worktrees. Handles parallel development workflows,
  agent isolation, and multi-branch work.
allowed-tools: Bash(git wt *)
---

# git-wt — Git Worktree Manager

`git-wt` manages isolated git worktrees stored globally at `~/.git-wt/<repo>/<name>/`.
Worktrees live outside the repo — no `.gitignore` changes needed.

## Prerequisites

`git-wt` must be installed and in PATH. Verify with `git wt --version`.

If not installed, ask the user to install it themselves.

## Commands Reference

### Create a worktree
```bash
git wt new                           # Auto-named; .env* + AI sessions copied by default
git wt new my-feature                # Named
git wt new -b main hotfix            # Fork from specific branch
git wt new --no-copy-env experiment  # Opt out of .env* copy
git wt new --no-copy-ai scratch      # Opt out of AI session copy/save
git wt new --no-branch scratch       # Detached HEAD (no branch created)
```

### Check out an existing branch
```bash
git wt checkout feature/login              # Local branch → worktree (.env* + AI copied by default)
git wt checkout origin/fix/bug-42          # Remote → local tracking branch → worktree
git wt checkout fix/bug-42                 # Auto-detects from remote
git wt checkout feature/login my-fix       # Custom worktree name
git wt checkout --no-copy-env feature/api  # Opt out of .env* copy
```

### Navigate to a worktree
```bash
cd $(git wt path <name>)             # Jump into worktree
git wt open <name>                   # Open in Cursor/VS Code/$EDITOR
```

### List worktrees
```bash
git wt list                          # Worktrees for current repo (managed + external)
git wt list-all                      # Managed worktrees across ALL repos
```

External worktrees (created via `git worktree add`) appear with `[external]` tag.

### Adopt an external worktree
```bash
git wt adopt my-hotfix               # Adopt by name from list
git wt adopt ../my-hotfix            # Adopt by path (name = basename)
git wt adopt /tmp/wt/fix fix-login   # Adopt with custom name
```

Moves an external worktree under `~/.git-wt/` management.

### Find the main repo
```bash
git wt origin                        # Print main repo path (from any worktree)
```

### Remove worktrees
```bash
git wt rm <name>                     # Remove managed worktree + delete its branch
git wt clean                         # Remove all managed worktrees for current repo
```

`rm` only works on managed worktrees (under `~/.git-wt/`). For external worktrees, run `git wt adopt` first.

## Key Details

- **Storage**: `~/.git-wt/<repo>/<name>/` — outside the repo, globally managed
- **Branches**: prefixed `wt/` by default (e.g., `wt/my-feature`)
- **Naming**: auto-generates `adjective-noun` names if no name given
- **`rm`**: only works on managed worktrees — removes directory and deletes its branch
- **`adopt`**: moves an external worktree under `~/.git-wt/` so git-wt fully manages it
- **External worktrees**: `list`, `path`, `open` work with worktrees created outside git-wt
- **`checkout`**: checks out an existing branch (local or remote) into a managed worktree — does NOT create new branches
- **`.env*` copy**: enabled by default — copies `.env*` files from repo root into the new worktree directory (local filesystem only). Disable with `--no-copy-env` per run or `GIT_WT_COPY_ENV=false`.
- **AI session preservation**: enabled by default. On create: copies the complete repo-local `.claude` directory (including untracked skills, agents, and hooks) and seeds origin's Claude + Codex sessions into the worktree (history visible in `/resume` and `codex resume` there). On rm: merges wt's Claude sessions back to origin (wt continuations win), discards seeded Codex copies, rebinds genuine wt-created Codex sessions to origin, syncs settings back. Local filesystem only. Disable with `--no-copy-ai` per run or `GIT_WT_COPY_AI=false`.
- **`origin`**: prints main repo path — works from any worktree or main repo itself

## Environment Variables

- `GIT_WT_HOME` — Root directory for all worktrees (default: `~/.git-wt`)
- `GIT_WT_PREFIX` — Branch name prefix (default: `wt`)
- `GIT_WT_COPY_ENV` — Copy `.env*` files on new (default: `true`)
- `GIT_WT_COPY_AI` — Copy AI configs on new, save sessions on rm (default: `true`)
- `GIT_WT_AI_COPY_PATHS` — Colon-separated repo-relative files/directories copied by `--copy-ai` (default: `.claude`; empty disables project-file copying)
- `GIT_WT_AI_PROVIDERS` — Space-separated AI providers to manage (default: `claude codex`)

## When to Use

Use `git wt new` when:
- Working on a separate task that needs isolation from current work
- Running parallel agents that each need their own repo copy
- Experimenting without affecting the current branch
- Needing to quickly switch context between features

Defaults you get for free (no flags):
- `.env*` files from the repo root are copied into the worktree — dev servers that need env vars start immediately
- The complete repo-local `.claude` directory is copied into the worktree on create, including ignored or untracked settings, skills, agents, and hooks. Files checked out from Git are not overwritten. Customize the paths with `GIT_WT_AI_COPY_PATHS='.claude:.agents:.cursor/rules'`.
- On `new`, origin's Claude sessions are seeded into the worktree (cwd rewritten) and origin's Codex rollouts are duplicated with fresh UUIDs/cwd — `/resume` and `codex resume` in the worktree pick up the same history
- On `rm`, Claude session files are merged back to origin (newer wt continuations replace origin's version), the seeded Codex copies are discarded, and genuine worktree Codex sessions get their `cwd` rebound to origin

Use `--no-copy-env` / `--no-copy-ai` (or set `GIT_WT_COPY_ENV=false` / `GIT_WT_COPY_AI=false`) when:
- You want a fully clean worktree without env or AI config
- You're in CI or a scripted context where these are noise

Use `git wt checkout` when:
- You need to work on an existing branch in an isolated worktree
- You want to check out a remote branch without manually creating a tracking branch
- You're reviewing someone else's PR branch in isolation

Use `git wt adopt` when:
- A worktree was created with `git worktree add` and you want git-wt to manage it
- You want the worktree moved to `~/.git-wt/` for consistent management

## Shell Aliases

Optional `aliases/git-wt.sh` provides shorter commands. Source it in `.bashrc`/`.zshrc`:

| Alias | What it does |
|-------|-------------|
| `wtcd <name>` | `cd` into a worktree |
| `wto` | `cd` to the origin (main) repo |
| `wtn [name]` | Create worktree + `cd` into it |
| `wtco <branch>` | Checkout existing branch + `cd` into it |
| `wtls` / `wtla` | List / list-all |
| `wtrm` / `wtopen` / `wtclean` / `wtpath` | Shorthand for corresponding commands |

## Security

- All operations are **local filesystem only** — git-wt never makes network requests or sends data externally
- `--copy-env` copies `.env*` files between local directories on the same machine (repo root → worktree)
- `--copy-ai` copies AI config/session files between local directories on the same machine
- `GIT_WT_AI_COPY_PATHS` accepts repo-relative paths only; absolute paths plus `.git` and `..` path components are rejected, and destination symlinks are never followed
- No credentials, tokens, or secrets leave the local filesystem
- Worktrees are stored under `~/.git-wt/` with standard filesystem permissions

## Workflow: Parallel Agent Isolation

```bash
# Agent 1: create isolated worktree with AI config
git wt new --copy-env --copy-ai task-auth

# Agent 2: create another
git wt new --copy-env --copy-ai task-api

# Each agent works independently in their worktree
cd $(git wt path task-auth)

# When done — sessions merged into origin (/resume), settings synced back
git wt rm task-auth
git wt rm task-api
```
