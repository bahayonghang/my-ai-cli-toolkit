# Skill Audit

::: warning Legacy documentation
This page is kept for historical reference and link compatibility. The corresponding skill is no longer shipped from `content/skills/` in this repository.
:::

Skill review workflow for compliance, overlap detection, and token-efficiency analysis.

## When to use it

- review a skill directory before publishing
- find frontmatter or structure issues
- check overlap with sibling skills
- shrink `SKILL.md` while preserving intent

## Workflow

1. point the skill at a target directory containing `SKILL.md`
2. run `scripts/analyze_skill.py`
3. compare results with the checklist and pattern references
4. optionally run overlap detection against sibling skills
5. return issues grouped as Critical, Recommended, and Optional

## Main assets

- `scripts/analyze_skill.py`
- `scripts/detect_overlap.py`
- `references/CHECKLIST.md`
- `references/PATTERNS.md`

## Output expectation

The skill should produce both a findings report and an optimized `SKILL.md` proposal.
