# Artifact Design Profile

Skill: `agents-md-improver`
Design system: `metric editorial`

## Primary Artifact Direction

**Review viewer**

Side-by-side reviewer studio with explicit tradeoffs, evidence readiness, and fast paths for approving, blocking, or requesting one focused fix.

## Matched Artifact Families

### Review viewer
- Matched keywords: review, diff, audit
- Score: `3`
- Direction: Side-by-side reviewer studio with explicit tradeoffs, evidence readiness, and fast paths for approving, blocking, or requesting one focused fix.

### Tutorial or guide
- Matched keywords: tutorial, guide
- Score: `2`
- Direction: Progressive instructional layout with domain-specific section names, short success checks, and examples close to the user's real input.

### Code, CLI, or implementation guide
- Matched keywords: code, command
- Score: `2`
- Direction: Execution-focused technical artifact with environment assumptions, copyable commands, expected outputs, and side effects made explicit.

### Report or brief
- Matched keywords: report
- Score: `1`
- Direction: High-trust editorial report with a clear first-screen thesis, compact evidence blocks, and decisions separated from supporting detail.

### Dashboard or metrics page
- Matched keywords: score
- Score: `1`
- Direction: Metric-first dashboard with stable dimensions, short labels, visible deltas, and narrative callouts only where they change interpretation.

## Layout Patterns To Prefer

- summary
- variant comparison
- evidence
- risks
- review decision
- opening promise
- task-specific sections
- worked example

## Design Tokens

### Type
- Use a distinctive display face or serif for major claims when the artifact is editorial.
- Use a restrained sans for dense body text and technical details.
- Use mono only for metadata, paths, commands, labels, and evidence tags.

### Color
- Choose colors from the artifact's domain, brand, or evidence mood.
- Do not default to Kami parchment, purple gradients, or generic SaaS blue unless the content justifies it.
- Keep accent color limited to decisions, active states, risk, or section anchors.

### Spacing
- Prefer clear grid rhythm over floating decorative cards.
- Increase whitespace around decisions and shrink whitespace around supporting metadata.
- Split dense content instead of shrinking type or adding scroll traps.

### Components
- Use cards for grouped evidence, tables for comparisons, callouts for decisions, and timelines for sequence.
- Avoid cards inside cards.
- Keep reviewer-only detail visible but visually quieter than user-facing guidance.

## Quality Gates

- Make differences visible instead of hiding them in prose.
- Separate author-facing recommendations from reviewer-only evidence.
- Surface conflicts clearly and keep routine benchmark synthesis quiet.
- Replace generic headings with learner- and domain-specific headings.
- Pair every major step with a visible success check.
- Do not add screenshots unless they are real, current, and action-relevant.
- Name the working directory and required inputs for commands.
- Mark destructive, networked, or external side-effect operations.

## Anti-Patterns

- Do not copy Kami's fixed parchment background as a default.
- Do not use generic purple gradients, glass cards, or stock SaaS hero sections unless the content calls for them.
- Do not let Markdown tables become the default shape for every comparison or explanation.
- Do not turn reviewer evidence into user-facing clutter.
- Do not invent screenshots, citations, charts, or UI states.

## Reviewer Note

Use this profile to judge whether the generated artifacts feel designed for their job, not merely rendered.

## Package-Specific Interpretation

The primary durable artifact is a compact Markdown audit/update report plus a
machine-readable scorecard. Use restrained editorial hierarchy: outcome first,
short evidence rows, conditional chain/shadow tables, separate creation
decisions, and small proposed diffs. No screenshot or decorative viewer is
required for this package. Any future HTML Review Studio is reviewer evidence,
not a replacement for the source Markdown contract.
