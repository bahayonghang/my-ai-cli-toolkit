# Harmonize and fix developer-tools-integrations skills

## Goal

Fix the defects and consistency drift found in the 7 skills under
`skills/developer-tools-integrations/` and give the category a durable
house-style anchor so it stops drifting. This is the **parent** task: it owns
the review findings, the child task map, and the final integration review. It
has no direct implementation work of its own.

Skills in scope: `agent-skill-review`, `agents-md-improver`, `archive-planning`,
`ast-grep`, `claude-md-improver`, `codex-workflow-recommender`, `goal-meta-skill`.

## Review findings (evidence-led)

Severity uses the agent-skill-review rubric (P0 cannot load/trigger/unsafe · P1
will fail in real use · P2 meaningfully weaker · P3 polish).

### What is already healthy (verified, no action)

- All 7 skills pass `python scripts/check.py skills/developer-tools-integrations`
  with zero errors and zero warnings.
- Every `references/*` pointer resolves on disk — no broken links.
- All descriptions are within the 1024-char limit and contain no angle brackets.
- `__pycache__/*.pyc` under the scripts are gitignored, not tracked — not a defect.
- `archive_planning.py` logic is sound (atomic move, required-file guard,
  placeholder-aware feature inference); the only defect is how SKILL.md invokes it.

### P1 — archive-planning script command is broken

- `archive-planning/SKILL.md:30` and `:36` invoke the script via bare
  `$SKILL_DIR/scripts/archive_planning.py`.
- `$SKILL_DIR` is **not set at runtime** and expands to a broken path, so the
  skill's only action fails. This is stated authoritatively in
  `skills/git-github-collaboration/AGENTS.md:12-14` ("Do not use a bare
  `$SKILL_DIR` … it expands to a broken path") and confirmed by prior project memory.
- → Child `06-20-fix-dti-script-paths`.

### P2 — goal-meta-skill script command is fragile

- `goal-meta-skill/SKILL.md:59-60` (and the reference at `:134`) call
  `python scripts/lint_goal_command.py`, a cwd-relative path that only works if
  the working directory happens to be the skill directory (it is normally the
  repo root).
- → Child `06-20-fix-dti-script-paths` (same script-path resolution class).

### P2 — evals are inconsistent and thin on routing-negatives

- Schema drift: `ast-grep` and `goal-meta-skill` use an `expectations` key;
  `archive-planning` has neither `assertions` nor `expectations`. The repo's
  mature schema (git-commit, see `git-github-collaboration/AGENTS.md:32-42`) uses
  `assertions[]`.
- Coverage gap: `ast-grep` (3 evals) and `archive-planning` (3 evals) have **zero**
  near-neighbor routing-negative cases; `goal-meta-skill` has one (eval #6).
- `agents-md-improver`, `claude-md-improver`, `codex-workflow-recommender` have
  **no `evals/` at all**.
- → Child `06-20-harmonize-dti-evals`.

### P2 — no category-level AGENTS.md (root cause of the drift)

- Only `git-github-collaboration` has an `AGENTS.md`. `developer-tools-integrations`
  has none, so there is no anchor for script-path, `allowed-tools`, evals schema,
  or interface-file conventions — which is exactly why the items above diverged.
- → Child `06-20-add-dti-agents-md`.

### P3 — frontmatter and interface-file inconsistency

- `agent-skill-review` and `goal-meta-skill` lack `allowed-tools` and
  `argument-hint`; the other 5 skills carry both. `goal-meta-skill` clearly takes
  an argument and runs a script, so the omission is substantive.
- Interface files diverge: `agent-skill-review` has only the platform-named
  `agents/openai.yaml` (plus a `policy:` block); `goal-meta-skill` has **both**
  `agents/interface.yaml` and `agents/openai.yaml` (duplication); the other 5 have
  no `agents/` interface file. The git-github house rule is a single neutral
  `agents/interface.yaml`.
- `version` quoting differs (`agent-skill-review` quotes `"1.0.0"`; others unquoted) — cosmetic.
- → Child `06-20-normalize-dti-frontmatter`.

## Task map

| Child task                        | Sev | Deliverable                                                                                 |
| --------------------------------- | --- | ------------------------------------------------------------------------------------------- |
| `06-20-fix-dti-script-paths`      | P1  | archive-planning + goal-meta-skill invoke scripts via the portable `<skill-dir>` convention |
| `06-20-add-dti-agents-md`         | P2  | category `AGENTS.md` pinning script-path / allowed-tools / evals / interface conventions    |
| `06-20-harmonize-dti-evals`       | P2  | one eval schema + at least 2 routing-negative near-neighbor cases per eval-bearing skill    |
| `06-20-normalize-dti-frontmatter` | P3  | consistent `allowed-tools` / `argument-hint` / interface files                              |

## Cross-child acceptance criteria

- [ ] `just ci` passes clean after all children land.
- [ ] No skill invokes a script via bare `$SKILL_DIR` or a cwd-relative path.
- [ ] The category's conventions are written down in one place and the existing
      skills conform to them (or the AGENTS.md explicitly records intentional
      exceptions, the way git-github's does for licenses/icons).
- [ ] Changes stay surgical: no rewrites of skill bodies that already work, no
      touching the 4 deleted-in-git `improve-codebase-architecture` files.

## Recommended order

Convention-defining work should land before the work that applies it:
`add-dti-agents-md` -> (`harmonize-dti-evals`, `normalize-dti-frontmatter`).
`fix-dti-script-paths` is an independent P1 bug fix and can land first/anytime.
Parent/child is not a dependency system; this ordering is advisory and recorded
here per Trellis guidance.

## Notes

- Do not dispatch sub-agents for this work (environment constraint from the
  requester); drive edits and `task.py` directly.
- Each child is independently plan, implement, check, and archive-able.
