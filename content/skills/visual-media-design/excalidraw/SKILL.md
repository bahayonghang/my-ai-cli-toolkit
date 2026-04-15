---
name: excalidraw
description: >-
  Create editable Excalidraw diagrams for architecture views, flowcharts,
  sequence flows, dependency maps, and other visuals that need a freeform
  canvas instead of text-only markup. Use when the user wants an Excalidraw
  file, an editable diagram, a whiteboard or sketch, or a spatial visual for
  a system with 3+ components or a multi-step flow. Prefer this over Mermaid
  when layout freedom or post-editing matters. Do not trigger for simple
  lists, quick explanations, or documentation-native Mermaid requests.
version: 1.1.0
argument-hint: [diagram-description]
allowed-tools: Read, Write, Glob, Grep, Bash(curl *, excalidraw-brute-export-cli *, python *)
category: visual-media-design
tags:
  - diagram
  - excalidraw
  - architecture
  - flowchart
  - sequence-diagram
  - editable
version: 1.2.0
---

Generate an Excalidraw diagram from `$ARGUMENTS`.

## Inputs

- Required: diagram description, system/process notes, or a structured outline
- Optional: output path, export format, style preference, grouping hints

If `$ARGUMENTS` is empty or too vague to identify the subject, ask for the missing diagram description before proceeding.

## Workflow

1. Read `$SKILL_DIR/references/EXCALIDRAW_GUIDE.md` before doing layout work. For complex diagrams or exports, use the relevant sections instead of improvising structure.
2. Classify the request: architecture, flowchart, sequence, hub-and-spoke, hierarchy, ER-style, swimlane, or freeform concept map.
3. Choose a style mode:
   - `professional` by default for architecture, systems, APIs, workflows, and most technical diagrams
   - `sketch` only when the user explicitly asks for a whiteboard, brainstorm, rough draft, or hand-drawn look
4. Perform arrow-path analysis before placing components. If return arrows or non-adjacent connections would cross intermediate nodes, switch to a bypass path or 2D layout.
5. Generate the JSON with descriptive IDs, explicit text sizing and colors, bidirectional bindings, and containers that fully cover grouped children.
6. Resolve the output path:
   - if the user supplied a filename, use it
   - otherwise save as `<descriptive-name>.excalidraw.json` in the active directory
7. If the user asked for PNG or SVG, or a rendered preview would materially help, try an export:
   - SVG via Kroki when `curl` is available
   - PNG or SVG via `excalidraw-brute-export-cli` when the local CLI is available
   - If export tooling is unavailable, still deliver the JSON and explain what was missing
8. Return the created file paths, chosen diagram type, chosen style mode, and export status.

## Output Contract

Always deliver:

- the `.excalidraw.json` path
- the chosen diagram type
- the chosen style mode
- export status for each requested preview format

Do not dump the full JSON into chat unless the user explicitly asks for inline content.

## Rules

- `.excalidraw.json` is the required deliverable. Rendered exports are optional enhancements.
- Use the professional palette, typography, and spacing defaults from the guide unless the request explicitly calls for a sketch or workshop feel.
- Arrows and contained text must be bound bidirectionally.
- Set `width`, `height`, and `strokeColor` on every text element.
- External arrows target the outer container for grouped structures, not the internal steps.
- Siblings that represent parallel branches stay on the same row.
- For 10+ elements, plan sections first and then write the file.
- Prefer concise delivery. Do not dump large JSON blobs in chat when a file output is the real artifact.
- Do not use this skill when Mermaid is explicitly requested for Markdown or docs, or when a simple explanation is clearer than a diagram.

## Troubleshooting

- Missing text: check `width`, `height`, `strokeColor`, and the selected font.
- Arrows not snapping: verify both arrow bindings and shape `boundElements`.
- Spaghetti layout: widen spacing, route return arrows around the perimeter, or switch to a 2D layout.
- Export failure: keep the JSON output, report the failed tool or command, and tell the user how to open the file manually.
- If the request is better served by Mermaid or a static SVG, say so instead of forcing a freeform canvas.

## Final Checklist

- Diagram type matches the request
- Grouped elements are visually enclosed and externally targetable
- Arrow routing is readable without crossing core nodes
- Output file path is explicit
