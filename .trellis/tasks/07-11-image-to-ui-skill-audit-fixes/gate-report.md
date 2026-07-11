# Integration Gate Report: image-to-ui-skill audit fixes

## Mode And Boundary

- Mode: Production, not Governed/release-critical.
- Boundary: image-to-ui skill package, its generated docs, three-OS CI opt-in wiring, Trellis task evidence, and the reusable backend helper contracts learned during implementation.
- Excluded: demo UI source changes, tracked assets/screenshots, new image providers, Node baseline changes, npm dependencies, push/release effects without separate authorization.

## Output Contract

- Wrapper preserves argv values, has side-effect-free dry-run behavior, and reports unavailable fallback prerequisites without claiming success.
- Routing selects supplied UI-reference recreation, excludes image-only/reference-free work, and keeps interface/evals aligned.
- Validator runs on Node 20 with deterministic core tests, default browser skip, explicit fail-closed opt-in, and old/new parity evidence.

## Local Evidence

- `just ci`: PASS.
- Default Node suite: 167 total, 165 pass, 2 explicit browser skips.
- Browser opt-in Node suite: 167/167 pass, 0 skip.
- Direct ArtMuse and Marble validators: PASS with desktop/mobile screenshots.
- Legacy root/demo validators: PASS before deletion; parity matrix PASS.
- Description 199 characters; references 8/8; evals 12 with 6 positive and 6 negative.
- Assets and tracked screenshots: zero diff.
- `.ps1` files and `validate.ps1` references: zero.

## Missing Evidence

- `missing evidence`: GitHub ubuntu/windows/macos browser jobs have not run because push/PR has not been authorized.
- `missing evidence`: installed yao-meta package lacks its referenced scripts and references, so trigger_eval, Skill IR/compiler, Skill Atlas, conformance, trust, registry/package/install, upgrade, drift, and Review Studio automation were not run.
- No production routing telemetry, approval metrics, or benchmark scores are available; none are fabricated.

## Waiver

- Governed-only trust report and output quality scorecard are not required for this Production maintenance task.
- Remote three-OS evidence is not waived: the parent task remains incomplete until authorization is granted and those jobs pass.

## Rollback Boundary

- Wrapper/routing/validator source and tests form the primary work batch.
- Generated docs form a separate reproducible batch.
- Trellis planning/evidence forms a bookkeeping batch.
- If remote CI finds a platform regression, fix the validator child or revert the independent validator deletion portion; never restore success by converting explicit opt-in failures to skips.
