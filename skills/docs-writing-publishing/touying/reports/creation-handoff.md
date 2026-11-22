# Creation Handoff

## 1. Result

- Skill: `touying` (`2.0.0`, Production tier)
- Job to be done: Author, refactor, migrate, troubleshoot, and deterministically verify Typst slide decks using `@preview/touying:0.8.0` (Typst `0.15.0+`) with Workspace Intent Gate, Quick/Full tiering, modular `globals.typ` architecture, multi-mode export (`presentation`/`handout`/`article`), bundle `.pdfpc` notes, and compile + visual closing gates.
- Local path: `skills/docs-writing-publishing/touying/` (upgraded across spec `#55` slices `#56`–`#60` on local integration branch `feat/touying-0.8-upgrade`; not pushed to remote or merged into `dev`).

## 2. Inventory & Package Topology

- Root package files: `SKILL.md` (`< 10 KB` UTF-8 Production router), `README.md`, `manifest.json`, `agents/interface.yaml`.
- Deep reference modules (`references/`, 8 files): `core-0.8.md`, `animations-waypoints.md`, `output-modes-article.md`, `themes-notes-export.md`, `integrations.md`, `visual-craft.md`, `migration-0.8.md`, `troubleshooting.md`.
- Graded `0.8.0` examples (`examples/`, `README.md` + 6 tiers across 8 `.typ` files):
  - `01-minimal.typ` (single-file `metropolis`)
  - `02-multi-file/` (`globals.typ`, `main.typ`, `content.typ`, `outline-slide`, `appendix`)
  - `03-animations-waypoints-math.typ` (`#jump`, `#item-by-item-fn`, `#touying-raw`, `#waypoint`, `#animate`/`swap`, native `frac`/`mat`, `#touying-render`, `#meanwhile`, `#touying-recall`)
  - `04-multi-mode-article.typ` (`presentation`, `handout`, `article`, `#article-text`, `config-article`, `table.header` preservation)
  - `05-theme-notes.typ` (`custom-slide`, `touying-fn-wrapper-raw`, `config-common(notes-fn: ..)`, `touying-notes` aligned `24pt` header/body, `utils.get-input`)
  - `06-bundle-pdfpc.typ` (`#pdfpc.bundle-assets()` outside `#document(..)`, `--features bundle --format bundle`)
- Deterministic verifier: `scripts/touying_check.py` (`doctor`, `audit --strict-warnings`, `compile` with `--modes` and `--bundle`).
- Evals & automated tests: `evals/evals.json` (13 cases), `evals/trigger_cases.json`, `tests/touying.test.mjs`, `tests/test_touying_contract.py`, `tests/test_animations_modes_docs.py`, `tests/test_themes_integrations_craft_docs.py`, `tests/test_touying_check.py`, and `tests/fixtures/` (5 `.typ` fixtures).
- Evidence artifacts: `reports/prior-art-research.md`, `reports/creation-handoff.md`, `reports/trigger-eval.json`, `reports/skill-ir.json`.

## 3. Reference Skills Studied

- `apcamargo/typst-skills@touying-author` ([GitHub](https://github.com/apcamargo/typst-skills), `skills.sh` `149` installs, `SkillsMP` repo `241` stars, observed `2026-11-21`, license: undeclared): popularity anchor; studied high-level multi-file `globals.typ` separation and concise task routing (`references/core-0.8.md`, `SKILL.md` Section 4), with zero prose/template copying due to undeclared license.
- `touying-typ/seaslides@seaslides-typst-slides-skill` ([GitHub](https://github.com/touying-typ/seaslides), `skills.sh` `69` installs, `SkillsMP` repo `53` stars, observed `2026-11-21`, MIT): official trust anchor; learned Quick/Full complexity tiers, single authoritative technical contract, and compile + mechanical audit + visual QA closing gate (`SKILL.md` Sections 3 & 6).
- `tylina/tylina-skill@typst-slides` ([GitHub](https://github.com/tylina/tylina-skill), `skills.sh` `12` installs, `SkillsMP` repo `14` stars, observed `2026-11-21`, MIT): complementary specialist; learned Workspace Intent Gate to detect and reuse existing `.typ` entrypoints without blind overwrite (`SKILL.md` Section 2).
- `statzhero/typst-touying-skill@typst-touying` ([GitHub](https://github.com/statzhero/typst-touying-skill), `skills.sh` `5` installs, `SkillsMP` repo `1` star, observed `2026-11-21`, license: undeclared): complementary reference; noted visual hierarchy and anti-bullet-monotony direction only, zero content copied due to undeclared license.

## 4. Absorbed and Rejected

- `keep`: multi-file `globals.typ` + `main.typ` + section file architecture; Quick/Full complexity tiers; Workspace Intent Gate; strict exclusion of non-Typst slides and `academic-defense-beamer`.
- `adapt`: upgraded every default, contract, and example from `0.6.1`/`0.7.4` to `@preview/touying:0.8.0` (`Typst 0.15.0+`) verified against the cached `0.8.0` package source; decoupled Workspace Intent Gate from proprietary MCP dependencies.
- `reject`: all `34` verbatim `0.6.1` Docusaurus markdown copies (`docs/` removed) and `9` legacy examples; deprecated defaults (`0.5.0`, `0.6.1`, `semi-transparent-cover`, `touying-equation`, `magic.bibliography()`, `config-methods(show-only-notes: ..)`, string-array `touying-reducer-bindings`); heavy external image-gen pipelines.
- `invent`: source-verified 8-guide `0.8.0` reference suite, 6-tier runnable examples, deterministic `scripts/touying_check.py` CLI (`doctor`/`audit`/`compile`), 3-axis trigger cases, and automated Node + Python test suites.

## 5. Advantages and Highlights

- `[design advantage]` Eliminates `34` stale `0.6.1` doc files and consolidates authoring, migration, animations/waypoints, dual-mode article export, custom themes/notes, ecosystem bindings, and layout craft under a lean `<10 KB` root `SKILL.md` router with strict boundary exclusions.
- `[validated advantage]` Locally verified with `typst 0.15.1` across all `6` graded example tiers (including `presentation`/`handout`/`article` and `--bundle` `.pdfpc` export), 3-round `1x`/`4x` subagent visual QA (`PASS`, `0` remaining defects), `touying_check.py audit --strict-warnings` (`0` errors, `0` warnings), `validate_skill.py` (`0` failures, `0` warnings), `trigger_eval.py` (`100%` pass), `release_check.py --phase local --run-tests` (`ok: true`, `block: 0`), `scripts/check.py`, `scripts/check_skill_evals.py`, Node tests, and Python stdlib tests.
- `[hypothesis]` Direct routing to graded `0.8.0` examples and `touying_check.py` gates should cut broken-API and layout regressions in live agent sessions, pending external provider A/B evaluation.

## 6. Typst 0.15.1 Compilation & 1x/4x Visual QA Summary

- **Compiler probe**: `touying_check.py doctor` confirmed `typst 0.15.1` (`meets_min_version: true`, `supports_warnings_flag: false` — this local Typst binary omits `--warnings`, so `touying_check.py` strictly promotes `warning:` lines on `stderr` in Python, ignoring only `"bundle export is experimental"` under `--bundle`).
- **Graded example compile pass**: `01-minimal.typ`, `02-multi-file/main.typ` (`--root`), `03-animations-waypoints-math.typ`, `04-multi-mode-article.typ` (`presentation`, `handout`, `article`), `05-theme-notes.typ`, and `06-bundle-pdfpc.typ --bundle` (`deck.pdf` + JSON-valid `deck.pdfpc`) all compiled with `returncode: 0` and `0` warnings.
- **Visual QA loop (`1x` at 144 PPI + `4x` at 360 PPI & quadrant crops in session scratch outside repo)**:
  - **Round 1** flagged 5 concrete defects across examples (`02-multi` Agenda `0.` prefix and unexplained `7 / 5` appendix footer; `03-anim` orphan empty bullets from `- #only(...)`; `04-art` `#article-text` hiding sibling `table`; `05-notes` `24pt`/`48pt` left offset and empty subslide-1 note).
  - **Round 2** confirmed `01`, `02`, `04`, `05` clean and surfaced 2 remaining `03-anim` subtleties (`#touying-render` snapshot following equation `#pause` causing double-fade/wrap on `p10`–`p12`, and an empty `== Whole-Slide Recall` slide before replay). Both were fixed (`#meanwhile` + separate paragraph before snapshot; top-level `#touying-recall` without empty wrapper heading).
  - **Round 3** inspected refreshed `03-anim` `1x` (`p10`–`p14`) and `4x` crops (including math page `p12` and final recall `p14`) -> `Overall verdict: PASS`, `Defects: []`. Zero PNG/PDF artifacts remain in the repository.

## 7. Honest Verification Limits & `missing evidence`

- `rating evidence unavailable`: `skills.sh` and `SkillsMP` provide installs and repo stars only, not user ratings.
- `missing evidence`: external provider-backed model A/B output evaluation (`reports/output-evidence.json` omitted rather than fabricated), external blind human review, and remote `npx skills add` clean installation after merge (deferred because remote push/merge/publish is intentionally excluded from this branch scope).
