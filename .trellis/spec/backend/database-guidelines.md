# Database Guidelines

> This repository is file-backed, not database-backed.

## Overview

There is no application database, ORM, or migration workflow in this repository. Source-of-truth data lives in markdown, JSON, TOML, and generated ESM files. If a task introduces persistent state, prefer the owning asset's file format and keep the storage localized to that subtree.

## Query Patterns

- Read files directly from disk instead of introducing a query layer.
- Parse frontmatter, JSON, or TOML in small scripts, then regenerate derived output when needed.
- Keep discovery deterministic: the same source files should produce the same generated docs.
- Avoid network lookups or remote services for repository metadata that already exists on disk.

## Migrations

- There are no schema migrations.
- When a file-backed format changes, update the source files and the generator together, then rerun the relevant sync or validation command.
- Do not introduce SQLite, Prisma, or another database just to store catalog or metadata state.

## Naming Conventions

- Use the owning asset's native filename conventions instead of table-style naming.
- Skill metadata stays in `SKILL.md`.
- Hook wiring stays in `hooks.json`.
- Static fixtures stay in files such as `evals/evals.json` and `test-prompts.json`.

## Common Mistakes

- Treating file scans as if they were database queries.
- Duplicating source data in both the authoring file and a second hand-maintained cache.
- Introducing a database layer for data that is already a deterministic file tree.

## Examples

- `scripts/check.py` reads `SKILL.md` frontmatter from disk.
- `docs/scripts/sync_docs_catalog.py` parses `SKILL.md` and `hooks.json` directly.
- `skills/**/evals/evals.json` and `skills/**/test-prompts.json` hold static fixtures.
- `platforms/claude/hooks/hooks.json` is runtime wiring, not a persisted database record.
