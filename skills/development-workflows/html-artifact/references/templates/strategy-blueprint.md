# Strategy Blueprint

## Use when
Implementation plans, PRDs, migration plans, roadmaps, and execution strategies.

## Do not use when
The user only needs a tiny checklist, simple command list, or commit message.

## Information architecture
- Hero with goal, scope, owner/status, and updated date.
- TL;DR with three to five conclusions.
- Milestone timeline with deliverables and verification.
- Dependency graph or ordered dependency list.
- Decision table with options and tradeoffs.
- Risk register with probability, impact, mitigation, and trigger.
- Verification checklist with commands and expected evidence.
- Rollback or recovery plan.

## Visual direction
Light editorial layout with bento summary cards, left sticky TOC, readable prose width, calm accent color, and status pills that include text labels.

## Core components
Summary grid, timeline, decision table, risk register, callouts, and copy-checklist button.

## Interaction pattern
Use native `details` for phase detail, local buttons for risk filtering, and copy actions for plan summary/checklist.

## Accessibility notes
Use text labels with status colors, make timelines readable as lists, and add a text equivalent for dependency diagrams.

## Minimal HTML skeleton

```html
<section id="milestones" aria-labelledby="milestones-title">
  <h2 id="milestones-title">Milestones</h2>
  <ol class="timeline">
    <li><strong>Phase 1</strong> <span class="status-pill warning">In progress</span><p>Deliverable, verification command, expected evidence.</p></li>
  </ol>
</section>
<section id="risks" aria-labelledby="risks-title">
  <h2 id="risks-title">Risks</h2>
  <div class="table-wrap">
    <table>
      <caption>Risk register</caption>
      <thead><tr><th>Risk</th><th>Probability</th><th>Mitigation</th><th>Trigger</th></tr></thead>
      <tbody><tr><td>Schema drift</td><td><span class="status-pill warning">Medium</span></td><td>Snapshot tests</td><td>CI red</td></tr></tbody>
    </table>
  </div>
</section>
```
