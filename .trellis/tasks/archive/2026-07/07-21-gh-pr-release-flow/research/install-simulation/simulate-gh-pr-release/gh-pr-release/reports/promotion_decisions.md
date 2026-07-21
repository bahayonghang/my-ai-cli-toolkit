# Promotion Decisions

## Decision

Promote `gh-pr` 2.0.0 to the local governed package `gh-pr-release` 3.0.0.
This decision covers package migration only. It does not authorize pushing a tag,
publishing a GitHub Release, changing Latest, or any other remote write.

| Target | Decision | Route Evidence | Output Evidence | Blockers |
| --- | --- | --- | --- | --- |
| `gh-pr-release` | `promote` | 21/21 trigger, 11/11 exclusion, 9/9 near-neighbor, 10/10 route matrix | 6 recorded fixtures; baseline 0%; with-skill 100% | 0 local blockers |

## Evidence Boundary

- The output scorecard is recorded-fixture evidence, not provider-executed evidence.
- Independent human blind-review adjudication is `missing evidence`.
- Provider-backed model execution is `missing evidence`.
- Real-client adoption telemetry is `missing evidence`.
- Client-native permission enforcement is `missing evidence`; the generic installer
  enforces declared metadata permissions.
- This package does not claim public world-class readiness.

## Rollback Boundary

Before any remote write, reinstall `gh-pr` 2.0.0 for the former PR-only behavior.
Never delete, move, or re-push a published tag, and never delete a published
GitHub Release as rollback. Issue a new version instead.

## Evidence

- `reports/route_scorecard.json`
- `reports/output_quality_scorecard.json`
- `reports/conformance_matrix.json`
- `reports/security_trust_report.json`
- `reports/runtime_permission_probes.json`
- `reports/registry_audit.json`
- `reports/upgrade_check.json`
