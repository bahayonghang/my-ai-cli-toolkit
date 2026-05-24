# Narrative Deck

## Use when
Browser mini decks, meeting readouts, milestone presentations, decision walkthroughs, and design review narratives.

## Do not use when
A dense reference document with heavy tables and long-form text is needed.

## Information architecture
- One section per slide or argument.
- Opening thesis.
- Evidence slides.
- Decision or ask.
- Speaker notes in `details` blocks.
- Appendix for supporting detail.

## Visual direction
Fullscreen panels, large typography, high contrast, generous whitespace, print pagination, and minimal motion.

## Core components
Slide sections, progress indicator, speaker notes, appendix cards, and print styles.

## Interaction pattern
Arrow-key navigation, toggle notes, and print/export hint.

## Accessibility notes
Keep DOM order linear, make keyboard navigation optional, and ensure the artifact is readable without JavaScript.

## Minimal HTML skeleton

```html
<section class="slide" id="slide-1" aria-labelledby="slide-1-title">
  <p class="eyebrow">1 / 6 — Thesis</p>
  <h2 id="slide-1-title">One-sentence argument</h2>
  <p class="lede">Restate the decision the audience is being asked to make.</p>
  <details><summary>Speaker notes</summary><p>Talking beats: framing, contrast, one data point.</p></details>
</section>
<section class="slide" id="slide-2" aria-labelledby="slide-2-title">
  <p class="eyebrow">2 / 6 — Evidence</p>
  <h2 id="slide-2-title">Why this matters</h2>
  <ul><li>Data point or quote (cite source).</li></ul>
</section>
```
