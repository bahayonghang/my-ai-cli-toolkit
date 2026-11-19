# Strengthen docs skill descriptions and routing boundaries

Parent: `06-20-optimize-docs-writing-skills`

## Goal

Raise routing quality — yao-meta's first lever, since skills route by frontmatter
`description`. Give the three weaker skills concrete positive triggers and an
explicit negative/near-neighbor boundary, modeled on `beautiful-mermaid-editor`'s
exemplar ("...Do not use for generic Mermaid syntax help or normal Markdown
Mermaid authoring.").

## Evidence

- `touying/SKILL.md:3` — entire description is one sentence: "Author Typst slide
  decks with Touying. Use when working with .typ presentations, themes, or
  animations." No boundary; "themes/animations" are generic and risk collision
  with non-Typst deck/animation requests.
- `document-writer` description has good triggers but no "Do not use for" boundary;
  it overlaps with the `write`, `renwei-writing`, and `chinese-documentation`
  skills (prose polishing / localization vs. codebase-grounded technical docs).
- `bidwriter` description has a strong trigger list but no exclusion boundary.

## Requirements

- **touying** (primary): expand the description to name concrete Typst/Touying
  triggers (`.typ`, `#slide`, Touying themes, `#pause`/animations, speaker notes)
  and add an explicit "Do not use for ..." clause excluding non-Typst decks
  (HTML/PPT/reveal.js) and ordinary Markdown/prose.
- **document-writer**: add a "Do not use for ..." clause separating codebase-grounded
  technical docs from generic prose polishing / Chinese-copy rewriting handled by
  `write` / `renwei-writing` (describe the boundary by capability, not by hard
  skill-name dependency).
- **bidwriter**: add a short exclusion clause (e.g., not for generic business
  writing or non-tender documents).
- Keep each description within `check.py` limits (≤1024 chars, no angle brackets).
- Description-only changes; do not alter skill bodies here.

## Acceptance Criteria

- [ ] touying description names concrete Typst triggers and an explicit exclusion clause
- [ ] document-writer and bidwriter descriptions each have a "Do not use for" boundary
- [ ] No angle brackets; each description ≤1024 chars
- [ ] `PYTHONUTF8=1 python scripts/check.py skills/docs-writing-publishing` → all `[OK]`

## Notes

- Boundaries written here are the source of truth for the negative-trigger eval
  cases in `06-20-add-docs-skill-evals`; finalize this task first.
