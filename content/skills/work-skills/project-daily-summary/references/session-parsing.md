# Universal Session Parsing

Platform-agnostic rules for extracting structured signals and filtering noise. Apply these regardless of which coding platform generated the session data.

## Signal Extraction Template

For each session or work unit, extract these fields:

| Field | Description | Fallback |
|-------|-------------|----------|
| **Goal** | What the user set out to do | First meaningful user message |
| **Plan** | Structured plan or task list | Latest plan state if any |
| **Completed** | Items confirmed as done | Changed files + passing tests |
| **Changed Files** | Files created, modified, or deleted | git diff --stat |
| **Tests** | Tests written or run, pass/fail status | git log for test commits |
| **Risks** | Unresolved issues, blockers, open questions | Explicit error messages |
| **Decisions** | Key choices made and their reasoning | Conversation context |

## Noise Filtering Rules

### Always ignore
- Internal reasoning or chain-of-thought traces
- Token counts and model metadata
- Permission prompts and approval flows
- Repeated scaffolding or boilerplate outputs
- System configuration and hook outputs

### Always keep
- User's stated goal or task
- Final plan state (completed / in-progress / blocked)
- Outcome statements (what was achieved)
- Changed files list
- Test results
- Risks, blockers, or unfinished items
- Key decisions and their reasoning

## Workstream Merge Signals

Use these signals to merge multiple sessions into workstreams:

- Same git branch or worktree
- Same or similar user goal text
- Overlapping changed files
- Same plan file or task list
- Same parent thread chain (if subagent)
- Same feature, bug, review, or topic area

## Merge Guidelines

- Target **1 to 5 workstreams per project** — not one entry per session
- If a session is clearly a continuation of another (same branch, same goal), merge them
- If a session is a subagent or child task, fold it into the parent workstream
- If a session is orphaned (no clear parent), assign it to the nearest matching workstream by topic
