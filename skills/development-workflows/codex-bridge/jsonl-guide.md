# Conversation JSONL Guide

The bundle should remain useful without the original session log. Put the necessary decisions in `conversation.md`; record the raw JSONL path only as optional provenance.

## Common locations

- Claude Code on Unix: `~/.claude/projects/<encoded-project>/<session-id>.jsonl`
- Claude Code on Windows: `%USERPROFILE%\.claude\projects\<encoded-project>\<session-id>.jsonl`
- Codex on Unix: `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl`
- Codex on Windows: `%USERPROFILE%\.codex\sessions\YYYY\MM\DD\rollout-*.jsonl`

Locations can change by host version or custom home directory. Prefer the active runtime's reported session path over guessing.

## Distillation rules

Include the following in `conversation.md`:

1. The user's end goal and current request.
2. Explicit approvals and scope boundaries.
3. Decisions already made and their reasons.
4. Approaches already rejected or attempted.
5. Known facts, unresolved questions, and validation evidence.
6. The raw JSONL absolute path, or `unavailable` when it cannot be determined.

Do not copy secrets, credentials, unrelated user messages, or large raw logs into the bundle. Codex should not need to parse the source JSONL for the normal path.
