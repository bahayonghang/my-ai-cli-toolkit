# `platforms/claude/` Code Map

Use this map for `platforms/claude/**` navigation. Behavioral rules and required commands live in `platforms/claude/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
Claude Code agent prompt assets plus hook wiring and hook helper scripts.

## Internal Routing
- `agents/ccw/` — Claude Code workflow agent prompts for planning, execution, search, docs, tests, and issue workflows.
- `agents/specialist/` — specialist role prompts such as Python, TypeScript, CSS, deployment, performance, and spec roles.
- `hooks/hooks.json` — hook event wiring for Claude runtime integration.
- `hooks/pre-bash.py` — Bash PreToolUse guard. Reads official stdin JSON `tool_input.command`.
- `hooks/log-prompt.py` — UserPromptSubmit logger keyed by event `session_id` and event `cwd`.
- `hooks/tests/` — stdlib unittest coverage for hook stdin, exit codes, and session isolation.

## Search Anchors
- `PreToolUse`, `UserPromptSubmit` — hook event entries in `hooks/hooks.json`.
- `CLAUDE_PLUGIN_ROOT` — plugin-root variable in quoted hook command paths.
- `python "${CLAUDE_PLUGIN_ROOT}` — hook command path pattern.
- `frontmatter`, `name:`, `description:` — agent prompt metadata anchors in markdown prompts.

## Generated and Ignored Notes
- `hooks/__pycache__/` and `*.pyc` are Python bytecode artifacts.
- Host-local `.claude/` runtime state is outside this subtree and ignored at the repository root.
