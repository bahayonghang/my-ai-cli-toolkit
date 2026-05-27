# Charts Cookbook

Eight chart recipes for HTML artifacts. All recipes are inline SVG or CSS-only — no chart library, no remote dependency. Colors come from `--chart-*` (categorical), `--seq-*` (sequential), and `--div-*` (diverging) tokens, so theme and mode switches propagate automatically.

## Decision tree — what chart for what data

- One variable, comparing categories or ranking → **bar** (vertical) or **horizontal bar**.
- One variable over time, in a small footprint → **sparkline** (often inside a table cell).
- Proportion of a whole, ≤ 5 segments → **donut / progress ring**.
- Proportion of a whole, > 5 segments → **stacked progress bar**.
- Two dimensions, dense grid of one continuous metric → **heatmap** (recipe 6 in `tables-cookbook.md`).
- Target vs actual, single metric per row → **bullet chart**.
- Many categories, single value each, no order → **dot plot**.
- Cumulative incremental change → **stacked progress** or **waterfall** (variation of stacked progress).

If a "chart" only has 1–3 numbers, prefer a sentence + status pill or a small `tabular-nums` row. Charts justify themselves when they reveal pattern, distribution, or change that text cannot.

## Universal accessibility constraints

- Pair every chart with a `<details><summary>View data table</summary>…</details>` block so screen readers and copy-paste workflows have authoritative numbers.
- Charts get `role="img"` plus a `<title>` (one-line summary) and `<desc>` (longer narrative), linked from `aria-labelledby` on the `<svg>`.
- Never encode meaning in color alone: add direct labels, patterns, arrows, or text annotations.
- Provide units on every axis label and in legends ("ms", "%", "USD", "events / s").
- For categorical charts, cap at 8 series. Beyond 8, switch to faceted small multiples or aggregate into "Other".
- Use `currentColor` for axis and grid lines so they fade into the surface; reserve `--chart-*` for the data marks.
- For data-rich charts, embed the source ("Source: bench harness 2026-04, n=2,000") under the figure caption.

## Recipe 1 — Vertical bar chart

Use for comparing a single metric across 2–8 categories.

```html
<style>
  .chart {
    display: block;
    width: 100%;
    height: auto;
    color: var(--text-muted);
    font: 600 12px var(--font-sans);
  }
  .chart .axis {
    stroke: currentColor;
    stroke-width: 1;
    opacity: 0.4;
  }
  .chart .grid {
    stroke: currentColor;
    stroke-width: 1;
    opacity: 0.15;
  }
  .chart .tick {
    fill: var(--text-muted);
  }
  .chart .bar {
    fill: var(--chart-5);
  }
  .chart .bar.is-highlight {
    fill: var(--chart-1);
  }
</style>

<figure class="diagram-frame">
  <svg
    class="chart"
    viewBox="0 0 480 240"
    role="img"
    aria-labelledby="c1-t c1-d"
  >
    <title id="c1-t">
      P95 latency by service, in milliseconds (lower is better).
    </title>
    <desc id="c1-d">
      Checkout API has the highest latency at 210 ms; the Auth service is the
      lowest at 90 ms.
    </desc>
    <!-- grid lines -->
    <line class="grid" x1="60" y1="40" x2="460" y2="40" />
    <line class="grid" x1="60" y1="100" x2="460" y2="100" />
    <line class="grid" x1="60" y1="160" x2="460" y2="160" />
    <!-- y-axis labels -->
    <text class="tick" x="55" y="44" text-anchor="end">300</text>
    <text class="tick" x="55" y="104" text-anchor="end">200</text>
    <text class="tick" x="55" y="164" text-anchor="end">100</text>
    <text class="tick" x="55" y="204" text-anchor="end">0</text>
    <!-- x axis -->
    <line class="axis" x1="60" y1="200" x2="460" y2="200" />
    <!-- bars (height = value × scale, scale 0.6 means 100 ms = 60 px) -->
    <g>
      <rect class="bar is-highlight" x="80" y="74" width="60" height="126" />
      <text
        class="tick"
        x="110"
        y="62"
        text-anchor="middle"
        font-weight="700"
        fill="var(--text)"
      >
        210
      </text>
      <text class="tick" x="110" y="220" text-anchor="middle">Checkout</text>
    </g>
    <g>
      <rect class="bar" x="170" y="116" width="60" height="84" />
      <text class="tick" x="200" y="108" text-anchor="middle">140</text>
      <text class="tick" x="200" y="220" text-anchor="middle">Orders</text>
    </g>
    <g>
      <rect class="bar" x="260" y="140" width="60" height="60" />
      <text class="tick" x="290" y="132" text-anchor="middle">100</text>
      <text class="tick" x="290" y="220" text-anchor="middle">Search</text>
    </g>
    <g>
      <rect class="bar" x="350" y="146" width="60" height="54" />
      <text class="tick" x="380" y="138" text-anchor="middle">90</text>
      <text class="tick" x="380" y="220" text-anchor="middle">Auth</text>
    </g>
  </svg>
  <figcaption>
    P95 latency by service · 2026-Q2 average. Checkout (highlighted) exceeds the
    200 ms SLO; all others are inside budget.
  </figcaption>
  <details>
    <summary>View data</summary>
    <table>
      <caption>
        P95 latency (ms)
      </caption>
      <thead>
        <tr>
          <th>Service</th>
          <th class="col--num">P95 (ms)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <th scope="row">Checkout</th>
          <td class="col--num">210</td>
        </tr>
        <tr>
          <th scope="row">Orders</th>
          <td class="col--num">140</td>
        </tr>
        <tr>
          <th scope="row">Search</th>
          <td class="col--num">100</td>
        </tr>
        <tr>
          <th scope="row">Auth</th>
          <td class="col--num">90</td>
        </tr>
      </tbody>
    </table>
  </details>
</figure>
```

The highlighted bar uses `--chart-1` to call out the one row that violates the SLO; all other bars stay in `--chart-5`. Direct value labels above each bar mean a reader does not have to map back to the axis.

## Recipe 2 — Horizontal bar (ranking)

Use when category labels are long (file paths, names with codes) or there are ≥ 6 categories — horizontal bars give text room to breathe.

```html
<style>
  .hbar {
    display: grid;
    grid-template-columns: 12rem 1fr 4rem;
    gap: var(--space-3);
    align-items: center;
  }
  .hbar-label {
    font-weight: 600;
  }
  .hbar-track {
    background: color-mix(in srgb, var(--surface-muted) 60%, transparent);
    border-radius: var(--radius-sm);
    height: 1.1rem;
    overflow: hidden;
  }
  .hbar-fill {
    background: var(--chart-5);
    height: 100%;
  }
  .hbar-fill.is-highlight {
    background: var(--chart-1);
  }
  .hbar-value {
    font-variant-numeric: tabular-nums;
    text-align: right;
    font-weight: 700;
  }
</style>

<figure class="diagram-frame">
  <div role="img" aria-labelledby="c2-t c2-d">
    <h3 id="c2-t" style="margin:0 0 var(--space-2);">Open PRs per service</h3>
    <p id="c2-d" style="color:var(--text-muted);margin:0 0 var(--space-3);">
      As of 2026-05-26. Checkout is the only service over the 30-PR ceiling.
    </p>
    <div class="hbar">
      <span class="hbar-label">checkout-api</span>
      <div class="hbar-track">
        <div class="hbar-fill is-highlight" style="width: 86%"></div>
      </div>
      <span class="hbar-value">43</span>
    </div>
    <div class="hbar">
      <span class="hbar-label">orders-service</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width: 52%"></div>
      </div>
      <span class="hbar-value">26</span>
    </div>
    <div class="hbar">
      <span class="hbar-label">search-indexer</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width: 40%"></div>
      </div>
      <span class="hbar-value">20</span>
    </div>
    <div class="hbar">
      <span class="hbar-label">auth-edge</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width: 24%"></div>
      </div>
      <span class="hbar-value">12</span>
    </div>
    <div class="hbar">
      <span class="hbar-label">notifications</span>
      <div class="hbar-track">
        <div class="hbar-fill" style="width: 10%"></div>
      </div>
      <span class="hbar-value">5</span>
    </div>
  </div>
  <figcaption>
    Sort rows from highest to lowest; the widest bar is the most urgent. Place
    the threshold (30 PRs) in the supporting text or as a vertical line if
    needed.
  </figcaption>
</figure>
```

This recipe is CSS-only (no SVG) because the data structure is one number per row. The bar widths can be set via inline `style` from a template engine without any JS.

## Recipe 3 — Sparkline (in-cell or in-line)

Use to show a tiny series next to a current value. The most common home is a table cell (see `tables-cookbook.md` recipe 5).

```html
<p>
  Checkout P95 over the last six sprints:
  <svg
    viewBox="0 0 100 28"
    width="140"
    height="32"
    role="img"
    aria-label="Trend from 220 ms (6 sprints ago) to 182 ms (current)"
    style="vertical-align: -.4em;"
  >
    <!-- baseline grid -->
    <line
      x1="0"
      y1="20"
      x2="100"
      y2="20"
      stroke="currentColor"
      stroke-width="1"
      opacity=".25"
    />
    <!-- area fill -->
    <path
      d="M0 8 L20 12 L40 16 L60 14 L80 18 L100 22 L100 28 L0 28 Z"
      fill="var(--chart-5)"
      fill-opacity=".15"
    />
    <!-- line -->
    <polyline
      fill="none"
      stroke="var(--chart-5)"
      stroke-width="2"
      points="0,8 20,12 40,16 60,14 80,18 100,22"
    />
    <!-- end marker -->
    <circle cx="100" cy="22" r="3" fill="var(--chart-5)" />
  </svg>
  <strong style="font-variant-numeric: tabular-nums;">182 ms</strong>
  <span class="status-pill success">−17%</span>
</p>
```

Sparklines do not need an axis. They need: a clear start-to-end value pair (here baked into `aria-label`), a marker at the end, and the current value in plain text alongside.

## Recipe 4 — Donut / progress ring

Use for proportion-to-whole, ≤ 5 segments, **or** for single-metric progress.

### CSS-only version (one segment)

```html
<style>
  .ring {
    --val: 72;
    --size: 8rem;
    width: var(--size);
    aspect-ratio: 1;
    border-radius: 50%;
    background: conic-gradient(
      var(--chart-5) calc(var(--val) * 1%),
      color-mix(in srgb, var(--surface-muted) 70%, transparent) 0
    );
    display: grid;
    place-items: center;
    position: relative;
  }
  .ring::after {
    content: "";
    position: absolute;
    inset: 0.9rem;
    border-radius: 50%;
    background: var(--surface);
  }
  .ring .val {
    position: relative;
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
  }
  .ring .label {
    position: relative;
    color: var(--text-muted);
    font-size: 0.8rem;
  }
</style>

<figure class="diagram-frame">
  <div class="ring" style="--val: 72" role="img" aria-labelledby="c4-t c4-d">
    <div>
      <div class="val">72%</div>
      <div class="label">test coverage</div>
    </div>
  </div>
  <p id="c4-t" style="font-weight:700;">
    Coverage of orders-service unit tests
  </p>
  <p id="c4-d" style="color:var(--text-muted);">
    Target: 80%. The remaining 8 percentage points are in the new event-bus
    consumer.
  </p>
</figure>
```

### SVG version (multi-segment donut)

```html
<figure class="diagram-frame">
  <svg
    viewBox="0 0 120 120"
    role="img"
    aria-labelledby="c4b-t c4b-d"
    style="width:8rem;height:8rem;"
  >
    <title id="c4b-t">Refund reason mix</title>
    <desc id="c4b-d">Damaged 45%, late 25%, wrong item 18%, other 12%.</desc>
    <!-- ring background -->
    <circle
      cx="60"
      cy="60"
      r="48"
      fill="none"
      stroke="color-mix(in srgb, var(--surface-muted) 70%, transparent)"
      stroke-width="18"
    />
    <!-- segments use stroke-dasharray on circumference 2πr ≈ 301.6 -->
    <circle
      cx="60"
      cy="60"
      r="48"
      fill="none"
      stroke="var(--chart-1)"
      stroke-width="18"
      stroke-dasharray="135.7 301.6"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60"
      cy="60"
      r="48"
      fill="none"
      stroke="var(--chart-2)"
      stroke-width="18"
      stroke-dasharray="75.4 301.6"
      stroke-dashoffset="-135.7"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60"
      cy="60"
      r="48"
      fill="none"
      stroke="var(--chart-3)"
      stroke-width="18"
      stroke-dasharray="54.3 301.6"
      stroke-dashoffset="-211.1"
      transform="rotate(-90 60 60)"
    />
    <circle
      cx="60"
      cy="60"
      r="48"
      fill="none"
      stroke="var(--chart-4)"
      stroke-width="18"
      stroke-dasharray="36.2 301.6"
      stroke-dashoffset="-265.4"
      transform="rotate(-90 60 60)"
    />
    <text
      x="60"
      y="64"
      text-anchor="middle"
      font-family="var(--font-display)"
      font-size="18"
      font-weight="800"
      fill="var(--text)"
    >
      112
    </text>
    <text
      x="60"
      y="80"
      text-anchor="middle"
      font-size="10"
      fill="var(--text-muted)"
    >
      refunds
    </text>
  </svg>
  <ul
    style="list-style:none;padding:0;display:flex;flex-wrap:wrap;gap:var(--space-3);font-size:.9rem;"
  >
    <li>
      <span
        style="display:inline-block;width:.85em;height:.85em;background:var(--chart-1);vertical-align:-.1em;margin-right:.25em;"
      ></span
      >Damaged 45%
    </li>
    <li>
      <span
        style="display:inline-block;width:.85em;height:.85em;background:var(--chart-2);vertical-align:-.1em;margin-right:.25em;"
      ></span
      >Late 25%
    </li>
    <li>
      <span
        style="display:inline-block;width:.85em;height:.85em;background:var(--chart-3);vertical-align:-.1em;margin-right:.25em;"
      ></span
      >Wrong item 18%
    </li>
    <li>
      <span
        style="display:inline-block;width:.85em;height:.85em;background:var(--chart-4);vertical-align:-.1em;margin-right:.25em;"
      ></span
      >Other 12%
    </li>
  </ul>
</figure>
```

Math for SVG donut segments: circumference at `r=48` is `2π × 48 ≈ 301.6`. Multiply each percent by 3.016 to get its dash length. Offset is the cumulative sum of previous segments (negated).

## Recipe 5 — Heatmap

A heatmap is best expressed as a table (see `tables-cookbook.md` recipe 6) because every value is also a number. The chart-only variant when the values themselves are not interesting:

```html
<style>
  .heat-grid {
    display: grid;
    grid-template-columns: 5rem repeat(7, 1fr);
    gap: 2px;
    font-size: 0.85rem;
  }
  .heat-head,
  .heat-row > :first-child {
    color: var(--text-muted);
    padding: var(--space-1);
  }
  .heat-cell {
    aspect-ratio: 1;
    display: grid;
    place-items: center;
    color: var(--surface);
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    border-radius: 4px;
  }
</style>

<figure class="diagram-frame">
  <div class="heat-grid" role="img" aria-labelledby="c5-t c5-d">
    <span></span>
    <span class="heat-head">Mon</span><span class="heat-head">Tue</span
    ><span class="heat-head">Wed</span> <span class="heat-head">Thu</span
    ><span class="heat-head">Fri</span><span class="heat-head">Sat</span
    ><span class="heat-head">Sun</span>

    <div class="heat-row" style="display:contents;">
      <span>09:00</span>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 22%, transparent);color:var(--text);"
      >
        22
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 41%, transparent);color:var(--text);"
      >
        41
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 68%, transparent);"
      >
        68
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 75%, transparent);"
      >
        75
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 88%, transparent);"
      >
        88
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 30%, transparent);color:var(--text);"
      >
        30
      </div>
      <div
        class="heat-cell"
        style="background:color-mix(in srgb, var(--seq-500) 15%, transparent);color:var(--text);"
      >
        15
      </div>
    </div>
  </div>
  <p id="c5-t" style="font-weight:700;margin-top:var(--space-3);">
    Active users per hour and weekday
  </p>
  <p id="c5-d" style="color:var(--text-muted);">
    Peak Fri 09:00 (88). Weekend traffic stays under 30 across the day.
  </p>
</figure>
```

`color-mix(... transparent)` automatically respects light/dark mode because `--seq-500` flips. Text color switches to `var(--text)` below 50% intensity so it remains legible on light cells.

## Recipe 6 — Bullet chart

Use for "actual vs target" where the target is more important than the absolute number — e.g. SLO compliance, OKR progress, budget vs spend.

```html
<style>
  .bullet {
    display: grid;
    grid-template-columns: 10rem 1fr 4rem;
    gap: var(--space-3);
    align-items: center;
  }
  .bullet-track {
    position: relative;
    height: 1.5rem;
    border-radius: var(--radius-sm);
    overflow: hidden;
    background: linear-gradient(
      to right,
      var(--success-soft) 0 70%,
      var(--warning-soft) 70% 90%,
      var(--danger-soft) 90% 100%
    );
  }
  .bullet-fill {
    position: absolute;
    top: 0.25rem;
    bottom: 0.25rem;
    left: 0.25rem;
    width: calc(var(--val) * 1% - 0.5rem);
    background: var(--text);
    border-radius: 2px;
  }
  .bullet-target {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 3px;
    background: var(--accent-strong);
    border-radius: 2px;
  }
  .bullet-target {
    left: calc(var(--target) * 1%);
  }
  .bullet-value {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
  }
</style>

<figure class="diagram-frame">
  <div
    class="bullet"
    role="img"
    aria-label="Checkout SLO: 92% actual, 95% target."
  >
    <span class="hbar-label">Checkout SLO</span>
    <div class="bullet-track">
      <span class="bullet-fill" style="--val: 92"></span>
      <span class="bullet-target" style="--target: 95"></span>
    </div>
    <span class="bullet-value">92%</span>
  </div>
  <figcaption>
    Background bands: green 0–70%, amber 70–90%, red 90–100% (or invert for
    "lower is worse"). Vertical line = target. Solid bar = actual.
  </figcaption>
</figure>
```

Bullets read faster than donuts at small sizes because the eye can compare the bar end to the target line directly.

## Recipe 7 — Dot plot / matrix

Use when there are many categories with a single value each, and rank ordering matters more than absolute values.

```html
<figure class="diagram-frame">
  <svg viewBox="0 0 600 220" role="img" aria-labelledby="c7-t c7-d">
    <title id="c7-t">Median PR review time by service (hours).</title>
    <desc id="c7-d">
      Auth-edge is the fastest at 2 h; checkout-api is slowest at 38 h.
    </desc>
    <!-- axis -->
    <line
      class="axis"
      x1="100"
      y1="180"
      x2="580"
      y2="180"
      stroke="currentColor"
      stroke-width="1"
      opacity=".4"
    />
    <text
      x="340"
      y="210"
      text-anchor="middle"
      font-size="12"
      fill="var(--text-muted)"
    >
      Median review time (hours)
    </text>
    <!-- ticks at 0, 12, 24, 36, 48 -->
    <g font-size="12" fill="var(--text-muted)">
      <line
        x1="100"
        y1="178"
        x2="100"
        y2="186"
        stroke="currentColor"
        opacity=".4"
      />
      <text x="100" y="200" text-anchor="middle">0</text>
      <line
        x1="220"
        y1="178"
        x2="220"
        y2="186"
        stroke="currentColor"
        opacity=".4"
      />
      <text x="220" y="200" text-anchor="middle">12</text>
      <line
        x1="340"
        y1="178"
        x2="340"
        y2="186"
        stroke="currentColor"
        opacity=".4"
      />
      <text x="340" y="200" text-anchor="middle">24</text>
      <line
        x1="460"
        y1="178"
        x2="460"
        y2="186"
        stroke="currentColor"
        opacity=".4"
      />
      <text x="460" y="200" text-anchor="middle">36</text>
      <line
        x1="580"
        y1="178"
        x2="580"
        y2="186"
        stroke="currentColor"
        opacity=".4"
      />
      <text x="580" y="200" text-anchor="middle">48</text>
    </g>
    <!-- categories along y -->
    <g font-size="13" fill="var(--text)" font-weight="600">
      <text x="92" y="40" text-anchor="end">auth-edge</text>
      <text x="92" y="70" text-anchor="end">notifications</text>
      <text x="92" y="100" text-anchor="end">search-indexer</text>
      <text x="92" y="130" text-anchor="end">orders-service</text>
      <text x="92" y="160" text-anchor="end">checkout-api</text>
    </g>
    <!-- dots: scale 10 px per hour starting at x=100 -->
    <circle cx="120" cy="35" r="8" fill="var(--chart-3)" />
    <!-- 2 h -->
    <text x="135" y="40" font-size="12" fill="var(--text)">2</text>
    <circle cx="160" cy="65" r="8" fill="var(--chart-3)" />
    <!-- 6 h -->
    <text x="175" y="70" font-size="12" fill="var(--text)">6</text>
    <circle cx="220" cy="95" r="8" fill="var(--chart-5)" />
    <!-- 12 h -->
    <text x="235" y="100" font-size="12" fill="var(--text)">12</text>
    <circle cx="280" cy="125" r="8" fill="var(--chart-5)" />
    <!-- 18 h -->
    <text x="295" y="130" font-size="12" fill="var(--text)">18</text>
    <circle cx="480" cy="155" r="10" fill="var(--chart-1)" />
    <!-- 38 h, slowest -->
    <text x="500" y="160" font-size="12" fill="var(--text)" font-weight="700">
      38
    </text>
  </svg>
  <figcaption>
    Each dot is one service. The biggest, accent-colored dot calls out the
    outlier; reading order is fastest-to-slowest top-to-bottom.
  </figcaption>
</figure>
```

Dots are cheap to scan; bar charts with the same data feel heavier. Use dot plots when readers care about "who is highest / lowest", not how big the gap is.

## Recipe 8 — Stacked progress (compositional / waterfall)

Use to show how a total breaks into named segments (budget allocation, time spent across categories, conversion funnel).

```html
<style>
  .stack-bar {
    display: flex;
    height: 2.2rem;
    border-radius: var(--radius-sm);
    overflow: hidden;
    box-shadow: inset 0 0 0 1px var(--border);
  }
  .stack-bar > span {
    display: grid;
    place-items: center;
    color: var(--surface);
    font-weight: 700;
    font-size: 0.9rem;
    font-variant-numeric: tabular-nums;
  }
  .stack-legend {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
    margin-top: var(--space-3);
    font-size: 0.9rem;
  }
  .stack-legend li {
    list-style: none;
  }
  .stack-legend i {
    display: inline-block;
    width: 0.85em;
    height: 0.85em;
    margin-right: 0.25em;
    vertical-align: -0.1em;
    border-radius: 2px;
  }
</style>

<figure class="diagram-frame">
  <div
    class="stack-bar"
    role="img"
    aria-label="Sprint hours: feature 56%, reliability 24%, on-call 20%."
  >
    <span style="background: var(--chart-5); flex: 0 0 56%;"
      >Feature · 112 h</span
    >
    <span style="background: var(--chart-3); flex: 0 0 24%;"
      >Reliability · 48 h</span
    >
    <span style="background: var(--chart-1); flex: 0 0 20%;"
      >On-call · 40 h</span
    >
  </div>
  <ul class="stack-legend">
    <li><i style="background:var(--chart-5)"></i>Feature work</li>
    <li><i style="background:var(--chart-3)"></i>Reliability</li>
    <li><i style="background:var(--chart-1)"></i>On-call & toil</li>
  </ul>
  <figcaption>
    Single bar reads in one glance; the inline labels mean readers do not need
    to map back to the legend at small widths.
  </figcaption>
</figure>
```

For a waterfall — show incremental gains and losses along a path — alternate segments using `var(--success)` for positive deltas and `var(--danger)` for negative deltas, and connect them with thin baselines so the running total is visible. The recipe shape is the same; what changes is that each segment carries a `+` or `−` glyph plus the value.

## Token reference reminder

When in doubt:

- `--chart-1 … --chart-8` (Okabe-Ito, colorblind-safe categorical).
- `--seq-50 … --seq-900` for heat-style / density / sequential.
- `--div-neg-3 … --div-pos-3` for signed-around-zero data (gains/losses, sentiment).
- `--success` / `--warning` / `--danger` for semantic charts where green/amber/red are conventional (bullet chart bands, SLO status).
- `currentColor` for everything decorative (axis, grid, ticks).
