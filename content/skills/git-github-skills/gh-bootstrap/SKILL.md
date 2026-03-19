---
name: gh-bootstrap
description: Initialize GitHub repository configuration from vetted upstream templates. Use when setting up repository automation, issue and PR templates, CI workflows, or baseline GitHub project files for a new or existing repo.
category: git-github
tags:
  - github
  - bootstrap
  - templates
  - ci
  - automation
version: 1.1.0
allowed-tools:
  - Task
  - AskUserQuestion
  - Read
  - Bash
  - Glob
  - Grep
  - Write
---

1. Ask user for communication language and template language preference.
2. Detect languages, frameworks, and existing GitHub files with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" detect "$ARGUMENTS"` before planning.
3. Call `AskUserQuestion` to collect necessary configuration variables.
4. Scan for existing config files and plan conflict resolution (see [references/RULES.md](references/RULES.md)).
5. Read `specs/template-catalog.md` to map required files to repository URLs, then use `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" fetch-template ...` to download the chosen template sources.
6. Render files with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" render-template ...` so placeholder replacement is deterministic. Keep `phases/` and `specs/` as reference material, not the execution engine.
7. Validate the generated tree with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" validate-tree <target-root>` and refuse completion if unreplaced `{{placeholders}}` remain.
8. If `rtk` is available, prefer it for project scanning, template inspection, and post-generation diff review. Keep template download and file rendering on the raw script path.

## Mandatory Rules
- **NEVER** write config files from memory; **MUST** use downloaded templates.
- **ALWAYS** replace all variable placeholders (e.g., `{{projectName}}`).
- See [references/RULES.md](references/RULES.md) for detailed architecture and constraints.
