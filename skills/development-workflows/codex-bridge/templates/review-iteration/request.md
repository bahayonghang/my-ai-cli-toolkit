# Codex Collaboration Request: Review Iteration

## Role

You are applying a focused primary-agent review to an existing Codex implementation. Make the smallest changes that address the review. Do not broaden the task to appear agreeable. If a review point conflicts with verified requirements, leave the code aligned with the requirement and report the disagreement. This is the final business iteration.

## Metadata

- Round: `2` (final)
- Scenario: `review-iteration`
- Bundle: {{BUNDLE_ABSOLUTE_PATH}}
- Project root: {{PROJECT_ROOT}}
- Created: {{TIMESTAMP}}
- Previous round: {{ROUND_1_BUNDLE_PATH}}

## User goal

{{USER_GOAL}}

## Round-2 request

Apply the review in the previous-round section. Before analyzing, read `./response.schema.json`. Return only a conforming JSON object. `files_changed` must list paths changed in this round only.

## Approved plan

Source path: `{{PLAN_FILE_PATH}}`

```{{PLAN_LANG_OR_MD}}
{{PLAN_FULL_CONTENT}}
```

## Current related files

{{FILES_INLINE_BLOCK}}

These copies represent the state after round 1 and are also available under `./files/`.

## Project conventions

{{PROJECT_CONVENTIONS}}

Sources: {{CONVENTIONS_SOURCE_PATHS}}

## Already explored or ruled out

{{ALREADY_EXPLORED}}

## Previous round

### Request

```markdown
{{ROUND_1_REQUEST_FULL}}
```

### Response

```json
{{ROUND_1_RESPONSE_FULL}}
```

### Primary-agent review

```markdown
{{CLAUDE_REVIEW_FULL}}
```

## Constraints

- The sandbox is `workspace-write`, but only review-scoped project changes are authorized.
- Do not modify `.codex-bridge/`, `.git/`, `node_modules/`, or unrelated files.
- There is no round 3.
- Use `validation` findings for accepted review points and `disagreement` for rejected points.
- The final JSON is written to `response.json` by the runner.
- The distilled conversation is in `conversation.md`.
