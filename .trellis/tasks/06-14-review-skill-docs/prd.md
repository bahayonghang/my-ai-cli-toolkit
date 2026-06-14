# Rename guizang review skill and complete docs

## Goal

Turn `skills/developer-tools-integrations/guizang-review-skill/` into a neutral skill-review package that no longer presents itself as Guizang-branded, while preserving origin attribution in the README and regenerating the public docs catalog.

The skill's purpose, confirmed from `SKILL.md`, is to review agent/Codex skill directories as reusable capability packages. It audits trigger quality, skill information architecture, workflow specificity, validation/evals, gotchas, distribution readiness, and whether the package externalizes expert judgment rather than acting as a long prompt.

## Requirements

- Rename the skill package away from Guizang branding.
  - Public skill name should be neutral and specific.
  - Directory slug, `SKILL.md` frontmatter, title, report sections, and `agents/openai.yaml` should align.
- Preserve the original source in the README.
  - README should include a clear origin/attribution section with the original upstream skill URL and original post link.
  - Other README sections should describe the neutral current skill.
- Complete repository docs for the skill.
  - Add top-level frontmatter metadata expected by repository validation.
  - Regenerate generated docs through the owning docs generator, not by hand.
- Preserve the skill's core behavior.
  - The review workflow and rubric should remain focused on skill-package review.
  - Remove only branding-specific wording unless wording needs adjustment for the new name.
- Preserve unrelated dirty-tree work.
  - Existing changes under `skills/git-github-collaboration/git-commit/` are unrelated and must not be reverted or included in this task's edits.

## Acceptance Criteria

- [x] No non-attribution references to `Guizang`, `guizang`, or the old `$guizang-skill-review` invocation remain.
- [x] README includes original source attribution for the upstream skill and original post.
- [x] `SKILL.md` frontmatter uses valid top-level `name`, `description`, `category`, `tags`, and `version` fields.
- [x] `agents/openai.yaml` display name and default prompt use the new neutral skill name.
- [x] Generated docs include the renamed skill detail page in both zh and en docs trees and no stale generated page for the old name.
- [x] Validation passes for the changed skill and generated docs.

## Notes

- Assumption: the neutral replacement name will be `agent-skill-review`, which is specific enough to avoid confusion with `code-quality-review`.
- Scope excludes running a full skill-creator eval loop because this is a targeted rename/docs completion with validation by metadata checks, search checks, and docs generation.
- Validation completed with `python scripts/check.py skills/developer-tools-integrations/agent-skill-review`, `just docs-sync`, `just docs-check`, `just skills-check`, `git diff --check`, and `just ci`.
