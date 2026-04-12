# Fireworks Tech Graph

Generate polished technical diagrams with SVG as the required deliverable, and PNG when local export tooling is available.

## When to Use

Use this skill when the user wants to:
- turn a system description into a polished technical diagram instead of Mermaid code
- create an architecture diagram, flowchart, data flow, sequence diagram, agent diagram, memory diagram, comparison matrix, or timeline
- choose a visual style instead of getting a rough whiteboard sketch
- receive a publishable SVG, and optionally a PNG when export tooling exists

If the user explicitly wants Mermaid, a README-native diagram, or only a short textual explanation, this skill should not be the first choice.

## Default Behavior

- **Required deliverable**: `.svg`
- **Enhanced deliverable**: `.png` only when `rsvg-convert` is available locally
- **Default style**: Style 1 / Flat Icon
- **Optional styles**: Dark Terminal, Blueprint, Notion Clean, Glassmorphism

## Workflow

1. Classify the diagram type.
2. Extract the structure: nodes, layers, flows, and semantic groups.
3. Plan the layout before writing SVG.
4. Load `references/style-1-flat-icon.md` by default.
5. Read `references/icons.md` when branded products appear.
6. Write the SVG file.
7. Export PNG only when requested or clearly useful.
8. Return the actual output paths and clearly distinguish SVG success from PNG success, skip, or failure.

## Supported Diagram Types

- **Architecture diagrams**: layered services, systems, or infrastructure
- **Data flow diagrams**: what data moves where
- **Flowcharts**: decisions, approvals, and operational steps
- **Agent architecture diagrams**: LLMs, tools, memory, orchestration
- **Memory architecture diagrams**: Mem0 / MemGPT-style read-write paths
- **Sequence diagrams**: API call chains and time-ordered interactions
- **Comparison matrices**: feature or solution comparisons
- **Timelines / Gantt charts**: phases, milestones, and durations
- **Concept maps / mind maps**: capability maps and tech-stack overviews

## Platform & Export

### Core rule
- Always guarantee the `.svg` first.
- Only promise `.png` when local export tooling exists.

### Check commands
- bash-like shells: `command -v rsvg-convert`
- PowerShell: `Get-Command rsvg-convert`

### Windows support
- Windows users should prefer PowerShell for dependency checks.
- Quote paths that contain spaces.
- If the user gives a Windows path such as `C:\Users\...`, preserve it exactly instead of rewriting it into POSIX form.

### macOS / Linux
- On macOS, `rsvg-convert` commonly comes from `librsvg`.
- On Linux, it commonly comes from `librsvg2-bin` or an equivalent package.

### Fallback behavior
- If `rsvg-convert` is unavailable, still deliver SVG and explicitly say PNG export was skipped.
- If export fails, keep the SVG and report the failure plus the SVG path.
- Do not invent unverified download URLs or installation links.

## Style System

| Style | Best For |
|------|----------|
| Flat Icon | blogs, docs, slides |
| Dark Terminal | READMEs, developer articles, dark presentations |
| Blueprint | architecture and engineering documentation |
| Notion Clean | internal docs, wikis, knowledge bases |
| Glassmorphism | presentations and more visually polished storytelling |

## Semantic Conventions

### Common shapes
- User: circle or actor
- LLM / Model: double-border rounded rectangle
- Agent / Orchestrator: hexagon or emphasized controller box
- Short-term Memory: dashed rounded rectangle
- Long-term Memory / Vector Store: cylinder
- Tool: utility box
- API / Gateway: hexagon
- File / Document: folded-corner rectangle
- Decision: diamond
- Process: rounded rectangle

### Common arrow meanings
- Blue solid: primary data or request flow
- Orange solid: control or trigger flow
- Green solid: memory read
- Green dashed: memory write
- Gray dashed: async or event flow
- Purple: loopback, transform, or embedding-related flow

Add a legend whenever a diagram uses two or more semantic arrow types.

## Output Requirements

Always report at least:
- diagram type
- chosen style
- SVG path
- PNG path, or a clear PNG skipped/failed status

## Common Problems

- Arrows crossing through nodes: reroute around the perimeter
- Diagram too noisy: add grouping containers and reduce color variants
- Text overflow: shorten labels or enlarge nodes
- SVG only output: acceptable, but must be reported explicitly
