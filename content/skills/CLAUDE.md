# `content/skills/` guidance

This directory contains the repository's main skill source area.

## Scope

Most subdirectories under `content/skills/` are installable skill content consumed by MCS.
Top-level metadata like `default.toml` and the registry directory `external-skills/` are not installable skills.

## Conventions

- Put each skill under `content/skills/<category>/<skill-name>/`
- Keep `SKILL.md` as the required entrypoint
- Prefer reusable `references/`, `scripts/`, and `assets/` over bloated inline instructions
- Reuse the existing category structure rather than inventing new top-level folders casually

## Current categories

- `academic-skills`
- `ai-llm-skills`
- `diagram-skills`
- `document-skills`
- `git-github-skills`
- `media-skills`
- `skill-meta-skills`
- `tech-stack-skills`
- `workflow-skills`
- `frontend-skills`

## Metadata

For MCS compatibility, prefer top-level frontmatter fields:

- `name`
- `description`
- `category`
- `tags`
- `version`

## Registry note

- `external-skills/` is the curated third-party registry used by `mcs-core` and `mcs-web`
- do not place `SKILL.md` inside that registry directory; installable skills still belong in category subdirectories

## Release checklist for a new skill

1. create the skill directory in the correct category
2. add `SKILL.md`
3. verify discoverability via `just mcs`
4. add English and Chinese docs pages if the skill is part of the public catalog
