# Status Brief

## Use when

Weekly reports, project status, milestone readiness, release reports, QA summaries, and stakeholder updates.

## Do not use when

Deep incident root-cause analysis or source-heavy research is needed.

## Information architecture

- Overall status.
- Shipped, slipped, and blocked work.
- Key metrics cards.
- Timeline since last update.
- Risks and asks.
- Next milestone plan.

## Visual direction

Compact dashboard with calm colors, dense but readable cards, visible dates, and non-color-only status labels.

## Core components

Metric cards, status lanes, timeline, risk table, and asks panel. For tables, see `tables-cookbook.md` — recipe 3 (risk register) for risks/asks, recipe 5 (trend with sparkline) for per-service or per-workstream metrics, recipe 7 (summary with `tfoot`) for capacity / spend / coverage totals, recipe 6 (heatmap) when reporting incidents or defects across services × weeks.

For charts, see `charts-cookbook.md` — every metric card should pair a single number with either recipe 3 (sparkline) showing trend, recipe 6 (bullet) showing actual-vs-target, or recipe 8 (stacked progress) showing composition. Reserve recipe 1 (vertical bar) for comparison across ≥ 3 services, and recipe 4 (donut) for SLO/coverage progress.

## Interaction pattern

Filter blocked items, copy Slack/Markdown update, and keep print mode readable.

## Accessibility notes

Explain every metric unit and avoid unexplained red/yellow/green indicators.

## Minimal HTML skeleton

```html
<section id="metrics" aria-labelledby="metrics-title">
  <h2 id="metrics-title">Metrics</h2>
  <div class="summary-grid">
    <article class="card">
      <h3 class="card-title">P95 latency (ms)</h3>
      <p>184 <span class="status-pill success">Under 250 target</span></p>
    </article>
    <article class="card">
      <h3 class="card-title">Error rate (%)</h3>
      <p>0.42 <span class="status-pill warning">Above 0.30 target</span></p>
    </article>
  </div>
</section>
<section id="lanes" aria-labelledby="lanes-title">
  <h2 id="lanes-title">Shipped / slipped / blocked</h2>
  <div class="summary-grid">
    <article class="card">
      <h3 class="card-title">Shipped</h3>
      <ul>
        <li>Feature X (2026-05-19)</li>
      </ul>
    </article>
    <article class="card">
      <h3 class="card-title">Slipped</h3>
      <ul>
        <li>Migration Y, new ETA 2026-06-02</li>
      </ul>
    </article>
    <article class="card">
      <h3 class="card-title">Blocked</h3>
      <ul>
        <li>Audit Z <span class="status-pill danger">External</span></li>
      </ul>
    </article>
  </div>
</section>
```
