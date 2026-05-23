# CLAUDE.md Quality Criteria

Use this rubric to score Claude Code `CLAUDE.md` files and to decide whether a subtree warrants its own nested file.

## 1. Additive Layering Clarity (20 points)

The most distinctive criterion for Claude Code. Because files load additively, a good `CLAUDE.md` knows what it adds rather than what it overrides.

**20**: File clearly states which layer it occupies (root, nested, rule), what it adds on top of the ancestors, and does not restate parent content. A nested file explicitly names the layer above and the load trigger (for example, "loads when Claude reads files under `packages/api/`").

**15**: Layering is mostly clear but parent/child relationship needs small clarification.

**10**: File is useful but does not explain its layer or load trigger.

**5**: Layering is ambiguous; reader could plausibly assume override semantics.

**0**: Guidance asserts override semantics or duplicates parent content wholesale.

## 2. Executable Commands and Gates (20 points)

**20**: Essential install/build/test/lint/typecheck/dev commands are present, current, and scoped to the file's layer. Root file lists repo-wide commands; nested file lists local commands.

**15**: Most commands are present but some lack working-directory or scope context.

**10**: Basic commands only.

**5**: Few commands or likely stale commands.

**0**: No actionable commands, or documented commands are misleading.

## 3. Architecture and Routing (15 points)

**15**: Key entry points, module boundaries, ownership zones, and generated assets are clear. An explicit relative `code_map.md` pointer is present. Heavy directory indexes are deferred to `code_map.md`.

**10**: Structure is mostly clear; map pointer missing or imprecise.

**5**: Directory listing exists in the file but offers no routing value (file is acting as a code map).

**0**: No useful architecture guidance, or restates obvious file names without routing.

## 4. Tool Permissions and Safety (15 points)

**15**: Secrets, credentials, destructive operations, external production services, migrations, and generated/runtime paths are clearly bounded. The file does not duplicate hard constraints already enforced in `.claude/settings.json` (`permissions.deny`, `sandbox.enabled`); it complements them with the "why" or with softer prose conventions.

**10**: Major safety boundaries are present but incomplete or partially duplicate settings.

**5**: Safety is generic or misses important project-specific risks.

**0**: Encourages unsafe behavior or omits obvious high-risk boundaries that the settings file does not also catch.

## 5. Claude Code Workflow Fit (15 points)

**15**: Claude Code primitives (skills, hooks, sub-agents, MCP servers, `.claude/rules/`, auto memory) are referenced accurately and only when they exist in the repo. The file does not promise capabilities the repo has not configured. It treats `CLAUDE.md` as durable guidance, not as a place for task-specific procedures (those belong in skills) or lifecycle automation (those belong in hooks).

**10**: Mostly accurate but mixes scopes (for example, packages task procedures into `CLAUDE.md` that should be skills).

**5**: Confuses `CLAUDE.md` with another file type or another agent's semantics.

**0**: Uses another provider's guidance semantics as if they were Claude Code instructions.

## 6. Conciseness and Currency (15 points)

**15**: Under 200 lines. Dense, current, non-duplicative. Free of obvious code restatement and generic LLM advice ("write clean code", "test your changes").

**10**: 200-300 lines, mostly concise with some redundancy or template residue.

**5**: 300-500 lines, or contains stale paths/commands.

**0**: Over 500 lines, mostly filler, or paths/commands no longer match the repo.

## Nested CLAUDE.md Creation Scorecard (100 points)

Use this scorecard when a repository has a source subtree without local guidance. Score only directories that are not generated, vendored, dependency, cache, or build-output directories.

| Criterion | Weight | Evidence |
|---|---:|---|
| Distinct stack or framework | 25 | Different language, runtime, framework, or build system from the parent. The single strongest signal that parent guidance will be misapplied here. |
| Independent commands | 20 | Local manifest, test/build/lint/dev command, package script, just target, Make target, or CI fragment specific to this subtree. |
| Conventions divergence | 20 | Naming, style, patterns, error handling, or architectural rules that differ from the parent. Frontend vs backend vs infrastructure code. |
| Agent work frequency | 15 | Claude is expected to read or edit files in this subtree often. Without expected agent traffic, lazy loading rarely triggers and the nested file becomes dead weight. |
| Permissions or safety boundary | 10 | Secrets, credentials, production data, migrations, destructive operations, external services, or privileged tooling. |
| Parent root file pressure | 10 | Root `CLAUDE.md` exceeds 200 lines and a meaningful chunk of its content is specific to this subtree. Splitting reduces the always-loaded budget. |

Decision thresholds:

- **60-100**: create or update nested `CLAUDE.md` (path preference: `<subtree>/.claude/CLAUDE.md` if the subtree already has a `.claude/` directory, otherwise `<subtree>/CLAUDE.md`). Consider a local `code_map.md` only when navigation differs materially from the root map.
- **40-59**: list as a candidate in the report; do not create guidance unless the user asks or missing guidance is already causing observable errors.
- **0-39**: do not create nested guidance; rely on root `CLAUDE.md`, `.claude/rules/*.md` with `paths:`, and the nearest `code_map.md`.

Automatic skip:

- `.git/`, `node_modules/`, `target/`, `dist/`, `build/`, `.omx/state/`, `vendor/`, coverage output, generated site output, package-manager caches, and checked-in third-party source unless the user explicitly asks for recovery guidance there.
- Directories whose only signal is file count or obvious names but no local commands, conventions, safety boundary, or expected agent work.

## When `.claude/rules/*.md` Beats a Nested File

Before creating a nested `CLAUDE.md`, check whether the content is really path-specific guidance that would fit `.claude/rules/*.md` with `paths:` frontmatter. Rules are usually the better choice when:

- The guidance is rule-flavored ("when editing files matching X, do Y") rather than orientation-flavored ("this package is...").
- The guidance applies to a file pattern that crosses directory boundaries.
- The author wants the guidance to load only when relevant, not on every session start in this subtree.

Pick a nested `CLAUDE.md` over rules when the content is high-level orientation a new contributor would want when entering the subtree (purpose, commands, key files, safety) — that is orientation, not rules.

## Red Flags

- Commands that do not exist in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, or CI files.
- Stale directory names after a refactor.
- Nested files duplicating root content under the false belief that nested overrides parent. They do not; both load.
- Creating nested `CLAUDE.md` for low-score, generated, vendored, dependency, or build-output directories.
- `CLAUDE.md` files that mention a code map generically without an explicit relative path.
- `code_map.md` containing behavioral constraints that belong in `CLAUDE.md`.
- Block-level `<!-- ... -->` comments used to hide instructions; they are stripped before injection.
- `@import` chains that exceed 5 hops or reference missing files.
- `.claude/rules/*.md` with `paths:` globs that do not match any real file.
- `CLAUDE.local.md` checked into git.
- Hook-managed marker blocks with missing END markers or accidentally rewritten content.
- Pasting `AGENTS.md` content directly into `CLAUDE.md` instead of using `@AGENTS.md`.
- Provider-specific files such as `.cursorrules` content described as Claude Code guidance.
- Aspirational skills, sub-agents, hooks, or MCP servers documented as installed.
- Production endpoints, secrets, or destructive data operations not mentioned at any layer.
- Root file over 500 lines (severe; demands path-scoped rules immediately).
- Files relying on imports to "save context" — imports expand at launch and do not save anything.

## Assessment Process

1. Read every in-scope `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/*.md`, and `code_map.md`.
2. Build a layering map showing which file loads when (ancestor immediate, descendant lazy, rule conditional).
3. Read existing `code_map.md` files and verify every `CLAUDE.md` map pointer uses an explicit relative path.
4. Verify command and path claims against actual files.
5. Score each existing `CLAUDE.md` and `.claude/rules/*.md` on the six criteria with concrete evidence.
6. Score candidate nested subtrees with the creation scorecard.
7. Propose the smallest changes that improve future Claude Code sessions without adding context noise.
