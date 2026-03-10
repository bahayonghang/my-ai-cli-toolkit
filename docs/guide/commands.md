# Commands

## Source layout

Commands are sourced from `content/commands/`, grouped by platform and then by command family.

Current top-level source directories include:

- `antigravity/`
- `claude/`
- `gemini/`
- `trae/`
- `windsurf/`

Within those folders, the repository keeps nested command families such as:

- `claude/cc/`
- `claude/gh/`
- `claude/issue/`
- `claude/kiro/`
- `claude/memory/`
- `claude/task/`
- `claude/workflow/`
- `claude/zcf/`
- `gemini/plan/`
- `gemini/zcf/`

## Install model

MCS does not require every installed platform to have its own source directory.

Instead, each platform declares:

- `commands_source`
- optional `fallback_commands_source`

Examples from `platforms.toml`:

- Codex uses `commands_source = "codex"` and falls back to `claude`
- Qwen falls back to `claude`
- Trae CN reuses `trae`
- App-style platforms such as Antigravity and Windsurf install to `workflows/`

## What gets installed where

| Platform type | Installed path |
|---------------|----------------|
| Claude-style CLI | `commands/` |
| Codex | `prompts/` |
| Kiro | `steering/` |
| Antigravity / Windsurf | `workflows/` |

The exact per-platform paths are documented in [Installation](/guide/installation) and defined in `platforms.toml`.

## Recommended way to manage commands

- Use `just mcs` for the terminal workflow
- Use `just web` for the browser workflow
- Use the command catalog in [/commands/](/commands/) to inspect what the repository currently ships

## Historical note

Older docs referenced `install.sh`, `install.ps1`, or `src/install.py` as the main command-management entrypoints. Those are not the current repository workflow. The supported and maintained path is the MCS workspace plus direct access to the source files under `content/commands/`.
