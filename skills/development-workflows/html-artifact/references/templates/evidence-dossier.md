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
