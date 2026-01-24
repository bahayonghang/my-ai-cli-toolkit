---
description: Summarize the current session's key points and export them to a temporary Markdown file for context inheritance.
prerequisites: ["Have an active session with history to summarize"]
---

# Session Context Export

Please perform a comprehensive review of our current session and generate a **Handoff Summary**. This summary will be used to restore context in the next session.

## Analysis Steps
1.  **Review**: Scan the conversation history, identifying the main goal, executed steps, and the final state of the codebase.
2.  **Synthesize**: Abstract the details into high-level insights, decisions, and status updates.
3.  **Format**: Create a structured Markdown document.

## Output Content Requirements
The summary **MUST** include:
*   **🎯 Session Goal**: A one-line summary of what we set out to do.
*   **✅ Accomplishments**: Bullet points of completed tasks, fixed bugs, or implemented features.
*   **🧠 Key Decisions & Context**:
    *   Architectural choices made.
    *   Important discoveries (e.g., "The API returns 404 if X is missing").
    *   Specific constraints identified.
*   **🚧 Pending Items / Next Steps**: clear, actionable tasks for the next session.
*   **📂 Key Files**: A list of files that were significantly modified or are central to the current task.

## Action
1.  Generate the Markdown content.
2.  Save this content to a file named `session_context.md` (or `session_summary_[TIMESTAMP].md`) in the current directory using your file writing tool.
3.  Confirm the file location so I can reference it later (e.g., `cat session_context.md | llm`).
