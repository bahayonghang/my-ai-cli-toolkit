---
name: document-writer
description: Generate technical documentation and code comments from codebase. Use when user requests README, API docs, architecture guides, or JSDoc.
argument-hint: [target-path]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  category: ai-orchestration
  tags: [documentation, readme, api-docs, jsdoc, omo-skills]
---

Write or update documentation for the target project at `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting the target project path.
2. Read `references/WORKFLOW.md` and `references/DOCUMENT_TYPES.md` to understand generation standards.
3. Use file reading and search tools to understand the target codebase structure and logic.
4. If writing specific function comments (like JSDoc), find the file using and read it.
5. Create or update the required documentation matching the structures defined in the reference documents.
6. Verify that any generated code examples are valid, paths/links exist, and no internal secrets are exposed.

## Execution Rules

- Base all documentation strictly on the actual code implementation. Do not guess behavior.
- Use imperative, concise professional tone.
- Match doc language with codebase (Chinese user requests, output Chinese).
- If information is missing, explicitly mark it as TODO.
