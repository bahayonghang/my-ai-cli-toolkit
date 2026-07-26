# Claude Context Update Guidelines

## Core Principle

Add only guidance that future Claude Code sessions need and cannot cheaply infer from code. Prefer concise, operational instructions over broad philosophy.

Because `CLAUDE.md` loads at every session start (or every time Claude enters a subtree), every line you keep is paid for repeatedly. Cut anything that does not earn its place.

## Delete Before You Add

Most context layers improve more from removals than from additions. Run these passes first, in order (full rationale in `context-engineering-claude5.md`):

1. **Conflict pass** — read all layers that load together and list every pair of instructions that pull in opposite directions. Additive loading means both arrive; Claude pays reasoning cost reconciling them. Delete one side or scope it explicitly.
2. **Obvious pass** — delete what Claude learns from one `ls`, one manifest read, or the file names. Framework defaults, directory listings, and "we use TypeScript" all fail this test.
3. **Absolutes pass** — for every `NEVER` / `ALWAYS` / `MUST` / `DO NOT`, ask whether the prevented mistake is expensive. Keep it for secrets, destructive operations, production deploys, PII, and money movement. Rewrite the rest as intent, or drop it when the model's default already matches.
4. **Memory pass** — move episodic content (past decisions, one-off debugging history) out; auto memory covers it.
5. **Extraction pass** — multi-step procedures become skills the file points to; path-specific rules become `.claude/rules/*.md` with a `paths:` glob; navigation goes to `code_map.md`.

Apply the official per-line test to whatever survives: _"Would removing this cause Claude to make mistakes?"_

## Phrase for Judgement, Not Compliance

Write the intent and the constraint that makes it non-obvious; let Claude apply it.

```markdown
<!-- over-constrained: wrong for a real subset of prompts -->

NEVER write multi-line comment blocks. One short line max.

<!-- judgement-phrased: transfers the actual goal -->

Write code that reads like the surrounding code: match its comment density, naming, and idiom.
```

The exception is safety. A boundary that protects credentials, production data, or irreversible operations should stay absolute and specific.

## Division of Labor

| File                                                                        | Owns                                                                                                                                   |
| --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Root `CLAUDE.md` (or `./.claude/CLAUDE.md`)                                 | Repo-wide pointers, critical gotchas, top-level commands, safety boundaries, link to root `code_map.md`, index of nested documentation |
| Nested `CLAUDE.md` (`<subtree>/CLAUDE.md` or `<subtree>/.claude/CLAUDE.md`) | Local stack, local commands, local safety, local conventions distinct from parent                                                      |
| `.claude/rules/*.md`                                                        | Topic rules; with `paths:` frontmatter for path-specific guidance, without it for always-on rules                                      |
| `CLAUDE.local.md`                                                           | Per-developer overrides; gitignored, never read by this skill                                                                          |
| Root `code_map.md`                                                          | Top-level routing, entry points, search anchors, generated/ignored paths, verification command index                                   |
| Nested `code_map.md`                                                        | Subtree navigation, key files, internal routing, upstream/downstream boundaries                                                        |
| Skills                                                                      | Multi-step procedures, domain workflows, team opinions — loaded on demand, referenced from `CLAUDE.md` rather than inlined             |
| Auto memory                                                                 | Session facts, past decisions, debugging history — saved automatically; never pasted into guidance files                               |
| `~/.claude/CLAUDE.md`, `~/.claude/rules/`                                   | Cross-project personal preference; in scope only when the user chose the 全局 scope                                                    |

Keep the boundary strict. If you find directory indexes in `CLAUDE.md`, move them to `code_map.md`. If you find behavioral constraints in `code_map.md`, move them to `CLAUDE.md`. If you find a procedure with steps, name the skill it belongs in — this skill flags the extraction but does not author skills.

## Global Scope Rules

These apply only when the user chose 全局 and the target is `~/.claude/**`:

- The scope answer authorizes the edits; still show the diff before writing, as with any other scope.
- Anything naming one repository's paths, commands, or conventions does not belong in a global file. Propose moving it to that repository's `CLAUDE.md`.
- Keep global content to preferences that hold across every project: communication style, tool defaults, personal safety boundaries, credential handling.
- Managed policy files (`/etc/claude-code/CLAUDE.md`, `C:\Program Files\ClaudeCode\CLAUDE.md`, the macOS Application Support path) stay read-only under every scope. Report findings; never edit.
- `~/.claude` is usually not a git repository — `git diff --check` will not apply. State that verification was manual.

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

### Pointers to rich references

```markdown
The request/response contract lives in `packages/api/src/schema.ts`; read it before changing any handler.
Acceptance for the import flow is `tests/import.spec.ts` — treat the test file as the spec.
```

A typed interface, a test suite, an HTML mockup, or a rubric carries the intent more precisely than prose restating it. Point at the artifact and delete the paraphrase.

## What Not to Add

- Generic LLM advice such as "write clean code", "test your changes", or "understand before changing". Modern models already do these.
- Absolute rules on low-stakes matters. They were needed for weaker models; on current models they override judgement that would have been correct.
- Anything derivable from the file tree, a manifest, or the file names themselves.
- Role framing, coding philosophy, or tone instructions — that is system-prompt territory, not `CLAUDE.md`.
- Session memory: past decisions, one-off debugging history, "we tried X and it failed". Auto memory handles it.
- Few-shot walls where a clearer parameter name, enum, or typed signature would guide better.
- Multi-step procedures that should be a skill the file points to.
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

````markdown
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
````

This pattern — extract path-specific content from the root file into a `paths:`-scoped rule — is the single highest-leverage refactor for bloated root `CLAUDE.md` files.

## Validation Checklist

Before finalizing edits:

- [ ] Every documented command exists and has the right working directory.
- [ ] Every path mentioned exists or is clearly a future target created by the change.
- [ ] Every `@path/to/file` import resolves on disk; recursion depth ≤ 4.
- [ ] Every `code_map.md` pointer uses an explicit relative path; no `@code_map.md`.
- [ ] Every `.claude/rules/*.md` with `paths:` has valid YAML and globs that match at least one real file.
- [ ] No content was added that duplicates `.claude/settings.json` hard rules or another layer's instruction.
- [ ] Nested files do not contradict parent guidance accidentally; they add, they do not override.
- [ ] No pair of instructions across the loaded layers pulls in opposite directions.
- [ ] Every surviving absolute rule protects an expensive mistake; the rest read as intent.
- [ ] Nothing added is derivable from the file tree or a manifest.
- [ ] Root `CLAUDE.md` is under 200 lines; if not, propose splitting into `.claude/rules/*.md` or a skill.
- [ ] Sibling subtrees mentioned in the root "Nested Documentation" section actually exist.
- [ ] New nested `CLAUDE.md` files meet the creation score threshold or have an explicit user-requested exception.
- [ ] Safety boundaries cover secrets, destructive operations, external production systems, and generated/runtime state.
- [ ] Hook marker blocks are intact with matched start/end pairs.
- [ ] `CLAUDE.local.md` is in `.gitignore` if it exists.
- [ ] `git diff --check` passes (repository scope; under the global scope, state that verification was manual).
