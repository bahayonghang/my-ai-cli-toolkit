# Diagram Cookbook

Use this reference when an artifact needs relationships, sequences, roadmaps, or architecture explanation. Mermaid may be useful as a sketch, but the final artifact should contain inline SVG or structured HTML with a text equivalent.

## Output order

1. If a local Mermaid-to-SVG workflow exists in the future, export static SVG and inline it.
2. Otherwise generate inline SVG directly.
3. If SVG would be overkill, use structured HTML lanes, timelines, dependency lists, or tables.

Do not leave raw Mermaid as the primary visual expression in the final artifact.

## Shared rules

- Wrap diagrams in `<figure class="diagram-frame">`.
- Give SVG a `role="img"` plus `aria-labelledby` pointing to `<title>` and `<desc>`.
- Add a `figcaption` that summarizes why the diagram matters.
- Add a nearby ordered list or table as the text equivalent.
- Keep labels short inside SVG; put nuance in the text equivalent.
- Use color plus text, shape, or position; do not rely on color alone.

## Recipe: phase roadmap

Use for implementation plans, rollout strategies, migration plans, and executive roadmaps.

Recommended structure:

```html
<figure class="diagram-frame">
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" role="img" aria-labelledby="phase-title phase-desc">
    <title id="phase-title">Four phase rollout roadmap</title>
    <desc id="phase-desc">Discovery leads to build, verification, and release.</desc>
    <!-- phase nodes and arrows -->
  </svg>
  <figcaption>Phase roadmap with validation gates before release.</figcaption>
</figure>
<ol>
  <li><strong>Discovery:</strong> scope, owner, exit evidence.</li>
  <li><strong>Build:</strong> deliverable, validation command, risk trigger.</li>
</ol>
```

## Recipe: decision flow

Use for option selection, routing logic, and ADR summaries.

- Place the recommended path in the upper or central lane.
- Use branch labels such as `if budget constrained` or `if latency critical`.
- End every branch with a decision, not a vague state.

## Recipe: dependency lane

Use for workstreams, data dependencies, release blockers, and cross-team coordination.

- Use horizontal lanes for workstreams and vertical markers for gates.
- Pair each dependency with owner, readiness signal, and fallback.
- If the diagram becomes dense, convert the fallback details into a table under the lane.

## Recipe: before/after architecture

Use for migrations, refactors, platform changes, and boundary repair.

- Show before and after in two panels with the same node names where possible.
- Highlight removed coupling, new boundary, or risk isolation.
- Include a text equivalent with three lists: removed, unchanged, introduced.

## Recipe: evidence-to-claim map

Use for research or decision artifacts where readers need to trust the conclusion.

- Put claims on the right, source/evidence groups on the left, and confidence in the connector label or adjacent list.
- Add a source table with dates and confidence; do not force all citation detail into the SVG.
