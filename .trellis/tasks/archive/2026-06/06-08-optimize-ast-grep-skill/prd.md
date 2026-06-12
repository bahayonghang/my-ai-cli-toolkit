# Optimize ast-grep skill

## Goal

Turn `skills/developer-tools-integrations/ast-grep` from an untracked draft into a publishable, repository-compliant skill that gives reliable, tested guidance for writing and validating ast-grep structural search rules.

The optimized skill should help future agents:

- choose ast-grep only when structural search is useful;
- produce working rules for real code search tasks;
- validate rules against examples before applying them to a repository;
- avoid stale or misleading CLI guidance;
- ship through this repository's docs and validation pipeline.

## Confirmed Facts

- The skill files exist on disk but are untracked because `git status --short --untracked-files=all` reports:
  - `?? skills/developer-tools-integrations/ast-grep/SKILL.md`
  - `?? skills/developer-tools-integrations/ast-grep/references/rule_reference.md`
- Normal `git status` can look clean because the repository config has `status.showUntrackedFiles=no`.
- `python scripts/check.py skills\developer-tools-integrations\ast-grep` currently passes with a warning: `Top-level category is missing`.
- `python docs\scripts\sync_docs_catalog.py --check` currently fails because docs are out of date and generated ast-grep detail pages are missing.
- Current local CLI version is `ast-grep 0.43.0`.
- A `regex`-only rule fails locally with `Rule must specify a set of AST kinds to match. Try adding kind rule.`
- The current `SKILL.md` includes only `name` and `description` frontmatter, unlike nearby catalog skills that include top-level `version`, `category`, `tags`, and often `argument-hint` / `allowed-tools`.
- The current package has no `evals/`, `tests/`, or bundled scripts.

## Requirements

1. Make the ast-grep skill a first-party publishable package.
   - Track the skill files in Git.
   - Add repository-compliant frontmatter: `version`, `category`, `tags`, and suitable optional runtime metadata.
   - Keep the skill slug and frontmatter name as `ast-grep`.

2. Rewrite `SKILL.md` into a focused operational workflow.
   - Start with task triage: when to use ast-grep versus plain `rg` or language tooling.
   - Prefer a test-first rule authoring loop: minimal fixture, simple pattern, AST debug when needed, then codebase scan.
   - Include Windows/PowerShell-safe commands because this repository and user workflow are Windows-heavy.
   - Explain shell quoting differences without overloading the main workflow.
   - Warn about false negatives from overly narrow node kinds, especially JavaScript/TypeScript function forms.

3. Correct stale or misleading ast-grep reference guidance.
   - Replace `dump_syntax_tree` guidance with `ast-grep run --debug-query`.
   - Clarify that `regex`, `nthChild`, and `range` are constraints and still need a positive matcher such as `kind` or `pattern`.
   - Ensure examples include required `id`, `language`, and `rule` fields for `scan --inline-rules`.
   - Separate examples that are verified against `ast-grep 0.43.0` from conceptual notes.

4. Add evaluation coverage for the skill.
   - Add `evals/evals.json` with realistic prompts.
   - Cover at least:
     - JavaScript/TypeScript async functions without try/catch;
     - React hook dependency or component-pattern search;
     - Python structural search such as decorators, bare `except`, or context-manager use.
   - Define expected outputs that can be graded objectively enough for a skill-creator loop.

5. Run the full `skill-creator` eval/reviewer loop.
   - Snapshot the original ast-grep skill before editing and use that snapshot as the baseline.
   - Create an `ast-grep-workspace/` sibling workspace with iteration directories.
   - Run each eval against the optimized skill and the old-skill baseline.
   - Draft objective assertions while runs are in progress.
   - Save per-run metadata, timing when available, grading results, aggregate benchmark files, and analyst notes.
   - Generate a human-review artifact using the `skill-creator` `eval-viewer/generate_review.py` workflow.
   - Apply at least one feedback/review pass if the benchmark or human review finds actionable defects.

6. Regenerate generated docs.
   - Run `just docs-sync` after metadata/content changes.
   - Ensure the generated catalog includes ast-grep under `developer-tools-integrations`.
   - Ensure Chinese and English generated detail pages exist.

7. Verify with repository gates.
   - Run targeted validation while iterating:
     - `python scripts/check.py skills\developer-tools-integrations\ast-grep`
     - representative ast-grep CLI smoke checks for documented examples
     - `python docs\scripts\sync_docs_catalog.py --check`
   - Finish with `just skills-check`, `just docs-check`, and ideally `just ci`.

## Acceptance Criteria

- [ ] `skills/developer-tools-integrations/ast-grep/SKILL.md` and all intended support files are tracked by Git.
- [ ] `SKILL.md` has valid frontmatter with `name: ast-grep`, `category: developer-tools-integrations`, `version`, and meaningful tags.
- [ ] The main workflow contains tested ast-grep command examples for rule files and inline rules.
- [ ] The reference file no longer instructs users to use nonexistent or stale commands such as `dump_syntax_tree`.
- [ ] The reference file accurately explains positive matchers and constraints for `regex`, `nthChild`, and `range`.
- [ ] `evals/evals.json` exists and contains at least three realistic eval prompts with expected outputs.
- [ ] `ast-grep-workspace/` contains a baseline snapshot of the original skill and at least one completed iteration directory.
- [ ] Each eval iteration includes optimized-skill and old-skill baseline outputs, metadata, grading results, and timing data when available.
- [ ] Benchmark aggregation produces `benchmark.json` and `benchmark.md`.
- [ ] A review artifact is generated with the `skill-creator` eval viewer workflow, preferably static HTML if no browser server is appropriate.
- [ ] Any human or benchmark feedback from the review loop is either addressed in the skill or recorded as accepted residual risk.
- [ ] Generated docs include ast-grep in both `docs/skills.md` and `docs/en/skills.md`.
- [ ] Generated detail pages exist for both Chinese and English docs.
- [ ] `python scripts/check.py skills\developer-tools-integrations\ast-grep` passes with no warnings caused by ast-grep metadata.
- [ ] `python docs\scripts\sync_docs_catalog.py --check` passes after docs sync.
- [ ] `just skills-check` and `just docs-check` pass.
- [ ] `just ci` passes, or any pre-existing unrelated failure is documented with evidence.

## Out of Scope

- Broad redesign of repository docs generation.
- Installing or changing the system ast-grep version.
- Rewriting unrelated developer-tool skills.
- Building a full ast-grep tutorial that duplicates upstream documentation.
- Adding automated Node tests unless implementation finds a deterministic helper script that needs tests.

## Open Questions

None. The user confirmed that this task must include the full `skill-creator` eval/reviewer loop.
