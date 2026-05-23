# AGENTS.md Update Guidelines

## Core Principle

Add only guidance that future Codex sessions need and cannot cheaply infer from code. Prefer concise, operational instructions over broad philosophy.

Keep `AGENTS.md` and `code_map.md` separate:

- Root `AGENTS.md` should preserve repo-wide behavior constraints, verified commands, safety boundaries, review/testing expectations, and an explicit `./code_map.md` pointer.
- Root `code_map.md` should carry top-level organization, entry points, search anchors, generated/ignored paths, and a verification command index.
- Nested `AGENTS.md` should only contain local rules that must be obeyed inside that subtree and must explicitly point to the local or nearest parent `code_map.md` by relative path.
- Nested `code_map.md` should carry subtree navigation, key files, internal routing, and upstream/downstream boundaries.
- Do not turn `AGENTS.md` into a large directory index; move navigation to `code_map.md`.

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

### Explicit code map pointers

```markdown
Before broad search or repo-wide grep, read `./code_map.md` and use its search anchors to choose targeted files.
```

```markdown
For this subtree, start with `platforms/codex/code_map.md` before broad grep. If that file is missing, fall back to `../code_map.md`.
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

### Code maps

```markdown
# Repository Code Map

Use this map for navigation and search routing. Behavioral rules live in `AGENTS.md`.

## Top-Level Routing
- `platforms/` — platform-specific commands, prompts, hooks, and rules.

## Search Anchors
- `DEFAULT_ENABLED_PLATFORM_IDS` — default platform enablement.
```

Create a nested `code_map.md` when a subtree has its own commands, entry points, public contracts, or complex internal routing. Reuse the nearest parent map for simple directories.

## What Not To Add

- Generic coding advice such as "write clean code".
- Explanations that duplicate obvious file names.
- Large directory indexes in `AGENTS.md`; put search navigation in `code_map.md`.
- Nested `AGENTS.md` files for directories scoring below the creation threshold, generated outputs, vendored code, dependencies, or build artifacts.
- Vague map references such as "see the code map" without the exact relative path.
- One-off debugging history that will not recur.
- Provider-specific instructions from another CLI unless clearly labeled as non-Codex context.
- Aspirational subagents, MCP servers, or plugins that are not installed or documented.
- User-level private preferences into a repository file unless the user explicitly wants them shared.

## Preserve Existing Content

- Keep human-authored constraints unless they are stale or unsafe.
- Preserve marker-bounded sections exactly.
- Keep bilingual or paired docs instructions aligned when the repo already works that way.
- Keep nested guidance narrow; do not paste root sections into every subtree.
- Preserve the AGENTS/code-map boundary when updating older guidance: move navigational lists to `code_map.md`, but keep mandatory behavior in `AGENTS.md`.

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
- [ ] Every updated `AGENTS.md` names an explicit relative `code_map.md` path.
- [ ] `code_map.md` files contain navigation/search guidance, not mandatory behavioral constraints.
- [ ] New nested `AGENTS.md` files meet the creation score threshold or have an explicit user-requested exception.
- [ ] Safety boundaries cover secrets, destructive operations, external production systems, and generated/runtime state.
- [ ] Marker blocks are unchanged unless explicitly repaired.
- [ ] `git diff --check` passes.
