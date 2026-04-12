# `content/skills/` guidance

This directory contains the repository's main skill source area.

## Scope

Most subdirectories under `content/skills/` are installable skill content consumed by MCS.
Top-level metadata like `default.toml` is not an installable skill. The third-party registry now lives at `content/community-skills-registry/`.

## Conventions

- Put each skill under `content/skills/<category>/<skill-name>/`
- Keep `SKILL.md` as the required entrypoint
- Prefer reusable `references/`, `scripts/`, and `assets/` over bloated inline instructions
- Reuse the existing category structure rather than inventing new top-level folders casually

## Current categories

- `development-workflows`
- `developer-tools-integrations`
- `git-github-collaboration`
- `docs-writing-publishing`
- `research-learning-knowledge`
- `visual-media-design`

## Metadata

For MCS compatibility, prefer top-level frontmatter fields:

- `name`
- `description`
- `category`
- `tags`
- `version`

## Registry note

- the curated third-party registry used by `mcs-core` and `mcs-web` now lives at `content/community-skills-registry/`
- do not place `SKILL.md` inside that registry directory; installable skills still belong in category subdirectories under `content/skills/`

## Release checklist for a new skill

1. create the skill directory in the correct category
2. add `SKILL.md`
3. verify discoverability via `just mcs`
4. add English and Chinese docs pages if the skill is part of the public catalog
5. if a public skill is renamed or removed, rename or archive the matching docs pages so the live catalog stays aligned with directory slugs
