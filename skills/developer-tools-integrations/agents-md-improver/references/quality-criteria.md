# AGENTS.md Quality Criteria

Use this rubric to score Codex `AGENTS.md` files.

## 1. Scope and Override Clarity (20 points)

**20**: The file clearly states what directory/subtree it governs, how nested files override parent guidance, and whether any user/global guidance is out of scope.

**15**: Scope is mostly clear but parent/child relationships need small clarification.

**10**: The file is useful but does not explain its scope.

**5**: Scope is ambiguous or likely to be misapplied.

**0**: Guidance contradicts AGENTS.md semantics.

## 2. Executable Commands and Gates (20 points)

**20**: Essential install/build/test/lint/typecheck/dev commands are present, current, and scoped.

**15**: Most commands are present but some lack context.

**10**: Basic commands only.

**5**: Few commands or likely stale commands.

**0**: No actionable commands, or documented commands are misleading.

## 3. Architecture and Ownership (15 points)

**15**: Key directories, module boundaries, entry points, generated assets, and ownership boundaries are clear.

**10**: Structure is mostly clear with minor gaps.

**5**: Directory listing exists but lacks routing value.

**0**: No useful architecture guidance.

## 4. Safety and Permissions (15 points)

**15**: Sandbox/approval expectations, destructive operations, secrets, external services, production data, and generated files are clearly bounded.

**10**: Major safety boundaries are present but incomplete.

**5**: Safety is generic or missing important project-specific risks.

**0**: Guidance encourages unsafe behavior or omits obvious high-risk boundaries.

## 5. Codex Workflow Fit (15 points)

**15**: Codex CLI/App semantics, native subagents, skills, plugins, MCP, and optional OMX workflows are described accurately and only when relevant.

**10**: Mostly Codex-specific but has minor provider-neutral or stale phrasing.

**5**: Mixes Codex and other-provider concepts confusingly.

**0**: Uses another provider's guidance semantics as if they were Codex instructions.

## 6. Conciseness and Currency (15 points)

**15**: Dense, current, non-duplicative, and free of obvious code restatement.

**10**: Mostly concise with small redundancy or stale wording.

**5**: Verbose, repetitive, or partly outdated.

**0**: Mostly filler, template residue, or stale paths.

## Nested AGENTS.md Creation Scorecard (100 points)

Use this scorecard when a repository has a source subtree without local guidance. Score only directories that are not generated, vendored, dependency, cache, or build-output directories.

| Criterion | Weight | Evidence |
|---|---:|---|
| Independent commands | 25 | local manifest, test/build/lint/dev command, package script, just target, Make target, or CI fragment |
| Independent technical or deploy boundary | 20 | separate runtime, service, package, app, plugin, crate, deployable artifact, or language/framework stack |
| Local constraints | 20 | subtree-specific generated files, style conventions, ownership rules, data contracts, docs sync, or review requirements |
| Complexity | 15 | enough internal modules, entry points, or cross-file relationships that map-first navigation prevents broad grep |
| Safety risk | 10 | secrets, credentials, production data, migrations, destructive operations, external services, or privileged tooling |
| High-frequency or public contract | 10 | commonly edited area, public API, shared schema, CLI surface, plugin/skill contract, or docs users depend on |

Decision thresholds:

- **60-100**: create or update nested `AGENTS.md`; create a local `code_map.md` when navigation differs materially from the root map.
- **40-59**: list as a candidate in the report; do not create guidance unless the user asks or missing guidance is already causing errors.
- **0-39**: do not create nested guidance; rely on root `AGENTS.md` and nearest `code_map.md`.

Automatic skip:

- `.git/`, `node_modules/`, `target/`, `dist/`, `build/`, `.omx/state/`, `vendor/`, coverage output, generated site output, package-manager caches, and checked-in third-party source unless the user explicitly asks for recovery guidance there.
- Directories whose only evidence is file count or obvious names but no local commands, constraints, safety boundary, or public contract.

## Red Flags

- Commands that do not exist in manifests or justfiles.
- Stale directory names after repo restructuring.
- Nested files duplicating root content instead of narrowing it.
- Creating nested `AGENTS.md` for low-score, generated, vendored, dependency, or build-output directories.
- `AGENTS.md` files that mention a code map generically without an explicit relative path.
- `code_map.md` files that contain behavioral constraints that belong in `AGENTS.md`.
- Provider-specific files such as `CLAUDE.md` described as Codex guidance.
- Instructions to edit generated/runtime state such as `.omx/state/**` without a recovery reason.
- Secrets, tokens, production endpoints, or destructive data operations not mentioned.
- Subagents or workflows promised without local support.
- Hook-managed marker blocks missing an end marker or rewritten accidentally.

## Assessment Process

1. Read every repo `AGENTS.md` in scope.
2. Build a scope map from root to nested files.
3. Read existing `code_map.md` files and verify every `AGENTS.md` map pointer uses an explicit relative path.
4. Verify command and path claims against actual files.
5. Score each existing `AGENTS.md` criterion and cite concrete evidence.
6. Score candidate nested guidance directories with the creation scorecard.
7. Propose the smallest changes that improve future Codex sessions without adding context noise.
