# agent-creator

Create, lint, and evaluate **OpenAI Codex custom agents (subagents)** using Codex-native `.toml` files.

## What it does

- Generates subagent TOML files for `.codex/agents/` or `~/.codex/agents/`
- Lints agent TOMLs against the commonly-used schema and best practices
- Runs a small behavior eval suite (with-agent vs baseline) and writes a report

## Key files

- `content/skills/meta-skills/agent-creator/SKILL.md`
- `content/skills/meta-skills/agent-creator/scripts/create_agent_toml.py`
- `content/skills/meta-skills/agent-creator/scripts/lint_agent_toml.py`
- `content/skills/meta-skills/agent-creator/scripts/run_agent_evals.py`

