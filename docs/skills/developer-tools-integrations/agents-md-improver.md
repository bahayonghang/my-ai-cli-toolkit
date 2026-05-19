# AGENTS.md Improver

Audit and improve Codex `AGENTS.md` guidance files across a repository. It checks scope semantics, nested overrides, executable commands, safety boundaries, and Codex-specific workflow guidance.

## When to use it

- audit or update root `AGENTS.md`
- check nested `AGENTS.md` files for conflicts or stale commands
- convert provider-specific guidance into Codex `AGENTS.md` semantics
- document sandbox, approval, secrets, generated files, or external-service boundaries
- implement an already approved plan for AGENTS.md cleanup

## Workflow

1. discover root and nested `AGENTS.md` files
2. classify their scope and parent/child relationships
3. verify commands and paths against the repository
4. score each file with a Codex-specific quality rubric
5. output a quality report and proposed diff
6. apply targeted edits only after approval, or immediately when executing an approved plan
7. verify with `git diff --check` and relevant repo gates

## Quality focus

- clear scope and override relationships
- real build/test/lint/typecheck commands
- concise architecture and ownership guidance
- explicit safety and permission boundaries
- accurate Codex skills/subagents/plugins/MCP/OMX wording
- preservation of hook-managed marker blocks such as OMX runtime/team markers

## Boundaries

The skill edits repository `AGENTS.md` files only when authorized. It does not edit user-global `~/.codex/AGENTS.md` unless the user explicitly asks. It should not rewrite hook-managed runtime marker blocks or duplicate root guidance into every nested file.
