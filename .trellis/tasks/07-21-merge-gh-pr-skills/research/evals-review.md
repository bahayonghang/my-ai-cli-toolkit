# gh-pr Behavior Fixture Review

Reviewed manually on 2026-07-21 against `SKILL.md` and all six routed references.

| Route | Cases | Review result |
| --- | --- | --- |
| create | 1-2 | Covers existing-PR detection, fork refs, draft state, and separate push/create authorization. |
| review | 3-4 | Covers COMMENT batches and head-pinned inline REQUEST_CHANGES. |
| merge | 5-6 | Covers gated execution and read-only readiness inspection. |
| respond | 7-8 | Covers replies, exact resolution batches, stable ids, and fresh verification. |
| address-comments | 9-11 | Covers summary-only, selected fixes, fork base resolution, and the over-three-file confirmation gate. |
| fix-ci | 12-14 | Covers diagnosis-only, external-only, and approved local repair with bounded retries. |
| composite | 15 | Orders fix-ci before merge and keeps push/merge authorization separate. |
| near neighbors | 16-20 | Preserves code audit, maintainability review, commit, repository setup, and health-audit exclusions. |

All assertions are behavior-oriented and refer to live `gh-pr` routes. No fixture delegates to either removed skill name.
