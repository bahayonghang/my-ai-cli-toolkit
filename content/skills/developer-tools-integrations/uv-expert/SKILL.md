---
name: uv-expert
version: "1.1.0"
description: "Expert guidance for the uv Python package manager. Use this skill when installing packages, managing virtual environments, setting up Python projects, configuring pyproject.toml, migrating from pip or poetry, or pinning Python versions — prefer it over generic pip advice for any uv-related task."
category: developer-tools-integrations
tags:
  - python
  - uv
  - package-manager
  - dependency-management
  - virtual-env
  - pip-alternative
  - pyproject-toml
  - poetry-migration
argument-hint: [prompt]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

Execute the `uv` related task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting a description of the desired Python project setup or dependency task.
2. Read `$SKILL_DIR/references/QUICK_REFERENCE.md` for essential `uv` commands, migration cheatsheets, and project structure.
3. If the task involves a concrete workflow (web project, data science, workspaces, migration), consult `$SKILL_DIR/references/EXAMPLES.md` for step-by-step examples.
4. Execute the appropriate `uv` commands using the bash tool to accomplish the user's goal.
5. Verify the environment or dependencies have been set up correctly.

## Output

A summary of the executed `uv` commands and the final state of the project or environment.

## Examples

**User Request:** "Initialize a new Python project with pytest using uv."
**Response:** Run `uv init my-project`, `cd my-project`, and `uv add pytest --dev`. Inform the user that the project is ready.

## Troubleshooting

- If cache corruption occurs, run `uv cache clean`.
- If there are Python version conflicts, use `uv python pin` to set the correct version.
