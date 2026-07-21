# Behavior Eval Manual Review

Reviewed: 2026-07-21

Reviewer: Codex implementation review (manual assertion inspection, not an independent human or model execution)

## Scope

- Parsed `skills/git-github-collaboration/gh-pr-release/evals/evals.json` successfully.
- Confirmed IDs are unique and contiguous from 1 through 38.
- Re-read prompts, expected outputs, and assertions for release cases 21 through 38.
- Checked the new cases against `prd.md`, `design.md`, `references/release-pr.md`, and `references/release-publish.md`.

## Coverage

| Contract | Cases | Review result |
| --- | --- | --- |
| release-pr positive routes | 21, 22 | Covered: manual plan/edit boundary and automation-owned PR |
| release-publish positive routes | 23, 24 | Covered: topology, green evidence, draft-first publication, exact-run assets |
| chained flow | 25 | Covered: fix-ci -> merge -> release-publish with independent writes |
| destructive refusal | 26 | Covered: no tag movement or published Release deletion |
| idempotent existing state | 27, 28 | Covered: equal tag and workflow-produced draft |
| incomplete evidence | 29, 30 | Covered: no run and pending run remain blocked |
| topology ambiguity | 31 | Covered: no default to manual topology C |
| indirect side effects | 32 | Covered: registry and deployment effects enter tag authorization |
| immutable/clobber/build/Latest boundaries | 33-36 | Covered: publication lock, asset loss, pinned clean build, separate Latest |
| near-neighbor negatives | 37, 38 | Covered: workflow authoring routes to gh-bootstrap; registry-only publishing is excluded |

The adversarial set contains ten cases (27-36), exceeding the required nine, and covers same-SHA tag idempotence, workflow-owned Release state, absent/pending run evidence, workflow ambiguity, indirect registry/deploy effects, immutable Releases, clobber, dirty/non-pinned builds, and automatic Latest selection. The different-SHA retag refusal is covered by case 26.

## Evidence Boundary

This review proves internal fixture consistency only. The behavior fixtures are not executed by repository CI, and no provider-backed model or independent blind reviewer ran them in this review. Those execution and reviewer signals remain `missing evidence`; the Governed output eval keeps recorded fixtures labeled separately.
