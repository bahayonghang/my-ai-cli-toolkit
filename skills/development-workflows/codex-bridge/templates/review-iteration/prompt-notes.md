# Review-Iteration Template Notes

Review iteration is round 2 and the final business iteration. It starts only after a codify round and a written primary-agent review.

## Scenario-specific variables

| Variable | Source |
| --- | --- |
| `{{ROUND_1_BUNDLE_PATH}}` | Absolute round-1 bundle path |
| `{{ROUND_1_REQUEST_FULL}}` | Complete round-1 request |
| `{{ROUND_1_RESPONSE_FULL}}` | Complete round-1 response |
| `{{CLAUDE_REVIEW_FULL}}` | Concrete primary-agent review |

`{{FILES_INLINE_BLOCK}}` must contain the latest state after round 1, not the original files.

## Execution and completion

Run preflight validation, `run_bundle.py`, and post-response validation using the commands in `SKILL.md`. Do not construct a shell command or run jq.

Verify round-2 `files_changed` against the actual incremental diff. Record pattern-extraction decisions, but do not use verification-round as a disguised round 3. After round 2, stop. If work remains, present the evidence and ask the user whether to repair directly, create a fresh task, or abandon the change.
