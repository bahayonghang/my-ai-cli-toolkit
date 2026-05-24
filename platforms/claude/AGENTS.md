# Claude Platform Source Guidelines

This `AGENTS.md` governs `platforms/claude/**` and narrows the root guidance for Claude Code platform assets. Root `AGENTS.md` still applies. Before broad search in this subtree, read `./code_map.md`.

## Subtree Purpose
`platforms/claude/` contains Claude-oriented agent prompt assets and runtime hook assets that can be copied or linked into Claude Code environments.

## Local Rules
- Keep agent markdown prompts under `agents/` scoped to their role; avoid copying repository-wide process rules into individual prompts unless the exported asset requires them.
- Keep hook behavior small and auditable. `hooks/hooks.json` should describe hook wiring, while Python files under `hooks/` should contain the executable logic.
- Do not commit host-local hook state, secrets, or runtime logs. `log-prompt.py` may write local runtime state outside this source tree; that state is not repository content.
- Preserve JSON compatibility in `hooks/hooks.json` and keep hook command paths consistent with the runtime variables already used here.
- When hook or platform catalog content changes, keep generated docs aligned with `just docs-sync` or `just docs-check`.

## Verification
- For hook Python changes, run `just python-check`.
- For `hooks/hooks.json`, run a JSON parse check such as `python -m json.tool platforms/claude/hooks/hooks.json`.
- For public platform or hook catalog changes, run `just docs-check`; use `git diff --check` for whitespace sanity.
