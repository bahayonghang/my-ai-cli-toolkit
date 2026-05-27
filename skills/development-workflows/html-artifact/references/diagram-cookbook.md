# Diagram Cookbook

Inline SVG and structured-HTML recipes for the relationships, sequences, roadmaps, and architecture diagrams that artifacts need. Mermaid may be useful as a sketch, but the final artifact must contain inline SVG or structured HTML with a text equivalent. For decorative icons and illustrations, see `svg-cookbook.md` instead.

## Output order

1. If a local Mermaid-to-SVG workflow exists, export static SVG and inline it.
2. Otherwise generate inline SVG directly.
3. If SVG would be overkill, use structured HTML lanes, timelines, dependency lists, or tables.

Do not leave raw Mermaid as the primary visual expression in the final artifact.

## Shape and connector conventions

To keep diagrams readable across artifacts, use one node shape per role.

| Shape | Semantic | Example |
| --- | --- | --- |
| Rounded rectangle (`<rect rx="18">`) | Standard process / phase | "Build", "Migrate", "Compose" |
| Sharp rectangle | Generic data store or static node | "Postgres", "Vault" |
| Diamond (`<polygon>` 4-point) | Decision / branch | "Latency < 200 ms?" |
| Ellipse / pill | Start or end state | "Discovery", "Released" |
| Small circle (`<circle r="6">`) | Connector / merge point | Junction between lanes |
| Parallelogram | Input/output | "Customer event", "Audit log" |
| Double-stroke rectangle | External system / boundary | "Stripe API", "Customer browser" |
| Hexagon | Long-running queue / process boundary | "Job queue", "Stream" |

For arrows, define a single `<marker>` per direction and reuse it:

```html
<svg viewBox="0 0 600 240" role="img" aria-labelledby="t-x d-x" style="color: var(--accent);">
  <title id="t-x">Connector reference</title>
  <desc id="d-x">Solid arrow = synchronous; dashed = optional/conditional; thick = primary path.</desc>
  <defs>
    <marker id="arrow-end" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
    </marker>
    <marker id="arrow-end-muted" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
      <path d="M0,0 L0,6 L9,3 z" fill="var(--text-muted)"/>
    </marker>
  </defs>
  <!-- straight -->
  <line x1="30" y1="40" x2="200" y2="40" stroke="currentColor" stroke-width="3" marker-end="url(#arrow-end)"/>
  <text x="115" y="32" text-anchor="middle" font-size="12" fill="var(--text-muted)">synchronous</text>
  <!-- dashed conditional -->
  <line x1="30" y1="90" x2="200" y2="90" stroke="currentColor" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#arrow-end-muted)"/>
  <text x="115" y="82" text-anchor="middle" font-size="12" fill="var(--text-muted)">conditional</text>
  <!-- bezier curve -->
  <path d="M30 140 C 100 100, 150 180, 200 140" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#arrow-end)"/>
  <!-- labeled edge -->
  <path id="edge-1" d="M30 200 L200 200" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#arrow-end)"/>
  <text font-size="12" fill="var(--text-muted)">
    <textPath href="#edge-1" startOffset="50%" text-anchor="middle">retry up to 3×</textPath>
  </text>
</svg>
```

Conventions worth keeping consistent:

- **Stroke weights**: 3 px for primary edges, 2 px for secondary/optional, 1.5 px for grid lines.
- **Stroke style**: solid for synchronous / certain; dashed (`stroke-dasharray="6 4"`) for asynchronous, optional, or conditional; dotted (`"1 4"`) for retry/back channels.
- **Labels**: short verb on the edge (`writes`, `polls`, `if invalid`). Put nuance in the figcaption or text equivalent.
- **Colors**: leave fill/stroke at `currentColor` (controlled by the `style="color: …"` on `<svg>` or the surrounding element). Use `var(--ink-accent)` or `var(--text-muted)` on secondary edges to dim them.

## Text equivalent patterns

Every diagram needs a parallel textual representation so screen readers, search, and copy-paste workflows still work.

- **Decorative-only diagram** (the surrounding heading + body already explains the story): mark SVG `aria-hidden="true"`. No text equivalent needed.
- **Informative diagram**: add `role="img"` + `aria-labelledby` linking to `<title>` (one-line summary) and `<desc>` (a few sentences). Place a `<figcaption>` outside the SVG that explains why the diagram matters. Then add a nearby `<ol>`, `<dl>`, or `<table>` with the same nodes and edges in reading order — that list is the authoritative source if anything in the SVG is unclear.
- **Complex diagram** (≥ 7 nodes or non-linear): the text equivalent should be a table with columns "Node", "Inputs", "Outputs", or a `<details><summary>Show graph as a list</summary>…</details>` block. Do not paste raw JSON or Mermaid source as the equivalent — it is harder to read aloud than the SVG itself.

## Recipe 1 — Phase roadmap

Use for implementation plans, rollout strategies, migration plans, and executive roadmaps.

```html
<figure class="diagram-frame">
  <svg viewBox="0 0 900 240" role="img" aria-labelledby="r1-t r1-d" style="color: var(--accent);">
    <title id="r1-t">Four-phase rollout: Discovery → Build → Verify → Release.</title>
    <desc id="r1-d">Each phase has a deliverable and a validation gate. Verification feeds back to Build on failure.</desc>
    <defs>
      <marker id="r1-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
      </marker>
      <symbol id="r1-node" viewBox="0 0 180 100">
        <rect x="2" y="2" width="176" height="96" rx="18" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>
      </symbol>
    </defs>
    <use href="#r1-node" x="20" y="60" width="180" height="100"/>
    <text x="110" y="98" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)">1 · Discovery</text>
    <text x="110" y="124" text-anchor="middle" font-size="13" fill="var(--text-muted)">scope, owner, evidence</text>
    <use href="#r1-node" x="240" y="60" width="180" height="100" style="color: var(--ink-accent);"/>
    <text x="330" y="98" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)">2 · Build</text>
    <text x="330" y="124" text-anchor="middle" font-size="13" fill="var(--text-muted)">deliverable, tests</text>
    <use href="#r1-node" x="460" y="60" width="180" height="100" style="color: var(--ink-accent);"/>
    <text x="550" y="98" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)">3 · Verify</text>
    <text x="550" y="124" text-anchor="middle" font-size="13" fill="var(--text-muted)">validator + design review</text>
    <use href="#r1-node" x="680" y="60" width="180" height="100"/>
    <text x="770" y="98" text-anchor="middle" font-size="18" font-weight="700" fill="var(--text)">4 · Release</text>
    <text x="770" y="124" text-anchor="middle" font-size="13" fill="var(--text-muted)">handoff + monitor</text>
    <!-- forward arrows -->
    <line x1="205" y1="110" x2="235" y2="110" stroke="currentColor" stroke-width="3" marker-end="url(#r1-arrow)"/>
    <line x1="425" y1="110" x2="455" y2="110" stroke="currentColor" stroke-width="3" marker-end="url(#r1-arrow)"/>
    <line x1="645" y1="110" x2="675" y2="110" stroke="currentColor" stroke-width="3" marker-end="url(#r1-arrow)"/>
    <!-- feedback loop verify → build -->
    <path d="M550 170 C 550 210 330 210 330 170" fill="none" stroke="var(--text-muted)" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#r1-arrow)"/>
    <text x="440" y="208" text-anchor="middle" font-size="12" fill="var(--text-muted)">on failure</text>
  </svg>
  <figcaption>Forward arrows = nominal path. Dashed arc = feedback loop when verification fails before release.</figcaption>
</figure>
<ol>
  <li><strong>Discovery:</strong> scope and owner agreed; exit evidence committed.</li>
  <li><strong>Build:</strong> deliverable shipped behind a flag with passing tests.</li>
  <li><strong>Verify:</strong> validator and manual design review both pass.</li>
  <li><strong>Release:</strong> flag flipped, dashboard linked, monitoring window started.</li>
</ol>
```

## Recipe 2 — Decision flow

Use for option routing, ADR summaries, and branching logic.

```html
<figure class="diagram-frame">
  <svg viewBox="0 0 720 320" role="img" aria-labelledby="r2-t r2-d" style="color: var(--accent);">
    <title id="r2-t">Queue technology decision flow.</title>
    <desc id="r2-d">Latency requirement, then ops capacity, decide between managed queue, self-hosted broker, or in-process buffer.</desc>
    <defs>
      <marker id="r2-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
      </marker>
    </defs>
    <!-- Start -->
    <ellipse cx="120" cy="40" rx="60" ry="22" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="120" y="46" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Need a queue?</text>
    <!-- Decision 1 -->
    <polygon points="120,100 220,170 120,240 20,170" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>
    <text x="120" y="166" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">P99 &lt; 150 ms?</text>
    <text x="120" y="184" text-anchor="middle" font-size="12" fill="var(--text-muted)">latency budget</text>
    <line x1="120" y1="62" x2="120" y2="100" stroke="currentColor" stroke-width="3" marker-end="url(#r2-arrow)"/>
    <!-- branch: yes (recommended path - thicker stroke) -->
    <polygon points="450,100 550,170 450,240 350,170" fill="var(--accent-soft)" stroke="currentColor" stroke-width="3"/>
    <text x="450" y="166" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Have ops team?</text>
    <text x="450" y="184" text-anchor="middle" font-size="12" fill="var(--text-muted)">24×7 on-call</text>
    <path d="M220 170 L350 170" fill="none" stroke="currentColor" stroke-width="4" marker-end="url(#r2-arrow)"/>
    <text x="285" y="160" text-anchor="middle" font-size="12" font-weight="700" fill="var(--text)">Yes</text>
    <!-- outcomes -->
    <rect x="600" y="120" width="100" height="40" rx="6" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>
    <text x="650" y="145" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Self-hosted</text>
    <path d="M550 170 L600 145" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#r2-arrow)"/>
    <text x="575" y="150" text-anchor="middle" font-size="12" fill="var(--text-muted)">Yes</text>
    <rect x="600" y="200" width="100" height="40" rx="6" fill="var(--accent-soft)" stroke="currentColor" stroke-width="3.5"/>
    <text x="650" y="225" text-anchor="middle" font-size="13" font-weight="700" fill="var(--text)">Managed ★</text>
    <path d="M550 170 L600 215" fill="none" stroke="currentColor" stroke-width="4" marker-end="url(#r2-arrow)"/>
    <text x="575" y="200" text-anchor="middle" font-size="12" fill="var(--text-muted)">No</text>
    <!-- branch: no -->
    <rect x="20" y="280" width="200" height="30" rx="6" fill="var(--surface)" stroke="currentColor" stroke-width="2"/>
    <text x="120" y="300" text-anchor="middle" font-size="13" fill="var(--text)">In-process buffer</text>
    <path d="M120 240 L120 280" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#r2-arrow)"/>
    <text x="130" y="262" font-size="12" fill="var(--text-muted)">No</text>
  </svg>
  <figcaption>Recommended path (thicker arrows + accent fill): managed queue when latency is tight and there is no 24×7 ops team. ★ marks the recommendation.</figcaption>
</figure>
<ol>
  <li>If P99 ≥ 150 ms tolerable → <strong>in-process buffer</strong>.</li>
  <li>If P99 &lt; 150 ms and a 24×7 ops team exists → <strong>self-hosted broker</strong>.</li>
  <li>If P99 &lt; 150 ms and no 24×7 ops team → <strong>managed queue (recommended)</strong>.</li>
</ol>
```

## Recipe 3 — Swimlane

Use when a process crosses departments / roles and "who owns this step" matters as much as the order.

```html
<style>
  .swimlane { display: grid; grid-template-columns: 8.5rem 1fr; gap: 0; border: 1px solid var(--border); border-radius: var(--radius-md); overflow: hidden; }
  .swimlane > * { padding: var(--space-3) var(--space-4); border-top: 1px solid var(--border); }
  .swimlane > :nth-child(-n+2) { border-top: 0; }
  .swimlane .lane-head { background: var(--surface-muted); font-weight: 780; }
  .swimlane .lane-steps { display: flex; gap: var(--space-3); flex-wrap: wrap; }
  .swimlane .lane-step { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: var(--space-2) var(--space-3); background: var(--surface); font-size: .92rem; }
  .swimlane .lane-step[data-kind="decision"] { background: var(--accent-soft); border-color: var(--accent); }
</style>

<figure class="diagram-frame">
  <div class="swimlane" role="group" aria-labelledby="r3-title">
    <p id="r3-title" class="lane-head" style="grid-column: 1 / -1; border-top:0;">Refund request swimlane</p>

    <div class="lane-head">Customer</div>
    <ol class="lane-steps" aria-label="Customer lane">
      <li class="lane-step">1 · Submit refund form</li>
      <li class="lane-step">6 · Receive confirmation</li>
    </ol>

    <div class="lane-head">Support</div>
    <ol class="lane-steps" aria-label="Support lane">
      <li class="lane-step">2 · Triage within 4 h</li>
      <li class="lane-step" data-kind="decision">3 · Eligible?</li>
      <li class="lane-step">5 · Reply to customer</li>
    </ol>

    <div class="lane-head">Finance</div>
    <ol class="lane-steps" aria-label="Finance lane">
      <li class="lane-step">4 · Issue refund (if eligible)</li>
    </ol>
  </div>
  <figcaption>Step numbers are continuous across lanes so the order of handoffs reads top-to-bottom. The "Eligible?" decision step is highlighted because it is the branching point.</figcaption>
</figure>
```

Why pure HTML and not SVG: lanes get long and reflow on small viewports; native lists handle wrapping; assistive tech reads "Customer lane: 1 · Submit refund form" naturally.

## Recipe 4 — State machine

Use for protocol states, user-journey stages, and queue/job lifecycles.

```html
<figure class="diagram-frame">
  <svg viewBox="0 0 640 280" role="img" aria-labelledby="r4-t r4-d" style="color: var(--accent);">
    <title id="r4-t">Background job state machine.</title>
    <desc id="r4-d">Job moves from Queued → Running → Done. Running can fail to Retry up to 3×, after which it lands in Failed.</desc>
    <defs>
      <marker id="r4-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
      </marker>
    </defs>
    <!-- States as ellipses -->
    <ellipse cx="90" cy="140" rx="60" ry="32" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>
    <text x="90" y="146" text-anchor="middle" font-size="15" font-weight="700" fill="var(--text)">Queued</text>
    <ellipse cx="280" cy="140" rx="60" ry="32" fill="var(--accent-soft)" stroke="currentColor" stroke-width="3"/>
    <text x="280" y="146" text-anchor="middle" font-size="15" font-weight="700" fill="var(--text)">Running</text>
    <ellipse cx="470" cy="60" rx="60" ry="32" fill="var(--surface)" stroke="currentColor" stroke-width="3"/>
    <text x="470" y="66" text-anchor="middle" font-size="15" font-weight="700" fill="var(--text)">Done</text>
    <ellipse cx="470" cy="220" rx="60" ry="32" fill="var(--surface)" stroke="var(--danger)" stroke-width="3"/>
    <text x="470" y="226" text-anchor="middle" font-size="15" font-weight="700" fill="var(--danger)">Failed</text>
    <!-- Transitions -->
    <line x1="150" y1="140" x2="220" y2="140" stroke="currentColor" stroke-width="3" marker-end="url(#r4-arrow)"/>
    <text x="185" y="130" text-anchor="middle" font-size="12" fill="var(--text-muted)">start</text>
    <path d="M325 115 L420 75" fill="none" stroke="currentColor" stroke-width="3" marker-end="url(#r4-arrow)"/>
    <text x="380" y="86" font-size="12" fill="var(--text-muted)">success</text>
    <path d="M325 165 L420 205" fill="none" stroke="var(--danger)" stroke-width="3" marker-end="url(#r4-arrow)"/>
    <text x="380" y="200" font-size="12" fill="var(--danger)">≥ 3 failures</text>
    <!-- Self-loop: retry -->
    <path d="M250 110 C 220 70, 310 70, 310 110" fill="none" stroke="currentColor" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#r4-arrow)"/>
    <text x="280" y="68" text-anchor="middle" font-size="12" fill="var(--text-muted)">retry &lt; 3×</text>
  </svg>
  <figcaption>Solid arrow = forward transition. Dashed self-loop = retry. Red stroke distinguishes the terminal failure state without relying only on color (the word "Failed" is also red and bold).</figcaption>
</figure>

<details>
  <summary>State transition table</summary>
  <table>
    <caption>Transitions for the background job state machine.</caption>
    <thead><tr><th scope="col">From</th><th scope="col">Event</th><th scope="col">To</th></tr></thead>
    <tbody>
      <tr><th scope="row">Queued</th><td>start</td><td>Running</td></tr>
      <tr><th scope="row">Running</th><td>success</td><td>Done</td></tr>
      <tr><th scope="row">Running</th><td>error, retry count &lt; 3</td><td>Running</td></tr>
      <tr><th scope="row">Running</th><td>error, retry count ≥ 3</td><td>Failed</td></tr>
    </tbody>
  </table>
</details>
```

## Recipe 5 — Tree / hierarchy

Use for organization charts, file structures, package dependencies, and document outlines. Nested `<ul>` reads correctly in screen readers and prints well.

```html
<style>
  .tree, .tree ul { list-style: none; padding-left: var(--space-5); margin: 0; position: relative; }
  .tree { padding-left: 0; }
  .tree li { position: relative; padding: var(--space-2) 0 var(--space-2) var(--space-5); }
  .tree li::before {
    content: ""; position: absolute; left: 0; top: 0; bottom: 0;
    border-left: 1.5px solid var(--border);
  }
  .tree li::after {
    content: ""; position: absolute; left: 0; top: 1.1rem; width: var(--space-4);
    border-top: 1.5px solid var(--border);
  }
  .tree > li::before, .tree > li::after { content: none; }
  .tree li:last-child::before { height: 1.1rem; }
  .tree .node {
    display: inline-flex; gap: var(--space-2); align-items: baseline;
    background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-sm);
    padding: .2rem .55rem; font-size: .94rem;
  }
  .tree .node.is-key { border-color: var(--accent); background: var(--accent-soft); font-weight: 700; }
</style>

<figure class="diagram-frame">
  <ul class="tree" role="tree" aria-label="Module ownership tree">
    <li role="treeitem">
      <span class="node is-key">platform · @platform-leads</span>
      <ul role="group">
        <li role="treeitem"><span class="node">platform/auth · @auth-team</span></li>
        <li role="treeitem">
          <span class="node">platform/billing · @billing-team</span>
          <ul role="group">
            <li role="treeitem"><span class="node">platform/billing/invoices</span></li>
            <li role="treeitem"><span class="node">platform/billing/subscriptions</span></li>
          </ul>
        </li>
        <li role="treeitem"><span class="node">platform/notifications · @growth</span></li>
      </ul>
    </li>
  </ul>
  <figcaption>The root node is emphasised so the page reads "everything below this is part of platform". Use the same emphasis on any sub-tree that has its own owner.</figcaption>
</figure>
```

## Recipe 6 — Before / after architecture

Use for migrations, refactors, and platform changes. Same node names appear in both panels so the diff is the message.

```html
<figure class="diagram-frame">
  <svg viewBox="0 0 980 360" role="img" aria-labelledby="r6-t r6-d" style="color: var(--accent);">
    <title id="r6-t">Before and after: synchronous to event-driven order pipeline.</title>
    <desc id="r6-d">Removes a direct call from Web to Warehouse, adds an event bus, isolates Warehouse behind a consumer.</desc>
    <defs>
      <marker id="r6-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="currentColor"/>
      </marker>
      <marker id="r6-arrow-new" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
        <path d="M0,0 L0,6 L9,3 z" fill="var(--ink-accent)"/>
      </marker>
    </defs>

    <!-- Panel headers -->
    <text x="220" y="32" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text-muted)">Before</text>
    <text x="760" y="32" text-anchor="middle" font-size="16" font-weight="700" fill="var(--text-muted)">After</text>
    <line x1="490" y1="20" x2="490" y2="340" stroke="var(--border)" stroke-width="1"/>

    <!-- Before panel -->
    <rect x="40" y="60" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="110" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Web</text>
    <rect x="260" y="60" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="330" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Orders API</text>
    <rect x="260" y="200" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="330" y="236" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Warehouse</text>
    <line x1="180" y1="90" x2="255" y2="90" stroke="currentColor" stroke-width="3" marker-end="url(#r6-arrow)"/>
    <line x1="330" y1="120" x2="330" y2="195" stroke="currentColor" stroke-width="3" marker-end="url(#r6-arrow)"/>
    <!-- Removed coupling: red strikethrough -->
    <line x1="180" y1="230" x2="255" y2="230" stroke="var(--danger)" stroke-width="3" stroke-dasharray="2 4" marker-end="url(#r6-arrow)"/>
    <text x="220" y="220" text-anchor="middle" font-size="11" fill="var(--danger)">removed: direct call</text>

    <!-- After panel -->
    <rect x="520" y="60" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="590" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Web</text>
    <rect x="740" y="60" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="810" y="96" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Orders API</text>
    <!-- New: event bus (hexagon) -->
    <polygon points="780,170 870,170 900,200 870,230 780,230 750,200"
             fill="var(--accent-soft)" stroke="var(--ink-accent)" stroke-width="3"/>
    <text x="825" y="206" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">new: Event bus</text>
    <rect x="740" y="280" width="140" height="60" rx="10" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    <text x="810" y="316" text-anchor="middle" font-size="14" font-weight="700" fill="var(--text)">Warehouse</text>
    <line x1="660" y1="90" x2="735" y2="90" stroke="currentColor" stroke-width="3" marker-end="url(#r6-arrow)"/>
    <line x1="810" y1="120" x2="810" y2="165" stroke="var(--ink-accent)" stroke-width="3" marker-end="url(#r6-arrow-new)"/>
    <text x="822" y="148" font-size="11" fill="var(--ink-accent)">publish</text>
    <line x1="810" y1="235" x2="810" y2="275" stroke="var(--ink-accent)" stroke-width="3" marker-end="url(#r6-arrow-new)"/>
    <text x="822" y="262" font-size="11" fill="var(--ink-accent)">subscribe</text>
  </svg>
  <figcaption>Removed and new edges carry text prefixes (<code>removed:</code>, <code>new:</code>) so the diff is legible without relying on color alone. The new event bus is a hexagon to mark "long-running queue boundary".</figcaption>
</figure>

<ul>
  <li><strong>Removed:</strong> direct synchronous call <code>Web → Warehouse</code>.</li>
  <li><strong>Unchanged:</strong> <code>Web → Orders API</code>, <code>Orders API → Warehouse</code> data ownership.</li>
  <li><strong>Introduced:</strong> event bus between Orders API and Warehouse; subscribes are decoupled from publishers.</li>
</ul>
```

## Recipe 7 — Gantt-ish timeline lane

Use for sprints, rollouts with milestones, and dependency-rich roadmaps. Built with CSS Grid, no Gantt library required.

```html
<style>
  .gantt { display: grid; grid-template-columns: 10rem repeat(8, 1fr); gap: 4px; align-items: center; font-size: .92rem; }
  .gantt-head { font-weight: 700; color: var(--text-muted); padding: var(--space-1) var(--space-2); border-bottom: 1px solid var(--border); }
  .gantt-row > :first-child { font-weight: 700; padding-right: var(--space-2); }
  .gantt-bar { background: var(--accent-soft); color: var(--accent-strong); border: 1px solid var(--accent); border-radius: var(--radius-sm); padding: .25rem .5rem; font-weight: 700; }
  .gantt-bar.risk { background: var(--warning-soft); color: var(--warning); border-color: var(--warning); }
  .gantt-bar.done { background: var(--success-soft); color: var(--success); border-color: var(--success); }
</style>

<figure class="diagram-frame">
  <div class="gantt" role="table" aria-label="Q3 rollout timeline">
    <div class="gantt-head">Workstream</div>
    <div class="gantt-head">W1</div><div class="gantt-head">W2</div><div class="gantt-head">W3</div>
    <div class="gantt-head">W4</div><div class="gantt-head">W5</div><div class="gantt-head">W6</div>
    <div class="gantt-head">W7</div><div class="gantt-head">W8</div>

    <div class="gantt-row" style="display:contents;">
      <div>Auth migration</div>
      <div class="gantt-bar done" style="grid-column: span 3;">Done · auth v2</div>
      <div></div><div></div><div></div><div></div><div></div>
    </div>
    <div class="gantt-row" style="display:contents;">
      <div>Event bus</div>
      <div></div><div></div>
      <div class="gantt-bar" style="grid-column: span 4;">In progress · publish + subscribe</div>
      <div></div><div></div>
    </div>
    <div class="gantt-row" style="display:contents;">
      <div>Warehouse cutover</div>
      <div></div><div></div><div></div><div></div>
      <div class="gantt-bar risk" style="grid-column: span 3;">At risk · backfill</div>
      <div></div>
    </div>
  </div>
  <figcaption>Bars carry a status word and color. Bars also span explicit week columns, so timing is visible even without color. Use <code>.risk</code>, <code>.done</code>, and the default state-pill colors so dependency timing pops at a glance.</figcaption>
</figure>
```

## Recipe 8 — Dependency lane

Use for workstreams, data dependencies, release blockers, and cross-team coordination.

- Use horizontal lanes for workstreams (one row per team or component) and vertical markers (`<line>` at week boundaries) for gates.
- Pair every dependency arrow with three labels: **owner**, **readiness signal**, **fallback**. If the diagram becomes too dense, lift those three into a `<table>` immediately below the diagram and keep only the arrow in the diagram.
- A dependency that has no fallback gets the `var(--danger)` stroke; everything else stays `currentColor`.

When the dependency table becomes more readable than the diagram, prefer the table. The diagram exists to show *parallel structure*, not to recreate a ticket queue.

## Recipe 9 — Evidence-to-claim map

Use for research dossiers and decision artifacts where the reader needs to trust the conclusion.

- Place claims on the right edge of the SVG; group evidence by source on the left.
- Connector confidence is shown two ways: stroke style (solid = direct, dashed = inferred) **and** an adjacent list with confidence labels (high / medium / low).
- Provide a parallel source table beneath the diagram with `Source · Date · Confidence · Used for` columns (see `tables-cookbook.md` recipe 2). The SVG only needs to show structure; the table carries the citation detail.

Both Recipe 8 and 9 deliberately stay short — they describe *patterns* you compose from the SVG primitives at the top of this file and the table recipes in `tables-cookbook.md`. The structural payoff comes from naming the relationship clearly (owner / fallback; evidence / inference), not from clever geometry.