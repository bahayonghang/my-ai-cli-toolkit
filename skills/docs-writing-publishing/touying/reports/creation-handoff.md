# Creation Handoff

## 1. Result

- Skill: `touying` (`2.0.0`)
- Job to be done: Author, refactor, migrate, and troubleshoot Typst slide decks using `@preview/touying:0.8.0` (Typst `0.15.0+`) with Workspace Intent Gate, Quick/Full tiering, modular `globals.typ` architecture, and `--warnings promote` closing gates.
- Local path: `skills/docs-writing-publishing/touying/` (slice `#56` committed locally on branch `slice/56-core-contract`; not pushed or merged to remote default branch).

## 2. Reference Skills Studied

- `apcamargo/typst-skills@touying-author` ([GitHub](https://github.com/apcamargo/typst-skills), `skills.sh` `149` installs, `SkillsMP` repo `241` stars, observed `2026-11-21`, license: undeclared): popularity anchor; studied high-level multi-file `globals.typ` separation and concise task routing (`references/core-0.8.md`, `SKILL.md` Section 4), with zero prose/template copying due to undeclared license.
- `touying-typ/seaslides@seaslides-typst-slides-skill` ([GitHub](https://github.com/touying-typ/seaslides), `skills.sh` `69` installs, `SkillsMP` repo `53` stars, observed `2026-11-21`, MIT): official trust anchor; learned Quick/Full complexity tiers, single authoritative technical contract, and compile + visual closing gate (`SKILL.md` Sections 3 & 6).
- `tylina/tylina-skill@typst-slides` ([GitHub](https://github.com/tylina/tylina-skill), `skills.sh` `12` installs, `SkillsMP` repo `14` stars, observed `2026-11-21`, MIT): complementary specialist; learned Workspace Intent Gate to detect and reuse existing `.typ` entrypoints without blind overwrite (`SKILL.md` Section 2).
- `statzhero/typst-touying-skill@typst-touying` ([GitHub](https://github.com/statzhero/typst-touying-skill), `skills.sh` `5` installs, `SkillsMP` repo `1` star, observed `2026-11-21`, license: undeclared): complementary reference; noted layout hierarchy concept only, zero content copied due to undeclared license.

## 3. Absorbed and Rejected

- `keep`: multi-file `globals.typ` + `main.typ` + section file pattern; Quick/Full tiering; Workspace Intent Gate; strict exclusion of non-Typst slides and `academic-defense-beamer`.
- `adapt`: upgraded every default, rule, and diagnostic from `0.6.1`/`0.7.4` to `@preview/touying:0.8.0` (`Typst 0.15.0+`) using the cached official `0.8.0` source package; decoupled Workspace Intent Gate from proprietary MCP dependencies.
- `reject`: all 34 verbatim `0.6.1` Docusaurus markdown copies (`docs/` removed); deprecated defaults (`0.5.0`, `0.6.1`, `semi-transparent-cover`, `touying-equation`, `magic.bibliography()`, `config-methods(show-only-notes: ..)`); heavy external image-gen pipelines.
- `invent`: source-verified `0.8.0` core contract (`references/core-0.8.md`), complete `0.6.x`/`0.7.x -> 0.8.0` migration guide (`references/migration-0.8.md`), `--warnings promote` troubleshooting matrix (`references/troubleshooting.md`), bilingual `trigger_cases.json`, and Node + Python contract test suites.

## 4. Advantages and Highlights

- `[design advantage]` Eliminates 34 outdated `0.6.1` documentation files in favor of a lean root `SKILL.md` router (`2.0.0`) with zero dead links, explicit `academic-defense-beamer` / `HTML` / `reveal.js` / `PPT` / `Marp` boundary gates, and Workspace Intent Gate protection.
- `[validated advantage]` Verified locally via `scripts/check.py`, `scripts/check_skill_evals.py`, `qiaomu-meta-skill` `validate_skill.py` (`ok: true`, `failures: []`, `warnings: []`), `trigger_eval.py` (all `should_trigger`, `should_not_trigger`, and `near_neighbor` cases passing), `tests/touying.test.mjs`, and `tests/test_touying_contract.py`.
- `[hypothesis]` Expects fewer compile/migration errors (`--warnings promote`, `Unsupported mark`, footnote bibliography, recall `subslides:`) in agentic `.typ` workflows; live Typst compilation across upgraded examples and external model A/B comparison remain `missing evidence`.

## 5. Verification and Limits

- Package validation:
  - `scripts/check.py skills/docs-writing-publishing/touying`: `[OK]` (0 errors, 0 warnings).
  - `scripts/check_skill_evals.py skills`: `Checked 23 skill eval files` (exit 0).
  - `qiaomu-meta-skill` `validate_skill.py`: `ok: true`, `failures: []`, `warnings: []`.
- Trigger eval: `trigger_eval.py` against `evals/trigger_cases.json` -> `reports/trigger-eval.json` (`ok: true`, `22/22` passed: 12 `should_trigger`, 6 `should_not_trigger`, 4 `near_neighbor`, `0` false positives, `0` false negatives).
- Unit & contract tests:
  - `node --test tests/touying.test.mjs`: `5/5` passed.
  - `python -m unittest discover -s tests -p test_*.py`: `7/7` passed.
- `missing evidence`:
  - Wave 2 deep reference modules (animations/waypoints/article-mode, themes/speaker-notes/integrations/visual-craft) — scheduled in follow-up Wave 2 slices.
  - Graded `0.8.0` `.typ` example decks (`examples/*.typ` left untouched for `#59`) and deterministic `touying_check.py` audit script (`#59`).
  - Typst `0.15.0+` compilation and `1x`/`4x` rendered page visual inspection on upgraded examples.
  - External provider-backed model A/B comparison (`reports/output-evidence.json` intentionally omitted).
  - Blind human review and remote `npx skills add` clean install verification after merge.
- Excluded actions: did not touch `examples/*.typ`, `docs/` catalog sync (`just docs-check` / `just docs-sync` / full `just ci`), or the parent repository working tree.
