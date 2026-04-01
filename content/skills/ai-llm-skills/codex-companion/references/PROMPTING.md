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

## Good Defaults

- Tell Codex what “done” looks like.
- Keep one primary task per run.
- Prefer explicit output sections over vague style nudges.
- When following up on an existing thread, send only the delta instruction unless the direction changed materially.
