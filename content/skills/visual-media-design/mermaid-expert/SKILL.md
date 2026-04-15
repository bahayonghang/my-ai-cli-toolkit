---
name: mermaid-expert
description: >-
  Expert guidance for Mermaid.js diagramming. Create flowcharts, sequence
  diagrams, class diagrams, state diagrams, Gantt charts, git graphs, and
  block diagrams using text-based syntax. Use when working with Mermaid,
  creating diagrams for Markdown/documentation, or visualizing workflows
  and architectures. Trigger whenever the user mentions Mermaid, wants a
  diagram in a README or docs, or needs text-based diagramming.
version: 1.0.0
category: visual-media-design
tags:
  - mermaid
  - diagrams
  - flowchart
  - visualization
  - documentation
  - markdown
allowed-tools: Read, Write, Glob, Grep
argument-hint: [diagram-type-or-description]
version: 1.1.0
---

# Mermaid Expert

## When To Use

- Mermaid code for Markdown, docs, or README files
- Syntax fixes or rendering troubleshooting
- Quick text-based diagrams where editability in plain text matters

## Do Not Use

- Freeform whiteboards or post-editable canvas diagrams
- Polished publishable SVG/PNG deliverables when Mermaid is not required
- Situations where a plain explanation is clearer than a diagram

## Workflow

1. Analyze the user's request to determine the required diagram type (Flowchart, Sequence, Class, State, Gantt, Git Graph, Block, etc.).
2. Read `$SKILL_DIR/references/mermaid_syntax_guide.md` before answering syntax questions, troubleshooting a broken diagram, or generating a non-trivial diagram from scratch.
3. Choose the simplest Mermaid type that fits the request. Do not default to a flowchart if sequence, class, state, or block syntax is a better match.
4. Draft the diagram inside fenced ````mermaid```` blocks.
5. Apply readability rules:
   - short labels
   - sensible direction (`TD` / `TB` by default, `LR` only when it helps)
   - subgraphs only when they clarify grouping
6. If the user supplied broken Mermaid, explain the smallest necessary fix and then provide the corrected diagram.
7. If Mermaid is the wrong medium for the request, say so and redirect to Excalidraw or a richer diagram skill.

## Output Contract

Return:

- a working Mermaid code block
- a brief note about the diagram type or key fix when helpful

Avoid long tutorials unless the user explicitly asked to learn Mermaid.

## Rules

- Always output correct Mermaid syntax enclosed in standard markdown ````mermaid```` blocks unless requested otherwise (like HTML integration).
- Default to `TD` / `TB` for flowcharts unless `LR` makes better sense contextually.
- Do NOT output lengthy encyclopedic tutorials; rely on reading your references and providing exact working solutions.
- When labels contain punctuation or parentheses, quote them if the syntax requires it.
- Prefer the smallest valid diagram that captures the user intent.

## Troubleshooting

- If Mermaid fails to render, check reserved characters, unmatched brackets, and node labels first.
- If the user is targeting Markdown docs and Mermaid cannot express the layout cleanly, say that explicitly instead of shipping broken syntax.

## Final Checklist

- Correct Mermaid diagram type selected
- Code block is syntactically valid
- Output is concise and directly usable
