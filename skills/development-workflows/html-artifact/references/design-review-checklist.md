# Design Review Checklist

Use this manual checklist for high-information-density HTML artifacts after the structural validator passes. It is intentionally qualitative; keep `check_html_artifact.py` focused on objective offline, semantic, and accessibility checks.

## Viewports

Review at least these widths when practical:

- Desktop: 1440 px and 1280 px
- Tablet: 768 px
- Mobile: 390 px

## Composition

- Hero has a clear focal point: split thesis board, meta cluster, diagram, evidence rail, or compact bounded width.
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
- Color is never the only winner/loser/severity cue.

## Diagrams

- Roadmaps, architecture, dependencies, and relationship-heavy sections use inline SVG or structured HTML lanes before detailed prose.
- Each `figure.diagram-frame` has a `figcaption` and a nearby text equivalent list/table.
- The diagram is more intuitive than a stack of cards would be; if not, simplify it or use a table.
- Raw Mermaid text is not the primary visual expression in the final artifact.

## Offline and accessibility sanity

- The artifact still has no remote fonts, scripts, images, stylesheets, telemetry, or network APIs.
- Keyboard focus is visible and controls are native where possible.
- Reduced-motion mode does not hide essential information.
