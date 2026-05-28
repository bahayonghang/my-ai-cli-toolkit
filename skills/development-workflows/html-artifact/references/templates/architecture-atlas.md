# Architecture Atlas

## Use when
System architecture, data flow, interface boundaries, dependency maps, and failure-path explainers.

## Do not use when
The task is a pure status update or linear checklist with no architecture questions.

## Information architecture
- System boundary and assumptions.
- Component inventory.
- Data-flow diagram with text equivalent.
- Interface contracts.
- Normal path and failure modes.
- Hot path and cold path notes.
- Observability hooks and diagnostic signals.

## Visual direction
Diagram-first canvas with side inspector cards, thin connector lines, calm background, and compact component cards.

## Recommended layout primitives
- **Hero**: `hero--split` with the architecture thesis on the left and a right-side boundary/assumption board, component count, hot path, or failure-mode summary.
- **Cards**: use `grid-4` for component inventories and `grid-7-balanced` for exactly seven components (4+3 desktop). Avoid `auto-fit` for known component counts that would create orphan rows.
- **Tables**: use `table--evidence` for interface contracts and `table--decision` for boundary decisions. Highlight hot-path rows with `key-row` and diagnostic signals with `evidence-column`.
- **Diagrams/SVG**: prefer `figure.diagram-frame` with inline SVG for data flow, before/after architecture, dependency lanes, and normal/failure paths.

## Diagram expectations
- Start architecture explainers with a diagram, not a prose-only component list.
- Every diagram must include a `figcaption` plus a text equivalent list or table describing nodes, edges, and direction.
- Raw Mermaid can be used as scratch input, but the final artifact should inline static SVG or use a structured HTML lane.


## Codebase-audit variant

Use this variant for requests about call mechanisms, architecture optimization, enum selection, redundant modules, trainer/worker dispatch, model trainers, or unclear module boundaries.

Combine **Architecture Atlas + Review Workbench + Strategy Blueprint** while keeping Architecture Atlas as the spine:

1. Start with a diagram-first architecture section before prose. Show the current call graph or C4-lite module boundary first.
2. Separate every claim into **evidence**, **inference**, or **recommendation**. Evidence names files/symbols/commands; inference states confidence; recommendation names impact and verification.
3. Include the fixed audit structure: evidence summary, current call graph, selection/enum mechanism, redundancy matrix, architecture risks, recommended solution, implementation roadmap, verification checklist.
4. For enum/selection advice, include a table with: current entrypoint, recommended enum type, recommended member names, naming basis, caller impact, documentation update point.
5. Use a redundancy matrix for duplicate responsibilities: location A, location B, overlap, risk, merge/delete/retain recommendation, and proof needed before changing.
6. Keep SVG labels short (`CLI`, `Dispatch`, `Trainer`, `Worker`, `Retry`, `Result`). Put long identifiers, paths, Chinese explanation, and nuanced rationale in adjacent cards/tables.
7. Treat diagrams as evidence organizers, not decoration: every diagram needs a figcaption and nearby text equivalent.

Recommended visual stack: `architecture-map` for boundaries, `evidence-rail` for traceability, `edge-legend` for call/result/failure edge meaning, and `risk-heat` for risk density.

## Core components
Inline SVG diagram, component cards, contract snippets, failure-mode table, and observability checklist.

## Interaction pattern
Toggle normal/failure paths, reveal component details with `details`, and copy interface contracts.

## Accessibility notes
Every diagram needs a nearby ordered list or table explaining nodes, edges, and direction of data flow.

## Minimal HTML skeleton

```html
<section id="dataflow" aria-labelledby="dataflow-title">
  <h2 id="dataflow-title">Data flow</h2>
  <figure>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" aria-labelledby="diagram-title" role="img">
      <title id="diagram-title">Client posts to API, which writes to Store.</title>
      <rect x="10" y="30" width="100" height="60" fill="#eef2ff" stroke="#4f46e5"/>
      <text x="60" y="64" text-anchor="middle">Client</text>
    </svg>
    <figcaption>See node list below for the text equivalent.</figcaption>
  </figure>
  <ol>
    <li><strong>Client</strong> → <strong>API</strong> via HTTPS POST</li>
    <li><strong>API</strong> → <strong>Store</strong> via internal RPC</li>
  </ol>
</section>
```
