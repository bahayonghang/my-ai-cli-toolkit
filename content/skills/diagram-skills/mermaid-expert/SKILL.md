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
category: visualization
tags:
  - mermaid
  - diagrams
  - flowchart
  - visualization
  - documentation
  - markdown
allowed-tools: Read, Write, Glob, Grep
argument-hint: [diagram-type-or-description]
---

# Mermaid Expert

## Execution Steps

1. Analyze the user's request to determine the required diagram type (Flowchart, Sequence, Class, State, Gantt, Git Graph, Block, etc.).
2. When answering syntax questions, troubleshooting diagrams, or integrating Mermaid, read `$SKILL_DIR/references/mermaid_syntax_guide.md` for the comprehensive syntax reference.
3. Draft the diagram using ````mermaid```` code blocks.
4. Apply clean, readable formatting, including subgraphs or styling where appropriate.
5. If the user encounters rendering issues or syntax errors, consult the Troubleshooting section in `$SKILL_DIR/references/mermaid_syntax_guide.md`.
6. Keep responses concise and focused; return the working diagram code. Do not lecture on basic syntax unless asked.

## Rules

- Always output correct Mermaid syntax enclosed in standard markdown ````mermaid```` blocks unless requested otherwise (like HTML integration).
- Default to `TD` / `TB` for flowcharts unless `LR` makes better sense contextually.
- Do NOT output lengthy encyclopedic tutorials; rely on reading your references and providing exact working solutions.
