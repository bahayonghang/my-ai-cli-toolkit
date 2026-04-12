# Creating Skills

## Repository layout

Add new first-party skills under:

```text
content/skills/<category>/<skill-name>/
```

Example:

```text
content/skills/development-workflows/my-skill/
`-- SKILL.md
```

## Recommended directory structure

```text
content/skills/<category>/<skill-name>/
|-- SKILL.md
|-- references/
|-- scripts/
|-- assets/
|-- docs/
`-- tests/
```

Only `SKILL.md` is required. Reuse existing patterns from neighboring skills before adding new subfolders.

## Recommended frontmatter

`mcs-core` currently parses top-level frontmatter fields such as:

- `name`
- `description`
- `category`
- `tags`
- `version`

Recommended example:

```yaml
---
name: my-skill
description: Short description shown in MCS and docs.
category: workflow
tags: [planning, automation]
version: 0.1.0
---
```

## Authoring guidance

- Keep the body imperative and execution-oriented.
- Prefer local references and scripts over long embedded tutorials.
- Use `$SKILL_DIR` for skill-relative paths inside instructions.
- Keep triggers and scope explicit.

## Validation loop

Before publishing a new skill:

1. place it under the correct category in `content/skills/`
2. verify `SKILL.md` is readable and metadata is discoverable by MCS
3. browse it through `just mcs`
4. add or update the matching docs page under `docs/skills/<category>/<skill-name>.md`
5. add the same page under `docs/zh/skills/...`

## Notes

- The docs site does not mirror every reference file under a skill. Document the skill itself, then link or describe the major supporting assets.
- If a skill is intentionally local-only or experimental, keep it out of the public docs until it is ready to be treated as catalog content.
- If a public skill is renamed or removed, rename the live docs page to the new slug or move the old page out of the live catalog instead of leaving stale pages in place.
