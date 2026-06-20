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
allowed-tools: AskUserQuestion, Read, Bash, Glob, Grep, Write
---

> In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path; it is not an environment variable. The runtime script `gh_bootstrap_runtime.py` is the only execution engine — never hand-roll the detect / fetch / render / validate steps.

1. Ask the user for communication language and template language preference, plus the desired mode: **quick** (sensible defaults, minimal interaction), **custom** (choose specific templates), or **full** (all available templates).
2. Detect languages, frameworks, and existing GitHub files with `python "<skill-dir>/scripts/gh_bootstrap_runtime.py" detect "$ARGUMENTS"` before planning. If detection returns no languages (empty project or unrecognized stack), ask the user to specify the primary language manually instead of guessing.
3. Call `AskUserQuestion` to collect necessary configuration variables (project name, GitHub owner/repo, author, license, and any component-specific values).
4. Scan for existing config files and plan conflict resolution. Never overwrite existing files without explicit user approval.
5. Read `specs/template-catalog.md` to map required files to repository URLs, then use `python "<skill-dir>/scripts/gh_bootstrap_runtime.py" fetch-template ...` to download the chosen template sources. If a template download fails (network error, 404, timeout), report which template failed and offer to skip it or retry.
6. Render files with `python "<skill-dir>/scripts/gh_bootstrap_runtime.py" render-template ...` so placeholder replacement is deterministic.
7. Validate the generated tree with `python "<skill-dir>/scripts/gh_bootstrap_runtime.py" validate-tree <target-root>` and refuse completion if unreplaced `{{placeholders}}` remain.

## Mandatory Rules

- **NEVER** write config files from memory; **MUST** render from downloaded templates.
- **ALWAYS** replace `{{variable}}` placeholders (e.g. `{{projectName}}`); **NEVER** alter GitHub Actions expressions (`${{ github.* }}`, `${{ secrets.* }}`) or action version pins (e.g. `@v4`). The renderer only substitutes `{{...}}`.
- Output targets `.github/workflows/`, issue templates, PR templates, and baseline community files.
