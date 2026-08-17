---
name: super-worktree
description: "Create isolated git worktrees for parallel feature development. Auto-copies env files, symlinks node_modules, prints copy-pasteable cd hint. Single-repo only. Trigger when user asks to create/spin-up/start/delete/merge/sync/list/status/prune a worktree."
---

# super-worktree

Git worktree manager with env file copying and `node_modules` symlinking. Work on multiple branches at once without leaving your session.

---

## What users can say (copy-paste prompts)

After installing, users can say things like these to their AI agent:

**Create:**
- "Create a worktree for feature/login"
- "Set up a worktree for hotfix from production"
- "Start work on TEST-1 with slug 'test feature'"
- "Spin up a worktree for PR 1234" (requires `gh`)
- "Spin up a worktree for MR 42" (requires `glab`)

**Manage:**
- "List my worktrees / show me which ones are dirty"
- "Delete the payments worktree"
- "Re-sync env files into the login worktree"
- "Merge feature/login back into main and clean up"
- "Prune orphan worktrees"
- "Show me worktree status as JSON"

**With AI tool integration:**
- "Create a worktree and append `claude` to the cd hint"
- `--tool opencode` or `--tool codex` also work

---

## How it works

```
bash scripts/worktree-manager.sh create <branch> [from-branch] [options]
```

1. Creates a git worktree at `.worktrees/<branch>/`
2. Copies env files (`.env`, credentials, etc.) from source
3. Symlinks `node_modules` (saves disk space)
4. Runs lifecycle hooks (preCreate, postCreate, etc.)
5. Prints a copy-pasteable `cd` hint

---

## Config schema (`super-worktree.json`)

Place in repo root. All fields optional.

```json
{
  "$schema": "./schemas/super-worktree.schema.json",
  "version": 1,
  "sync": {
    "copyFiles": [
      ".env", ".env.*", ".envrc", ".local.*",
      "*.secret", "*.key", ".secrets.*",
      "credentials.json", "credentials.yml", "credentials.env",
      "auth.json", "auth.yml", "auth.env",
      ".dev.vars", ".prod.vars", ".staging.vars"
    ],
    "symlinkDirs": ["node_modules"],
    "exclude": ["node_modules", ".git", "dist", "build", ".next",
                "out", "coverage", ".turbo", ".vercel", ".worktrees"],
    "copyDepth": 2
  },
  "hooks": {
    "preCreate":  "echo creating $BRANCH",
    "postCreate": "pnpm install --frozen-lockfile",
    "preDelete":  "echo cleaning $BRANCH"
  }
}
```

| Field | Default | Description |
|-------|---------|-------------|
| `sync.copyFiles` | (env + credentials patterns) | Files to copy from source to worktree |
| `sync.symlinkDirs` | `["node_modules"]` | Directories to symlink instead of copy |
| `sync.exclude` | (build/dep dirs) | Patterns excluded from copy/symlink |
| `sync.copyDepth` | `2` | Max depth for find scanning |
| `hooks.preCreate` | — | Runs before `git worktree add`. Env: `BRANCH`, `BASE`, `WORKTREE_PATH` |
| `hooks.postCreate` | — | Runs after sync (e.g. `pnpm install`) |
| `hooks.preDelete` | — | Runs before worktree removal |
| `hooks.postDelete` | — | Runs after worktree removal |

### Glob negation

Prefix `copyFiles` entry with `!` to exclude:

```json
{ "sync": { "copyFiles": [".env", ".env.*", "!.env.example"] } }
```

Defaults already negate `.env.example`, `.env.sample`, `.env.template`.

### Env interpolation

Variables expand in `copyFiles` paths: `$HOME`, `${HOME}`, `$USER`, `${XDG_CONFIG_HOME}`.

```json
{ "sync": { "copyFiles": ["${HOME}/.aws/credentials"] } }
```

### Config priority

1. Built-in defaults
2. Global: `~/.config/super-worktree/config.json`
3. Project: `.super-worktree.json` in repo root
4. CLI `--config <file>` (highest)

---

## CLI reference

### Commands

| Command | Description |
|---------|-------------|
| `create <branch> [from-branch] [opts]` | Create new worktree |
| `delete <branch>` | Remove worktree |
| `merge <branch>` | Merge into upstream and remove |
| `sync <branch>` | Re-copy env + re-symlink for existing worktree |
| `list [--json]` | List worktrees with base/created/tool |
| `status [--json]` | Show clean/dirty per worktree |
| `prune` | Remove orphan metadata + `git worktree prune` |
| `version` | Print version |

### Create flags

| Flag | Effect |
|------|--------|
| `--config <file>` | Custom config JSON |
| `--tool <name>` | AI tool appended to cd hint (`claude`, `opencode`, etc.) |
| `--ticket <id>` | Ticket id for branch templating |
| `--slug <text>` | Slug for branch templating |
| `--from-pr <num>` | Check out a GitHub PR (req. `gh`) |
| `--from-mr <num>` | Check out a GitLab MR (req. `glab`) |
| `--print-cd` | Print `cd <path>` to stdout (machine-friendly) |
| `--dry-run` | Show intended actions; no changes |

### Environment

| Var | Effect |
|-----|--------|
| `TRUST_DIRENV=1` | Auto-run `direnv allow` on copied `.envrc` |
| `DRY_RUN=1` / `PRINT_CD=1` / `JSON_OUT=1` | Equivalent to flags |

### Examples

```bash
# Create feature branch from origin/HEAD
bash scripts/worktree-manager.sh create feature/new-login

# Create from develop with custom config
bash scripts/worktree-manager.sh create feature/payments develop --config .super-worktree.json

# Templated branch + claude in cd hint
bash scripts/worktree-manager.sh create --ticket TEST-1 --slug "test feature" --tool claude

# Eval cd into new worktree
eval "$(bash scripts/worktree-manager.sh create feat/x --print-cd)"

# Check out a GitHub PR
bash scripts/worktree-manager.sh create --from-pr 123

# Check out a GitLab MR
bash scripts/worktree-manager.sh create --from-mr 42

# Re-pull env after rotation
bash scripts/worktree-manager.sh sync feature/login

# Machine-readable list
bash scripts/worktree-manager.sh list --json | jq '.[].branch'

# Human-readable status
bash scripts/worktree-manager.sh status
```

---

## Requirements

- Git 2.5+ (worktree support)
- Bash 4.0+
- `jq` (required for JSON config and --json output)
- `gh` (optional, for `--from-pr`)
- `glab` (optional, for `--from-mr`)

## Installation

```bash
# npx skills (works with 40+ AI agents)
npx skills add marioxe301/super-worktree

# Manual
cp -r super-worktree ~/.config/opencode/skills/
```

## Shell completions

```bash
# bash
echo 'source /path/to/super-worktree/completions/super-worktree.bash' >> ~/.bashrc

# zsh
cp completions/_super-worktree /usr/local/share/zsh/site-functions/

# fish
cp completions/super-worktree.fish ~/.config/fish/completions/
```

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "worktree already exists" | `bash scripts/worktree-manager.sh delete <branch>` first |
| "jq not found" | `brew install jq` (macOS) / `sudo apt install jq` (Ubuntu) |
| "not inside a git repository" | Run from inside a git repo |
| "gh not found" | Install GitHub CLI: https://cli.github.com |
| "glab not found" | Install GitLab CLI: `brew install glab` / `sudo apt install glab` |
| "Permission denied" | `chmod +x scripts/worktree-manager.sh` |
| symlink fails "File exists" | Remove `node_modules` in worktree first |
| "cannot stat: No such file or directory" | Base branch doesn't exist. Check `git branch -a` |

## Metadata

Worktree metadata stored at `.worktrees/.metadata/<branch>.json`:

```json
{"baseBranch":"main","createdAt":"2026-04-28T20:59:18Z","aiTool":"claude"}
```
