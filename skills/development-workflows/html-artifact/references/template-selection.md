# Template Selection

Select the smallest HTML template that makes the user's output easier to review. Do not convert short answers into HTML just because this skill exists.

## Decision flow

1. If the requested output is short or transactional, use Markdown/plain text.
2. If the user asks for an HTML/browser-viewable artifact, use this skill and write one `.html` file.
3. Pick one primary template from the user's main review/decision goal.
4. Add only needed secondary sections instead of stacking whole templates.
5. Include evidence tables, test checklists, or decision records when readers need to verify claims.

## Primary templates

| Primary goal | Template | Strong signals | Avoid when |
| --- | --- | --- | --- |
| Plan, PRD, migration, roadmap | Strategy Blueprint | phases, milestones, risks, validation, rollback | user only needs a short task list |
| Code review, PR explanation | Review Workbench | findings, severities, diff snippets, changed files | no code/diff context is available |
| Architecture/data-flow | Architecture Atlas | components, interfaces, system boundary, failure path | task is mostly project status |
| Codebase architecture audit / call mechanism analysis | Architecture Atlas + Review Workbench + Strategy Blueprint | 调用机制, 架构优化, 枚举选择, 冗余, trainer/worker, model trainers, module boundary, dispatch, failure/retry path | user only wants a small code fix or short explanation |
| Option comparison | Decision Matrix Studio | alternatives, criteria, recommendation, rejected options | there is only one viable option |
| Research synthesis | Evidence Dossier | sources, confidence, evidence vs inference | source-free brainstorming |
| Project/release status | Status Brief | shipped/slipped/blocked, metrics, asks | deep RCA or research is needed |
| Incident/RCA | Incident Timeline | impact, timeline, detection, root cause, actions | ordinary bug note without incident scope |
| Local editor/tool | Interactive Editor | form, preview, validation, export | production app implementation is requested |
| Meeting readout | Narrative Deck | one message per section, presentation flow | dense reference document is needed |
| Design-system review | Component Specimen Sheet | tokens, states, accessibility, do/don't | no visual/component surface exists |

## Combining sections

- Plan + research: Strategy Blueprint with a short Evidence section and citation appendix.
- Review + architecture: Review Workbench with an Architecture Atlas component map.
- Codebase architecture audit: Architecture Atlas as the spine, Review Workbench for findings/redundancy, and Strategy Blueprint for implementation roadmap. Required sections: evidence summary, current call graph, selection/enum mechanism, redundancy matrix, architecture risks, recommendation, implementation route, verification checklist.
- Decision + plan: Decision Matrix Studio with a Strategy Blueprint implementation slice.
- Status + incident: Status Brief with a compact Incident Timeline; do not hide impact/root cause.
- Editor + report: Interactive Editor with a read-only summary panel and export actions.

## Output path guidance

Prefer stable project-local paths:

- `docs/artifacts/<slug>.html` for project documentation artifacts.
- `.artifacts/<slug>.html` for local-only scratch artifacts when the repo has no docs convention.
- A user-provided path wins if it is safe and inside the intended workspace.

## Minimum acceptance checklist

- Chosen template matches the user's primary goal.
- Sections are navigable and scan-friendly.
- Claims are separated into evidence, inference, recommendation, and risk.
- No remote resource or automatic network request is present.
- Validator passes before final handoff.
