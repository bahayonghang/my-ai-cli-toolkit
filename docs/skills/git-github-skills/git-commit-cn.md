# Git Commit CN

Generate split Chinese Conventional Commit messages with emoji, without pushing by default.

## Overview

This skill now uses a small helper script to build multi-line commit messages safely across shells:

```bash
python content/skills/git-github-skills/git-commit-cn/scripts/compose_commit_message.py \
  --type feat \
  --scope auth \
  --summary 添加双因素认证 \
  --body-line 支持 TOTP 和恢复码 \
  --output .git/COMMIT_EDITMSG.codex

git commit -F .git/COMMIT_EDITMSG.codex
```

## Workflow

1. Inspect `git status` and `git diff --staged`.
2. Split unrelated changes into separate commits.
3. Choose the correct Conventional Commit type and emoji.
4. Generate the message with the helper script.
5. Commit with `git commit -F ...`.

## RTK Fast Path

If `rtk` is installed, prefer it for staged-diff exploration:

- `rtk git status`
- `rtk git diff --staged`
- `rtk git commit -F ...` when you want compact feedback for the final commit step

This skill does not push by default. Only discuss `git push` when the user explicitly asks for it.
