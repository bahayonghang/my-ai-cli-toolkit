# Make bidwriter self-contained (neutralize cross-skill refs)

Parent: `06-20-optimize-docs-writing-skills`

## Goal

Remove bidwriter's hard dependency on sibling skill names that do not exist in
this repo, aligning it with the repo's established self-containment direction
(cf. commit "泛化跨技能引用保证自包含" and archived task
`06-20-neutralize-out-of-repo-skill-refs`).

## Evidence

`bidwriter/SKILL.md:159-162` (输出格式 section) instructs:

- 使用 `docx` 技能进行格式转换和排版
- 使用 `pdf` 技能生成 PDF 版本
- 使用 `pptx` 技能制作汇报演示文稿

`find skills -type d -name pdf|pptx|docx` → none exist in this repo. Naming
specific sibling skills that may be absent makes the guidance fragile.

## Requirements

- Rewrite the conversion guidance to be capability-neutral: describe the desired
  outcome (convert the Markdown to Word/PDF/slides) and point to "a docx/pdf/pptx
  conversion skill or tool if available" rather than naming specific skills as
  if guaranteed to exist.
- Keep the intent (Markdown is the default deliverable; conversion is optional).
- Scope the edit to the 输出格式 section. Do not restructure the rest of the file.

## Acceptance Criteria

- [ ] `bidwriter/SKILL.md` no longer asserts specific sibling skills (`pdf`, `pptx`, `docx`) exist
- [ ] Conversion guidance is phrased as optional/capability-neutral
- [ ] `PYTHONUTF8=1 python scripts/check.py skills/docs-writing-publishing/bidwriter` → `[OK]`

## Notes

- If the repo later adds canonical conversion skills, the wording should still
  hold without naming them as hard dependencies.
