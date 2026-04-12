# Codex Session Parsing

Details for extracting structured signals from OpenAI Codex session transcripts.

## Session File Location

```text
~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl
```

Also check `~/.codex/history.jsonl` for session index data.

## Important Assumption

Sessions are stored globally under `~/.codex/sessions/`, not per-project. Map sessions back to projects using:

1. `session_meta.payload.cwd` from the first line of each JSONL
2. Normalize with `git -C <cwd> rev-parse --show-toplevel`
3. If git root cannot be resolved, fall back to `cwd`

## JSONL Parsing

For each `rollout-*.jsonl` file, extract from the first `session_meta` line:

- session id
- cwd
- branch
- commit hash
- repository url
- whether it is a subagent session
- parent thread id if present

## Signal Extraction

### Goal
Prefer the first meaningful `user_message`. Rewrite it into one short objective sentence.

### Plan
Prefer the **last** `update_plan` call in the session. Summarize into:
- 已完成 / Completed
- 进行中 / In Progress
- 待处理 / Pending

Keep only high-level plan items.

### Completion
Prefer the final `agent_message` where `phase == final_answer`. If present, extract:
- `STATUS`
- `CHANGED_FILES`
- `TESTS_RUN`
- `NOTES`

Convert them into concise outcome statements.

### Fallback when no final answer exists
Fall back to:
- Latest plan state
- Changed files if detectable
- Git evidence
- Latest meaningful assistant message

## Subagent Handling

Many sessions may be spawned subagents. Policy:

- Main sessions are the primary narrative units.
- Subagent sessions are supporting evidence only.
- If a same-day parent session exists, merge the subagent into the parent workstream.
- If the parent is missing, merge the subagent into the nearest matching project workstream instead of listing it standalone.

## Noise Filtering

Ignore by default:
- Reasoning items
- Token counts
- System and developer prompt content
- Intermediate tool chatter
- Repeated subagent scaffolding

## SpecStory Supplementation

If `<project>/.specstory/history/` exists, use it only as a supplementary source. Do not let SpecStory override Codex transcript evidence when they conflict.
