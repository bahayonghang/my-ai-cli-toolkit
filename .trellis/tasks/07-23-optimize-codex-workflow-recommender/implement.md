# Implement - Codex workflow recommender Production optimization

Implementation starts only after the user reviews this task and explicitly
authorizes Trellis Phase 1.4. Do not run `task.py start` during planning.

Use:

```text
<skill-dir> = skills/developer-tools-integrations/codex-workflow-recommender
<task-dir> = .trellis/tasks/07-23-optimize-codex-workflow-recommender
<yao-meta-dir> = C:/Users/lyh/.skillsmanage/skills/yao-meta
```

## Step 0 - Freeze baseline and load implementation guidance

- [x] Load `trellis-before-dev`, the repo skill-authoring guide and category
      `AGENTS.md` before target edits.
- [x] Recheck dirty status with `git status --porcelain=v1 -uall`; preserve all
      pre-existing Trellis framework changes and untracked agent templates.
- [x] Save concise baseline outputs under `<task-dir>/research/baseline/`:
      repo validator, Yao validate/resource/context, current CLI version/help,
      description, package file inventory and current docs entry.
- [x] Refresh the official Codex manual if implementation starts after
      2026-07-23; revise research only when facts changed.

Gate: preserve the `2079 > 1000`, missing interface/manifest, stale roots and
missing eval/test evidence before rewriting.

## Step 1 - Add failing fixtures and contract tests

- [x] Add `evals/evals.json` with bilingual positives and at least four
      near-neighbor routing negatives.
- [x] Add `evals/output/fixtures/codex-workflow-scenarios.md` as a
      `file-backed fixture` for roots, installed plugin, MCP provenance,
      no-change, old CLI and high-permission cases.
- [x] Add `evals/output/cases.jsonl` with baseline/with-skill outputs, semantic
      assertions and a holdout subset.
- [x] Add `tests/contracts.test.mjs` for roots, unsupported fields, reference
      reachability, JSON/YAML contracts, read-only behavior and report schema.
- [x] Prove the intended path, interface, resource and output-contract checks
      fail on the 1.0.0 baseline for the documented reasons.

Targeted gate:

```powershell
node --test "<skill-dir>/tests/contracts.test.mjs"
```

## Step 2 - Refactor description and lean entrypoint

- [x] Write the candidate bilingual description first with owned positives,
      read-only recommendation language and near-neighbor exclusions.
- [x] Save resolved baseline/final description text under task research for
      trigger evaluation.
- [x] Reduce `SKILL.md` to the authorization boundary, discovery/decision
      skeleton, success/output contract, reference router and stop rules.
- [x] Remove full report template, generic category catalog and duplicated
      surface prose from initial context.
- [x] Replace invalid PowerShell-in-Bash declarations with structured tools or
      reachable `rg`/`codex` command families; align category `AGENTS.md` row.

Gate:

```powershell
python "<yao-meta-dir>/scripts/resource_boundary_check.py" "<skill-dir>"
```

Default Production limit `<= 1000` must pass; a raised ceiling is diagnostic
only.

## Step 3 - Correct surface facts and references

- [x] Add `references/codex-surface-map.md` with `Last verified: 2026-07-23`,
      official URLs, CLI probes, roots, provenance labels, trust/policy and
      surface-specific degradation rules.
- [x] Correct all active skill roots to `.agents/skills` / `~/.agents/skills`;
      preserve `.codex/agents` / `~/.codex/agents` for native subagents.
- [x] Update subagent templates to the current standalone schema and remove
      `nickname_candidates` unless current docs/CLI later prove it supported.
- [x] Update plugin/MCP references to distinguish installed/enabled/available,
      direct config vs plugin-provided capabilities, and plugin-first reuse.
- [x] Update hook/config guidance for project trust, config precedence,
      managed policy, one-off overrides and privacy-safe diagnostics.
- [x] Consolidate or remove any reference whose content is duplicated or no
      longer routed from `SKILL.md`.

Gate: a repo-local skill recommendation points to `.agents/skills`, and a
plugin-provided MCP is not recommended again as direct config.

## Step 4 - Implement the decision and output contracts

- [x] Encode no-change as a first-class result and apply the hard minimum
      condition for each Codex surface.
- [x] Prefer installed/native capabilities before new skill/plugin/MCP/config
      proposals; derive sequence from dependencies, risk and reversibility.
- [x] Require evidence, provenance, existing capability, risk, prerequisites,
      confidence, verification and rollback/defer reason per recommendation.
- [x] Separate CLI/App/IDE/web scope and keep OMX conditional.
- [x] Replace forced category headings/CTA with outcome, evidence/unknowns,
      prioritized recommendations, sequence, verification/rollback and
      separated approval options.
- [x] Ensure raw doctor/config/auth/provider/env values never enter output.

## Step 5 - Align interface, manifest and release metadata

- [x] Add neutral `agents/interface.yaml` with read-only activation, inline
      execution, local trust and version/surface degradation behavior.
- [x] Add Production `manifest.json` with owner `lyh`, quarterly review,
      context tier, active lifecycle, target adapters and consumed resources.
- [x] Bump version to `1.1.0` only after the behavioral contract is final.
- [x] Generate only output-risk, prompt-quality and output-quality reports that
      are consumed by review; remove empty/decorative tool-created folders.

Validate:

```powershell
python "<yao-meta-dir>/scripts/validate_skill.py" "<skill-dir>"
python "<yao-meta-dir>/scripts/export_skill_ir.py" "<skill-dir>" --validate-only
```

## Step 6 - Run trigger and output evaluation

- [x] Freeze dev and untouched holdout trigger cases before tuning wording.
- [x] Run `trigger_eval.py` with a resolved description file and investigate
      every false positive/negative.
- [x] Run output eval on the six file-backed cases; require with-skill pass rate
      above baseline and inspect every failed assertion.
- [x] Generate blind pack/answer key and reviewed risk/prompt profiles.
- [x] Run deterministic command-runner evidence only as command evidence.
      Provider execution, human adjudication and telemetry remain
      `missing evidence` unless actually collected with separate authority.

Command shapes:

```powershell
python "<yao-meta-dir>/scripts/trigger_eval.py" `
  --description-file "<task-dir>/research/final-description.txt" `
  --cases "<task-dir>/research/trigger-cases.json" `
  --semantic-config "<task-dir>/research/semantic-config.json"

python "<yao-meta-dir>/scripts/yao.py" --no-cli-telemetry output-eval `
  --cases "<skill-dir>/evals/output/cases.jsonl" `
  --output-md "<skill-dir>/reports/output_quality_scorecard.md" `
  --output-json "<skill-dir>/reports/output_quality_scorecard.json"
```

## Step 7 - Complete Yao Production disposition

- [x] Export Skill IR and compile OpenAI/Claude/generic contracts to task
      research; run conformance for declared targets.
- [x] Run trust and confirm the actual read-only/no-script boundary.
- [x] Run Skill Atlas against `agents-md-improver`, `openai-docs`,
      `agent-skill-review`, `goal-meta-skill` and `codex-dynamic-workflows`.
- [x] Run registry audit, package export/verify, temporary install simulation,
      upgrade comparison and drift checks.
- [x] Render Review Studio under `<task-dir>/research/yao/`; resolve required
      local deterministic failures and disposition every warning/blocker.
- [x] Do not commit package archives, temp installs, raw local config/doctor
      output or decorative reports into the skill.

## Step 8 - Sync docs and run final verification

- [x] Update only the target allowed-tools/eval/interface status in category
      `AGENTS.md`.
- [x] Run `just docs-sync`; inspect generated Chinese/English pages for version,
      description and resource inventory.
- [x] Run the full gate:

```powershell
python scripts/check.py "<skill-dir>" --json
node --test "<skill-dir>/tests/contracts.test.mjs"
just skills-check
just node-test
just docs-check
just ci
git diff --check
git status --porcelain=v1 -uall
```

- [x] Review final diff against every PRD acceptance criterion and confirm the
      pre-existing Trellis changes remain untouched.

## Review Gates

- No current guidance publishes `.codex/skills` as a Codex skill root.
- No recommendation is emitted from technology detection alone.
- No installed/plugin-provided capability is proposed as a duplicate setup.
- No raw sensitive diagnostic/config evidence appears in reports or fixtures.
- No static category ordering overrides dependency, permission or rollback.
- No fixture, local runner or generated report is called provider/human evidence.
- No target skill implementation begins before explicit post-plan approval.

## Rollback Points

1. Failing tests/fixtures may land before prompt changes only in the task worktree;
   they do not justify publishing a broken package.
2. Entrypoint, surface map and decision/output contract form one behavior unit.
3. Interface, manifest, evals, reports, version and generated docs form one
   Production release unit and must not ship without the corrected lean core.
4. Task research is historical evidence and remains even if source changes roll
   back; temp package/install outputs are disposable.
