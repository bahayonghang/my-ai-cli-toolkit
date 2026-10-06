# Creation Handoff

## 1. Result

- Skill: `repo-test-audit` 0.1.0. The version is the `SKILL.md` frontmatter value. `manifest.json` is intentionally absent, so `reports/skill-ir.json` `package.version` stays null. That null is the exporter limitation, not a second version.
- Job: read-only inventory of where tests live, whether the declared runner collects them, and whether assertions check behavior.
- Path: `skills/development-workflows/repo-test-audit/`. Not published. No `npx skills add` step was run.

## 2. Reference skills studied

Inspection record: `.trellis/tasks/10-06-repo-test-skill/research/prior-art-test-skills.md` and `research/local-repo-test-layouts.md` (2026-10-06). This subtask did not re-open those upstream files. Unread search hits are not listed here.

- NickCrew `test-review` (`https://github.com/NickCrew/Claude-Cortex/blob/HEAD/skills/test-review/SKILL.md`). Shortlist: it already names Covered, Shallow, and Missing. Dated signal in the research file: repository metadata on 2026-10-06, MIT, 50 stars. Stars are not a quality score. Mechanism: status words for tests that miss the behavior. Landed in `references/report-contract.md`. The fixed subagent and that repo's reference path were not copied.
- openclaw `test-audit` (`https://github.com/openclaw/openclaw/blob/main/.agents/skills/test-audit/SKILL.md`). Shortlist: completeness as a behavior contract. Dated signal: SkillsMP `catalog_updated_at` 2026-08-15; the research file read the first 50 lines. The 391223 figure is the parent repository star count, not this skill's installs. Mechanism: do not treat file count or line coverage as completeness. Landed in the report contract and in the script rule that a keyword cannot become `Covered`.
- dotnet `test-quality-auditor` (`https://github.com/dotnet/skills/blob/main/plugins/dotnet-test/agents/test-quality-auditor.agent.md`). Shortlist: diagnosis stays separate from editing. Dated signal: repository metadata on 2026-10-06, MIT, `pushed_at` 2026-10-06. The research file read the opening, not later expert skills. Mechanism: do not edit tests unless the user asks for a fix. Landed in the audit/apply gate in `SKILL.md`.
- anthropics `skill-creator` (`https://github.com/anthropics/skills/blob/main/skills/skill-creator/SKILL.md` and `references/schemas.md`). Shortlist: skill evals are not the product test tree. Dated signal: repository `pushed_at` 2026-10-05, `stargazers_count` 179864 on 2026-10-06. Stars are not a quality score. Mechanism: pass needs evidence; `schemas.md` says `expectations` while `SKILL.md` says `assertions`. This package keeps `assertions` only.

pytest 9.1.1 and the Node.js test runner docs were studied as collection rules, not as skills. They are contrast text in `SKILL.md` when `runner_status` is `runner-not-declared`.

## 3. Absorbed and rejected

- keep: two legal layouts; separate location, collection, and behavior; a report may stop without editing; schema checks are not model runs.
- adapt: Covered / Shallow / Missing. The script stops at `needs-review`. Collection is parsed from the target `justfile`, not from upstream default globs.
- reject: coverage percentage as completeness; external `tests/` as the only legal layout; install counts or stars as quality; `expectations`; copying skill-eval packages into a product test tree; unread third-party scripts; publishing this package.
- invent: one read-only inventory whose collection column is the declared recipe, plus an explicit missing-evidence line for model routing.

## 4. Advantages and highlights

- [design advantage] The package states location, `justfile` collection, and behavior as three columns, and it does not auto-write `Covered`. The inspected candidates each covered one of those questions. Evidence: `references/report-contract.md`, `scripts/inventory_tests.py`.
- [validated advantage] `python .agents/skills/qiaomu-meta-skill/scripts/trigger_eval.py` on 2026-10-06 exited 0: 17/17, pass_rate 1.0, threshold 0.34, no failures (`reports/trigger-eval.json`). This is a lexical description check, not a model call. `node --test` on `tests/inventory_tests.test.mjs` exited 0 (6 tests), including the uncollected `tests/test_sample.py` case (`collected_by` empty, behavior `Missing`) and the `node-test` case (`skills/demo/tests/sample.test.mjs`, behavior `needs-review`).
- [hypothesis] The same inventory is expected to flag test files that exist outside the declared discover roots. A provider-backed comparison against the studied skills is missing evidence. A local smoke of this repository on 2026-10-06 did mark `humanizer-paper` and `paper-workbench` Python tests as `Missing`. That smoke is one repository, not a general result.

## 5. Verification and limits

- `export_skill_ir.py` exited 0 and wrote `reports/skill-ir.json`. `package.version`, `owner`, and `maturity_tier` are null because the exporter reads `manifest.json` only. Do not hand-edit the IR. `intent.target_users` is the exporter default `Qiaomu operator`, not a claim about this package's users.
- `validate_skill.py` exited 2. Failure: `missing required file: manifest.json`. Warnings: README missing install command, natural examples, verification commands, and troubleshooting. Intentional. This repository does not use a qiaomu `manifest.json`. The README is local and this package is not published, so those README lines were not added. Authoritative gates here are `scripts/check.py` and `just docs-check`.
- Model routing from `description` is missing evidence. The trigger file does not call a model.
- No network publish, no `npx skills add`, no coverage percentage, no claim that `python-check` means tests passed.
- Permissions excluded from the audit path: editing product code, running the target repository's recipes, and network access. Apply mode edits tests only after an explicit request.
