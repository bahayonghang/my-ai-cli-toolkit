# Bundle Conventions

## Project configuration

Optional project-root `codex-bridge.models.json` applies one model/effort override to bundles created for that project:

```json
{
  "model": "gpt-5.6-sol",
  "reasoning_effort": "high"
}
```

Only `model` and `reasoning_effort` are accepted. Unknown keys are ignored with a warning. In particular, `sandbox` cannot be overridden. One-run `--model` and `--effort` flags take precedence over this file.

## Runtime layout

Configuration and runtime state are intentionally separate:

```text
<project>/codex-bridge.models.json
<project>/.codex-bridge/
  round-1/
    manifest.json
    request.md
    conversation.md
    response.schema.json
    response.json
    extracted-patterns.md
    files/
```

Projects may ignore `.codex-bridge/`; they should not ignore the project configuration when it is meant to be shared.

## Round rules

- Automatic numbering selects the first missing positive round directory.
- Existing round directories are never overwritten.
- `review-iteration` has a hard limit of two business rounds.
- A verification round may exceed `max_rounds` only with `purpose: verify round-N extrapolations` and exactly one absolute previous-round path.
- Verification rounds cannot point to another verification round.

## Path and encoding rules

- Store absolute bundle, project, session, and previous-round paths in the manifest.
- Use UTF-8 JSON and Markdown. Helpers tolerate a UTF-8 BOM on reads and write LF newlines.
- Do not construct shell command strings. `run_bundle.py` passes an argv list and resolves Windows `codex.cmd` before execution.
- Treat `response.json` as evidence only after post-response validation.
