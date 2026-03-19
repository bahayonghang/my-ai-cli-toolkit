---
name: git-commit-cn
description: Generate split Chinese Conventional Commit messages with emojis for staged changes. Use when reviewing staged diffs, drafting commit messages, or preparing safe multi-commit Git history without pushing by default.
category: git-github
tags:
  - git
  - conventional-commits
  - commit-message
  - chinese
version: 1.1.0
allowed-tools:
  - Bash
  - python
---

1. Analyze staged changes via `git diff --staged` and `git status`. If `rtk` is available, prefer `rtk git status` and `rtk git diff --staged` for model-visible inspection.
2. Determine commit type and emoji using [references/commit-types.md](references/commit-types.md) and `$ARGUMENTS`.
3. Split changes into separate commits by module or type before writing any commit message.
4. Generate commit text with `python "$SKILL_DIR/scripts/compose_commit_message.py" ...` and commit with `git commit -F <message-file>` so multi-line messages work in both PowerShell and POSIX shells.
5. If `rtk` is available and the user wants compact command feedback, `rtk git commit -F <message-file>` is acceptable for the final commit step.
6. Do not push by default. Only discuss `git push` if the user explicitly asked for it.
7. **PROHIBITED**: Never include Co-Author fields or attribution lines.
