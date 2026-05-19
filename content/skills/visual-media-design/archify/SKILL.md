---
name: archify
description: Create professional architecture, workflow, sequence, data-flow, and lifecycle/state diagrams as standalone HTML files with inline SVG, dark/light theme toggle, and one-click export to PNG / JPEG / WebP / SVG. Use this skill for system architecture diagrams, infrastructure/cloud/security/network topology visuals, technical workflows, approval/runbook/CI/CD/process diagrams, API call sequences, request lifecycles, interaction diagrams, data pipelines, ETL/ELT maps, PII/governance/data-lineage diagrams, state machines, status transitions, retry/cancel/timeout paths, or any request that needs a polished browser-openable technical diagram rather than Mermaid or an editable whiteboard.
license: MIT
metadata:
  version: "2.4.0"
compatibility:
  requires: "Node.js for renderer-backed modes; npm dependencies from package-lock.json must be installed with npm ci before running renderers."
---

# Archify Skill

Create polished technical diagrams as self-contained HTML files with inline SVG, theme switching, and built-in export controls.

Archify has two production paths:

1. **Renderer-backed JSON IR** for repeatable structured diagrams: `workflow`, `sequence`, `dataflow`, and `lifecycle`.
2. **Manual architecture template mode** for bespoke system/cloud/security diagrams that need hand-placed SVG components.

Prefer renderer-backed modes whenever the request matches one of them. Use manual architecture mode only when the user needs a bespoke component/topology diagram that does not fit the structured IRs.

## First-run setup for renderer modes

Renderer modes depend on the bundled npm dependency `ajv` for JSON Schema validation. In a fresh checkout or installed skill directory, run once before rendering:

```bash
cd archify
npm ci
```

If `npm ci` is unavailable but dependency installation is allowed, use `npm install`. If dependencies cannot be installed, do not pretend the renderer can run; either use manual architecture mode or report the dependency blocker.

The final diagram HTML itself has no server runtime. It opens directly in a browser. The page uses embedded CSS/JS and inline SVG, with Google Fonts as the only network stylesheet.

## Choose the diagram mode

| Mode | Use when the user asks for | Primary path |
| --- | --- | --- |
| `architecture` | System components, cloud resources, services, storage, network/security boundaries, topology overviews | Copy and customize `assets/template.html` |
| `workflow` | Technical flows, approval gates, runbooks, CI/CD, incidents, tool calls, ownership/process lanes | `renderers/workflow/render-workflow.mjs` |
| `sequence` | API call chains, request lifecycles, participant interactions over time, returns/fallbacks | `renderers/sequence/render-sequence.mjs` |
| `dataflow` | ETL/ELT, analytics pipelines, PII isolation, governance, lineage, warehouse/consumer paths | `renderers/dataflow/render-dataflow.mjs` |
| `lifecycle` | State machines, status changes, retries, waits, terminal states, cancel/timeout/recovery paths | `renderers/lifecycle/render-lifecycle.mjs` |

Mode-selection rules:

- If the user says **architecture**, **system diagram**, **cloud diagram**, **topology**, or asks to understand codebase/service structure, choose `architecture` unless the result is clearly process-oriented.
- If the user says **workflow**, **flow**, **process**, **approval**, **runbook**, **CI/CD**, **incident**, or asks how work moves through actors/systems, choose `workflow`.
- If the user says **sequence**, **interaction**, **call sequence**, **request lifecycle**, **who calls whom**, or asks for time-ordered participant interactions, choose `sequence`.
- If the user says **data flow**, **pipeline**, **ETL**, **ELT**, **lineage**, **analytics**, **warehouse**, **PII**, **consent**, or **governance**, choose `dataflow`.
- If the user says **state**, **status**, **lifecycle**, **state machine**, **terminal**, **retry**, **cancel**, **timeout**, **order lifecycle**, or **deployment lifecycle**, choose `lifecycle`.

## Renderer workflow

For `workflow`, `sequence`, `dataflow`, and `lifecycle`:

1. Read `references/renderer-modes.md` for the selected mode.
2. Start from the closest JSON file in `examples/` when it materially matches the request.
3. Create a JSON IR file with `schema_version: 1`, `diagram_type`, `meta`, graph items, and summary `cards`.
4. Render with the matching script, for example:

   ```bash
   node archify/renderers/workflow/render-workflow.mjs workflow.json workflow.html
   ```

5. If validation fails, fix the JSON and re-run. Do not edit the renderer to bypass schema/layout checks.
6. Open or inspect the output HTML when possible, then return the actual file path and any assumptions.

Renderer modes intentionally constrain layout through lanes, columns, stages, rows, anchors, route presets, and short labels. This keeps future invocations stable and avoids SVG surgery.

## Manual architecture workflow

For `architecture`:

1. Copy `assets/template.html` to the requested output path.
2. Read `references/design-system.md` and `references/template-export.md`.
3. Extract components, boundaries, arrows, labels, legend needs, and summary-card content.
4. Hand-place SVG elements using the existing semantic CSS classes.
5. Keep arrows behind component boxes and use `c-mask` behind semi-transparent fills.
6. Expand the SVG `viewBox` instead of crowding legends or clipping boundaries.
7. Keep the toolbar, theme scripts, export scripts, CSS variable system, and sentinel structure intact.

## Design and output contract

Every Archify deliverable should include:

- One standalone `.html` file.
- Inline SVG inside the shipped page template.
- Embedded CSS and the existing small embedded JS for theme/export controls.
- Dark/light theme support via CSS variables, not hardcoded SVG colors.
- Export menu for Copy PNG plus PNG / JPEG / WebP / SVG downloads.
- Three concise summary cards below the diagram.
- A footer that identifies the diagram type and relevant metadata.

When reporting completion, include:

- Output file path.
- Chosen mode and why.
- Any assumptions or missing information filled in.
- Validation/render command run, or the precise reason it could not run.
- For manual architecture mode, state that spacing, boundary padding, arrow z-order, and legend placement were checked.

## Reference files

Read only what the selected task needs:

- `references/renderer-modes.md` — JSON IR schemas, examples, renderer commands, and mode-specific design rules.
- `references/design-system.md` — semantic classes, arrows, masks, spacing, boundaries, legends, and card patterns.
- `references/template-export.md` — template customization points and export/theming contract.
- `renderers/<mode>/README.md` — concise renderer-specific command and input summary.
- `schemas/*.schema.json` — exact JSON Schema if validation details are needed.
- `examples/*.json` — working renderer-backed examples.

## Boundaries

Do not use Archify when:

- The user explicitly wants Mermaid syntax embedded in Markdown; use a Mermaid-focused skill instead.
- The user needs a hand-editable canvas artifact; use an Excalidraw-style skill instead.
- The user wants a standalone image/poster rather than a technical diagram artifact.
- The requested diagram lacks enough nodes, flows, or states after one concise clarification and guessing would mislead the reader.
