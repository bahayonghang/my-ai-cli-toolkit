# Git Commit CN

Safely plan, draft, or execute Chinese Conventional Commits for staged Git changes and, when explicitly requested, for all working-tree changes, without pushing by default.

## Overview

This skill now behaves like a safe commit orchestrator instead of a bare message formatter:

1. Decide whether `staged-only` or `all-changes` mode applies
2. Run a preflight check on `git status` and the relevant diffs
3. Decide whether the active change set is safe as-is or needs a split plan
4. Classify the change with Chinese Conventional Commit rules
5. Compose the final message with the helper script
6. Either draft the message or run `git commit -F ...`
7. Read the commit output and stop on hook failures

The helper wrapper builds multi-line commit messages safely across shells and auto-detects `python3`, `python`, or `py`, so the caller no longer needs to know which interpreter name is available:

```bash
COMMIT_COMPOSER=content/skills/git-github-skills/git-commit-cn/scripts/compose_commit_message

bash "$COMMIT_COMPOSER" \
  --type feat \
  --scope auth \
  --summary 添加双因素认证 \
  --body-line 支持 TOTP 和恢复码 \
  --refs 128 \
  --footer-line "Jira: AUTH-42" \
  --output .git/COMMIT_EDITMSG.codex

git commit -F .git/COMMIT_EDITMSG.codex
```

## Workflow

1. Default to `staged-only`. Switch to `all-changes` only when the user explicitly asks to include everything, regardless of stage state, including untracked files.
2. In `staged-only`, inspect `git status`, `git diff --staged --stat`, and `git diff --staged`.
3. In `all-changes`, also inspect `git diff --stat` and `git diff`, and treat staged, unstaged, and untracked non-ignored files as the candidate commit set.
4. Stop immediately when `staged-only` has no staged changes.
5. Stop immediately when `all-changes` has no changes anywhere in the working tree.
6. If the active set mixes unrelated work and cannot be split safely, output a split plan instead of committing.
7. Choose the correct Conventional Commit type, scope, emoji policy, and breaking-change trailers.
8. Generate the message with the helper wrapper instead of hardcoding `python`.
9. Draft only when the user asked only for message text.
10. When committing:
    - `staged-only` commits only the safe staged set
    - `all-changes` may run `git add -A` for a single atomic commit
    - `all-changes` split commits may rebuild the index only by file/path boundaries; stop if hunk-level surgery would be required
11. Use `git commit -F ...` and read the result before claiming success.

## RTK Fast Path

If `rtk` is installed, prefer it for change-set exploration:

- `rtk git status`
- `rtk git diff --staged`
- `rtk git diff`
- `rtk git commit -F ...` when you want compact feedback for the final commit step

## Guardrails

- Do not push by default.
- Never include `Co-Authored-By` or AI attribution lines.
- If a commit hook fails, report the original error and stop.
- Enable `all-changes` only under explicit user language that authorizes including everything.
- Stop at the plan if the split would require hunk-level reconstruction inside the same file.
- Keep `type` in English and prefer Chinese for `scope`, `subject`, and `body`.
