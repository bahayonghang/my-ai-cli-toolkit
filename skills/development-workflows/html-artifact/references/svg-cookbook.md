# SVG Cookbook

Inline SVG patterns for offline HTML artifacts: icons, decorations, spot illustrations, and hero background motifs. All examples use `currentColor` and `var(--*)` tokens so theme and mode switches propagate automatically. For flowcharts, swimlanes, and architecture diagrams, see `diagram-cookbook.md`.

## Universal constraints

- Always include `viewBox`. Width and height attributes are optional inside HTML but help avoid layout jank before CSS loads.
- Inline SVG does **not** require `xmlns="http://www.w3.org/2000/svg"`, but adding it is harmless and lets the SVG also work when copied into standalone `.svg` files.
- Strip generator metadata, comments, `id` attributes that are not referenced, and unused `<defs>`. Run Figma/Illustrator exports through an optimizer (svgo / svgomg) before pasting; expect a 50–70% reduction.
- `fill` and `stroke` default to `currentColor`. Multi-tone work uses one `currentColor` plus `fill-opacity` steps (e.g. 0.15, 0.4, 1) so the entire illustration tracks a single token.
- For decorative illustrations the SVG should be `aria-hidden="true" focusable="false"` and any accessible name comes from the surrounding text.
- For informative illustrations, add `role="img"` and link `<title>` (and optionally `<desc>`) via `aria-labelledby` on the `<svg>`.
- Strokes that should keep a consistent visual weight at any size use `vector-effect="non-scaling-stroke"`.
- Keep paths and shapes inside `viewBox` bounds; do not rely on overflow.
- Avoid embedding raster images (`<image>`) — they bloat the file and bypass the offline-asset boundary.

```html
<svg viewBox="0 0 24 24" role="img" aria-labelledby="t-1 d-1">
  <title id="t-1">Short, screen-reader-friendly summary</title>
  <desc id="d-1">
    Optional longer explanation when shape alone is not enough.
  </desc>
  <!-- shapes -->
</svg>
```

## Recipe — Icon set (24×24)

A consistent 24×24 icon grid with 1.5 px stroke. Drop these into buttons, status pills, table cells, or table-of-contents links. All icons inherit color from text.

```html
<style>
  .icon {
    width: var(--icon-size-md);
    height: var(--icon-size-md);
    flex: 0 0 auto;
    vertical-align: -0.15em;
  }
  .icon[data-size="sm"] {
    width: var(--icon-size-sm);
    height: var(--icon-size-sm);
  }
  .icon[data-size="lg"] {
    width: var(--icon-size-lg);
    height: var(--icon-size-lg);
  }
</style>

<!-- Each icon: viewBox=0 0 24 24, stroke=currentColor, stroke-width=1.5, fill=none -->

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- check -->
  <path d="m4.5 12.5 5 5 10-11" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- cross -->
  <path d="m6 6 12 12M18 6 6 18" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- warning -->
  <path d="M12 3 2.5 20h19L12 3Z" />
  <path d="M12 10v5" />
  <circle cx="12" cy="17.5" r=".5" fill="currentColor" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- info -->
  <circle cx="12" cy="12" r="9" />
  <path d="M12 11v6" />
  <circle cx="12" cy="8" r=".5" fill="currentColor" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- arrow-right -->
  <path d="M4 12h15M13 6l6 6-6 6" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- arrow-down -->
  <path d="M12 4v15M6 13l6 6 6-6" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- chevron -->
  <path d="m9 6 6 6-6 6" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- external-link -->
  <path d="M13 5h6v6" />
  <path d="M19 5 10 14" />
  <path d="M19 14v5H5V5h5" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- clipboard -->
  <rect x="6" y="4" width="12" height="17" rx="2" />
  <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
  <path d="M9 10h6M9 14h6M9 18h4" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- clock -->
  <circle cx="12" cy="12" r="9" />
  <path d="M12 7v5l3 2" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- shield -->
  <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Z" />
</svg>

<svg
  class="icon"
  aria-hidden="true"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  stroke-width="1.5"
  stroke-linecap="round"
  stroke-linejoin="round"
>
  <!-- spark -->
  <path
    d="M12 4v4M12 16v4M4 12h4M16 12h4M6.5 6.5l2.5 2.5M15 15l2.5 2.5M6.5 17.5 9 15M15 9l2.5-2.5"
  />
</svg>
```

When the icon sits next to text and the text already explains the action ("Copy summary"), `aria-hidden="true"` on the SVG is correct. When the icon stands alone (icon-only button), give the `<button>` an accessible name via `aria-label="Copy summary"` instead.

## Recipe — Decorative motifs

Five small SVG decorations that warm up otherwise plain layouts. All decorations are `aria-hidden="true"`.

```html
<!-- underline-wiggle: handwritten emphasis under a heading -->
<h2 style="position:relative;display:inline-block;">
  Memorable headline
  <svg
    aria-hidden="true"
    viewBox="0 0 200 12"
    preserveAspectRatio="none"
    style="position:absolute;left:0;right:0;bottom:-.35em;width:100%;height:.4em;color:var(--accent);"
  >
    <path
      d="M2 8 Q 50 0 100 6 T 198 4"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
      vector-effect="non-scaling-stroke"
    />
  </svg>
</h2>

<!-- corner-frame: brackets around a featured card -->
<article class="card featured" style="position:relative;">
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    style="position:absolute;top:-6px;left:-6px;width:1.5rem;height:1.5rem;color:var(--accent);"
  >
    <path d="M2 14V2h12" fill="none" stroke="currentColor" stroke-width="2.5" />
  </svg>
  <svg
    aria-hidden="true"
    viewBox="0 0 32 32"
    style="position:absolute;bottom:-6px;right:-6px;width:1.5rem;height:1.5rem;color:var(--accent);transform:rotate(180deg);"
  >
    <path d="M2 14V2h12" fill="none" stroke="currentColor" stroke-width="2.5" />
  </svg>
  <h3 class="card-title">Highlighted card</h3>
</article>

<!-- divider-dotted: section separator that reads as a breath, not a hard rule -->
<svg
  aria-hidden="true"
  viewBox="0 0 120 2"
  preserveAspectRatio="none"
  style="display:block;margin:var(--space-8) auto;width:8rem;height:.5rem;color:var(--text-muted);"
>
  <line
    x1="0"
    y1="1"
    x2="120"
    y2="1"
    stroke="currentColor"
    stroke-width="1.5"
    stroke-linecap="round"
    stroke-dasharray="1 6"
  />
</svg>

<!-- bracket-pair: emphasis around inline phrase -->
<p>
  The recommendation is
  <span style="position:relative;padding:0 .35em;">
    <svg
      aria-hidden="true"
      viewBox="0 0 6 24"
      style="position:absolute;left:0;top:0;height:100%;width:.35em;color:var(--accent);"
    >
      <path
        d="M5 1H1v22h4"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg>
    Option A
    <svg
      aria-hidden="true"
      viewBox="0 0 6 24"
      style="position:absolute;right:0;top:0;height:100%;width:.35em;color:var(--accent);"
    >
      <path
        d="M1 1h4v22H1"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      />
    </svg> </span
  >.
</p>

<!-- hero-grid-bg: decorative grid that fades toward the bottom -->
<header class="hero" style="position:relative;overflow:hidden;">
  <svg
    aria-hidden="true"
    viewBox="0 0 600 300"
    preserveAspectRatio="none"
    style="position:absolute;inset:0;width:100%;height:100%;color:var(--accent);opacity:.18;
              mask-image:linear-gradient(to bottom, black, transparent 80%);"
  >
    <defs>
      <pattern
        id="grid-bg"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M40 0H0V40"
          fill="none"
          stroke="currentColor"
          stroke-width="1"
        />
      </pattern>
    </defs>
    <rect width="600" height="300" fill="url(#grid-bg)" />
  </svg>
  <!-- hero copy on top -->
</header>
```

Place `id` attributes inside SVG `<defs>` (e.g. `id="grid-bg"`) carefully — they are global to the document. Prefix them with a section identifier when an artifact has multiple SVGs.

## Recipe — Spot illustrations

Three single-color spot illustrations using `currentColor` plus `fill-opacity` for tonal depth. Pair each with a heading and explanatory copy; the SVG itself stays `aria-hidden="true"`.

```html
<!-- Empty state -->
<div class="empty-state" style="text-align:center; color:var(--text-muted);">
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 240 180"
    style="width:14rem;height:auto;color:var(--accent);"
  >
    <!-- background plane -->
    <rect
      x="20"
      y="40"
      width="200"
      height="120"
      rx="10"
      fill="currentColor"
      fill-opacity=".1"
    />
    <!-- floating "card" stack -->
    <rect
      x="40"
      y="60"
      width="160"
      height="20"
      rx="4"
      fill="currentColor"
      fill-opacity=".25"
    />
    <rect
      x="40"
      y="90"
      width="120"
      height="14"
      rx="4"
      fill="currentColor"
      fill-opacity=".18"
    />
    <rect
      x="40"
      y="112"
      width="140"
      height="14"
      rx="4"
      fill="currentColor"
      fill-opacity=".18"
    />
    <!-- magnifying glass -->
    <circle
      cx="172"
      cy="118"
      r="22"
      fill="none"
      stroke="currentColor"
      stroke-width="3"
    />
    <path
      d="m188 134 14 14"
      stroke="currentColor"
      stroke-width="3"
      stroke-linecap="round"
    />
  </svg>
  <h3>No results yet</h3>
  <p>Once a finding lands here, it stays for the rest of the review.</p>
</div>

<!-- Error / blocked -->
<div class="empty-state" style="text-align:center; color:var(--text-muted);">
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 240 180"
    style="width:14rem;height:auto;color:var(--danger);"
  >
    <circle cx="120" cy="90" r="60" fill="currentColor" fill-opacity=".12" />
    <circle
      cx="120"
      cy="90"
      r="40"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
    />
    <path
      d="M95 65l50 50M145 65l-50 50"
      stroke="currentColor"
      stroke-width="4"
      stroke-linecap="round"
    />
  </svg>
  <h3>Something failed to load</h3>
  <p>Try the validator again, or open the file in a new tab.</p>
</div>

<!-- Done / shipped -->
<div class="empty-state" style="text-align:center; color:var(--text-muted);">
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox="0 0 240 180"
    style="width:14rem;height:auto;color:var(--success);"
  >
    <path
      d="M120 30c33 0 60 27 60 60s-27 60-60 60-60-27-60-60 27-60 60-60z"
      fill="currentColor"
      fill-opacity=".12"
    />
    <path
      d="M120 30c33 0 60 27 60 60s-27 60-60 60-60-27-60-60 27-60 60-60z"
      fill="none"
      stroke="currentColor"
      stroke-width="4"
      stroke-dasharray="3 6"
      stroke-linecap="round"
    />
    <path
      d="m92 92 22 22 38-44"
      fill="none"
      stroke="currentColor"
      stroke-width="6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
  <h3>All checks passed</h3>
  <p>
    Ready to hand off; reviewers can read top-to-bottom without action items.
  </p>
</div>
```

For larger or more detailed illustrations (over ~5 KB inline), prefer two or three reusable shapes plus copy over an artwork-heavy hero. The cost of inlining a 30 KB Figma export every artifact compounds quickly.

## Quick checklist before pasting an SVG

- [ ] `viewBox` present; `width` / `height` removed or set as CSS.
- [ ] Filled / stroked with `currentColor` or `var(--*)` (no hard-coded hex unless it is a chart token).
- [ ] Metadata (`<metadata>`, generator comments, Figma layer ids) stripped.
- [ ] `aria-hidden="true"` if decorative; `role="img"` + `<title>` if informative.
- [ ] Decorative gradients fade gracefully under `prefers-reduced-motion` and print modes (mostly automatic when colors come from tokens).
