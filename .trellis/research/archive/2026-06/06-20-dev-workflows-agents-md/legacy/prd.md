# Add development-workflows subtree AGENTS.md

- Date: 2026-06-20
- Status: Planning
- Priority: P2 (root-cause / drift-prevention)
- Task: `.trellis/tasks/06-20-dev-workflows-agents-md`

## Goal

Give the `skills/development-workflows/` subtree its own `AGENTS.md` documenting suite conventions. It is the largest skill subtree (11 skills) and the one with the most internal drift, yet — unlike `developer-tools-integrations/` and `git-github-collaboration/` — it has **no subtree conventions doc**. This is the root-cause anchor that defines the target state for the evals and interface normalization tasks and prevents future drift.

## Confirmed Facts

- `skills/development-workflows/AGENTS.md` does not exist.
- Sibling subtrees have one: `skills/developer-tools-integrations/AGENTS.md`, `skills/git-github-collaboration/AGENTS.md`. The parent `skills/AGENTS.md` exists but does not cover evals schema, interface-file naming, or the `$SKILL_DIR` rule.
- Current drift in this subtree that a conventions doc should codify:
  - evals key inconsistency: `assertions` (cold-shower) vs `expectations` (5 skills) vs none (2 skills) — see task `06-20-normalize-dev-workflows-evals`.
  - interface-file naming: 4 skills ship `agents/openai.yaml` instead of neutral `agents/interface.yaml` — see task `06-20-normalize-dev-workflows-interface`.
  - `$SKILL_DIR` usage in `code-auditor` — see task `06-20-fix-code-auditor-skill-dir`.
- `skills/developer-tools-integrations/AGENTS.md` is the reference template (sections: reference exemplars, script path resolution, allowed-tools, evals, interface contract, frontmatter, after-structural-changes).

## Requirements

1. Create `skills/development-workflows/AGENTS.md` mirroring the structure and rules of `developer-tools-integrations/AGENTS.md`, adapted to this subtree's skills (code review, refactor, planning, artifact, strategic-thinking families).
2. Codify, at minimum:
   - **Script path resolution**: `` `<skill-dir>` `` literal-substitution placeholder + one-line note; no bare `$SKILL_DIR`; no cwd-relative script paths; Windows `python`/`py -3` fallback.
   - **Evals**: one format/location `evals/evals.json`, git-commit schema, key **`assertions`** (not `expectations`); routing-negative near-neighbor cases; CI does not execute evals; evals gap is acceptable but encouraged for routing-heavy skills.
   - **Interface contract**: optional; if present, one neutral `agents/interface.yaml` (never platform-named `openai.yaml`, never both); required fields `display_name`, `short_description`, `default_prompt`.
   - **`allowed-tools`**: comma-separated string form; declare real tools actually used.
   - **Frontmatter**: required `name`, `description`, `category: development-workflows`, `tags`, `version`; description ≤1024 chars, no angle brackets.
   - **After structural changes**: run `just docs-sync` then `just ci`.
3. Reference concrete in-subtree exemplars where useful (e.g. a skill that already follows each rule).
4. Keep it consistent with — not contradictory to — `skills/AGENTS.md` and the DTI/gh AGENTS.md files.

## Acceptance Criteria

- [ ] `skills/development-workflows/AGENTS.md` exists and covers script paths, evals schema, interface naming, allowed-tools, frontmatter, and post-change verification.
- [ ] Conventions stated match those already enforced/documented elsewhere (no contradictions with `scripts/check.py` or sibling AGENTS.md files).
- [ ] `just ci` passes clean (including `git diff --check`).

## Out of Scope

- Actually editing the skills to conform (handled by the evals/interface/skill-dir tasks). This task only documents the target state.
