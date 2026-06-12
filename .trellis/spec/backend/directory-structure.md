# Directory Structure

> How backend code is organized in this project.

---

## Overview

<!--
Document your project's backend directory structure here.

Questions to answer:
- How are modules/packages organized?
- Where does business logic live?
- Where are API endpoints defined?
- How are utilities and helpers organized?
-->

(To be filled by the team)

---

## Directory Layout

```
skills/
├── <category>/
│   └── <skill-name>/
│       ├── SKILL.md
│       ├── references/
│       └── evals/

<skill-name>-workspace/
├── skill-snapshot/
└── iteration-*/
```

---

## Module Organization

Installable skill packages live under `skills/<category>/<skill-name>/`.
Only publishable package files belong there: `SKILL.md`, bundled references,
scripts, assets, tests, and eval definitions intended for the package.

Skill-creator execution workspaces belong at the repository root as
`<skill-name>-workspace/`, not under `skills/`. The docs catalog and skill
validator recursively scan `skills/`, so placing `skill-snapshot/` or
`iteration-*` output under `skills/` makes local eval artifacts look like
publishable skills and can create duplicate docs entries or metadata warnings.

---

## Naming Conventions

<!-- File and folder naming rules -->

(To be filled by the team)

---

## Examples

<!-- Link to well-organized modules as examples -->

(To be filled by the team)
