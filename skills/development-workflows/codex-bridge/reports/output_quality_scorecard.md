# Output Quality Scorecard

## Scope

This scorecard covers the codex-bridge package contract, not Codex model quality in general.

| Dimension | Evidence | Status |
| --- | --- | --- |
| Bundle construction | `bundle-scripts.test.mjs`; targeted suite 18/18 | Passed 2026-07-22 |
| Preflight validation | Positive and negative fixture tests | Passed 2026-07-22 |
| Post-response validation | Scenario schema and missing-response tests | Passed 2026-07-22 |
| Sandbox integrity | Project override and tampered-manifest tests | Passed 2026-07-22 |
| Windows execution | Resolved `codex.cmd` and non-ASCII path tests | Passed 2026-07-22 |
| Routing boundary | yao-meta: 4 positive, 4 negative, 4 near-neighbor cases | Precision 1.0, recall 1.0 |
| Trust and permissions | yao-meta trust report; help smoke 3/3, approvals 2/2 | Passed with zero-dependency warning |
| Manual lifecycle smoke | Create, preflight, Windows dry-run, forged response, post-response | Passed 2026-07-22 |
| Repository CI | Docs build, metadata, Python compile, Node tests, whitespace | Passed 2026-07-22 |
| Live `codify` output quality | No representative production run recorded | `missing evidence` |
| Model latency, cost, and comparison benchmark | No reproducible benchmark recorded | `missing evidence` |

## Release rule

The package may claim deterministic helper and routing checks only after their recorded commands pass. It must not claim representative Codex output quality, cost, latency, or model superiority until reproducible evidence is added.
