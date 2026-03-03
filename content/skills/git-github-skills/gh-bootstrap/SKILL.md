---
name: gh-bootstrap
description: Initialize GitHub repository configuration. Use when setting up new projects or CI/CD workflows.
metadata:
  category: devops
  tags:
    - github
    - setup
    - ci-cd
    - automation
argument-hint: "[project-root]"
allowed-tools: Task, AskUserQuestion, Read, Bash, Glob, Grep, Write
---

1. Ask user for communication language and template language preference.
2. Read project structure to identify languages and frameworks.
3. Call `AskUserQuestion` to collect necessary configuration variables.
4. Scan for existing config files and plan conflict resolution (see [references/RULES.md](references/RULES.md)).
5. Read `specs/template-catalog.md` to map required files to repository URLs.
6. Clone template repositories, perform variable substitution, and write files.
7. Generate execution report with next-step suggestions.

## Mandatory Rules
- **NEVER** write config files from memory; **MUST** use downloaded templates.
- **ALWAYS** replace all variable placeholders (e.g., `{{projectName}}`).
- See [references/RULES.md](references/RULES.md) for detailed architecture and constraints.