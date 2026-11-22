# Creation Handoff

## 1. Result

- Skill: `matt-implement-prompt` (`0.2.0`, upgraded from `0.1.0` via Qiaomu SkillOps Loop)
- Job to be done: Compile Matt Pocock Spec + Ticket task graphs (GitHub Issues or local `.scratch/` trackers) into a self-contained, pointer-driven fresh-session execution prompt enforcing branch-or-worktree isolation, TDD, `/code-review`, CI gates, split atomic commits with clean working tree check, commit-SHA-linked issue closure, and base-branch-aware delivery (`dev-merge`, `main-pr`, or `branch-only`).
- Local path: `skills/development-workflows/matt-implement-prompt/` (uncommitted working-tree edits on `dev`; not committed or pushed).

## 2. Reference skills studied

- `dzhng/skills@implement-spec` ([GitHub](https://github.com/dzhng/skills/tree/main/skills/implement/implement-spec), MIT, GitHub `1,514` stars, `skills.sh` `346` installs): entered as popularity anchor; learned wavefront parallelism and slice-as-checkpoint discipline; mapped to `references/prompt-contract.md`.
- `chrisbanes/skills@implement-issue` ([GitHub](https://github.com/chrisbanes/skills), Apache-2.0, GitHub `1,164` stars, `skills.sh` `102` installs): entered as complementary issue specialist; learned live issue-query grounding; mapped to `references/tracker-adapters.md`.
- Local `.agents/skills/{implement-spec,implement,handoff}` (MIT): entered as Matt Pocock canonical method; learned sparse pointers, integration branch, and `/tdd` + `/code-review` closeout; mapped to `SKILL.md` and `references/prompt-contract.md`.
- First-party `goal-meta-skill` and `trellis-plan-review`: entered as internal prompt-compiler anchors; learned `compile -> lint -> present -> stop` authority lock and placeholder/back-reference linting; mapped to `SKILL.md` and `scripts/lint_implement_prompt.py`.
- First-party `git-commit`, `git-worktree`, and `gh-pr-release` (MIT, in-repo siblings): inspected semantically for `0.2.0` SkillOps upgrade; learned local `git commit -F` splitting discipline, `.gitignore`-covered worktree convention hygiene, and explicit authorization boundaries for PR merge and branch sync without hard-coupling external clients.

## 3. Absorbed and rejected

- Keep: pointer-first handoffs, frontier task graphs, `/tdd` + `/code-review` loop, zero-placeholder linting, and `Payload-not-Execution` isolation during prompt compilation.
- Adapt (`0.1.0`): two-step `gh issue comment` (UTF-8 `--body-file`) before `gh issue close`, parent sub-issue verification guard, and `.scratch/` local tracker mode.
- Adapt (`0.2.0` SkillOps upgrade):
  - Branch-vs-worktree isolation decision matrix grounded in S1 read-only recon (`git status --short --branch`, `git worktree list`, `git remote -v`, `gh repo view defaultBranchRef`).
  - Mandatory split atomic commits (covering per-ticket slices, `/code-review` fixes, and generated docs) + clean working tree gate (`git status --short --untracked-files=all` empty and `git log <base>..HEAD` non-empty) + concrete commit SHA linking before closing any issue.
  - Base-branch-aware delivery & sync: `dev-merge` (direct local merge to `dev` preserving split commits + branch/worktree cleanup, no auto-push by default); `main-pr` (explicit direct-push guard, PR create/merge `--merge --delete-branch` with squash-only and branch-protection fallbacks, cleanup, and `git fetch`/`git pull --ff-only` sync verifying `HEAD == origin/<base>`); `branch-only` conservative fallback for custom base branches.
- Reject: executing product code or closing issues during prompt compilation; blanket bans on merging back to `dev` or opening PRs on `main`/`master`; using `git stash` on dirty main working trees; using `--admin` or `--force` to bypass branch protection.
- Invent: base-branch-aware delivery auto-routing (`resolve_delivery_mode` / `resolve_close_mode`) and 6 deterministic linter hard gates in `scripts/lint_implement_prompt.py` (`missing_workspace_isolation`, `missing_split_commit_gate`, `missing_commit_issue_link`, `missing_dev_merge_cleanup`, `missing_main_pr_sync`, `contradictory_delivery_policy`).

## 4. Advantages and highlights

- `[design advantage]` Eliminates silent uncommitted-work / unlinked-issue closures and replaces rigid one-size-fits-all prohibitions with base-branch-aware delivery (`dev-merge` vs. `main-pr` vs. `branch-only`) and explicit dirty-tree worktree isolation.
- `[validated advantage]` Enforces all 6 new deterministic linter gates alongside existing structural/security invariants via `scripts/lint_implement_prompt.py`, passing unit tests (9 test methods including 25 adversarial subtests), template lint checks, `validate_skill.py`, `trigger_eval.py` (17/17, 0 FP / 0 FN), `release_check.py --phase local`, and `just ci`.
- `[hypothesis]` Expected to eliminate end-of-run forgotten commits, unlinked issue closures, and stale local `main`/`master` state in fresh `/implement-spec` sessions; live cross-session provider-backed execution telemetry remains `missing evidence`.

## 5. Verification and limits

- Baseline (`0.1.0`) vs. Post-Change (`0.2.0`):
  - `validate_skill.py`: `0.1.0` passed (0 failures, 0 warnings) -> `0.2.0` passes with 0 failures and 0 warnings.
  - `trigger_eval.py`: `0.1.0` 14/14 -> `0.2.0` 17/17 (`pass_rate: 1.0`, 8 should-trigger, 4 should-not-trigger, 5 near-neighbor, 0 FP, 0 FN).
  - `tests/test_matt_implement_prompt.py`: `0.1.0` 7 tests (12 adversarial subtests) -> `0.2.0` 9 tests (25 adversarial subtests + `dev-merge`, `main-pr`, `master`, `branch-only`, and `local` golden contracts + template compilation checks).
  - `release_check.py --phase local --run-tests` and `just ci`: all local release gates (0 blocks) and repository CI checks pass after the final `0.2.0` edit.
- `missing evidence`: live cross-session provider-backed execution transcript and human blind A/B review (`reports/output-evidence.json` intentionally absent rather than fabricated).
- Excluded actions: never runs `git commit`, `git push`, edits target product code, or closes remote issues during compilation.
