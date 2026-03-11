---
name: excalidraw
description: >-
  Generate hand-drawn style diagrams as Excalidraw JSON (.excalidraw.json).
  Use when user wants visual diagrams, architecture diagrams, flowcharts,
  sequence diagrams, system design visuals, or mentions Excalidraw.
  Also use when the user needs an editable diagram file rather than
  text-based markup. Trigger even for general "draw me a diagram" requests
  when a hand-drawn or editable file format is appropriate.
version: 1.0.0
argument-hint: [diagram-description]
allowed-tools: Read, Write, Bash(python *), Glob, Grep
category: visual-design
tags:
  - diagram
  - flowchart
  - architecture
  - excalidraw
  - hand-drawn
---

Generate an Excalidraw JSON diagram based on `$ARGUMENTS`.

## Steps

1. Read `$SKILL_DIR/references/EXCALIDRAW_GUIDE.md` for component structures, layout rules, and patterns.
2. Analyze the arrow paths based on `$ARGUMENTS` and identify crossing risks (e.g., return arrows).
3. Choose an appropriate layout strategy based on crossings: horizontal/vertical for none, bypass paths for 1-2, 2D layout (grid, diamond) for 3+.
4. Generate the JSON diagram following the required structural templates.
5. Enforce arrow binding bidirectionally by ensuring `startBinding` and `endBinding` on arrows, and `boundElements` on source/target rectangles.
6. Set `width` and `height` for all text elements to ensure rendering.
7. Ensure background regions fully cover all contained elements with 40px padding.
8. Enforce proper sibling layout horizontally; use fork arrows for child elements to reflect parallel paths.
9. Verify no arrow passes through unrelated components and no label overlaps. Adjust spacing or routing if violations occur.
10. Save the JSON file as `<descriptive-name>.excalidraw.json` in the active directory.
11. Instruct the user to drag the file into https://excalidraw.com/ or open with the VS Code Excalidraw extension.

## Output

A valid `.excalidraw.json` file.

## Error Handling & Troubleshooting

- If arrows fail to snap to components, check that BOTH `startBinding`/`endBinding` and `boundElements` are configured properly.
- If text is missing or garbled, verify that `width`, `height`, and `fontFamily: 4` are set.
- If crossing logic fails, switch to a more spacious 2D layout rather than using complex crisscross connections.
