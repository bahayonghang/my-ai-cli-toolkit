# Output Risk Profile

Skill: `agents-md-improver`

## Why This Exists

Generated skills often fail in small output details: generic headings, cluttered citations, fragile screenshots, weak Markdown rendering, or missing execution assumptions. This profile predicts the most likely output mistakes before the skill is used heavily.

## Matched Risk Families

### Markdown readability
- Matched keywords: md, report, doc
- Score: `3`

### Code and command safety
- Matched keywords: code, command
- Score: `2`

### Tutorial quality
- Matched keywords: guide
- Score: `1`

### Citation and footnote clutter
- Matched keywords: reference
- Score: `1`

### Tone and specificity
- Matched keywords: content
- Score: `1`

## Likely Output Mistakes

- Tables can render as dense grids with weak hierarchy or poor mobile readability.
- Long bullets can make the output look complete while hiding the actual decision logic.
- Commands can omit environment assumptions, working directory, or rollback notes.
- Code snippets can look runnable while missing required inputs.
- Generic section headings make the tutorial feel templated instead of fitted to the learner's task.
- Steps may explain what to do without naming the exact check that proves the step worked.

## Output Constraints To Apply

- Use tables only when comparison is the main job; otherwise prefer compact cards or grouped bullets.
- Keep table cells short and move explanations below the table.
- Name the working directory, required inputs, and expected output for each command.
- Mark destructive or external side-effect operations explicitly.
- Write headings from the user's domain nouns and desired outcome, not from generic labels like Overview or Key Points.
- Pair each major step with a visible success check or expected intermediate output.

## Self-Repair Checks

- Preview whether each table still reads well when columns are narrow.
- Convert any table with paragraph-length cells into bullets or cards.
- Scan each command for cwd, input, output, and side-effect assumptions.
- Remove speculative error handling that is not tied to a real failure mode.
- Replace generic H2/H3 headings with task-specific headings before final output.
- Scan every numbered step for a missing verification cue.

## Reviewer Note

Use this report before deepening the package and again before approving example outputs.

## Package-Specific Interpretation

The highest-risk outputs for this package are not screenshots or tutorials;
they are an incorrect effective instruction chain, an inactive file presented as
active, a fabricated effective-config value, conflated AGENTS/code_map creation
decisions, and an edit summary that overclaims validation. The durable controls
are the Codex semantics reference, evidence-first report contract, separate
creation axes, explicit `missing evidence`, and passed/failed/skipped checks.
The generic renderer rows above are heuristic prompts for review, not provider
or human output evidence.
