# AGENTS.md Templates

Use these templates as starting points. Keep only sections that are useful for the current repository.

## Root Repository Template

```markdown
# Repository Guidelines

This `AGENTS.md` governs the repository root and all descendants unless a deeper `AGENTS.md` overrides or narrows the guidance.

Before broad search or repo-wide grep, read `./code_map.md` and use its search anchors to choose targeted files.

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

For this subtree, start with `<package>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

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

For this subtree, start with `<frontend-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

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

For this subtree, start with `<backend-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

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

For this subtree, start with `<docs-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

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

## Root code_map.md Template

```markdown
# Repository Code Map

Use this map for navigation and search routing. Behavioral rules, required commands, and safety constraints live in `AGENTS.md`.

## Top-Level Routing
- `<dir>/` — <responsibility>; start here for <task type>
- `<dir>/` — <responsibility>; start here for <task type>

## Key Entrypoints
- `<path>` — <runtime, CLI, library, or app entry>
- `<path>` — <configuration or public contract entry>

## Search Anchors
- `<symbol-or-string>` — <what it locates and when to search for it>
- `<file-pattern>` — <why it matters>

## Generated, Vendored, and Ignored Paths
- `<path>/` — generated/build output; do not edit by hand
- `<path>/` — vendored/third-party/dependency path; skip during guidance creation

## Verification Command Index
- `<command>` — <scope and expected use>
- `<command>` — <scope and expected use>
```

## Nested code_map.md Template

```markdown
# `<subtree>` Code Map

Use this map for `<subtree>/**` navigation. Behavioral rules and local commands live in this directory's `AGENTS.md` or the nearest parent `AGENTS.md`.

## Subtree Responsibility
<one-sentence responsibility and why this subtree has its own map>

## Internal Routing
- `<dir-or-file>` — <responsibility>; start here for <task type>
- `<dir-or-file>` — <responsibility>; start here for <task type>

## Key Files
- `<path>` — <entry point, public contract, test fixture, or config>
- `<path>` — <entry point, public contract, test fixture, or config>

## Upstream and Downstream Boundaries
- Upstream: `<path-or-package>` provides <contract>
- Downstream: `<path-or-package>` consumes <contract>

## Local Search Anchors
- `<symbol-or-string>` — <what it locates>
- `<file-pattern>` — <what it locates>

## Generated or Ignored Local Paths
- `<path>/` — <reason to skip or regenerate instead of editing>
```

## OMX Marker Preservation Snippet

```markdown
## Runtime Markers

Preserve marker-bounded runtime sections exactly unless repairing hook state:
- `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`
- `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`
```
