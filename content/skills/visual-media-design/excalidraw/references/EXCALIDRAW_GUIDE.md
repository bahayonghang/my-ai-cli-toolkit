# Excalidraw Reference Guide

Use this guide when authoring or reviewing `.excalidraw.json` files for this skill.

## Output Contract

- Required artifact: `<descriptive-name>.excalidraw.json`
- Optional artifacts:
  - `.svg` via Kroki and `curl`
  - `.png` or `.svg` via `excalidraw-brute-export-cli`
- PDF is not supported by this skill
- If rendering fails, keep the JSON output and report the failure instead of treating the whole task as blocked

## When Excalidraw Is the Right Tool

Use Excalidraw when the user needs:
- an editable diagram file
- a freeform spatial layout that would feel cramped in Mermaid
- a canvas or whiteboard style diagram
- a system or process with 3+ components, groups, or feedback arrows

Prefer Mermaid when the user explicitly wants Markdown-native diagram syntax, a README example, or a small doc-friendly chart with little need for post-editing.

## Style Modes

| Mode | Use when | Defaults |
|------|----------|----------|
| Professional | Architecture, APIs, process flows, technical explainers | `roughness: 0`, `fontFamily: 2`, `fillStyle: "solid"` |
| Sketch | Whiteboard, brainstorm, workshop, rough draft | `roughness: 1`, `fontFamily: 1`, `fillStyle: "solid"` |
| Code accent | Code snippets or file paths inside labels | `fontFamily: 3` for the relevant text only |
| Handwritten accent | Explicit playful or comic labeling | `fontFamily: 4` only when the request clearly wants it |

Do not mix professional and sketch styles casually. Pick one primary style per diagram.

## Supported Diagram Types

- **Flowchart** — process flows, decision trees, pipelines
- **Sequence diagram** — multi-phase message flows between participants
- **Architecture diagram** — services, layers, clients, storage, external systems
- **Hub-and-spoke** — central component with many peers
- **ER-style / relationship** — entities with labeled connections
- **Tree / hierarchy** — org charts, file trees, topic breakdowns
- **Swimlane** — cross-team or cross-role workflows
- **Concept map** — freeform relationships that need a spatial canvas

## Mandatory Planning Workflow

### 1. Determine the diagram type

Classify the request before placing anything. The layout strategy depends on the diagram type.

### 2. List all nodes and arrows

Write the connections first:

```text
Arrow 1: API Gateway -> Auth Service
Arrow 2: Auth Service -> User DB
Arrow 3: Auth Service -> API Gateway (response)
```

### 3. Identify crossing risks

For each arrow, ask: "Would a straight path from source to target pass through another component?"

Common danger signs:
- return arrows in a single horizontal row
- non-adjacent bidirectional connections
- hub-and-spoke layouts with spokes in a line
- nested containers that are too close to the next target

### 4. Choose the layout strategy

- No crossing risk: simple left-to-right or top-to-bottom layout
- 1-2 crossing risks: keep the main layout and use bypass paths
- 3+ crossing risks or many feedback loops: switch to a 2D layout such as triangle, diamond, grid, or split rows

### 5. Plan sections for large diagrams

For diagrams with 10+ elements:
- plan sections first
- namespace element IDs and seeds by section
- add elements in batches instead of improvising the whole canvas at once

## Layout Rules

- Align `x` and `y` coordinates to multiples of 20
- Standard component size: `160x60` minimum for single-line labels
- Minimum gap between unrelated elements: `40px`
- Container or background padding: `50-60px`
- Container opacity: `25-40`
- Render order matters: background regions appear earlier in the `elements` array

### Spacing Reference

| Scenario | Spacing |
|----------|---------|
| Labeled arrow gap | `150-200px` |
| Unlabeled arrow gap | `100-120px` |
| Column spacing with labeled arrows | `400px` |
| Column spacing with unlabeled arrows | `340px` |
| Row spacing | `280-350px` |
| Container padding | `50-60px` |

### Hierarchy Rules

- External arrows target the outer container for grouped structures, not the inner steps
- Siblings that represent parallel or alternative paths stay on the same row
- Nested structures need extra vertical room so arrows can connect to edges without cutting through boxes
- Reference notes such as file paths or line numbers should sit outside the main box, not inside the core label area

### Return Arrow Strategies

**3 components with a return arrow (`A -> B -> C`, `C -> A`)**
- Prefer a triangle layout
- Or keep the row and route the return arrow above or below everything else

**4 components with a return arrow (`A -> B -> C -> D`, `D -> A`)**
- Prefer a diamond or 2x2 grid
- Or use a perimeter bypass path

**4+ components with return arrows**
- Put the forward flow on the top row and return flow on the bottom row
- Or route return arrows around the perimeter rather than through the middle

**Hub-and-spoke**
- Put the hub near the center
- Spread spokes around it radially
- Avoid placing spokes in a straight line with the hub in the middle

## Visual System

Follow the 60-30-10 rule: mostly neutral space, a smaller set of primary accents, and only a little highlight color.

### Semantic Palette

| Category | Fill | Stroke | Use for |
|----------|------|--------|---------|
| Primary / Input | `#dbeafe` | `#1e40af` | Entry points, APIs, user-facing surfaces |
| Success / Data | `#dcfce7` | `#166534` | Data stores, success states |
| Warning / Decision | `#fef9c3` | `#854d0e` | Decisions, conditions |
| Error / Critical | `#fee2e2` | `#991b1b` | Errors, alerts, critical paths |
| External / Storage | `#f3e8ff` | `#6b21a8` | External services, storage, third parties |
| Process / Default | `#e0f2fe` | `#0369a1` | Standard process steps |
| Trigger / Start | `#fed7aa` | `#c2410c` | Start nodes, triggers, events |
| Neutral / Container | `#f1f5f9` | `#475569` | Groups, swimlanes, backgrounds |

### Text Colors

| Level | Color |
|-------|-------|
| Title | `#1e293b` |
| Label | `#334155` |
| Description | `#64748b` |

### Font Size Hierarchy

| Level | Size | Use for |
|-------|------|---------|
| Title | `28px` | Diagram title |
| Section header | `24px` | Group or phase header |
| Label | `20px` | Main element labels |
| Description | `16px` | Secondary text |
| Note | `14px` | Annotations and helper text |

### Arrow Semantics

| Style | Meaning |
|-------|---------|
| Solid | Primary flow |
| Dashed | Response, async, callback |
| Dotted | Optional, weak dependency, reference |

### Stroke Width Guidance

- `1` for containers or secondary lines
- `2` for normal components and main arrows
- `4` for emphasis only

## JSON Structure

### Base Template

```json
{
  "type": "excalidraw",
  "version": 2,
  "source": "https://excalidraw.com",
  "elements": [],
  "appState": { "viewBackgroundColor": "#ffffff" },
  "files": {}
}
```

### Element Types

| Type | Use for |
|------|---------|
| `rectangle` | Components, containers, steps |
| `ellipse` | Start or end nodes |
| `diamond` | Decisions |
| `arrow` | Directed connections |
| `line` | Undirected links |
| `text` | Labels, notes, free-standing headings |

### Sizing Rules

Calculate width from label length to avoid truncation:

- Latin text: `max(160, charCount * 9)`
- CJK text: `max(160, charCount * 18)`
- Mixed text: estimate per character type and sum

Height:
- `60` for single-line labels
- add `24` for each extra line

### Rectangle Template

```json
{
  "id": "api_gateway",
  "type": "rectangle",
  "x": 100,
  "y": 100,
  "width": 180,
  "height": 60,
  "strokeColor": "#1e40af",
  "backgroundColor": "#dbeafe",
  "fillStyle": "solid",
  "strokeWidth": 2,
  "roughness": 0,
  "roundness": { "type": 3 },
  "opacity": 100,
  "seed": 100001,
  "boundElements": [
    { "id": "arrow_gateway_to_auth", "type": "arrow" },
    { "id": "label_api_gateway", "type": "text" }
  ]
}
```

### Text Template

```json
{
  "id": "label_api_gateway",
  "type": "text",
  "text": "API Gateway",
  "x": 120,
  "y": 118,
  "width": 140,
  "height": 24,
  "fontSize": 20,
  "fontFamily": 2,
  "textAlign": "center",
  "verticalAlign": "middle",
  "strokeColor": "#334155",
  "containerId": "api_gateway"
}
```

Always set `width`, `height`, and `strokeColor` on text. Text `strokeColor` is the visible text color.

### Arrow Template

```json
{
  "id": "arrow_gateway_to_auth",
  "type": "arrow",
  "x": 285,
  "y": 130,
  "points": [[0, 0], [115, 0]],
  "strokeWidth": 2,
  "roughness": 0,
  "startBinding": { "elementId": "api_gateway", "focus": 0, "gap": 5 },
  "endBinding": { "elementId": "auth_service", "focus": 0, "gap": 5 },
  "endArrowhead": "arrow"
}
```

`points` are relative to the arrow origin. The first point is always `[0, 0]`.

### Field Rules

- Use descriptive string IDs, not random hashes
- Use unique positive integer `seed` values
- Use `boundElements: null` when there are no bound elements
- Use `updated: 1` when you need the field
- Do not include `frameId`, `index`, `versionNonce`, or `rawText`

### Binding Rules

- Arrows need `startBinding` and `endBinding`
- Shapes referenced by arrows need those arrow IDs in `boundElements`
- Contained text needs `containerId`
- Shapes that contain text should list that text in `boundElements`

### Container Rules

- Use background or group rectangles with reduced opacity for zones and swimlanes
- Do not bind the zone title text to the zone rectangle
- Zone titles should be free-standing text near the top-left of the zone
- Containers must fully cover all children with padding

Bounding box formula:
- `width = (maxX + maxWidth) - minX + 2 * padding`
- `height = (maxY + maxHeight) - minY + 2 * padding`

## Diagram Pattern Notes

### Flowchart

- Use ellipse for start/end
- Use diamond for decisions
- Use left-to-right unless a top-to-bottom layout is clearly easier to read

### Architecture Diagram

- Entry points on the left or top
- Processing/services in the middle
- Data stores and external systems on the right or bottom
- Group related services in neutral containers

### Sequence Diagram

- Participants across the top
- Duplicate participants by phase for multi-phase flows instead of drawing one huge diagram with long lifelines
- Use solid arrows for requests and dashed arrows for responses

### Swimlane

- Use large neutral rectangles with reduced opacity as lanes
- Put lane labels as free-standing text near the top-left
- Keep most flow within lanes and route cross-lane handoffs cleanly

## Export

### Option A: Kroki (`curl`) for SVG

```bash
curl -s -X POST https://kroki.io/excalidraw/svg \
  -H "Content-Type: application/json" \
  --data-binary "@diagram.excalidraw.json" \
  -o diagram.svg
```

### Option B: Local CLI for PNG or SVG

```bash
excalidraw-brute-export-cli -i diagram.excalidraw.json -o diagram.png -f png -s 2
excalidraw-brute-export-cli -i diagram.excalidraw.json -o diagram.svg -f svg -s 1
```

If the CLI is missing, install:

```bash
npm install -g excalidraw-brute-export-cli
npx playwright install firefox
```

## Anti-Patterns

- Do not put the zone title text inside a large background rectangle
- Do not let arrows pass through unrelated components if a bypass or 2D layout would fix it
- Do not connect external arrows to an internal step when the outer container is the real target
- Do not stack sibling branches vertically when they represent parallel paths
- Do not omit `strokeColor` on text
- Do not invent arbitrary colors unless the user explicitly wants a custom palette

## Common Mistakes

| Mistake | Fix |
|---------|-----|
| Text is invisible | Set `strokeColor` to a dark text color |
| Text is truncated | Use the width formula and a taller box for multi-line text |
| Arrows do not snap | Add both bindings on the arrow and `boundElements` on the shapes |
| Background overlaps content | Use a free-standing zone title and a larger padded container |
| Export fails | Keep the JSON, report the missing command or dependency, and tell the user how to open the file manually |
| Diagram looks cramped | Increase spacing or switch to a 2D layout |
| Return arrows create spaghetti | Route them around the perimeter or restructure the layout |
