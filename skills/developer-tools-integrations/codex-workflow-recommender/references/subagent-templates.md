# Codex native subagent recommendations

Load this reference only for independently delegable work with bounded
ownership. Project agents live in `.codex/agents`; user agents live in
`~/.codex/agents`.

## Hard decision gate

Recommend a subagent only when the job can run independently, has a clear file
or decision boundary, benefits from separate context, and has an observable
handoff/check. A direct prompt, AGENTS rule, or skill is smaller for work that
cannot be delegated cleanly.

Check existing native agents and plugin-provided roles before adding one. Name
the expected sandbox, tool/data access, escalation conditions, and how the main
agent verifies the handoff.

## Dated standalone schema

The 2026-07-23 official custom-agent reference requires `name`, `description`,
and `developer_instructions`. Normal supported session config such as `model`,
`model_reasoning_effort`, `sandbox_mode`, `mcp_servers`, and `skills.config` is
version-sensitive; use it only when current docs/runtime confirm it.

```toml
name = "repo-coder"
description = "Implement scoped repository changes and run relevant checks."
sandbox_mode = "workspace-write"
developer_instructions = """
Own only the assigned files. Preserve unrelated changes, run targeted checks,
and report changed files, failures, and remaining risk.
"""
```

Avoid hardcoded model names in reusable templates unless repository policy pins
one. Lint the TOML and run one bounded handoff before team adoption. Creating the
agent requires separate approval.
