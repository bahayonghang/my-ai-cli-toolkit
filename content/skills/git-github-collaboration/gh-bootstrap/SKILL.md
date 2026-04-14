---
name: gh-bootstrap
description: Initialize GitHub repository configuration from vetted upstream templates. Use when setting up repository automation, issue and PR templates, CI workflows, or baseline GitHub project files for a new or existing repo.
category: git-github-collaboration
tags:
  - github
  - bootstrap
  - templates
  - ci
  - automation
version: 1.2.0
allowed-tools:
  - Task
  - AskUserQuestion
  - Read
  - Bash
  - Glob
  - Grep
  - Write
---

1. Ask user for communication language and template language preference. Also ask for the desired mode: **quick** (sensible defaults, minimal interaction), **custom** (choose specific templates), or **full** (all available templates). See [phases/02.1-quick-mode.md](phases/02.1-quick-mode.md), [phases/02.2-custom-mode.md](phases/02.2-custom-mode.md), and [phases/02.3-full-mode.md](phases/02.3-full-mode.md) for mode-specific behavior.
2. Detect languages, frameworks, and existing GitHub files with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" detect "$ARGUMENTS"` before planning. If detection returns no languages (empty project or unrecognized stack), ask the user to specify the primary language manually instead of guessing.
3. Call `AskUserQuestion` to collect necessary configuration variables.
4. Scan for existing config files and plan conflict resolution (see [references/RULES.md](references/RULES.md)). Never overwrite existing files without explicit user approval.
5. Read `specs/template-catalog.md` to map required files to repository URLs, then use `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" fetch-template ...` to download the chosen template sources. If a template download fails (network error, 404, timeout), report which template failed and offer to skip it or retry.
6. Render files with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" render-template ...` so placeholder replacement is deterministic. Keep `phases/` and `specs/` as reference material, not the execution engine.
7. Validate the generated tree with `python "$SKILL_DIR/scripts/gh_bootstrap_runtime.py" validate-tree <target-root>` and refuse completion if unreplaced `{{placeholders}}` remain.
8. If `rtk` is available, prefer it for project scanning, template inspection, and post-generation diff review. Keep template download and file rendering on the raw script path.

## Mandatory Rules
- **NEVER** write config files from memory; **MUST** use downloaded templates.
- **ALWAYS** replace all variable placeholders (e.g., `{{projectName}}`).
- See [references/RULES.md](references/RULES.md) for detailed architecture and constraints.
