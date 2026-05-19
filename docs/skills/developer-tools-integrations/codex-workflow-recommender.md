# Codex Workflow Recommender

Read-only recommendations for improving a repository's Codex workflow surface: `AGENTS.md`, Codex skills, native subagents, plugins, MCP servers, config/hooks, CLI runtime commands, and optional OMX workflows.

## When to use it

- analyze how a repo should improve its Codex workflow
- recommend Codex MCP servers, plugins, skills, or subagents
- audit whether `AGENTS.md` scope and nested guidance are enough
- plan safe Codex CLI/App automation without immediately changing config
- distinguish generic Codex capabilities from OMX-specific enhancements

## What it checks

- repository stack, verification gates, and risk boundaries
- root and nested `AGENTS.md` files
- `.codex/skills`, `~/.codex/skills`, `.codex/agents`, and `~/.codex/agents` where relevant
- `codex --help`, `codex mcp --help`, `codex plugin --help`, and related read-only inventory commands
- local config or hook files only when present and readable

## Output shape

The report is structured as:

- Codebase Profile
- Current Codex Surface
- Top Recommendations by category
- Safe Implementation Order
- Verification Plan
- Want me to implement...

The skill does not install plugins, add MCP servers, or edit files. It ends with a safe implementation order the user can approve separately.

## Boundaries

This is a Codex-specific replacement for the old Claude automation recommender. It must not use Claude-only paths or commands as Codex instructions. OMX recommendations are optional and only apply when the current environment actually supports OMX.
