# Import Session Summary

Load and apply context from a previous session summary file.

## Description

Reads a session context file and uses it to restore context from a previous session.

## Steps

1. Look for `session_context.md` in the current directory.
2. If not found, ask the user to provide the path to the summary file.
3. Read and parse the summary file content.
4. Present a brief overview of the imported context:
   - Previous session goal
   - Key accomplishments
   - Pending items that need attention
5. Ask the user which pending items they'd like to continue working on.
6. Begin working on the selected items with full context awareness.
