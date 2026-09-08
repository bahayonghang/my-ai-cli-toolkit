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

## Exit codes

There is no HTTP API in this repository. CLI-style helpers use:

- `0` for success
- `1` for generic CLI validation or policy failure
- A host-documented nonzero code when that host protocol requires it

Generic CLI exit `1` is not a Claude PreToolUse block. Do not copy Claude
codes as a universal rule for all tools. Other hosts document their own
contracts in [`docs/harnesses.md`](../../../docs/harnesses.md).

### Generic CLI

Validation scripts and generators exit `1` on expected failure. A skill helper
may use other nonzero codes to distinguish argument errors from format
failures. Those helper codes are local to that command and are not a host
hook protocol.

### Claude Code PreToolUse (host protocol exception)

Applies only to `platforms/claude/hooks/pre-bash.py` on PreToolUse. Official
PreToolUse input is stdin JSON. Exit `2` blocks the tool call. Exit `1` does
not block.

- Dangerous-command match: exit `2`.
- Invalid PreToolUse event (bad JSON, missing `tool_input.command`, or other
  malformed event): exit `2`.

### Claude Code UserPromptSubmit (host protocol exception)

Applies only to `platforms/claude/hooks/log-prompt.py` on UserPromptSubmit.
Prompt-log failure is not a permission gate.

- Missing or invalid `session_id`, invalid project directory, invalid JSON,
  or write error: exit `1`, not `2`.

## Common Mistakes

- Tracebacks for normal validation failures.
- Silent fallback to a default path, agent, or config when the file is missing.
- Continuing after a failing policy check.
- Treating generic CLI exit `1` as a Claude PreToolUse block.
- Treating UserPromptSubmit prompt-log failure as a PreToolUse block.
- Copying Claude PreToolUse exit codes as a universal hook protocol.

## Examples

- `scripts/check.py` prints validation errors for invalid skills and exits `1`.
- `skills/git-github-collaboration/git-commit/scripts/compose_commit_message.py` returns `2` when `--ai` is missing `--agent-model`, `3` when `--why` is required but missing, and `1` for length or format failures.
- `platforms/claude/hooks/pre-bash.py` returns `2` for blocked commands and invalid PreToolUse events.
- `platforms/claude/hooks/log-prompt.py` returns `1` on prompt-log failure.
- `docs/scripts/sync_docs_catalog.py` exits `1` when generated docs drift from source.
