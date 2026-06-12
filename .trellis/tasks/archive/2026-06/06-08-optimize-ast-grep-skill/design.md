# Design: Optimize ast-grep skill

## Boundaries

The implementation should stay inside the ast-grep skill package and generated docs:

- `skills/developer-tools-integrations/ast-grep/SKILL.md`
- `skills/developer-tools-integrations/ast-grep/references/rule_reference.md`
- `skills/developer-tools-integrations/ast-grep/evals/evals.json`
- generated docs under `docs/` and `docs/.vitepress/generated/catalog.mjs`

Do not edit unrelated skills except if docs generation updates shared catalog files.

## Skill Shape

`SKILL.md` should be the operational entrypoint, not a large reference manual. It should:

- explain when ast-grep is worth using;
- ask only clarifying questions that the repository cannot answer;
- inspect language and target patterns before creating rules;
- create a minimal fixture before searching the real codebase;
- use `ast-grep run --debug-query=<format>` for AST inspection;
- validate a rule against fixture code before applying it broadly;
- report possible false negatives and how the rule was scoped.

The reference file should hold syntax detail that would bloat the main skill body. It should be loaded only when the user needs deeper rule syntax, troubleshooting, or advanced relational/composite rules.

## Command Strategy

Use rule files for durable examples and inline rules only for quick smoke checks.

Recommended command forms:

- `ast-grep run --pattern '<pattern>' --lang <language> <path>` for simple one-node searches.
- `ast-grep scan --rule <rule.yml> <path>` for complex or reusable rules.
- `ast-grep run --pattern '<sample>' --lang <language> --debug-query=ast` for AST debugging.
- `ast-grep scan --inline-rules '<valid yaml>' --stdin` only when quoting is under control.

Because this repository is usually operated from PowerShell, implementation should avoid examples that rely only on POSIX shell escaping. Where inline YAML is shown, include a PowerShell-safe example or steer users to rule files.

## Metadata and Docs Contract

The repository validator and docs generator read top-level frontmatter. Add:

- `version: 0.1.0` or another initial version consistent with nearby skills;
- `category: developer-tools-integrations`;
- tags such as `ast-grep`, `structural-search`, `code-search`, `tree-sitter`, `refactoring`, `static-analysis`;
- `argument-hint` for the target query/path;
- `allowed-tools` aligned with read/search/write needs if this skill may create temporary fixtures or rule files.

After content changes, generated docs are part of the deliverable because the current docs check fails.

## Evaluation Design

Use `evals/evals.json` to capture realistic prompts and then execute the full `skill-creator` eval/reviewer loop.

Eval prompts should test whether the skill causes the agent to:

- clarify or infer language and search scope;
- create a minimal fixture;
- produce a syntactically valid ast-grep rule;
- include a validation command;
- warn about known false-negative boundaries;
- avoid using `rg` when the user needs structural matching.

Good candidate evals:

1. JavaScript/TypeScript async functions that contain `await` but lack a local `try/catch`.
2. React components or hooks where a dependency/search pattern needs AST structure.
3. Python functions with decorators or bare `except` handlers.

Because this is an existing skill improvement, the baseline is the original skill snapshot captured before edits. The optimized version should be compared against that snapshot, not against no-skill output.

Workspace layout:

- `skills/developer-tools-integrations/ast-grep-workspace/skill-snapshot/` for the original baseline.
- `skills/developer-tools-integrations/ast-grep-workspace/iteration-1/<eval-name>/with_skill/outputs/` for optimized-skill outputs.
- `skills/developer-tools-integrations/ast-grep-workspace/iteration-1/<eval-name>/old_skill/outputs/` for baseline outputs.
- per-eval `eval_metadata.json`, per-run `timing.json` when tool notifications provide timing, `grading.json`, and aggregate `benchmark.json` / `benchmark.md`.

Generate the human review artifact with `eval-viewer/generate_review.py` from the `skill-creator` skill. Use static HTML output if a browser server is not the right fit for the environment.

The full loop is part of the deliverable, but it should still be pragmatic: if the first iteration exposes clear failures, revise the skill and run another iteration; if the first iteration is clean, record that result and proceed to docs and final gates.

## Compatibility and Risk

- ast-grep CLI behavior can drift. Verify examples against the installed version before committing.
- The docs generator includes untracked skill directories when run locally, so docs drift can appear before files are tracked. Track intended files before final verification.
- Inline rule examples are brittle across shells. Prefer rule files in main guidance.
- Narrow node kinds can silently miss valid code forms. Teach agents to enumerate likely constructs for the target language.
- The full eval loop depends on available automation for independent runs and timing capture. If that capability is unavailable during implementation, pause and document the blocker instead of silently downgrading the loop.

## Rollback

All changes are additive or localized:

- remove the ast-grep package files if the task is abandoned before tracking;
- revert generated docs if the skill is not accepted;
- delete ignored local eval workspace artifacts if they are not intended for commit;
- keep unrelated generated docs drift out of scope unless caused by docs sync.
