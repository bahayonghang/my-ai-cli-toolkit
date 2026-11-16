# Code Refactor Skill

## Goal

Create a first-party `code-refactor` skill that guides AI coding agents through safe, evidence-based code refactoring. The skill should help an agent improve existing code structure without speculative rewrites, while preserving behavior through scoped discovery, refactor planning, targeted edits, and verification.

## Requirements

- The skill must live under the repository skill catalog, most likely `skills/development-workflows/code-refactor/`.
- The skill must cover the user's requested refactoring dimensions:
  - Split project code into files by functional module when a file or subsystem is carrying multiple responsibilities.
  - Split code inside a file into small methods/functions by minimum coherent behavior, distinguishing public API from private helpers.
  - Reduce repeated code by extracting shared helpers only when duplication is meaningful and the abstraction lowers maintenance cost.
  - Improve class, method, function, and variable names so they are concise and intention-revealing.
  - Improve comments for classes, methods, and key logic while removing noise and comments that only repeat code.
  - Remove uncalled/dead code only after references and runtime/export/public-surface risks have been checked.
- The skill must be distinct from existing skills:
  - `improve-codebase-architecture` is review/RFC oriented and focuses on architectural friction and deep modules.
  - `code-quality-review` is read-only review oriented.
  - The new skill should guide actual refactoring execution after scope is clear.
- The skill must encode a safety workflow inspired by the GitHub research:
  - Prefer structural/AST/language-service evidence over regex-only or intuition-only rewrites.
  - Require a baseline check or at least an explicit "known failing/unavailable" note before broad edits.
  - Require a diff review and targeted verification after each coherent refactor slice.
  - Keep broad refactors split into independently verifiable slices.
- The skill's default behavior must be:
  - For broad requests such as "refactor this module/project", inspect first, propose safe refactor slices, and wait for user approval before making broad edits.
  - For narrow, explicitly scoped requests, directly implement the smallest safe behavior-preserving slice and verify it.
- The skill must support multi-language projects at the workflow level, but should recommend language-aware tools when available rather than bundle heavy dependencies.
- The skill frontmatter must satisfy repository validation: kebab-case `name`, top-level `description`, `category`, `tags`, and `version`; `category` must match the parent directory.
- Public catalog impact must be handled by generated docs sync/check, not by hand-editing generated skill detail pages.
- The skill should include `evals/evals.json` test prompts for realistic refactoring scenarios and should be suitable for later `skill-creator` evaluation.

## Acceptance Criteria

- [x] `skills/development-workflows/code-refactor/SKILL.md` exists with valid frontmatter and a concise, trigger-rich description.
- [x] The skill body defines a refactoring workflow with discovery, scope choice, plan, slice execution, verification, and final report.
- [x] The workflow explicitly covers module splitting, method extraction, duplicate-code consolidation, naming, comments, and dead-code removal.
- [x] The workflow explains when not to refactor, including public API risk, uncertain behavior, weak tests, generated/vendor code, or unclear user scope.
- [x] The workflow recommends structural tools and language-service checks where available, while falling back to careful manual edits when tools are absent.
- [x] The skill distinguishes review-only recommendations from implementation mode and does not silently perform broad edits without a scoped plan.
- [x] Broad refactor prompts default to planning/approval mode, while narrow scoped prompts can proceed to the smallest safe implementation slice.
- [x] `evals/evals.json` contains realistic prompts that test multi-file refactor planning, single-file helper extraction, and dead-code/naming/comment cleanup.
- [x] `just skills-check` passes after the skill is added.
- [x] `just docs-sync` or `just docs-check` is run so generated docs catalog pages match the new skill.
- [x] `just ci` is used as the final gate when feasible.

## Notes

- Current repo state has unrelated uncommitted changes in `.gitignore` and `AGENTS.md`; do not revert or overwrite them.
- Repository evidence:
  - `skills/AGENTS.md` requires kebab-case skill directories, skill-local resources, and `just skills-check` for metadata or `SKILL.md` changes.
  - `scripts/check.py` validates allowed frontmatter keys and canonical categories.
  - `docs/scripts/sync_docs_catalog.py` generates EN/ZH skill detail pages and catalog sidebars from `SKILL.md`.
- External GitHub/source research:
  - OpenRewrite uses recipe-driven automated refactoring and emphasizes type-attributed, format-preserving source trees.
  - jscodeshift uses AST transforms over JS/TS files with dry-run, parser, and test utilities.
  - ast-grep and Comby show the value of structural search/rewrite over regex-only replacement.
  - rope and ts-morph show language-specific refactoring/manipulation libraries for Python and TypeScript.
  - BubblesAgent and act101 show AI-agent refactoring patterns: batch targeting, validators, previews, undo/history, diagnostics, and behavior-preservation checks.
- Implementation verification:
  - `python scripts/check.py skills/development-workflows/code-refactor` passed.
  - `just skills-check` passed.
  - `just docs-sync` generated the new catalog pages.
  - `just docs-check` passed.
  - `just ci` passed.
