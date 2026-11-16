# Implement — merge paper-plot into academic-figure

Ordered checklist. Run from the repository root in PowerShell. The expected
task directory is intentionally untracked; all other pre-existing changes must
remain untouched.

Shorthands:

```powershell
$af = 'skills/academic-research-tools/academic-figure'
$pp = 'skills/research-learning-knowledge/paper-plot'
$task = '.trellis/tasks/07-19-merge-academic-paper-plot'
$env:PYTHONUTF8 = '1'
```

## S0 — Pre-flight and boundary lock

- [x] Run `git status --porcelain=v1 -uall` and confirm the only untracked rows
      are files under `$task`; stop for any unrelated dirty path.
- [x] Run `git diff --name-only -- $af $pp` and require no pre-existing changes
      under either source/destination skill.
- [x] Record `git branch --show-current`. Before any eventual commit, create a
      dedicated task branch; do not commit during this implementation gate.
- [x] Verify the expected source inventory: 9 `scripts/*.py`, 8
      `references/styles/*.md`, 2 mode files, 1 reproduction guide, and 10
      `assets/originals/*.png`.

Rollback point: if S0 fails, stop without changing the repository.

## S1 — Move assets with history

```powershell
git mv "$pp/references/modes" "$af/references/modes"
git mv "$pp/references/styles" "$af/references/styles"
git mv "$pp/references/reproduction_guide.md" "$af/references/reproduction_guide.md"
foreach ($name in @('bar_memevolve','bar_spice','line_selfdistill','line_aime','line_loss_inset','scatter_tsne','scatter_break','radar_dora','classwise_iou_table')) {
  git mv "$pp/scripts/$name.py" "$af/scripts/$name.py"
}
git mv "$pp/assets" "$af/assets"
```

- [x] Use `rg -n` to verify all moved relative links and `<skill-dir>` links
      resolve from their new parent.
- [x] Confirm `line_selfdistill.py` still documents and accepts two output
      paths; do not normalize it to the one-output convention.

Rollback uses the exact-path command in design §8 only after verifying the S0
allowlist. Never use a repository-wide checkout or clean command.

## S2 — Rewrite the router and journal branch

- [x] Create `AF/references/modes/journal-spec.md` and move the existing six
      journal steps there, ending with an explicit contract/QA completion rule.
- [x] Rewrite `AF/SKILL.md` frontmatter with `category:
      academic-research-tools`, merged tags, and `version: 1.0.0`.
- [x] Use the reviewed description from design §6 verbatim. Keep it below 1024
      characters and free of angle brackets; any wording change requires a
      trigger-eval rerun before continuing.
- [x] Make the body order: router → precedence → one contract table →
      route-elsewhere → resource pointers. Do not copy the full style catalog,
      journal six-step protocol, or reproduction dependency notes into the
      entrypoint.
- [x] Keep `<skill-dir>` and the PowerShell UTF-8 note in the body. Use the
      documented literal path form for every bundled script command.

## S3 — Merge behavior evals

- [x] Build `AF/evals/evals.json` from the 15 source cases, renumbering
      contiguously and setting `skill_name: academic-figure`.
- [x] Convert the two old paper-plot route negatives into `from-data` and
      `from-image` positives; add review-only and mixed-precedence cases for a
      total of 17.
- [x] Add assertions that distinguish journal vector/compliance output from
      reproduction 300-DPI PNG/mimicry output.
- [x] Validate JSON with:
      `python -c "import json; json.load(open('skills/academic-research-tools/academic-figure/evals/evals.json', encoding='utf-8'))"`.

## S4 — Rewrite live references

- [x] Update `skills/academic-research-tools/AGENTS.md` to describe the one
      skill, three internal modes, two contracts, and surviving near-neighbor
      negatives. Remove all live paper-plot boundary language.
- [x] Replace `paper-plot` with `academic-figure` in
      `.trellis/spec/guides/skill-authoring-conventions.md`.
- [x] Remove the stale future-build sentence and paper-plot self-route from
      `AF/SKILL.md`.

## S5 — Remove old entrypoint and quarantine residuals

```powershell
git rm -- "$pp/SKILL.md" "$pp/evals/evals.json"
$quarantine = Join-Path $env:TEMP ('paper-plot-removed-' + [DateTime]::UtcNow.ToString('yyyyMMddTHHmmssZ'))
if (Test-Path -LiteralPath $pp) {
  Move-Item -LiteralPath $pp -Destination $quarantine
}
```

- [x] Verify `$quarantine` is under `$env:TEMP`, the move completed, and the
      old repository path is absent. The quarantine is recoverable and must be
      mentioned in the handoff.

## S6 — Validate artifacts, routing, and docs

- [x] Run `just skills-check`, `just python-check`, and `just node-test`.
- [x] Create an exact temporary output directory under `$env:TEMP`; always run
      `bar_memevolve.py`, `classwise_iou_table.py`, `line_aime.py`, and
      `radar_dora.py` with explicit PNG paths and assert the files exist.
- [x] Run `scatter_break.py` when `python -c "import scipy"` succeeds. Run
      `bar_spice.py`, `line_loss_inset.py`, `line_selfdistill.py`, and
      `scatter_tsne.py` when `Get-Command latex` succeeds, passing both output
      paths to `line_selfdistill.py`. Record every unavailable dependency as
      missing evidence rather than a pass.
- [x] Extract the merged description with PyYAML, then run the task-local
      trigger gate:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:PYTHONUTF8 = '1'
$description = python -c 'import pathlib,sys,yaml; text=pathlib.Path(sys.argv[1]).read_text(encoding="utf-8"); value=yaml.safe_load(text.split("---", 2)[1])["description"]; sys.stdout.write(value.strip())' "$af/SKILL.md"
if ($description.Length -ge 1024) { throw "Description too long: $($description.Length)" }
$yaoMeta = Join-Path $env:USERPROFILE '.skillsmanage/skills/yao-meta'
if (-not (Test-Path -LiteralPath (Join-Path $yaoMeta 'scripts/trigger_eval.py'))) { throw 'yao-meta trigger_eval.py is unavailable' }
python (Join-Path $yaoMeta 'scripts/trigger_eval.py') `
  --description "$description" `
  --cases "$task/research/trigger-cases.json" `
  --semantic-config "$task/research/semantic_config.json"
```

- [x] Require zero false positives and false negatives; if the evaluator is
      unavailable, preserve the failure as missing evidence.
- [x] Run `just docs-sync`, then `just ci` (its first step runs `docs-check`).
- [x] Run `rg -n 'paper-plot' skills docs platforms .trellis/spec` and permit
      no live matches outside archive/journal history.
- [x] Review `git diff --check`, `git diff --stat`, and the complete file
      inventory before reporting completion.

## S7 — Finish gate (after user approval)

- [x] Run the Trellis quality check and record any new convention only if one
      was actually learned.
- [x] The user explicitly waived a dedicated branch and approved committing
      the reviewed final diff directly on `main`; record `main` in task
      metadata before committing.
- [x] Do not archive the task or journal completion until S6 evidence is green
      and the user has reviewed the planning/implementation result.

## Review gates

- **G1:** user reviews the canonical mode vocabulary, explicit-journal
  precedence, lean entrypoint boundary, PowerShell-safe rollback, and trigger
  fixtures before `task.py start`.
- **G2:** S6 passes with the 17 behavior cases, trigger eval at zero FP/FN,
  complete moved inventory, smoke evidence, no live paper-plot references, and
  green `just ci`.

## G2 evidence (2026-07-19)

- Resource boundary: passed with 794 initial tokens, zero failures, zero
  warnings, and no unused resource directories.
- Behavior fixture: valid JSON with `skill_name: academic-figure`, 17 cases,
  and contiguous IDs 1 through 17.
- Trigger gate against the implemented description: threshold 0.20,
  precision/recall 1.0, 0 false positives, 0 false negatives; positives 8/8,
  negatives 4/4, and near neighbors 3/3.
- Script smoke: all 9 moved scripts produced 10 non-empty PNGs in
  `C:\Users\lyh\AppData\Local\Temp\academic-figure-smoke-20260719T111756751Z`
  using a disposable `uv` environment (`numpy 2.5.1`, `matplotlib 3.11.1`,
  `scipy 1.18.0`) and the installed TeX Live runtime. The default Python had
  no matplotlib/scipy, so no repository dependency was inferred or added.
- Move integrity: Git reports all 9 scripts, 8 styles, the reproduction guide,
  and 10 PNGs as history-preserving renames; script/style/guide/assets are
  `R100` except the two intentionally rewritten mode files.
- Live-reference gate: no `paper-plot` match remains under `skills`, `docs`,
  `platforms`, or `.trellis/spec`; the old repository path is absent.
- Repository gate: `just docs-sync` generated 37-skill docs, and `just ci`
  passed docs build/check, skill metadata, Python compile, 116 Node tests
  (114 passed, 2 unrelated browser smokes skipped), and `git diff --check`.
- Recoverable quarantine:
  `C:\Users\lyh\AppData\Local\Temp\paper-plot-removed-20260719T110905Z`.
- Missing evidence (non-acceptance): yao-meta's generic `validate_skill.py`
  requires `agents/interface.yaml`; neither source skill had that sidecar, and
  adding it is outside this merge's approved boundary. Repository-native
  validation and the task-specific resource/trigger gates pass.
