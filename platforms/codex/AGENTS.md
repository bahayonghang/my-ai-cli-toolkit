# Codex Platform Source Guidelines

This file governs `platforms/codex/**` and narrows the root guidance for Codex platform assets. Root `AGENTS.md` still applies. Before broad search in this subtree, read `./code_map.md`.

## Subtree Purpose
`platforms/codex/` contains source templates for Codex-native assets distributed or copied elsewhere. Treat files here as reusable source artifacts, not as active user-level Codex configuration.

## Local Rules
- Keep reusable agent templates under `agents/` free of stale hardcoded model names unless a task explicitly requires a pinned model.
- Prefer inheriting the caller/repo model and setting only role-appropriate reasoning effort and sandbox boundaries.
- `rules/AGENTS.md` is a distributable rule artifact. When maintaining this repository, edit it as source content; do not let its persona/output rules override the root repository workflow unless the task is specifically to change that exported rule behavior.
- Keep platform documentation and generated docs aligned when changing public platform paths or descriptions.

## Verification
- For template-only edits, run `git diff --check` plus any available TOML parse/lint check.
- For public platform path or docs-impacting edits, run `just docs-sync` or `just docs-check`, then the relevant root gates.
