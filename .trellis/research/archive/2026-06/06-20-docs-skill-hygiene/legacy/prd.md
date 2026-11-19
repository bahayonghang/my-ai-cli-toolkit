# Add version frontmatter and clean cruft in docs skills

Parent: `06-20-optimize-docs-writing-skills`

## Goal

Close two hygiene gaps: (P2) all four docs skills lack a top-level `version`
field that 26/30 repo skills carry, and (P5) touying ships leaked OMC runtime
state inside its source tree.

## Evidence

- Missing `version`: a per-skill scan shows the only four `SKILL.md` without
  `^version:` are exactly `beautiful-mermaid-editor`, `bidwriter`,
  `document-writer`, `touying`. `version` is in `check.py`'s allowed keys.
- Cruft: `touying/.omc/state/idle-notif-cooldown.json` (an OMC idle-notification
  cooldown timestamp). `git ls-files` shows it is untracked; `git check-ignore`
  shows it is already gitignored.

## Requirements

- Add a top-level `version` to all four skills' `SKILL.md` frontmatter. Use
  `version: "1.0.0"` unless a per-skill history justifies otherwise; match the
  quoting/format style already used by sibling skills in the repo.
- Remove `touying/.omc/` from the skill source tree. It is untracked local state,
  so confirm contents before deleting and only remove the OMC cooldown artifact
  (do not delete unrelated untracked user files).
- Do not change any other frontmatter key or body content.

## Acceptance Criteria

- [ ] All four `SKILL.md` have a top-level `version`
- [ ] `for f in beautiful-mermaid-editor bidwriter document-writer touying; do grep -q '^version:' skills/docs-writing-publishing/$f/SKILL.md || echo MISSING $f; done` → no output
- [ ] `touying/.omc/` no longer present in the skill tree
- [ ] `PYTHONUTF8=1 python scripts/check.py skills/docs-writing-publishing` → all `[OK]`, no new warnings

## Notes

- `version` for `beautiful-mermaid-editor` is the only change that skill needs; it
  is otherwise the exemplar.
