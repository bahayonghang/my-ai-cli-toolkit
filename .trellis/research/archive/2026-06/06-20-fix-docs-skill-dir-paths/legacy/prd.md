# Fix broken $SKILL_DIR paths in docs skills

Parent: `06-20-optimize-docs-writing-skills`

## Goal

Eliminate the P1 runtime bug where `SKILL.md` instructs the agent to read
reference files at `$SKILL_DIR/references/...`. `$SKILL_DIR` is **not set** at
runtime in this environment, so the path expands to a broken `/references/...`
and the agent is told to read files that do not exist.

## Evidence

`grep -rn '\$SKILL_DIR' skills/docs-writing-publishing` → 6 hits:

- `bidwriter/SKILL.md:88,94,95,96` — SCORING_GUIDE, CHAPTER_TEMPLATES, TERMINOLOGY, STANDARDS
- `document-writer/SKILL.md:15,16` — WORKFLOW, DOCUMENT_TYPES, VERIFICATION_CHECKLIST, CHINESE_TECH_WRITING

Project memory `skill-dir-env-var-unset` documents the bug and the fix already
applied to `code-auditor` and the `gh-*` / dti skills, and explicitly lists
bidwriter and document-writer as "still broken".

## Requirements

- Replace every bare `$SKILL_DIR` in both `SKILL.md` files with the repo-canonical
  `` `<skill-dir>` `` literal-substitution placeholder.
- Add a one-line note (matching the pattern in `code-auditor` / the category
  `AGENTS.md` files) telling the agent to substitute the skill directory path
  announced on load.
- Do not introduce `${CLAUDE_SKILL_DIR}` (Claude-Code-only load-time token; the
  repo standard is the portable `<skill-dir>` placeholder).
- Touch only the `$SKILL_DIR` lines and the one added note. No other edits.

## Acceptance Criteria

- [ ] `grep -rn '\$SKILL_DIR' skills/docs-writing-publishing/bidwriter skills/docs-writing-publishing/document-writer` → no matches
- [ ] Both `SKILL.md` reference files via `<skill-dir>/references/...` plus a substitution note
- [ ] `PYTHONUTF8=1 python scripts/check.py skills/docs-writing-publishing` → `[OK]` for both
- [ ] Reference file names and relative paths are unchanged (only the `$SKILL_DIR` prefix changes)

## Reference

Mirror the already-applied fix in `code-auditor` (task
`06-20-fix-code-auditor-skill-dir`) for exact wording of the substitution note.
