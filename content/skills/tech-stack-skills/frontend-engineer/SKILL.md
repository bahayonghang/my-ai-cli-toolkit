---
name: frontend-engineer
description: Act as a frontend UI/UX expert. Use when creating UI components, improving visual effects, or building design systems.
argument-hint: [prompt]
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  category: ai-orchestration
  tags:
    - frontend
    - ui-ux
    - react
---

Execute the frontend engineering task described in `$ARGUMENTS`.

## Steps

1. If `$ARGUMENTS` is empty, report an error requesting the UI component description.
2. Read `$SKILL_DIR/references/GUIDE.md` for aesthetic principles and component patterns.
3. Analyze the user's `$ARGUMENTS` to determine the target UI goal, tone, and constraints.
4. Design or implement the requested UI component according to the guidelines, using local tools logic if necessary.
5. Verify the implementation against the accessibility and responsive design checklist.

## Output

Generated UI code and a brief explanation of the design decisions.

## Troubleshooting

- If the user provides a very vague prompt, output asking for clarification on the aesthetic direction before writing code.
