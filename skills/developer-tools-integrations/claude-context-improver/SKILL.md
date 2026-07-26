---
name: claude-context-improver
description: >-
  Audit and improve the Claude Code context layer — CLAUDE.md guidance files,
  .claude/rules/ path-scoped rules, and companion code_map.md navigation maps —
  against Claude 5 context-engineering rules (judgement over rules, progressive
  disclosure, no cross-layer conflicts). Asks whether to optimize the current
  repository (default) or the global ~/.claude context. Use when the user asks
  to check, audit, optimize, rightsize, slim, or restructure CLAUDE.md or
  Claude context files, mentions nested CLAUDE.md, code_map.md, or context
  engineering, or says 优化 CLAUDE.md, 审计 CLAUDE.md, 优化上下文, 精简上下文,
  生成 code_map (Claude). Not for trivial single-line edits the user has
  already fully specified.
version: 2.0.0
category: developer-tools-integrations
tags:
  - claude-code
  - claude-md
  - context-engineering
  - repository-guidance
  - memory
  - audit
  - documentation
  - code-map
argument-hint: "[audit-or-update-goal]"
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Bash(git *), Bash(find *)
---

# Claude Context Improver

Audit and improve the context Claude Code loads before it sees a prompt: `CLAUDE.md` guidance files, `.claude/rules/` path-scoped rules, and the companion `code_map.md` navigation map. The goal is a context layer that is concise, current, conflict-free, and progressively disclosed — sized for Claude 5 generation models rather than for the weaker models most existing guidance was written against.

**Default mode is report-first.** Output a quality report and proposed diff before writing. If the user explicitly asks to implement an approved plan, continue directly to targeted edits and verification.

**Relationship to `/doctor`.** Claude Code's bundled `/doctor` is Anthropic's automated rightsizer for skills and CLAUDE.md. This skill is the repo-tailored, report-first companion: it scores against a rubric, verifies claims against the actual codebase, covers `code_map.md` and `.claude/rules/`, and shows diffs before editing. Recommending a `/doctor` run alongside the report is reasonable; neither replaces the other.

**Trivial edit fast path.** If the request is a single scoped edit the user has already specified (add or fix one line or one small section in an identified file), skip the scope question and the full workflow: apply the edit directly, checking only that hook marker blocks stay intact, the file stays under the 200-line target, and no `@code_map.md` import is introduced. Everything below applies to audit and optimization requests.

## Context Engineering Principles (Claude 5)

Anthropic removed over 80% of Claude Code's system prompt for Claude Opus 5 and Fable 5 with no measurable loss on coding evals. The same over-constraining that hobbled the system prompt hobbles most `CLAUDE.md` files. Audit against these shifts:

| Then                  | Now                                                                                             |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| Give Claude rules     | Let Claude use judgement — phrase intent, reserve absolutes for expensive mistakes               |
| Give Claude examples  | Design interfaces — expressive parameters and contracts beat example walls that narrow the space |
| Put it all upfront    | Progressive disclosure — a tree of files loaded at the right time, not one central repository    |
| Repeat yourself       | Say it once, in the layer that owns it                                                          |
| Memory in `CLAUDE.md` | Auto-memory — session facts and decisions are saved automatically, not pasted into guidance      |
| Simple specs          | Rich references — specs-as-code, test suites, HTML artifacts, and rubrics beat restated prose    |

The one-line summary from the official guidance: keep `CLAUDE.md` lightweight, briefly say what the repo is for, and spend most of the tokens on **gotchas** — never on what Claude can see by reading the file tree.

See `references/context-engineering-claude5.md` for the full rules, sources, and how each shift maps to a concrete audit check.

## Core Semantics

Claude Code memory files use **additive layering**, not directory-scoped override. This is the most common point of confusion when migrating instructions from Codex `AGENTS.md` or other agents.

- Claude Code walks up the directory tree from the current working directory; every `CLAUDE.md` and `CLAUDE.local.md` found along the way is loaded at session start and concatenated into context, ordered from filesystem root to working directory.
- `CLAUDE.md` files in **descendant** directories are loaded **lazily** when Claude reads files in those directories during the session.
- `CLAUDE.md` files in **sibling** directories are never loaded for the current session.
- Files load additively: all layers contribute to context simultaneously. There is no "deeper file overrides parent" semantic; more specific guidance simply sits later in the prompt. This is why a cross-layer contradiction is a real defect, not a resolution order.
- Precedence chain at session start: managed policy → user (`~/.claude/CLAUDE.md`) → project (`./CLAUDE.md` or `./.claude/CLAUDE.md`) → `CLAUDE.local.md` per layer.
- `@path` imports expand at launch (recursive, max depth 4). They do not save context; they only organize files.
- Block-level HTML comments (`<!-- ... -->`) are stripped before injection. Use them for human-maintainer notes that should not consume tokens.
- `.claude/rules/*.md` with a `paths:` frontmatter glob loads only when Claude reads files matching that glob. Rules without `paths:` load unconditionally.
- `CLAUDE.md` carries durable behavioral constraints, commands, and project conventions. `code_map.md` carries navigational structure, search anchors, entry points, and generated/ignored directory notes.
- Every created or updated `CLAUDE.md` should name the relative `code_map.md` path agents must read before broad grep, for example `Before broad grep, read ./code_map.md`.
- When the repository also uses Codex (`AGENTS.md` present), `code_map.md` is a shared artifact maintained by both this skill and `agents-md-improver`. Use the canonical code map wording from `references/templates.md` (it names both guidance files), never remove the other tool's mention from an existing map, and prefer the `@AGENTS.md` import bridge over duplicating shared instructions.
- The [official memory documentation](https://code.claude.com/docs/en/memory) recommends keeping each `CLAUDE.md` **under 200 lines**; longer files reduce adherence and inflate every session's startup tokens.
- Preserve hook-managed marker blocks such as `<!-- OMX:RUNTIME:START --> ... <!-- OMX:RUNTIME:END -->` and `<!-- OMX:TEAM:WORKER:START --> ... <!-- OMX:TEAM:WORKER:END -->`. These are stripped at injection but are still meaningful to hook tooling and must survive edits intact.

See `references/claude-md-loading.md` for the full loading model, including edge cases around `--add-dir`, `claudeMdExcludes`, and auto memory boundaries.

## Workflow

### Phase 0: Choose Scope

Ask which context layer to work on before touching anything, using `AskUserQuestion` with header `优化范围`:

- **当前仓库 (Recommended)** — the repository's `CLAUDE.md` tree, `.claude/rules/`, and `code_map.md`. This is the default.
- **全局** — the user-level context: `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`, and files they `@`-import.

Skip the question when the user already named a scope ("audit my global CLAUDE.md", "check this repo's rules"), named concrete files, or the trivial-edit fast path applies. If `AskUserQuestion` is unavailable on the host platform, ask the same two options in plain text and wait; treat "no preference" as 当前仓库.

The answer is the authorization boundary. Choosing 全局 authorizes reading and editing files under `~/.claude/`; choosing 当前仓库 leaves them untouched and only notes them as context. Managed policy files are never edited under either scope.

How the scope changes each phase:

| Phase        | 当前仓库 (default)                                 | 全局                                                                                   |
| ------------ | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Discovery    | repo-root `find` commands below                    | `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`, resolved `@` imports (depth ≤ 4)         |
| Evidence     | verify claims against repo manifests and file tree | verify claims are machine-portable — no single repo's paths or commands stated globally |
| Assessment   | full rubric                                        | full rubric, plus: does this belong in a project `CLAUDE.md` instead of everyone's?     |
| Updates      | edit repo files                                    | edit `~/.claude/**` (authorized by this scope); managed policy stays read-only          |
| Verification | `git diff --check` plus the manual checks          | manual checks only — `~/.claude` is usually not a git repository                        |

### Phase 1: Discovery

Find every context file in scope. For 当前仓库:

```bash
find . \( -name CLAUDE.md -o -name CLAUDE.local.md -o -name code_map.md \) \
  -not -path './.git/*' \
  -not -path './node_modules/*' \
  -not -path './target/*' \
  -not -path './dist/*' \
  -not -path './build/*' \
  -not -path './vendor/*' \
  -not -path './.omx/state/*'
find . -path '*/.claude/rules/*.md' -not -path './.git/*' -not -path './node_modules/*'
```

For 全局:

```bash
find "$HOME/.claude" -maxdepth 1 \( -name 'CLAUDE.md' -o -name 'CLAUDE.local.md' \)
find "$HOME/.claude/rules" -name '*.md'
```

The commands above are a starting set; the full exclusion list below governs. Exclude generated, vendored, dependency, cache, and build-output directories from creation scans: `.git/`, `node_modules/`, `target/`, `dist/`, `build/`, `.omx/state/`, `vendor/`, coverage output, generated docs/site output, and language-specific package caches.

Managed policy files are noted but never edited under any scope:

```text
/Library/Application Support/ClaudeCode/CLAUDE.md   # macOS managed policy
/etc/claude-code/CLAUDE.md                          # Linux/WSL managed policy
C:\Program Files\ClaudeCode\CLAUDE.md               # Windows managed policy
```

Under 当前仓库, discover candidate subtrees for new nested `CLAUDE.md` (and possibly local `code_map.md`) before proposing writes. Score only real source subtrees that show one or more of: distinct stack or framework, independent manifest/command surface, divergent conventions, frequent agent work in that area, local safety boundary, or pressure to relieve a bloated root `CLAUDE.md`.

Classify each file:

| Type                    | Location                                                   | Purpose                                                                                 |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| project root guidance   | `./CLAUDE.md` or `./.claude/CLAUDE.md`                     | repo-wide pointers, gotchas, conventions, top-level commands                            |
| nested project guidance | `./<subtree>/CLAUDE.md` (or `<subtree>/.claude/CLAUDE.md`) | local stack, commands, safety, conventions distinct from parent                         |
| path-scoped rules       | `./.claude/rules/*.md` (optional `paths:` frontmatter)     | conditional or always-on rules organized by topic                                       |
| personal override       | `./CLAUDE.local.md`                                        | gitignored per-developer preferences; never read content, only confirm it is gitignored |
| root code map           | `./code_map.md`                                            | repo navigation, top-level routing, search anchors, ignored/generated paths             |
| nested code map         | `./<subtree>/code_map.md`                                  | subtree entry points, internal routing, upstream/downstream boundaries                  |
| user global guidance    | `~/.claude/CLAUDE.md`, `~/.claude/rules/`                  | cross-project personal preference; in scope only when the user chose 全局               |
| managed policy guidance | OS-managed path above                                      | IT/DevOps controlled; never edit from this skill                                        |

### Phase 2: Evidence Collection

For every in-scope file, verify claims against the repository (or, under 全局, against portability):

- commands referenced in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, CI workflows
- actual directory structure and entry points named in the file
- `@import` targets: every `@path/to/file` must resolve relative to the file containing it; recursion depth ≤ 4
- `code_map.md` existence and whether each `CLAUDE.md` map pointer uses an explicit relative path
- `.claude/rules/*.md` frontmatter: `paths:` globs are valid, file globs match real source files, conditional rules are not duplicating root content
- alignment with `.claude/settings.json` — do not duplicate hard `permissions.deny` constraints as soft prose; if the setting already blocks an action, do not also rephrase it as a rule
- `claudeMdExcludes` settings (in `.claude/settings.json`, `.claude/settings.local.json`, or managed) and whether they conflict with the files you are auditing
- bloat signals: total line count vs the 200-line target, repeated content across nested files, code restatement that belongs in `code_map.md`
- conflict signals: instructions that contradict each other across layers, or contradict what the user's own prompts routinely ask for
- obvious-content signals: statements Claude would derive from one `ls`, one manifest read, or the file names themselves
- preserved hook marker blocks; flag any unbalanced `OMX:...:START` / `END` pairs
- `CLAUDE.local.md` presence — confirm it is listed in `.gitignore`; do not read its content

### Phase 3: Quality Assessment

Use `references/quality-criteria.md` for detailed scoring, including the nested `CLAUDE.md` creation scorecard.

Quick checklist (100 points total):

| Criterion                          | Weight | Check                                                                                                                                     |
| ---------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------- |
| judgement fit and conflict-freedom |     20 | no contradictions across layers, no absolute-rule walls outside expensive-mistake areas, no content Claude derives from the file tree      |
| additive layering clarity          |     15 | file states which layer it occupies and what it adds, without restating parent content                                                    |
| executable commands and gates      |     15 | install/build/test/lint/typecheck/dev commands are real and scoped to the file's layer                                                    |
| progressive disclosure             |     15 | multi-step procedures live in skills, navigation in `code_map.md`, path rules in `.claude/rules/`; the entry file points rather than holds |
| architecture and routing           |     10 | points to `./code_map.md` with an explicit relative path; does not duplicate directory indexes                                            |
| tool permissions and safety        |     10 | secrets, destructive ops, external services, generated/runtime paths are bounded; does not duplicate `.claude/settings.json` hard rules    |
| Claude Code workflow fit           |     10 | skills, hooks, MCP, sub-agents, auto memory boundaries are accurate and not overpromised                                                  |
| conciseness and currency           |      5 | under 200 lines, current, dense, no template residue or stale paths                                                                       |

Grades:

- **A (90-100)**: layered, current, executable, concise
- **B (70-89)**: useful with minor gaps
- **C (50-69)**: basic but missing key operational detail
- **D (30-49)**: sparse, stale, or confusing
- **F (0-29)**: missing, misleading, or counterproductive

For each candidate nested subtree, record creation score and decision: create (`≥60`), candidate only (`40-59`), or do not create (`<40`). For each existing nested file, note whether it could move into a `.claude/rules/*.md` with a `paths:` glob instead.

### Phase 4: Report Before Editing

Always provide this report before edits unless the user already approved an implementation plan. Use the "Quality Report" skeleton in `references/report-format.md`: scope, summary, layering map, code map coverage, context-engineering findings, nested guidance candidates, and a per-file assessment scored against the Phase 3 criteria.

### Phase 5: Targeted Updates

When approved or already authorized by a plan, follow `references/update-guidelines.md`. The load-bearing rules:

1. Root `CLAUDE.md` holds what the repo is for, repo-wide pointers, and critical gotchas; target under 200 lines. Gotchas are where the tokens should go.
2. Delete before adding. Run a conflict pass (contradictory instructions across layers) and an obvious-content pass (anything derivable from the file tree) first — removals usually improve adherence more than additions do.
3. Phrase guidance as intent and let Claude judge. Reserve absolute rules for expensive mistakes: secrets, destructive operations, production deploys, PII, money movement.
4. Nested `CLAUDE.md` adds local stack, commands, and safety; never restates the parent content because parent content already loaded.
5. Behavior and constraints live in `CLAUDE.md`; navigation, anchors, and directory indexes live in `code_map.md`; multi-step procedures belong in a skill that `CLAUDE.md` points to.
6. Path-specific rules belong in `.claude/rules/*.md` with `paths:` frontmatter — they load only when relevant and keep the root file lean.
7. Reference `./code_map.md` with prose ("Before broad grep, read `./code_map.md`") rather than `@code_map.md`. `@import` loads at launch and defeats the on-demand purpose of a map.
8. Prefer pointing at rich references — a test suite, a typed interface, an HTML mockup, a rubric — over restating their content in prose.
9. In the root `CLAUDE.md`, list known nested `CLAUDE.md` files under a "Nested Documentation" section so Claude can discover sibling subtrees by name even when their files are not yet loaded.
10. Preserve hook-managed marker blocks exactly. Preserve `@AGENTS.md` import bridges when the repository runs both Claude Code and Codex.
11. Remove generic LLM advice ("write clean code", "understand before changing") and session memory dumps; auto memory already handles the latter.
12. If `CLAUDE.local.md` is present, only confirm it is in `.gitignore`; do not read its content.

This skill flags content that should move into a skill, but does not author skills. Name the procedure and say why it belongs elsewhere; leave the authoring to the user or a skill-creation skill.

### Phase 6: Verification

Run the smallest checks that prove the edits. Under 当前仓库:

```bash
git diff --check
```

Manual checks to perform on every updated file, under either scope:

- line count is under 200; otherwise propose splitting into `.claude/rules/*.md` or a skill
- every `@path/to/file` import target exists on disk; recursion depth ≤ 4
- every `code_map.md` pointer uses an explicit relative path
- every `.claude/rules/*.md` `paths:` glob is valid YAML and matches at least one real file
- no new content duplicates `.claude/settings.json` hard rules or another layer's instruction
- no remaining pair of instructions contradicts each other across layers
- hook marker blocks are intact with matched start/end pairs
- `CLAUDE.local.md` is in `.gitignore` if it exists

If a documented full gate is expensive (browser tests, deploys), state whether it was run or why it was skipped.

## Reference Files

- `references/context-engineering-claude5.md` — Claude 5 context-engineering rules, sources, and per-shift audit checks
- `references/claude-md-loading.md` — Claude Code loading model, edge cases, and what each loading layer can and cannot do
- `references/quality-criteria.md` — scoring rubric, nested creation scorecard, and red flags
- `references/templates.md` — root, monorepo package, frontend, backend, docs, `.claude/rules`, `@AGENTS.md` bridge, and `code_map.md` templates
- `references/update-guidelines.md` — what to add, what to remove, what to preserve, diff format
- `references/report-format.md` — quality report and update summary skeletons

## Common Issues to Flag

- conflicting instructions across layers (root says one thing, a nested file or rule says the opposite) — additive loading means both arrive and Claude must spend reasoning to reconcile them
- absolute-rule walls (`NEVER`, `ALWAYS`, `MUST` on low-stakes matters) that were written for weaker models and now over-constrain judgement
- content Claude would learn from one `ls` or one manifest read — file tree restatement, obvious naming conventions, framework defaults
- `CLAUDE.md` written as a second system prompt: role framing, general coding philosophy, tone instructions
- session memory in `CLAUDE.md` — past decisions, one-off debugging history, "we tried X and it failed" — which belongs in auto memory
- example walls where an interface description would do: long few-shot blocks that narrow rather than guide
- multi-step procedures inline in `CLAUDE.md` that should be a skill the file points to
- root `CLAUDE.md` exceeds 200 lines because path-specific content was never moved to `.claude/rules/*.md`
- root `CLAUDE.md` missing an explicit `./code_map.md` pointer when a root map exists or should exist
- nested `CLAUDE.md` restates parent content under the false assumption that nested files override the root
- nested `CLAUDE.md` only says "read the code map" without naming the relative map path
- `CLAUDE.md` bloated with directory index content that belongs in `code_map.md`
- low-score, generated, vendored, dependency, or build-output directories receiving unnecessary nested `CLAUDE.md`
- `@import` chains exceeding 4 hops or referencing missing files
- block-level `<!-- ... -->` comments used for instructions Claude is expected to follow (they are stripped before injection)
- `.claude/rules/*.md` without `paths:` frontmatter that would have been a perfect path-scoped fit
- `CLAUDE.local.md` checked into git (must be gitignored)
- Codex-only guidance from `AGENTS.md` pasted into `CLAUDE.md` instead of using the `@AGENTS.md` import bridge
- hook-managed marker blocks accidentally rewritten or with mismatched start/end pairs
- external production services or credentials not called out as a safety boundary
- skills, sub-agents, hooks, or MCP servers described as available when they are only aspirational
- global `~/.claude/CLAUDE.md` carrying one repository's paths, commands, or conventions as if they applied everywhere

## Final Output After Edits

After approved edits, emit the "Update Summary" skeleton in `references/report-format.md`: scope, files changed, what improved, verification results (passed/failed/skipped with reason), and remaining risks.
