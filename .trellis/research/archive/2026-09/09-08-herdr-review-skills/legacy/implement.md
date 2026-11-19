# Implementation plan

## Current phase

Implementation authorized on 2026-09-08: the user replied “按照这份方案开始实施” after reviewing the final plan. Planning checks and independent audit are complete. The orchestra child is started first; review follows its checked delegation contract. Existing runtime/installation and local-delivery boundaries still apply.

## Ordered work

1. Re-read the two research reports and prior-art synthesis. Confirm scope, first-party paths and the explicit runtime/installation evidence boundary in `prd.md`.
2. Validate each member's real context manifests and run the recursive mechanical precheck. Resolve structural/traceability errors before final planning handoff.
3. After final planning approval, start `09-08-herdr-orchestra-skill`. Dispatch `trellis-implement` with native context injection or child-side read fallback, exclusive ownership of that source directory, then `trellis-check` for that child. Do not start the parent as a substitute for the source-owning child.
4. Freeze the orchestra delegation reference. Start `09-08-herdr-codex-review-skill` and implement its adapter against that contract; dispatch implement/check in the same way, owning only the review directory. A change to the shared contract requires both packages' cases to be re-evaluated.
5. Review combined routing: orchestra vs basic Herdr; Herdr Codex review vs generic review and codex-bridge; leaf reviewer must not recurse. Read descriptions together and assess all clauses of parent acceptance criteria.
6. Run package metadata checks and the qiaomu validate/export/trigger commands specified by each child. Record actual schema deviations and lexical-versus-semantic evidence. Perform an isolated install/discovery check only within explicit target authority; never overwrite the current third-party activation.
7. Run `rtk proxy just docs-sync`, then `rtk proxy just ci` once after the final source changes. Fix task-caused failures; report unrelated failures separately. Inspect `rtk git status --porcelain -uall` and `rtk git diff --check` so untracked task/source files are visible.
8. Assess spec updates: only record a reusable contract actually established by the implementation. No changes to Trellis runtime, platform model tables, unrelated skills or user-global setup.
9. Complete the authorized local delivery under the repository commit/finish workflow after rechecking its current authority. Do not push, publish, or archive an incomplete runtime claim. Final handoff lists source paths, studied candidates and specific lessons, design/validated/hypothesis labels, verification and remaining evidence gaps.

## Planning verification commands

```text
rtk proxy python .trellis/scripts/task.py validate .trellis/tasks/09-08-herdr-review-skills
rtk proxy python .trellis/scripts/task.py validate .trellis/tasks/09-08-herdr-orchestra-skill
rtk proxy python .trellis/scripts/task.py validate .trellis/tasks/09-08-herdr-codex-review-skill
```

Use the installed `trellis-plan-review/scripts/plan_precheck.py` with the parent directory and `--include-descendants`; its output proves structure/anchors only, not readiness or implementation authorization.

## Risk and evidence boundary

- Package source and manual/lexical cases are testable locally without launching a model.
- A real Herdr/Codex smoke must prove readiness with `--no-alt-screen`, review submission, full result collection, untouched reviewed input and preserved user focus in an owned scope. No real smoke is claimed by this plan.
- Automatic alternate-screen history scrolling may be UI input. Do not trigger it under a no-UI request just because the CLI command is named read.
- Current third-party `codex-review` activation is outside the file ownership of either implementer. Fresh-session discovery remains unverified until separately scoped and tested.
- Rollback follows `design.md`; preserve initial clean baseline and all later unrelated dirt.
