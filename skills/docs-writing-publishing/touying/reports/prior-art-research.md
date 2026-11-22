# Prior-Art Research

- Researched at: 2026-11-21
- Queries: `"touying"`, `"typst slides"`
- Catalogs: `skills.sh`, `SkillsMP`
- Rating evidence: unavailable (`rating evidence unavailable` — neither `skills.sh` nor `SkillsMP` exposes verified user ratings or reviews; `skills.sh` reports install telemetry only and `SkillsMP` reports GitHub repository stars only)

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---|---|---|---|---|---|
| `apcamargo/typst-skills@touying-author` | Popularity anchor for Touying authoring | 149 | 241 | High adoption in Typst ecosystem; dated `2026-11-21` observation; content still anchored to `0.6.1` | Multi-file `globals.typ` + `main.typ` + section layout and concise task routing pattern | Verbatim 34-file Docusaurus `0.6.1` mirror, `0.5.0`/`0.6.1` examples, and any verbatim prose/template reuse (undeclared license) | 未声明 (undeclared) |
| `touying-typ/seaslides@seaslides-typst-slides-skill` | Official Touying organization trust anchor | 69 | 53 | Maintained under official `touying-typ` org; MIT license; verified workflow structure | Quick/Full complexity tiers, single authoritative technical contract, compile + audit + visual QA closing gates | Pinned `0.7.4` version assumptions and heavy multi-role image-generation pipeline | MIT |
| `tylina/tylina-skill@typst-slides` | Complementary specialist for workspace hygiene | 12 | 14 | MIT license; inspected workflow rules for existing repositories | Workspace Intent Gate (detect and reuse canonical `.typ` entrypoints instead of overwriting) and compile-verified closeout | Proprietary MCP server coupling | MIT |
| `statzhero/typst-touying-skill@typst-touying` | Complementary reference | 5 | 1 | Small community skill; dated `2026-11-21` | Conceptual reminder for layout hierarchy, visual metaphors, and non-monotonous slide composition | Single-file hardcoded aesthetic preferences; strict zero-copy boundary due to undeclared license | 未声明 (undeclared) |

## Strict License & Non-Copy Boundary

- `apcamargo/typst-skills` and `statzhero/typst-touying-skill` carry **no declared license**. Only high-level architectural concepts (multi-file separation, concise routing, layout hierarchy reminders) were studied; **zero prose, examples, or assets** were copied from either repository.
- All Touying `0.8.0` API contracts, parameter signatures, breaking-change rules, and defaults documented across this package were verified directly against the locally cached `@preview/touying:0.8.0` package source (`typst.toml`, `changelog.md`, `src/*.typ`, `themes/*.typ`).

## Original Contribution & `keep / adapt / reject / invent` Ledger

- **Keep**:
  - Multi-file `globals.typ` + `main.typ` + `sections/*.typ` separation (`references/core-0.8.md`, `examples/02-multi-file/`).
  - Quick vs Full complexity tiering and compile + visual QA closing gate (`SKILL.md`).
  - Explicit negative trigger exclusions for `HTML`, `reveal.js`, `PPT`, `Marp`, ordinary Typst papers, and `academic-defense-beamer`.
- **Adapt**:
  - Upgraded all package contracts, references, examples, and warnings from `0.6.1`/`0.7.4` to `@preview/touying:0.8.0` (`Typst 0.15.0+`).
  - Implemented Workspace Intent Gate cleanly without external MCP server lock-in (`SKILL.md` Section 2).
  - Replaced `34` verbatim Docusaurus `0.6.1` files and `9` legacy examples with `8` source-verified reference guides (`references/*.md`) and `6` graded `0.8.0` examples (`examples/01-minimal.typ` through `examples/06-bundle-pdfpc.typ`).
  - Generalized layout craft and 3-prototype direction comparison with parameterized palettes instead of fixed colors (`references/visual-craft.md`).
- **Reject**:
  - Verbatim upstream Docusaurus documentation dumps (`docs/` removed).
  - Outdated `0.5.0`/`0.6.1` defaults (`semi-transparent-cover`, `touying-equation`, `magic.bibliography()`, `config-methods(show-only-notes: ..)`, string-array `touying-reducer-bindings`).
  - Heavy external multi-role image-generation frameworks or proprietary MCP protocols.
- **Invent**:
  - Complete `0.8.0` topic suite covering `waypoints` / `#animate` / `swap` / native math / `#touying-render` / `#touying-recall` (`animations-waypoints.md`), `presentation` / `handout` / `article` dual modes (`output-modes-article.md`), custom themes / `notes-fn` / Typst `0.15` bundle `.pdfpc` (`themes-notes-export.md`), lambda `touying-reducer-bindings` for `cetz`/`fletcher`/`lilaq`/`alchemist`/`theorion`/`pinit`/`codly`/`mitex` (`integrations.md`), and visual craft guardrails (`visual-craft.md`).
  - Deterministic `scripts/touying_check.py` (`doctor`, static `audit --strict-warnings`, multi-mode / `--bundle` `compile` with dynamic `--warnings` flag probing and strict `stderr` warning promotion).
  - Bilingual `evals/trigger_cases.json`, `13`-case `evals/evals.json`, and 5 automated test suites + 5 `.typ` fixtures (`tests/`).

## Generalization Gate

- Classification: **generalizable Production skill upgrade** across Typst `0.15.0+` / Touying `0.8.0` workflows (new decks, multi-file architecture, animations/waypoints, `presentation`/`handout`/`article` multi-mode decks, custom themes/`notes-fn`, ecosystem reducers, and deterministic audits), rather than overfitting to a single prompt.

## Created Skill Advantages

- **Design advantage**: Replaces `34` stale `0.6.1` mirror files and `9` outdated examples with a lean `<10 KB` root `SKILL.md` router backed by `8` topic references, `6` graded examples, Workspace Intent Gate, and strict exclusion boundaries.
- **Validated advantage**: Verified locally on Typst `0.15.1` (`typst >= 0.15.0` met; `supports_warnings_flag: false` so `touying_check.py` enforces strict `stderr` warning promotion) across all `6` graded example tiers (including `presentation`/`handout`/`article` and `--bundle` `.pdfpc` export), 3-round `1x` (144 PPI) + `4x` (360 PPI + cropped) subagent visual inspection (`PASS`, `0` remaining defects), `scripts/check.py`, `scripts/check_skill_evals.py`, `validate_skill.py`, `trigger_eval.py`, `release_check.py --phase local --run-tests`, and all Node + Python test suites.
- **Hypothesis**: Routing directly to verified `0.8.0` contracts, `examples/README.md` tiers, and `touying_check.py` audits should prevent `0.6.x`/`0.7.x` API drift and compile failures in live agent workflows, though cross-provider model output benchmarking has not been run yet.

## Missing Evidence

- `rating evidence unavailable`: neither `skills.sh` nor `SkillsMP` exposes verified user ratings/reviews.
- Provider-backed model A/B output comparison (`reports/output-evidence.json` intentionally omitted rather than fabricated).
- External blind human review and remote `npx skills add` clean installation check after branch merge.
