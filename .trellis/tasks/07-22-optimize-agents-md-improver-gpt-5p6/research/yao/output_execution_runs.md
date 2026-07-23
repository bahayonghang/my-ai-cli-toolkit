# Output Execution Runs

This report records how output-eval variants were produced and whether timing or token evidence is observed or estimated.

- Cases: `5`
- Variant runs: `10`
- Command executed: `10`
- Model executed: `0`
- Recorded fixtures: `0`
- Timing observed: `10`
- Token observed: `0`
- Token estimated: `10`
- Delta: `100.0`
- Gate pass: `True`

No model-executed runs are recorded yet.

Use `python3 scripts/yao.py output-exec --provider-runner openai` or `--runner-command` with a reviewed provider-backed runner to replace recorded fixtures with real model output evidence.

Command runner evidence is present. This proves the eval harness executed an external command, but it is not provider-backed model evidence unless the runner reports model metadata.

## Runs

| Case | Variant | Mode | Model | Duration ms | Tokens | Score | Status |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| effective-instruction-chain | baseline | command | local-output-eval-runner | 91.5 | 68 | 0.0 | pass |
| effective-instruction-chain | with_skill | command | local-output-eval-runner | 74.24 | 177 | 100.0 | pass |
| navigation-only-candidate | baseline | command | local-output-eval-runner | 76.31 | 47 | 0.0 | pass |
| navigation-only-candidate | with_skill | command | local-output-eval-runner | 74.13 | 123 | 100.0 | pass |
| approved-edit-direct | baseline | command | local-output-eval-runner | 72.1 | 34 | 0.0 | pass |
| approved-edit-direct | with_skill | command | local-output-eval-runner | 73.02 | 111 | 100.0 | pass |
| explicit-trivial-fast-path | baseline | command | local-output-eval-runner | 70.88 | 49 | 0.0 | pass |
| explicit-trivial-fast-path | with_skill | command | local-output-eval-runner | 72.45 | 100 | 100.0 | pass |
| claude-only-near-neighbor | baseline | command | local-output-eval-runner | 73.93 | 41 | 0.0 | pass |
| claude-only-near-neighbor | with_skill | command | local-output-eval-runner | 74.5 | 84 | 100.0 | pass |

## Next Fixes

- Keep recorded fixtures as reproducible baselines, but do not describe them as model-executed evidence.
- Use `scripts/provider_output_eval_runner.py` for provider-backed holdout cases when release confidence depends on real generation behavior.
- Compare timing, token cost, and assertion deltas before promoting a skill to governed reuse.
