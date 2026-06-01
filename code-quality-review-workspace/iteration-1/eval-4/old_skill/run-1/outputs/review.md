## Verdict

COMMENT ONLY — No explicit target was attached, but the workspace is a git repository with a usable working-tree diff, so per the skill's scope ladder I reviewed the uncommitted changes; they are internally consistent with one tracking risk and one contract gap worth confirming before commit.

> Note on scope: You said no patch or file path was attached. The skill's workflow says that when no target is given and the repo has uncommitted changes, the most-local working-tree diff is almost certainly what you mean, so I reviewed that rather than stopping to ask. The diff touches only the `code-quality-review` skill definition itself:
>
> - `skills/development-workflows/code-quality-review/SKILL.md` (+54 / -20)
> - `skills/development-workflows/code-quality-review/evals/evals.json` (+55 / -13)
> - plus two **untracked** new files the diff depends on (see CQ-001).
>
> This is a skill-definition change (Markdown + JSON), not runtime code, so the maintainability lens here is applied to the artifact/contract surface: consistency, completeness, and whether the new "artifact mode" creates a safe, well-owned boundary. If you intended a different target (a real code PR, another path), tell me and I'll re-scope.

## Findings

### CQ-001 [High] Artifact-mode and eval changes depend on two untracked files that are not part of this diff

- Location: `skills/development-workflows/code-quality-review/SKILL.md` (new "Output Modes" section, `assets/templates/quality-review.md` reference) and `evals/evals.json` (every `"files": ["evals/files/order_service.ts"]` entry).
- Evidence: `git status --porcelain` reports the two edited files as ` M`, but the files they now reference are untracked:
  - `?? skills/development-workflows/code-quality-review/assets/templates/quality-review.md`
  - `?? skills/development-workflows/code-quality-review/evals/files/order_service.ts`
    The SKILL.md instructs writing the report "using `assets/templates/quality-review.md`", and evals 2/3/5/6 all point at `evals/files/order_service.ts`. Both files exist on disk (so the change works locally) but are not staged/committed with the change.
- Why it matters: If SKILL.md + evals.json are committed without the two new files, the skill ships a dangling contract: artifact mode references a template that isn't in the repo, and the eval suite references a fixture that isn't there, so evals 2/3/5/6 break for anyone who checks out the commit. This is the classic "related updates left half-applied" / atomicity smell from the skill's own checklist, applied to its own change set.
- Recommended remediation: Stage and commit all four files together (`SKILL.md`, `evals.json`, `assets/templates/quality-review.md`, `evals/files/order_service.ts`) as one atomic change. Confirm `just skills-check` / `just node-test` still pass with the fixture present.
- Confidence: High

### CQ-002 [Medium] New `Write` capability widens the skill's blast radius; the read-only guarantee now rests entirely on prose

- Location: `SKILL.md` frontmatter `allowed-tools: Read, Glob, Grep, Bash, Write` and the new "Artifact (opt-in)" bullet under "Output Modes".
- Evidence: `allowed-tools` gains `Write`, and Safety/Scope is reworded from a blanket "Do not edit files" to "Treat the code under review as read-only … The one exception is the opt-in artifact mode … which only ever writes a review report under `code_review/`." The "writes only under `code_review/`" boundary is asserted in prose; nothing mechanically constrains the granted `Write` tool to that path.
- Why it matters: A review skill's core promise is that it never mutates product code. Granting `Write` trades that hard, tool-level guarantee for a soft, prose-level one. A future edit, an ambiguous user instruction, or prompt-injected text in reviewed code (which the skill itself flags as untrusted) could lead to a write outside `code_review/`. The boundary is real but unenforced.
- Recommended remediation: Keep the feature but tighten the contract: make artifact mode an explicit, confirmed opt-in (don't write unless the user clearly asked to save/archive), and state plainly that the only permitted write target is `code_review/<feature>/quality-review.md`. If the repo's harness supports path-scoped write permissions or a hook, prefer that over prose. At minimum, add a one-line invariant near the frontmatter: "Write is used solely to emit the review artifact under `code_review/`; never to modify reviewed or product code."
- Confidence: Medium

### CQ-003 [Low] Artifact mode can write outside an ignored path without guaranteeing the recommended `.gitignore` follow-up

- Location: `SKILL.md` "Artifact (opt-in)" bullet: "If `code_review/` is not git-ignored, recommend adding it, but do not edit `.gitignore` unless the user asks."
- Evidence: The skill writes `code_review/<feature>/quality-review.md` first and only "recommends" gitignoring afterward; it never edits `.gitignore` itself. So the default outcome is a new untracked review file sitting in the working tree.
- Why it matters: Minor, but review artifacts accidentally committed into product repos are noise and can leak internal review notes. The recommendation is correct; the ordering just means the safeguard depends on the user acting on advice.
- Recommended remediation: Acceptable as written for an opt-in feature. Optionally, have artifact mode surface the gitignore recommendation in the same turn it writes the file (not buried), so the user sees it immediately.
- Confidence: Low

## Checked but not flagged

- **evals.json validity and structure.** Parses as valid UTF-8 JSON (the initial parse error was only a Windows GBK console decode artifact, not a data defect). The added `expectations` arrays are coherent and align with the planted issues in `order_service.ts` (the `any` boundary + `?? {}` fallback, mode-based branching with duplicated coupon logic, the thin `findOrder` wrapper, the duplicated `formatMoney`, and the non-atomic charge/update). New eval id 6 correctly exercises the artifact mode.
- **Self-consistency of the example finding.** The `CQ-001` example added to SKILL.md ("`getUser` discards its type contract") matches the kind of issue actually planted in the fixture, so the calibration example is honest rather than aspirational.
- **Template (`quality-review.md`) shape.** Mirrors the "Required Output Format" section (Verdict, CQ-IDs, Location/Evidence/Why/Remediation/Confidence, Checked-but-not-flagged, Scope limitations) and adds a small metadata header. No structural concern.
- **Scope-ladder rewrite (Workflow step 1) and the "focused lens vs. full audit" note.** These are clarity improvements; the ladder is deterministic (explicit target → uncommitted diff → `main...HEAD` → `master...HEAD` → ask) and the boundary-vs-code-auditor note reduces scope creep. No issue.
- **Checklist table reformatting.** The only change is whitespace alignment of an existing Markdown table; content is byte-identical. Cosmetic, not flagged.

## Scope limitations

- No explicit target was provided; I inferred scope from the working-tree diff per the skill's ladder. If you meant a different patch/PR/path, the conclusions above do not apply and I'll re-review on the correct target.
- This change modifies the review skill's own definition (Markdown/JSON), so there is no runtime/test execution to verify behavior; I did not run `just ci` / `just node-test` (read-only review, and they were not requested). CQ-001's breakage claim is based on git tracking state, not on an executed failing eval — running the eval suite after staging the fixture would confirm it.
- I reviewed reviewed/diff text as untrusted input and did not act on any instructions embedded in the SKILL.md prose, the example finding, or the `order_service.ts` fixture.
