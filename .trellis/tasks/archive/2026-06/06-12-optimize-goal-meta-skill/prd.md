# Optimize goal-meta-skill

## Goal

Optimize `skills/developer-tools-integrations/goal-meta-skill` so it is a current, discoverable, validated Codex `/goal` skill that can turn vague work into copy-ready goal instructions without misleading users about Codex behavior.

## Requirements

- Keep the skill focused on drafting goal instructions. It must not execute the goal task unless the user separately asks.
- Align the skill with current Codex goal behavior from the official Codex manual:
  - `/goal` starts or sets a persistent task goal in app, IDE, and CLI surfaces.
  - `/goal` without text views the current goal.
  - `/goal pause`, `/goal resume`, and `/goal clear` manage an active goal.
  - If `/goal` is absent from the slash command list, users may need `features.goals = true`.
  - Goal objectives are limited to 4,000 characters; longer instructions should live in a file that the goal points to.
- Preserve the useful current contract: concrete outcome, verification, constraints, boundaries, iteration policy, completion evidence, and pause/block conditions.
- Preserve bilingual behavior for Chinese-first prompts: Chinese direct-copy version first, then an English-compatible mirror unless the user asks for one language only.
- Add missing public skill metadata so repo validators and docs generation treat the skill like the other first-party skills.
- Replace README installation placeholders with the actual repository install shape used by generated docs.
- Add objective evaluation coverage following `skill-creator`:
  - `evals/evals.json` with realistic positive and negative prompts.
  - A reviewer artifact generated with `eval-viewer/generate_review.py` during the implementation/eval pass.
  - Assertions or tests that catch missing required sections, missing English mirror when required, unsafe `/目标`, weak verification, placeholders, and over-triggering on one-shot tasks.
- Keep generated docs synchronized when metadata changes.
- Preserve the existing source credit and avoid unrelated rewrites.

## Acceptance Criteria

- [ ] `goal-meta-skill` has top-level `category`, `tags`, and `version` frontmatter consistent with `developer-tools-integrations` skills.
- [ ] `just skills-check` passes without the current `Top-level category is missing` warning for `goal-meta-skill`.
- [ ] `just docs-check` no longer reports missing `goal-meta-skill` docs pages or stale skills indexes after generated docs are synced.
- [ ] README install commands no longer contain `<owner>` placeholders.
- [ ] Skill instructions and references mention current `/goal` management behavior, `features.goals`, and the 4,000 character objective limit.
- [ ] Tests or linter coverage catch at least one output that has a valid `/goal` block but misses required Chinese-first companion sections when the prompt requires them.
- [ ] `evals/evals.json` exists for this skill and includes both should-trigger and should-not-trigger prompts.
- [ ] The skill-creator implementation pass creates a human-reviewable eval viewer artifact before final revision.
- [ ] `just python-check`, `just node-test`, `just docs-check`, and `just ci` pass or any skipped check is explicitly justified with evidence.
- [ ] No unrelated dirty files are included in the final change set; the pre-existing `.gitignore` modification remains untouched unless the user explicitly brings it into scope.

## Notes

- This is a complex skill optimization task. Keep it in planning until the user asks to implement.
- Current audit found one pre-existing dirty path: `.gitignore`.
