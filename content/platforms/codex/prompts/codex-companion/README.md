# Codex Companion Prompt Commands

This directory provides Codex prompt commands that wrap the `codex-companion` skill runtime.

They are intended to make the skill feel closer to plugin-style slash commands inside Codex.

## Runtime Dependency

These prompts expect the skill runtime script to exist at one of these locations:

| Priority | Path | Purpose |
|---|---|---|
| 1 | `./content/skills/ai-llm-skills/codex-companion/scripts/codex-companion.mjs` | Run directly from this repository |
| 2 | `~/.agents/skills/codex-companion/scripts/codex-companion.mjs` | Shared installed skill path |
| 3 | `./.agents/skills/codex-companion/scripts/codex-companion.mjs` | Project-local shared skill install |
| 4 | `./.codex/skills/codex-companion/scripts/codex-companion.mjs` | Project-local Codex-specific install |

If none of those exist, the prompt stops and tells the user that `codex-companion` is not installed.

## Prompt Command Table

| Prompt file | Expected slash name | Underlying runtime call | Typical usage |
|---|---|---|---|
| `setup.md` | `/codex-companion:setup` | `node "<script>" setup` | Check Codex CLI, auth, npm, app-server capability |
| `review.md` | `/codex-companion:review` | `node "<script>" review ...` | Read-only review of current repo or `--base <ref>` |
| `adversarial-review.md` | `/codex-companion:adversarial-review` | `node "<script>" adversarial-review ...` | Attack-minded review for regressions, race conditions, edge cases, missing tests |
| `task.md` | `/codex-companion:task` | `node "<script>" task ...` | Delegate diagnosis, research, or implementation to a Codex task thread |
| `status.md` | `/codex-companion:status` | `node "<script>" status ...` | Inspect running or recent jobs |
| `result.md` | `/codex-companion:result` | `node "<script>" result ...` | Show the stored output for a finished job |
| `cancel.md` | `/codex-companion:cancel` | `node "<script>" cancel ...` | Cancel an active job |

## Expected Invocation Style

Codex exposes prompt files from `~/.codex/prompts/`. Because this repository keeps these files under a nested folder, the exact visible command name depends on how the local Codex build renders namespaced prompts.

Common outcomes are:

| Category | Visible prompt name |
|---|---|
| Setup | `/codex-companion:setup` |
| Review | `/codex-companion:review` |
| Adversarial review | `/codex-companion:adversarial-review` |
| Task delegation | `/codex-companion:task` |
| Job status | `/codex-companion:status` |
| Job result | `/codex-companion:result` |
| Job cancel | `/codex-companion:cancel` |

If your local build renders nested prompts differently, use `/prompts` in Codex to inspect the exact installed names.
