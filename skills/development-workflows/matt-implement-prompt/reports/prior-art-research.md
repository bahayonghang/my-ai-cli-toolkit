# Prior-Art Research

- Researched at: 2026-11-21
- Queries: `"implement spec"`, `"github issue implement"`, `"handoff prompt"`
- Catalogs: skills.sh, SkillsMP, plus repository built-in Matt Pocock / Qiaomu workflows
- Rating evidence: unavailable (`skills.sh` exposes install telemetry only; SkillsMP exposes GitHub repository stars only)

| Candidate | Relevance | skills.sh installs | SkillsMP repo stars | Quality/trust evidence | Adopt | Reject | License |
|---|---|---|---|---|---|---|---|
| `dzhng/skills@implement-spec` | Popularity anchor for multi-pass spec execution | 346 (plus 107 for `implement-spec-with-goal`) | N/A in queried top-10 SkillsMP slice; GitHub `1,514` stars | MIT license; active maintenance (`2026-11-13`) | Wavefront parallelism, slice-as-checkpoint mindset, live handoff updates | Coupling prompt authoring with direct code implementation | MIT |
| `chrisbanes/skills@implement-issue` | Complementary specialist for GitHub issue-driven execution | 102 | N/A in queried top-10 SkillsMP slice; GitHub `1,164` stars | Apache-2.0; active maintenance (`2026-11-21`) | Grounding implementation directly in live issue criteria and tracker state | Single-issue assumption without parent Spec + blocked-by DAG | Apache-2.0 |
| `mattpocock/skills` (`implement-spec`, `implement`, `handoff`) | Method authority in local `.agents/skills/` | Not queried independently in run | — | Local primary workflow inspected directly | Sparse context pointers, frontier task graph, integration branch, `/tdd` + `/code-review` | Leaves cross-session execution + explicit remote close prompt compilation unbundled | MIT |
| `goal-meta-skill` & `trellis-plan-review` | Repo-internal architectural anchors | — | — | First-party skills with passing repo tests | `compile -> lint -> present -> stop` authority boundary, zero-placeholder linter, no back-references | `/goal` platform syntax (`GOAL.md`) and Trellis plan-revision restrictions | MIT |

## Original contribution

1. Bridges the exact handoff gap between `/to-spec` + `/to-tickets` and a fresh `/implement-spec` or `/implement` session.
2. Elevates remote side-effect authorization (explicit local commit, two-step `gh issue comment` before `gh issue close`, and explicit default prohibition of `git push` / merging to base branch / opening PRs) into a first-class contract enforced by `scripts/lint_implement_prompt.py`.
3. Grounds compiled prompts in verified repository commands and observed runtime environment constraints (e.g. local Python interpreter checks) discovered during read-only S1 recon.

## What we learned from each candidate

- `dzhng/skills@implement-spec`: wavefront scheduling and pass checkpoints -> adapted into [Prompt Contract](references/prompt-contract.md) Section 2 and Section 4.
- `chrisbanes/skills@implement-issue`: pulling live issue criteria instead of stale prose -> adapted into [Tracker Adapters](references/tracker-adapters.md) `gh issue view` / `gh api` recon commands.
- `mattpocock/skills` (`implement-spec`, `implement`, `handoff`): sparse pointer-driven handoff, integration branch, `/tdd` + `/code-review` loop -> retained directly in [SKILL.md](SKILL.md) and [Prompt Contract](references/prompt-contract.md).
- `goal-meta-skill` & `trellis-plan-review`: `compile -> lint -> present -> stop` gate and anti-back-reference rules -> implemented deterministically in [Lint Script](scripts/lint_implement_prompt.py).

## Created skill advantages

- Design advantage: separates prompt compilation from code execution so the compiling session never mutates product files or closes remote issues prematurely, while encoding the two-step GitHub close protocol.
- Validated advantage: verified locally via `validate_skill.py`, `trigger_eval.py`, `tests/test_matt_implement_prompt.py`, and `just ci`.
- Hypothesis: expected to reduce cross-session drift and premature/uncommented remote issue closures in fresh `/implement-spec` runs; cross-session provider-backed execution telemetry remains `missing evidence`.

## Missing evidence

- No `skills.sh` or SkillsMP user ratings/reviews (`rating evidence unavailable`).
- No multi-session provider-backed runtime A/B benchmark or blind human review pack yet (`missing evidence`).
