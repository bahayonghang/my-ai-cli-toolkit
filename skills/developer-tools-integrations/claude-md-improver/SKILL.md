---
name: claude-md-improver
description: >-
  Audit and improve Claude Code CLAUDE.md guidance files, .claude/rules/
  path-scoped rules, and companion code_map.md navigation maps. Use when the
  user asks to check, audit, optimize, or restructure CLAUDE.md, mentions
  nested CLAUDE.md or code_map.md, or says 优化 CLAUDE.md, 审计 CLAUDE.md,
  生成 code_map (Claude). Not for trivial single-line edits the user has
  already fully specified.
version: 1.1.0
category: developer-tools-integrations
tags:
  - claude-code
  - claude-md
  - repository-guidance
  - memory
  - audit
  - documentation
  - code-map
argument-hint: "[audit-or-update-goal]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git *), Bash(find *)
---

# CLAUDE.md Improver

Audit and improve Claude Code `CLAUDE.md` guidance files, `.claude/rules/` path-scoped rules, and the companion `code_map.md` navigation map so future Claude Code sessions receive concise, accurate, additively-layered project instructions and fast code search entry points.

**Default mode is report-first.** Output a quality report and proposed diff before writing. If the user explicitly asks to implement an approved plan, continue directly to targeted edits and verification.

**Trivial edit fast path.** If the request is a single scoped edit the user has already specified (add or fix one line or one small section in an identified file), skip the full workflow: apply the edit directly, checking only that hook marker blocks stay intact, the file stays under the 200-line target, and no `@code_map.md` import is introduced. Everything below applies to audit and optimization requests.

## Core Semantics

Claude Code memory files use **additive layering**, not directory-scoped override. This is the most common point of confusion when migrating instructions from Codex `AGENTS.md` or other agents.

- Claude Code walks up the directory tree from the current working directory; every `CLAUDE.md` and `CLAUDE.local.md` found along the way is loaded at session start and concatenated into context, ordered from filesystem root to working directory.
- `CLAUDE.md` files in **descendant** directories are loaded **lazily** when Claude reads files in those directories during the session.
- `CLAUDE.md` files in **sibling** directories are never loaded for the current session.
- Files load additively: all layers contribute to context simultaneously. There is no "deeper file overrides parent" semantic; more specific guidance simply sits later in the prompt.
- Precedence chain at session start: managed policy → user (`~/.claude/CLAUDE.md`) → project (`./CLAUDE.md` or `./.claude/CLAUDE.md`) → `CLAUDE.local.md` per layer. Repository `CLAUDE.md` is project guidance. User-level `~/.claude/CLAUDE.md` is personal preference and is not edited unless the user explicitly asks.
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

### Phase 1: Discovery

Find every memory file in scope.

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

The commands above are a starting set; the full exclusion list below governs. Exclude generated, vendored, dependency, cache, and build-output directories from creation scans: `.git/`, `node_modules/`, `target/`, `dist/`, `build/`, `.omx/state/`, `vendor/`, coverage output, generated docs/site output, and language-specific package caches.

Also note, but do not edit by default:

```text
~/.claude/CLAUDE.md
~/.claude/rules/
/Library/Application Support/ClaudeCode/CLAUDE.md   # macOS managed policy
/etc/claude-code/CLAUDE.md                          # Linux/WSL managed policy
C:\Program Files\ClaudeCode\CLAUDE.md               # Windows managed policy
```

Discover candidate subtrees for new nested `CLAUDE.md` (and possibly local `code_map.md`) before proposing writes. Score only real source subtrees that show one or more of: distinct stack or framework, independent manifest/command surface, divergent conventions, frequent agent work in that area, local safety boundary, or pressure to relieve a bloated root `CLAUDE.md`.

Classify each file:

| Type                    | Location                                                   | Purpose                                                                                 |
| ----------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| project root guidance   | `./CLAUDE.md` or `./.claude/CLAUDE.md`                     | repo-wide pointers, gotchas, conventions, top-level commands                            |
| nested project guidance | `./<subtree>/CLAUDE.md` (or `<subtree>/.claude/CLAUDE.md`) | local stack, commands, safety, conventions distinct from parent                         |
| path-scoped rules       | `./.claude/rules/*.md` (optional `paths:` frontmatter)     | conditional or always-on rules organized by topic                                       |
| personal override       | `./CLAUDE.local.md`                                        | gitignored per-developer preferences; never read content, only confirm it is gitignored |
| root code map           | `./code_map.md`                                            | repo navigation, top-level routing, search anchors, ignored/generated paths             |
| nested code map         | `./<subtree>/code_map.md`                                  | subtree entry points, internal routing, upstream/downstream boundaries                  |
| user global guidance    | `~/.claude/CLAUDE.md`                                      | outside repo scope; do not edit unless explicitly asked                                 |
| managed policy guidance | OS-managed path above                                      | IT/DevOps controlled; never edit from a repo skill                                      |

### Phase 2: Evidence Collection

For every in-scope file, verify claims against the repository:

- commands referenced in `package.json`, `justfile`, `Cargo.toml`, `pyproject.toml`, `Makefile`, CI workflows
- actual directory structure and entry points named in the file
- `@import` targets: every `@path/to/file` must resolve relative to the file containing it; recursion depth ≤ 4
- `code_map.md` existence and whether each `CLAUDE.md` map pointer uses an explicit relative path
- `.claude/rules/*.md` frontmatter: `paths:` globs are valid, file globs match real source files, conditional rules are not duplicating root content
- alignment with `.claude/settings.json` — do not duplicate hard `permissions.deny` constraints as soft prose; if the setting already blocks an action, do not also rephrase it as a rule
- `claudeMdExcludes` settings (in `.claude/settings.json`, `.claude/settings.local.json`, or managed) and whether they conflict with the files you are auditing
- bloat signals: total line count vs the 200-line target, repeated content across nested files, code restatement that belongs in `code_map.md`
- preserved hook marker blocks; flag any unbalanced `OMX:...:START` / `END` pairs
- `CLAUDE.local.md` presence — confirm it is listed in `.gitignore`; do not read its content

### Phase 3: Quality Assessment

Use `references/quality-criteria.md` for detailed scoring, including the nested `CLAUDE.md` creation scorecard.

Quick checklist (100 points total):

| Criterion                     | Weight | Check                                                                                                                                   |
| ----------------------------- | -----: | --------------------------------------------------------------------------------------------------------------------------------------- |
| additive layering clarity     |     20 | file states which layer it occupies and what it adds, without restating parent content                                                  |
| executable commands and gates |     20 | install/build/test/lint/typecheck/dev commands are real and scoped to the file's layer                                                  |
| architecture and routing      |     15 | points to `./code_map.md` with an explicit relative path; does not duplicate directory indexes                                          |
| tool permissions and safety   |     15 | secrets, destructive ops, external services, generated/runtime paths are bounded; does not duplicate `.claude/settings.json` hard rules |
| Claude Code workflow fit      |     15 | skills, hooks, MCP, sub-agents, auto memory boundaries are accurate and not overpromised                                                |
| conciseness and currency      |     15 | under 200 lines, current, dense, no template residue or stale paths                                                                     |

Grades:

- **A (90-100)**: layered, current, executable, concise
- **B (70-89)**: useful with minor gaps
- **C (50-69)**: basic but missing key operational detail
- **D (30-49)**: sparse, stale, or confusing
- **F (0-29)**: missing, misleading, or counterproductive

For each candidate nested subtree, record creation score and decision: create (`≥60`), candidate only (`40-59`), or do not create (`<40`). For each existing nested file, note whether it could move into a `.claude/rules/*.md` with a `paths:` glob instead.

### Phase 4: Report Before Editing

Always provide this report before edits unless the user already approved an implementation plan. Use the "Quality Report" skeleton in `references/report-format.md`: summary, layering map, code map coverage, nested guidance candidates, and a per-file assessment scored against the Phase 3 criteria.

### Phase 5: Targeted Updates

When approved or already authorized by a plan, follow `references/update-guidelines.md`. The nine load-bearing rules:

1. Root `CLAUDE.md` holds repo-wide pointers and critical gotchas only; target under 200 lines.
2. Nested `CLAUDE.md` adds local stack, commands, and safety; never restates the parent content because parent content already loaded.
3. Behavior and constraints live in `CLAUDE.md`; navigation, anchors, and directory indexes live in `code_map.md`.
4. Path-specific rules belong in `.claude/rules/*.md` with `paths:` frontmatter — they load only when relevant and keep the root file lean.
5. Reference `./code_map.md` with prose ("Before broad grep, read `./code_map.md`") rather than `@code_map.md`. `@import` loads at launch and defeats the on-demand purpose of a map.
6. In the root `CLAUDE.md`, list known nested `CLAUDE.md` files under a "Nested Documentation" section so Claude can discover sibling subtrees by name even when their files are not yet loaded.
7. Preserve hook-managed marker blocks exactly. Preserve `@AGENTS.md` import bridges when the repository runs both Claude Code and Codex.
8. Remove generic LLM advice ("write clean code", "understand before changing"); these dilute the signal-to-noise ratio.
9. If `CLAUDE.local.md` is present, only confirm it is in `.gitignore`; do not read its content or copy it into shared files.

### Phase 6: Verification

Run the smallest checks that prove the edits:

```bash
git diff --check
```

Manual checks to perform on every updated file:

- line count is under 200; otherwise propose splitting into `.claude/rules/*.md`
- every `@path/to/file` import target exists on disk; recursion depth ≤ 4
- every `code_map.md` pointer uses an explicit relative path
- every `.claude/rules/*.md` `paths:` glob is valid YAML and matches at least one real file
- no new content was added that duplicates `.claude/settings.json` hard rules
- hook marker blocks are intact with matched start/end pairs
- `CLAUDE.local.md` is in `.gitignore` if it exists

If a documented full gate is expensive (browser tests, deploys), state whether it was run or why it was skipped.

## Reference Files

- `references/claude-md-loading.md` — Claude Code loading model, edge cases, and what each loading layer can and cannot do
- `references/quality-criteria.md` — scoring rubric, nested creation scorecard, and red flags
- `references/templates.md` — root, monorepo package, frontend, backend, docs, `.claude/rules`, `@AGENTS.md` bridge, and `code_map.md` templates
- `references/update-guidelines.md` — what to add, what to avoid, what to preserve, diff format
- `references/report-format.md` — quality report and update summary skeletons

## Common Issues to Flag

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

## Final Output After Edits

After approved edits, emit the "Update Summary" skeleton in `references/report-format.md`: files changed, what improved, verification results (passed/failed/skipped with reason), and remaining risks.
