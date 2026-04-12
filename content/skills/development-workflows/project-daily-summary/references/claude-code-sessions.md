# Claude Code Session Parsing

Details for extracting structured signals from Claude Code sessions.

## Evidence Sources

Claude Code does not persist session transcripts to disk in the same way Codex does. Use these sources instead:

### Primary: Current conversation context
- The current session's conversation history is the richest evidence source.
- Extract user goals, decisions, tool calls, file changes, and outcomes from the conversation.

### Secondary: Git evidence
```bash
git log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD+1 00:00" --pretty=format:"%h %s"
git status --short
git diff --stat
```

### Tertiary: OMC state (if available)
- **Notepad**: read `.omc/notepad.md` for working memory entries from today
- **Session summaries**: check for `/export-summary` or `/save-session` artifacts
- **State files**: `.omc/state/` may contain mode state (autopilot, ralph, etc.) with task descriptions

### Optional: Session restore files
- `~/.claude/projects/*/session-*` directories may contain prior session context
- These are best-effort — not all sessions persist data here

## Mapping Sessions to Projects

- Use the working directory of the current session
- Normalize with `git rev-parse --show-toplevel`
- If the user worked on multiple projects across sessions, ask them which directories to include

## Signal Extraction

From conversation context, extract:
- **Goal**: the user's first meaningful request or task description
- **Plan**: any plan mode artifacts or task lists created
- **Completed items**: confirmed completed tasks, successful test runs, merged changes
- **Changed files**: files edited during the session (from tool call history)
- **Risks**: unresolved errors, skipped tests, open questions

## Noise Filtering

Ignore:
- System reminders and hook outputs
- Tool permission prompts
- Context compression artifacts
- Repeated status checks
- Model routing decisions
