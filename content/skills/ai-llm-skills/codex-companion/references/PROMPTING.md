# Codex Companion Prompting

Use compact prompts with explicit contracts. The companion runtime is best when each `task` run has one clear goal.

## Prompt Shape

Prefer this structure for non-trivial `task` runs:

```xml
<task>
Investigate why the integration tests started failing after the retry refactor.
</task>

<structured_output_contract>
- Observed facts
- Root cause
- Proposed fix
- Verification performed
</structured_output_contract>

<default_follow_through_policy>
Keep going on routine low-risk steps without asking for confirmation.
</default_follow_through_policy>

<verification_loop>
Re-run the relevant checks after any fix and report concrete evidence.
</verification_loop>
```

## Good vs Bad Prompts

**Bad** — vague, no success criteria:
> fix the tests

**Good** — specific goal, clear “done” condition:
> Investigate why `test_retry_backoff` fails intermittently. Find the root cause, apply the smallest safe fix, and verify the test passes 3 times in a row.

**Bad** — multiple goals in one run:
> Review the auth changes, then refactor the middleware, then update the docs

**Good** — one goal per run:
> Review the auth changes in `src/auth/` against `main`. Focus on token validation and session handling.

## When to Add More Structure

- Debugging or implementation:
  - add `verification_loop`
  - add `default_follow_through_policy`
- Review:
  - require findings first
  - say when something is inference rather than direct evidence
- Research:
  - require dates and source attribution
  - constrain to official docs when the topic is a vendor SDK or API

## Multi-Turn Patterns (Resume)

When resuming a task thread with `--resume-last`, send only the delta instruction:

**First run:**
> Investigate the flaky CI test in `tests/integration/retry.test.ts`. Identify the root cause.

**Resume (delta only):**
> Good analysis. Now apply the fix you proposed and verify it passes.

If the direction changed materially, include the full context again instead of a delta.

## Model and Effort Flags

| Flag | Effect | When to use |
|------|--------|-------------|
| `--model spark` | Uses `gpt-5.3-codex-spark` (fast, cheaper) | Quick lookups, simple tasks |
| `--model <name>` | Specific model override | When you need a particular capability |
| `--effort none` | Minimal reasoning | Trivial tasks, echoing context |
| `--effort low` | Light reasoning | Simple code changes |
| `--effort medium` | Default balanced reasoning | Most tasks |
| `--effort high` | Deep reasoning | Complex debugging, architecture |
| `--effort xhigh` | Maximum reasoning | Critical security review, hard bugs |

## Good Defaults

- Tell Codex what “done” looks like.
- Keep one primary task per run.
- Prefer explicit output sections over vague style nudges.
- When following up on an existing thread, send only the delta instruction unless the direction changed materially.
