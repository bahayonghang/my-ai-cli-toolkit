---
name: gemini
description: >-
  Execute Gemini CLI for code generation, review, analysis, and web research.
  Use when tasks need a second AI perspective, Google Search grounding, codebase
  architecture analysis, or current web information. Trigger whenever the user
  mentions gemini, asks for Google Search results, needs real-time web data,
  wants codebase investigation, or requests a different AI's opinion on code.
version: 1.1.0
argument-hint: [task-description]
metadata:
  category: development-tools
  tags: [cli, gemini, code-generation, web-search, google, code-review]
allowed-tools:
  - Bash(gemini *)
  - Read
---

Run Gemini CLI for `$ARGUMENTS`.

## Defaults

- Primary command form: `gemini`
- Default model variable: `GEMINI_MODEL`
- Default model value: `gemini-3.1-pro-preview`
- Fast model variable: `GEMINI_FAST_MODEL`
- Fast model value: `gemini-3.1-flash-preview`
- One-off override: `-m <model>`
- Persistent override: set `GEMINI_MODEL` in the shell or `model.name` in Gemini CLI `settings.json`
- Compatibility fallback if 3.1 preview access is unavailable: `auto` or `gemini-2.5-pro`

## Prerequisites

1. Verify Gemini CLI is installed.
   - Bash / zsh: `command -v gemini`
   - PowerShell: `Get-Command gemini`
   - If missing: `npm install -g @google/gemini-cli`
2. Verify the CLI can start: `gemini --version`
3. If the first real request fails with auth or preview-access errors, complete `gemini` setup or switch `GEMINI_MODEL` to `auto` or `gemini-2.5-pro`.

## Model Convention

Use shell variables in examples so the default model lives in one place.

### Bash / zsh

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
```

### PowerShell

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
if (-not $env:GEMINI_FAST_MODEL) { $env:GEMINI_FAST_MODEL = "gemini-3.1-flash-preview" }
```

Official override order for the effective model:

1. CLI flag `--model`
2. Environment variable `GEMINI_MODEL`
3. `settings.json` value at `model.name`
4. Gemini CLI default `auto`

## Steps

1. If `$ARGUMENTS` is empty, ask the user for the task description.
2. Set `GEMINI_MODEL` and `GEMINI_FAST_MODEL` using the shell convention above.
3. For default code generation, analysis, and review tasks, run:
   ```bash
   GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
   gemini "$ARGUMENTS" -m "$GEMINI_MODEL" --approval-mode yolo -o text 2>&1
   ```
4. For faster or lower-priority tasks, run:
   ```bash
   GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
   gemini "$ARGUMENTS" -m "$GEMINI_FAST_MODEL" --approval-mode yolo -o text 2>&1
   ```
5. For a one-off compatibility override, run:
   ```bash
   gemini "$ARGUMENTS" -m gemini-2.5-pro --approval-mode yolo -o text 2>&1
   ```
6. Include action directives such as "Apply changes now" or "Start immediately" because `--approval-mode yolo` auto-approves tool calls but does not skip Gemini's internal planning phase.
7. For structured output, use `-o json` and extract the `response` field.
8. Validate generated code for syntax, security, and style before accepting it.
9. If preview model access is denied, retry with `GEMINI_MODEL=auto` or `GEMINI_MODEL=gemini-2.5-pro`.

## Core Patterns

### Generate-Review-Fix Cycle

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"

# 1. Generate
gemini "Create [description]" -m "$GEMINI_MODEL" --approval-mode yolo -o text

# 2. Review
gemini "Review [file] for bugs and security issues" -m "$GEMINI_MODEL" -o text

# 3. Fix
gemini "Fix these issues in [file]: [list]. Apply now." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Background Execution

Use a shell-appropriate background command.

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[long task]" -m "$GEMINI_MODEL" --approval-mode yolo -o text > gemini.log 2>&1 &
echo $!
```

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
Start-Process gemini -ArgumentList @("[long task]", "-m", $env:GEMINI_MODEL, "--approval-mode", "yolo", "-o", "text") -RedirectStandardOutput "gemini.log" -RedirectStandardError "gemini.err"
```

### Cross-Validation with Claude

Use both AIs for highest quality. Claude can generate while Gemini reviews, or the reverse, to catch different classes of issues.

## References

- `references/reference.md` - CLI flags, configuration, model precedence, session management
- `references/templates.md` - prompt templates for common operations
- `references/patterns.md` - integration patterns and workflows using the shared model variables
- `references/tools.md` - Gemini built-in tools such as `google_web_search`, `codebase_investigator`, and `save_memory`
