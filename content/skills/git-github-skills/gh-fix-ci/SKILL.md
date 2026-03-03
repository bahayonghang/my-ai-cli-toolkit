---
name: gh-fix-ci
description: Debug and fix failing GitHub PR checks using gh CLI. Use when GitHub Actions PR checks fail.
metadata:
  category: devops
  tags:
    - github
    - ci-cd
    - debugging
    - pr-checks
argument-hint: "[pr-number-or-url]"
allowed-tools: Read, Bash, python
---

1. Verify `gh auth status`. If unauthenticated, ask user to run `gh auth login`.
2. Identify PR using `gh pr view --json number,url` or `$ARGUMENTS`.
3. Run inspection script: `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." --pr "$ARGUMENTS" --json`.
4. Summarize GitHub Actions failures with log snippets and check names. Mark external providers (e.g., Buildkite) as out-of-scope.
5. Propose a concise fix plan and request explicit approval.
6. Implement approved fix, then re-run `gh pr checks` to verify.

## References
See [references/BACKGROUND.md](references/BACKGROUND.md) for detailed workflow and manual fallbacks.
