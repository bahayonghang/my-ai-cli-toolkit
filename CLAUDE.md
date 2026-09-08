# CLAUDE.md

@AGENTS.md

## Claude Code loader

Claude Code loads this file and nested `CLAUDE.md` files additively. Shared repository rules come from the `@AGENTS.md` import above. Do not copy CI, commit, or directory rules into this file.

`@AGENTS.md` is the documented import bridge. The import expands at session start; it does not reduce context cost.

Claude-specific source in this repository:

- `platforms/claude/agents/` — agent prompt assets
- `platforms/claude/hooks/` — hook wiring (`hooks.json`) and scripts
- `platforms/claude/AGENTS.md` — subtree rules for those assets

Native instruction, skill, hook, subagent, and permission facts: [`docs/harnesses.md`](docs/harnesses.md) ([English](docs/en/harnesses.md)). Do not apply Codex per-layer `AGENTS.md` selection to Claude. Hook files in this repo are not proof that a Claude Code client has registered them.
