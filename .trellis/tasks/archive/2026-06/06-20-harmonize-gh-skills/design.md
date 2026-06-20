# Design — Harmonize git-github-collaboration skill suite

## 1. House standard (target state)

All four skills converge on the conventions `git-commit` already proved:

| Dimension | Standard |
|---|---|
| Script path | `${CLAUDE_SKILL_DIR}` token (verified mechanism, see §2), never bare `$SKILL_DIR` |
| Python invocation | call `python` via `Bash`; scripts self-locate via `Path(__file__)` |
| `allowed-tools` | exact, minimal, behavior-matched (see §3) |
| Eval | `evals/evals.json` with `assertions[]` + negative/near-neighbor cases (§5) |
| Interface | `agents/interface.yaml`, neutral fields, short `short_description` (§6) |
| Reference depth | long material in `references/`; SKILL.md stays lean and is the single source of execution truth |

Non-goals: do not restructure git-commit (it already matches); do not touch
script core logic beyond the stale recipe.

## 2. D1 — Script path resolution (R1, F1)

**Problem:** `$SKILL_DIR` is unset (verified: `echo "${SKILL_DIR:-UNSET}"` →
`UNSET`; settings.json injects nothing). Claude Code's changelog documents
`${CLAUDE_SKILL_DIR}` as the variable "for skills to reference their own directory
in SKILL.md content." git-commit sidesteps the issue with literal-path
substitution and an explicit "not an env var" note.

**Decision:** standardize on `${CLAUDE_SKILL_DIR}`, but gate it behind an
empirical check because the whole work package depends on it.

- **Step 0 (verification gate):** determine how `${CLAUDE_SKILL_DIR}` is provided
  in this Claude Code version — load-time text substitution into SKILL.md vs an
  exported shell env var. Test by adding the token to a scratch skill / inspecting
  Claude Code docs for the installed version.
- **If load-time substitution (expected):** write
  `python "${CLAUDE_SKILL_DIR}/scripts/x.py"` directly in the three gh-* SKILL.md
  bodies and in `gh-fix-ci/references/BACKGROUND.md`. The token is replaced with
  the absolute path before the agent sees it → robust, no shell dependency.
- **If NOT reliably provided:** fall back to git-commit's pattern verbatim — the
  skill announces its base dir on load; instruct the agent to substitute the
  literal path once into a local `SKILL_DIR=...` and use it. Do not ship a token
  that silently expands to empty.
- Because all scripts already resolve their own directory via `Path(__file__)`,
  correctness only requires the *script path* to be right; both branches achieve
  that.

**Cross-platform note:** `${CLAUDE_SKILL_DIR}` is Claude-Code-specific. The
`agents/interface.yaml` `default_prompt` strings must stay
mechanism-agnostic (they already are — they say "Use $skill-name to …", which is
a skill reference, not a shell path).

**Affected files:** `gh-address-comments/SKILL.md` (L15, L17),
`gh-fix-ci/SKILL.md` (L18), `gh-fix-ci/references/BACKGROUND.md` (L28-29),
`gh-bootstrap/SKILL.md` (L16, L19, L20, L21). git-commit already compliant; only
align wording if Step 0 lets it drop its verbose paragraph.

## 3. D2 — `allowed-tools` matrix (R2, F2)

`scripts/check.py` accepts `allowed-tools` as a valid key but does not validate
its values, so correctness is on us.

| Skill | Current | Target | Rationale |
|---|---|---|---|
| gh-address-comments | `Read, Bash, python` | `Read, Edit, Bash` | drop invalid `python`; add `Edit` — step 8 applies fixes |
| gh-fix-ci | `Read, Bash, python` | `Read, Edit, Bash` | drop invalid `python`; add `Edit` — steps 7-8 implement fixes |
| gh-bootstrap | `Task, AskUserQuestion, Read, Bash, Glob, Grep, Write` | `AskUserQuestion, Read, Bash, Glob, Grep, Write` | drop `Task` (no subagent step). Keep `Write` (creates config files) |
| git-commit | `Bash` | `Read, Bash` | needs `Read` to open its 4 references; must NOT gain Edit/Write (must not edit code) |

Decision detail: gh-* fixers use `Edit` (modify existing files) rather than
`Write`; add `Write` only if a concrete step creates new files (none currently
do). If verification of an actual fix flow shows file creation, revisit.

## 4. D3 — gh-bootstrap single execution path (R3, F3)

**Problem:** SKILL.md says the runtime script does deterministic
detect/fetch/render/validate and that `phases/`+`specs/` are "reference material,
not the execution engine." But `phases/04-execution.md`,
`specs/execution-rules.md`, and `specs/template-catalog.md` document a *different*
manual `git clone`→`Read`→hand-copy→manual-substitute flow that never mentions the
runtime script. The phase/spec set (dated 2026-01-23, v1-3) predates the script
and contradicts it. The catalog also assumes a `{{...}}` placeholder convention
the real upstream templates (actions/starter-workflows etc.) don't use.

**Decision (user-approved): delete the contradictory engine.**

- **Delete:** `phases/` (all 9 files: 01-detection, 02-collection, 02.1/02.2/02.3
  modes, 02.9-finalize, 03-conflict, 04-execution, 05-report) and
  `specs/execution-rules.md`.
- **Keep + slim:** `specs/template-catalog.md` → reduce to the
  component→repo-URL→file-path map the script consumes; drop the manual
  "直接复制" execution narrative and the "更新记录" version log. Keep
  `specs/detection-rules.md`, `specs/manual-actions.md`, `specs/presets.md` only if
  the SKILL.md/script actually reference them — otherwise delete (verify by grep
  during implementation).
- **RULES.md:** fix the `EXACT CLOPY` typo and either align it with the runtime
  flow or fold its few real constraints into SKILL.md, then delete (see F7).
- **SKILL.md edits:** remove the parenthetical "Keep `phases/` and `specs/` as
  reference material…" (L20) and the references to deleted files; ensure the only
  documented flow is detect → (AskUserQuestion) → fetch-template → render-template
  → validate-tree via the runtime script. Keep the "NEVER write config from
  memory / MUST use downloaded templates" mandatory rules.
- **Placeholder mismatch:** document in the slimmed catalog that
  `render-template` only substitutes `{{...}}` placeholders (used by the *inline*
  "(内置)" templates and skill-set fields), and that cloned upstream files keep
  their own `${{ github.* }}` expressions untouched. Do not over-engineer a new
  placeholder engine — just make the doc honest about what the script does.

**Catalog/docs impact:** deleting `phases/` and `specs/*` changes the resource
folders the docs catalog enumerates → run `just docs-sync` and regenerate the
per-skill doc pages (`docs/skills/.../gh-bootstrap.md`, `docs/en/...`).

## 5. D4 — Eval unification (R4, F4)

**Reality:** no CI step consumes eval files (`check.py` reads only frontmatter;
`node-test` runs `skills/**/tests/*.mjs`, of which these skills have none). So
moving/renaming is CI-safe; the value is consistency + future tooling.

- **Format:** adopt git-commit's `evals/evals.json` schema:
  `{ "skill_name", "evals": [ { id, prompt, expected_output, files, assertions[] } ] }`.
- **Migrate:** convert each gh-* `test-prompts.json` (3 cases each) into
  `evals/evals.json`, preserving the existing prompts and turning each `expected`
  string into explicit `assertions[]`. Delete the old `test-prompts.json`.
- **Add routing negatives (≥2 per skill):** e.g. for gh-fix-ci, "帮我写个提交信息"
  → must route to git-commit, not gh-fix-ci; for gh-address-comments, "CI 挂了帮我
  看看" → gh-fix-ci, not gh-address-comments; for gh-bootstrap, "修复 PR 的 CI" →
  gh-fix-ci. Mark these as negative/near-neighbor with the expected sibling.
- Keep language consistent with each skill's existing eval language (the gh-*
  sets are Chinese; git-commit is English) — do not churn language.

## 6. D5 — Interface contract (R5, F5)

- **Rename** `agents/openai.yaml` → `agents/interface.yaml` in all four. The docs
  catalog labels the `agents/` folder generically, so the filename change only
  needs a `docs-sync` regen; confirm no script greps for `openai.yaml`
  specifically (grep during implementation — current grep shows only doc pages
  reference `agents/`).
- **Normalize fields:** `display_name`, one-line `short_description`,
  `default_prompt`. **git-commit:** shorten `short_description` from a paragraph to
  one line (move detail into `default_prompt`, which already carries it).
- **Icon policy:** gh-address-comments and gh-fix-ci have `icon_*` + `assets/`;
  gh-bootstrap and git-commit have none. Decision: keep icons only where assets
  already exist (do not fabricate icons); document the policy in the suite note
  (R7) so the asymmetry is intentional, not drift. (Ties into F8.)

## 7. D6 — Quality cleanup (R6)

- **F6:** delete the `mcs-web-test` branch in
  `gh-fix-ci/scripts/inspect_pr_checks.py:502` (stale; `mcs/` removed per
  CLAUDE.md). Keep the generic `just`/package-script discovery.
- **F7:** handled in §4 (RULES.md typo + fold/align).
- **F8:** make LICENSE/assets consistent. Default decision: leave existing
  `LICENSE.txt`/assets in the two skills that have them, and record in the suite
  note that bundled-template skills carry upstream LICENSE while home-grown skills
  inherit the repo license. (Avoid adding/removing licenses without need.)
- **F9 (optional):** if governance metadata is wanted, put it under nested
  `metadata:` (not new top-level keys) so `check.py` does not warn. Likely
  deferred unless requested.

## 8. R7 — Suite standard note

Add `skills/git-github-collaboration/AGENTS.md` (or `README.md`) capturing: path
mechanism, allowed-tools philosophy, eval format/location, interface naming, icon
& license policy. Short, enforceable, references git-commit as the exemplar.

## 9. Validation & tooling contract

- `scripts/check.py` — frontmatter only; ensure no `<`/`>` in descriptions; keep
  keys within the allowed set or under `metadata:`.
- `sync_docs_catalog.py` — enumerates resource dirs (`evals`, `specs`, `phases`,
  `agents`, …) and emits `catalog.mjs` + per-skill doc pages. Any structural change
  requires `just docs-sync`; `docs-check` (`--check`) fails on drift.
- `node-test` — no `tests/*.mjs` here; remains a no-op for this suite.
- Final gate: `just ci` (docs-check → skills-check → python-check → node-test →
  `git diff --check`).

## 10. Risks & mitigations

| Risk | Mitigation |
|---|---|
| `${CLAUDE_SKILL_DIR}` not actually substituted → still broken | Step 0 verification gate before touching all three skills; fallback to literal-path pattern |
| Deleting specs that SKILL.md/script still reference | grep for each spec/phase filename before deleting; fix references in the same step |
| docs-check fails after structural changes | run `just docs-sync`, commit regenerated catalog + doc pages |
| Renaming yaml breaks an unknown consumer | grep repo for `openai.yaml` before rename; only doc pages currently match |
| Over-trimming template-catalog removes needed URLs | keep the component→URL→path table intact; only remove the manual-execution narrative |

## 11. Rollback shape

Each work package is an independent commit (P0 path fix, P0 tools, P1 bootstrap
restructure, P1 evals, P1 interface, P2 cleanup, R7 note). Any package can be
reverted via `git revert <sha>` without leaving the suite inconsistent, because
each leaves `just ci` green. The bootstrap deletion is the only destructive step;
the deleted files remain recoverable from git history if the manual flow is ever
wanted as a documented fallback.
