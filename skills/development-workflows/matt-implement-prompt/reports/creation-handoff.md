# Creation Handoff

## 1. Result

- Skill: `matt-implement-prompt` (`0.1.0`)
- Job to be done: Compile Matt Pocock Spec + Ticket task graphs (GitHub Issues or local `.scratch/` trackers) into a self-contained, pointer-driven fresh-session execution prompt with TDD, `/code-review`, CI gates, and explicit remote issue-closing protocol.
- Local path: `skills/development-workflows/matt-implement-prompt/` (committed locally on branch `dev`; not pushed externally).

## 2. Reference skills studied

- `dzhng/skills@implement-spec` ([GitHub](https://github.com/dzhng/skills/tree/main/skills/implement/implement-spec), MIT, GitHub `1,514` stars, `skills.sh` `346` installs): entered as popularity anchor; learned wavefront parallelism and slice-as-checkpoint discipline; mapped to `references/prompt-contract.md`.
- `chrisbanes/skills@implement-issue` ([GitHub](https://github.com/chrisbanes/skills), Apache-2.0, GitHub `1,164` stars, `skills.sh` `102` installs): entered as complementary issue specialist; learned live issue-query grounding; mapped to `references/tracker-adapters.md`.
- Local `.agents/skills/{implement-spec,implement,handoff}` (MIT): entered as Matt Pocock canonical method; learned sparse pointers, integration branch, and `/tdd` + `/code-review` closeout; mapped to `SKILL.md` and `references/prompt-contract.md`.
- First-party `goal-meta-skill` and `trellis-plan-review`: entered as internal prompt-compiler anchors; learned `compile -> lint -> present -> stop` authority lock and placeholder/back-reference linting; mapped to `SKILL.md` and `scripts/lint_implement_prompt.py`.

## 3. Absorbed and rejected

- Keep: pointer-first handoffs, frontier task graphs, integration branch + isolated worktrees, `/tdd` + `/code-review` loop, zero-placeholder linting.
- Adapt: two-step `gh issue comment` (UTF-8 `--body-file`) before `gh issue close`, parent sub-issue verification guard, and `.scratch/` local tracker mode.
- Reject: executing product code or closing issues directly during prompt compilation; mixing `/goal` 5-platform syntax or Trellis plan-revision constraints; copying unverified prose.
- Invent: unified authorization & prohibition matrix plus deterministic `scripts/lint_implement_prompt.py` gating source pointers, frontier specs, TDD/review gates, `git push` boundary, and remote-close safety.

## 4. Advantages and highlights

- `[design advantage]` Isolates prompt compilation (`compile -> lint -> present -> stop`) from implementation execution, preventing premature edits or unreviewed remote issue closures.
- `[validated advantage]` Enforces placeholder, private-path, back-reference, pointer, frontier, verification, push-boundary, and close-protocol invariants via `scripts/lint_implement_prompt.py` and passes `tests/test_matt_implement_prompt.py`, `trigger_eval.py`, `validate_skill.py`, and `just ci`.
- `[hypothesis]` Expected to make fresh-session `/implement-spec` runs self-contained with fewer mid-run stalls or forgotten remote issue comments; live cross-session provider-backed comparison remains `missing evidence`.

## 5. Verification and limits

- `validate_skill.py`: passed (`ok: true`, `failures: []`, `warnings: []`).
- `trigger_eval.py`: passed 14/14 cases (`pass_rate: 1.0`, 6 should-trigger, 4 should-not-trigger, 4 near-neighbor, 0 false positives, 0 false negatives).
- `tests/test_matt_implement_prompt.py`: passed 7/7 stdlib unit tests covering valid GitHub/local prompts, 12 adversarial linter failure modes, non-ASCII directory input, single `SKILL.md` entrypoint, and link integrity.
- Repository `just ci`: all 8 steps passed (including `docs-check`, `skills-check`, `python-check`, `python-test`, `install-projects-test`, `node-test`, `evals-check`, and `git diff --check`).
- `missing evidence`: live cross-session provider-backed execution transcript and human blind A/B review (`reports/output-evidence.json` intentionally absent rather than fabricated).
- Excluded actions: never runs `git push`, edits product code, or closes remote issues during compilation.
