# Review Workbench

## Use when

Code reviews, PR explainers, diff audits, release-readiness reviews, and maintainability reports.

## Do not use when

No code, diff, or file context is available, or the user only wants a one-line verdict.

## Information architecture

- Review summary with blocker/suggestion/info counts.
- Changed files map grouped by module and risk.
- Findings list with severity, location, impact, and fix.
- Annotated short diff snippets; never paste huge raw diffs.
- Test coverage and verification gaps.
- Merge readiness and conditions.

## Visual direction

IDE-inspired two-column layout with monospace code blocks, muted diff colors, sticky findings navigation, and severity pills.

## Core components

Severity filter, file risk map, finding cards, diff blocks, test coverage table, and go/no-go callout.

## Interaction pattern

Filter by severity, jump from file map to finding, copy individual review comments, and collapse low-severity items. See `interaction-cookbook.md` — recipe 1 (filter chips) for severity filters, recipe 2 (search) for cross-finding text search, recipe 3 (sortable table) for file map sorting, recipe 9 (copy with feedback) for per-finding clipboard actions.

## Accessibility notes

Do not rely on red/green diff color alone; include `+`, `-`, labels, and concise line references.

## Minimal HTML skeleton

```html
<section id="findings" aria-labelledby="findings-title">
  <h2 id="findings-title">Findings</h2>
  <div class="summary-grid">
    <article class="card">
      <p>
        <span class="status-pill critical">Blocker</span>
        <code>src/auth.ts:42</code>
      </p>
      <h3 class="card-title">Missing input validation</h3>
      <p>Impact: unauthenticated request reaches DB layer.</p>
      <p><strong>Fix:</strong> validate session before query.</p>
    </article>
  </div>
</section>
<section id="coverage" aria-labelledby="coverage-title">
  <h2 id="coverage-title">Test coverage gaps</h2>
  <ul>
    <li>No regression test for the auth bypass path above.</li>
  </ul>
</section>
```
