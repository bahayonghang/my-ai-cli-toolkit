# GitHub Address Comments

Summarize actionable GitHub PR feedback and apply selected fixes with `gh`.

## Overview

This skill now defaults to a stable actionable summary instead of dumping raw review JSON. It supports both:

- the current branch PR
- an explicit PR number or URL

Use the bundled helper when you need a repeatable summary:

```bash
python content/skills/git-github-skills/gh-address-comments/scripts/fetch_comments.py --repo .
python content/skills/git-github-skills/gh-address-comments/scripts/fetch_comments.py --repo . --pr 42 --json
```

## Workflow

1. Verify `gh auth status`.
2. Resolve the PR from the current branch or `--pr`.
3. Run the helper to collect unresolved review threads, review bodies, and top-level comments.
4. Present the numbered actionable items to the user.
5. Apply the selected fixes and summarize which feedback was addressed.

## RTK Fast Path

If `rtk` is installed, prefer it for model-facing exploration:

- `rtk gh pr view ...`
- `rtk read ...`
- `rtk grep ...`

Do not wrap machine-readable JSON or GraphQL payloads with RTK compression when another script needs the raw output.
