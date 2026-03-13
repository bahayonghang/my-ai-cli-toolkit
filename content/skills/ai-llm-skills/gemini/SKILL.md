---
name: gemini
description: >-
  Execute Gemini CLI for code generation, review, analysis, and web research.
  Use when tasks need a second AI perspective, Google Search grounding, codebase
  architecture analysis, or current web information. Trigger whenever the user
  mentions gemini, asks for Google Search results, needs real-time web data,
  wants codebase investigation, or requests a different AI's opinion on code.
version: 1.0.0
argument-hint: [task-description]
metadata:
  category: development-tools
  tags: [cli, gemini, code-generation, web-search, google, code-review]
allowed-tools:
  - Bash
  - Read
  - Write
  - Grep
  - Glob
---

## Steps

1. Verify installation: `command -v gemini || which gemini`.
2. Run command:
   ```bash
   gemini "[prompt]" --approval-mode yolo -o text 2>&1
   ```
3. Include action directives (e.g., "Apply changes now", "Start immediately") because `--approval-mode yolo` auto-approves tool calls but does not skip the model's internal planning phase.
4. Select model: `auto` (default smart routing), `-m gemini-2.5-flash` (quick tasks), `-m gemini-2.5-pro` (complex reasoning).
5. For structured output, use `-o json` and extract `response` field.
6. Validate generated code for syntax, security, and style.
7. Rate limits: CLI auto-retries with backoff. Use Flash for lower-priority tasks.

## Core Patterns

### Generate-Review-Fix Cycle

The most reliable pattern for quality code generation:

```bash
# 1. Generate
gemini "Create [description]" --approval-mode yolo -o text
# 2. Review (different mindset catches mistakes)
gemini "Review [file] for bugs and security issues" -o text
# 3. Fix identified issues
gemini "Fix these issues in [file]: [list]. Apply now." --approval-mode yolo -o text
```

### Background Execution

For long-running tasks, execute in background and continue working:

```bash
gemini "[long task]" --approval-mode yolo -o text 2>&1 &
echo $!  # capture PID for monitoring
```

### Cross-Validation with Claude

Use both AIs for highest quality — Claude generates, Gemini reviews (or vice versa). Different models catch different issues.

## References

- `references/reference.md` — CLI flags, configuration, session management
- `references/templates.md` — prompt templates for common operations
- `references/patterns.md` — all integration patterns and workflows
- `references/tools.md` — Gemini built-in tools (google_web_search, codebase_investigator, save_memory)
