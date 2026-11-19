# Implementation Plan: Optimize ast-grep skill

## Phase 1: Stabilize package metadata

1. Inspect the current ast-grep package and nearby developer-tool skill metadata.
   - Verify: `python scripts/check.py skills\developer-tools-integrations\ast-grep`
2. Update `SKILL.md` frontmatter with category, version, tags, argument hint, and allowed tools.
   - Verify: skill validator reports no ast-grep metadata warning.
3. Ensure intended ast-grep files are visible in Git status and will be tracked.
   - Verify: `git status --short --untracked-files=all skills\developer-tools-integrations\ast-grep`

## Phase 2: Rewrite operational guidance

1. Rewrite the main skill body into a concise rule-authoring workflow.
   - Keep the body focused; push detailed syntax into `references/rule_reference.md`.
2. Add command patterns for:
   - simple pattern search;
   - rule-file scan;
   - inline rule smoke test;
   - AST debugging with `--debug-query`.
3. Include PowerShell-safe guidance where shell quoting matters.
4. Add language-shape cautions for JS/TS function declarations, function expressions, arrow functions, methods, and Python-specific constructs.
   - Verify: manually run representative documented commands against stdin or a temp fixture.

## Phase 3: Correct reference material

1. Review `references/rule_reference.md` against current CLI behavior.
2. Replace stale `dump_syntax_tree` troubleshooting with `run --debug-query`.
3. Clarify positive matcher requirements for `regex`, `nthChild`, and `range`.
4. Ensure all YAML snippets that represent full rules include `id`, `language`, and `rule` when used with `scan`.
   - Verify: at least one `pattern`, one relational, and one composite example parses with local `ast-grep`.

## Phase 4: Add eval coverage

1. Create `skills/developer-tools-integrations/ast-grep/evals/evals.json`.
2. Add at least three realistic prompts:
   - JS/TS async without try/catch;
   - React structural search;
   - Python structural search.
3. Include expected outputs that mention valid rule shape, validation command, and false-negative boundaries.
   - Verify: JSON parses and aligns with existing skill-creator schema expectations.

## Phase 5: Run full skill-creator eval/reviewer loop

1. Locate the `skill-creator` helper scripts and schemas.
2. Snapshot the original ast-grep skill before final rewrite comparison if not already captured:
   - `skills/developer-tools-integrations/ast-grep-workspace/skill-snapshot/`
3. Create iteration workspace directories only as needed.
4. For each eval, run the optimized skill and old-skill baseline against the same prompt.
5. While runs are in progress, draft objective assertions and update eval metadata.
6. Capture `timing.json` for each run when timing/token notifications are available.
7. Grade each run and save `grading.json` using the viewer-compatible fields `text`, `passed`, and `evidence`.
8. Aggregate results with the `skill-creator` benchmark script to produce `benchmark.json` and `benchmark.md`.
9. Run an analyst pass over benchmark and qualitative outputs.
10. Generate the review artifact with `eval-viewer/generate_review.py`; use static HTML if appropriate.
11. If review or benchmark feedback identifies actionable defects, revise the skill and rerun the needed iteration.
    - Verify: review artifact exists and benchmark files summarize optimized-skill versus old-skill performance.

## Phase 6: Regenerate docs

1. Run `just docs-sync`.
2. Inspect generated docs for ast-grep entries and detail pages.
3. Run `python docs\scripts\sync_docs_catalog.py --check`.
   - Verify: no missing/outdated docs for ast-grep.

## Phase 7: Final validation

1. Run `just skills-check`.
2. Run `just docs-check`.
3. Run `just ci` if targeted gates pass.
4. Inspect `git diff --check` and the final diff for accidental unrelated changes.

## Risky Files and Rollback Points

- `SKILL.md`: rollback if the rewrite becomes too broad or loses key CLI guidance.
- `references/rule_reference.md`: rollback if reference edits drift away from verified local behavior.
- `ast-grep-workspace/`: treat as local eval output unless the implementation deliberately chooses to commit selected artifacts.
- generated docs: rollback if docs sync changes unrelated catalog surfaces unexpectedly.

## Ready-to-Start Checklist

- [x] User confirmed the full `skill-creator` eval/reviewer loop is required.
- [ ] PRD, design, and implementation plan are reviewed.
- [ ] Task is moved from planning to in_progress with `task.py start`.
