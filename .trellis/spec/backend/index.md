# Backend Development Guidelines

> Repo-side conventions for non-UI plumbing: validators, hook scripts, generators, and other operational code.

## Overview

This repository does not have a traditional application backend or database layer. The backend section documents the code that keeps the repo itself consistent: Python validation scripts under `scripts/`, runtime hooks under `platforms/claude/hooks/`, docs/catalog generators under `docs/scripts/`, and skill-local helpers under `skills/**/scripts/`.

## Guidelines Index

| Guide | Description | Status |
|-------|-------------|--------|
| [Directory Structure](./directory-structure.md) | Where operational code, hook scripts, and helpers live | Documented |
| [Database Guidelines](./database-guidelines.md) | File-backed data, no ORM, no migrations | Documented |
| [Error Handling](./error-handling.md) | Validation failures, exit codes, and stderr output | Documented |
| [Quality Guidelines](./quality-guidelines.md) | Validation gates, tests, and review standards | Documented |
| [Logging Guidelines](./logging-guidelines.md) | Console output and local runtime logs | Documented |

## How to Keep These Guidelines Current

1. Document actual repository behavior, not aspirations.
2. Tie rules to real files in this repo.
3. Note when a subtree is source material versus generated output.
4. Update the guide when a new helper, hook, or generator changes the conventions.

## Examples

- `scripts/check.py` validates skill metadata from disk.
- `platforms/claude/hooks/pre-bash.py` blocks dangerous commands.
- `skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py` validates commit-message arguments and composes output.
- `docs/scripts/sync_docs_catalog.py` reads source assets and writes generated docs pages.

**Language**: All documentation should be written in English.
