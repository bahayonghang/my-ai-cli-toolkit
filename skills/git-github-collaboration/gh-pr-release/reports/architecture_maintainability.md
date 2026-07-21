# Architecture Maintainability

Generated at: `2026-07-21T00:00:00Z`

## Summary

- decision: `pass`
- python files: `6`
- scripts: `0`
- tests: `0`
- internal modules: `0`
- CLI scripts: `4`
- Yao CLI command handlers: `0`
- entrypoint command handlers: `0`
- command modules: `0`
- largest file lines: `802`
- early watch threshold lines: `600`
- early watchlist: `0`
- watch threshold lines: `720`
- watchlist: `2`
- hotspots: `0`
- blockers: `0`

This report keeps maintainability risk visible before the Meta Skill grows more gates, renderers, and CLI commands.

## Hotspots

No file-size hotspots found.

## Watchlist

| File | Lines | Kind | Recommended next split |
| --- | ---: | --- | --- |
| `scripts\pr_review.py` | `802` | `cli-script` | Watch this file before adding new responsibilities; extract a helper module when one concern dominates. |
| `scripts\inspect_pr_checks.py` | `765` | `cli-script` | Watch this file before adding new responsibilities; extract a helper module when one concern dominates. |

## Early Watchlist

No early watch files found.

## Largest Files

| File | Lines | Kind | Severity |
| --- | ---: | --- | --- |
| `scripts\pr_review.py` | `802` | `cli-script` | `pass` |
| `scripts\inspect_pr_checks.py` | `765` | `cli-script` | `pass` |
| `scripts\fetch_comments.py` | `377` | `cli-script` | `pass` |
| `tests\test_pr_review.py` | `357` | `test` | `pass` |
| `tests\test_inspect_pr_checks.py` | `137` | `cli-script` | `pass` |
| `tests\test_fetch_comments.py` | `79` | `test` | `pass` |

## Release Rule

- `block` hotspots should be split before governed release.
- `warn` hotspots can ship only when Review Studio keeps them visible and a reviewer accepts the modularization plan.
- Do not split a file only for line count; split when a stable responsibility boundary is clear.
