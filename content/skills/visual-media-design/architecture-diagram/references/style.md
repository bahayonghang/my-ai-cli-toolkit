# Architecture Diagram Style Reference

Use this reference after reading `assets/template.html`. Keep the page structure from the template unless the user explicitly asks for a different shell.

## Page Structure

1. Header with title and subtitle.
2. Main diagram card containing one SVG.
3. Three summary cards below the diagram.
4. Minimal footer line.

## Color System

| Component Type | Fill | Stroke |
|---|---|---|
| Frontend | `rgba(8, 51, 68, 0.4)` | `#22d3ee` |
| Backend | `rgba(6, 78, 59, 0.4)` | `#34d399` |
| Database | `rgba(76, 29, 149, 0.4)` | `#a78bfa` |
| AWS / Cloud | `rgba(120, 53, 15, 0.3)` | `#fbbf24` |
| Security | `rgba(136, 19, 55, 0.4)` | `#fb7185` |
| Message Bus | `rgba(251, 146, 60, 0.3)` | `#fb923c` |
| External / Generic | `rgba(30, 41, 59, 0.5)` | `#94a3b8` |

Use the semantic color that matches the component's role. Do not recolor components arbitrarily.

## Typography

- Use JetBrains Mono.
- `12px` for component names.
- `9px` for sublabels.
- `8px` for annotations.
- `7px` for tiny labels or compact legend text.

## Background And Containers

- Page background: `#020617`.
- Grid stroke: `#1e293b`.
- Component boxes use rounded corners, usually `rx="6"`.
- Security groups use dashed rose borders.
- Region or major cloud boundaries use wider dashed amber borders and `rx="12"`.

When drawing arrows behind semi-transparent components, add an opaque backing rect such as `fill="#0f172a"` before the styled component rect so the arrows do not show through.

## Layout Rules

- Standard service height: `60px`.
- Larger components: `80px` to `120px`.
- Minimum vertical gap between stacked components: `40px`.
- Place inline buses inside the gap, not touching either component.
- Align related nodes to a simple grid.

## Arrow Rules

- Draw connection arrows early in the SVG so they render behind components.
- Standard flows can use slate, cyan, emerald, amber, or violet depending on semantics.
- Auth and security flows must use rose dashed lines.
- Label important arrows with protocols, ports, or trust-flow notes.

## Legend Rules

- Place legends outside all region, cluster, and security boundaries.
- Calculate the lowest boundary edge first.
- Start the legend at least `20px` below that edge.
- Increase the `viewBox` height when needed rather than squeezing the legend into the main boundary.

## Component Pattern

```svg
<rect x="X" y="Y" width="W" height="H" rx="6" fill="#0f172a"/>
<rect x="X" y="Y" width="W" height="H" rx="6" fill="FILL_COLOR" stroke="STROKE_COLOR" stroke-width="1.5"/>
<text x="CENTER_X" y="Y+20" fill="white" font-size="11" font-weight="600" text-anchor="middle">LABEL</text>
<text x="CENTER_X" y="Y+36" fill="#94a3b8" font-size="9" text-anchor="middle">sublabel</text>
```

## Summary Cards

Use the existing card shell from the template. Keep card titles short and list only the most important deployment, security, or operational details.

## Before Finishing

- Check that no boundary clips content.
- Check that legend placement still works after resizing.
- Check that arrows remain readable behind all components.
- Check that summary cards and footer still match the generated system.
