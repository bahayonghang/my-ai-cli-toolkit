# Optimize geju skill

- Date: 2026-06-06
- Status: Planning
- Task: `.trellis/tasks/06-06-geju-skill-optimization`

## Goal

Optimize the existing `skills/development-workflows/geju` skill into a polished, English-only, self-contained strategic reframing skill.

The skill should keep its current identity and purpose: help an agent think bigger, challenge local-detail fixation, question default compatibility preservation, and produce bold but testable product or architecture direction hypotheses. It must not depend on Chinese wording, nonexistent skills, or this repository's other skills.

## User Requirements

- Remove Chinese text from the skill and use English consistently.
- Delete references to nonexistent skills.
- Do not reference this repository's other skills.
- Create a complete optimization plan before implementation.

## Confirmed Facts

- Target skill directory: `skills/development-workflows/geju`.
- Current top-level files:
  - `SKILL.md`
  - `references/output-template.md`
  - `agents/openai.yaml`
- Current non-ASCII text appears in:
  - `SKILL.md` line 3
  - `SKILL.md` line 10
  - `SKILL.md` line 14
  - `SKILL.md` line 154
  - `references/output-template.md` line 6
  - `references/output-template.md` line 20
- Current cross-skill references appear in `SKILL.md` lines 201-203.
- `python scripts/check.py skills/development-workflows/geju` currently succeeds but warns that the top-level `category` field is missing.
- `python docs/scripts/sync_docs_catalog.py --check` currently fails because generated docs are out of date and the generated `geju` detail pages are missing.
- `skills/AGENTS.md` requires first-party skills to keep frontmatter fields such as `name`, `description`, `category`, `tags`, and `version` aligned with the directory category.

## Requirements

1. Preserve the skill directory and frontmatter name as `geju` unless the user separately requests a breaking rename.
2. Update `SKILL.md` frontmatter to include complete top-level metadata:
   - `name: geju`
   - `description`
   - `category: development-workflows`
   - `tags`
   - `version`
3. Rewrite `SKILL.md` content so all user-facing and instruction text is English.
4. Rewrite `references/output-template.md` so all headings and explanatory text are English.
5. Keep `agents/openai.yaml` English-only. Update it only if needed to match the refined trigger and purpose.
6. Remove all references to specific skills, including nonexistent external skills and other first-party skills in this repository.
7. Replace cross-skill routing language with generic boundaries, such as "not a substitute for implementation review" or "not a PRD authoring workflow."
8. Sharpen trigger boundaries so `geju` is used for strategic reframing and bigger-frame direction setting, not ordinary code review, PRD writing, implementation planning, or adversarial risk review.
9. Keep the core behavior:
   - lead with a bold thesis
   - identify the inherited constraint
   - decide whether the constraint is real
   - separate target direction from migration or execution
   - pair bold claims with proof points and falsifiers
10. Add an explicit execution boundary: the skill should not write code, modify files, or start implementation unless the user explicitly asks for execution after the strategic judgment.
11. Regenerate generated docs after public skill metadata/content changes.

## Acceptance Criteria

- [ ] `rg -n "[^\x00-\x7F]" skills/development-workflows/geju` returns no matches.
- [ ] `rg -n "clean-code-reviewer|hai-architecture|hai-prd|code-auditor|code-quality-review|spark|cold-shower|\$[a-z0-9-]+" skills/development-workflows/geju` returns no cross-skill references, except `$geju` may remain in `agents/openai.yaml` because it names this skill's own explicit invocation.
- [ ] `python scripts/check.py skills/development-workflows/geju` passes without the current missing-category warning.
- [ ] `python docs/scripts/sync_docs_catalog.py --check` passes after running `just docs-sync`.
- [ ] `just skills-check` passes.
- [ ] `just docs-check` passes.
- [ ] `just ci` passes before final completion if feasible.
- [ ] The final `SKILL.md` still explains the skill's purpose, core principle, frame-opening moves, workflow, output rules, and non-goals.
- [ ] The final output template is English-only and still covers thesis, confidence, inherited constraint, direction, frame-opening move, bold takes, options, proof point, and falsifier.

## Out Of Scope

- Renaming the skill from `geju` to a fully English slug.
- Changing the directory path.
- Creating a full benchmark or eval viewer loop.
- Rewriting unrelated development workflow skills.
- Adding scripts or runtime dependencies.
- Implementing the optimized skill before the planning artifacts are reviewed and the task is started.

## Assumptions

- `geju` is treated as an ASCII skill identifier and can remain even though it is romanized from Chinese.
- Generated docs should be updated as part of implementation because the skill is public catalog content.
- This is a content and metadata optimization task, not a behavior-runtime or automation task.

## Open Questions

None currently block planning. If the user wants a breaking rename away from `geju`, that should be treated as a separate migration decision before implementation.
