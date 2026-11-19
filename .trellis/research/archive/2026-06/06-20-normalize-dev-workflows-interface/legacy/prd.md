# Normalize development-workflows interface files

- Date: 2026-06-20
- Status: Planning
- Priority: P2 (convention drift)
- Task: `.trellis/tasks/06-20-normalize-dev-workflows-interface`

## Goal

Align this subtree's agent interface files with the repo's neutral-naming convention, and neutralize host-specific "Codex" wording in skills that are installed for any agent (including Claude Code). The documented rule (`developer-tools-integrations/AGENTS.md` "Interface contract"): if an interface file is present it must be a single neutral `agents/interface.yaml`, never a platform-named `openai.yaml`.

## Confirmed Facts

- Repo-wide, neutral `agents/interface.yaml` is the standard: 6 files across `developer-tools-integrations/` and `git-github-collaboration/`.
- `agents/openai.yaml` exists in exactly 4 places, all in this subtree:
  - `codex-dynamic-workflows/agents/openai.yaml`
  - `cold-shower/agents/openai.yaml`
  - `geju/agents/openai.yaml`
  - `goudi/agents/openai.yaml`
- Content is structurally identical to `interface.yaml` (top-level `interface:` → `display_name`, `short_description`, `default_prompt`). Verified by diffing `cold-shower/openai.yaml` against `git-commit/interface.yaml`: same shape. So normalization is a **rename**, not a rewrite.
- DTI AGENTS.md explicitly labels platform-named `openai.yaml` as "drift to normalize" and forbids shipping both `interface.yaml` and `openai.yaml`.
- Host-specific wording: `SKILL.md` bodies hardcode "Codex" as the running agent in skills that are platform-neutral:
  - `geju/SKILL.md` — 5 occurrences (e.g. "pushes Codex out of compatibility anxiety", "Codex often keeps old behavior").
  - `goudi/SKILL.md` — 1 occurrence.
  - Excluded (intentional/legitimate): `spark/SKILL.md` (15) genuinely handles Codex vs Claude Code plan-mode surfaces; `codex-dynamic-workflows` (2) is Codex-named by design.
- A prior task (`archive/2026-06/06-06-geju-skill-optimization`) already aimed to make geju self-contained/portable; the "Codex" host-naming was not addressed then.

## Requirements

1. Rename each `agents/openai.yaml` → `agents/interface.yaml` for: codex-dynamic-workflows, cold-shower, geju, goudi. Preserve file contents (adjust only if a field references the platform name unnecessarily).
2. Ensure no skill ships both `openai.yaml` and `interface.yaml`.
3. Neutralize host-specific "Codex" wording in `geju/SKILL.md` (5) and `goudi/SKILL.md` (1) — replace with neutral phrasing ("the agent", "the model", or second-person "you"). Preserve meaning and tone.
4. Do not alter intentional Codex references in `spark` and `codex-dynamic-workflows`.
5. Confirm interface files carry the required fields `display_name`, `short_description`, `default_prompt`.

## Acceptance Criteria

- [ ] `find skills/development-workflows -name openai.yaml` returns nothing; 4 new `interface.yaml` files exist.
- [ ] No skill directory contains both interface file names.
- [ ] `grep -c 'Codex' geju/SKILL.md goudi/SKILL.md` returns 0; `spark` and `codex-dynamic-workflows` are unchanged.
- [ ] `just skills-check` passes; `just docs-sync` run and `just ci` clean (renaming interface files can drift the docs catalog).

## Out of Scope

- Rewriting skill behavior, triggers, or the strategic-thinking methodology of geju/goudi.
- Adding interface files to skills that currently have none.
