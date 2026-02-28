---
title: Obsidian Canvas Creator
description: Create different layouts for Obsidian Canvas, including mind maps, flow charts, knowledge graphs, and kanban boards.
category: obsidian
tags: [canvas, mindmap, flowchart, kanban, visualization]
---

# Obsidian Canvas Creator

A skill to create various types of Obsidian Canvas files (`.canvas`).

## Capabilities

Generates `.canvas` files (JSON format) for:

1.  **Mind Maps**: Hierarchical structures with central nodes and radiating branches.
2.  **Flow Charts**: Process flows with directed edges and decision points.
3.  **Knowledge Graphs**: Networked concepts with interconnections.
4.  **Kanban Boards**: Column-based task management layouts.

## Usage

Content is generated as valid JSON conforming to the Obsidian Canvas spec, ready to be saved as a `.canvas` file.

### Example: Mind Map

```json
{
	"nodes": [
		{"type":"text","text":"Central Idea","x":0,"y":0,"width":200,"height":100},
		{"type":"text","text":"Branch 1","x":300,"y":-100,"width":200,"height":100},
		{"type":"text","text":"Branch 2","x":300,"y":100,"width":200,"height":100}
	],
	"edges": [
		{"fromNode":"...","toNode":"..."}
	]
}
```

### Example: Kanban Board

```json
{
	"nodes": [
		{"type":"group","label":"To Do","x":0,"y":0,"width":300,"height":800},
		{"type":"group","label":"Doing","x":320,"y":0,"width":300,"height":800},
		{"type":"group","label":"Done","x":640,"y":0,"width":300,"height":800},
		{"type":"text","text":"Task 1","x":20,"y":50,"width":260,"height":100}
	]
}
```

## Integration

Use in conjunction with `json-canvas` skill for more advanced manipulation or when specific validation is required. This skill focuses on high-level layout patterns.
