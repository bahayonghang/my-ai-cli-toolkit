# Git Commit CN

Safely plan, draft, or execute Chinese Conventional Commits for staged Git changes, without pushing by default.

## Overview

This skill now behaves like a safe commit orchestrator instead of a bare message formatter:

1. Run a preflight check on `git status` and `git diff --staged`
2. Decide whether the staged set is safe as-is or needs a split plan
3. Classify the change with Chinese Conventional Commit rules
4. Compose the final message with the helper script
5. Either draft the message or run `git commit -F ...`
6. Read the commit output and stop on hook failures

The helper script builds multi-line commit messages safely across shells:

```bash
python content/skills/git-github-skills/git-commit-cn/scripts/compose_commit_message.py \
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

1. Inspect `git status`, `git diff --staged --stat`, and `git diff --staged`.
2. Stop immediately if there are no staged changes.
3. If the staged set mixes unrelated work and cannot be split safely, output a split plan instead of committing.
4. Choose the correct Conventional Commit type, scope, emoji policy, and breaking-change trailers.
5. Generate the message with the helper script.
6. Draft only when the user asked only for message text.
7. When committing, use `git commit -F ...` and read the result before claiming success.

## RTK Fast Path

If `rtk` is installed, prefer it for staged-diff exploration:

- `rtk git status`
- `rtk git diff --staged`
- `rtk git commit -F ...` when you want compact feedback for the final commit step

## Guardrails

- Do not push by default.
- Never include `Co-Authored-By` or AI attribution lines.
- If a commit hook fails, report the original error and stop.
- Keep `type` in English and prefer Chinese for `scope`, `subject`, and `body`.
