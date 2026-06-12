# Implementation Plan: Refactor Spark Codex and Claude Plan Modes

## Status

Draft for user review. Do not implement until the user approves this revised plan.

## Checklist

- [ ] Update `spark` metadata and runtime instructions.
- [ ] Add explicit Codex Plan mode vs Claude Code Plan mode vs writable/default mode split.
- [ ] Fold `grill-me` / `grill-with-docs` interrogation behavior into Spark's discovery phase.
- [ ] Update README to match the dual-surface behavior.
- [ ] Update static tests for native Plan mode chat-only behavior.
- [ ] Run targeted Spark tests.
- [ ] Run skill and docs validation.
- [ ] Run full repo validation before finishing.

## Step-by-step Plan

1. Update `skills/development-workflows/spark/SKILL.md` frontmatter.
   - Bump version from `0.5.0` to `0.6.0`.
   - Rewrite description so it does not unconditionally say Spark writes `.plannings`.
   - New description should state:
     - Codex native Plan mode returns a chat-only final plan;
     - Claude Code Plan mode uses its native plan approval/exit flow and can materialize the approved plan after exit;
     - writable/default mode saves `.plannings` Markdown;
     - HTML/visual artifacts are explicit and writable-mode-only.

2. Rewrite the opening behavior contract.
   - Keep Spark as a planning skill, not an execution skill.
   - Keep the hard gate against production code and implementation workflows.
   - Add: "In Codex native Plan mode, do not write files. Produce the final plan in chat."
   - Add: "In Claude Code Plan mode, use Claude's approval/exit flow and write files only after approval exits Plan mode."
   - Add: "Writable/default mode saves `.plannings` artifacts."

3. Replace `Planning Surface Selection`.
   - Add a small decision table:
     - Codex native Plan mode: chat-only, no file writes, structured questions when available.
     - Claude Code Plan mode: use `EnterPlanMode` / `ExitPlanMode` when available; no writes until approval exits Plan mode.
     - Writable/default mode: Markdown file in `.plannings`, optional HTML/visual on explicit request.
     - No structured tool: one plain-text question.
   - Remove any wording that implies Codex native Plan mode can save Spark's Markdown plan.

4. Refactor the checklist and process flow.
   - Move "choose planning surface" before "derive plan path".
   - Make "derive plan path" conditional on writable/default mode.
   - Make optional HTML/visual branch conditional on writable/default mode.
   - Add a Codex native Plan mode terminal state: "final chat plan; wait for user to leave Plan mode and request implementation/materialization."
   - Add a Claude Code Plan mode state: "ExitPlanMode approval; after approval, materialize plan artifact if requested; stop."

5. Add the grilling discovery section.
   - Add "Decision-tree interrogation" or similar section.
   - Include:
     - inspect evidence before asking;
     - ask one blocking question at a time;
     - include recommended answer and trade-off;
     - challenge glossary conflicts and overloaded terms;
     - use concrete scenarios;
     - cross-check code/docs contradictions;
     - record proposed glossary/ADR changes for follow-up, not inline file edits.

6. Update output path and HTML/visual sections.
   - Rename `Output Path and Slug Rules` to make it writable-mode-only.
   - State `.plannings` is skipped in Codex native Plan mode.
   - State Claude Code Plan mode writes `.plannings` only after approval exits Plan mode.
   - State HTML/visual companion is unavailable while any Plan mode is active because it writes files.
   - Keep existing slug and offline HTML rules for writable mode.

7. Update `skills/development-workflows/spark/README.md`.
   - Describe new current behavior:
     - native Plan mode: chat-only final plan;
     - Claude Code Plan mode: approval/exit flow, then optional artifact materialization;
     - writable/default mode: `.plannings` Markdown default;
     - explicit HTML/visual branch only in writable mode.
   - Add `v0.6.0` notable change.

8. Update `skills/development-workflows/spark/tests/spec-html-contract.test.mjs`.
   - Change version expectation to `0.6.0`.
   - Replace "defaults Spark output to Markdown plans in .plannings" with dual-surface assertions.
   - Add assertions:
     - Codex native Plan mode appears with chat-only/read-only behavior;
     - Claude Code Plan mode appears with approval/exit behavior;
     - no `.plannings` write while Plan mode is active;
     - writable/default mode preserves `.plannings` Markdown;
     - HTML/visual branch is writable-mode-only;
     - `EnterPlanMode` / `ExitPlanMode` appear only in Claude Code-specific instructions, not Codex instructions;
     - README describes the same split.

9. Update docs/catalog if required.
   - Run `just docs-sync` after metadata changes.
   - Inspect generated docs for Spark description drift.

10. Validate.
    - `just node-test`
    - `just skills-check`
    - `just docs-check`
    - `just ci`

## Manual Test Prompts

Use these after implementation for a sanity pass:

1. Native Plan mode prompt:
   - `/plan`
   - `$spark I want to redesign our billing sync flow; grill me and produce a plan.`
   - Expected: structured or plain one-question grilling, final chat plan, no file writes.

2. Claude Code Plan mode prompt:
   - Press `Shift+Tab` or use `/plan`
   - `$spark I want to redesign our billing sync flow; grill me and produce a plan.`
   - Expected: one-question grilling, `ExitPlanMode` / approval flow when available, then approved plan may be saved to `.plannings` after Plan mode exits.

3. Writable mode prompt:
   - `$spark Plan a migration from local config files to a central settings store.`
   - Expected: `.plannings/YYYY-MM-DD-<slug>.md` written, no implementation code.

4. Explicit visual prompt outside Plan mode:
   - `$spark Create a browser-viewable plan comparing three onboarding layouts.`
   - Expected: Markdown plan plus optional HTML/visual artifact in writable paths.

5. Glossary conflict prompt:
   - `$spark Stress-test this Order cancellation plan against CONTEXT.md and ADRs.`
   - Expected: terminology challenges and proposed glossary/ADR follow-ups, not inline docs edits unless in writable implementation mode.

## Rollback Plan

- If the dual-surface rewrite makes Spark too large, keep the mode split in `SKILL.md` and move detailed grilling tactics to a short `references/interrogation.md`.
- If tests become brittle, prefer semantic assertions over exact paragraphs.
- If generated docs churn is unexpectedly broad, inspect `docs/scripts/sync_docs_catalog.py` output before accepting docs changes.

## Approval Gate

Implementation should start only after the user approves this revised Spark-focused plan.
