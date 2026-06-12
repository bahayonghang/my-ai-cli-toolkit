# Geju Skill Optimization Implementation Plan

- Date: 2026-06-06
- Status: Draft for review

## Preconditions

- User has reviewed and approved `prd.md`, `design.md`, and this `implement.md`.
- Task has been started with:

```powershell
python .\.trellis\scripts\task.py start .\.trellis\tasks\06-06-geju-skill-optimization
```

Do not implement before the task is started.

## Implementation Checklist

1. Check current worktree state.
   - Command: `git status --short`
   - Verify: identify any unrelated user changes before editing.

2. Update `skills/development-workflows/geju/SKILL.md` frontmatter.
   - Add `category: development-workflows`.
   - Add suitable `tags`.
   - Add `version: 0.1.0`.
   - Rewrite `description` in English.
   - Include positive triggers and negative boundaries.
   - Verify: `python scripts/check.py skills/development-workflows/geju` should no longer warn about missing category.

3. Rewrite `SKILL.md` body to be English-only and self-contained.
   - Replace all Chinese and mixed-language text with English.
   - Keep the core principle as "Bold hypothesis, careful verification."
   - Replace "high-geju" style phrasing with "bigger-frame" or "high-leverage".
   - Remove references to nonexistent skills.
   - Remove references to this repository's other skills.
   - Add an explicit no-execution boundary.
   - Verify: `rg -n "[^\x00-\x7F]" skills/development-workflows/geju/SKILL.md` returns no matches.

4. Rewrite `skills/development-workflows/geju/references/output-template.md`.
   - Convert the title and headings to English.
   - Preserve the template's decision-support structure.
   - Keep it useful for full strategic judgment responses.
   - Verify: `rg -n "[^\x00-\x7F]" skills/development-workflows/geju/references/output-template.md` returns no matches.

5. Review `skills/development-workflows/geju/agents/openai.yaml`.
   - Keep `display_name`, `short_description`, and `default_prompt` English-only.
   - Keep `$geju` as the allowed self-reference if the default prompt continues to name this skill.
   - Verify: no cross-skill reference is introduced.

6. Run targeted content checks.
   - Commands:

```powershell
rg -n "[^\x00-\x7F]" skills/development-workflows/geju
rg -n "clean-code-reviewer|hai-architecture|hai-prd|code-auditor|code-quality-review|spark|cold-shower" skills/development-workflows/geju
python scripts/check.py skills/development-workflows/geju
```

   - Verify: no non-ASCII matches; no prohibited skill references; targeted skill metadata check passes without the current category warning.

7. Regenerate generated docs.
   - Command: `just docs-sync`
   - Verify: generated `geju` detail pages appear under:
     - `docs/skills/development-workflows/geju.md`
     - `docs/en/skills/development-workflows/geju.md`

8. Run docs and skill validation.
   - Commands:

```powershell
python docs/scripts/sync_docs_catalog.py --check
just skills-check
just docs-check
```

   - Verify: all pass.

9. Run the final gate if feasible.
   - Command: `just ci`
   - Verify: full local CI passes.
   - If not feasible, record the exact failure or skipped reason in the final report.

10. Review the final diff.
    - Commands:

```powershell
git diff -- skills/development-workflows/geju docs/skills/development-workflows/geju.md docs/en/skills/development-workflows/geju.md docs/skills.md docs/en/skills.md docs/.vitepress/generated/catalog.mjs
git diff --check
```

    - Verify: diff is limited to the skill optimization and generated docs required by that optimization.

## Files Expected To Change

- `skills/development-workflows/geju/SKILL.md`
- `skills/development-workflows/geju/references/output-template.md`
- Possibly `skills/development-workflows/geju/agents/openai.yaml`
- `docs/.vitepress/generated/catalog.mjs`
- `docs/skills.md`
- `docs/en/skills.md`
- `docs/skills/development-workflows/geju.md`
- `docs/en/skills/development-workflows/geju.md`

## Files Not Expected To Change

- Other skill packages
- Runtime hook files
- Platform templates
- `justfile`
- Validation scripts
- Trellis specs

## Review Points

- Does the revised description still trigger for "think bigger" and "challenge conservative design" prompts?
- Does it avoid triggering for ordinary code review, PRD writing, implementation planning, and adversarial risk review?
- Does the skill remain bold without pretending certainty?
- Does every bold claim still require a proof point or falsifier?
- Does the skill remain portable without naming other skills?

## Rollback Points

- After step 3: if the rewritten `SKILL.md` loses the skill's core intent, restore only that file and revise the wording.
- After step 7: if docs generation creates unexpected broad drift, inspect generated catalog changes before continuing.
- Before final reporting: if `just ci` fails for unrelated existing reasons, capture evidence and do not hide the failure.
