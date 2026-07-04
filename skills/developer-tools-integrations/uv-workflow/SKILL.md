---
name: uv-workflow
description: Use when a coding agent needs to run Python code, modules, one-liners, tools, tests, or standalone scripts through uv, or create and maintain PEP 723 scripts with uv init/add/remove --script. Avoid direct python/python3 shell entrypoints.
category: developer-tools-integrations
tags:
  - uv
  - python
  - scripts
  - dependencies
  - tooling
version: 0.1.0
argument-hint: "[python-command-or-script-task]"
allowed-tools: Read, Write, Edit, Bash
---

# uv Workflow

Use `uv` as the entrypoint for Python execution and standalone script management.

## Core Rules

- Do not run `python` or `python3` as the shell entrypoint.
- Translate direct Python commands into the closest `uv` form before running them.
- `python` inside `uv run ...` is acceptable because `uv` controls interpreter selection and environment setup.
- When sandboxed or when cache writes may fail, set `UV_CACHE_DIR` to a writable temporary directory before running `uv`.
- For standalone PEP 723 scripts, let `uv` manage inline metadata. Do not hand-edit metadata blocks.

## Command Map

| Need | Use |
| --- | --- |
| Run a script | `uv run path/to/script.py` |
| Run a module | `uv run -m package.module` |
| Run a one-liner | `uv run python -c "print('hello')"` |
| Run a dependency-provided tool | `uv run tool-name` |
| Add an ad hoc dependency | `uv run --with package python -c "..."` |
| Run tests | `uv run pytest` or `uv run -m pytest` |
| Create a standalone script | `uv init --script path/to/script.py` |
| Add a script dependency | `uv add --script path/to/script.py package` |
| Remove a script dependency | `uv remove --script path/to/script.py package` |

## Standalone Script Workflow

For a new single-file script:

1. Initialize it with `uv init --script path/to/script.py`.
2. Add dependencies with `uv add --script path/to/script.py <package>`.
3. Edit the Python code normally.
4. Run it with `uv run path/to/script.py`.
5. Remove dependencies with `uv remove --script path/to/script.py <package>`.

Use `uv init --script` even when the script already exists conceptually and only needs to be created on disk.

## Scope Boundary

Use this skill for Python execution, Python tools, tests, one-liners, and standalone PEP 723 scripts.

If the task is about a full Python project with `pyproject.toml`, use project-oriented `uv` commands instead of script-specific metadata commands. Keep `uv` as the entrypoint, but do not force `uv init --script` or `uv add --script` onto project workflows.

## More Patterns

Read `references/uv-command-patterns.md` for PowerShell and POSIX cache setup, script lifecycle examples, and project-vs-script guidance.
