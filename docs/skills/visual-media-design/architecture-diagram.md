# Architecture Diagram

Create dark-themed standalone HTML architecture diagrams with inline SVG.

## When to Use

Use this skill when the user wants to:
- turn a system description into a browser-openable architecture artifact
- generate a system architecture, cloud infrastructure, security boundary, or network topology diagram as HTML
- keep the result in a single `.html` file instead of Mermaid code or an editable canvas

If the user explicitly wants Mermaid, Excalidraw, or a generic SVG/PNG technical diagram, this skill should not be the first choice.

## When Not to Use

- choose `mermaid-expert` when the output needs to live inside Markdown or a README
- choose `excalidraw` when the user needs a hand-editable canvas artifact
- choose `fireworks-tech-graph` when the required deliverable is polished `.svg` first, with optional `.png`
- do not force this skill onto vague requests that still lack nodes, flows, or trust boundaries after one short clarification

## Default Behavior

- **Required deliverable**: `.html`
- **Rendering mode**: inline SVG inside a standalone HTML page
- **Visual style**: dark theme with semantic colors for frontend, backend, database, cloud, security, and external systems
- **Default filename rule**: use the user-provided filename when present; otherwise save `descriptive-name-architecture.html` in the working directory

## Workflow

1. Read `assets/template.html`.
2. Read `references/style.md`.
3. Use the nearest example only when it materially matches the request.
4. Extract layers, nodes, edges, labels, trust boundaries, and legend needs.
5. Choose a layout before editing.
6. Customize the template instead of rebuilding the shell.
7. Write the final `.html` file and return the actual path.

## Template Structure

The shipped template is more than a blank SVG shell. It already includes:

- a header row with title and subtitle
- one main diagram card containing the SVG canvas
- three summary cards under the diagram for deployment, security, or operational notes
- a minimal footer line

This means the skill should usually adapt the provided template instead of building a new HTML page from scratch.

## Semantic Styling

The bundled style reference defines semantic colors and layout rules.

- **Frontend**: cyan-accented boxes
- **Backend**: emerald-accented boxes
- **Database**: violet-accented boxes
- **AWS / Cloud**: amber-accented boxes
- **Security**: rose-accented boxes and dashed trust boundaries
- **External / Generic**: slate-accented boxes

The page also standardizes JetBrains Mono typography, rounded component boxes, dashed region boundaries, and legend placement outside all boundaries.

## Output Contract

Always report:
- HTML file path
- chosen layout
- any assumptions or clarifications applied
- confirmation that legend placement, spacing, and boundary checks were completed

## Good Fits

- web app or three-tier system overviews
- AWS or cloud-region deployment diagrams
- service-to-service request pipelines
- security-boundary and trust-zone diagrams
- network topology views that need a standalone browser-openable handoff

## Main Supporting Files

- `content/skills/visual-media-design/architecture-diagram/SKILL.md`
- `content/skills/visual-media-design/architecture-diagram/assets/template.html`
- `content/skills/visual-media-design/architecture-diagram/references/style.md`
- `content/skills/visual-media-design/architecture-diagram/examples/web-app.html`
- `content/skills/visual-media-design/architecture-diagram/examples/microservices.html`
- `content/skills/visual-media-design/architecture-diagram/examples/aws-serverless.html`

## Key Constraints

- legends must sit outside every region, cluster, or security boundary
- arrows should render behind component boxes
- stacked components need enough vertical gap to avoid overlap
- keep the deliverable as a standalone HTML artifact unless the user explicitly asks for inline markup
- expand the SVG `viewBox` when the diagram grows instead of squeezing the legend or clipping boundaries

## Notes

- This page documents the skill surface and the shipped HTML diagram pattern, not every possible SVG layout the skill could produce.
- The example files are best used as layout references only when the requested architecture closely matches them.
