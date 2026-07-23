# Output Execution Runs

This report records how output-eval variants were produced and whether timing or token evidence is observed or estimated.

- Cases: `6`
- Variant runs: `12`
- Command executed: `12`
- Model executed: `0`
- Recorded fixtures: `0`
- Timing observed: `12`
- Token observed: `0`
- Token estimated: `12`
- Delta: `100.0`
- Gate pass: `True`

No model-executed runs are recorded yet.

Use `python3 scripts/yao.py output-exec --provider-runner openai` or `--runner-command` with a reviewed provider-backed runner to replace recorded fixtures with real model output evidence.

Command runner evidence is present. This proves the eval harness executed an external command, but it is not provider-backed model evidence unless the runner reports model metadata.

## Runs

| Case | Variant | Mode | Model | Duration ms | Tokens | Score | Status |
| --- | --- | --- | --- | ---: | ---: | ---: | --- |
| protected-descendant | baseline | command | local-output-eval-runner | 67.79 | 32 | 0.0 | pass |
| protected-descendant | with_skill | command | local-output-eval-runner | 72.72 | 86 | 100.0 | pass |
| identity-drift | baseline | command | local-output-eval-runner | 71.26 | 36 | 0.0 | pass |
| identity-drift | with_skill | command | local-output-eval-runner | 64.51 | 77 | 100.0 | pass |
| false-taskkill-success | baseline | command | local-output-eval-runner | 69.43 | 30 | 0.0 | pass |
| false-taskkill-success | with_skill | command | local-output-eval-runner | 63.35 | 70 | 100.0 | pass |
| workspace-boundary | baseline | command | local-output-eval-runner | 67.76 | 36 | 0.0 | pass |
| workspace-boundary | with_skill | command | local-output-eval-runner | 67.39 | 79 | 100.0 | pass |
| uwp-csv-failure | baseline | command | local-output-eval-runner | 65.79 | 43 | 0.0 | pass |
| uwp-csv-failure | with_skill | command | local-output-eval-runner | 67.96 | 78 | 100.0 | pass |
| phone-link-registry | baseline | command | local-output-eval-runner | 65.32 | 53 | 0.0 | pass |
| phone-link-registry | with_skill | command | local-output-eval-runner | 67.64 | 107 | 100.0 | pass |

## Next Fixes

- Keep recorded fixtures as reproducible baselines, but do not describe them as model-executed evidence.
- Use `scripts/provider_output_eval_runner.py` for provider-backed holdout cases when release confidence depends on real generation behavior.
- Compare timing, token cost, and assertion deltas before promoting a skill to governed reuse.
