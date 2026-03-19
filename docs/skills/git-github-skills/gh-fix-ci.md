# GitHub Fix CI

Inspect failing PR checks with `gh`, extract the smallest useful failure snippet, and map failures to local reproduction commands.

## Overview

The bundled helper now returns:

- failing GitHub Actions checks
- actionable log snippets
- local reproduction commands
- RTK-prefixed repro commands when they are safe to derive

Example:

```bash
python content/skills/git-github-skills/gh-fix-ci/scripts/inspect_pr_checks.py --repo . --pr 123 --json
```

## Workflow

1. Verify `gh auth status`.
2. Resolve the current branch PR or an explicit PR number or URL.
3. Run the helper and summarize the failing checks.
4. Distinguish GitHub Actions from external providers. External providers are report-only by default.
5. Reproduce locally with the suggested commands, fix the issue, then re-run `gh pr checks`.

## RTK Fast Path

If `rtk` is installed, use it for exploration and compact summaries:

- `rtk gh pr checks ...`
- `rtk gh run view ...`
- `rtk read ...`
- `rtk grep ...`

Keep raw `gh` output for JSON parsing and direct log fetching.
