# Optimize docs-writing-publishing skills

## Goal

Review-driven optimization of the four skills under `skills/docs-writing-publishing/`
so the three weaker skills converge on the local exemplar
(`beautiful-mermaid-editor`). Fix one real runtime bug, close consistency and
self-containment gaps, raise routing quality, and add eval coverage.

This is a parent task. It owns the finding set, the child task map, and the
cross-child integration acceptance. Implementation happens in the children.

## Targets

- `beautiful-mermaid-editor` — exemplar (relative paths, description with explicit
  "Do not use for", positive + negative evals). Only inherits the shared `version` fix.
- `bidwriter`, `document-writer`, `touying` — primary optimization targets.

## Findings (review evidence)

`scripts/check.py` passes all four (`[OK]`), so there are no hard metadata
errors. The issues are in runtime correctness, convention consistency, routing
quality, and test coverage.

| ID  | Finding                                                                                                                                       | Skills                                                             | Evidence                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| P1  | Bare `$SKILL_DIR` is unset at runtime → expands to a broken `/references/...` path; the skill tells the agent to read files that do not exist | bidwriter (4×), document-writer (2×)                               | `grep -rn '\$SKILL_DIR'` → 6 hits; project memory `skill-dir-env-var-unset` already flagged both as "still broken" |
| P2  | Missing top-level `version` frontmatter                                                                                                       | all 4                                                              | 26/30 repo skills have `version`; these 4 are the only ones missing it                                             |
| P2  | Hard cross-skill refs to `pdf`/`pptx`/`docx` skills absent from this repo                                                                     | bidwriter (159–162)                                                | `find skills -name pdf/pptx/docx` → none; conflicts with the repo's "self-containment" direction                   |
| P3  | Thin description, no negative/near-neighbor boundary (routing is yao-meta's first lever)                                                      | touying (worst); document-writer & bidwriter lack "Do not use for" | touying description is one sentence; cf. beautiful-mermaid-editor's exemplar                                       |
| P4  | No `evals/` coverage                                                                                                                          | bidwriter, document-writer, touying                                | 20/30 repo skills have evals; beautiful-mermaid-editor is the local pattern                                        |
| P5  | Leaked OMC runtime state inside the skill source tree                                                                                         | touying `.omc/state/idle-notif-cooldown.json`                      | untracked + already gitignored (harmless to git, but cruft in the tree)                                            |

Minor (fold into the relevant child, not a separate task): bidwriter `SKILL.md`
is 180 lines with embedded tables that overlap its `references/`.

## Child task map

1. `06-20-fix-docs-skill-dir-paths` (P1) — `$SKILL_DIR` → `<skill-dir>` + note
2. `06-20-docs-skill-hygiene` (P2 + P5) — add `version`; remove touying `.omc` cruft
3. `06-20-neutralize-bidwriter-skill-refs` (P2) — capability-neutral conversion wording
4. `06-20-strengthen-docs-skill-descriptions` (P3) — descriptions + routing boundaries
5. `06-20-add-docs-skill-evals` (P4) — evals; **run after #4** (evals encode the
   description boundaries finalized in #4)

Children are independent except #5, which follows #4. Each child is independently
verifiable and archivable.

## Cross-child acceptance criteria (integration)

- [ ] `PYTHONUTF8=1 python scripts/check.py skills/docs-writing-publishing` → all `[OK]`, no new warnings
- [ ] `grep -rn '\$SKILL_DIR' skills/docs-writing-publishing` → no matches
- [ ] All 4 `SKILL.md` carry a top-level `version`
- [ ] No bidwriter reference to a sibling skill that does not exist in this repo
- [ ] `just ci` is green
- [ ] `beautiful-mermaid-editor` behavior unchanged except for the added `version`

## Out of scope

- Rewriting reference body content for quality.
- Restructuring touying's 34-file / ~3.7k-line `docs/` tree.
- Splitting bidwriter's embedded tables into references beyond light trimming.
