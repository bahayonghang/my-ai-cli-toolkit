# Eval 2: English Bugfix Boundaries

Status: review artifact only. This Codex inline session did not spawn independent with-skill/baseline agents.

Prompt:

```text
Write a Codex goal for fixing a flaky checkout discount test in this repo. Keep it English only and make sure the agent does not touch payment provider config.
```

Expected output:

- English-only `/goal` draft.
- Includes `Verification`, `Constraints`, `Boundaries`, `Iteration policy`, `Stop when`, and `Pause if`.
- Explicitly excludes payment provider configuration from write boundaries.
- Uses regression tests or discovery of project-provided checks as verification.

Review focus:

- The skill should not add Chinese mirror content when the user asked for English only.
- Boundaries should be narrow and concrete.
