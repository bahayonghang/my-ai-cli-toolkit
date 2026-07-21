# Output Quality Scorecard

This v0 scorecard compares static without-skill and with-skill outputs using assertion grading.

- Cases: `6`
- Baseline pass rate: `0.0`
- With-skill pass rate: `100.0`
- Delta: `100.0`
- Regressions: `0`
- Blind A/B pairs: `6`
- Gate pass: `True`

Blind review artifacts are generated separately so reviewers can inspect A/B outputs without seeing the answer key.
Run output review adjudication after reviewer decisions are recorded; pending cases should stay pending rather than being counted as human agreement.

## Case Results

| Case | Baseline | With Skill | Delta | Winner | Failed With-Skill Assertions |
| --- | ---: | ---: | ---: | --- | --- |
| file-backed-tag-workflow | 0.0 | 100.0 | 100.0 | with_skill | None |
| release-please-pr-owner | 0.0 | 100.0 | 100.0 | with_skill | None |
| missing-target-ci | 0.0 | 100.0 | 100.0 | with_skill | None |
| existing-tag-idempotence | 0.0 | 100.0 | 100.0 | with_skill | None |
| registry-only-near-neighbor | 0.0 | 100.0 | 100.0 | with_skill | None |
| workflow-authoring-boundary | 0.0 | 100.0 | 100.0 | with_skill | None |

## Failure Taxonomy

- No with-skill assertion failures.

## Next Fixes

- Add holdout cases before using this as a release gate.
- Promote repeated failed assertions into the output-risk profile.
- Keep assertions tied to material deliverables, not phrasing trivia.
