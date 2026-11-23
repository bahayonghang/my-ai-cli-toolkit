# Prior-Art Research

- Researched at: 2026-11-22
- Queries: `"in your own words"`, `"restate goals"`, `"clarify requirements"`, `"grill me"`
- Catalogs: `skills.sh`, `SkillsMP`, plus direct GitHub API source inspection and local `.agents/skills/grilling/SKILL.md`
- Rating evidence: `rating evidence unavailable` (`skills.sh` exposes install telemetry only; `SkillsMP` exposes GitHub repository stars only)

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---|---|---|---|---|---|
| `cursor/plugins@in-your-own-words` (`pstack`) | Popularity & origin anchor (matches user screenshot) | `1.9K` installs | N/A in queried slice; GitHub `18,476` stars | Active repo (`pushed_at: 2026-11-22`); commit `dbf4981` (`2026-10-13`) explicitly reworded around goals & problem; `pstack` v`0.15.46` | Tight focus on restating goals + underlying problem in your own words; explicit-invocation discipline note (`disable-model-invocation: true`) | Single-sentence body lacking anti-parroting rules, read-only stop lock, success check, and repo frontmatter compatibility | MIT |
| `Yeachan-Heo/oh-my-claudecode@in-your-own-words` | Complementary evolution anchor crediting `pstack` | `58` installs | N/A in queried slice; GitHub `41,015` stars | Active repo (`pushed_at: 2026-11-21`); explicit attribution to Lauren Tan & `michael-denyer/pstack-claude` | Three-part plain playback (**Goal**, **Problem**, **Success check**), explicit paraphrase-not-copy rule, inline assumptions, surfacing disagreement, drift-check closing line | Cross-skill coupling to `principles` ("proceed-and-report on reversible work"), which breaks the expected pre-execution hard pause | MIT |
| `affaan-m/ECC@intent-driven-development` | Trust & rigor anchor from SkillsMP | N/A in queried slice | `307,331` indexed stars (GitHub `309,056`) | Top SkillsMP match for `"clarify requirements"`; active repo (`pushed_at: 2026-11-20`) | Inspecting repository context read-only before restating, observable/testable success criteria without ceremony, excluding clear routine edits | Heavy acceptance-criteria / multi-agent handoff scope overlapping `/to-spec` and `matt-implement-prompt` | MIT |
| `mattpocock/skills@grill-me` (`.agents/skills/grilling`) | High-adoption near-neighbor boundary anchor | `1.6M` installs | N/A in queried slice; GitHub `330,557` stars | Inspected locally and on GitHub (`pushed_at: 2026-11-19`) | "Finding facts is the agent's job, never the user's" — brief read-only repo grounding instead of asking factual questions | Multi-round relentless design-tree interviewing; `in-your-own-words` stays single-shot playback + hard stop | MIT |

> Note: `nextstage-brasil/skills@clarify-requirements` (Apache-2.0, `41` installs / `ns-sdd-clarify-requirements` `70` installs, `0` GitHub stars) was also inspected and rejected because it is tightly coupled to a multi-section SDD version-directory checklist ceremony.

## Original contribution

1. Combines `pstack`'s tight goal-and-problem alignment focus with `oh-my-claudecode`'s three-part playback and anti-parroting discipline while eliminating cross-skill coupling so the agent **always** hard-stops before modifying files or starting "reversible" work.
2. Enforces repo-compatible bilingual Chinese/English triggers and routes multi-round interrogation (`grilling` / `laoyeye`), spec authoring (`/to-spec` / `/to-tickets`), prompt compilation (`matt-implement-prompt` / `goal-meta-skill`), and prose rewriting (`write` / `renhua`) out cleanly.
3. Adds a zero-dependency deterministic playback checker (`scripts/check_playback.py`) that verifies structural completeness, read-only stop compliance, question-count bounds (`<= 4`), and anti-parroting 3/4-gram overlap against an optional `--brief`.

## What we learned from each candidate

- `cursor/plugins@in-your-own-words`: centering the playback on **what the user's goals are** and **what problem they are trying to solve**, plus documenting host-level `disable-model-invocation: true` -> mapped to `SKILL.md`, `agents/interface.yaml`, and `references/playback-contract.md` Section 6.
- `Yeachan-Heo/oh-my-claudecode@in-your-own-words`: adding **Success Check**, explicit **paraphrase-not-copy** rules, inline assumptions/disagreements, and a single drift-check line -> mapped to `SKILL.md` (`S2`/`S3`) and `references/playback-contract.md` Sections 1–2.
- `affaan-m/ECC@intent-driven-development`: read-only context inspection before playback and excluding clear routine tasks -> mapped to `SKILL.md` (`S0`/`S1`) and `evals/trigger_cases.json`.
- `mattpocock/skills@grill-me`: separating agent fact-finding from user decision alignment -> mapped to `SKILL.md` (`S1`) and `references/playback-contract.md` Section 4–5.

## Created skill advantages

- `design advantage`: adds a strict `Playback-not-Execution` hard stop (blocking "proceed on reversible work") plus deterministic `check_playback.py` anti-parroting and structure checks while keeping root frontmatter compliant with the repository schema.
- `validated advantage`: validated locally against `check_playback.py` unit tests, `validate_skill.py`, `trigger_eval.py`, `release_check.py --phase local`, and `just ci`.
- `hypothesis`: expected to reduce silent misalignment and parroted confirmations in bilingual Chinese/English coding sessions; live cross-session provider-backed A/B comparison remains `missing evidence`.

## Missing evidence

- No `skills.sh` or SkillsMP user ratings/reviews (`rating evidence unavailable`).
- No live multi-provider behavioral A/B benchmark or blind human review pack yet (`missing evidence` in `reports/output-evidence.json`).
