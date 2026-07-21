# Review Waivers

- OK: `True`
- Waivers: `3`
- Active: `3`
- Expired: `0`
- Invalid: `0`
- Covered gates: `operations-loop, output-lab, skill-atlas`
- Waiver candidates: `1`
- Open waiverable candidates: `0`
- Non-waivable boundaries: `0`

## Policy

- Blocker waivers allowed: `False`
- Minimum reason chars: `20`
- Expiry is required for every waiver.
- World-class evidence completion cannot be waived; it can only be proven by accepted ledger evidence.
- Review Studio gates: `architecture-maintainability, context-budget, intent-canvas, operations-loop, output-lab, permission-gates, permission-runtime, python-compat, registry-audit, release-notes, review-waivers, runtime-matrix, skill-atlas, trigger-lab, trust-report, world-class-evidence`
- Waiverable gates: `architecture-maintainability, context-budget, intent-canvas, operations-loop, output-lab, permission-gates, permission-runtime, python-compat, registry-audit, release-notes, runtime-matrix, skill-atlas, trigger-lab, trust-report`
- Non-waivable gates: `review-waivers, world-class-evidence`

## Waivers

| ID | Gate | Decision | Reviewer | Status | Expires | Reason |
| --- | --- | --- | --- | --- | --- | --- |
| `851d194ab0c3` | `output-lab` | `accepted-risk` | lyh | `active` | `2027-07-21` | Recorded fixtures pass locally; provider-backed execution and independent blind adjudication remain unavailable for this 3.0.0 release. |
| `c4e28a31de64` | `skill-atlas` | `accepted-risk` | lyh | `active` | `2027-07-21` | Portfolio owner, staleness, and route-collision debt predates this skill and is accepted for the bounded 3.0.0 release. |
| `379be9e0dd38` | `operations-loop` | `accepted-risk` | lyh | `active` | `2027-07-21` | No real adoption telemetry exists before the first release; the explicit no-data state is accepted for the bounded 3.0.0 release. |

## Candidate Actions

| Gate | Status | Waiver | Risk | Evidence |
| --- | --- | --- | --- | --- |
| `output-lab` | `covered` | `true` | review pending 0; model-executed 0; output failures 0 | `reports/output_review_adjudication.md` |

### Output Lab

- gate: `output-lab`
- status: `covered`
- waiver allowed: `true`
- risk: review pending 0; model-executed 0; output failures 0
- evidence: `reports/output_review_adjudication.md`
- verification: `python3 scripts/yao.py review-waivers . --add-waiver --gate-key output-lab --reviewer "<reviewer>" --reason "Output Lab has pending human/provider evidence; accepted only for this bounded review scope." --expires-at 2027-07-21 --evidence reports/output_review_adjudication.md`
- world-class boundary: Does not count as provider, human, or public world-class completion evidence.

#### Required Review

- Reviewer confirms this release does not claim provider-backed or human-adjudicated output superiority.
- Reviewer names the release scope and expiry date.
- Reviewer links output_review_adjudication or output_execution evidence.

## Failures

- None

## Warnings

- None
