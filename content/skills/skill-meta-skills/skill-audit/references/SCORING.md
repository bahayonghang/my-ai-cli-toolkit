# Quality Scoring Criteria (24 pts max)

Three dimensions, 8 checks each. Format deducts from 8; Completeness and Writing add from 0.

## Format (8 pts, deduct per violation)

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | SKILL.md exists | File present with exact name |
| 2 | Directory name format | Kebab-case, no spaces/underscores |
| 3 | No README.md | README.md absent in skill dir |
| 4 | YAML frontmatter | `---` delimited block present |
| 5 | name matches dir | `name:` field equals directory name |
| 6 | description present | Non-empty `description:` in frontmatter |
| 7 | description < 1024 chars | Length under 1024 characters |
| 8 | description no XML | No `<` or `>` in description |

## Completeness (8 pts, +1 per item)

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | license field | Non-empty `license:` in frontmatter |
| 2 | compatibility field | Non-empty, under 500 chars |
| 3 | metadata block | `metadata:` with at least one sub-key |
| 4 | scripts/ directory | Directory exists with files |
| 5 | references/ directory | Directory exists with files |
| 6 | assets/ directory | Directory exists with files |
| 7 | Body has examples | Heading or fenced code block present |
| 8 | Body has error handling | Error/exception guidance present |

## Writing (8 pts, +1 per item)

| # | Check | Pass condition |
|---|-------|---------------|
| 1 | Task boundary | Description >= 40 chars, not vague |
| 2 | Trigger phrase | Contains "Use when" or similar |
| 3 | Progressive disclosure | Body <= 500 tokens with refs/ or scripts/ |
| 4 | English content | >= 70% ASCII in first 2000 chars |
| 5 | Forward ref consistency | All `references/X` and `scripts/X` paths in body exist |
| 6 | Reverse ref consistency | Body references at least one file from each dir |
| 7 | License not placeholder | Not "Unknown", "TBD", "N/A", etc. |
| 8 | Version info | Frontmatter or body contains version |

## JSON output

```json
{
  "score": {
    "format": 8,
    "completeness": 5,
    "writing": 6,
    "total": 19,
    "max": 24,
    "details": { "format": [...], "completeness": [...], "writing": [...] }
  }
}
```

Cross-references: CHECKLIST.md dimensions 1-12, PATTERNS.md P1-P16.
