# Qiaomu governed evidence

Date: 2026-08-23  
Mode: Governed (meta skill + deterministic file write)  
Owner: lyh  
Review cadence: quarterly or whenever a supported platform's Goal behavior changes

## Local evidence

| Gate | Result | Evidence |
| --- | --- | --- |
| Repository skill metadata | PASS | `just skills-check`; goal-meta-skill reported `[OK]` |
| Qiaomu trigger boundary | PASS 16/16 | `goal-meta-trigger-cases.json`; final `goal-meta-trigger-eval.json` has `ok: true`, 0 false positives, 0 false negatives |
| Trigger iteration | DISCLOSED | First run was 14/16 and exposed management-only plus ordinary-file-write false positives; the negative-intent cases were added before the final pass |
| Deterministic persistence tests | PASS 12/12 | `tests/persist-goal-contract.test.mjs` |
| Inline/linter/package-contract tests | PASS 20/20 | `tests/lint-goal-command.test.mjs` |
| Full repository CI | PASS | `just ci`: docs build, 38 skill metadata checks, 49 Python files, 237 Node tests (235 pass, 2 skip), and `git diff --check` |
| Qiaomu secret scan | PASS | `release_check.py::scan_secrets` returned `[]` for the changed skill package |
| Trellis artifact validation | PASS | `task.py validate` reported 6 real implement and 6 real check entries |

## Intentional Qiaomu/package deviations

`validate_skill.py` is not the repository's authoritative package validator. It
reported:

- failure: missing `README.md`;
- failure: missing `manifest.json`;
- warning: package-local `evals/trigger_cases.json` missing.

This repository's skill convention uses `SKILL.md`, the generated docs catalog,
`agents/interface.yaml`, `evals/evals.json`, Node tests and `scripts/check.py`.
The reviewed Trellis plan explicitly forbids adding ceremonial README/manifest
files solely for Qiaomu compatibility and requires trigger cases to remain
task-local. These findings are therefore a disclosed schema deviation, not a
Qiaomu validation pass.

`export_skill_ir.py` was run and its output is retained as
`qiaomu-skill-ir.json` in this task evidence directory. Because no Qiaomu
manifest exists, package version/owner and structured workflow fields are null
or empty. It is diagnostic compatibility evidence only and was not copied into
the skill's `reports/` as a misleading release artifact.

`release_check.py --phase local` cannot evaluate this repository-shaped package:
it raises `FileNotFoundError` while reading required `manifest.json` before it
can return a gate report. Local release readiness under the Qiaomu schema is
therefore `missing evidence`, not pass.

## Trust and rollback boundaries

- Trust boundary: only the user-approved contract text plus exact confirmed
  root/name/hash are trusted. Target type, baseline, dirty state and provider
  runtime are rechecked. The helper does not execute the contract.
- Mutation boundary: one direct-child Markdown through
  `persist_goal_contract.py`; no arbitrary Write tool, Git mutation, ignore edit,
  auto-import, memory write, network call, or platform runtime change.
- Rollback boundary: skill/package changes can be reverted coherently. A real
  user `GOAL.md` is material data and cannot be removed/restored without a
  separate exact authorization and authoritative prior content.
- Public claim guard: deterministic tests prove schema/write behavior only.
  They do not prove model compliance, provider file-reference behavior, human
  handoff quality, installation, telemetry, adoption, PR merge, or release.
- Concurrency limit: expected SHA-256 is a stale-write guard with an immediate
  pre-replace recheck, not a cross-process lock. An uncooperative writer in the
  final filesystem-call window remains residual risk; separate worktrees or
  editor coordination are required.

## Provider and human evidence matrix

| Evidence | Status | Reason |
| --- | --- | --- |
| Codex fresh-session `./GOAL.md` handoff | UNVERIFIED | No new authenticated Goal transcript was run |
| Claude Code fresh-session `@GOAL.md` handoff | UNVERIFIED | No new evaluator transcript was run |
| Grok Build explicit-read handoff | UNVERIFIED | No provider-backed run; `@GOAL.md` inside `/goal` also unverified |
| Oh My Pi explicit-read handoff | UNVERIFIED | No provider-backed run; enablement/mode behavior is source-backed only |
| Kimi Code TUI/headless handoff | UNVERIFIED | No provider-backed run; exit behavior is source-backed only |
| Human blind cross-Agent review | missing evidence | No isolated reviewer decision artifact |
| Clean install simulation | missing evidence | Repository package intentionally lacks Qiaomu manifest/README |
| Telemetry/adoption drift | missing evidence | No instrumentation or adoption dataset |
| Public PR/merge/release | missing evidence | Outside approved scope; no publish action performed |
