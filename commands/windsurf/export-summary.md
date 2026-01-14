# Export Session Summary

Summarize the current session's key points and export them to a Markdown file for context inheritance.

## Description

Creates a structured summary of the current session including goals, accomplishments, decisions, and next steps.

## Steps

1. **Review**: Scan the conversation history, identifying the main goal, executed steps, and the final state of the codebase.
2. **Synthesize**: Abstract the details into high-level insights, decisions, and status updates.
3. **Format**: Create a structured Markdown document with the following sections:
   - 🎯 **Session Goal**: A one-line summary of what we set out to do.
   - ✅ **Accomplishments**: Bullet points of completed tasks, fixed bugs, or implemented features.
   - 🧠 **Key Decisions & Context**: Architectural choices, important discoveries, and constraints identified.
   - 🚧 **Pending Items / Next Steps**: Clear, actionable tasks for the next session.
   - 📂 **Key Files**: A list of files that were significantly modified or are central to the current task.
4. Save the content to `session_context.md` in the current directory.
5. Confirm the file location so it can be referenced later.
