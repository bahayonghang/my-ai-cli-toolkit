# Implementation plan

## Approval gate

- [x] Read source article with ego-browser; inspect current skill and local contracts.
- [x] Produce source/adoption analysis and converged PRD/design.
- [x] Later implementation approval: user requested implementation according to this task on 2026-11-11; task.py start succeeded.
- [x] Load trellis-before-dev and relevant specs; verified clean dev worktree, curated manifests and native sub-agent dispatch. Preserve unrelated work.

## Ordered work

1. Verify official documentation for CSS features actually selected. Record source dates and fallback behavior; omit unverified browser-version claims. If scope expands to major redesign, run qiaomu prior-art discovery first.
2. Add the single earned craft-polish reference using the recipe contract in design.md. Link existing DA rules instead of duplicating them.
3. Wire the lean root hook and implementation/restyle verification paths. Preserve audit read-only, component APIs, dependencies, current routing and catalog/palette behavior.
4. Add repository-schema behavior evals and deterministic reference/boundary regression tests. Include existing-style preservation, Tooltip actions, reduced motion, interrupted transitions, streaming/number stability, new-CSS fallback and near-neighbor negatives.
5. Prepare five baseline/candidate output cases and review rubric. Execute available runtime checks; report unavailable provider/human review as missing evidence. Store anonymized A/B outputs separately from their answer key when human review is run.
6. Run qiaomu-specific trigger/IR evidence proportionally. Read current script help before invocation. Store reports under task research using absolute case paths. Keep raw exporter limitations and repository schema deviations explicit.
7. Align README/interface/version only to actual behavior. Regenerate docs through the existing generator if metadata changes.
8. Run checks, review scope/diff and produce a creation handoff listing reference lessons, rejections, design advantages and still-unvalidated hypotheses.

## Validation commands

- `python -m unittest discover -s skills/development-workflows/design-atlas/tests -p 'test_*.py'`
- `node --test skills/development-workflows/design-atlas/tests/slop_check.test.mjs`
- `just skills-check`
- `just evals-check` (schema only, NOT model execution)
- `just docs-sync` when public metadata or catalog-facing structure changes
- `just ci` before implementation completion
- `git diff --check`
- `git status --porcelain -uall` (repo hides untracked files by default)

Runtime evidence: desktop/mobile and 320px overflow checks; keyboard, touch, reduced motion, interrupted state, focus continuity and dynamic-update scenarios. Do not call static tests runtime checks or visual proof.

## Risk and rollback checkpoints

- Preserve Floor semantics, all existing gate ids/tiers and slop_check exit codes.
- Preserve source-of-truth first-party catalog files and airy-glass colourway behavior; no catalog writes are planned.
- Do not install packages for source research or change global qiaomu/ego skills.
- If a recipe cannot fit the current constraints, defer it rather than weakening gates.
- Revert only task-owned changes if verification fails; no reset of unrelated files.
- No commit, push, release, task activation or archive authorized by this planning turn.

## Implementation state (2026-11-11)

- [x] Official CSS/APG source checks and dated fallback ledger (`research/official-sources.md`).
- [x] Single craft reference and lean hooks; skill version 0.6.0, README/interface aligned.
- [x] Eleven behavior evals and three deterministic resource/gate-owner tests.
- [x] Five same-input comparison protocols and rubric (`research/comparison-cases.json`); outputs/human decisions remain missing evidence.
- [x] Qiaomu lexical trigger smoke 18/18 and raw IR export; external validator convention mismatches recorded in handoff.
- [x] Independent trellis-check review: no blocking findings; targeted checks passed.
- [x] Final docs generation, just ci (exit 0) and recorded handoff (`research/final-validation.md`, `research/implementation-handoff.md`).
- [x] User confirmed the concrete commit batch and requested all changes committed and this task archived on 2026-11-11; no push or release.

Runtime probe: an original fixture and replay runner are prepared. Importing the local Playwright namespace fails because its API is absent; native browser inventory also reported unavailable host/pipe. No runtime check, screenshot, browser compatibility or aesthetic improvement is claimed. See `research/runtime-results.json` and handoff for precise evidence.

## Planning-turn validation

See research/planning-validation.md for commands actually run. Implementation checkboxes remain pending; artifact existence is not implementation evidence.
