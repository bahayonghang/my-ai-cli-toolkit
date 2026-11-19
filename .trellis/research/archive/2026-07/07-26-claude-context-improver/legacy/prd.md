# Rename claude-md-improver to claude-context-improver with Claude 5 context-engineering update

## Goal

Rename `skills/developer-tools-integrations/claude-md-improver` to `claude-context-improver`, and upgrade its guidance to the Claude 5 era context-engineering rules published by Anthropic (Thariq @trq212 tweet, 2026-07-24, and the official blog "The new rules of context engineering for Claude 5 generation models"). Add a scope selector: at execution time the skill asks via AskUserQuestion whether to optimize the **current repository** (default) or the **global** user-level context (`~/.claude/`).

## Requirements

### R1 — Rename

- Directory `skills/developer-tools-integrations/claude-md-improver/` → `skills/developer-tools-integrations/claude-context-improver/` via `git mv`.
- `SKILL.md` frontmatter `name: claude-context-improver`; version bump to `2.0.0` (breaking rename + behavior change).
- `agents/interface.yaml`: display name "Claude Context Improver", updated short_description and `$claude-context-improver` default prompt.
- Update all active cross-references (see design.md for the exact file list): category `AGENTS.md`, `agents-md-improver` contracts test / evals / templates shared-wording, `.trellis/spec/guides/skill-authoring-conventions.md`.
- Do NOT touch: `.trellis/tasks/archive/**`, `.trellis/workspace/**` journals, generated report snapshots (`skills/**/reports/**`).
- Regenerate docs catalog (`just docs-sync`) so `docs/**` pages follow the new name; stale pages under the old name must be gone.

### R2 — Scope selection (new feature)

- At the start of an audit/optimization run, the skill asks the user via `AskUserQuestion`:
  - **当前仓库 (Recommended, default)** — repo `CLAUDE.md` tree, `.claude/rules/`, `code_map.md`.
  - **全局** — `~/.claude/CLAUDE.md`, `~/.claude/rules/`, and files it `@`-imports.
- Skip the question when: the user already stated the scope in their request, or the trivial-edit fast path applies.
- Fallback: if the `AskUserQuestion` tool is unavailable (non-Claude-Code platform), ask the same question as plain text and wait for the answer; default to current repo if the user says "default".
- Selecting 全局 counts as explicit authorization to audit and edit user-level files (today's SKILL.md forbids this without explicit ask — that rule is superseded by the scope answer). Managed policy files (`/etc/claude-code/`, `C:\Program Files\ClaudeCode\`, macOS managed path) stay read-only forever.
- `allowed-tools` frontmatter gains `AskUserQuestion`.

### R3 — Claude 5 context-engineering content update

Incorporate the six "then → now" shifts from the tweet/blog into the audit criteria, update rules, and common-issues list:

1. **Rules → judgement**: flag over-constraining absolute rules (NEVER/ALWAYS walls, conflicting instructions across layers); recommend deletion or softening to intent.
2. **Examples → interfaces**: flag example-heavy guidance that constrains exploration; prefer describing expressive parameters/contracts.
3. **Upfront → progressive disclosure**: CLAUDE.md is not a central repository of every practice; recommend a tree of files loaded at the right time — move multi-step procedures into skills, keep CLAUDE.md pointing at them.
4. **Repeat yourself → say it once**: flag duplicated instructions across layers (root vs nested vs rules).
5. **Memory in CLAUDE.md → auto-memory**: flag memory-dump content (session facts, past decisions) that belongs in auto-memory, not CLAUDE.md.
6. **Simple specs → rich references**: recognize specs-as-code, test suites, HTML artifacts, and rubrics as valid reference targets; CLAUDE.md may point to them instead of restating.

Plus the blog's structural advice: CLAUDE.md = "what the repo is for + gotchas", avoid stating the obvious derivable from the file tree; mention `/doctor` as the complementary official tool. Add a new reference file capturing these rules with sources; update `quality-criteria.md`, `update-guidelines.md`, and the Common Issues list accordingly.

### R4 — Scope boundary (unchanged core)

The skill still audits the CLAUDE.md family (`CLAUDE.md`, `CLAUDE.local.md`, `.claude/rules/*.md`, `code_map.md`). It now additionally _flags_ content that should migrate to skills/memory/references, but it does not author or edit skills itself (that is yao-meta / skill-creator territory).

## Acceptance Criteria

- [ ] `git grep claude-md-improver` returns no hits outside `.trellis/tasks/archive/`, `.trellis/workspace/`, and `skills/**/reports/` snapshots.
- [ ] `skills/developer-tools-integrations/claude-context-improver/SKILL.md` exists with `name: claude-context-improver`, `version: 2.0.0`, description keeping existing triggers (优化 CLAUDE.md, 审计 CLAUDE.md, code_map) plus context-engineering triggers.
- [ ] SKILL.md workflow contains the scope-selection step with AskUserQuestion, default 当前仓库, plain-text fallback, and the skip conditions.
- [ ] Global scope path documents its own discovery targets (`~/.claude/CLAUDE.md`, `~/.claude/rules/`, `@`-imports) and keeps managed policy read-only.
- [ ] All six then→now shifts appear in the audit criteria and a new `references/` file cites the tweet + official blog + Fable 5 prompting docs.
- [ ] `agents-md-improver` contracts test passes with the new name (`just node-test`).
- [ ] Docs regenerated; no `docs/**` page for the old name remains.
- [ ] `just ci` passes.

## Constraints

- Windows environment: `rm -rf` blocked by pre-bash hook; `just docs-sync` reverts uncommitted hand-edits to `docs/` — commit/stash unrelated WIP first; run Python with `PYTHONUTF8=1`.
- Shared `code_map.md` template wording between `agents-md-improver` and this skill must stay identical in both files — edit both together (only the skill-name mention changes).
- Follow repo skill-authoring conventions (`.trellis/spec/guides/skill-authoring-conventions.md`).
