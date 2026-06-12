# Error Handling

> How errors are handled in this repository's operational code.

## Overview

This repo uses explicit, user-facing failures instead of hidden recovery logic. Validation scripts should fail fast on bad input, print a concise explanation to stderr, and return a nonzero exit code. Unexpected exceptions are for bugs; expected validation problems should be handled with normal control flow.

## Error Types

- Validation errors: bad metadata, bad command arguments, unsupported file shapes, or malformed source content.
- Policy errors: dangerous shell commands, disallowed generated edits, or invalid repository state.
- Internal errors: unexpected exceptions that indicate a bug in the helper script.

## Error Handling Patterns

- Print expected problems to stderr.
- Use return codes rather than silent fallback.
- Keep error messages specific enough to act on.
- Do not swallow exceptions unless the script can meaningfully continue.
- If a hook blocks something, block it completely rather than half-applying it.

## API Error Responses

There is no HTTP API in this repository. For CLI-style helpers, the standard response is:

- `0` for success
- `1` for validation or policy failure
- A different nonzero code only when a script already uses it to distinguish argument errors from general failures

## Common Mistakes

- Tracebacks for normal validation failures.
- Silent fallback to a default path, agent, or config when the file is missing.
- Continuing after a failing policy check.

## Examples

- `scripts/check.py` prints validation errors for invalid skills and exits `1`.
- `skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py` returns `2` when `--ai` is missing `--agent-model`, `3` when `--why` is required but missing, and `1` for length or format failures.
- `platforms/claude/hooks/pre-bash.py` exits `1` on blocked commands.
- `docs/scripts/sync_docs_catalog.py` exits `1` when generated docs drift from source.
