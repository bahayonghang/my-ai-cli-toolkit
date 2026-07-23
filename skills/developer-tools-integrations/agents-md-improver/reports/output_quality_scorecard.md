# Output Quality Scorecard

This v0 scorecard compares static without-skill and with-skill outputs using assertion grading.

- Cases: `5`
- Baseline pass rate: `0.0`
- With-skill pass rate: `100.0`
- Delta: `100.0`
- Regressions: `0`
- Blind A/B pairs: `5`
- Gate pass: `True`

Blind review artifacts are generated separately so reviewers can inspect A/B outputs without seeing the answer key.
Run output review adjudication after reviewer decisions are recorded; pending cases should stay pending rather than being counted as human agreement.

## Evidence Scope

- Execution evidence: `recorded fixture` outputs only; this proves reproducibility, not model execution.
- Holdout cases: `2`
- Boundary cases: `1`
- Provider-backed GPT-5.6 execution: `missing evidence`; no external model call was authorized or run.
- Human blind A/B adjudication: `missing evidence`; all five reviewer decisions remain pending.

## Case Results

| Case | Baseline | With Skill | Delta | Winner | Failed With-Skill Assertions |
| --- | ---: | ---: | ---: | --- | --- |
| effective-instruction-chain | 0.0 | 100.0 | 100.0 | with_skill | None |
| navigation-only-candidate | 0.0 | 100.0 | 100.0 | with_skill | None |
| approved-edit-direct | 0.0 | 100.0 | 100.0 | with_skill | None |
| explicit-trivial-fast-path | 0.0 | 100.0 | 100.0 | with_skill | None |
| claude-only-near-neighbor | 0.0 | 100.0 | 100.0 | with_skill | None |

## Failure Taxonomy

- No with-skill assertion failures.

## Next Fixes

- Keep the two holdout cases separate from description tuning.
- Promote repeated failed assertions into the output-risk profile.
- Keep assertions tied to material deliverables, not phrasing trivia.
