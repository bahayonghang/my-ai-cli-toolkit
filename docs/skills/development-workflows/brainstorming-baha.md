# Brainstorming Baha

Chinese-first brainstorming workflow that turns a rough creative request into an approved design before implementation begins. It includes an optional browser-based visual companion for prototypes, diagrams, and layout comparisons.

## When to use it

- before creating a feature, component, project, or behavior change
- when the user needs requirements, constraints, and success criteria clarified first
- when several design directions should be compared before coding
- when a visual prototype, architecture diagram, or side-by-side layout would make the decision easier

## Workflow

1. inspect the current project context, files, docs, and recent commits
2. offer the visual companion as a separate message when visual decisions are expected
3. ask one clarification question at a time, preferably with concrete choices
4. present 2-3 design options with trade-offs and a recommendation
5. present the final design section by section and stop after approval

## Visual companion

The companion server serves the newest HTML screen from a session directory and records browser choices as events. Use it only when seeing the option is clearer than reading text.

Main scripts:

- `scripts/start-server.sh`
- `scripts/stop-server.sh`
- `scripts/server.cjs`
- `scripts/helper.js`
- `scripts/frame-template.html`

## Key constraints

- Do not write code or start implementation before the design is approved.
- Ask only one question per turn during clarification.
- Keep visual companion offers separate from clarification questions.
- Prefer small, isolated design units with clear responsibilities and interfaces.
- End the workflow at approved design unless the user explicitly asks to implement.
