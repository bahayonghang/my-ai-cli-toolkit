---
name: architecture-diagram
description: "Create dark-themed standalone HTML architecture diagrams with inline SVG. Use when the user wants a browser-openable HTML architecture artifact for 架构图、系统架构图、云架构图、网络拓扑图、HTML 架构图, cloud infrastructure, or security-boundary work. Do not use for Mermaid, Excalidraw, or generic SVG/PNG-only diagrams."
version: 1.1.0
category: visual-media-design
tags:
  - architecture
  - html
  - svg
  - infrastructure
  - cloud
  - network-topology
  - security
compatibility: Requires file read/write access and HTML file output.
argument-hint: "[architecture-description]"
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
license: MIT
metadata:
  author: Cocoon AI (hello@cocoon-ai.com)
---

Generate a standalone `.html` architecture diagram from `$ARGUMENTS`.

If the user wants Mermaid, Excalidraw, or SVG/PNG-only output, route away from this skill. If nodes, flows, or trust boundaries are too vague, ask one short clarifying question. If the request is still underspecified after that, list the missing architecture facts instead of inventing them.

## Workflow

1. Read `$SKILL_DIR/assets/template.html` and `$SKILL_DIR/references/style.md`.
2. Inspect the closest file in `$SKILL_DIR/examples/` only when it materially matches the requested architecture.
3. Extract layers, nodes, edges, labels, trust boundaries, and legend needs.
4. Choose a layout before editing:
   - left-to-right for request pipelines
   - top-to-bottom for stacked platforms or zone boundaries
5. Resolve the output path:
   - use the user-provided filename when present
   - otherwise save `descriptive-name-architecture.html` in the working directory
6. Customize the template instead of rebuilding the page shell from scratch.
7. Keep arrows behind components, keep legends outside every boundary, and expand the SVG `viewBox` whenever the diagram grows.
8. Write the final `.html` file to disk.

## Return

Always return:

- the HTML file path
- the chosen layout
- any assumptions or clarifications applied
- whether boundary placement, legend placement, and spacing were checked

## Final Checklist

- legend is outside every region, cluster, and security boundary
- vertical spacing prevents overlapping components or inline buses
- arrows do not sit on top of component boxes
- component colors match their semantic type
- the file opens directly in a modern browser
