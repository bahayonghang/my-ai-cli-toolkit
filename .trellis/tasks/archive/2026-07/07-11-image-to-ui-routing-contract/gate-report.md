# Production Gate Report: image-to-ui-skill routing contract

## Mode

- Mode: Production (team-reused, public installable skill).
- Not Governed/release-critical in this task.

## Boundary

- Trigger: a supplied UI screenshot/design/reference that must become code or a clickable app/web prototype.
- Capability boundary: separate semantic code UI from bitmap assets; generate assets only when the referenced visual requires them.
- Write boundary: SKILL.md routing/index, `agents/interface.yaml`, package evals, and task evidence only.

## Exclusion

- Standalone image generation or poster-only output.
- Reference-free UI implementation or visual polish.
- Data visualization, copy-only landing pages, and unrelated frontend work.

## Output Contract

- Positive cases produce an interactive reference recreation, not a flattened screenshot.
- Text, controls, layout, and interactions remain code-rendered.
- Required bitmap assets use the registered image2/fallback boundary, are integrated into the page, and are verified in rendered output.

## Executed Gates

- Description length: 199 Unicode characters.
- Description review: capability + bilingual triggers + routing exclusions; no fallback order, screenshot workflow, or iOS-frame execution policy.
- Interface alignment: display name, short description, and default prompt reviewed together.
- Reference index: 8/8 `references/*.md` filenames represented.
- Package evals: 6 positive + 6 negative; every entry uses `assertions`.
- Manual trigger evaluation: 12/12 PASS; details in `trigger-eval.md`.
- Repository checks: recorded after implementation in this task's PRD evidence section.

## Waiver

- Governed-only `trust report` and `reports/output_quality_scorecard.md` are not required because this is not a Governed package or release-critical publication.
- Generated docs synchronization is deferred to the parent integration task to avoid repeated regeneration across children.

## Missing Evidence

- `missing evidence`: yao-meta `trigger_eval.py` is absent from the installed package.
- `missing evidence`: yao-meta references for Skill IR, compiler, Skill Atlas, conformance, trust, registry/package/install, upgrade, drift, and Review Studio are absent from the installed package, so those automated gates were not run.
- No telemetry, approval metrics, benchmark scores, or production routing logs are available; none are fabricated.

## Rollback Boundary

- Revert the SKILL.md frontmatter/index, `agents/interface.yaml`, and `evals/evals.json` as one routing-contract batch if routing regressions appear.
- Task reports are evidence only and do not alter runtime behavior.
- Assets, wrapper logic, demos, and validators are outside this child and must remain unchanged by its rollback.
