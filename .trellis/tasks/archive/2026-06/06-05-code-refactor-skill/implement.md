# Code Refactor Skill Implementation Plan

## Checklist

1. Confirm the safety posture with the user.
   - Status: done. Selected default is planning/approval for broad refactors and direct execution for narrow scoped slices.
   - Verify: `prd.md` and `design.md` record the selected default.
2. Create `skills/development-workflows/code-refactor/SKILL.md`.
   - Include frontmatter: `name`, `description`, `category`, `tags`, `version`, optional `argument-hint`, optional `allowed-tools`.
   - Keep the description trigger-rich but under the validator's 1024-character limit.
3. Write the skill body.
   - Cover scope discovery, baseline verification, refactor classification, slice execution, post-edit checks, and reporting.
   - Cover all six user-requested refactoring dimensions.
   - Include clear "do not refactor yet" conditions.
4. Add `skills/development-workflows/code-refactor/evals/evals.json`.
   - Include prompts for:
     - multi-file module split
     - single-file method/helper extraction and duplicate consolidation
     - naming/comment/dead-code cleanup with public API risk
   - Keep expected outputs descriptive; formal assertions can be added during the `skill-creator` eval loop.
5. Run targeted validation.
   - `python scripts/check.py skills/development-workflows/code-refactor`
   - `just skills-check`
6. Sync/check generated docs.
   - `just docs-sync`
   - `just docs-check`
7. Run final gate when feasible.
   - `just ci`
8. Review diff for unrelated changes.
   - Preserve existing unrelated `.gitignore` and `AGENTS.md` changes.
   - Ensure generated docs changes are only from docs sync.

## Risk Points

- The new skill may overlap with `improve-codebase-architecture` or `code-quality-review`; frontmatter and body must clearly distinguish implementation refactoring from review/RFC work.
- Dead-code removal is high-risk in dynamic frameworks and public packages; the skill must require evidence beyond plain text search.
- Broad refactors can create large diffs; the skill must enforce slices and verification after each slice.
- Generated docs are owned by `docs/scripts/sync_docs_catalog.py`; do not hand-edit generated skill detail pages.

## Validation Commands

```bash
python scripts/check.py skills/development-workflows/code-refactor
just skills-check
just docs-sync
just docs-check
just ci
```

## Rollback Points

- Before running `just docs-sync`: rollback is limited to the new skill directory and Trellis planning artifacts.
- After `just docs-sync`: generated docs pages and catalog may need removal/regeneration if the skill name/category changes.
- Before finalizing: inspect `git diff --stat` and `git diff --check` to ensure no unrelated formatting churn entered the patch.
