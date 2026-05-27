# Design Review Checklist

Use this manual checklist for high-information-density HTML artifacts after the structural validator passes. It is intentionally qualitative; keep `check_html_artifact.py` focused on objective offline, semantic, and accessibility checks.

## Viewports

Review at least these widths when practical:

- Wide desktop: 1920 px
- Desktop: 1440 px and 1280 px
- Tablet: 768 px
- Mobile: 390 px

## Modes

Re-review key sections under every mode the artifact will ship to:

- Light mode (default).
- Dark mode (`prefers-color-scheme: dark` or `data-mode="dark"`). Surfaces, accents, and state-color soft backgrounds must remain ≥ 4.5:1 against text and ≥ 3:1 against borders.
- High contrast (`prefers-contrast: more`). Borders should darken; decorative gradients should retreat.
- Print preview. Verify the page paginates, drops decorative overlays/TOC/buttons, and keeps tables, diagrams, and recommendations on contiguous pages.

## Composition

- Hero has a clear focal point: split thesis board, meta cluster, diagram, evidence rail, or compact bounded width.
- The outer shell meaningfully occupies desktop width; if the page includes a TOC, sidebar, thesis rail, or dense comparison area, it should not sit inside an arbitrary ~1100–1300 px cap unless that compactness is intentional.
- There is no large meaningless blank area caused by an over-wide full-width hero or over-narrow title block.
- The first screen communicates audience, purpose, and current recommendation/status.
- The page has one memorable visual motif rather than generic centered title + pills + uniform cards.

## Finite cards and overflow

- Known 5-card sections use 3+2 desktop composition; known 7-card sections use 4+3.
- Cards have primary/secondary/supporting weight; not every card competes equally.
- Long Chinese, English identifiers, file paths, and code chips wrap without pushing cards wider than their grid.
- Grid children have `min-width: 0` or an equivalent overflow-safe rule.

## Tables

- Dense tables are preceded by two or three conclusion cards when the reader needs a recommendation first.
- Recommended columns, verdict columns, evidence columns, or key rows are visually discoverable and labeled in text.
- Captions summarize what the table proves, not merely what it contains.
- Numeric columns use `tabular-nums` and right alignment; date columns use consistent format and width.
- Sticky `<th>` is on for tables longer than one viewport; sticky is disabled at ≤ 1024 px so zoom and reflow stay usable.
- In-cell emphasis is reserved for the metric being compared: `cell--bar` for share of weight, `cell--trend` for direction, `cell--heat` for severity intensity, `cell--diff-*` for additions/deletions. Each emphasis is paired with a text label (`+`, `↑`, percent number) so meaning is never color-only.
- Color is never the only winner/loser/severity cue.

## Diagrams and SVG

- Roadmaps, architecture, dependencies, and relationship-heavy sections use inline SVG or structured HTML lanes before detailed prose.
- Each `figure.diagram-frame` has a `figcaption` and a nearby text equivalent list/table.
- SVG `fill` and `stroke` reference `currentColor` or `var(--*)` tokens; theme/mode switches change diagram colors automatically.
- Decorative SVG is `aria-hidden="true"`; informative SVG carries `role="img"` plus `<title>` and `<desc>` linked via `aria-labelledby`.
- The diagram is more intuitive than a stack of cards would be; if not, simplify it or use a table.
- Raw Mermaid text is not the primary visual expression in the final artifact.

## Charts

- Each chart includes title, units on axes, a legend (if multiple series), and a source/context line.
- Chart colors come from `--chart-*` (categorical), `--seq-*` (sequential), or `--div-*` (diverging) tokens — not ad-hoc hex.
- Categorical series count stays ≤ 8 so the Okabe-Ito palette remains distinguishable; for ordered or continuous data, switch to sequential/diverging.
- A `<details><summary>View data</summary><table>...</table></details>` block accompanies every chart so readers can recover exact values.
- Trends use direct labels, arrow glyphs, or annotation text — not color alone.

## Interactive controls

- Native controls (`<details>`, `<dialog>`, `<input type="search">`, `<button>`) are preferred; ARIA is added only where native semantics fall short.
- Every interaction is keyboard-reachable with visible `:focus-visible`. Filter chips expose `aria-pressed`; sortable headers expose `aria-sort`; tablists follow APG roving-tabindex.
- Without JS, all content is still present (no "JS required" blanks). JS adds enhancement, not access.
- Toggleable state (theme switch, accordion open/close) persists in `localStorage` only when explicitly useful; never write to the network.

## Offline and accessibility sanity

- The artifact still has no remote fonts, scripts, images, stylesheets, telemetry, or network APIs.
- Keyboard focus is visible and controls are native where possible.
- Reduced-motion mode does not hide essential information.
