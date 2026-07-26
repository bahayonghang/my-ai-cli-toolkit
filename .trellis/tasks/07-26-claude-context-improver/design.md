# Design: claude-context-improver rename + Claude 5 update

## 1. Rename mechanics

Use `git mv skills/developer-tools-integrations/claude-md-improver skills/developer-tools-integrations/claude-context-improver` so history follows.

### Files inside the skill (all edited)

| File                                                | Change                                                                                                                                                    |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SKILL.md`                                          | frontmatter (`name`, `description`, `version: 2.0.0`, `allowed-tools` + `AskUserQuestion`), title, new workflow Phase 0 (scope), Claude 5 content updates |
| `agents/interface.yaml`                             | `display_name: "Claude Context Improver"`, short_description mentions scope choice, default_prompt uses `$claude-context-improver`                        |
| `references/claude-md-loading.md`                   | add global-scope loading notes (user-level `~/.claude/CLAUDE.md`, `~/.claude/rules/`, imports); keep loading model intact                                 |
| `references/quality-criteria.md`                    | add Claude 5 criteria (conflicts, over-constraint, obvious content, memory-dump, example-heavy) and rebalance weights                                     |
| `references/update-guidelines.md`                   | add judgement-over-rules and progressive-disclosure update rules; global-scope editing rules                                                              |
| `references/report-format.md`                       | report skeleton gains "scope" line + context-engineering findings section                                                                                 |
| `references/templates.md`                           | keep code_map shared wording, update self-name mention                                                                                                    |
| **NEW** `references/context-engineering-claude5.md` | condensed Claude 5 rules with sources (from research/context-engineering-sources.md)                                                                      |

### Active cross-references outside the skill (edited)

| File                                                                                                                               | What                                                                             |
| ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `skills/developer-tools-integrations/AGENTS.md`                                                                                    | 4 mentions: catalog list, exemplar note, allowed-tools table row, evals-gap note |
| `skills/developer-tools-integrations/agents-md-improver/tests/contracts.test.mjs`                                                  | skill list entry `"claude-md-improver"` → `"claude-context-improver"`            |
| `skills/developer-tools-integrations/agents-md-improver/references/templates.md`                                                   | shared code_map wording: skill-name mention only                                 |
| `skills/developer-tools-integrations/agents-md-improver/evals/evals.json`                                                          | routing expectations (2 strings)                                                 |
| `skills/developer-tools-integrations/agents-md-improver/evals/output/fixtures/agents-md-scenarios.md` + `evals/output/cases.jsonl` | routing fixture text                                                             |
| `.trellis/spec/guides/skill-authoring-conventions.md`                                                                              | shared-template ownership note                                                   |
| `docs/**` (generated)                                                                                                              | regenerate via `just docs-sync`; verify old-name pages removed                   |

### Explicitly untouched

`.trellis/tasks/archive/**`, `.trellis/workspace/**`, `skills/**/reports/**` (historical snapshots), `~/.claude/**`.

## 2. Scope selection design (SKILL.md "Phase 0: Scope")

Insert before current Phase 1 (Discovery):

- **When to ask**: audit/optimization requests where the user did not already name a scope. Skip for trivial-edit fast path and when the request names concrete files.
- **How**: AskUserQuestion, single question, header "优化范围":
  - Option 1 (Recommended): "当前仓库" — audit repo `CLAUDE.md` tree + `.claude/rules/` + `code_map.md`.
  - Option 2: "全局" — audit `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`, and files imported via `@` from them.
- **Fallback**: if AskUserQuestion is unavailable (skill installed on another platform), ask the same two options as plain text; treat no-preference as 当前仓库.
- **Effect on downstream phases** (table in SKILL.md):

| Phase        | 当前仓库 (default)                      | 全局                                                                                                        |
| ------------ | --------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Discovery    | existing `find` commands from repo root | `~/.claude/CLAUDE.md`, `~/.claude/rules/*.md`, resolve `@` imports (depth ≤ 4)                              |
| Evidence     | verify against repo manifests           | verify claims are machine-portable (no repo-specific paths/commands presented as global truths)             |
| Quality      | existing rubric + Claude 5 criteria     | same rubric; extra check: global file must not duplicate per-repo guidance better kept in project CLAUDE.md |
| Updates      | edit repo files                         | editing `~/.claude/**` authorized by the scope answer; managed policy paths never edited                    |
| Verification | `git diff --check` etc.                 | no git available for `~/.claude` unless it is a repo; verify line counts, import resolution manually        |

Global scope replaces the old blanket rule "user-level `~/.claude/CLAUDE.md` … is not edited unless the user explicitly asks" with: "not edited unless scope=全局 was selected or the user explicitly asks".

## 3. Claude 5 content integration

Keep the existing loading-model semantics (additive layering, 200-line target, `@import` mechanics) — still accurate. Add:

1. **New "Context Engineering Principles (Claude 5)" section** in SKILL.md (short, ~15 lines) summarizing the six then→now shifts, linking `references/context-engineering-claude5.md` for detail (progressive disclosure applied to ourselves).
2. **Quality criteria additions** (quality-criteria.md + Phase 3 quick checklist): new criterion "judgement fit & conflict-freedom" — no conflicting rules across layers, no over-constraining absolutes outside safety-critical areas, no obvious content, no memory dumps, no example walls. Rebalance weights so total stays 100.
3. **Update rules additions** (SKILL.md Phase 5 + update-guidelines.md):
   - Prefer intent-phrased guidance over absolute rules; reserve hard rules for expensive-mistake areas (secrets, destructive ops, deploys, PII).
   - Run a conflict pass and an obvious-content pass before proposing additions.
   - Recommend moving multi-step procedures into skills and referencing them (flag-only; do not author skills).
   - Recognize rich references (specs-as-code, test suites, HTML artifacts, rubrics) as preferable to restated prose.
4. **Common Issues additions**: conflicting absolutes across layers; content restating what the file tree shows; session-memory dumps; example-heavy tool guidance; CLAUDE.md used as a second system prompt.
5. **`/doctor` positioning**: one line noting `/doctor` is Anthropic's automated rightsizer; this skill is the repo-tailored, report-first companion.

## 4. Frontmatter (target)

```yaml
name: claude-context-improver
description: >-
  Audit and improve Claude Code context files — CLAUDE.md guidance,
  .claude/rules/ path-scoped rules, and companion code_map.md maps — under
  Claude 5 context-engineering rules (judgement over rules, progressive
  disclosure). Asks whether to optimize the current repository (default) or
  global ~/.claude context. Use when the user asks to check, audit, optimize,
  rightsize, or restructure CLAUDE.md or context files, mentions nested
  CLAUDE.md, code_map.md, context engineering, or says 优化 CLAUDE.md,
  审计 CLAUDE.md, 优化上下文, 生成 code_map (Claude). Not for trivial
  single-line edits the user has already fully specified.
version: 2.0.0
category: developer-tools-integrations
tags:
  [
    claude-code,
    claude-md,
    context-engineering,
    repository-guidance,
    memory,
    audit,
    documentation,
    code-map,
  ]
argument-hint: "[audit-or-update-goal]"
allowed-tools: Read, Glob, Grep, Edit, Write, AskUserQuestion, Bash(git *), Bash(find *)
```

(Exact tag list/format must follow `skill-authoring-conventions.md`; verify during implementation.)

## 5. Compatibility & rollback

- Rename is atomic in one commit; rollback = revert the commit.
- No other skill imports files from `claude-md-improver/` by path (verified via grep — only name mentions).
- `agents-md-improver` keeps working: only its references to the sibling's name change; shared code_map template wording stays byte-identical apart from the skill name.
- Docs are fully generated; `just docs-sync` after the rename handles page add/remove. Repo currently has unrelated dirty files (`.trellis/**`, `.gitattributes`) — leave them out of this task's commits.
