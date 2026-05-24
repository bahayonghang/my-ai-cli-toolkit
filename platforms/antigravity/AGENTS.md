# Antigravity Platform Source Guidelines

This `AGENTS.md` governs `platforms/antigravity/**` and narrows the root guidance for Antigravity platform assets. Root `AGENTS.md` still applies. Before broad search in this subtree, read `./code_map.md`.

## Subtree Purpose
`platforms/antigravity/` contains Antigravity command TOML assets, including session import/export and plan/implementation prompts.

## Local Rules
- Keep command assets as valid TOML with concise `description` fields and self-contained multiline `prompt` strings.
- Preserve existing `.gemini/antigravity` path semantics when path compatibility is relevant; do not reintroduce retired Gemini CLI wording as the visible platform name.
- Do not rename command files or change command paths unless the task explicitly covers downstream command compatibility.
- Keep public command changes aligned with generated docs via `just docs-sync` or `just docs-check`.

## Verification
- For TOML edits, run a TOML parse check over `platforms/antigravity/**/*.toml`.
- For public platform command changes, run `just docs-check`; use `git diff --check` for whitespace sanity.
