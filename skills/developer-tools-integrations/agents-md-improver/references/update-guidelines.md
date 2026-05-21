# AGENTS.md Update Guidelines

## Core Principle

Add only guidance that future Codex sessions need and cannot cheaply infer from code. Prefer concise, operational instructions over broad philosophy.

## What To Add

### Verified commands

```markdown
## Build, Test, and Development Commands
- `just ci` — runs docs audit, TypeScript, UI tests, Rust fmt/clippy/tests.
```

Add commands only after checking the manifest, justfile, CI, or existing docs.

### Scope boundaries

```markdown
This file governs `mcs/mcs-web/ui/**`. Root guidance still applies; this file adds frontend-specific commands and UI verification requirements.
```

### Safety rules

```markdown
Do not edit generated files under `dist/` or local runtime state under `.omx/state/**` unless the task is explicitly recovery-focused.
```

### Non-obvious repo patterns

```markdown
When changing a public skill under `content/skills/<category>/<name>/`, add matching English and Chinese docs pages before running `just docs-audit`.
```

### Working verification ladders

```markdown
For UI changes, run targeted Vitest first, then `just mcs-web-test`; use Playwright only for affected end-to-end flows.
```

## What Not To Add

- Generic coding advice such as "write clean code".
- Explanations that duplicate obvious file names.
- One-off debugging history that will not recur.
- Provider-specific instructions from another CLI unless clearly labeled as non-Codex context.
- Aspirational subagents, MCP servers, or plugins that are not installed or documented.
- User-level private preferences into a repository file unless the user explicitly wants them shared.

## Preserve Existing Content

- Keep human-authored constraints unless they are stale or unsafe.
- Preserve marker-bounded sections exactly.
- Keep bilingual or paired docs instructions aligned when the repo already works that way.
- Keep nested guidance narrow; do not paste root sections into every subtree.

## Suggested Diff Format

```markdown
### Update: `AGENTS.md`

**Why:** The repo has a docs audit gate that fails when public skill docs are missing.

```diff
 ## Testing Guidelines
+When adding a public skill under `content/skills/<category>/<skill>/`, add both
+`docs/skills/<category>/<skill>.md` and `docs/zh/skills/<category>/<skill>.md`
+before running `just docs-audit`.
```
```

## Validation Checklist

Before finalizing:

- [ ] Every new command exists and has the right working directory.
- [ ] Every path exists or is clearly a future target created by the change.
- [ ] Nested files do not contradict parent guidance accidentally.
- [ ] Safety boundaries cover secrets, destructive operations, external production systems, and generated/runtime state.
- [ ] Marker blocks are unchanged unless explicitly repaired.
- [ ] `git diff --check` passes.
