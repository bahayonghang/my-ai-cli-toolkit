---
name: gh-fix-ci
description: Debug and fix failing GitHub PR checks with GitHub CLI. Use when GitHub Actions checks fail, when a PR has broken status checks, or when you need local reproduction commands for CI failures.
category: git-github-collaboration
tags:
  - github
  - gh-cli
  - ci
  - debugging
  - pr-checks
version: 1.2.0
allowed-tools: Read, Edit, Bash
---

> In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path; it is not an environment variable.

1. Verify `gh auth status`. If unauthenticated, ask user to run `gh auth login`.
2. Identify PR using `gh pr view --json number,url` or `$ARGUMENTS`. If no PR is found on the current branch and no number was given, stop and ask the user to specify one.
3. If `rtk` is available, prefer `rtk gh ...`, `rtk read`, and `rtk grep` for exploratory steps. Use raw `gh` or the bundled script when another command needs machine-friendly JSON or uncompressed logs.
4. Run `python "<skill-dir>/scripts/inspect_pr_checks.py" --repo "." [--pr "$ARGUMENTS"] --json` to collect failing checks, log snippets, and local reproduction hints. If the script exits non-zero, fall back to the manual workflow in [references/BACKGROUND.md](references/BACKGROUND.md).
5. Branch on the result:
   - All checks pass → report "all checks green" and stop.
   - Checks still in progress → report running checks and suggest waiting, or offer to inspect already-failed ones.
   - Only external provider failures (e.g. Buildkite) → report URLs and mark out-of-scope unless the user explicitly asks.
   - GitHub Actions failures exist → continue to step 6.
6. Summarize failures with: check name, the smallest useful log snippet (cap at 50 lines; if logs exceed this, extract only the error block), and the suggested local repro command.
7. Propose a concise fix plan and request explicit approval before editing when the user asked only for diagnosis. Otherwise proceed to fix.
8. Implement the approved fix and rerun the relevant local repro commands. If the local repro still fails, diagnose the new error and iterate (max 2 retries) before reporting back. After local success, re-run `gh pr checks` to confirm.

## References

- [references/BACKGROUND.md](references/BACKGROUND.md) for detailed workflow and manual fallbacks
- [scripts/inspect_pr_checks.py](scripts/inspect_pr_checks.py) for the automated check inspector
