# Report contract

One audit prints three columns. Each cell cites a path or a recipe command.

| Column | Question | Evidence |
| --- | --- | --- |
| 位置 location | Where is the test file, and what is the directory name? | File walk. `location` is `skill-tests`, `repo-tests`, or `unknown`. |
| 收集 collection | Will the declared runner execute it? | `collected_by` from `<skill-dir>/scripts/inventory_tests.py`. Empty means the declared runner does not collect it. |
| 行为 behavior | Do assertions check an observable result? | Read the collected test. Do not stop at the script keyword. |

The script does not write the report. It does not run the target repository's tests and it does not use the network.

## Status words

The audit report uses only these words:

- `Covered`: a collected test asserts an observable result such as output, an exit code, or a data structure.
- `Shallow`: the collected test only checks that a file exists, or it only compiles.
- `Missing`: the test file exists and the declared runner does not collect it, or a required behavior has no collected assertion.

`needs-review` is a script value, not a report status. The reader changes every `needs-review` row to `Covered` or `Shallow` after reading the test. A keyword such as `assert` or `assertions` is not proof of `Covered`.

Completeness is not a coverage percentage. pytest 9.1.1 and the Node.js test runner docs do not define that percentage as completeness.

An external `tests/` directory is not the only legal layout. In-package tests and repo-level tests can both be valid when the declared runner collects them.

## What the script does not claim

- `python-check` compiles Python. It is not a passing test run, and it does not set `collected_by`.
- `evals-check` in `runners` means the recipe exists. It checks schema when the repository defines that recipe. It does not mean a model executed `evals/evals.json`.
- Whether a model routes from `description` is missing evidence. A routing test that locks description text and eval text does not prove model behavior.
- `collected_by` does not mean the test passed. Pass or fail stays with the repository's own runner command.
