# Commands

## Source layout

Commands are sourced from `content/platforms/<platform>/commands/` when a platform has a command source tree in this repository.

Current live source directories are:

- `content/platforms/antigravity/commands/`
- `content/platforms/claude/commands/`
- `content/platforms/gemini/commands/`
- `content/platforms/trae/commands/`
- `content/platforms/windsurf/commands/`

Current live command files are intentionally small:

- Claude: `init-projects.md`
- Gemini: `export-summary`, `import-summary`, `plan/new`, `plan/impl`
- Antigravity / Trae / Windsurf: `export-summary`, `import-summary`

Codex prompt sources live under `content/platforms/codex/prompts/`, not under `content/platforms/codex/commands/`.

## Install model

MCS does not require every installed platform to have its own source directory.

Instead, each platform declares:

- `commands_source`
- optional `fallback_commands_source`

Examples from `platforms.toml` and `mcs-core` defaults:

- Codex installs prompt-like commands into `prompts/`; the repository also has Codex-specific prompt sources under `content/platforms/codex/prompts/`.
- Qwen, Kiro, Qoder, OpenCode, and similar platforms may declare a fallback command source even when their own source tree is absent.
- Trae CN reuses `trae`.
- App-style platforms such as Antigravity and Windsurf install to `workflows/`.

## What gets installed where

| Platform type | Installed path |
|---------------|----------------|
| Claude-style CLI | `commands/` |
| Codex | `prompts/` |
| Kiro | `steering/` |
| Antigravity / Windsurf | `workflows/` |

The exact per-platform paths are documented in [Installation](/guide/installation) and defined in `platforms.toml` plus `mcs-core` defaults.

## Recommended way to manage commands

- Use `just mcs` for the terminal workflow.
- Use `just web` for the browser workflow.
- Use the command catalog in [/commands/](/commands/) to inspect what the repository currently ships.

## Historical note

Older docs referenced large Claude command families and `zcf` trees that have since been removed from `content/platforms/*/commands/`. Those pages are compatibility references only. The supported and maintained path is the MCS workspace plus direct access to the current source files under `content/platforms/*/commands/` and `content/platforms/codex/prompts/`.
