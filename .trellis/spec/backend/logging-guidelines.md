# Logging Guidelines

> How logging is done in this repository's operational code.

## Overview

Logging in this repo is minimal and local. Most scripts print short status messages to stdout and errors to stderr. Persistent runtime logs are only used where a hook or helper explicitly needs them, and those logs stay outside the tracked source tree.

## Log Levels

- `debug`: only for temporary troubleshooting while developing a helper.
- `info`: short progress messages, counts, or completion summaries.
- `warn`: unusual but recoverable conditions.
- `error`: failed validation, blocked commands, or unrecoverable script failures.

## Structured Logging

- There is no shared logging framework.
- Prefer plain text lines unless a script already emits JSON or a downstream consumer expects machine-readable output.
- Keep prefixes stable when they help grepability, such as `[CWF] BLOCKED`.

## What to Log

- Validation summaries and generated file counts.
- Rejected commands or policy decisions.
- Local runtime prompt snippets when a hook explicitly needs review data.

## What NOT to Log

- Secrets, credentials, tokens, or private prompt bodies.
- Host-local runtime state committed as source.
- Large trace dumps when a short message is enough.

## Examples

- `platforms/claude/hooks/log-prompt.py` writes prompt snippets to `.claude/state/session-<id>.log`.
- `platforms/claude/hooks/pre-bash.py` prints `[CWF] BLOCKED: ...` to stderr for rejected commands.
- `docs/scripts/sync_docs_catalog.py` reports generated doc counts and drift status.
- `scripts/check.py` prints per-skill validation results.
