# Creation Handoff

## 1. Result

- Skill: `in-your-own-words` (`0.1.0`, Production tier)
- Job to be done: Restate the user's goals, underlying problem, observable success check, and up to 3 high-leverage assumptions or open forks in plain paraphrased words, then hard-stop for confirmation before editing files or acting.
- Local path: `skills/development-workflows/in-your-own-words/` (uncommitted working-tree additions on `dev`; not committed or pushed).

## 2. Reference skills studied

- `cursor/plugins@in-your-own-words` ([GitHub](https://github.com/cursor/plugins/tree/main/pstack), `harness/pstack/claude-code/skills/in-your-own-words/SKILL.md`, MIT, `skills.sh` `1.9K` installs as of `2026-11-22`, GitHub `18,476` stars): entered as popularity and origin anchor (matching user screenshot); learned focusing playback around user goals + underlying problem and documenting explicit-invocation preference (`disable-model-invocation: true`); mapped to `SKILL.md`, `agents/interface.yaml`, and `references/playback-contract.md` Section 6.
- `Yeachan-Heo/oh-my-claudecode@in-your-own-words` ([GitHub](https://github.com/Yeachan-Heo/oh-my-claudecode/blob/main/skills/in-your-own-words/SKILL.md), MIT, `skills.sh` `58` installs as of `2026-11-22`, GitHub `41,015` stars): entered as complementary evolution anchor; learned 3-part playback (`Goal`, `Problem`, `Success check`), explicit anti-parroting discipline, inline named assumptions, surfacing disagreement directly, and a single drift-check line; mapped to `SKILL.md` (`S2`/`S3`) and `references/playback-contract.md` Sections 1–2.
- `affaan-m/ECC@intent-driven-development` ([GitHub](https://github.com/affaan-m/ECC/tree/main/pi/core/skills/intent-driven-development), MIT, SkillsMP `307,331` indexed repo stars / GitHub `309,056` stars): entered as SkillsMP trust/rigor anchor; learned read-only context grounding before restating, observable success checks without ceremony, and excluding routine well-specified edits; mapped to `SKILL.md` (`S0`/`S1`) and `evals/trigger_cases.json`.
- `mattpocock/skills@grill-me` ([GitHub](https://github.com/mattpocock/skills), local `.agents/skills/grilling/SKILL.md`, MIT, `skills.sh` `1.6M` installs as of `2026-11-22`, GitHub `330,557` stars): entered as high-adoption boundary anchor; learned "finding facts is the agent's job, never the user's" while keeping `in-your-own-words` strictly single-shot rather than multi-round design-tree grilling; mapped to `SKILL.md` (`S1`) and `references/playback-contract.md` Sections 4–5.

## 3. Absorbed and rejected

- Keep: tight focus on Goal + Problem (`pstack`), 3-part playback + Success Check + anti-parroting + surface disagreements (`oh-my-claudecode`), read-only context grounding + clear-edit exclusion (`intent-driven-development`), and agent-owned fact lookup (`grill-me`).
- Adapt: bilingual Chinese/English triggering and output; separating `Assumptions & Open Forks` capped at `<= 3` items; moving `disable-model-invocation: true` guidance to `agents/interface.yaml` and `references/playback-contract.md` so root `SKILL.md` passes the repository's strict frontmatter schema without warnings.
- Reject: `oh-my-claudecode`'s cross-skill coupling to `principles` ("proceed-and-report on reversible work"), which contradicts the user's expectation of pausing for confirmation before acting; `intent-driven-development`'s heavyweight handoff-spec scope; `grill-me`'s multi-round interrogation loop; and `nextstage-brasil/skills@clarify-requirements`'s SDD directory ceremony.
- Invent: strict `Playback-not-Execution` hard-stop contract and a zero-dependency deterministic checker `scripts/check_playback.py` auditing 4-part structure, premature execution/diffs, question overflow (`> 4`), unresolved placeholders, and bilingual 3/4-gram anti-parroting overlap.

## 4. Advantages and highlights

- `[design advantage]` Enforces a strict `Playback-not-Execution` stop even for "reversible" edits, explicitly surfaces internal brief contradictions instead of smoothing them over, and remains fully compatible with the repository's `SKILL.md` frontmatter schema and VitePress docs catalog.
- `[validated advantage]` Verified locally via `scripts/check_playback.py` unittest suite (6/6 test methods including 4-part structure, Chinese/English anti-parroting, premature diff/action, question-overflow, and package-contract subtests), `validate_skill.py` (0 failures, 0 warnings), `trigger_eval.py` (17/17, 0 FP / 0 FN), `release_check.py --phase local`, and `just ci`.
- `[hypothesis]` Expected to catch misaligned mental models and parroted confirmations cheaply before implementation across Chinese and English briefs; live multi-provider A/B behavioral comparisons remain `missing evidence`.

## 5. Verification and limits

- `validate_skill.py`: passes with `0` failures and `0` warnings.
- `trigger_eval.py`: passes `17/17` (`pass_rate: 1.0`, 8 should-trigger, 4 should-not-trigger, 5 near-neighbor, 0 FP, 0 FN).
- `tests/test_in_your_own_words.py`: all `6/6` unittest methods pass covering positive/adversarial playback audits and package integrity.
- `release_check.py --phase local` and `just ci`: all local release gates (0 blocks) and full repository CI steps pass.
- `missing evidence`: live cross-client runtime discovery, provider-backed A/B comparison, and blind human review (`reports/output-evidence.json` omitted rather than fabricated).
- Excluded actions: never modifies files, creates patches, runs mutating commands, or opens PRs during playback; never executes `git commit` or `publish_skill.py` without explicit user authorization.
