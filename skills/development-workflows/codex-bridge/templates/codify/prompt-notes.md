# Codify Template Notes

Use this scenario only after the user explicitly delegates implementation to Codex and the primary agent has a stable scope.

## Scenario-specific variables

| Variable | Source |
| --- | --- |
| `{{CODING_TASK_DESCRIPTION}}` | Concrete implementation request and file scope |
| `{{DEFINITION_OF_DONE}}` | Testable completion criteria |

The common metadata, plan, file, convention, and exploration variables follow the plan-review template.

## Execution and completion

Run preflight validation, `run_bundle.py`, and post-response validation using the commands in `SKILL.md`. The sandbox is fixed to `workspace-write`; project configuration cannot change it. Do not hand-build a shell command or run jq.

After execution:

1. Compare the real `git status` and diff with `files_changed`.
2. Identify undeclared changes and claimed changes that do not exist.
3. Review implementation behavior and tests, not only the JSON response.
4. Record accepted/rejected findings and pattern-extraction decisions.
5. Start review-iteration only for a concrete, bounded correction. Do not start it automatically when the first result is acceptable.

When Git is unavailable, take a platform-native file inventory before execution and compare it afterward. If no baseline exists, state that `files_changed` could not be independently verified.

Missing response, invalid structure, a forbidden changed path, or a nonzero Codex exit is a failure. Preserve the bundle for diagnosis.
