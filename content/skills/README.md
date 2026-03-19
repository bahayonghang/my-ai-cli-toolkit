# `content/skills/`

This directory is the main skill source area for the repository.

It contains both:

- first-party installable skill directories
- `external-skills/`, the curated third-party registry consumed by `mcs-core` / `mcs-web`

## Current category layout

```text
content/skills/
├── academic-skills/
├── ai-llm-skills/
├── diagram-skills/
├── document-skills/
├── git-github-skills/
├── media-skills/
├── skill-meta-skills/
├── tech-stack-skills/
├── workflow-skills/
├── CLAUDE.md
├── README.md
├── check.py
├── default.toml
└── external-skills/
    ├── index.toml
    └── categories/
```

## Required structure for a skill

```text
content/skills/<category>/<skill-name>/
└── SKILL.md
```

Optional subdirectories commonly include:

- `references/`
- `scripts/`
- `assets/`
- `docs/`
- `tests/`

## Metadata notes

`mcs-core` currently reads top-level frontmatter fields such as:

- `name`
- `description`
- `category`
- `tags`
- `version`

Prefer those top-level fields when adding new skills.

## Validation

- `default.toml` controls which categories are part of default install flows    
- `external-skills/` stores the curated external registry used by the Web `npx skills` flow
- `check.py` helps validate `SKILL.md` metadata coverage
  - Example: `python content/skills/check.py content/skills/git-github-skills`
- `just mcs` is the quickest way to verify that a skill is discoverable

## Public docs

If a skill is intended to be part of the public catalog, add matching pages under:

- `docs/skills/<category>/<skill-name>.md`
- `docs/zh/skills/<category>/<skill-name>.md`
