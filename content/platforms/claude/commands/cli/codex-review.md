---
name: codex-review
description: Interactive code review using Codex CLI via ccw endpoint with configurable review target, model, and custom instructions
argument-hint: "[--uncommitted|--base <branch>|--commit <sha>] [--model <model>] [--title <title>] [prompt]"
allowed-tools: Bash(*), AskUserQuestion(*), Read(*)
---

# Codex Review Command (/cli:codex-review)

## Overview

Interactive code review command routed through `ccw cli`.

Use two execution paths:

- `ccw cli --tool codex --mode review` for plain `codex review` flows
- `ccw cli --tool codex --mode analysis` for read-only `codex exec` style review when the user needs both a fixed target and custom review instructions

This split is required because current `codex review` rejects a positional prompt when used with `--uncommitted`, `--base`, or `--commit`.

## Codex Review Parameters

From `codex review --help`:

| Parameter | Description |
|-----------|-------------|
| `[PROMPT]` | Custom review instructions (positional) |
| `-c model=<model>` | Override model via config |
| `--uncommitted` | Review staged, unstaged, and untracked changes |
| `--base <BRANCH>` | Review changes against base branch |
| `--commit <SHA>` | Review changes introduced by a commit |
| `--title <TITLE>` | Optional commit title for review summary |

## Prompt Template Format

Follow the standard ccw cli prompt template:

```text
PURPOSE: [what] + [why] + [success criteria] + [constraints/scope]
TASK: - [step 1] - [step 2] - [step 3]
MODE: [review|analysis]
CONTEXT: [review target description] | Memory: [relevant context]
EXPECTED: [deliverable format] + [quality criteria]
CONSTRAINTS: [focus constraints]
```

## Execution Instructions

When this command is triggered, follow these steps.

### Step 1: Parse Arguments

Check whether the user provided arguments directly:

- `--uncommitted` -> `target = uncommitted`
- `--base <branch>` -> `target = base`, store branch name
- `--commit <sha>` -> `target = commit`, store sha
- `--model <model>` -> store model selection
- `--title <title>` -> store title
- remaining text -> `custom_focus`

If no target is specified, continue to interactive selection.

### Step 2: Interactive Parameter Selection

#### 2.1 Review Target

```javascript
AskUserQuestion({
  questions: [{
    question: "What do you want to review?",
    header: "Review Target",
    options: [
      { label: "Uncommitted changes (Recommended)", description: "Review staged, unstaged, and untracked changes" },
      { label: "Compare to branch", description: "Review changes against a base branch such as main" },
      { label: "Specific commit", description: "Review changes introduced by a specific commit" }
    ],
    multiSelect: false
  }]
})
```

#### 2.2 Branch or Commit

If "Compare to branch" is selected:

```javascript
AskUserQuestion({
  questions: [{
    question: "Which base branch should be reviewed against?",
    header: "Base Branch",
    options: [
      { label: "main", description: "Compare against main" },
      { label: "master", description: "Compare against master" },
      { label: "develop", description: "Compare against develop" }
    ],
    multiSelect: false
  }]
})
```

If "Specific commit" is selected:

- Run `git log --oneline -10`
- Ask the user for the SHA if needed

#### 2.3 Model

```javascript
AskUserQuestion({
  questions: [{
    question: "Which model should be used for review?",
    header: "Model",
    options: [
      { label: "Default", description: "Use codex default model" },
      { label: "o3", description: "Use o3 reasoning model" },
      { label: "gpt-4.1", description: "Use GPT-4.1" },
      { label: "o4-mini", description: "Use o4-mini for faster review" }
    ],
    multiSelect: false
  }]
})
```

#### 2.4 Focus Area

```javascript
AskUserQuestion({
  questions: [{
    question: "What should the review focus on?",
    header: "Focus Area",
    options: [
      { label: "General review (Recommended)", description: "Correctness, style, bugs, and docs" },
      { label: "Security focus", description: "Vulnerabilities, validation, auth, and exposure" },
      { label: "Performance focus", description: "Complexity, memory, queries, and blocking work" },
      { label: "Code quality", description: "Maintainability, naming, duplication, and tests" }
    ],
    multiSelect: false
  }]
})
```

### Step 3: Route the Execution Path

Choose the route before building the final command.

| Inputs | Route | Reason |
|--------|-------|--------|
| target only | `--mode review` | Maps cleanly to `codex review --target` |
| prompt only | `--mode review` | Maps to `codex review "<prompt>"` on default uncommitted scope |
| target + prompt | `--mode analysis` | Avoids invalid `codex review --target "<prompt>"` and uses read-only `codex exec` behavior |

Additional rule:

- `--title` is only meaningful on the `review` route
- if `target + prompt + title` is provided, keep the title in prompt context and do not pass `--title`

### Step 4: Build Prompt

#### 4.1 Target Description

Build `target_description` from the selected target:

- uncommitted -> `Reviewing the repository's uncommitted changes`
- base -> `Reviewing changes against base branch {branch}`
- commit -> `Reviewing changes introduced by commit {sha}`

If a title exists and the route is `analysis`, append it to context as:

`Title: {title}`

#### 4.2 Focus Prompt

General:

```text
PURPOSE: Comprehensive code review to identify issues, improve quality, and ensure best practices; success = actionable findings with clear priorities
TASK: - Review correctness and logic errors - Check coding standards and consistency - Identify potential bugs and edge cases - Evaluate documentation completeness
MODE: {mode}
CONTEXT: {target_description} | Memory: Project conventions from CLAUDE.md
EXPECTED: Structured review report with severity levels, file:line references, specific fixes, and priority ranking
CONSTRAINTS: Focus on actionable feedback | Do not modify files
```

Security:

```text
PURPOSE: Security-focused code review to identify vulnerabilities and security risks; success = concrete findings with remediation guidance
TASK: - Scan for injection vulnerabilities - Check authentication and authorization logic - Evaluate input validation and sanitization - Identify sensitive data exposure risks
MODE: {mode}
CONTEXT: {target_description} | Memory: Security best practices and OWASP guidance
EXPECTED: Structured security review with severity, evidence, impact, and remediation steps
CONSTRAINTS: Security-first analysis | Do not modify files
```

Performance:

```text
PURPOSE: Performance-focused code review to identify bottlenecks and optimization opportunities; success = measurable improvement recommendations
TASK: - Analyze algorithmic complexity - Identify memory allocation issues - Check for N+1 queries and blocking operations - Evaluate caching opportunities
MODE: {mode}
CONTEXT: {target_description} | Memory: Performance patterns and anti-patterns
EXPECTED: Structured performance review with bottlenecks, expected impact, and next-step recommendations
CONSTRAINTS: Performance optimization focus | Do not modify files
```

Code quality:

```text
PURPOSE: Code quality review to improve maintainability and readability; success = concrete refactoring and testing recommendations
TASK: - Assess SOLID adherence - Identify duplication and abstraction gaps - Review naming and clarity - Evaluate testing implications
MODE: {mode}
CONTEXT: {target_description} | Memory: Project coding standards
EXPECTED: Structured quality review with maintainability findings and refactoring suggestions
CONSTRAINTS: Maintainability focus | Do not modify files
```

Set `{mode}` to:

- `review` on the `review` route
- `analysis` on the `analysis` route

### Step 5: Build the CCW Command

Use these variables:

```bash
TARGET_FLAG=""
MODEL_FLAG=""
TITLE_FLAG=""
COMMAND=""
```

Construct flags:

```bash
if [ "$target" = "uncommitted" ]; then
  TARGET_FLAG="--uncommitted"
elif [ "$target" = "base" ]; then
  TARGET_FLAG="--base $branch"
elif [ "$target" = "commit" ]; then
  TARGET_FLAG="--commit $sha"
fi

if [ "$model" != "default" ] && [ -n "$model" ]; then
  MODEL_FLAG="--model $model"
fi

if [ -n "$title" ]; then
  TITLE_FLAG="--title \"$title\""
fi
```

Route-specific command construction:

```bash
if [ -n "$TARGET_FLAG" ] && [ -n "$custom_focus" ]; then
  COMMAND="ccw cli -p \"$PROMPT\" --tool codex --mode analysis $MODEL_FLAG"
elif [ -n "$TARGET_FLAG" ]; then
  COMMAND="ccw cli --tool codex --mode review $TARGET_FLAG $MODEL_FLAG $TITLE_FLAG"
else
  COMMAND="ccw cli -p \"$PROMPT\" --tool codex --mode review $MODEL_FLAG $TITLE_FLAG --rule analysis-review-code-quality"
fi
```

### Step 6: Execute and Display Results

```bash
Bash({
  command: COMMAND,
  run_in_background: true
})
```

Wait for completion and display the formatted review.

## Quick Usage Examples

### Direct Execution

```bash
/cli:codex-review --uncommitted
/cli:codex-review --base main
/cli:codex-review --commit abc123
/cli:codex-review --uncommitted --model o3
/cli:codex-review --uncommitted security
/cli:codex-review --base main --model o3 --title "Auth Feature" security
```

### Resulting Command Shapes

```bash
# target only
ccw cli --tool codex --mode review --uncommitted

# prompt only
ccw cli -p "Focus on security" --tool codex --mode review

# target plus prompt
ccw cli -p "Review the current repository's uncommitted changes. Focus on security." --tool codex --mode analysis
```

## Error Handling

### No Changes to Review

```text
No changes found for review target. Suggestions:
- For --uncommitted: make some code changes first
- For --base: ensure the branch exists and has diverged
- For --commit: verify the commit SHA exists
```

### Invalid Branch

```bash
git branch -a --list | head -20
```

### Invalid Commit

```bash
git log --oneline -10
```

## Integration Notes

- `--mode review` is the `codex review` path
- `--mode analysis` is the read-only `codex exec` path
- Target flags are forwarded only on the `review` path
- On the `analysis` path, target intent must be expressed inside the prompt
- `--title` is passed only on the `review` path

## Validation Constraints

Current `codex review` rejects target flags combined with a positional prompt:

```text
error: the argument '--uncommitted' cannot be used with '[PROMPT]'
error: the argument '--base <BRANCH>' cannot be used with '[PROMPT]'
error: the argument '--commit <SHA>' cannot be used with '[PROMPT]'
```

Treat these combinations as routing input, not as executable `review` commands.

| Intent | Correct route |
|--------|---------------|
| custom prompt only | `ccw cli -p "<prompt>" --tool codex --mode review` |
| target only | `ccw cli --tool codex --mode review <target flag>` |
| target + custom prompt | `ccw cli -p "<prompt describing target>" --tool codex --mode analysis` |
