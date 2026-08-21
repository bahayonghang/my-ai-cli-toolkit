# Baseline trigger_eval (current SKILL.md, 2026-08-21)

Ran qiaomu-meta `trigger_eval.py` against the **current** descriptions with the draft concept tables. This is the gap this task must close. It is not a pass.

`--cases` must be an absolute path. A relative path is resolved from the skill directory, not the repo root.

## code-auditor 0.3.0

- `ok`: false
- description concepts present: `pr_diff`, `project_audit`
- missing required: `behavioral`, `independent`
- pass_rate: 0.556 (5/9)
- false_negative: 4 (all `should_trigger`)
- false_positive: 0

User original prompt score 0.333, matched only `pr_diff` (Git diff). Current description has no independent-reviewer or regression/concurrency/test-gap phrases, so the prompt stays under the 0.34 threshold.

`全维度的代码审计` (with 的) scored 0.0. Current description and the draft concept table use `全维度代码审计` (no 的). The live eval #6 prompt uses the 的 form. Description and concept table must accept both.

## code-quality-review 0.2.0

- `ok`: false
- description concepts present: `maintainability`, `quality_review`, `structure`
- pass_rate: 0.75 (6/8)
- false_negative: 2
- User original prompt correctly does **not** trigger CQR (`negative_pattern`: 功能回归)

Failures:

- `审查一下 … 代码质量` matched only `maintainability`. Concept table has `代码质量审查` but not `代码质量`.
- `改动的分层和归属` matched nothing. That phrase is absent from the current description.

## Files

- `research/baseline-code-auditor-trigger-eval.json`
- `research/baseline-code-quality-review-trigger-eval.json`
