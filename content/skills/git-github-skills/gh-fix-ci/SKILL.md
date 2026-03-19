---
name: gh-fix-ci
description: Debug and fix failing GitHub PR checks with GitHub CLI. Use when GitHub Actions checks fail, when a PR has broken status checks, or when you need local reproduction commands for CI failures.
category: git-github
tags:
  - github
  - gh-cli
  - ci
  - debugging
  - pr-checks
version: 1.1.0
allowed-tools:
  - Read
  - Bash
  - python
---

1. Verify `gh auth status`. If unauthenticated, ask user to run `gh auth login`.
2. Identify PR using `gh pr view --json number,url` or `$ARGUMENTS`.
3. If `rtk` is available, prefer `rtk gh ...`, `rtk read`, and `rtk grep` for exploratory steps. Use raw `gh` or the bundled script when another command needs machine-friendly JSON or uncompressed logs.
4. Run `python "$SKILL_DIR/scripts/inspect_pr_checks.py" --repo "." [--pr "$ARGUMENTS"] --json` to collect failing checks, log snippets, and local reproduction hints.
5. Summarize GitHub Actions failures with check names, the smallest useful log snippet, and the suggested local repro commands. Mark external providers (for example Buildkite) as out-of-scope unless the user explicitly asks for them.
6. Propose a concise fix plan and request explicit approval before editing when the user asked only for diagnosis. Otherwise proceed to fix.
7. Implement the approved fix, rerun the relevant local repro commands, then re-run `gh pr checks` to verify.

## References
See [references/BACKGROUND.md](references/BACKGROUND.md) for detailed workflow and manual fallbacks.
