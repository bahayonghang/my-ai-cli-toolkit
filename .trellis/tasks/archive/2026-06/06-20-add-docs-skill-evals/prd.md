# Add trigger evals for docs skills

Parent: `06-20-optimize-docs-writing-skills`
Ordering: run **after** `06-20-strengthen-docs-skill-descriptions` (eval negative
cases encode the routing boundaries finalized there).

## Goal

Add eval coverage for the three docs skills that lack it, so their routing and
core behavior are checked the same way the rest of the repo is. 20/30 repo skills
already ship `evals/`; `beautiful-mermaid-editor/evals/evals.json` is the local
pattern.

## Evidence

- `find skills -type d -name evals` shows bidwriter, document-writer, touying have
  no `evals/` dir; beautiful-mermaid-editor does.
- The exemplar format: `{ "skill_name", "evals": [ { "id", "prompt",
"expected_output", "files", "assertions" } ] }`, including at least one
  negative-trigger case (beautiful-mermaid-editor case 4).

## Requirements

- Add `evals/evals.json` for `bidwriter`, `document-writer`, `touying`, matching
  the exemplar schema and the repo eval conventions.
- Each file includes positive trigger cases for the skill's core job plus at least
  one negative-trigger case that asserts the skill should NOT activate for the
  near-neighbor request defined in the strengthened description:
  - bidwriter: negative = generic business writing / non-tender document.
  - document-writer: negative = pure prose polishing / Chinese-copy rewrite
    (`write` / `renwei-writing` territory).
  - touying: negative = non-Typst deck (HTML/PPT/reveal.js) or ordinary Markdown.
- Keep prompts realistic and aligned with how the repo's other eval files read
  (Chinese prompts are fine and common in this repo).

## Acceptance Criteria

- [ ] `evals/evals.json` exists for all three skills and is valid JSON
- [ ] Each file has ≥3 positive cases and ≥1 negative-trigger case
- [ ] Negative cases match the exclusion boundaries from the descriptions task
- [ ] `just node-test` (and `just ci`) stays green

## Notes

- Mirror `beautiful-mermaid-editor/evals/evals.json` for structure and assertion style.
