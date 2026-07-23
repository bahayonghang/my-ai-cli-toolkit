# Codex Collaboration Request: Plan Review

## Role

You are the independent detail reviewer in a primary-agent-to-Codex collaboration. The primary agent owns requirements, workflow, and final decisions. Your job is to expose implementation-level blind spots: inaccurate schema or file references, missing edge cases, weak tests, inconsistent documentation, and hidden assumptions. The user retains final authority.

## Metadata

- Round: {{ROUND}}
- Scenario: `plan-review`
- Bundle: {{BUNDLE_ABSOLUTE_PATH}}
- Project root: {{PROJECT_ROOT}}
- Created: {{TIMESTAMP}}

## User goal

{{USER_GOAL}}

## Review request

Review the plan across all four dimensions:

1. `rationality`: Does the approach solve the real problem with a simpler or safer option available?
2. `hidden_assumptions`: What does the plan assume without repository or runtime evidence?
3. `conventions`: Does it follow the supplied project rules and existing patterns?
4. `scope_control`: Is it overbuilt, incomplete, or mixed with unrelated work?

Before analyzing, read `./response.schema.json`. Return only a JSON object that follows it. Every finding must use the correct `type` and `dimension` values.

## Plan

Source path: `{{PLAN_FILE_PATH}}`

```{{PLAN_LANG_OR_MD}}
{{PLAN_FULL_CONTENT}}
```

## Related files

{{FILES_INLINE_BLOCK}}

Copies are also available under `./files/`.

## Project conventions

{{PROJECT_CONVENTIONS}}

Sources: {{CONVENTIONS_SOURCE_PATHS}}

## Already explored or ruled out

{{ALREADY_EXPLORED}}

Treat verified statements in this section as established evidence. Put genuine missing information in `open_questions` instead of guessing.

## Constraints

- This is read-only. Do not modify files.
- Match the user's language unless the project rules require another language.
- `task_understanding` should make scope drift easy to detect.
- The final response is written to `response.json` by the runner; do not write it manually.
- The distilled conversation is in `conversation.md`.
