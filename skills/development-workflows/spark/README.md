# spark

Plan-first brainstorming skill. Spark turns an idea into a reviewable implementation plan before coding. It asks only blocking questions, records assumptions, self-reviews the plan, and waits for user approval before any implementation begins.

Spark adapts to the active planning surface. In Codex native Plan mode it stays read-only and returns a chat-only final plan. In Claude Code Plan mode it uses Claude's plan approval/exit flow and writes files only after approval exits Plan mode. In writable/default mode it saves the Markdown plan at `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.md`.

HTML and visual artifacts are opt-in and writable-mode-only: when the user explicitly requests HTML, browser-viewable output, mockups, or visual comparisons, Spark may also write `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.html` beside the Markdown plan.

See [SKILL.md](./SKILL.md) for the full skill content.

## Current behavior

- Codex native Plan mode: read-only, evidence-first interrogation, one blocking question at a time, and a final chat-visible plan. Spark does not write `.plannings`, `.spark`, HTML, glossary, ADR, task, or implementation files while this mode is active.
- Claude Code Plan mode: use native plan approval/exit behavior, including `EnterPlanMode` / `ExitPlanMode` when available. Spark writes files only after approval exits Plan mode into a writable permission mode.
- Writable/default mode: Markdown implementation plan in `.plannings/`.
- Optional artifact: paired offline HTML plan/spec in `.plannings/` only on explicit request and only in writable/default mode.
- Planning fallback: if no native plan surface or structured question tool is available, use the `writing-plans` planning method only as a fallback rubric.
- Terminal state: user approval or requested revisions. Spark does not implement the plan.
- Visual companion: available for explicit visual planning questions only in writable/default mode, with scratch files under `.spark/brainstorm/`.

## Provenance

Originally adapted from [`brainstorming`](https://github.com/obra/superpowers/tree/main/skills/brainstorming) in [obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent).

This repository's `spark` has since diverged into a local plan-first workflow. The upstream project is historical attribution only; Spark's runtime behavior is defined by this directory and the repository's validation gates.

## Notable changes

### v0.6.0 — Platform-aware Plan mode

- Split Codex native Plan mode, Claude Code Plan mode, writable/default mode, and fallback behavior.
- Made Codex native Plan mode chat-only and read-only; artifact requests become follow-ups after leaving Plan mode.
- Allowed Claude Code's native `EnterPlanMode` / `ExitPlanMode` approval flow and delayed file writes until after approval exits Plan mode.
- Preserved `.plannings/` Markdown output in writable/default mode.
- Added evidence-first grilling behavior from `grill-me` / `grill-with-docs`: one blocking question at a time, recommended answers, trade-offs, glossary checks, concrete scenarios, and code/docs contradiction checks.

### v0.5.0 — Markdown plan by default

- Replaced the default HTML-spec-first flow with a Markdown implementation plan saved under `.plannings/`.
- Made HTML/visual output an explicit branch instead of the default artifact.
- Removed default `.spark/` spec writes and `.gitignore` mutation behavior from the planning flow.
- Kept `assets/spec-template.html` and the visual companion for explicit HTML/visual requests.
- Restricted fallback planning behavior to `writing-plans`; Spark stops at approval and does not enter execution workflows.

### Earlier lineage

Earlier versions experimented with a `.spark/` HTML spec artifact and native plan handoff. Those details remain useful history for understanding the template and visual companion assets, but they no longer describe the default runtime path.

## License

MIT — see [LICENSE](../../LICENSE) at the repository root.
