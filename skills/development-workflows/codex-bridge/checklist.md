# Bundle Checklist

Use this checklist immediately before preflight validation.

## Authorization and scope

- [ ] The user explicitly requested Codex participation.
- [ ] The chosen scenario matches the requested outcome.
- [ ] A `workspace-write` scenario is limited to user-authorized paths.
- [ ] Unrelated working-tree changes are identified and preserved.

## Context completeness

- [ ] `conversation.md` records the goal, decisions, rejected approaches, constraints, and unknowns.
- [ ] Every plan, rule, and source file referenced by `request.md` is copied to `files/` or fully inlined.
- [ ] `request.md` contains no `{{PLACEHOLDER}}` values.
- [ ] `manifest.claude_session_jsonl` is set when the source path is available.
- [ ] Later rounds use absolute, existing `previous_rounds` paths.

## Scenario safety

- [ ] `plan-review` and `verification-round` use `read-only`.
- [ ] `codify` and `review-iteration` use `workspace-write`.
- [ ] A verification round points to exactly one non-verification round and includes its extracted patterns and response.
- [ ] Review iteration stops after round 2.

## Completion

- [ ] Preflight validation passes before execution.
- [ ] Post-response validation passes after execution.
- [ ] `files_changed` is checked against the actual working tree.
- [ ] The primary agent records accepted, rejected, and uncertain findings instead of forwarding raw output.
- [ ] Pattern extraction is recorded even when no reusable pattern is found.
