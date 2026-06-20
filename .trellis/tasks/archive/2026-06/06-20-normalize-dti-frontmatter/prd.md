# Normalize frontmatter and interface files across the category

## Goal

Remove the cosmetic/consistency drift in frontmatter and `agents/` interface
files so the 7 skills present a uniform surface, per whatever the category
AGENTS.md codifies.

## Background / evidence

Frontmatter (verified via parse):

| Skill | version | allowed-tools | argument-hint | agents/ interface |
|---|---|---|---|---|
| agent-skill-review | `"1.0.0"` (quoted) | — | — | `openai.yaml` only (+ `policy:`) |
| agents-md-improver | 1.0.0 | Y | Y | none |
| archive-planning | 0.1.0 | Y | Y | none |
| ast-grep | 0.1.0 | Y | Y | none |
| claude-md-improver | 1.0.0 | Y | Y | none |
| codex-workflow-recommender | 1.0.0 | Y | Y | none |
| goal-meta-skill | 0.1.0 | — | — | `interface.yaml` + `openai.yaml` |

House rules: `git-github-collaboration/AGENTS.md:19-50` — declare exactly the
tools used; single neutral `agents/interface.yaml` with
`display_name`/`short_description`/`default_prompt`; no fabricated extras.

## Requirements

1. `agent-skill-review`: add `allowed-tools` reflecting actual use (reads skill
   files, optionally edits when asked → e.g. `Read, Glob, Grep, Edit, Write,
   Bash`). Add `argument-hint` (e.g. `"[skill-dir-or-path]"`).
2. `goal-meta-skill`: add `allowed-tools` (runs the lint script + reads refs →
   e.g. `Read, Bash(python *), Bash(py *)`) and `argument-hint`
   (e.g. `"[vague-task-or-goal]"`).
3. Interface files — apply the policy set by `06-20-add-dti-agents-md`:
   - `agent-skill-review`: rename `agents/openai.yaml` → `agents/interface.yaml`
     (neutral name); keep/relocate the `policy.allow_implicit_invocation` field
     per the agreed contract.
   - `goal-meta-skill`: collapse the redundant `agents/openai.yaml` into the
     richer `agents/interface.yaml` (keep one neutral file).
4. Optional cosmetic: unquote `agent-skill-review`'s `version` to match siblings
   (low value; only if touching that frontmatter anyway).
5. Leave `version` numbers themselves alone — 0.1.0 vs 1.0.0 reflects real
   maturity differences, not drift.

## Constraints

- `allowed-tools` must list only real Claude Code tools (no bare `python`).
- Do not invent interface fields beyond the agreed contract.
- If interface files are deleted/renamed, run `just docs-sync` so the catalog
  does not drift (per git-github AGENTS.md "After structural changes").

## Acceptance Criteria

- [ ] All 7 skills either carry `allowed-tools` + `argument-hint`, or the
      AGENTS.md records why a given skill omits them.
- [ ] No platform-named `agents/openai.yaml` remains unless the AGENTS.md
      explicitly allows it; no skill has both `interface.yaml` and `openai.yaml`.
- [ ] `just skills-check` clean (no unexpected-key warnings).
- [ ] `just ci` clean, including `docs-check` after any `docs-sync`.

## Notes

- Lightweight task: PRD-only is sufficient.
- Lowest priority of the four; depends on the interface policy from
  `06-20-add-dti-agents-md`.
