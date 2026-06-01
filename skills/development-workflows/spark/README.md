# spark

Plan-first brainstorming skill. Spark turns an idea into a reviewable Markdown implementation plan by default, saved at `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.md`. It asks only blocking questions, records assumptions, self-reviews the plan, and waits for user approval before any implementation begins.

HTML and visual artifacts are opt-in: when the user explicitly requests HTML, browser-viewable output, mockups, or visual comparisons, Spark may also write `<project-root>/.plannings/YYYY-MM-DD-<feature-slug>.html` beside the Markdown plan.

See [SKILL.md](./SKILL.md) for the full skill content.

## Current behavior

- Default artifact: Markdown implementation plan in `.plannings/`.
- Optional artifact: paired offline HTML plan/spec in `.plannings/` only on explicit request.
- Planning surface: prefer the current native plan surface when available; otherwise use the `writing-plans` planning method only as a fallback rubric while keeping Spark's `.plannings/` output path.
- Terminal state: user approval or requested revisions. Spark does not implement the plan.
- Visual companion: available for explicit visual planning questions, with scratch files under `.spark/brainstorm/`.

## Provenance

Originally adapted from [`brainstorming`](https://github.com/obra/superpowers/tree/main/skills/brainstorming) in [obra/superpowers](https://github.com/obra/superpowers) (MIT, Jesse Vincent).

This repository's `spark` has since diverged into a local plan-first workflow. The upstream project is historical attribution only; Spark's runtime behavior is defined by this directory and the repository's validation gates.

## Notable changes

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
