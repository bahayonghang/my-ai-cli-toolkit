# Claude Code Companion

Use this skill when the user wants a **companion-style Claude Code workflow** rather than a single direct action.

It is designed for tasks where Claude Code should:

- review before changing code
- continue an earlier effort with explicit scope
- separate diagnosis, implementation, and verification
- stay precise about what is being resumed and why

Unlike `codex-companion`, this skill does **not** promise Codex-style persistent runtime threads or lifecycle commands. It is a workflow skill for Claude Code-native orchestration.

## Best for

- multi-step implementation inside Claude Code
- review-first execution
- continuing prior work from current repo and conversation context
- bounded follow-up work with explicit verification

## Use this instead of

- `codex-companion` when the task is specifically about Claude Code rather than Codex runtime jobs
- generic ad-hoc guidance when the user clearly wants a Claude Code-native companion process

## Notes

- Be explicit about whether continuity comes from current context or real runtime persistence.
- Prefer small, reviewable next steps.
- Verify outcomes before claiming completion.
