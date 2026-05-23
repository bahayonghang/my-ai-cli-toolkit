# CLAUDE.md Templates

Use these templates as starting points. Keep only sections useful for the current repository. Every template is sized to stay well under the 200-line target.

## Root Project Template

```markdown
# CLAUDE.md

This file provides guidance to Claude Code when working in this repository. It governs the project root; nested `CLAUDE.md` files add subtree-specific guidance on top, additively.

Before broad search or repo-wide grep, read `./code_map.md` and use its search anchors to choose targeted files.

## Repo Shape
- `<dir>/` — <purpose>
- `<dir>/` — <purpose>

## Core Commands
- `<command>` — <what it proves or starts>
- `<command>` — <scope and prerequisites>

## Coding Standards
- <project-specific convention>
- <formatter, linter, or source of truth>

## Testing and Verification
- Prefer targeted checks while iterating.
- Run `<full gate>` before claiming completion for broad changes.

## Safety
- Do not edit `<generated-or-runtime-path>` manually.
- Ask before destructive operations, production calls, or credential changes.

## Nested Documentation
- `packages/api/CLAUDE.md` — backend API stack, local commands, secrets boundary
- `packages/web/CLAUDE.md` — frontend stack, component conventions, test commands
- `.claude/rules/testing.md` — path-scoped TDD rules for `**/*.test.{ts,tsx}`

## Validation and Commits
- Use Conventional Commits.
- Run `<pre-merge gate>` before opening a PR.
```

## Monorepo Package Template

```markdown
# `<package>` Claude Guidance

This file loads lazily when Claude reads files under `<package>/`. Root `CLAUDE.md` still applies; this file only adds package-specific guidance.

For this subtree, start with `<package>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

## Package Purpose
<one-sentence responsibility>

## Stack
- Language: <language and version>
- Framework: <framework>
- Package manager: <pnpm | uv | cargo | ...>

## Local Commands
- `<command>` — run from `<path>`, validates <scope>
- `<test command>` — local test loop
- `<lint or typecheck>` — local static checks

## Boundaries
- Depends on `<package>` for <reason>.
- Do not change `<shared-contract>` without updating <peer packages, docs, tests>.

## Safety
- <local secrets handling, external services, migration rules>
```

## Frontend Subtree Template

```markdown
# Frontend Claude Guidance

Loads lazily when Claude reads files under `<frontend-path>/`. Adds frontend-specific rules on top of root guidance.

For this subtree, start with `<frontend-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

## Stack and Entry Points
- `<src/main>` — app entry
- `<src/components>` — shared components
- `<src/routes>` — route definitions

## Commands
- `<dev command>` — local dev server
- `<test command>` — component/unit tests
- `<e2e command>` — browser flow tests

## UI Conventions
- Preserve accessibility, loading, empty, and error states.
- Verify visual changes with screenshots or browser smoke tests when available.
- Use <design system or component library> primitives; do not introduce ad-hoc styles.
```

## Backend Subtree Template

```markdown
# Backend Claude Guidance

Loads lazily when Claude reads files under `<backend-path>/`. Adds backend-specific rules on top of root guidance.

For this subtree, start with `<backend-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

## Runtime and Entry Points
- `<entry>` — server start
- `<routes>` — API routes
- `<workers>` — background jobs

## Commands
- `<test command>` — backend tests
- `<lint/type command>` — static checks
- `<local dev>` — local server with mock dependencies

## Data and External Services
- Use read-only credentials for local inspection when possible.
- Ask before migrations, production calls, or destructive data changes.
- `<staging endpoint>` is safe to call; `<prod endpoint>` requires explicit approval.
```

## Docs Subtree Template

```markdown
# Docs Claude Guidance

Loads lazily when Claude reads files under `<docs-path>/`. Adds docs-specific rules.

For this subtree, start with `<docs-path>/code_map.md` before broad grep. If the local map is missing, fall back to the nearest parent `code_map.md`.

## Source of Truth
- Content mirrors `<source paths>`.
- English and Chinese pages must stay structurally aligned when both exist.

## Commands
- `<docs dev>` — local preview
- `<docs build or audit>` — validation

## Style
- Keep docs concise and example-driven.
- Update navigation/sidebar when adding pages if required by the docs framework.
```

## Path-Scoped Rule Template (`.claude/rules/*.md`)

Always-on rule (no `paths:` frontmatter, loads every session):

```markdown
---
name: commit-style
---

# Commit Style

- Use Conventional Commits.
- Scope is required for `feat` and `fix`.
- Subject line under 72 characters.
```

Path-scoped rule (loads only when Claude reads matching files):

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.test.{ts,tsx}"
---

# Frontend Testing Rules

- Prefer Vitest with `screen.getByRole`.
- Co-locate test files next to the component.
- Use the shared `renderWithProviders` helper, not bare `render`.
```

Multi-pattern rule:

```markdown
---
paths:
  - "infra/**/*.tf"
  - "infra/**/*.tfvars"
---

# Terraform Rules

- Run `terraform fmt` before committing.
- Plan must be reviewed before apply.
- Never commit `.tfstate` or `.tfstate.backup`.
```

## `@AGENTS.md` Coexistence Template

When the repository runs both Claude Code and Codex and you want a single source of truth, use the official import bridge:

```markdown
# CLAUDE.md

@AGENTS.md

## Claude Code Additions

The shared instructions above govern both Claude Code and Codex. Below are Claude-Code-only adjustments.

- Use plan mode for changes under `src/billing/`.
- Prefer `.claude/rules/testing.md` for TDD rules; do not duplicate them here.
```

Reasons to prefer this bridge over duplicating content:

- Single point of truth keeps both agents reading the same standards.
- Updates in one place propagate to both ecosystems automatically.
- Avoids the drift that copy-paste guarantees.

Note: imports expand at launch, so the size of `AGENTS.md` counts toward the project session budget.

## Root `code_map.md` Template

This template is intentionally identical in structure to the one used by `agents-md-improver` so that both improvers can maintain the same file without conflict.

```markdown
# Repository Code Map

Use this map for navigation and search routing. Behavioral rules, required commands, and safety constraints live in `CLAUDE.md` (and `AGENTS.md` if present).

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

## Nested `code_map.md` Template

```markdown
# `<subtree>` Code Map

Use this map for `<subtree>/` navigation. Behavioral rules live in this subtree's `CLAUDE.md` (or the nearest parent).

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

## Hook Marker Preservation Snippet

When a file already contains hook-managed marker blocks, preserve them exactly. Place new prose outside the markers.

```markdown
## Runtime Markers

Preserve marker-bounded runtime sections exactly unless repairing hook state:

<!-- OMX:RUNTIME:START -->
<!-- generated content; do not edit manually -->
<!-- OMX:RUNTIME:END -->

<!-- OMX:TEAM:WORKER:START -->
<!-- generated content; do not edit manually -->
<!-- OMX:TEAM:WORKER:END -->
```

If an END marker is missing or content drifted outside the markers, flag it in the report rather than rewriting silently.
