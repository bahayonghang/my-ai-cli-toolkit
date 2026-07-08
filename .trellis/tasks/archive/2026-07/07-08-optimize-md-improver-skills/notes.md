# Task Notes: optimize-md-improver-skills

## R4 trigger change record (routing-boundary evidence)

### claude-md-improver description trigger — before

> "Make sure to use this skill whenever the user wants to manage Claude Code memory files at
> any layer, even if they only mention CLAUDE.md without explicit audit wording."

### After

> "Also use for structural CLAUDE.md work — splitting, layering, migrating content to rules —
> even without explicit audit wording. Not needed for trivial single-line CLAUDE.md edits the
> user has already fully specified."

Plus a "Trivial edit fast path" paragraph in the SKILL.md body: fully-specified single scoped
edits are applied directly with only marker-block / 200-line / no-`@code_map.md` checks.

### Overlap check vs agents-md-improver

- Shared trigger surface: both descriptions claim code_map generation. Disambiguators kept:
  agents-md-improver claims "生成 code_map.md" in Codex context; claude-md-improver claims
  "生成 code_map (Claude)" and all CLAUDE.md/`.claude/rules` phrases. File-name keywords
  (AGENTS.md vs CLAUDE.md) remain the primary router signal; no new overlap introduced —
  the change only narrows claude-md-improver's claim.
- yao-meta `trigger_eval.py`: not available in this environment — missing evidence; the
  before/after record above is the substitute.

## R8 decision: no separate Codex semantics reference for agents-md-improver

Decision: do not add a `references/agents-md-semantics.md`. Rationale: Codex AGENTS.md scope
semantics (directory-and-descendants, deeper file overrides) fit in the 7 bullet lines of the
SKILL.md Core Semantics section and have none of the additive-layering edge cases that
justify claude-md-improver's 8K loading reference; the cross-ecosystem comparison table
already lives in `claude-md-improver/references/claude-md-loading.md`.

## R5 verification record (2026-07-08, against https://code.claude.com/docs/en/memory)

- Confirmed: additive ancestor loading + lazy descendant loading + sibling isolation;
  managed→user→project→local precedence; block-level HTML comment stripping;
  `claudeMdExcludes` (absolute-path globs, layer merge, managed not excludable);
  `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`; `.claude/rules` `paths:` semantics;
  under-200-lines guidance (now in official docs); auto memory v2.1.59+, MEMORY.md
  200-line/25KB load limit; compaction re-injection behavior; `/init` reading AGENTS.md.
- Corrected: `@import` max recursion depth is **4 hops** (was written as 5 in six places);
  Windows symlink needs **Administrator privileges or Developer Mode** (was "Developer
  Mode" only); precedence wording softened to "./CLAUDE.md or ./.claude/CLAUDE.md" (docs
  do not specify an order between them); 200-line claim re-anchored from a blog URL to the
  official memory docs.
- Added from docs: import parsing skips backticked/code-fenced paths (one line in
  claude-md-loading.md).
