# Implementation plan: claude-context-improver

Ordered checklist. Validation commands run from repo root; Python via `PYTHONUTF8=1`.

## Step 1 — Preflight

- [ ] `git status -uall` — confirm which dirty paths are pre-existing (`.trellis/**`, `.gitattributes`); do not include them in this task's commits.
- [ ] Confirm `just --list` shows `docs-sync` (memory says it exists; verify name).

## Step 2 — Rename directory

- [ ] `git mv skills/developer-tools-integrations/claude-md-improver skills/developer-tools-integrations/claude-context-improver`
- [ ] Verify: `git status` shows renames, `ls skills/developer-tools-integrations/claude-context-improver`.

## Step 3 — Rewrite SKILL.md

- [ ] Frontmatter per design.md §4 (name, description, version 2.0.0, tags, allowed-tools + AskUserQuestion). Check format against `.trellis/spec/guides/skill-authoring-conventions.md`.
- [ ] Title → "Claude Context Improver"; intro updated (context files, scope choice, /doctor positioning).
- [ ] Insert "Phase 0: Scope" (AskUserQuestion flow, skip conditions, plain-text fallback, scope-effect table per design.md §2).
- [ ] Replace the blanket "~/.claude not edited unless explicitly asked" rule with the scope-aware rule; managed policy stays never-edit.
- [ ] Add "Context Engineering Principles (Claude 5)" section (six then→now shifts, link to new reference file).
- [ ] Update Phase 3 quick checklist with new criterion + rebalanced weights (total 100).
- [ ] Update Phase 5 load-bearing rules (judgement over rules, conflict pass, obvious-content pass, rich references, flag-don't-author skills).
- [ ] Extend "Common Issues to Flag" per design.md §3.4.
- [ ] Keep: additive layering semantics, 200-line target, hook marker preservation, code_map contract, AGENTS.md bridge, trivial-edit fast path.

## Step 4 — References

- [ ] NEW `references/context-engineering-claude5.md` — condensed rules + sources (from `research/context-engineering-sources.md`).
- [ ] `references/quality-criteria.md` — new criteria + weights matching SKILL.md Phase 3.
- [ ] `references/update-guidelines.md` — judgement/progressive-disclosure/global-scope rules.
- [ ] `references/report-format.md` — scope line + context-engineering findings section.
- [ ] `references/claude-md-loading.md` — global-scope discovery notes.
- [ ] `references/templates.md` — self-name mentions only; code_map shared wording stays aligned with agents-md-improver.
- [ ] `agents/interface.yaml` — display_name/short_description/default_prompt.

## Step 5 — Cross-references

- [ ] `skills/developer-tools-integrations/AGENTS.md` — 4 mentions.
- [ ] `agents-md-improver/tests/contracts.test.mjs` — skill list entry.
- [ ] `agents-md-improver/references/templates.md` — shared-wording name mention (keep both files' code_map wording identical).
- [ ] `agents-md-improver/evals/evals.json`, `evals/output/fixtures/agents-md-scenarios.md`, `evals/output/cases.jsonl` — routing strings.
- [ ] `.trellis/spec/guides/skill-authoring-conventions.md` — shared-template note.
- [ ] Sweep: `git grep -l claude-md-improver -- ':!.trellis/tasks/archive' ':!.trellis/workspace' ':!skills/**/reports' ':!docs'` must be empty (docs handled next step).

## Step 6 — Docs regeneration

- [ ] Commit or stash any unrelated `docs/` WIP first (docs-sync reverts hand-edits).
- [ ] `just docs-sync`.
- [ ] Verify old pages gone: `find docs -name '*claude-md-improver*'` → empty; new pages exist for claude-context-improver; catalog.mjs updated.

## Step 7 — Validation (2.2 quality check)

- [ ] `just skills-check`
- [ ] `just node-test` (agents-md-improver contracts test passes with new name)
- [ ] `just python-check`
- [ ] `just ci`
- [ ] Trigger sanity: description contains old triggers (优化 CLAUDE.md, 审计 CLAUDE.md, code_map) + new (context engineering / 优化上下文 / rightsize).
- [ ] Acceptance sweep per prd.md checklist.

## Step 8 — Finish (Phase 3)

- [ ] Spec update if conventions learned (3.3).
- [ ] Conventional commit, e.g. `feat(skills): rename claude-md-improver to claude-context-improver with Claude 5 context-engineering update` (exclude pre-existing dirty paths).

## Rollback

Single revert of the task commit(s); no external state.
