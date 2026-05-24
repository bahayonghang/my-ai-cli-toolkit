# Codex Triangle Agents

This directory defines a small, explicit handoff model for Codex custom agents:

- `orchestrator`: read-only clarification, decomposition, dependency mapping, and handoff guidance
- `coder`: code implementation, bug fixing, scoped refactors, and relevant verification
- `frontend_ui`: frontend component, styling, interaction, and design-fidelity execution

## When to use which agent

- Use `orchestrator` when the request is ambiguous, multi-step, or needs role splitting before implementation.
- Use `coder` when the implementation target is clear and the primary work is code logic or behavior changes.
- Use `frontend_ui` when the implementation target is clear and the primary work is component structure, styling, states, or interaction quality.
- For frontend requests that also include business logic or API work, run `orchestrator` first so it can split the task before delegating.

## When not to use an agent

- Do not use `coder` for broad planning, UI direction, or open-ended product decisions.
- Do not use `frontend_ui` for backend, API, schema, or architecture work.
- Do not use `orchestrator` to write code or perform edits; it is intentionally `read-only`.

## Default verification

- Templates intentionally omit explicit `model` fields so Codex can inherit the caller, project, or user-level model policy. Pin a model only for a task-specific reason and document that reason in the change.
- Lint the TOMLs with the installed `agent-creator` skill when available:
  `python <agent-creator>/scripts/lint_agent_toml.py platforms/codex/agents --json`
- Before running behavior evals, make the target TOML discoverable by Codex from `.codex/agents/` or `~/.codex/agents/`.
- Run per-agent behavior evals with the local datasets in `platforms/codex/agents/evals/`.
- Use `workspace-write` sandbox for `coder` and `frontend_ui` evals, and `read-only` for `orchestrator`.

## Local eval datasets

- `evals/coder.json`
- `evals/frontend_ui.json`
- `evals/orchestrator.json`

Each dataset includes:

- in-scope behavior
- out-of-scope refusal
- evidence and verification posture
- boundary cases that should trigger handoff instead of scope creep
