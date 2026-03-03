---
name: git-commit-cn
description: Generate conventional Chinese git commit messages with emojis. Use when committing staged changes.
metadata:
  category: development-tools
  tags:
    - git
    - commit-message
    - conventional-commits
    - chinese
argument-hint: "[额外说明或范围限制]"
allowed-tools: Bash
---

1. Analyze changes via `git diff --staged` and `git status`.
2. Determine commit type and emoji using [references/commit-types.md](references/commit-types.md) and `$ARGUMENTS`.
3. Split changes into separate commits by module/type.
4. Execute commit using HEREDOC: `git commit -m "$(cat <<'EOF' \n <type>(<scope>): <emoji> <description> \n EOF)"`.
5. Push changes to remote. Confirm before pushing to `main` or `master`.
6. **PROHIBITED**: Never include Co-Author fields or attribution lines.
