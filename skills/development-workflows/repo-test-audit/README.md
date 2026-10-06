# repo-test-audit

Read-only inventory of test location, runner collection, and whether assertions check behavior.

Version 0.1.0. This package stays in this repository. It is not published.

## Run

Substitute `<skill-dir>` with the directory announced when the skill loads. Do not use `$SKILL_DIR`.

```bash
python "<skill-dir>/scripts/inventory_tests.py" "<repo-root>"
```

Stdout is one JSON object. The script does not run recipes and does not use the network.

## Report

See `references/report-contract.md`. The human report uses Covered, Shallow, and Missing. The script value `needs-review` is not a final status.

Runner collection comes from the target repository's `justfile`. See `references/this-repo-runners.md`.

## Not in scope

Diff or PR review, maintainability review, refactoring, and explaining one failure stack.
