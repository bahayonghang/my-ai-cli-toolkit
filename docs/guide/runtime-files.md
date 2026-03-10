# Runtime Files

## Overview

The repository contains runtime-oriented assets beyond installable skills and commands.

Current top-level runtime content lives under:

- `content/hooks/`
- `content/memorys/`
- root-level `CLAUDE.md`

## `content/hooks/`

This folder contains ClaudeKit hook assets:

- `hooks.json`
- `inject-spec.py`
- `log-prompt.py`
- `pre-bash.py`

`hooks.json` currently wires:

- `PreToolUse` hooks for Bash
- `UserPromptSubmit` logging

These are runtime integration assets, not installable skills.

## `content/memorys/`

This directory stores platform-specific runtime prompt or memory files:

- `content/memorys/claude/Unix/CLAUDE.md`
- `content/memorys/claude/Windows/CLAUDE.md`
- `content/memorys/codex/AGENTS.md`

Treat these as runtime seeds or templates, not as normal docs-site pages.

## Root `CLAUDE.md`

The root `CLAUDE.md` documents repository contributor guidance and current architecture conventions for the codebase itself.

It is not the same thing as:

- an installed Claude user prompt
- a skill definition
- a generated runtime memory file

## Prompt-related note

The MCS codebase still has a prompt update path for platforms that define `prompt_file`, with Claude being the default case. If you are changing runtime prompt behavior, inspect:

- `platforms.toml`
- `mcs/mcs-core/src/core/prompt.rs`
- the runtime assets under `content/memorys/` and `content/hooks/`

## Why this matters in docs

Earlier docs treated `prompts/` as the primary runtime source directory. In this repository, the real picture is broader:

- contributor instructions at the root
- hooks under `content/hooks/`
- memory/runtime files under `content/memorys/`
- prompt update logic in `mcs-core`
