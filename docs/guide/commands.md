# Commands

## Source layout

Commands are sourced from `content/platforms/<platform>/commands/`, grouped by platform and then by command family.

Current top-level source directories include:

- `content/platforms/antigravity/commands/`
- `content/platforms/claude/commands/`
- `content/platforms/gemini/commands/`
- `content/platforms/trae/commands/`
- `content/platforms/windsurf/commands/`

Within those folders, the repository keeps nested command families such as:

- `content/platforms/claude/commands/cc/`
- `content/platforms/claude/commands/gh/`
- `content/platforms/claude/commands/issue/`
- `content/platforms/claude/commands/kiro/`
- `content/platforms/claude/commands/memory/`
- `content/platforms/claude/commands/task/`
- `content/platforms/claude/commands/workflow/`
- `content/platforms/claude/commands/zcf/`
- `content/platforms/gemini/commands/plan/`
- `content/platforms/gemini/commands/zcf/`

## Install model

MCS does not require every installed platform to have its own source directory.

Instead, each platform declares:

- `commands_source`
- optional `fallback_commands_source`

Examples from `platforms.toml`:

- Codex does not install managed commands in v1; it uses guidance plus shared skills
- Qwen falls back to `claude`
- Trae CN reuses `trae`
- App-style platforms such as Antigravity and Windsurf install to `workflows/`

## What gets installed where

| Platform type | Installed path |
|---------------|----------------|
| Claude-style CLI | `commands/` |
| Kiro | `steering/` |
| Antigravity / Windsurf | `workflows/` |

The exact per-platform paths are documented in [Installation](/guide/installation) and defined in `platforms.toml`.

## Recommended way to manage commands

- Use `just mcs` for the terminal workflow
- Use `just web` for the browser workflow
- Use the command catalog in [/commands/](/commands/) to inspect what the repository currently ships

## Historical note

Older docs referenced `install.sh`, `install.ps1`, or `src/install.py` as the main command-management entrypoints. Those are not the current repository workflow. The supported and maintained path is the MCS workspace plus direct access to the source files under `content/platforms/*/commands/`.
