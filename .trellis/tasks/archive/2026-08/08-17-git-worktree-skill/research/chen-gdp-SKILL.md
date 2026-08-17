---
name: using-git-worktrees
description: Use when starting feature work that needs isolation from current workspace or before executing implementation plans - creates isolated git worktrees with smart directory selection and safety verification
---

# Using Git Worktrees

## Overview

Git worktrees create isolated workspaces sharing the same repository, allowing work on multiple branches simultaneously without switching.

**Core principle:** Systematic directory selection + safety verification = reliable isolation.

**Announce at start:** "I'm using the using-git-worktrees skill to set up an isolated workspace."

## Creation Methods

### Option A: Create Worktree from PR

When user wants to work on an existing pull request:

**Using GitHub CLI (gh):**

```bash
# List available PRs
gh pr list --state open --limit 10

# Get branch name from PR number
pr_info=$(gh pr view <PR_NUMBER> --json headRefNumber,headRefName,baseRefName)

# Extract branch name
branch=$(echo "$pr_info" | jq -r '.headRefName')

# Create worktree from PR branch
git worktree add "$LOCATION/$branch" "$branch"
cd "$LOCATION/$branch"
```

**Using GitHub MCP (available via `skill_mcp` tool):**

```bash
# Use MCP to get PR information
# List PRs: github_list_pull_requests
# Get PR details: github_pull_request_read with method="get"

# Extract branch name from MCP response
# Then create worktree
git worktree add "$LOCATION/$branch" "$branch"
cd "$LOCATION/$branch"
```

**Example Workflow:**

```
User: Create a worktree from PR #42

[Check .worktrees/ - exists]
[Verify .gitignore - contains .worktrees/]

Using gh CLI to fetch PR #42 information...
[Run: gh pr view 42 --json headRefName,baseRefName]
PR #42 found - Branch: feature/auth-login, Base: main

[Create worktree: git worktree add .worktrees/feature-auth-login feature/auth-login]
[Continue with steps 3-7: .venv, .env, setup, tests, report]

Worktree ready at /Users/jesse/myproject/.worktrees/feature-auth-login
From PR #42: feature/auth-login → main
Tests passing (47 tests, 0 failures)
Ready to work on PR #42
```

**Note:** When working from a PR, you're checking out the PR's head branch, not creating a new branch.

### Option B: Create Worktree from New Branch

Follow this priority order for directory selection:

```bash
# Check in priority order
ls -d .worktrees 2>/dev/null     # Preferred (hidden)
ls -d worktrees 2>/dev/null      # Alternative
```

**If found:** Use that directory. If both exist, `.worktrees` wins.

### 2. Check CLAUDE.md

```bash
grep -i "worktree.*director" CLAUDE.md 2>/dev/null
```

**If preference specified:** Use it without asking.

### 3. Ask User

If no directory exists and no CLAUDE.md preference:

```
No worktree directory found. Where should I create worktrees?

1. .worktrees/ (project-local, hidden)
2. ~/.config/superpowers/worktrees/<project-name>/ (global location)

Which would you prefer?
```

## Safety Verification

### For Project-Local Directories (.worktrees or worktrees)

**MUST verify .gitignore before creating worktree:**

```bash
# Check if directory pattern in .gitignore
grep -q "^\.worktrees/$" .gitignore || grep -q "^worktrees/$" .gitignore
```

**If NOT in .gitignore:**

Per Jesse's rule "Fix broken things immediately":
1. Add appropriate line to .gitignore
2. Commit the change
3. Proceed with worktree creation

**Why critical:** Prevents accidentally committing worktree contents to repository.

### For Global Directory (~/.config/superpowers/worktrees)

No .gitignore verification needed - outside project entirely.

## Creation Steps

### 1. Detect Project Name (for new branch creation only)

```bash
project=$(basename "$(git rev-parse --show-toplevel)")
```

### 2. Create Worktree

```bash
# For new branch:
case $LOCATION in
  .worktrees|worktrees)
    path="$LOCATION/$BRANCH_NAME"
    ;;
  ~/.config/superpowers/worktrees/*)
    path="~/.config/superpowers/worktrees/$project/$BRANCH_NAME"
    ;;
esac

# Create worktree with new branch
git worktree add "$path" -b "$BRANCH_NAME"
cd "$path"

# For PR branch (already exists):
# git worktree add "$LOCATION/$BRANCH_NAME" "$BRANCH_NAME"
cd "$LOCATION/$BRANCH_NAME"
```

### 3. Handle Virtual Environment (Python only)

Priority: **Always prioritize linking existing `.venv` available.**

1. **Check for `.venv` in root project.**
2. **If found:** Create a symbolic link `ln -s ../.venv .venv` in the worktree.
3. **If NOT found:** Ask the user if they want to install a new environment.

```bash
# Link .venv from root to worktree if it exists
if [ -d "../.venv" ]; then
  ln -s ../.venv .venv
else
  echo ".venv not found in root. Would you like to set up a fresh environment?"
  # (Wait for user response before proceeding with setup)
fi
```

### 4. Handle Environment Files (.env)

**CRITICAL: NEVER read .env file contents** - use ls/find only to detect files.
**ENFORCED: Copy ALL .env files to worktree.** Do not link.

```bash
# Detect all .env files in entire repo (excluding worktrees directory)
# DO NOT cat or read the files - only detect existence

if [ -d "../.worktrees" ]; then
  # .worktrees exists, find .env files in entire repo excluding it
  env_files=$(find .. -name ".env*" ! -path "*/.worktrees/*" -print)
elif [ -d "../worktrees" ]; then
  # worktrees exists, find .env files in entire repo excluding it
  env_files=$(find .. -name ".env*" ! -path "*/worktrees/*" -print)
else
  # No worktrees directory, find all .env files in entire repo
  env_files=$(find .. -name ".env*" -print)
fi

# Copy each .env file to worktree maintaining directory structure
for env_file in $env_files; do
  # Get relative path from root
  rel_path="${env_file#../}"

  # Determine destination directory in worktree
  dest_dir=$(dirname "$rel_path")

  # Create destination directory if it doesn't exist
  mkdir -p "$dest_dir"

  # Copy file (NOT link - use cp)
  cp "$env_file" "$rel_path"
done
```

**Default behavior:** Copy all .env files from entire repo to worktree using `cp`. Each worktree gets its own copy.

### 5. Run Project Setup

Auto-detect and run appropriate setup:

```bash
# Node.js
if [ -f package.json ]; then npm install; fi

# Rust
if [ -f Cargo.toml ]; then cargo build; fi

# Python - check in priority order: uv > poetry > pip
if [ -f pyproject.toml ]; then
  if command -v uv &> /dev/null; then
    uv sync
  elif command -v poetry &> /dev/null; then
    poetry install
  fi
elif [ -f requirements.txt ]; then
  if command -v uv &> /dev/null; then
    uv pip install -r requirements.txt
  elif command -v pip &> /dev/null; then
    pip install -r requirements.txt
  fi
fi

# Go
if [ -f go.mod ]; then go mod download; fi
```

### 6. Verify Clean Baseline

Run unit tests to ensure worktree starts clean:

```bash
# Check Makefile first for unit test commands
if [ -f Makefile ]; then
  make test-unit 2>/dev/null || make test 2>/dev/null || true
fi

# Fallback to project-appropriate commands
if [ -f package.json ]; then npm test; fi
if [ -f Cargo.toml ]; then cargo test --lib; fi  # unit tests only
if [ -f pyproject.toml ] || [ -f requirements.txt ]; then pytest -m unit 2>/dev/null || pytest; fi
if [ -f go.mod ]; then go test ./... -run TestUnit 2>/dev/null || go test ./...; fi
```

**If tests fail:** Report failures, ask whether to proceed or investigate.

**If tests pass:** Report ready.

### 7. Report Location

```
Worktree ready at <full-path>
Tests passing (<N> tests, 0 failures)
Ready to implement <feature-name>
```

## Quick Reference

| Situation | Action |
|-----------|--------|
| Working on PR | Use `gh pr view <number>` or GitHub MCP to get branch, create worktree |
| Creating new branch | Follow steps 1-7 below |
| `.worktrees/` exists | Use it (verify .gitignore) |
| `worktrees/` exists | Use it (verify .gitignore) |
| Both exist | Use `.worktrees/` |
| Neither exists | Check CLAUDE.md → Ask user |
| Directory not in .gitignore | Add it immediately + commit |
| `.venv` exists in root | **Enforce:** Link with `ln -s`. If not found, ask user to install. |
| `.env*` files in repo | **Enforce:** Copy with `cp` ONLY (NEVER read contents) |
| Makefile exists | Check for `install` and `test-unit` targets |
| Python project setup | Priority: `uv sync` > `poetry install` > `pip install` |
| Tests fail during baseline | Report failures + ask |
| No package.json/Cargo.toml | Skip dependency install |

## Common Mistakes

**Skipping .gitignore verification**
- **Problem:** Worktree contents get tracked, pollute git status
- **Fix:** Always grep .gitignore before creating project-local worktree

**Incorrect handling of .venv and .env**
- **Problem:** Linking .env files instead of copying, or skipping existing environments.
- **Fix:** ENFORCE `ln -s` for `.venv` and `cp` for `.env*` files. Always prioritize linking an existing `.venv` from the root. If no `.venv` is found, ask the user before installing.

**Reading .env files**
- **Problem:** Violates security/privacy, .env may contain secrets
- **Fix:** NEVER use `cat` or read .env contents - only use `find` to detect existence, then copy

**Missing .env files in worktree**
- **Problem:** Worktree lacks environment configuration, fails to run
- **Fix:** Detect ALL .env* files in entire repo (excluding worktrees) and copy them with correct directory structure

**Assuming directory location**
- **Problem:** Creates inconsistency, violates project conventions
- **Fix:** Follow priority: existing > CLAUDE.md > ask

**Assuming Python package manager**
- **Problem:** Runs wrong install command, fails or creates conflicts
- **Fix:** Check in priority: uv > poetry > pip, verify command exists

**Ignoring Makefile**
- **Problem:** Misses project-specific test commands
- **Fix:** Always check Makefile for `test-unit` targets before using default test commands

**Copying .venv unnecessarily**
- **Problem:** Wastes disk space with duplicate virtual environments
- **Fix:** Default to `ln -s` symbolic link, ask user only once

**Proceeding with failing tests**
- **Problem:** Can't distinguish new bugs from pre-existing issues
- **Fix:** Report failures, get explicit permission to proceed

**Hardcoding setup commands**
- **Problem:** Breaks on projects using different tools
- **Fix:** Auto-detect from project files (package.json, etc.) and Makefile

## Example Workflow

### PR-Based Worktree

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace from PR #42.

[Check .worktrees/ - exists]
[Verify .gitignore - contains .worktrees/]

[Using gh CLI to fetch PR #42 information]
[Run: gh pr view 42 --json headRefName,baseRefName]
PR #42 found - Branch: feature/auth-login, Base: main

[Create worktree: git worktree add .worktrees/feature-auth-login feature/auth-login]

[Check for .venv in root - found]
"Found .venv in root project. How should I handle virtual environment?
1. Link with ln -s (recommended - saves storage)
2. Copy to worktree (uses more disk space)
3. Skip (set up fresh environment)
Which would you prefer? [1/2/3]"
→ User selects 1

[Link: ln -s ../.venv .venv]

[Detect .env files in entire repo (using find only, never cat/read)]
Found .env, .env.production
[Copy: cp ../.env .env, cp ../.env.production .env.production]

[Check Makefile - contains 'test-unit' targets]
[Run: make test-unit - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/feature-auth-login
From PR #42: feature/auth-login → main
Tests passing (47 tests, 0 failures)
Ready to work on PR #42
```

### New Branch Worktree

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace for new feature.

[Check .worktrees/ - exists]
[Verify .gitignore - contains .worktrees/]
[Create worktree: git worktree add .worktrees/auth -b feature/auth]

[Check for .venv in root - found]
"Found .venv in root project. How should I handle virtual environment?
1. Link with ln -s (recommended - saves storage)
2. Copy to worktree (uses more disk space)
3. Skip (set up fresh environment)
Which would you prefer? [1/2/3]"
→ User selects 1

[Link: ln -s ../.venv .venv]

[Detect .env files in entire repo (using find only, never cat/read)]
Found .env, .env.local, .env.production
[Copy: cp ../.env .env, cp ../.env.local .env.local, cp ../.env.production .env.production]

[Check Makefile - contains 'test-unit' targets]
[Run: make test-unit - 47 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/auth
Tests passing (47 tests, 0 failures)
Ready to implement auth feature
```

### Python Example with uv

```
You: I'm using the using-git-worktrees skill to set up an isolated workspace.

[Check .worktrees/ - exists]
[Verify .gitignore - contains .worktrees/]
[Create worktree: git worktree add .worktrees/api -b feature/api]

[No .venv in root, .worktrees is project-local]

[Detect .env files in entire repo (using find only)]
Found .env.development, .env.test
[Copy: cp ../.env.development .env.development, cp ../.env.test .env.test]

[Check Makefile - no test-unit target]
[Detect pyproject.toml, uv command available]
[Run: uv sync]
[Run: pytest -m unit - 89 passing]

Worktree ready at /Users/jesse/myproject/.worktrees/api
Tests passing (89 tests, 0 failures)
Ready to implement API feature
```

## Red Flags

**Never:**
- Create worktree without .gitignore verification (project-local)
- Skip baseline test verification
- Proceed with failing tests without asking
- Assume directory location when ambiguous
- Skip CLAUDE.md check
- **Read or cat .env files** - use only `find` for detection
- Link .env files instead of copying (unless user explicitly chooses)

**Always:**
- Follow directory priority: existing > CLAUDE.md > ask
- Verify .gitignore for project-local
- Check Makefile for test commands before using defaults
- For Python: uv > poetry > pip (verify command exists first)
- Always prioritize linking existing `.venv` from root. If not found, ask user to install.
- Always copy all `.env*` files from entire repo to worktree with `cp` maintaining directory structure (NEVER read contents)
- Verify clean test baseline (unit tests only)

## Integration

**Called by:**
- **brainstorming** (Phase 4) - REQUIRED when design is approved and implementation follows
- Any skill needing isolated workspace

**Pairs with:**
- **finishing-a-development-branch** - REQUIRED for cleanup after work complete
- **executing-plans** or **subagent-driven-development** - Work happens in this worktree
