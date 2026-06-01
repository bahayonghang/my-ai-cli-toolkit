## Verdict

COMMENT ONLY

The current changes upgrade the `code-quality-review` skill (SKILL.md + evals) cleanly and are internally consistent with the supporting assets, but a few instruction-design and contract details are slightly under-specified and worth tightening before they harden into convention.

## Review scope

Reviewed the current working-tree changes (no explicit target given; working tree is dirty, so per the skill's own scope ladder the uncommitted diff is the target):

- `skills/development-workflows/code-quality-review/SKILL.md` (M, +54/−20)
- `skills/development-workflows/code-quality-review/evals/evals.json` (M, +55/−13)

The diff additions reference two files that are present but currently **untracked** (not shown by `git diff`): `assets/templates/quality-review.md` and `evals/files/order_service.ts`. I read both because the modified files depend on them; they are part of the same logical change and are evaluated as such below.

This is a skill-definition change (Markdown prompt + JSON eval spec + a TS test fixture), so "maintainability" here means: is the instruction set coherent, unambiguous, and free of internal contradictions, and do the contracts the skill now promises actually line up across SKILL.md, the template, and the evals.

## Findings

### CQ-001 [Medium] Artifact output path contract is ambiguous between the lead-in and the Output Modes section

- Location: `skills/development-workflows/code-quality-review/SKILL.md:47` and `:153`
- Evidence: The Safety section says the artifact mode "only ever writes a review report under `code_review/`". Output Modes specifies `code_review/<feature>/quality-review.md` and says to "Infer `<feature>` from the branch name, PR title, or changed package, and keep the filename stable". But there is no rule for what to do when none of those are inferable (detached HEAD, no PR, multi-package diff), nor what `<feature>` slugification looks like. eval #6 asserts the file lands at `code_review/<feature>/quality-review.md` but its `expectations` only require "under `code_review/`", so the grader and the spec disagree on strictness.
- Why it matters: An under-specified path contract is exactly the kind of thing that drifts between runs — two reviews of the same branch can land in different folders, defeating the stated goal of keeping "the folder easy to scan." For a skill, ambiguity in the prompt is the maintainability defect.
- Recommended remediation: Add one fallback sentence (e.g. "if no feature can be inferred, use `code_review/review-<short-sha-or-date>/quality-review.md`") and state the slug rule (lowercase, dash-separated). Optionally align eval #6's `expectation` wording with the `<feature>/quality-review.md` shape so the test enforces what the spec promises.
- Confidence: High

### CQ-002 [Medium] `allowed-tools` now grants `Write` unconditionally, but the skill is "read-only by default"

- Location: `skills/development-workflows/code-quality-review/SKILL.md:13` (`allowed-tools: Read, Glob, Grep, Bash, Write`) vs `:47`, `:152`
- Evidence: `Write` is added to support the opt-in artifact mode. The prose strongly constrains writes ("The artifact is the only file you create; product code is still never modified"), but the tool grant itself is unconditional — nothing mechanically scopes `Write` to `code_review/`. The guarantee lives entirely in prose the model must follow.
- Why it matters: The whole value proposition of this skill is "default to read-only review." A capability grant that is broader than the documented contract is a latent boundary risk: a future prompt edit, or a misread, lets the skill write product code while still claiming read-only safety. This is the boundary-cleanliness concern the skill itself flags in others.
- Recommended remediation: This is acceptable given the platform has no path-scoped tool grants, but make the constraint impossible to miss: keep the "only file you create is under `code_review/`" rule adjacent to the frontmatter intent, and consider a one-line note in the Safety section that `Write` exists solely for artifact mode. Confirm there is no narrower grant mechanism available before accepting the broad one.
- Confidence: Medium

### CQ-003 [Low] Eval suite reuses a single fixture across four cases, coupling unrelated tests to one file

- Location: `skills/development-workflows/code-quality-review/evals/evals.json` (cases 2, 3, 5, 6 all point at `evals/files/order_service.ts`)
- Evidence: Cases 2, 3, 5, and 6 each list `["evals/files/order_service.ts"]` and their `expectations` enumerate specific defects in that fixture (the `any` boundary + `?? {}` fallback, the non-atomic charge/update, the duplicated `formatMoney`, the thin `findOrder` wrapper, mode-branching coupon duplication). All of those defects do exist in the fixture, so the tests are sound. The coupling is the concern: any future edit to `order_service.ts` silently changes the expected behavior of four independent evals at once.
- Why it matters: Shared mutable test fixtures make eval maintenance fragile — a tweak intended for one scenario can break three others, and it is non-obvious which case "owns" the fixture. Low severity because the current content is correct and the duplication is intentional (testing different prompts against the same code).
- Recommended remediation: Acceptable as-is for now. If the suite grows, consider either freezing this fixture as a stable shared input with a comment saying "do not edit; four evals depend on exact defects here," or splitting per-scenario fixtures. No change required for this diff.
- Confidence: Medium

### CQ-004 [Low] Two referenced assets are untracked, so the committed diff alone is not self-consistent

- Location: repository state — `assets/templates/quality-review.md` and `evals/files/order_service.ts` are present but untracked
- Evidence: `git status --porcelain` shows only the two `M` files; the new template and fixture do not appear. SKILL.md:153 references `assets/templates/quality-review.md` and four eval cases reference `evals/files/order_service.ts`. If only the tracked changes were committed, the skill would point at a template that does not exist in history and the evals would reference a missing fixture.
- Why it matters: A change that references files it does not also stage produces a broken state on checkout — anyone pulling the commit gets a skill whose artifact mode and evals point at absent files. This is an atomicity issue (related updates left half-applied), which the skill's own checklist flags.
- Recommended remediation: Stage the template and fixture together with the SKILL.md/evals.json changes so the commit is self-contained. (No code change needed — a `git add` of the two new files before committing.)
- Confidence: High

### CQ-005 [Low] Review-checklist table re-padded to aligned columns adds maintenance cost for no behavioral gain

- Location: `skills/development-workflows/code-quality-review/SKILL.md:75-83`
- Evidence: The diff rewrites the checklist table from compact `|`-delimited rows to space-padded aligned columns. Content is unchanged; only whitespace differs.
- Why it matters: Hand-aligned Markdown tables are tedious to keep aligned on every future edit (each cell edit forces re-padding the whole column) and inflate the diff, making the substantive changes harder to spot. Minor, and purely a style preference — flagged only because it is the one change in this diff that carries cost without changing behavior.
- Recommended remediation: Optional. If a Markdown formatter (e.g. Prettier) is in the toolchain, let it own table formatting rather than hand-aligning; otherwise prefer the compact form to keep future diffs small. No action required.
- Confidence: Low

## Checked but not flagged

- **Scope ladder rewrite (SKILL.md:55-59).** The new ordered fallback (uncommitted diff → `main...HEAD` → `master...HEAD` → ask) is clear, correctly prioritizes the most-local work, and matches eval #1's updated expectations. Good change.
- **"When to Skip" boundary note (SKILL.md:43).** The added paragraph cleanly delineates this skill from a full-spectrum auditor; no contradiction with the description frontmatter.
- **Stable CQ-IDs (SKILL.md:96, :107) and the worked Example Finding (:126-148).** The ID scheme and the calibrating example are consistent with the template and with the evals' "stable IDs" expectations; the example finding is well-chosen and matches the fixture's real defects.
- **Template ↔ output-format alignment.** `assets/templates/quality-review.md` mirrors the Required Output Format section (Verdict / Findings with CQ-IDs / Checked but not flagged / Scope limitations) and adds useful metadata header fields; no schema drift.
- **Fixture defect accuracy.** Every defect the evals claim `order_service.ts` contains is actually present (any-typed boundary + `?? {}`, non-atomic charge-before-validate-before-update, duplicated `formatMoney`, pass-through `findOrder`, mode-branch coupon duplication). The evals will not assert phantom findings.
- **JSON validity / structure of evals.json.** The added `expectations` arrays are well-formed and consistent across the six cases.

## Scope limitations

- No CI was run; this is a static read-only review. I did not execute `just skills-check`, `just node-test`, or any eval to confirm the metadata check and the JSON pass — the skill instructs running verification only when asked or clearly scoped, and the user asked for a quality review only.
- The two referenced assets are untracked; I reviewed their current on-disk content, but I cannot confirm what will actually be committed alongside the tracked diff. CQ-004 assumes the intent is to commit all four together.
- The git status reported here (two modified files under `code-quality-review`) differs from the session-start snapshot in the harness header (which listed `spark/` files). I reviewed the live working-tree state, which is the correct target per the skill's scope rules.
