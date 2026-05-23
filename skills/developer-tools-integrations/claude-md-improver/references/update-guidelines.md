# CLAUDE.md Update Guidelines

## Core Principle

Add only guidance that future Claude Code sessions need and cannot cheaply infer from code. Prefer concise, operational instructions over broad philosophy.

Because `CLAUDE.md` loads at every session start (or every time Claude enters a subtree), every line you keep is paid for repeatedly. Cut anything that does not earn its place.

## Division of Labor

| File | Owns |
|---|---|
| Root `CLAUDE.md` (or `./.claude/CLAUDE.md`) | Repo-wide pointers, critical gotchas, top-level commands, safety boundaries, link to root `code_map.md`, index of nested documentation |
| Nested `CLAUDE.md` (`<subtree>/CLAUDE.md` or `<subtree>/.claude/CLAUDE.md`) | Local stack, local commands, local safety, local conventions distinct from parent |
| `.claude/rules/*.md` | Topic rules; with `paths:` frontmatter for path-specific guidance, without it for always-on rules |
| `CLAUDE.local.md` | Per-developer overrides; gitignored, never read by this skill |
| Root `code_map.md` | Top-level routing, entry points, search anchors, generated/ignored paths, verification command index |
| Nested `code_map.md` | Subtree navigation, key files, internal routing, upstream/downstream boundaries |

Keep the boundary strict. If you find directory indexes in `CLAUDE.md`, move them to `code_map.md`. If you find behavioral constraints in `code_map.md`, move them to `CLAUDE.md`.

## What to Add

### Verified commands

```markdown
## Core Commands
- `just ci` — runs docs audit, TypeScript, UI tests, Rust fmt/clippy/tests.
```

Add commands only after checking the manifest, justfile, CI, or existing docs.

### Layering statement (nested files only)

```markdown
This file loads lazily when Claude reads files under `packages/api/`. Root `CLAUDE.md` still applies; this file only adds backend-specific guidance.
```

Without this, readers and Claude both default to the override mental model, which is wrong.

### Explicit code map pointers

```markdown
Before broad grep, read `./code_map.md` and use its search anchors to choose targeted files.
```

```markdown
For this subtree, start with `packages/api/code_map.md` before broad grep. If that file is missing, fall back to `../code_map.md`.
```

Always relative paths. Never `@code_map.md` (that would force a startup load).

### Sibling discovery in the root file

```markdown
## Nested Documentation
- `packages/api/CLAUDE.md` — backend stack, local commands, secrets boundary
- `packages/web/CLAUDE.md` — frontend stack, component conventions
- `.claude/rules/testing.md` — TDD rules (loads when editing `**/*.test.{ts,tsx}`)
```

This is the only mechanism for cross-subtree visibility; sibling files do not load on their own.

### Safety rules that complement (not duplicate) settings

```markdown
## Safety
- Do not edit `.omx/state/**` manually. Files there are managed by hooks.
- Ask before running migrations against the staging database.
```

If `.claude/settings.json` already has a `permissions.deny` for the path, do not rephrase it as soft prose; that creates two sources of truth.

### Non-obvious repo patterns

```markdown
When changing a public skill under `content/skills/<category>/<name>/`, add matching English and Chinese docs pages before running `just docs-audit`.
```

### Path-scoped rules for repeated guidance

If the same instruction applies whenever Claude touches a file pattern, move it into `.claude/rules/<topic>.md` with a `paths:` glob. The root file stays lean and the rule loads only when needed.

## What Not to Add

- Generic LLM advice such as "write clean code", "test your changes", or "understand before changing". Modern models already do these.
- Explanations that duplicate obvious file names.
- Large directory indexes in `CLAUDE.md`; put search navigation in `code_map.md`.
- Nested `CLAUDE.md` files for directories scoring below the creation threshold, for generated outputs, vendored code, dependencies, or build artifacts.
- Vague map references such as "see the code map" without the exact relative path.
- One-off debugging history that will not recur (belongs in commit messages or auto memory).
- Provider-specific instructions from another CLI unless clearly labeled as non-Claude-Code context.
- Aspirational skills, sub-agents, MCP servers, or hooks that are not installed or documented.
- User-level private preferences in a repository file unless the user explicitly wants them shared.
- Content hidden inside block-level `<!-- ... -->` comments expecting Claude to follow it — those are stripped before injection.
- `@import` chains used to "save context"; imports expand at launch and do not save anything.

## Preserve Existing Content

- Keep human-authored constraints unless they are stale or unsafe.
- Preserve hook-managed marker blocks exactly. Examples: `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->`, `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`.
- Preserve `@AGENTS.md` import bridges when the repository runs both Claude Code and Codex; do not duplicate the imported content into `CLAUDE.md`.
- Keep bilingual or paired docs instructions aligned when the repo already works that way.
- Keep nested guidance narrow; do not paste root sections into every subtree.
- Preserve the CLAUDE.md / code_map.md boundary when updating older guidance: move navigational lists to `code_map.md`, but keep mandatory behavior in `CLAUDE.md`.
- Never read `CLAUDE.local.md` content; only confirm it is gitignored.

## Suggested Diff Format

```markdown
### Update: `CLAUDE.md`

**Why:** Root file is 312 lines (target under 200) because frontend testing rules grew over time. Moving them to a path-scoped rule preserves the guidance and shrinks the always-loaded budget.

```diff
-## Frontend Testing
-- Prefer Vitest with `screen.getByRole`.
-- Co-locate test files next to the component.
-- Use the shared `renderWithProviders` helper.
-- Mock `next/router` via the shared `routerMock` fixture.
+## Nested Documentation
+- `.claude/rules/frontend-testing.md` — TDD rules (loads when editing `**/*.test.{ts,tsx}`)
```

### New file: `.claude/rules/frontend-testing.md`

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.test.{ts,tsx}"
---

# Frontend Testing
- Prefer Vitest with `screen.getByRole`.
- Co-locate test files next to the component.
- Use the shared `renderWithProviders` helper.
- Mock `next/router` via the shared `routerMock` fixture.
```
```

This pattern — extract path-specific content from the root file into a `paths:`-scoped rule — is the single highest-leverage refactor for bloated root `CLAUDE.md` files.

## Validation Checklist

Before finalizing edits:

- [ ] Every documented command exists and has the right working directory.
- [ ] Every path mentioned exists or is clearly a future target created by the change.
- [ ] Every `@path/to/file` import resolves on disk; recursion depth ≤ 5.
- [ ] Every `code_map.md` pointer uses an explicit relative path; no `@code_map.md`.
- [ ] Every `.claude/rules/*.md` with `paths:` has valid YAML and globs that match at least one real file.
- [ ] No content was added that duplicates `.claude/settings.json` hard rules.
- [ ] Nested files do not contradict parent guidance accidentally; they add, they do not override.
- [ ] Root `CLAUDE.md` is under 200 lines; if not, propose splitting into `.claude/rules/*.md`.
- [ ] Sibling subtrees mentioned in the root "Nested Documentation" section actually exist.
- [ ] New nested `CLAUDE.md` files meet the creation score threshold or have an explicit user-requested exception.
- [ ] Safety boundaries cover secrets, destructive operations, external production systems, and generated/runtime state.
- [ ] Hook marker blocks are intact with matched start/end pairs.
- [ ] `CLAUDE.local.md` is in `.gitignore` if it exists.
- [ ] `git diff --check` passes.
