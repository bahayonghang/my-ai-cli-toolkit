# `platforms/antigravity/` Code Map

Use this map for `platforms/antigravity/**` navigation. Behavioral rules and required commands live in `platforms/antigravity/AGENTS.md` and the root `AGENTS.md`.

## Subtree Responsibility
Antigravity command catalog source files expressed as TOML prompt assets.

## Internal Routing
- `commands/export-summary.toml` — session summary export command prompt.
- `commands/import-summary.toml` — session summary import/restore command prompt.
- `commands/import- summary.toml` — currently present import-summary variant with a space in the filename; search alongside `import-summary.toml` before compatibility work.
- `commands/plan/new.toml` — read-only planning-mode command prompt.
- `commands/plan/impl.toml` — implementation-mode command prompt.

## Search Anchors
- `description =` — command summary field.
- `prompt = """` — command body field.
- `session_context.md` — session import/export handoff filename.
- `Planning Mode`, `Implementation Mode`, `Context Restoration Mode`, `Session Export Mode` — command behavior anchors.
- `.gemini/antigravity` — compatibility path-family anchor when present in platform docs or prompts.

## Generated and Ignored Notes
- No generated files are expected directly under this subtree.
- Root `.antigravitycli/` is local runtime state and is ignored outside this source tree.
