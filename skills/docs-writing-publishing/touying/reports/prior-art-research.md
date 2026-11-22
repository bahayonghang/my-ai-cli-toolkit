# Prior-Art Research

- Researched at: 2026-11-21
- Queries: `"touying"`, `"typst slides"`
- Catalogs: skills.sh, SkillsMP
- Rating evidence: unavailable (`rating evidence unavailable` — neither `skills.sh` nor `SkillsMP` exposes verified user ratings or reviews; `skills.sh` reports install telemetry only and `SkillsMP` reports GitHub repository stars only)

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---|---|---|---|---|---|
| `apcamargo/typst-skills@touying-author` | Popularity anchor for Touying authoring | 149 | 241 | High adoption in Typst ecosystem; dated `2026-11-21` observation; content still anchored to `0.6.1` | Multi-file `globals.typ` + `main.typ` + section layout and concise task routing pattern | Verbatim 34-file Docusaurus `0.6.1` mirror, `0.5.0`/`0.6.1` examples, and any verbatim prose/template reuse (undeclared license) | 未声明 (undeclared) |
| `touying-typ/seaslides@seaslides-typst-slides-skill` | Official Touying organization trust anchor | 69 | 53 | Maintained under official `touying-typ` org; MIT license; verified workflow structure | Quick/Full complexity tiers, single authoritative technical contract, compile + audit + visual QA closing gates | Pinned `0.7.4` version assumptions and heavy multi-role image-generation pipeline | MIT |
| `tylina/tylina-skill@typst-slides` | Complementary specialist for workspace hygiene | 12 | 14 | MIT license; inspected workflow rules for existing repositories | Workspace Intent Gate (detect and reuse canonical `.typ` entrypoints instead of overwriting) and compile-verified closeout | Proprietary MCP server coupling | MIT |
| `statzhero/typst-touying-skill@typst-touying` | Complementary reference | 5 | 1 | Small community skill; dated `2026-11-21` | Conceptual reminder to document layout hierarchy constraints | Single-file hardcoded aesthetic preferences; strict zero-copy boundary due to undeclared license | 未声明 (undeclared) |

## Strict License & Non-Copy Boundary

- `apcamargo/typst-skills` and `statzhero/typst-touying-skill` carry **no declared license**. Only high-level architectural concepts (multi-file separation, concise routing, layout hierarchy reminders) were studied; **zero prose, examples, or assets** were copied from either repository.
- All Touying `0.8.0` API contracts, breaking-change details, and defaults documented in this package were verified directly against the locally cached `@preview/touying:0.8.0` source package (`typst.toml`, `changelog.md`, `src/*.typ`, `themes/*.typ`).

## Original Contribution & `keep / adapt / reject / invent` Ledger

- **Keep**:
  - Multi-file `globals.typ` + `main.typ` + `sections/*.typ` separation to avoid circular imports (`references/core-0.8.md`).
  - Quick vs Full complexity tiering and compile-verified closing gate (`SKILL.md`).
  - Explicit negative trigger exclusions for `HTML`, `reveal.js`, `PPT`, `Marp`, ordinary Typst papers, and `academic-defense-beamer`.
- **Adapt**:
  - Updated all package contracts, migration instructions, and warning rules from `0.6.1`/`0.7.4` to `@preview/touying:0.8.0` (`Typst 0.15.0+`).
  - Tailored Workspace Intent Gate cleanly without external MCP lock-in (`SKILL.md` Section 2).
  - Replaced `34` verbatim legacy Docusaurus `0.6.1` files with lean, source-verified `references/core-0.8.md`, `references/migration-0.8.md`, and `references/troubleshooting.md`.
- **Reject**:
  - Verbatim upstream Docusaurus documentation dumps (`docs/` removed).
  - Outdated `0.5.0`/`0.6.1` defaults and deprecated `semi-transparent-cover`, `touying-equation`, `magic.bibliography()`, `config-methods(show-only-notes: ..)` recommendations.
  - Heavy external image-generation pipelines or proprietary MCP dependencies.
- **Invent**:
  - Complete `0.6.x`/`0.7.x -> 0.8.0` breaking-change migration matrix and `--warnings promote` diagnostic table verified directly against Touying `0.8.0` source.
  - Dual-language trigger boundary suite (`evals/trigger_cases.json`) plus automated contract tests (`tests/touying.test.mjs`, `tests/test_touying_contract.py`) enforcing single-entrypoint isolation, zero broken links, zero legacy default leakage, and zero local path leaks.

## Generalization Gate

- Classification: **generalizable core upgrade** across Typst `0.15.0+` / Touying `0.8.0` presentation workflows (new decks, multi-file refactors, migrations, and warning-clean builds), rather than overfitting to a single user sample.

## Created Skill Advantages

- **Design advantage**: replaces 34 stale `0.6.1` doc mirrors with a lean `<10 KB` root `SKILL.md` router backed by source-verified `0.8.0` core, migration, and troubleshooting contracts, plus Workspace Intent Gate and Quick/Full tiers.
- **Validated advantage**: passes repository `scripts/check.py`, `scripts/check_skill_evals.py`, `qiaomu-meta-skill` `validate_skill.py`, `trigger_eval.py`, `tests/touying.test.mjs`, and `tests/test_touying_contract.py`.
- **Hypothesis**: routing directly to `0.8.0` contracts and `--warnings promote` checks should prevent `0.6.1`/`0.7.x` regressions (`semi-transparent-cover`, `touying-equation`, `magic.bibliography()`, `#pause` in `context`), though provider-backed comparison and live Typst `0.15+` example rendering remain `missing evidence` in this slice.

## Missing Evidence

- `rating evidence unavailable`: neither `skills.sh` nor `SkillsMP` exposes user ratings/reviews.
- Wave 2 deep reference modules (animations/waypoints/article-mode, themes/speaker-notes/integrations/visual-craft) — intentionally out of scope for slice `#56`.
- Upgraded graded `0.8.0` `.typ` examples + deterministic `touying_check.py` audit script (deferred to slice `#59`).
- Typst `0.15.0+` compilation + `1x`/`4x` visual page inspection on rewritten examples (`missing evidence`).
- Provider-backed A/B comparison, blind human review, and remote `npx skills add` clean install verification (`missing evidence`).
