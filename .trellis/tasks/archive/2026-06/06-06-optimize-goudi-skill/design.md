# Optimize goudi skill design

## Boundary

This task optimizes only `skills/development-workflows/goudi` and generated docs/catalog files required by the repository workflow. `geju` is read-only comparison material.

The skill is an existing local draft, not a new skill. Keep the name `goudi` and treat the current local files as the original version for baseline comparison.

## Skill Package Shape

Target committed skill files:

- `skills/development-workflows/goudi/SKILL.md`
- `skills/development-workflows/goudi/agents/openai.yaml`
- `skills/development-workflows/goudi/references/output-template.md`
- `skills/development-workflows/goudi/evals/evals.json`

Optional files are allowed only if the implementation proves they are needed. Do not add `SKILL.zh_CN.md` just to satisfy the stale reference unless maintaining a separate Chinese execution doc is intentionally useful.

## Metadata Contract

`SKILL.md` frontmatter must use the repository top-level schema:

- `name: goudi`
- `description: ...`
- `category: development-workflows`
- `tags: [...]`
- `version: 0.1.0` unless a different version is justified by existing release convention

The description is the trigger contract. It should include the English grounding intent and Chinese trigger phrases, but avoid becoming so broad that ordinary implementation planning or code review always triggers `goudi`.

## Instruction Contract

The optimized skill should preserve the core thesis:

- keep the bold target when useful,
- force the next move to be concrete,
- price real constraints separately from anxiety,
- define verification and stop rules,
- avoid turning grounding into paralysis.

Add explicit boundaries modeled after `geju` where appropriate:

- Short prompts may receive concise answers instead of the full template.
- Do not edit files, write code, or start implementation while using `goudi` unless the user separately asks for execution.
- Do not route to nonexistent skills. If TDD or full planning is relevant, refer generically to available project workflows or ask the user to invoke the appropriate skill.

## Evaluation Workflow

Use `goudi-workspace/` at the repository root for local evaluation outputs. This workspace is a local generated artifact and should not be committed unless explicitly requested.

Baseline:

- Snapshot the current pre-optimization `skills/development-workflows/goudi` directory to `goudi-workspace/skill-snapshot/` before editing.
- Compare optimized skill outputs against that snapshot, using `old_skill` as the baseline configuration.

Eval set:

- Commit `skills/development-workflows/goudi/evals/evals.json`.
- Include at least three realistic prompts:
  - architecture migration grounding,
  - product or workflow vision landing,
  - over-scoped plan with stop-rule pressure test.
- Each eval should include expectations that are discriminating for `goudi`:
  - landing judgment appears early,
  - bold direction is preserved,
  - first move is concrete and scoped,
  - real constraints are separated from fear/inertia,
  - success criteria and failure signals are present,
  - cut list and stop rule are explicit,
  - no implementation/code edits are started.

Run layout:

- `goudi-workspace/iteration-1/<eval-name>/eval_metadata.json`
- `goudi-workspace/iteration-1/<eval-name>/new_skill/run-1/outputs/`
- `goudi-workspace/iteration-1/<eval-name>/old_skill/run-1/outputs/`

If the available environment cannot launch independent subagents, run the same prompts inline in a controlled way and save transcript/output markdown files manually under the same layout. Preserve the baseline comparison by reading the snapshot skill for `old_skill` runs and the optimized skill for `new_skill` runs.

Grading:

- Grade each run against the eval expectations.
- Save `grading.json` beside each `outputs/` directory's parent run directory.
- Use the exact viewer-compatible fields `text`, `passed`, and `evidence`.
- Prefer objective, text-checkable expectations because this is a workflow-answer skill.

Benchmark and review:

- Run `python C:\Users\lyh\.skillsmanage\skills\skill-creator\scripts\aggregate_benchmark.py goudi-workspace/iteration-1 --skill-name goudi --skill-path skills/development-workflows/goudi`.
- Generate a static review artifact with `python C:\Users\lyh\.skillsmanage\skills\skill-creator\eval-viewer\generate_review.py goudi-workspace/iteration-1 --skill-name goudi --benchmark goudi-workspace/iteration-1/benchmark.json --static goudi-workspace/iteration-1/review.html`.
- Use benchmark notes and qualitative output review to decide whether a second skill edit pass is needed.

## Docs And Verification

After changing skill metadata or docs-derived content:

- Run `just docs-sync`.
- Run `just skills-check`.
- Run `just docs-check`.
- Run `just ci` before completion, unless an unrelated pre-existing failure is documented with evidence.

The final git status should show `goudi` skill files and generated docs/catalog files as intentional candidates, while local evaluation workspace artifacts remain uncommitted.
