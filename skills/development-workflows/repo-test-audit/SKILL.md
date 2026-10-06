---
name: repo-test-audit
description: "Use when the user asks where tests live, which test directory holds them, how complete the tests are, or which tests are not collected by CI. 测试放在哪、测试目录、测试完善程度、哪些测试没进 CI. Inventory test location, runner collection, and completeness. Do not use for a diff review, a PR review, a maintainability review, a refactor, or explaining one failure stack. 不用于 diff 审查、PR 审查、可维护性审查、重构，也不用于只解释一段失败栈。"
category: development-workflows
tags:
  - testing
  - audit
  - ci
version: 0.1.0
argument-hint: "[repo-root]"
allowed-tools: Read, Grep, Glob, Bash, Edit, Write
---

Read-only inventory of where tests live, whether the declared runner collects them, and whether assertions check behavior.

> Paths starting with `<skill-dir>` are the skill directory announced when the skill loads. Substitute that literal path. It is not an environment variable. Do not use `$SKILL_DIR`. Do not use a cwd-relative `scripts/...` path.

## Router Rules

- Where tests live, which test directory holds them, how complete the tests are, or which tests are not collected by CI: use this skill.
- A diff or PR review, including functional regressions and test gaps in a change: use `code-auditor`. Do not use this skill.
- A maintainability or structure review: use `code-quality-review`. Do not use this skill.
- Applying a refactor: use `code-refactor`. Do not use this skill.
- Explaining one failure stack: answer the stack, or use the owning test workflow. Do not use this skill.
- A Trellis planning-artifact review: use `trellis-plan-review`. Do not use this skill.

## Compact Workflow

1. Resolve the repository root. Default to the current workspace when the user does not name one.
2. Run the inventory command in Command. Read stdout as one JSON object. Do not execute the target repository's recipes. Do not use the network.
3. Read `<skill-dir>/references/report-contract.md` and write the three-column report in the user's language.
4. Reclassify every `needs-review` row to `Covered` or `Shallow` after reading the test. Do not leave `needs-review` in the report. Do not treat a keyword as proof of `Covered`.
5. When `runner_status` is `runner-not-declared`, list locations only. Do not treat pytest or `node --test` default globs as that repository's collection facts. A separate note may say which filenames would fall outside those upstream defaults, and it must name the source.
6. Stop. `collected_by` means the declared recipe would collect the file. It does not mean the test passed. `python-check` in `runners` is compilation, not a passing test. `evals-check` in `runners` means a schema recipe exists. It does not mean a model executed `evals/evals.json`. Whether a model routes from `description` is missing evidence.

## Gate Ladder

- Audit is the default. Do not edit files in audit mode.
- Apply only when the current request explicitly asks to change tests. Edit or add test files only. Do not change product code as part of the audit.
- Do not write `Covered` from the script value `needs-review` without reading the assertion.
- Do not report a coverage percentage as completeness.
- Do not treat an external `tests/` directory as the only legal layout.
- Do not publish this package from this workflow.

## Output Contract

- Report three columns: location, collection, and behavior. See [report contract](references/report-contract.md).
- The target repository's `justfile` is the collection contract. See [runner notes](references/this-repo-runners.md).
- Every cell cites a path or a recipe command.
- Final behavior words are only `Covered`, `Shallow`, and `Missing`.
- Model routing is missing evidence. Do not claim it.

## Command

```bash
python "<skill-dir>/scripts/inventory_tests.py" "<repo-root>"
```

On Windows, `py -3` is an acceptable interpreter fallback when `python` is not on PATH. This repository's command uses `python`.

The script prints one JSON object to stdout. It does not write a file, execute a recipe, or use the network. `runners` lists recipe names from the `justfile`. `files[]` has `path`, `location` (`skill-tests`, `repo-tests`, or `unknown`), `collected_by` (a recipe name or an empty string), and `behavior`. `behavior` from the script is `Missing`, `Shallow`, or `needs-review`. When the repository has no `justfile`, the object also has `runner_status` `runner-not-declared` and every `collected_by` is empty.

## Upstream defaults (contrast only)

Use this section only when `runner_status` is `runner-not-declared`.

- pytest 9.1.1 discovers `test_*.py` and `*_test.py`. Source: pytest 9.1.1 good practices. This is not a collection fact for the target repository.
- Node's test runner, with no file arguments, uses six JavaScript globs: `**/*.test.{cjs,mjs,js}`, `**/*-test.{cjs,mjs,js}`, `**/*_test.{cjs,mjs,js}`, `**/test-*.{cjs,mjs,js}`, `**/test.{cjs,mjs,js}`, and `**/test/**/*.{cjs,mjs,js}`. TypeScript globs are also on unless `--no-strip-types` is set. Source: Node.js test runner docs read on 2026-10-06. This is not a collection fact for the target repository.

An external `tests/` directory is not the only legal layout.
