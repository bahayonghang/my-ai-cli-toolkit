# Claude Context Quality Criteria

Use this rubric to score Claude Code context files (`CLAUDE.md`, `.claude/rules/*.md`) and to decide whether a subtree warrants its own nested file. The rubric applies to both the repository scope and the global `~/.claude` scope; where they differ, the global note is called out.

## 1. Judgement Fit and Conflict-Freedom (20 points)

The Claude 5 criterion. Guidance written for weaker models over-constrains current ones, and additive loading turns contradictions into reasoning cost rather than resolution order. See `context-engineering-claude5.md` for the underlying rules.

**20**: No instruction contradicts another instruction in any layer that loads with it. Absolutes (`NEVER`, `ALWAYS`, `MUST`, `DO NOT`) appear only where the mistake is expensive — secrets, destructive operations, production deploys, PII, money movement. Everything else is phrased as intent the model can apply with judgement. Nothing in the file is derivable from one `ls` or one manifest read. No episodic memory (past decisions, one-off debugging history) and no few-shot walls where an interface description would do.

**15**: One low-stakes absolute or one small piece of obvious content; no contradictions.

**10**: Several low-stakes absolutes, or a visible chunk of file-tree restatement, or session memory that should live in auto memory.

**5**: Reads like a second system prompt — role framing, general coding philosophy, tone rules — or contains an unresolved contradiction between two layers.

**0**: Contradictions across layers on load-bearing behavior, or a rule wall that would force Claude into wrong outcomes on a normal subset of prompts.

## 2. Additive Layering Clarity (15 points)

Because files load additively, a good `CLAUDE.md` knows what it adds rather than what it overrides.

**15**: File clearly states which layer it occupies (root, nested, rule), what it adds on top of the ancestors, and does not restate parent content. A nested file explicitly names the layer above and the load trigger (for example, "loads when Claude reads files under `packages/api/`").

**11**: Layering is mostly clear but parent/child relationship needs small clarification.

**7**: File is useful but does not explain its layer or load trigger.

**3**: Layering is ambiguous; reader could plausibly assume override semantics.

**0**: Guidance asserts override semantics or duplicates parent content wholesale.

## 3. Executable Commands and Gates (15 points)

**15**: Essential install/build/test/lint/typecheck/dev commands are present, current, and scoped to the file's layer. Root file lists repo-wide commands; nested file lists local commands.

**11**: Most commands are present but some lack working-directory or scope context.

**7**: Basic commands only.

**3**: Few commands or likely stale commands.

**0**: No actionable commands, or documented commands are misleading.

Under the global scope, a command only scores if it works in any repository. A repo-specific command stated globally is a defect, not a convenience.

## 4. Progressive Disclosure (15 points)

The entry file should point at context rather than hold it. Everything that is not needed every session should load when it becomes relevant.

**15**: Multi-step procedures live in skills the file references. Path-specific guidance lives in `.claude/rules/*.md` with `paths:` globs. Navigation lives in `code_map.md`, referenced by explicit relative path and not via `@import`. What remains in the entry file is what every session genuinely needs.

**11**: Mostly disclosed progressively; one procedure or one path-specific block is still inline.

**7**: The file is a general repository of practices; obvious extraction candidates remain.

**3**: Everything is upfront — long procedures, path rules, and navigation all inline.

**0**: The file is a central catalogue of every practice the team has ever agreed on, and `@import` is used in the belief that it saves context.

## 5. Architecture and Routing (10 points)

**10**: Key entry points, module boundaries, ownership zones, and generated assets are clear. An explicit relative `code_map.md` pointer is present. Heavy directory indexes are deferred to `code_map.md`.

**7**: Structure is mostly clear; map pointer missing or imprecise.

**3**: Directory listing exists in the file but offers no routing value (file is acting as a code map).

**0**: No useful architecture guidance, or restates obvious file names without routing.

## 6. Tool Permissions and Safety (10 points)

**10**: Secrets, credentials, destructive operations, external production services, migrations, and generated/runtime paths are clearly bounded. The file does not duplicate hard constraints already enforced in `.claude/settings.json` (`permissions.deny`, `sandbox.enabled`); it complements them with the "why" or with softer prose conventions.

**7**: Major safety boundaries are present but incomplete or partially duplicate settings.

**3**: Safety is generic or misses important project-specific risks.

**0**: Encourages unsafe behavior or omits obvious high-risk boundaries that the settings file does not also catch.

This is the one criterion where hard absolutes remain correct. Do not soften a real safety boundary in the name of judgement.

## 7. Claude Code Workflow Fit (10 points)

**10**: Claude Code primitives (skills, hooks, sub-agents, MCP servers, `.claude/rules/`, auto memory) are referenced accurately and only when they exist. The file does not promise capabilities that are not configured. It treats `CLAUDE.md` as durable guidance, not as a place for task-specific procedures (those belong in skills), lifecycle automation (hooks), or session facts (auto memory).

**7**: Mostly accurate but mixes scopes (for example, packages task procedures into `CLAUDE.md` that should be skills).

**3**: Confuses `CLAUDE.md` with another file type or another agent's semantics.

**0**: Uses another provider's guidance semantics as if they were Claude Code instructions.

## 8. Conciseness and Currency (5 points)

**5**: Under 200 lines. Dense, current, non-duplicative. Free of obvious code restatement and generic LLM advice ("write clean code", "test your changes").

**4**: 200-300 lines, mostly concise with some redundancy or template residue.

**2**: 300-500 lines, or contains stale paths/commands.

**0**: Over 500 lines, mostly filler, or paths/commands no longer match the repo.

Apply the official conciseness test per line: _"Would removing this cause Claude to make mistakes?"_ If not, cut it.

## Nested CLAUDE.md Creation Scorecard (100 points)

Use this scorecard when a repository has a source subtree without local guidance. Score only directories that are not generated, vendored, dependency, cache, or build-output directories.

| Criterion                      | Weight | Evidence                                                                                                                                                              |
| ------------------------------ | -----: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Distinct stack or framework    |     25 | Different language, runtime, framework, or build system from the parent. The single strongest signal that parent guidance will be misapplied here.                    |
| Independent commands           |     20 | Local manifest, test/build/lint/dev command, package script, just target, Make target, or CI fragment specific to this subtree.                                       |
| Conventions divergence         |     20 | Naming, style, patterns, error handling, or architectural rules that differ from the parent. Frontend vs backend vs infrastructure code.                              |
| Agent work frequency           |     15 | Claude is expected to read or edit files in this subtree often. Without expected agent traffic, lazy loading rarely triggers and the nested file becomes dead weight. |
| Permissions or safety boundary |     10 | Secrets, credentials, production data, migrations, destructive operations, external services, or privileged tooling.                                                  |
| Parent root file pressure      |     10 | Root `CLAUDE.md` exceeds 200 lines and a meaningful chunk of its content is specific to this subtree. Splitting reduces the always-loaded budget.                     |

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

- Two instructions that contradict each other across layers; additive loading delivers both.
- Absolute rules on low-stakes matters, inherited from guidance written for weaker models.
- Statements Claude would derive from one `ls`, one manifest read, or the file names themselves.
- Role framing, coding philosophy, or tone instructions — `CLAUDE.md` is not a second system prompt.
- Episodic memory: past decisions, one-off debugging history, "we tried X and it failed".
- Few-shot walls where a clearer interface, enum, or typed signature would guide better.
- Multi-step procedures inline that should be a skill the file points to.
- Prose restating what a test suite, typed interface, or mockup already expresses precisely.
- Commands that do not exist in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, or CI files.
- Stale directory names after a refactor.
- Nested files duplicating root content under the false belief that nested overrides parent. They do not; both load.
- Creating nested `CLAUDE.md` for low-score, generated, vendored, dependency, or build-output directories.
- `CLAUDE.md` files that mention a code map generically without an explicit relative path.
- `code_map.md` containing behavioral constraints that belong in `CLAUDE.md`.
- Block-level `<!-- ... -->` comments used to hide instructions; they are stripped before injection.
- `@import` chains that exceed 4 hops or reference missing files.
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

1. Read every in-scope `CLAUDE.md`, `.claude/CLAUDE.md`, `.claude/rules/*.md`, and `code_map.md` for the chosen scope.
2. Build a layering map showing which file loads when (ancestor immediate, descendant lazy, rule conditional).
3. Read existing `code_map.md` files and verify every `CLAUDE.md` map pointer uses an explicit relative path.
4. Verify command and path claims against actual files (under the global scope, against portability).
5. Cross-read the layers together and list every contradiction and every duplicated instruction before scoring anything.
6. Score each existing `CLAUDE.md` and `.claude/rules/*.md` on the eight criteria with concrete evidence.
7. Score candidate nested subtrees with the creation scorecard.
8. Propose the smallest changes that improve future Claude Code sessions without adding context noise — and prefer deletions, which usually raise adherence more than additions do.
