# Code Refactor Skill Design

## Scope And Placement

The new skill should be a first-party development workflow skill:

- Path: `skills/development-workflows/code-refactor/`
- Entry point: `skills/development-workflows/code-refactor/SKILL.md`
- Optional resources: `evals/evals.json`; references only if the SKILL.md body becomes too long.

This belongs in `development-workflows` because it guides an agent through an implementation workflow. It should not go under `developer-tools-integrations`, which is better for tool/environment setup.

## Relationship To Existing Skills

- `improve-codebase-architecture`: keep as architecture review/RFC/design exploration. It may identify candidates, but it does not own execution.
- `code-quality-review`: keep as read-only maintainability review. It may produce findings, but it should not edit code.
- `code-refactor`: own behavior-preserving refactor implementation after the target and risk posture are clear.

The new skill should mention when to switch to the review skills instead of duplicating their full checklists.

## Workflow Model

The skill should use a conservative refactor loop:

1. Define scope and success criteria.
2. Inspect project instructions, code map, tests, and existing helpers before proposing edits.
3. Classify the refactor type:
   - module/file split
   - method/function extraction
   - duplicate-code consolidation
   - naming cleanup
   - comment cleanup
   - dead-code removal
4. Choose the smallest coherent slice.
5. Establish behavior baseline:
   - run targeted tests/lint/type checks when available, or document why unavailable
   - for code without tests, identify observable behavior and manual smoke checks
6. Apply refactor with language-aware tools when possible:
   - TypeScript/JavaScript: TypeScript language service, ts-morph, jscodeshift, ast-grep
   - Python: rope, pyright/mypy/ruff/autoflake/vulture where present
   - Java/JVM: OpenRewrite recipes, IDE/language-service refactors
   - Polyglot structural changes: ast-grep or Comby for bounded transformations
7. Verify after each slice.
8. Review diff for accidental behavior changes, public API drift, generated/vendor files, and orphaned imports.
9. Report changed slices, validation, remaining risk, and follow-up candidates.

## Safety Contract

The skill should bias toward behavior preservation:

- Do not remove dead code solely because a text search has no direct caller; check exports, reflection/dynamic calls, framework entrypoints, tests, generated consumers, and public API.
- Do not split files just to make files smaller; split only when responsibilities, ownership, or test boundaries become clearer.
- Do not extract helpers for one-off trivial code; extract when duplication is repeated or complex enough to justify a shared name.
- Do not rename public APIs without checking call sites and migration impact.
- Do not improve comments by adding generic narration; prefer comments that explain invariants, edge cases, or non-obvious decisions.
- For broad refactors, stop after planning if the user has not approved the slice or if baseline verification is absent and risk is high.

## External Research Findings Mapped To Design

- OpenRewrite: encode "recipe-like" thinking. A refactor should have a named target, parameters, and expected transformation, not an open-ended rewrite.
- OpenRewrite LST: preserve type and formatting context. In the skill, this becomes "prefer language-aware tools and keep formatting churn out of behavior refactors."
- jscodeshift: codemods should support dry-run/print/stats/test-like validation. In the skill, ask agents to preview broad transforms and test representative fixtures.
- ast-grep and Comby: structural matching is safer than regex for syntax-aware changes. In the skill, recommend these for repeated syntactic patterns.
- rope and ts-morph: language-specific libraries are appropriate for symbol moves, renames, and cross-file operations. In the skill, use them when the project already has the dependency/tooling or when the user approves adding a helper.
- BubblesAgent: batch refactors need target-file filters, content filters, and validators. In the skill, require target selection and post-change validators.
- act101: refactor preview, diagnostics, undo/history, and behavior-preservation checks are useful agent affordances. In the skill, encode preview/diff/verification before finalizing.

### Source Links

- OpenRewrite docs: https://docs.openrewrite.org/
- OpenRewrite recipes: https://docs.openrewrite.org/concepts-and-explanations/recipes
- jscodeshift GitHub: https://github.com/facebook/jscodeshift
- ast-grep docs: https://ast-grep.github.io/
- Comby docs: https://comby.dev/
- ts-morph manipulation docs: https://ts-morph.com/manipulation/
- rope docs: https://rope.readthedocs.io/en/latest/rope.html
- RefactoringMiner GitHub: https://github.com/tsantalis/RefactoringMiner
- BubblesAgent GitHub: https://github.com/myheritage/BubblesAgent
- act101 overview: https://act101.ai/

## Output Contract For The Skill

For implementation tasks, the skill should produce:

- `Scope`
- `Baseline`
- `Refactor Plan`
- `Edits Made`
- `Verification`
- `Residual Risk`

For planning-only or risky cases, the skill should stop after:

- `Findings`
- `Recommended Refactor Slices`
- `Required Decision`
- `Verification Plan`

## Selected Design Decision

The selected default is hybrid:

- Broad refactor requests default to planning and approval before broad edits.
- Narrow, user-specified refactor requests can proceed directly to the smallest safe behavior-preserving slice.

This keeps the skill useful for direct execution without letting vague requests trigger high-risk module splits, dead-code removal, or public API renames.
