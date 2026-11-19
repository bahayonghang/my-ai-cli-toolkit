# Implement - windows-dev-process-cleanup Governed hardening

Execution starts only after the user reviews these artifacts and runs/authorizes Trellis Phase 1.4. Do not call `task.py start` as part of planning.

Use:

```text
<skill-dir> = skills/developer-tools-integrations/windows-dev-process-cleanup
<yao-meta-dir> = the loaded yao-meta-skill directory
```

## Step 0 - Freeze baseline and resolve the Phone Link evidence gate

- [x] Re-run current targeted tests, repo validator, read-only audits and default/1300-token yao boundary checks; save concise outputs in task `research/`.
- [x] Verify `tasklist /apps`, `/fo csv`, `taskkill /T` and Phone Link background-control behavior against current Microsoft sources and current Windows local help.
- [x] Write `references/windows-command-contracts.md` with `Last verified`, exact sources, conflicts and unsupported assumptions.
- [x] Decide the Phone Link branch per design: supported + reversible, or deprecated/fail-closed. Record the version impact before editing public docs.

Gate: no implementation may preserve the registry-disable claim solely because the current code already writes those values.

## Step 1 - Add deterministic red tests and fixtures

- [x] Add process-graph `file-backed fixture` cases: normal orphan npm, Playwright wrappers, protected descendant, unknown non-node descendant, single-command multi-role, newly added descendant, PID identity replacement.
- [x] Add workspace fixtures for exact match, sibling prefix, case, quotes, separators and nonexistent path.
- [x] Add UWP CSV fixtures with full package identity, non-English memory text, malformed columns, invalid PID and command failure.
- [x] Registry before/after/restore fixtures are not applicable because version 2.0 removes the unsupported registry mutation path.
- [x] Extract/inject pure PowerShell functions as needed so fixtures test selection and execution without top-level live enumeration.

Verify the new tests fail for the intended current behavior before production changes. Keep live-machine tests audit/WhatIf only.

## Step 2 - Close the dev-process graph and selector gaps

- [x] Build the full `Win32_Process` map once and compute complete affected descendant closures.
- [x] Replace first-match member classification with multi-role facts while preserving compatible tree-level fields.
- [x] Emit per-member identity/command/category/protection facts and `blocked_targets`.
- [x] Centralize profile predicates; add positive `StaleMinutes` validation.
- [x] Normalize and boundary-match `WorkspacePath`; reject unsafe cleanup path states.
- [x] Build `plan_id` and preconditions from ordered fingerprints.

Targeted verify:

```powershell
node --test "<skill-dir>/tests/audit-scripts.test.mjs"
pwsh -NoLogo -NoProfile -NonInteractive -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode audit -AsJson
pwsh -NoLogo -NoProfile -NonInteractive -File "<skill-dir>/scripts/audit-dev-processes.ps1" -Mode cleanup -Profile safe -WhatIf -AsJson
```

No non-WhatIf cleanup command is allowed.

## Step 3 - Add precondition and verified-result execution

- [x] Recapture root identities and descendant closures immediately before the injected kill action.
- [x] Return `precondition-failed` with zero kill calls when any identity, closure or protection fact drifts.
- [x] Verify every planned member after taskkill; include taskkill status but do not derive final success from it alone.
- [x] Add per-member outcomes and aggregate result tests for false-success, partial, not-found and identity-changed cases.

Gate: a shim returning exit code 0 while a planned member remains alive must fail the aggregate result.

## Step 4 - Replace UWP display parsing and settle registry behavior

- [x] Parse `tasklist /apps /fo csv /nh` using explicit schema and command-status validation.
- [x] Normalize package/process identities and prevent cleanup on parse/schema failure.
- [x] Add precondition identity checks to UWP PID cleanup.
- [x] Implement the selected Phone Link branch:
  - supported: before/after facts, WhatIf, restore path and partial-failure tests;
  - unsupported: deprecation/fail-closed behavior, no mutation, no unsupported claim.
- [x] Keep Dolby terminate-only and prove no registry/package/service mutation path exists.

Targeted verify:

```powershell
pwsh -NoLogo -NoProfile -NonInteractive -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode audit -AsJson
pwsh -NoLogo -NoProfile -NonInteractive -File "<skill-dir>/scripts/audit-uwp-backgroundtasks.ps1" -Mode cleanup -Profile dolby-backgroundtask -WhatIf -AsJson
```

## Step 5 - Refactor the skill entrypoint and add Governed contracts

- [x] Reduce `SKILL.md` to trigger, safe execution skeleton, branch selection and output contract.
- [x] Move detailed safety/profile guidance to `references/safety-policy.md`; link every deferred resource.
- [x] Add `manifest.json` with owner, quarterly cadence, Governed lifecycle, `input_files`/`file-backed fixture`, `output contract`, `rollback boundary`, and `trust report`.
- [x] Extend `agents/interface.yaml` with compatibility, activation, Windows/PowerShell execution, trust and degradation fields accepted by yao validate.
- [x] Add `security/permission_policy.json` with reviewed, expiring approvals for actual capabilities only.
- [x] Generate/update `reports/output-risk-profile.md`, `reports/security_trust_report.md`, and `reports/output_quality_scorecard.md`.
- [x] State that yao PowerShell automated trust coverage is `missing evidence`; include manual inventory/test evidence instead of claiming `script_count: 0` is a pass.

Resource/governance verify:

```powershell
python "<yao-meta-dir>/scripts/validate_skill.py" "<skill-dir>"
python "<yao-meta-dir>/scripts/resource_boundary_check.py" --max-initial-tokens 1300 "<skill-dir>"
python "<yao-meta-dir>/scripts/governance_check.py" --require-manifest "<skill-dir>"
python "<yao-meta-dir>/scripts/trust_check.py" "<skill-dir>" --output-json "<skill-dir>/reports/security_trust_report.json" --output-md "<skill-dir>/reports/security_trust_report.md"
```

After trust generation, manually correct only the evidence interpretation: do not edit generated counts to pretend PowerShell was scanned.

## Step 6 - Add routing and output evaluation

- [x] Add repo `evals/evals.json` using `assertions`, with behavior positives and at least two routing negatives.
- [x] Add task `research/trigger-cases.json` and `semantic-config.json` for dev/UWP positives, should-not-trigger and near neighbors.
- [x] Run yao `trigger_eval.py` against the final frontmatter description; save output in task research.
- [x] Add output cases that compare baseline vs skill-guided safety plans and generate blind A/B artifacts plus `reports/output_quality_scorecard.md`.
- [x] Mark recorded fixtures as recorded fixtures, not model evidence. Mark provider execution, human adjudication and telemetry `missing evidence` unless actually performed.

Trigger gate:

```powershell
python "<yao-meta-dir>/scripts/trigger_eval.py" --cases ".trellis/tasks/07-22-harden-windows-dev-process-cleanup/research/trigger-cases.json" --semantic-config ".trellis/tasks/07-22-harden-windows-dev-process-cleanup/research/semantic-config.json" --description-file "<skill-dir>/SKILL.md"
```

For output eval, run `yao.py output-eval` from `<skill-dir>` with explicit case/output paths, then run deterministic `output-exec` only as command-runner evidence. Do not require external credentials.

## Step 7 - Align docs, version and generated catalog

- [x] Update both README files, SKILL, script help/comments and interface to the same profiles, result values, registry decision and safe validation examples.
- [x] Set `1.2.0` for compatible additive hardening or `2.0.0` for hard Phone Link behavior removal; update manifest/interface/catalog consistently.
- [x] Run `just docs-sync` once public metadata is final.

## Step 8 - Verification and review gate

- [x] `python scripts/check.py "<skill-dir>"`
- [x] targeted Node test file
- [x] `just skills-check`
- [x] `just node-test`
- [x] `just docs-check`
- [x] `just ci`
- [x] `git diff --check`
- [x] `git status --porcelain=v1 -uall` and final diff review for unrelated files
- [x] Re-run yao validate/resource/governance/trust/trigger/output gates and disclose every `missing evidence` item.
- [x] Review all PRD acceptance criteria and rollback boundary before `task.py finish/archive`.

## Review Gates

- No real process termination or registry write in tests/verification.
- No automatic cleanup when the affected closure is incomplete or changed.
- No raw workspace substring selection.
- No duplicated stale predicate.
- No unsupported Phone Link disable claim.
- No claim that yao trust automatically scanned `.ps1`.
- No provider/human/telemetry evidence fabricated from fixtures.

## Rollback Points

1. Graph/selector/test changes can be reverted as one safety-core unit.
2. UWP/Phone Link decision can be reverted independently only before public docs/version are updated.
3. Governed metadata/evals/docs form one release-contract unit and should not ship without the safety core.
4. Process termination has no runtime rollback; fail-closed planning and preconditions are the mitigation.
