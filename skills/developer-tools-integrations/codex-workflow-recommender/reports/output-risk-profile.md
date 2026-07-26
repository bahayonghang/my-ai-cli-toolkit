# Output Risk Profile

Skill: `codex-workflow-recommender`

## Why This Exists

Generated skills often fail in small output details: generic headings, cluttered citations, fragile screenshots, weak Markdown rendering, or missing execution assumptions. This profile predicts the most likely output mistakes before the skill is used heavily.

## Matched Risk Families

### Markdown readability
- Matched keywords: md, table, report, doc
- Score: `4`

### Code and command safety
- Matched keywords: code, cli
- Score: `2`

### Citation and footnote clutter
- Matched keywords: reference
- Score: `1`

## Likely Output Mistakes

- Tables can render as dense grids with weak hierarchy or poor mobile readability.
- Long bullets can make the output look complete while hiding the actual decision logic.
- Commands can omit environment assumptions, working directory, or rollback notes.
- Code snippets can look runnable while missing required inputs.
- Footnote markers or dense citation notes can interrupt the reading flow.
- Evidence can be over-attached to obvious statements and under-attached to risky claims.

## Output Constraints To Apply

- Use tables only when comparison is the main job; otherwise prefer compact cards or grouped bullets.
- Keep table cells short and move explanations below the table.
- Name the working directory, required inputs, and expected output for each command.
- Mark destructive or external side-effect operations explicitly.
- Attach citations only to claims that need evidence, not to every sentence.
- Group source notes at the end of a section when inline markers would hurt readability.

## Self-Repair Checks

- Preview whether each table still reads well when columns are narrow.
- Convert any table with paragraph-length cells into bullets or cards.
- Scan each command for cwd, input, output, and side-effect assumptions.
- Remove speculative error handling that is not tied to a real failure mode.
- Remove decorative citations that do not support a material claim.
- Move repeated source explanations into one compact source note.

## Reviewer Note

Use this report before deepening the package and again before approving example outputs.

## Package-Specific Interpretation

The material risks are a stale discovery root, duplicate setup caused by lost
plugin/MCP provenance, forced recommendations when no change is justified,
cross-surface/version invention, raw diagnostic disclosure, and high-permission
setup without a separate approval. The controls are the dated surface map,
minimum-condition decision model, provenance vocabulary, privacy boundary,
six file-backed cases, and contract tests. The generic risk families above are
renderer heuristics, not provider or human evidence; those remain `missing evidence`.
