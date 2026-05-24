# Component Specimen Sheet

## Use when
Design tokens, UI component states, visual QA, accessibility checks, and do/don't examples.

## Do not use when
The work is backend-only or there is no visual/component surface.

## Information architecture
- Token palette.
- Type scale.
- Spacing and elevation samples.
- Component state matrix.
- Accessibility checklist.
- Do/don't examples.

## Visual direction
Specimen sheet with swatch grids, state matrices, neutral background, and exact token/code copy blocks.

## Core components
Swatches, type scale, state matrix, contrast notes, and CSS-variable copy blocks.

## Interaction pattern
Copy tokens, toggle density/theme/state, and show contrast/focus notes.

## Accessibility notes
Label swatches with names and values, include contrast notes, and demonstrate focus and disabled states.

## Minimal HTML skeleton

```html
<section id="tokens" aria-labelledby="tokens-title">
  <h2 id="tokens-title">Color tokens</h2>
  <div class="summary-grid">
    <article class="card">
      <div style="height:3rem;background:#4f46e5;border-radius:.5rem" aria-hidden="true"></div>
      <p><strong>--accent</strong> <code>#4f46e5</code></p>
      <p>Contrast on white: 7.1 : 1 (AAA).</p>
    </article>
  </div>
</section>
<section id="states" aria-labelledby="states-title">
  <h2 id="states-title">Button states</h2>
  <div class="summary-grid">
    <article class="card"><button type="button">Default</button></article>
    <article class="card"><button type="button" aria-pressed="true">Active</button></article>
    <article class="card"><button type="button" disabled>Disabled</button></article>
  </div>
</section>
```
