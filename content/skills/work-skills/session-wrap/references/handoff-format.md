# Session Handoff Format

A structured template for producing handoff notes that preserve context between sessions. The goal is to capture information that would otherwise be lost — decisions made, approaches tried and rejected, environment state, and clear next steps.

## When to Use

- The session involves substantial unfinished work
- Someone else (or future-you) will continue the work
- Complex environment state needs to be recorded
- Key decisions were made that affect future work

## Standard Handoff Template

```markdown
# Session Handoff

## Context
- **Project**: <repo name or path>
- **Branch**: <current branch>
- **Last worked**: <date and time>
- **Session goal**: <one-line description of what this session set out to do>

## Completed
- [ ] <completed item 1>
- [ ] <completed item 2>

## In Progress (Unfinished)
- [ ] <item> — <where it's stuck / what's next>
- [ ] <item> — <where it's stuck / what's next>

## Key Decisions
| Decision | Reasoning | Alternatives Considered |
|----------|-----------|------------------------|
| <what was decided> | <why> | <what else was on the table> |

## Approaches Tried and Rejected
- <approach> — <why it didn't work>

## Risks and Warnings
- <risk or gotcha the next person should know about>

## Suggested Next Steps
1. <highest priority next action>
2. <second priority>
3. <third priority>

## Environment State
- **Uncommitted files**: <list or "none">
- **Dependencies to install**: <if any>
- **Config changes needed**: <if any>
- **Running processes**: <if any need to be restarted>
```

## Guidelines

- **Be specific**: "Fix the auth bug" is less useful than "The JWT token expiry check in `auth/middleware.ts:42` returns 401 even when the token is valid — the comparison uses `<` instead of `<=`."
- **Record what failed**: Future sessions benefit from knowing what didn't work, not just what did.
- **Include file paths**: Always reference specific files and line numbers when possible.
- **Keep it scannable**: Use bullet points and tables. The reader should understand the state in under 60 seconds.
- **Separate facts from opinions**: Mark suggestions as suggestions, not requirements.
