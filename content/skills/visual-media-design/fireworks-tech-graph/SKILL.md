---
name: fireworks-tech-graph
description: >-
  Generate polished technical diagrams as SVG, and export PNG when local export
  tooling is available. Use when the user wants an architecture diagram,
  flowchart, data flow, sequence diagram, agent or memory diagram, comparison
  matrix, timeline, or concept map rendered as a visual artifact instead of
  Mermaid or a hand-drawn whiteboard. Trigger on requests like 画图、帮我画、生成图、
  做个图、架构图、流程图、时序图、可视化一下, or English requests such as draw
  diagram, architecture diagram, visualize this system, generate a flowchart,
  or create a technical SVG. Prefer this skill when the user wants publishable
  SVG/PNG output, style selection, or AI/agent-system diagram conventions.
version: 1.0.0
category: visual-media-design
tags:
  - diagram
  - svg
  - png
  - architecture
  - flowchart
  - sequence-diagram
  - visualization
  - agents
argument-hint: [diagram-description]
allowed-tools:
  - Read
  - Write
  - Bash(curl *, rsvg-convert *, python *)
---

Generate a production-quality technical diagram from `$ARGUMENTS`.

## Inputs

- Required: diagram description, system/process structure, or comparison axes
- Optional: output path, requested style, PNG export requirement, brand/product names

If the prompt is too vague to identify nodes and edges, ask for the missing structure before drawing.

## Workflow

Follow this order:

1. Classify the request into a diagram type.
2. Extract the structure: layers, nodes, edges, flows, and semantic groups.
3. Plan the layout before drawing.
4. Load a style reference:
   - default: `$SKILL_DIR/references/style-1-flat-icon.md`
   - load another `style-*.md` file only when the user explicitly requests a different look
5. Map each concept to a consistent shape.
6. If branded products appear, read `$SKILL_DIR/references/icons.md`.
7. Resolve the output path:
   - use the user-provided file path when present
   - otherwise save the SVG in the current working directory with a descriptive filename
8. Write the SVG to disk.
9. If PNG was requested or would materially help, export PNG when local tooling is available.
10. Return the created file paths and clearly report whether PNG export succeeded, was skipped, or failed.

## Output Contract

Always return:

- the SVG path
- the requested or inferred diagram type
- the style reference used
- PNG export status

If only SVG was produced, say so explicitly.

## Diagram Types

### Architecture Diagram
- Group services or components into horizontal or vertical layers.
- Common layers: Client → Gateway → Services → Data/Storage.
- Use dashed containers to group related components.
- Default `viewBox`: `0 0 960 600`; use `0 0 960 800` for taller stacks.

### Data Flow Diagram
- Emphasize what data moves where.
- Label every important arrow with the data type.
- Use thicker arrows for the primary data path.
- Use dashed arrows for triggers or control flow.

### Flowchart / Process Flow
- Prefer top-to-bottom unless the flow is clearly wider than tall.
- Use diamonds for decisions, rounded rectangles for processes, and parallelograms for I/O.
- Keep node labels short; move extra detail into sub-labels.
- Snap to a readable grid.

### Agent Architecture Diagram
- Consider these layers: Input, Agent Core, Memory, Tools, Output.
- Use loop arrows where reasoning or tool use iterates.
- Visually separate short-term and long-term memory.

### Memory Architecture Diagram
- Separate read and write paths.
- Show tiers such as Working Memory, Short-term, Long-term, External Store.
- Label operations like `store()`, `retrieve()`, `forget()`, and `consolidate()`.

### Sequence Diagram
- Participants use vertical lifelines.
- Messages are horizontal arrows arranged top-to-bottom in time order.
- Use activation boxes or frames when the sequence has phases, loops, or alternatives.

### Comparison / Feature Matrix
- Columns are systems; rows are attributes.
- Use alternating row fills for readability.
- If the comparison grows beyond 5 columns, split it into multiple diagrams.

### Timeline / Gantt
- X-axis is time; Y-axis is phase, task, or milestone owner.
- Use bars for durations and diamonds or dots for milestones.

### Mind Map / Concept Map
- Place the main concept at the center.
- First-level branches should be balanced around the center.
- Prefer curved branches instead of rigid straight spokes.

## Shape Vocabulary

Use consistent semantics across diagrams:

| Concept | Shape |
|---------|-------|
| User / Human | circle or actor |
| LLM / Model | double-border rounded rectangle |
| Agent / Orchestrator | hexagon or emphasized controller box |
| Short-term Memory | rounded rectangle with dashed border |
| Long-term Memory | cylinder |
| Vector Store | cylinder with inner rings |
| Graph DB | clustered circular form or labeled store |
| Tool / Function | utility box or gear-marked rectangle |
| API / Gateway | hexagon |
| Queue / Stream | horizontal pipe |
| File / Document | folded-corner rectangle |
| Browser / UI | browser frame |
| Decision | diamond |
| Process / Step | rounded rectangle |
| External Service | cloud-like or dashed-border external node |
| Data / Artifact | parallelogram |

## Arrow Semantics

Use color and stroke to encode meaning:

| Flow Type | Suggested Meaning |
|-----------|-------------------|
| Blue solid | primary request or data flow |
| Orange solid | control or trigger flow |
| Green solid | memory read |
| Green dashed | memory write |
| Gray dashed | async or event-driven flow |
| Purple solid | transform, embedding, or loopback |

When a diagram uses 2 or more arrow meanings, add a legend.

## Layout Rules

- Keep related nodes aligned to a simple grid.
- Keep at least `60px` between node edges where possible.
- Avoid routing arrows through nodes.
- The most important node should have the strongest visual emphasis.
- Keep arrow labels short and legible.
- Group related nodes with lightly tinted or dashed containers instead of cluttering labels.

## SVG Technical Rules

- Default to `viewBox="0 0 960 600"` unless the diagram needs a taller or wider canvas.
- Use inline `<style>` and system fonts only.
- Do not use external `@import` font loading.
- Put reusable markers, gradients, filters, and clip paths in `<defs>`.
- Prefer `12-14px` labels and `16-18px` titles.
- Use marker arrows for directed edges.
- Use curved cubic paths for feedback loops and non-linear returns.

## Platform & Export

### Required deliverable
- Always deliver an `.svg` file.
- `.png` is an enhancement when local export tooling exists.

### Export behavior
1. If `rsvg-convert` is available, use it for PNG export.
2. If it is not available:
   - still write the SVG
   - report that PNG export was skipped because the converter is unavailable
   - tell the user what command to check next based on their platform

### Dependency checks
- In bash-like shells: `command -v rsvg-convert`
- In PowerShell: `Get-Command rsvg-convert`

### Platform notes
- **Windows**: prefer PowerShell checks and quote paths that contain spaces. If the user gives a Windows path such as `C:\Users\name\Desktop\diagram.svg`, preserve it exactly.
- **macOS**: `rsvg-convert` is commonly provided by `librsvg`.
- **Linux**: `rsvg-convert` is commonly provided by `librsvg2-bin` or equivalent packages.

### Path handling
- Use the user-provided output path when present.
- If no path is given, save in the current working directory.
- Do not rewrite a Windows path into POSIX form unless the user asked for that.
- Quote file paths with spaces when invoking export commands.

### Failure handling
- If export fails, keep the SVG and report the exact output path.
- If only SVG was produced, say so explicitly instead of implying a full export succeeded.
- Do not invent download URLs or package-manager instructions you cannot verify from local context.

## Final Checklist

- Main structure is readable at a glance
- Arrow semantics are consistent and labeled when needed
- Requested style reference was actually loaded
- SVG exists at the reported path

## Styles

| # | Name | Best For |
|---|------|----------|
| 1 | Flat Icon (default) | blogs, docs, slides |
| 2 | Dark Terminal | README, dev articles, dark presentations |
| 3 | Blueprint | architecture and engineering documentation |
| 4 | Notion Clean | internal docs, wikis, calm system diagrams |
| 5 | Glassmorphism | keynotes or more polished visual storytelling |

Load the matching file from `$SKILL_DIR/references/` when a style is selected.

## AI / Agent Common Patterns

Internalize these recurring structures:
- RAG Pipeline: Query → Embed → Vector Search → Retrieve → LLM → Response
- Agentic RAG: query plus planner/tool loop before synthesis
- Agentic Search: Query → Planner → Tools → Synthesizer → Response
- Memory Layer: Input → Memory Manager → Store/Retrieve → Context
- Multi-Agent: Orchestrator → Sub-agents → Aggregator → Output
- Tool Call Flow: LLM → Tool Selector → Execution → Result Parser → back to LLM

## Common Mistakes

- Arrow paths crossing through nodes
- Too many arrow colors with no legend
- Unlabeled important arrows
- No grouping in complex diagrams
- Text overflow inside nodes
- Reporting PNG output when only SVG exists
- Forgetting to load the requested style reference before drawing
