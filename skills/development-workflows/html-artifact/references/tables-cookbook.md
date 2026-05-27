# Tables Cookbook

Eight recipes for scannable, accessible, offline data tables. All recipes assume the starter-template tokens and table CSS (`th[aria-sort]`, `col--num`, `cell--bar`, `cell--trend`, `cell--heat`, `cell--diff-*`, `table--matrix`, `table--evidence`, `table--decision`, `key-row`, `is-recommended`, `verdict-column`, `evidence-column`).

When picking a recipe, lead with the reader's job:

- Comparing options → **Decision matrix** or **Comparison**.
- Following claims back to evidence → **Evidence table**.
- Triaging open work → **Risk register** or **Status / action items**.
- Spotting movement → **Trend table** (sparkline + arrow).
- Reading distribution → **Heatmap**.
- Confirming totals → **Summary with tfoot**.
- Showing nothing yet → **Empty state**.

## Universal rules

- Every table has a `<caption>` summarising what the table proves, not just what it contains.
- Numeric, currency, date, and percentage columns get `col--num` (right alignment) and inherit `font-variant-numeric: tabular-nums` from the base style.
- Headers that label a row use `<th scope="row">`; column headers use `<th scope="col">`.
- Sticky `<th>` is on by default; the global rule disables it at ≤ 1024 px so zoom and reflow stay usable (WCAG 1.4.10).
- Color never carries meaning alone. Pair `cell--diff-add` with a leading `+`, `cell--trend[data-dir="up"]` with `↑`, `cell--heat` with the actual number, `is-recommended` with the word "Recommended" in the header.
- Long IDs, file paths, or prose inside a cell wrap with the base `overflow-wrap: anywhere`; if a cell exceeds two lines, prefer a `<details>` inside the cell over widening the column.

## Recipe 1 — Decision matrix

Use when comparing 2–4 options across ≥ 3 weighted criteria. Place 2–3 conclusion cards above the matrix so the recommendation is visible before any score is read.

```html
<div class="table-wrap">
  <table class="table--matrix">
    <caption>
      Queue technology comparison. Option A wins on latency and ownership;
      revisit if our managed-cloud spend exceeds X.
    </caption>
    <thead>
      <tr>
        <th scope="col">Criterion</th>
        <th scope="col" aria-sort="none" class="col--num">Weight</th>
        <th scope="col" class="is-recommended">Option A · Recommended</th>
        <th scope="col">Option B</th>
        <th scope="col" class="evidence-column">Evidence</th>
        <th scope="col" class="verdict-column">Verdict</th>
      </tr>
    </thead>
    <tbody>
      <tr class="key-row">
        <th scope="row">P95 latency</th>
        <td class="cell--bar col--num" style="--bar: 35">35%</td>
        <td class="is-recommended">
          <span class="status-pill success">120 ms</span>
        </td>
        <td>210 ms</td>
        <td class="evidence-column">
          Bench harness <code>bench/queue-2026Q1</code>, 30 min p95.
        </td>
        <td class="verdict-column cell--trend" data-dir="up">A leads</td>
      </tr>
    </tbody>
  </table>
</div>
```

Why it works: the weighted column uses `cell--bar` so importance is pre-attentive; the verdict column uses `cell--trend` arrows in addition to the verdict text; `is-recommended` highlights the column without removing the word "Recommended" from the header.

## Recipe 2 — Evidence table

Use when readers must trace each claim back to a citable source.

```html
<table class="table--evidence">
  <caption>
    Sources backing the queue benchmark. Confidence and date are explicit so
    stale or weak sources can be challenged.
  </caption>
  <thead>
    <tr>
      <th scope="col">Source</th>
      <th scope="col">Type</th>
      <th scope="col" class="col--num">Date</th>
      <th scope="col">Confidence</th>
      <th scope="col" class="evidence-column">Used for</th>
    </tr>
  </thead>
  <tbody>
    <tr class="key-row">
      <th scope="row">RFC 9114</th>
      <td>spec</td>
      <td class="col--num">2022-06</td>
      <td><span class="status-pill success">High</span></td>
      <td class="evidence-column">
        HTTP/3 framing assumptions in latency model.
      </td>
    </tr>
    <tr>
      <th scope="row">Internal bench 2026-04</th>
      <td>experiment</td>
      <td class="col--num">2026-04-09</td>
      <td><span class="status-pill warning">Medium</span></td>
      <td class="evidence-column">
        Single-region reproducibility; not yet cross-region.
      </td>
    </tr>
  </tbody>
</table>
```

Mark the load-bearing source with `key-row`. Keep the confidence column as a `status-pill` so the icon and the text travel together.

## Recipe 3 — Risk register

Use in strategy blueprints, migration plans, and incident postmortems.

```html
<table class="table--decision">
  <caption>
    Migration risks. Status pills carry text labels; trigger column names the
    signal that would force action.
  </caption>
  <thead>
    <tr>
      <th scope="col">Risk</th>
      <th scope="col">Probability</th>
      <th scope="col">Impact</th>
      <th scope="col" class="evidence-column">Mitigation</th>
      <th scope="col" class="verdict-column">Trigger</th>
    </tr>
  </thead>
  <tbody>
    <tr class="key-row">
      <th scope="row">Schema drift between services</th>
      <td><span class="status-pill warning">Medium</span></td>
      <td><span class="status-pill danger">High</span></td>
      <td class="evidence-column">Snapshot tests + JSON-schema CI gate.</td>
      <td class="verdict-column">Any consumer red on <code>main</code>.</td>
    </tr>
  </tbody>
</table>
```

Sort rows by impact × probability before publishing. Highlight the row(s) above the action threshold with `key-row`.

## Recipe 4 — Comparison table (qualitative)

Use when criteria are not numeric and weights would feel false.

```html
<table>
  <caption>
    Vendor support comparison. Each cell is a single qualifier; the verdict
    column converts the row into a one-word decision.
  </caption>
  <thead>
    <tr>
      <th scope="col">Capability</th>
      <th scope="col">Acme</th>
      <th scope="col">Globex</th>
      <th scope="col" class="verdict-column">Verdict</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">SAML SSO</th>
      <td class="cell--diff-add">Native</td>
      <td class="cell--diff-del">Roadmap</td>
      <td class="verdict-column">Acme</td>
    </tr>
    <tr>
      <th scope="row">EU residency</th>
      <td>Yes (Frankfurt)</td>
      <td>Yes (Dublin)</td>
      <td class="verdict-column">Tie</td>
    </tr>
    <tr>
      <th scope="row">Per-seat price</th>
      <td class="col--num">$12</td>
      <td class="col--num">$9</td>
      <td class="verdict-column">Globex</td>
    </tr>
  </tbody>
</table>
```

`cell--diff-add` / `cell--diff-del` carry their own `+` / `−` glyphs, so readers do not depend on the green/red hue alone.

## Recipe 5 — Trend table with inline sparkline

Use when each row has a single metric and a series — e.g. weekly status, per-service SLO, KPI dashboard.

```html
<table>
  <caption>
    P95 latency per service over the last six sprints. Sparkline + arrow + final
    value give three independent ways to read the trend.
  </caption>
  <thead>
    <tr>
      <th scope="col">Service</th>
      <th scope="col" class="col--num">Now (ms)</th>
      <th scope="col" class="col--num">Δ vs 6 sprints ago</th>
      <th scope="col">Trend</th>
      <th scope="col">Last 6 sprints</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">checkout-api</th>
      <td class="col--num">182</td>
      <td class="cell--trend col--num" data-dir="down">−24</td>
      <td><span class="status-pill success">Improving</span></td>
      <td>
        <svg
          viewBox="0 0 100 24"
          width="120"
          height="28"
          role="img"
          aria-label="Trend from 206 to 182"
        >
          <polyline
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            points="0,6 20,8 40,12 60,10 80,16 100,18"
          />
          <circle cx="100" cy="18" r="2.5" fill="currentColor" />
        </svg>
      </td>
    </tr>
  </tbody>
</table>
```

The SVG uses `currentColor`, so the sparkline picks up the surrounding row tint without a hard-coded hex. Provide a text equivalent in `aria-label` describing the start and end values.

## Recipe 6 — Heatmap table

Use when the matrix is rows × columns of one continuous metric — defect density, A/B impact, latency by region × hour.

```html
<table>
  <caption>
    Defects per KLOC by service × release. Darker fills are higher density;
    numbers are always visible for screen readers and copy-paste.
  </caption>
  <thead>
    <tr>
      <th scope="col">Service</th>
      <th scope="col" class="col--num">v3.1</th>
      <th scope="col" class="col--num">v3.2</th>
      <th scope="col" class="col--num">v3.3</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">checkout-api</th>
      <td class="cell--heat" style="--heat: 35">3.5</td>
      <td class="cell--heat" style="--heat: 18">1.8</td>
      <td class="cell--heat" style="--heat: 9">0.9</td>
    </tr>
    <tr>
      <th scope="row">payments-worker</th>
      <td class="cell--heat" style="--heat: 60">6.0</td>
      <td class="cell--heat" style="--heat: 42">4.2</td>
      <td class="cell--heat" style="--heat: 28">2.8</td>
    </tr>
  </tbody>
</table>
```

`--heat` is 0–100. `cell--heat` paints the sequential token at the right intensity; the literal number sits on top, so the table is also legible when printed in monochrome.

## Recipe 7 — Summary with totals (tfoot)

Use when the headline number is a sum, weighted average, or percent of total. `tfoot` is the right place semantically.

```html
<table>
  <caption>
    Sprint allocation by workstream. Total hours and percent of capacity are
    computed in the footer.
  </caption>
  <thead>
    <tr>
      <th scope="col">Workstream</th>
      <th scope="col" class="col--num">Hours</th>
      <th scope="col" class="col--num">% of capacity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Feature work</th>
      <td class="col--num">112</td>
      <td class="cell--bar col--num" style="--bar: 56">56%</td>
    </tr>
    <tr>
      <th scope="row">Reliability</th>
      <td class="col--num">48</td>
      <td class="cell--bar col--num" style="--bar: 24">24%</td>
    </tr>
    <tr>
      <th scope="row">On-call & toil</th>
      <td class="col--num">40</td>
      <td class="cell--bar col--num" style="--bar: 20">20%</td>
    </tr>
  </tbody>
  <tfoot>
    <tr class="key-row">
      <th scope="row">Total</th>
      <td class="col--num">200</td>
      <td class="col--num">100%</td>
    </tr>
  </tfoot>
</table>
```

If the table is sortable in JS later, sort logic should ignore `tfoot` rows.

## Recipe 8 — Empty state

Use as a fallback whenever the data set might be empty (filtered query, fresh project, error path).

```html
<table>
  <caption>
    Open blockers. None right now — the empty row explains how new items appear
    here.
  </caption>
  <thead>
    <tr>
      <th scope="col">Blocker</th>
      <th scope="col">Owner</th>
      <th scope="col">Severity</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="3">
        <p style="margin:0;color:var(--text-muted);text-align:center;">
          <strong>No blockers logged.</strong> New blockers appear here once
          they are tagged in the tracker; refresh after triage.
        </p>
      </td>
    </tr>
  </tbody>
</table>
```

Keep the empty row inside `<tbody>` so the row count is still 1, not 0; this avoids confusing assistive tech that announces "table with 0 rows" before the explanation.

## Responsive strategy decision tree

| Column count | Strategy                                    | How                                                                                                                                                                                                                                         |
| ------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ≤ 5          | **Stack to cards** below 720 px             | Use the base media query; the starter template already converts grid-heavy layouts and dense tables. For a fully card-stacked table, render each row as a small `<dl>` inside the same `<section>` and hide the `<table>` at narrow widths. |
| 6 – 10       | **Priority columns**                        | Tag `<th>` and `<td>` with `data-priority="1"` (always) / `"2"` (hide < 1200 px) / `"3"` (hide < 980 px). Pair with a "Show all columns" toggle button when hiding ≥ 1 priority-2 column.                                                   |
| > 10         | **Horizontal scroll + sticky first column** | Keep `table-wrap { overflow-x: auto }` (already in starter). Add `tbody th[scope="row"], thead th:first-child { position: sticky; left: 0; background: var(--surface-muted); z-index: 1 }` so the row label stays visible while scrolling.  |

Priority-column CSS:

```css
@media (max-width: 1200px) {
  [data-priority="2"] {
    display: none;
  }
}
@media (max-width: 980px) {
  [data-priority="3"] {
    display: none;
  }
}
```

Always pair priority-column hiding with a visible affordance (toggle, badge, or note in the caption) so readers know columns are hidden, not missing.

## Non-decorative emphasis

When the visual cell modifiers are not enough:

- Wrap the load-bearing value in `<mark>` for term-level highlight. `<mark>` has built-in semantics; do not redefine the background unless the theme makes it unreadable.
- For long-form cells, embed a native disclosure: `<details><summary>Show rationale</summary><p>...</p></details>` keeps the row scannable while keeping the prose discoverable.
- For status that is also a link (e.g., to the bug or the dashboard), wrap the status pill in `<a>`; the pill keeps its colors via `currentColor` so theming still works.
- For row-level alerts, add a leading column with a single-character icon (`!`, `⏸`, `✓`) plus a `<th scope="row">` label, so the row reads naturally even when row colors are stripped.
