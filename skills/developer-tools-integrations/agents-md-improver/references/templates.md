# AGENTS.md Templates

Use these templates as starting points. Keep only sections that are useful for the current repository.

## Root Repository Template

```markdown
# Repository Guidelines

This `AGENTS.md` governs the repository root and all descendants unless a deeper `AGENTS.md` overrides or narrows the guidance.

## Project Structure
- `<dir>/` — <purpose>
- `<dir>/` — <purpose>

## Build, Test, and Development Commands
- `<command>` — <what it proves or starts>
- `<command>` — <scope and prerequisites>

## Coding Standards
- <project-specific convention>
- <formatter/linter/source-of-truth>

## Testing and Verification
- Prefer targeted checks while iterating.
- Run `<full gate>` before claiming completion for broad changes.

## Safety and Permissions
- Do not edit `<generated-or-secret-path>` manually.
- Ask before destructive, external-production, credential, or history-rewriting operations.

## Codex Workflow Notes
- Use `.codex/skills` for project-local repeatable workflows when present.
- Use `.codex/agents` only for bounded native subagent roles with clear verification duties.
```

## Monorepo Package Template

```markdown
# `<package>` Guidelines

This file governs `<package>/**` and overrides root guidance only for this package.

## Package Purpose
<one-sentence responsibility>

## Local Commands
- `<command>` — run from `<path>`, validates <scope>

## Boundaries
- Depends on `<package>` for <reason>.
- Do not change `<shared-contract>` without updating <peer packages/docs/tests>.

## Local Testing
- `<targeted command>` for local changes.
- `<integration gate>` when public interfaces change.
```

## Frontend Subtree Template

```markdown
# Frontend Guidelines

This file governs `<frontend-path>/**`.

## Stack and Entry Points
- `<src/main>` — app entry
- `<src/components>` — shared components

## Commands
- `<dev command>` — starts local app
- `<test command>` — component/unit tests
- `<e2e command>` — browser flow tests

## UI Safety
- Preserve accessibility, loading, empty, and error states.
- Verify visual changes with screenshots or browser smoke tests when available.
```

## Backend Subtree Template

```markdown
# Backend Guidelines

This file governs `<backend-path>/**`.

## Runtime and Entry Points
- `<entry>` — server start
- `<routes>` — API routes

## Commands
- `<test command>` — backend tests
- `<lint/type command>` — static checks

## Data and External Services
- Use read-only credentials for local inspection when possible.
- Ask before migrations, production calls, or destructive data changes.
```

## Docs Subtree Template

```markdown
# Docs Guidelines

This file governs `<docs-path>/**`.

## Source of Truth
- Content mirrors `<source paths>`.
- English and Chinese pages must stay structurally aligned when both exist.

## Commands
- `<docs dev>` — local preview
- `<docs build/audit>` — validation

## Style
- Keep docs concise and example-driven.
- Update navigation/sidebar when adding pages if required by the docs framework.
```

## OMX Marker Preservation Snippet

```markdown
## Runtime Markers

Preserve marker-bounded runtime sections exactly unless repairing hook state:
- `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`
- `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`
```
