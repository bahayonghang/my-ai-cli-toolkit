# Archify

Create professional technical diagrams as standalone HTML files with inline SVG, a dark/light theme toggle, and built-in export controls.

## When to Use

Use this skill when the user wants to:

- create a polished system architecture, cloud infrastructure, security boundary, or network topology diagram
- turn a technical process into a browser-openable workflow, approval flow, runbook, CI/CD, or incident-response diagram
- show an API call sequence, request lifecycle, service interaction path, cache fallback, or return path over time
- map a data pipeline, ETL/ELT flow, analytics lineage, PII boundary, consent path, or governance boundary
- describe a state machine, object lifecycle, status transition, retry, cancel, timeout, or terminal-state path
- receive a finished `.html` diagram artifact instead of Mermaid code or an editable canvas

## When Not to Use

- choose `mermaid-expert` when the diagram must live directly inside Markdown or a README as Mermaid syntax
- choose `excalidraw` when the user needs a hand-editable whiteboard/canvas file
- choose image-generation or poster/design skills when the deliverable is an illustrative image rather than a technical diagram artifact
- do not invent missing nodes, flows, states, or trust boundaries when one concise clarification still leaves the system ambiguous

## Default Behavior

- **Required deliverable**: one standalone `.html` file
- **Rendering style**: inline SVG inside the bundled Archify HTML template
- **Interactivity**: dark/light theme toggle plus export menu for Copy PNG and PNG / JPEG / WebP / SVG downloads
- **Theme model**: CSS variables and semantic SVG classes instead of hardcoded colors
- **Renderer setup**: renderer-backed modes require Node.js and `npm ci` in the skill directory before first use

## Diagram Modes

| Mode | Best for | Implementation |
| --- | --- | --- |
| `architecture` | bespoke system, cloud, topology, and security-boundary diagrams | manual SVG customization in `assets/template.html` |
| `workflow` | process lanes, approvals, runbooks, CI/CD, incidents, tool calls | JSON IR rendered by `renderers/workflow/render-workflow.mjs` |
| `sequence` | participant interactions and API/request lifecycles over time | JSON IR rendered by `renderers/sequence/render-sequence.mjs` |
| `dataflow` | pipelines, lineage, PII, governance, warehouses, downstream consumers | JSON IR rendered by `renderers/dataflow/render-dataflow.mjs` |
| `lifecycle` | state machines, status transitions, retries, waits, terminal outcomes | JSON IR rendered by `renderers/lifecycle/render-lifecycle.mjs` |

## Workflow

1. Pick the diagram mode from the user's wording and desired artifact.
2. For renderer-backed modes, read `references/renderer-modes.md` and start from the closest `examples/*.json` file when useful.
3. For architecture mode, copy `assets/template.html` and read `references/design-system.md` plus `references/template-export.md`.
4. Keep labels short, semantic, and readable in narrow previews.
5. Render or inspect the final HTML where possible.
6. Return the output path, chosen mode, assumptions, and validation/render command used.

## Setup and Verification

Renderer-backed modes use JSON Schema validation through the bundled npm dependency `ajv`.

From the skill directory, run once in a fresh checkout:

```bash
npm ci
```

Then render an example, for instance:

```bash
node renderers/workflow/render-workflow.mjs examples/agent-tool-call.workflow.json workflow.html
```

If dependency installation is blocked, use architecture/manual template mode or report the blocker instead of claiming renderer validation succeeded.

## Main Supporting Files

- `content/skills/visual-media-design/archify/SKILL.md`
- `content/skills/visual-media-design/archify/assets/template.html`
- `content/skills/visual-media-design/archify/references/renderer-modes.md`
- `content/skills/visual-media-design/archify/references/design-system.md`
- `content/skills/visual-media-design/archify/references/template-export.md`
- `content/skills/visual-media-design/archify/renderers/*/render-*.mjs`
- `content/skills/visual-media-design/archify/schemas/*.schema.json`
- `content/skills/visual-media-design/archify/examples/*.json`

## Key Constraints

- install renderer dependencies before using JSON IR renderers
- do not bypass schema or layout failures by editing renderers for a single diagram
- use CSS classes such as `c-backend`, `t-muted`, and `a-emphasis`; avoid inline SVG colors
- keep arrows behind component boxes and use `c-mask` under semi-transparent fills
- place legends and summary content outside diagram boundaries
- expand the SVG `viewBox` when the layout grows instead of clipping or crowding the diagram

## Notes

Archify overlaps with the older `architecture-diagram` skill, but it is broader and more structured: it supports renderer-driven workflow, sequence, dataflow, and lifecycle diagrams in addition to manual architecture diagrams.
