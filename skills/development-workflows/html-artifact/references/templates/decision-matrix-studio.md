# Decision Matrix Studio

## Use when
Architecture choices, product/design alternatives, package selection, buy/build decisions, and ADR-style recommendations.

## Do not use when
There is no meaningful alternative, or the user asked for implementation only.

## Information architecture
- Decision question.
- Options gallery with neutral summaries.
- Evaluation criteria and weights.
- Score matrix.
- Tradeoff notes.
- Recommendation with confidence.
- Rejected alternatives.
- Revisit triggers.

## Visual direction
Bento comparison grid with consistent option card anatomy; recommended options may use light accent but must not overwhelm evidence.

## Core components
Option cards, criteria chips, score matrix, tradeoff callouts, and ADR summary block.

## Interaction pattern
Toggle criterion explanations, expand rationale per option, and copy ADR/Lore-style decision summary.

## Accessibility notes
Keep scoring readable in a table, label weights clearly, and avoid color-only winner/loser cues.

## Minimal HTML skeleton

```html
<section id="options" aria-labelledby="options-title">
  <h2 id="options-title">Options</h2>
  <div class="summary-grid">
    <article class="card"><h3 class="card-title">A — Managed queue</h3><p>Pros, cons, neutral summary.</p></article>
    <article class="card"><h3 class="card-title">B — Self-hosted broker</h3><p>Pros, cons, neutral summary.</p></article>
  </div>
</section>
<section id="matrix" aria-labelledby="matrix-title">
  <h2 id="matrix-title">Score matrix</h2>
  <div class="table-wrap">
    <table>
      <caption>Weighted scores (1–5). Recommendation is labeled in the Notes column, not by color.</caption>
      <thead><tr><th>Criterion</th><th>Weight</th><th>A</th><th>B</th><th>Notes</th></tr></thead>
      <tbody><tr><td>Latency</td><td>30%</td><td>4</td><td>3</td><td>A wins on cold start.</td></tr></tbody>
    </table>
  </div>
</section>
```
