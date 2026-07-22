# Plan-Review Template Notes

Use this scenario only for an explicit Codex plan review. It is read-only and expects coverage of rationality, hidden assumptions, conventions, and scope control.

## Variables

| Variable | Source |
| --- | --- |
| `{{ROUND}}` | Normally `1` |
| `{{BUNDLE_ABSOLUTE_PATH}}` | Created bundle path |
| `{{PROJECT_ROOT}}` | Absolute project path |
| `{{TIMESTAMP}}` | ISO-8601 time |
| `{{USER_GOAL}}` | Distilled end goal, not merely "review the plan" |
| `{{PLAN_FILE_PATH}}` | Plan path relative to the project when possible |
| `{{PLAN_LANG_OR_MD}}` | Fence language, normally `md` |
| `{{PLAN_FULL_CONTENT}}` | Complete plan text |
| `{{FILES_INLINE_BLOCK}}` | Complete relevant source excerpts with paths |
| `{{PROJECT_CONVENTIONS}}` | Relevant repository rules |
| `{{CONVENTIONS_SOURCE_PATHS}}` | Rule source paths |
| `{{ALREADY_EXPLORED}}` | Verified facts and rejected approaches |

## Execution and completion

Run preflight validation, then `run_bundle.py`, then post-response validation using the commands in `SKILL.md`. Do not construct a shell command or run jq. `--output-schema` is opt-in because some proxy endpoints reject it.

After validation, group findings by type, verify every repository claim, record accepted/rejected decisions, and write the pattern-extraction result. If lateral search finds candidates, use the verification-round template; otherwise stop.

Failure preserves the bundle. Missing response, invalid JSON, or an incomplete dimension enum is not a successful review.
