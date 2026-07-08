# Implementation Plan: optimize-md-improver-skills

Design decisions are embedded in prd.md (R2 canonical wording, R3 preferred option);
no separate design.md — this is documentation restructuring, not system design.

Paths below are relative to repo root; `A/` = `skills/developer-tools-integrations/agents-md-improver/`,
`C/` = `skills/developer-tools-integrations/claude-md-improver/`.

## Ordered Checklist

### Step 1 — R3: remove unreachable PowerShell branch (both skills)

- [ ] `A/SKILL.md`, `C/SKILL.md`: drop `Bash(Get-ChildItem *)`, `Bash(Get-Content *)`,
      `Bash(Select-String *)` from `allowed-tools`; delete the PowerShell code blocks in
      Phase 1 (keep POSIX `find` commands).
- Verify: `grep -rn "Get-ChildItem\|Select-String" A/ C/` returns nothing.

### Step 2 — R6 + R8: discovery command consistency (both skills)

- [ ] Extend both `find` commands with `vendor/` exclusion and add one sentence: the
      command is a starting set; the prose exclusion list governs.
- [ ] `C/SKILL.md`: add `-not -path './.git/*'` to the `.claude/rules` find command.
- Verify: prose exclusion list ⊆ command excludes ∪ "prose governs" sentence present.

### Step 3 — R2: converge shared code_map templates (both skills)

- [ ] Pick canonical root code_map opening: "Behavioral rules, required commands, and
      safety constraints live in `CLAUDE.md` / `AGENTS.md` (whichever exist in this
      repository)."; apply to `A/references/templates.md` and `C/references/templates.md`.
- [ ] Unify nested code_map template wording (`<subtree>/**` form) in both files.
- [ ] Add symmetric shared-artifact note in both templates files ("shared with
      <sibling-skill>; edit both together").
- [ ] Add dual-tool coexistence note to both SKILL.md bodies (Core Semantics section):
      code_map.md is a shared artifact; do not rewrite the sibling's guidance-file mention;
      prefer `@AGENTS.md` bridge for shared content.
- Verify: diff the two root code_map template blocks — identical except skill-name mention;
  same for nested.

### Step 4 — R4: narrow claude-md-improver trigger + fast path

- [ ] Record current description trigger phrases in task notes (before snapshot).
- [ ] Rewrite the final catch-all sentence of `C/SKILL.md` description so trivial
      single-edit requests are not force-claimed; keep audit/optimize/nested/loading
      triggers intact.
- [ ] Add a short "Trivial edit fast path" paragraph near the top of `C/SKILL.md` body:
      scoped one-line edits → apply directly with marker-block / 200-line / no-`@code_map`
      checks only.
- [ ] Write before/after trigger phrases + overlap check vs `A/` description ("生成
      code_map.md" vs "生成 code_map (Claude)") into task notes; if `trigger_eval.py` is
      unavailable, label as missing evidence.
- Verify: `python scripts/check.py C/` passes (description ≤1024 chars, no angle brackets).

### Step 5 — R5: verify external claims in claude-md-loading.md

- [ ] Check against https://code.claude.com/docs/en/memory (WebFetch): additive loading,
      precedence order (`./CLAUDE.md` then `./.claude/CLAUDE.md`), `@import` depth 5,
      comment stripping, `claudeMdExcludes`, `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD`,
      auto-memory version/limits, blog URL liveness.
- [ ] Correct changed claims; label unreachable/unverifiable ones "unverified as of
      2026-07-08"; add "Last verified: 2026-07-08 against <source>" line near the top.
- Verify: every claim listed in prd.md R5 is either confirmed, corrected, or labeled.

### Step 6 — R7: externalize report templates (both skills)

- [ ] Create `A/references/report-format.md` and `C/references/report-format.md` holding
      the Phase 4 report skeleton + Final Output template (verbatim move).
- [ ] Replace inline blocks in both SKILL.md with one-line pointers; add the new file to
      each "Reference Files" list.
- Verify: `wc -l` shows both SKILL.md shrank; moved content is byte-identical to source.

### Step 7 — R1: add agents/interface.yaml (both skills)

- [ ] Read 2–3 sibling `agents/interface.yaml` (e.g. `agent-skill-review`, `ripgrep`,
      `windows-dev-process-cleanup`) to extract the schema in use.
- [ ] Write `A/agents/interface.yaml` and `C/agents/interface.yaml` aligned with each
      SKILL.md (name, description, inputs = audit-or-update-goal, outputs = quality report
      / targeted edits, boundaries = report-first, no user-level file edits).
- Verify: structure matches sibling files; names match frontmatter.

### Step 8 — R8 remainder + version bump

- [ ] `A/references/quality-criteria.md` + `A/references/templates.md`: mark OMX content
      as environment-specific/optional; record decision on a Codex semantics reference in
      task notes (adding the file is optional).
- [ ] Bump `version: 1.0.0` → `1.1.0` in both SKILL.md frontmatters.

### Step 9 — Final verification

- [ ] `PYTHONUTF8=1 python scripts/check.py A/ C/` → both OK, no new warnings.
- [ ] `just skills-check`
- [ ] `just ci`
- [ ] `git diff --check`

## Rollback

Pure doc/frontmatter changes in two skill dirs + task artifacts; rollback = `git checkout`
of the two skill directories. No generated files, no scripts touched.

## Review Gates

- After Step 4: trigger before/after recorded — routing-boundary change reviewed before
  proceeding.
- After Step 9: all acceptance criteria in prd.md checked off before commit.
