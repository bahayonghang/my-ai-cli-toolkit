# `platforms/claude/` Code Map

Use this map for `platforms/claude/**` navigation. Behavioral rules and required commands live in `platforms/claude/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
Claude Code agent prompt assets plus hook wiring and hook helper scripts.

## Internal Routing
- `agents/ccw/` — Claude Code workflow agent prompts for planning, execution, search, docs, tests, and issue workflows.
- `agents/specialist/` — specialist role prompts such as Python, TypeScript, CSS, deployment, performance, and spec roles.
- `hooks/hooks.json` — hook event wiring for Claude runtime integration.
- `hooks/pre-bash.py` — Bash preflight and dangerous-command guard logic.
- `hooks/inject-spec.py` — spec-context injection helper.
- `hooks/log-prompt.py` — user-prompt logging helper.

## Search Anchors
- `PreToolUse`, `UserPromptSubmit` — hook event entries in `hooks/hooks.json`.
- `CLAUDE_PLUGIN_ROOT`, `CLAUDE_TOOL_INPUT` — runtime environment variables referenced by hook commands.
- `python3 ${CLAUDE_PLUGIN_ROOT}` — hook command path pattern.
- `frontmatter`, `name:`, `description:` — agent prompt metadata anchors in markdown prompts.

## Generated and Ignored Notes
- `hooks/__pycache__/` and `*.pyc` are Python bytecode artifacts.
- Host-local `.claude/` runtime state is outside this subtree and ignored at the repository root.
