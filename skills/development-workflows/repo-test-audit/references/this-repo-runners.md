# Runner authority

The target repository's `justfile` is the collection contract. Read that file at audit time. Do not copy the historical list below into a report as if it were still the contract.

When the repository has no `justfile`, the inventory JSON sets `runner_status` to `runner-not-declared`. List locations only. Do not apply pytest or `node --test` default globs as that repository's facts.

`python-check` is compilation. Do not report it as tests passed.

`evals-check`, when the `justfile` has that recipe, is a runner name. It does not mean a model executed `evals/evals.json`.

## Historical snapshot (not the contract)

Date: 2026-10-06. Source: `.trellis/tasks/10-06-repo-test-skill/research/local-repo-test-layouts.md`. This is the seven-step shape of this repository before the backfill task. After backfill, use the `justfile` again. Do not keep a second step table here.

1. `docs-check`
2. `skills-check`
3. `python-check` (compile only)
4. `python-test`, which discovered only `skills/git-github-collaboration/gh-pr-release/tests` and `platforms/claude/hooks/tests`
5. `install-projects-test`
6. `node-test`, which collected `skills/**` files whose path contains a `tests` directory and whose name ends in `.mjs`
7. `git diff --check`

On that date, `humanizer-paper` and `paper-workbench` Python tests were on disk and were not under the `python-test` discover roots. `evals/` was not a `just ci` step.

## After backfill

The backfill task may add `evals-check` and may change `python-test` discover roots. Those edits belong to the `justfile`. This note does not restate them. Run the inventory script and read the `justfile` that is in the tree.
