# Claude Code CLAUDE.md Loading Model

This file explains how Claude Code discovers, orders, and loads memory files. Use it to ground every audit decision: most CLAUDE.md mistakes come from assuming AGENTS.md or `.cursorrules` semantics that do not apply here.

The authoritative source is the [Claude Code memory documentation](https://code.claude.com/docs/en/memory).

## The Three Loading Modes

Claude Code uses a directory-tree algorithm that behaves differently based on where a file sits relative to the current working directory (CWD).

**Ancestor loading (immediate, at session start)**

From the CWD, Claude walks upward to the filesystem root. At every directory along the way it loads `CLAUDE.md` and `CLAUDE.local.md` if present. All such files are concatenated into context, ordered from the filesystem root down to the CWD, so guidance closer to where you launched Claude appears last in the prompt. Within each directory `CLAUDE.local.md` is appended after `CLAUDE.md`.

**Descendant loading (lazy, during the session)**

`CLAUDE.md` and `CLAUDE.local.md` files in directories under the CWD are not loaded at session start. They are included only when Claude reads or edits files in those directories. This is the lazy-loading behavior that makes nested guidance practical in large monorepos.

**Sibling isolation (never loads)**

If the CWD is `packages/web/`, a `CLAUDE.md` in `packages/api/` is neither an ancestor nor a descendant of the CWD. It will never load for this session. This is why sibling cross-references should live in the root file (under a "Nested Documentation" section), not in each sibling file pointing at the others.

## Precedence Chain at Session Start

| Order | Layer | Path | Edit from a repo skill? |
|---|---|---|---|
| 1 | managed policy | `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS), `/etc/claude-code/CLAUDE.md` (Linux/WSL), `C:\Program Files\ClaudeCode\CLAUDE.md` (Windows) | never; IT/DevOps controlled |
| 2 | user global | `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md` | only when the user explicitly asks |
| 3 | project root | `./CLAUDE.md` and `./.claude/CLAUDE.md` | yes; this is the primary target |
| 4 | per-developer override | `./CLAUDE.local.md` (gitignored) | confirm gitignored only; do not read content |
| 5 | nested project | `./<subtree>/CLAUDE.md`, `./<subtree>/CLAUDE.local.md` | yes, when the creation scorecard justifies it |
| 6 | path-scoped rules | `./.claude/rules/*.md` with `paths:` glob | yes; prefer this over bloating the root file |

Files load additively. There is no override semantic. If two files give conflicting guidance Claude reconciles by judgment, with more specific instructions typically taking precedence — but this is best-effort, not enforced.

## `@import` Recursion

`CLAUDE.md` files can pull in other markdown via `@path/to/file`. Imports expand at launch and recurse up to **5 hops**. Both relative paths (resolved against the importing file) and absolute paths work.

Critical reality check: **imports do not save context**. They are organizational, not cost-saving. The imported file fully expands into the prompt at session start. If you need on-demand loading, put the content in `.claude/rules/*.md` with a `paths:` glob, in a `code_map.md` referenced by prose, or in a skill.

## Block-Level HTML Comments Are Stripped

`<!-- maintainer notes -->` blocks are removed before content is injected into Claude's context. Use them for human-only notes that should not consume tokens. Comments inside code blocks are preserved. When auditing, watch for instructions that authors hid in HTML comments expecting Claude to obey them — that content will never reach Claude at runtime.

## `claudeMdExcludes` and the Settings Layers

Large monorepos can exclude unwanted ancestor `CLAUDE.md` files via:

```json
{
  "claudeMdExcludes": [
    "**/monorepo/other-team/CLAUDE.md",
    "/home/user/monorepo/legacy/.claude/rules/**"
  ]
}
```

Patterns are matched against absolute paths using glob syntax. The setting can be set at user, project, local, or managed-policy layers; arrays merge across layers. Managed-policy `CLAUDE.md` files cannot be excluded.

When auditing a repo, check `.claude/settings.json` and `.claude/settings.local.json` for `claudeMdExcludes` and verify the patterns target the files the team actually wants suppressed.

## `.claude/rules/` Path-Scoped Loading

Rules in `.claude/rules/*.md` have two modes:

- **Without `paths:` frontmatter**: loaded at session start, same priority as `.claude/CLAUDE.md`. Treat these like additional always-on chunks of the project memory.
- **With `paths:` frontmatter**: loaded only when Claude reads files matching the glob. Use this for stack-specific or area-specific guidance that would otherwise bloat the root file.

```markdown
---
paths:
  - "src/**/*.{ts,tsx}"
  - "tests/**/*.test.ts"
---

# Frontend Testing Rules
- Prefer Vitest with `screen.getByRole`.
- Co-locate test files with the component.
```

Frontend rules sit dormant when Claude works on Python code. This is how you make a 50-package monorepo tractable.

## Size Targets

- Each `CLAUDE.md`: under 200 lines. Longer files cost tokens every session and reduce adherence.
- Imports do not reduce this; they expand at launch.
- For larger guidance, move content to `.claude/rules/*.md` (with `paths:` if scoped) or to a skill.

## Auto Memory Boundary

Claude Code v2.1.59+ also maintains an auto-memory directory at `~/.claude/projects/<project>/memory/`. This is separate from `CLAUDE.md`:

- Claude writes auto memory itself based on corrections and discoveries.
- Only the first **200 lines or 25KB** of `MEMORY.md` (the index) load at session start. Topic files load on demand.
- Auto memory is machine-local; not in git; shared across worktrees of the same git repo.

When auditing, do not treat auto-memory files as project guidance. Do not propose moving auto-memory content into `CLAUDE.md` or vice versa. They serve different purposes.

## `--add-dir` and `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`

Directories added via `claude --add-dir` do not contribute `CLAUDE.md` files by default. The environment variable `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` enables loading from those directories. When auditing cross-repo setups, ask the user whether they rely on this flag before assuming a referenced file will load.

## `AGENTS.md` Coexistence

Claude Code reads `CLAUDE.md`, not `AGENTS.md`. The official recommendation when a repo already has `AGENTS.md` is to add a one-line bridge in `CLAUDE.md`:

```markdown
@AGENTS.md

## Claude Code

Use plan mode for changes under `src/billing/`.
```

A symlink also works on POSIX systems (Windows requires Developer Mode). Running `/init` on a repo with `AGENTS.md` reads it and merges relevant parts into the generated `CLAUDE.md`. When auditing a dual-tool repo, prefer the `@AGENTS.md` bridge to keep both agents reading the same source of truth.

## Compaction Behavior

After `/compact`, the project-root `CLAUDE.md` is re-read from disk and re-injected. Nested `CLAUDE.md` files are not re-injected automatically; they reload the next time Claude reads a file in that subdirectory. Conversation-only instructions disappear on compaction, which is one reason to write durable rules into `CLAUDE.md` rather than rely on chat.

## Comparison With `AGENTS.md` (Codex)

| Aspect | `CLAUDE.md` | `AGENTS.md` |
|---|---|---|
| Loading model | additive, ancestor-immediate + descendant-lazy + sibling-isolated | scoped, directory-and-descendants with depth override |
| Session-start scope | every ancestor + project + user + managed | only the in-scope `AGENTS.md` set |
| Sibling visibility | never loads | not applicable (scope-based) |
| Personal override | `CLAUDE.local.md` (gitignored) | none standardized |
| Imports | `@path` recursion up to 5 hops | none |
| Comment stripping | block-level `<!-- ... -->` stripped | preserved |
| Excludes setting | `claudeMdExcludes` | none |
| Size guidance | under 200 lines | not specified |
| Path-scoped rules | `.claude/rules/*.md` with `paths:` | none |
| User-global file | `~/.claude/CLAUDE.md` | `~/.codex/AGENTS.md` |

Use this table to translate guidance from one ecosystem to the other without leaking the wrong semantics.
