# Prior art (short)

Full notes: `.trellis/tasks/10-06-repo-test-skill/research/prior-art-test-skills.md` and `.trellis/tasks/10-06-repo-test-skill/research/local-repo-test-layouts.md`. This file does not copy those notes. Date of that research: 2026-10-06. Install counts and repository stars are not quality scores. This package does not claim a global ranking.

## Studied

- pytest 9.1.1 good practices and `src/_pytest/main.py`. Mechanism: `test_*.py` / `*_test.py`, and both an external `tests/` tree and in-package tests are legal. Used only as a labeled contrast when no `justfile` exists. Not used as this repository's collection fact.
- Node.js test runner docs (six JavaScript globs; coverage thresholds default to 0). Same contrast-only use. Not a completeness definition.
- `anthropics/skills` skill-creator (`SKILL.md`, `references/schemas.md`). Mechanism: separate trigger from output, and require evidence for a pass. This package keeps `assertions` and does not add `expectations`. Skill evals are not the product test tree.
- `addyosmani/agent-skills` `evals/README.md`. Mechanism: zero-token checks can sit in CI; token-cost behavior evals stay out. Threshold `--min-rank1 95` is not used.
- Alibaba skill-up writing-evals doc. Mechanism: a deterministic `expect` before a model `judge`. The `eval.yaml` schema is not used.
- `dotnet/skills` `test-quality-auditor.agent.md` (opening). Mechanism: diagnose without editing until the user asks for a fix. .NET coverage tools are not the completeness rule.
- NickCrew `test-review` excerpt. Mechanism: status words Covered, Shallow, Missing. The fixed subagent name and that repository's reference path are not used.
- openclaw `test-audit` opening. Mechanism: completeness is a behavior contract, not a file count or a coverage percentage. Campaign pruning is not used.
- Coverage.py index excerpt. It measures execution. It does not define a completeness percentage. Not used as a gate.
- Local layout notes for 18 repositories. Mechanism: read the repository's own entry point. Several layouts differed. This skill reads the target `justfile` instead of copying one layout.

Not inspected, and not adapted: high-install skills.sh name collisions, `webapp-testing`, agentops `test`, Intent Solutions `audit-tests` (skill body not found), the stack-aware detector script, and the GitCode blog rank figure.

## keep / adapt / reject

- keep: two legal test layouts; separate location, collection, and behavior; a report can stop without editing; skill-eval schema checks are not model runs.
- adapt: Covered / Shallow / Missing, with the script stopping at `needs-review` so a keyword is not `Covered`. Collection comes from the target `justfile`, not from upstream default globs.
- reject: coverage percentage as completeness; external `tests/` as the only legal layout; install counts as quality; copying skill-eval packages into a product test layout; `expectations` as the field name; unread third-party scripts.
- invent: one read-only inventory whose collection column is the declared runner, plus an explicit missing-evidence line for model routing.

## Labels

- [design advantage] The package states location, `justfile` collection, and behavior as three columns, and it refuses to auto-write `Covered`. Compared with the inspected candidates, those candidates each covered one of those columns, not this combination. Evidence: `references/report-contract.md`, `scripts/inventory_tests.py`.
- [hypothesis] The inventory is expected to show test files that exist but are outside the declared discover roots. A provider-backed comparison against the studied skills is missing evidence.
- [validated advantage] Local only. `trigger_eval.py` on 2026-10-06 scored 17/17 at threshold 0.34 (`reports/trigger-eval.json`). `tests/inventory_tests.test.mjs` shows an uncollected `tests/test_sample.py` as Missing and a collected `skills/demo/tests/sample.test.mjs` as needs-review. This is not a model-routing proof and not a comparison against the studied skills.
