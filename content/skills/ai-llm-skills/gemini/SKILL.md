---
name: gemini
description: Execute Gemini CLI for code generation, review, analysis, and web research. Use when tasks need a second AI perspective, Google Search grounding, or codebase architecture analysis.
metadata:
  category: development-tools
  tags: [cli, gemini, code-generation, web-search, google]
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
3. Use forceful language ("Apply now", "Start immediately") — `--approval-mode yolo` auto-approves tools but does NOT suppress planning prompts.
4. Select model: `auto` (default smart routing), `-m gemini-2.5-flash` (quick tasks), `-m gemini-2.5-pro` (complex reasoning).
5. For structured output, use `-o json` and extract `response` field.
6. Validate generated code for syntax, security, and style.
7. Rate limits: CLI auto-retries with backoff. Use Flash for lower-priority tasks.

## References

- `references/reference.md` — CLI flags, configuration, session management
- `references/templates.md` — prompt templates for common operations
- `references/patterns.md` — integration patterns and workflows
- `references/tools.md` — Gemini built-in tools (google_web_search, codebase_investigator, save_memory)
