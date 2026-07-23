# Implement - agents-md-improver GPT-5.6 Production optimization

Implementation starts only after the user reviews this task and explicitly
authorizes Trellis Phase 1.4. Do not run `task.py start` during planning.

Use:

```text
<skill-dir> = skills/developer-tools-integrations/agents-md-improver
<task-dir> = .trellis/tasks/07-22-optimize-agents-md-improver-gpt-5p6
<yao-meta-dir> = the loaded yao-meta-skill directory
```

## Step 0 - Freeze baseline and load implementation guidance

- [x] Run `trellis-before-dev` and read the skill-authoring convention index
      before touching target files.
- [x] Re-run repo check, yao validate/resource/Skill IR, and current description
      trigger smoke; save concise outputs under `<task-dir>/research/baseline/`.
- [x] Snapshot current `1.1.0` packaging/registry metadata needed by later
      upgrade comparison.
- [x] Reconfirm official OpenAI pages and dates if implementation occurs after
      2026-07-22; update `research/openai-official-guidance.md` only when facts
      changed.

Gate: do not rewrite prompts until the baseline failures and current public
description are preserved.

## Step 1 - Add failing contract fixtures and tests

- [x] Add repo `evals/evals.json` with positive behavior cases and routing
      negatives for Claude-only, workflow recommendation, trivial edit, and
      ordinary review boundaries.
- [x] Add `evals/output/fixtures/agents-md-scenarios.md` as a `file-backed
      fixture` covering override/fallback/CWD/budget, navigation-only, approved
      edit, and shared code-map cases.
- [x] Add `evals/output/cases.jsonl` with baseline/with-skill assertions and a
      holdout subset.
- [x] Add `tests/contracts.test.mjs` for stale paths, official-semantics anchors,
      JSON parseability, report contract, reference reachability, and sibling
      fenced-template parity.
- [x] Prove at least the override/stale-path/current-interface/resource
      assertions fail on the 1.1.0 baseline for the intended reasons.

Targeted gate:

```powershell
node --test "<skill-dir>/tests/contracts.test.mjs"
```

## Step 2 - Refactor the trigger and lean entrypoint

- [x] Write the candidate frontmatter description first: retain bilingual
      audit/update/code-map signals and add precise exclusions without an
      exhaustive keyword dump.
- [x] Save the resolved candidate to `<task-dir>/research/final-description.txt`;
      do not pass folded `SKILL.md` frontmatter directly to `trigger_eval.py`.
- [x] Rewrite `SKILL.md` around one intent/authorization router, outcome/success
      contract, evidence/tool flow, conditional reference routing, and stop
      rules.
- [x] Add audit/optimize report-first, approved/scoped edit, explicit trivial
      fast path, and external/global confirmation behavior exactly once.
- [x] Remove detailed rubric tables, duplicate issue/check lists, and repeated
      report/edit gates from initial context.
- [x] Replace POSIX `find` with structured tools or portable `rg` discovery;
      update `allowed-tools` accordingly.

Gate:

```powershell
python "<yao-meta-dir>/scripts/resource_boundary_check.py" "<skill-dir>"
```

The default Production 1000-token gate must pass. A raised ceiling is diagnostic
only and cannot satisfy this step.

## Step 3 - Correct Codex semantics and creation decisions

- [x] Add `references/codex-agents-discovery.md` with official source URLs,
      `Last verified`, override/AGENTS/fallback order, root-to-CWD chain,
      one-per-directory rule, byte budget, global boundary, `.agents/skills`,
      and `.codex/agents` roles.
- [x] Update `quality-criteria.md` to use the two-axis instruction/navigation
      decision and hard minimum instruction-need condition.
- [x] Update `update-guidelines.md` for active vs shadowed files, existing
      override handling, effective-config uncertainty, and honest evidence.
- [x] Remove stale `.codex/skills` and generic template defaults; keep only
      evidence-backed slots/conditional examples.
- [x] Keep shared code-map fenced blocks unchanged if possible. If they must
      change, edit the sibling block in the same patch and prove byte parity.

Gate: the navigation-only fixture must recommend a local map without a nested
AGENTS file.

## Step 4 - Align report and agent interfaces

- [x] Rewrite `report-format.md` so audit results lead with prioritized findings
      and include effective chain/shadows, separate creation decisions, proposed
      diffs, validation plan, and `missing evidence`; omit empty optional
      sections.
- [x] Make after-edit output report actual changed files, behavioral outcome,
      preservation boundaries, and passed/failed/skipped checks.
- [x] Update `agents/interface.yaml` default prompt to the same action/output
      contract and add compatibility, activation, inline execution, trust, and
      OpenAI/Claude/generic degradation fields.
- [x] Add Production `manifest.json` with owner `lyh`, quarterly review, active
      lifecycle, context tier, factory components, and target platforms used by
      Skill IR. Do not add Governed-only permission claims.
- [x] Bump public version to `1.2.0` only after the behavioral contract is final.

Validate:

```powershell
python "<yao-meta-dir>/scripts/validate_skill.py" "<skill-dir>"
python "<yao-meta-dir>/scripts/export_skill_ir.py" "<skill-dir>" --validate-only
```

Expected: validate passes; Skill IR reports Production and nonzero adapter
targets. Remove any empty tool-created directories before final diff review.

## Step 5 - Run trigger and output evaluation

- [x] Split `<task-dir>/research/trigger-cases.json` into tuning/dev and an
      untouched holdout before changing thresholds or description wording.
- [x] Run the skill-specific trigger evaluator against the resolved final
      description; investigate every FP/FN instead of tuning only the threshold.
- [x] Compare the literal 1.1.0 and 1.2.0 descriptions against the route matrix;
      record which behavior was gained, preserved, or intentionally excluded.
- [x] Run output eval on the file-backed cases and generate blind pack/answer-key
      artifacts plus `reports/output_quality_scorecard.md`.
- [x] Generate reviewed `reports/output-risk-profile.md` and
      `reports/prompt-quality-profile.md`; fix encoding before committing.
- [x] Run deterministic `output-exec` only as command-runner evidence. Run a
      provider-backed GPT-5.6 evaluation only if valid credentials and explicit
      authorization are available; otherwise mark it `missing evidence`.
- [x] Do not claim human blind-review agreement without a real reviewer decision
      and rationale.

Trigger command shape:

```powershell
python "<yao-meta-dir>/scripts/trigger_eval.py" `
  --description-file "<task-dir>/research/final-description.txt" `
  --cases "<task-dir>/research/trigger-cases.json" `
  --semantic-config "<task-dir>/research/semantic-config.json"
```

Output command shape:

```powershell
python "<yao-meta-dir>/scripts/yao.py" output-eval `
  --cases "<skill-dir>/evals/output/cases.jsonl" `
  --output-md "<skill-dir>/reports/output_quality_scorecard.md" `
  --output-json "<skill-dir>/reports/output_quality_scorecard.json"
```

Gate: with-skill assertion pass rate must exceed baseline; recorded fixture
success is not model-executed evidence.

## Step 6 - Run the remaining Yao Production disposition

- [x] Export Skill IR and compile `openai`, `claude`, and `generic` contracts to
      `<task-dir>/research/yao/`; run conformance for each declared target.
- [x] Run trust check. Because the skill has no scripts/dependencies and forbids
      remote inline execution, record the actual low-risk result; do not invent
      runtime permission enforcement.
- [x] Run Skill Atlas for the workspace and inspect overlap with
      `claude-md-improver` and `codex-workflow-recommender`.
- [x] Run registry audit, package export/verify, temporary install simulation,
      and upgrade comparison against the Step 0 baseline.
- [x] Render Review Studio into `<task-dir>/research/yao/` and resolve or record
      every gate. Provider/human/telemetry gaps remain `missing evidence`.
- [x] Do not commit generated package archives, temporary install roots, or
      decorative reports into the skill.

Use explicit output paths under `<task-dir>/research/yao/` for one-run evidence.
Any gate that creates an empty target directory during validate-only mode must
be cleaned before final status review.

## Step 7 - Align suite guidance and generated docs

- [x] Update only the `agents-md-improver` allowed-tools/eval-status lines in
      `skills/developer-tools-integrations/AGENTS.md`.
- [x] Run `just docs-sync` after version, description, manifest, eval, report,
      and resource inventory are final.
- [x] Inspect generated English and Chinese skill pages for correct version,
      description, and resource counts.
- [x] Do not fix unrelated stale category entries in this task.

## Step 8 - Verification and review gate

- [x] `python scripts/check.py "<skill-dir>" --json`
- [x] targeted Node contract test
- [x] default yao validate/resource/Skill IR checks
- [x] trigger dev + holdout and output scorecard checks
- [x] Yao compiler/conformance/trust/atlas/package/install/upgrade/Review Studio
      disposition complete
- [x] `just skills-check`
- [x] `just node-test`
- [x] `just docs-check`
- [x] `just ci`
- [x] `git diff --check`
- [x] `git status --porcelain=v1 -uall` and final diff review for unrelated files
- [x] review every PRD acceptance criterion and all `missing evidence` labels
      before finish/archive

## Review Gates

- No active target guidance retains `.codex/skills` as a repo skill root.
- No audit claims a descendant/sibling instruction file is active without the
  matching launch CWD chain.
- No score alone creates nested AGENTS guidance.
- No repeated report-first rule or extra approval round for approved/scoped
  edits.
- No empty template section or generic model advice is emitted by default.
- No trigger smoke, recorded fixture, or generated report is described as
  independent model/human evidence.
- No sibling/category cleanup beyond the explicit shared contract.

## Rollback Points

1. Prompt/semantics/reference changes form one behavior unit and can revert
   before metadata/eval release evidence.
2. Shared code-map block changes and sibling parity updates revert together.
3. Manifest/interface/evals/reports/version/docs form one Production release
   unit and must not ship without the lean/correct core.
4. Generated docs revert with source metadata; temporary yao package/install
   outputs are disposable and should not enter git.
