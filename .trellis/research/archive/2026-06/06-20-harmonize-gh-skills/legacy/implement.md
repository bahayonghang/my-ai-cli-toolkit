# Implement — Harmonize git-github-collaboration skill suite

## STATUS: ✅ COMPLETE (2026-06-20)

All steps done; `just ci` green (docs-check, skills-check, python-check, 60 node
tests, `git diff --check`). Committed:
- `046575c` refactor(gh-skills): suite harmonization (P0–P2 source changes)
- `1ea3d6d` docs(gh-skills): regenerate skills catalog

**Step 1 decision (D1 path mechanism):** chose the **literal `<skill-dir>`
substitution** pattern (git-commit's proven approach), NOT `${CLAUDE_SKILL_DIR}`.
Rationale: changelog documents `${CLAUDE_SKILL_DIR}` as a SKILL.md-content
substitution, but no installed skill uses it and a real log showed a defensive
`${CLAUDE_SKILL_DIR:-fallback}` form — documented intent without clean runtime
confirmation. Literal substitution is mechanism-independent, cross-platform, and
matches the house standard. Switch to the token later if confirmed.

**Open follow-up (pre-existing, not introduced here):**
`skills/research-learning-knowledge/literature-mentor/SKILL.md` is untracked;
docs-sync generated its catalog page (committed in `1ea3d6d`). The repo owner
should either commit that skill or drop its page. It also has a "category
missing" frontmatter warning.


Execution is ordered P0 → P1 → P2, each step with a verify gate. Steps map to the
design (§ refs). Run from repo root. On Windows, prefix Trellis/py reads with
`PYTHONUTF8=1`. Each numbered group is one logical commit + one review gate.

## Pre-flight (once)
- [ ] **0.1** Confirm clean tree: `git status --short`.
- [ ] **0.2** Grep the suite for things we will delete/rename so no reference is
  orphaned: `$SKILL_DIR`, `phases/`, `execution-rules`, `template-catalog`,
  `openai.yaml`, `test-prompts`, `mcs-web-test`, `EXACT CLOPY` across
  `skills/git-github-collaboration/` and `docs/`.

## Step 1 — D1 path mechanism verification gate (P0, blocks 2) — §2
- [ ] **1.1** Determine how `${CLAUDE_SKILL_DIR}` is provided in this Claude Code
  version (load-time text substitution vs shell env). Use a scratch skill or the
  installed-version docs. Record the result in this file before proceeding.
- [ ] **1.2** Pick the branch: token (`${CLAUDE_SKILL_DIR}`) if substituted, else
  git-commit's literal-path pattern. **Verify:** decision recorded; no further work
  in Step 2 until chosen.

## Step 2 — D1 apply path fix (P0) — §2  →  commit "fix(gh-skills): resolve script path reliably"
- [ ] **2.1** `gh-address-comments/SKILL.md` L15, L17: replace `$SKILL_DIR` per 1.2.
- [ ] **2.2** `gh-fix-ci/SKILL.md` L18 + `references/BACKGROUND.md` L28-29: same.
- [ ] **2.3** `gh-bootstrap/SKILL.md` L16, L19, L20, L21: same.
- [ ] **2.4** If 1.2 chose the token and it lets git-commit drop its verbose §4.1
  paragraph, simplify git-commit minimally; otherwise leave git-commit untouched.
- [ ] **2.5 Verify (AC1):** run one gh-* script end to end against a real PR/repo
  (e.g. `python "<resolved>/scripts/inspect_pr_checks.py" --repo "."`) and confirm
  the script is found and runs. `just skills-check`.

## Step 3 — D2 allowed-tools (P0) — §3  →  commit "fix(gh-skills): correct allowed-tools declarations"
- [ ] **3.1** gh-address-comments frontmatter → `Read, Edit, Bash`.
- [ ] **3.2** gh-fix-ci frontmatter → `Read, Edit, Bash`.
- [ ] **3.3** gh-bootstrap frontmatter → drop `Task` → `AskUserQuestion, Read, Bash, Glob, Grep, Write`.
- [ ] **3.4** git-commit frontmatter → `Read, Bash`.
- [ ] **3.5 Verify (AC2):** `just skills-check` clean; re-read each frontmatter to
  confirm no `python` token and fixers have `Edit`.

## Step 4 — D3 gh-bootstrap single execution path (P1) — §4  →  commit "refactor(gh-bootstrap): make runtime script the sole execution path"
- [ ] **4.1** Re-grep (0.2 results) to list every SKILL.md/script reference to
  `phases/` and each `specs/*` file.
- [ ] **4.2** Delete `gh-bootstrap/phases/` (9 files) and
  `gh-bootstrap/specs/execution-rules.md`.
- [ ] **4.3** Slim `specs/template-catalog.md` to the component→URL→file-path map;
  remove the manual "直接复制" execution narrative + "更新记录" log; add the honest
  `{{...}}`-only placeholder note (§4).
- [ ] **4.4** For `specs/detection-rules.md`, `specs/manual-actions.md`,
  `specs/presets.md`: keep only if still referenced by SKILL.md/script; else delete.
- [ ] **4.5** Fix `references/RULES.md` (`EXACT CLOPY`→`EXACT COPY`); fold its real
  constraints into SKILL.md and delete RULES.md, OR align it to the runtime flow
  (pick the smaller diff).
- [ ] **4.6** Edit `gh-bootstrap/SKILL.md`: remove L20 "Keep phases/ and specs/…"
  and any links to deleted files; ensure detect → AskUserQuestion → fetch-template
  → render-template → validate-tree (runtime script) is the only documented flow;
  keep the NEVER-from-memory / MUST-use-templates rules.
- [ ] **4.7 Verify (AC3):** grep shows no live references to deleted files;
  `python "<resolved>/scripts/gh_bootstrap_runtime.py" detect .` still works;
  `just skills-check`.

## Step 5 — D4 eval unification (P1) — §5  →  commit "test(gh-skills): unify eval format and add routing negatives"
- [ ] **5.1** For each gh-*: create `evals/evals.json` (git-commit schema),
  porting the 3 existing prompts and converting `expected` → `assertions[]`.
- [ ] **5.2** Add ≥2 negative/near-neighbor cases per skill asserting correct
  routing vs the other three siblings (examples in design §5).
- [ ] **5.3** Delete the three root `test-prompts.json`.
- [ ] **5.4 Verify (AC4):** `python -c "import json,glob; [json.load(open(p,encoding='utf-8')) for p in glob.glob('skills/git-github-collaboration/*/evals/evals.json')]"` parses; `just skills-check`.

## Step 6 — D5 interface contract (P1) — §6  →  commit "refactor(gh-skills): unify agent interface contracts"
- [ ] **6.1** Confirm no consumer greps `openai.yaml` (use 0.2 result).
- [ ] **6.2** Rename `agents/openai.yaml` → `agents/interface.yaml` in all four.
- [ ] **6.3** git-commit `interface.yaml`: shorten `short_description` to one line
  (keep detail in `default_prompt`).
- [ ] **6.4** Normalize fields across all four; keep icons only where `assets/`
  already exist.
- [ ] **6.5 Verify (AC5):** all four have `agents/interface.yaml`, consistent
  fields; `just skills-check`.

## Step 7 — D6 quality cleanup (P2) — §7  →  commit "chore(gh-skills): remove stale recipe and align suite assets"
- [ ] **7.1** Remove the `mcs-web-test` branch in
  `gh-fix-ci/scripts/inspect_pr_checks.py` (~L502).
- [ ] **7.2** LICENSE/assets: confirm consistent policy; only change if a skill is
  inconsistent with the documented policy (avoid needless add/remove).
- [ ] **7.3** (Optional F9) governance metadata under nested `metadata:` if pursued.
- [ ] **7.4 Verify (AC6):** grep `mcs-web-test` → none; `just python-check`.

## Step 8 — R7 suite standard note (P1) — §8  →  commit "docs(gh-skills): add suite convention note"
- [ ] **8.1** Write `skills/git-github-collaboration/AGENTS.md` capturing path
  mechanism, allowed-tools philosophy, eval format/location, interface naming,
  icon/license policy; reference git-commit as exemplar.
- [ ] **8.2 Verify (AC7):** file exists and matches the implemented state.

## Step 9 — Docs catalog + full CI (gates AC8) — §9  →  commit "docs: regenerate skills catalog"
- [ ] **9.1** `just docs-sync` to regenerate `catalog.mjs` + per-skill doc pages.
- [ ] **9.2** Review regenerated `docs/skills/git-github-collaboration/*.md` and
  `docs/en/...` for the four skills; ensure no lingering mention of deleted
  phases/specs or `test-prompts.json`.
- [ ] **9.3 Verify (AC8):** `just ci` passes clean end to end.
- [ ] **9.4** `git diff --check` clean (also enforced by `just ci`).

## Review gates
- After **Step 3** (P0 complete): confirm runtime defects fixed before structural
  work.
- After **Step 6** (P1 complete): confirm suite consistency before cleanup/docs.
- After **Step 9**: final `trellis-check` + AC1–AC8 walkthrough before Finish phase
  (spec update + commit).

## Rollback points
- Each step is an independent commit; `git revert <sha>` restores the prior green
  state. Step 4 (deletions) is the only destructive step — deleted files remain in
  git history if the manual flow is ever wanted as documented fallback.
