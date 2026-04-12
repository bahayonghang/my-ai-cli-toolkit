# Excalidraw Diagrams

Create editable Excalidraw diagrams for architecture views, flowcharts, sequence flows, and freeform system visuals.

## When to Use

Use this skill when the user needs:
- an editable Excalidraw file
- a freeform or spatial layout that would be awkward in Mermaid
- a whiteboard or sketch-style diagram
- a system or process diagram with 3+ components, groups, or feedback arrows

Prefer Mermaid for documentation-native diagrams in READMEs, Markdown pages, or other text-first docs.

## Default Behavior

- **Style**: professional technical diagram by default
- **Sketch mode**: only when the user explicitly asks for whiteboard, brainstorm, rough draft, or hand-drawn output
- **Required output**: `.excalidraw.json`
- **Optional output**: `.svg` or `.png` when export tooling is available

## Critical Rules

1. **Arrow binding is required**:
   - arrows need `startBinding` and `endBinding`
   - connected shapes need matching arrow IDs in `boundElements`

2. **Text must be explicit**:
   - every text element needs `width`, `height`, and `strokeColor`
   - use `containerId` for text that belongs inside a shape

3. **Containers must be semantically correct**:
   - external arrows connect to the outer container, not an internal child step
   - background regions must fully cover children with padding

4. **Layout must prevent crossings**:
   - if a return arrow would cut through the middle of the diagram, route it around the perimeter or switch to a 2D layout
   - siblings that represent parallel branches should stay on the same row

## Visual System

### Style Modes

| Mode | Defaults |
|------|----------|
| Professional | `roughness: 0`, `fontFamily: 2`, clean technical palette |
| Sketch | `roughness: 1`, `fontFamily: 1`, same structure but looser visual feel |

### Semantic Palette

| Category | Fill | Stroke |
|----------|------|--------|
| Primary / Input | `#dbeafe` | `#1e40af` |
| Success / Data | `#dcfce7` | `#166534` |
| Warning / Decision | `#fef9c3` | `#854d0e` |
| Error / Critical | `#fee2e2` | `#991b1b` |
| External / Storage | `#f3e8ff` | `#6b21a8` |
| Process / Default | `#e0f2fe` | `#0369a1` |
| Trigger / Start | `#fed7aa` | `#c2410c` |
| Neutral / Container | `#f1f5f9` | `#475569` |

### Text Colors

- Title: `#1e293b`
- Label: `#334155`
- Description: `#64748b`

## Layout Heuristics

- Align coordinates to multiples of 20
- Use `160x60` as the minimum standard box size
- Keep at least `40px` between unrelated elements
- Use `50-60px` of container padding
- Labeled arrow gaps should usually be `150-200px`
- Unlabeled arrow gaps can be tighter at `100-120px`

## Pattern Notes

- **Flowcharts**: ellipse for start/end, diamond for decisions, rectangles for steps
- **Architecture diagrams**: entry points left/top, processing in the middle, storage/external systems right/bottom
- **Sequence diagrams**: participants across the top, duplicate them by phase when the flow gets long
- **Swimlanes**: neutral background rectangles with free-standing lane titles

## Output

- Required file: `<descriptive-name>.excalidraw.json`
- Optional exports:
  - SVG via `curl` and Kroki
  - PNG/SVG via `excalidraw-brute-export-cli`
- Open the result in https://excalidraw.com or the VS Code Excalidraw extension

## Common Failure Modes

- Text is invisible because `strokeColor` is missing
- Arrows do not snap because bindings are only applied on one side
- Group labels overlap their contents because the label was attached to the background rectangle
- Return arrows create spaghetti because the diagram stayed in a single horizontal row
