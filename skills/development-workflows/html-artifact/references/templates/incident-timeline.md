# Incident Timeline

## Use when
Incident reviews, postmortems, outage reports, data incidents, and root-cause analysis readouts.

## Do not use when
The task is an ordinary bug-fix note without impact, timeline, or RCA scope.

## Information architecture
- Impact summary.
- Detection and timeline.
- Root cause.
- Mitigation and recovery.
- What went well and poorly.
- Action items with owner, due date, and status.
- Prevention controls.

## Visual direction
Timeline with severity bands, strong event boundaries, compact impact cards, and action table.

## Core components
Impact cards, vertical timeline, RCA callout, action item table, and prevention checklist.

## Interaction pattern
Jump to incident phase, toggle customer/internal detail, and copy RCA summary.

## Accessibility notes
Represent the timeline as ordered content; color bands must have text severity labels.

## Minimal HTML skeleton

```html
<section id="impact" aria-labelledby="impact-title">
  <h2 id="impact-title">Impact</h2>
  <div class="callout danger"><strong>Sev 2</strong> — 24 min user-visible degradation, 18% of EU traffic affected.</div>
</section>
<section id="timeline" aria-labelledby="timeline-title">
  <h2 id="timeline-title">Timeline (UTC)</h2>
  <ol class="timeline">
    <li><strong>14:02</strong> — Alert fires on error-rate SLO.</li>
    <li><strong>14:11</strong> — Root cause identified: stale connection pool.</li>
    <li><strong>14:26</strong> — Full recovery after rolling restart.</li>
  </ol>
</section>
<section id="actions" aria-labelledby="actions-title">
  <h2 id="actions-title">Action items</h2>
  <div class="table-wrap"><table><caption>Owner, due date, status</caption>
    <thead><tr><th>Action</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead>
    <tbody><tr><td>Add pool-recycle guard</td><td>@alice</td><td>2026-06-01</td><td><span class="status-pill warning">In progress</span></td></tr></tbody>
  </table></div>
</section>
```
