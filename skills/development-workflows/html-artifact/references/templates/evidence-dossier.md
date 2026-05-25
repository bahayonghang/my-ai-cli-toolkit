# Evidence Dossier

## Use when
Research briefs, best-practice studies, competitive analysis, literature-style synthesis, and source-backed recommendations.

## Do not use when
The task is source-free brainstorming or the user asked not to browse/research.

## Information architecture
- Executive summary.
- Source table with type, date, confidence, and usage.
- Evidence vs inference.
- Findings grouped by theme.
- Counter-evidence and uncertainty.
- Recommendations.
- Citation appendix.

## Visual direction
Magazine/report layout with source cards, confidence badges, strong typographic hierarchy, and restrained callouts.

## Recommended layout primitives
- **Hero**: `hero--split` with the research question and bottom-line finding on the left, plus a right-side evidence rail showing source count, confidence, freshness, and major uncertainty.
- **Cards**: use `grid-3` for themes; if exactly five findings or features are known, use `grid-5-balanced` so the desktop layout lands as 3+2 instead of 4+1.
- **Tables**: use `table--evidence` for source tables. Highlight key sources with `key-row`; use `evidence-column` for how each source supports a claim.
- **Diagrams/SVG**: use a diagram frame for evidence maps, timeline-of-findings, source-to-claim dependency lanes, or before/after synthesis.

## Combination defaults
When paired with Decision Matrix Studio, default to:

1. `hero--split` with thesis board / evidence rail.
2. A 5-card feature or finding section using `grid-5-balanced`.
3. A comparison matrix using `table--matrix` with recommendation and evidence columns.
4. A roadmap or recommendation path using inline SVG or an HTML lane diagram.

## Core components
Source table, confidence badge, theme sections, uncertainty callout, recommendation cards, and citation appendix.

## Interaction pattern
Filter by confidence or source type, collapse source details, and copy citation summary.

## Accessibility notes
Keep citations as real text, include dates, and identify which claims are verified versus inferred.

## Minimal HTML skeleton

```html
<section id="sources" aria-labelledby="sources-title">
  <h2 id="sources-title">Sources</h2>
  <div class="table-wrap">
    <table>
      <caption>Source table</caption>
      <thead><tr><th>Source</th><th>Type</th><th>Date</th><th>Confidence</th><th>Used for</th></tr></thead>
      <tbody><tr><td>RFC 9114</td><td>spec</td><td>2022-06</td><td><span class="status-pill success">High</span></td><td>HTTP/3 framing</td></tr></tbody>
    </table>
  </div>
</section>
<section id="findings" aria-labelledby="findings-title">
  <h2 id="findings-title">Findings</h2>
  <article class="card"><h3 class="card-title">Evidence</h3><p>Quoted facts with citation [1].</p></article>
  <article class="card"><h3 class="card-title">Inference</h3><p>Reasoned implication, labeled as inference and not as a verified claim.</p></article>
</section>
```
