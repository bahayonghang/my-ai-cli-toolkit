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
| current-skill-root | baseline | command | local-output-eval-runner | 67.69 | 38 | 0.0 | pass |
| current-skill-root | with_skill | command | local-output-eval-runner | 64.71 | 160 | 100.0 | pass |
| reuse-installed-browser | baseline | command | local-output-eval-runner | 65.84 | 32 | 0.0 | pass |
| reuse-installed-browser | with_skill | command | local-output-eval-runner | 65.77 | 136 | 100.0 | pass |
| preserve-mcp-provenance | baseline | command | local-output-eval-runner | 68.66 | 43 | 0.0 | pass |
| preserve-mcp-provenance | with_skill | command | local-output-eval-runner | 66.53 | 162 | 100.0 | pass |
| no-change-result | baseline | command | local-output-eval-runner | 65.83 | 42 | 0.0 | pass |
| no-change-result | with_skill | command | local-output-eval-runner | 62.81 | 140 | 100.0 | pass |
| old-cli-degradation | baseline | command | local-output-eval-runner | 64.81 | 43 | 0.0 | pass |
| old-cli-degradation | with_skill | command | local-output-eval-runner | 65.5 | 133 | 100.0 | pass |
| high-permission-preflight | baseline | command | local-output-eval-runner | 64.65 | 43 | 0.0 | pass |
| high-permission-preflight | with_skill | command | local-output-eval-runner | 63.33 | 203 | 100.0 | pass |

## Next Fixes

- Keep recorded fixtures as reproducible baselines, but do not describe them as model-executed evidence.
- Use `scripts/provider_output_eval_runner.py` for provider-backed holdout cases when release confidence depends on real generation behavior.
- Compare timing, token cost, and assertion deltas before promoting a skill to governed reuse.
