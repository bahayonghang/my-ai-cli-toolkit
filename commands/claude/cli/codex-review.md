---
name: codex-review
description: Interactive code review using Codex CLI via ccw endpoint with configurable review target, model, and custom instructions
argument-hint: "[--uncommitted|--base <branch>|--commit <sha>] [--model <model>] [--title <title>] [prompt]"
allowed-tools: Bash(*), AskUserQuestion(*), Read(*)
---

# Codex Review Command (/cli:codex-review)

## Overview
Interactive code review command that invokes `codex review` via ccw cli endpoint with guided parameter selection.

**Codex Review Parameters** (from `codex review --help`):
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

```
PURPOSE: [what] + [why] + [success criteria] + [constraints/scope]
TASK: • [step 1] • [step 2] • [step 3]
MODE: review
CONTEXT: [review target description] | Memory: [relevant context]
EXPECTED: [deliverable format] + [quality criteria]
CONSTRAINTS: [focus constraints]
```

## EXECUTION INSTRUCTIONS - START HERE

**When this command is triggered, follow these exact steps:**

### Step 1: Parse Arguments

Check if user provided arguments directly:
- `--uncommitted` → Record target = uncommitted
- `--base <branch>` → Record target = base, branch name
- `--commit <sha>` → Record target = commit, sha value
- `--model <model>` → Record model selection
- `--title <title>` → Record title
- Remaining text → Use as custom focus/prompt

If no target specified → Continue to Step 2 for interactive selection.

### Step 2: Interactive Parameter Selection

**2.1 Review Target Selection**

```javascript
AskUserQuestion({
  questions: [{
    question: "What do you want to review?",
    header: "Review Target",
    options: [
      { label: "Uncommitted changes (Recommended)", description: "Review staged, unstaged, and untracked changes" },
      { label: "Compare to branch", description: "Review changes against a base branch (e.g., main)" },
      { label: "Specific commit", description: "Review changes introduced by a specific commit" }
    ],
    multiSelect: false
  }]
})
```

**2.2 Branch/Commit Input (if needed)**

If "Compare to branch" selected:
```javascript
AskUserQuestion({
  questions: [{
    question: "Which base branch to compare against?",
    header: "Base Branch",
    options: [
      { label: "main", description: "Compare against main branch" },
      { label: "master", description: "Compare against master branch" },
      { label: "develop", description: "Compare against develop branch" }
    ],
    multiSelect: false
  }]
})
```

If "Specific commit" selected:
- Run `git log --oneline -10` to show recent commits
- Ask user to provide commit SHA or select from list

**2.3 Model Selection (Optional)**

```javascript
AskUserQuestion({
  questions: [{
    question: "Which model to use for review?",
    header: "Model",
    options: [
      { label: "Default", description: "Use codex default model (gpt-5.2)" },
      { label: "o3", description: "OpenAI o3 reasoning model" },
      { label: "gpt-4.1", description: "GPT-4.1 model" },
      { label: "o4-mini", description: "OpenAI o4-mini (faster)" }
    ],
    multiSelect: false
  }]
})
```

**2.4 Review Focus Selection**

```javascript
AskUserQuestion({
  questions: [{
    question: "What should the review focus on?",
    header: "Focus Area",
    options: [
      { label: "General review (Recommended)", description: "Comprehensive review: correctness, style, bugs, docs" },
      { label: "Security focus", description: "Security vulnerabilities, input validation, auth issues" },
      { label: "Performance focus", description: "Performance bottlenecks, complexity, resource usage" },
      { label: "Code quality", description: "Readability, maintainability, SOLID principles" }
    ],
    multiSelect: false
  }]
})
```

### Step 3: Build Prompt and Command

**3.1 Construct Prompt Based on Focus**

**General Review Prompt:**
```
PURPOSE: Comprehensive code review to identify issues, improve quality, and ensure best practices; success = actionable feedback with clear priorities
TASK: • Review code correctness and logic errors • Check coding standards and consistency • Identify potential bugs and edge cases • Evaluate documentation completeness
MODE: review
CONTEXT: {target_description} | Memory: Project conventions from CLAUDE.md
EXPECTED: Structured review report with: severity levels (Critical/High/Medium/Low), file:line references, specific improvement suggestions, priority ranking
CONSTRAINTS: Focus on actionable feedback
```

**Security Focus Prompt:**
```
PURPOSE: Security-focused code review to identify vulnerabilities and security risks; success = all security issues documented with remediation
TASK: • Scan for injection vulnerabilities (SQL, XSS, command) • Check authentication and authorization logic • Evaluate input validation and sanitization • Identify sensitive data exposure risks
MODE: review
CONTEXT: {target_description} | Memory: Security best practices, OWASP Top 10
EXPECTED: Security report with: vulnerability classification, CVE references where applicable, remediation code snippets, risk severity matrix
CONSTRAINTS: Security-first analysis | Flag all potential vulnerabilities
```

**Performance Focus Prompt:**
```
PURPOSE: Performance-focused code review to identify bottlenecks and optimization opportunities; success = measurable improvement recommendations
TASK: • Analyze algorithmic complexity (Big-O) • Identify memory allocation issues • Check for N+1 queries and blocking operations • Evaluate caching opportunities
MODE: review
CONTEXT: {target_description} | Memory: Performance patterns and anti-patterns
EXPECTED: Performance report with: complexity analysis, bottleneck identification, optimization suggestions with expected impact, benchmark recommendations
CONSTRAINTS: Performance optimization focus
```

**Code Quality Focus Prompt:**
```
PURPOSE: Code quality review to improve maintainability and readability; success = cleaner, more maintainable code
TASK: • Assess SOLID principles adherence • Identify code duplication and abstraction opportunities • Review naming conventions and clarity • Evaluate test coverage implications
MODE: review
CONTEXT: {target_description} | Memory: Project coding standards
EXPECTED: Quality report with: principle violations, refactoring suggestions, naming improvements, maintainability score
CONSTRAINTS: Code quality and maintainability focus
```

**3.2 Build Target Description**

Based on selection, set `{target_description}`:
- Uncommitted: `Reviewing uncommitted changes (staged + unstaged + untracked)`
- Base branch: `Reviewing changes against {branch} branch`
- Commit: `Reviewing changes introduced by commit {sha}`

### Step 4: Execute via CCW CLI

Build and execute the ccw cli command:

```bash
# Base structure
ccw cli -p "<PROMPT>" --tool codex --mode review [OPTIONS]
```

**Command Construction:**

```bash
# Variables from user selection
TARGET_FLAG=""      # --uncommitted | --base <branch> | --commit <sha>
MODEL_FLAG=""       # --model <model> (if not default)
TITLE_FLAG=""       # --title "<title>" (if provided)

# Build target flag
if [ "$target" = "uncommitted" ]; then
  TARGET_FLAG="--uncommitted"
elif [ "$target" = "base" ]; then
  TARGET_FLAG="--base $branch"
elif [ "$target" = "commit" ]; then
  TARGET_FLAG="--commit $sha"
fi

# Build model flag (only if not default)
if [ "$model" != "default" ] && [ -n "$model" ]; then
  MODEL_FLAG="--model $model"
fi

# Build title flag (if provided)
if [ -n "$title" ]; then
  TITLE_FLAG="--title \"$title\""
fi

# Execute
ccw cli -p "$PROMPT" --tool codex --mode review $TARGET_FLAG $MODEL_FLAG $TITLE_FLAG
```

**Full Example Commands:**

**Option 1: With custom prompt (reviews uncommitted by default):**
```bash
ccw cli -p "
PURPOSE: Comprehensive code review to identify issues and improve quality; success = actionable feedback with priorities
TASK: • Review correctness and logic • Check standards compliance • Identify bugs and edge cases • Evaluate documentation
MODE: review
CONTEXT: Reviewing uncommitted changes | Memory: Project conventions
EXPECTED: Structured report with severity levels, file:line refs, improvement suggestions
CONSTRAINTS: Actionable feedback
" --tool codex --mode review --rule analysis-review-code-quality
```

**Option 2: Target flag only (no prompt allowed):**
```bash
ccw cli --tool codex --mode review --uncommitted
```

### Step 5: Execute and Display Results

```bash
Bash({
  command: "ccw cli -p \"$PROMPT\" --tool codex --mode review $FLAGS",
  run_in_background: true
})
```

Wait for completion and display formatted results.

## Quick Usage Examples

### Direct Execution (No Interaction)

```bash
# Review uncommitted changes with default settings
/cli:codex-review --uncommitted

# Review against main branch
/cli:codex-review --base main

# Review specific commit
/cli:codex-review --commit abc123

# Review with custom model
/cli:codex-review --uncommitted --model o3

# Review with security focus
/cli:codex-review --uncommitted security

# Full options
/cli:codex-review --base main --model o3 --title "Auth Feature" security
```

### Interactive Mode

```bash
# Start interactive selection (guided flow)
/cli:codex-review
```

## Focus Area Mapping

| User Selection | Prompt Focus | Key Checks |
|----------------|--------------|------------|
| General review | Comprehensive | Correctness, style, bugs, docs |
| Security focus | Security-first | Injection, auth, validation, exposure |
| Performance focus | Optimization | Complexity, memory, queries, caching |
| Code quality | Maintainability | SOLID, duplication, naming, tests |

## Error Handling

### No Changes to Review
```
No changes found for review target. Suggestions:
- For --uncommitted: Make some code changes first
- For --base: Ensure branch exists and has diverged
- For --commit: Verify commit SHA exists
```

### Invalid Branch
```bash
# Show available branches
git branch -a --list | head -20
```

### Invalid Commit
```bash
# Show recent commits
git log --oneline -10
```

## Integration Notes

- Uses `ccw cli --tool codex --mode review` endpoint
- Model passed via prompt (codex uses `-c model=` internally)
- Target flags (`--uncommitted`, `--base`, `--commit`) passed through to codex
- Prompt follows standard ccw cli template format for consistency

## Validation Constraints

**IMPORTANT: Target flags and prompt are mutually exclusive**

The codex CLI has a constraint where target flags (`--uncommitted`, `--base`, `--commit`) cannot be used with a positional `[PROMPT]` argument:

```
error: the argument '--uncommitted' cannot be used with '[PROMPT]'
error: the argument '--base <BRANCH>' cannot be used with '[PROMPT]'
error: the argument '--commit <SHA>' cannot be used with '[PROMPT]'
```

**Behavior:**
- When ANY target flag is specified, ccw cli automatically skips template concatenation (systemRules/roles)
- The review uses codex's default review behavior for the specified target
- Custom prompts are only supported WITHOUT target flags (reviews uncommitted changes by default)

**Valid combinations:**
| Command | Result |
|---------|--------|
| `codex review "Focus on security"` | ✓ Custom prompt, reviews uncommitted (default) |
| `codex review --uncommitted` | ✓ No prompt, uses default review |
| `codex review --base main` | ✓ No prompt, uses default review |
| `codex review --commit abc123` | ✓ No prompt, uses default review |
| `codex review --uncommitted "prompt"` | ✗ Invalid - mutually exclusive |
| `codex review --base main "prompt"` | ✗ Invalid - mutually exclusive |
| `codex review --commit abc123 "prompt"` | ✗ Invalid - mutually exclusive |

**Examples:**
```bash
# ✓ Valid: prompt only (reviews uncommitted by default)
ccw cli -p "Focus on security" --tool codex --mode review

# ✓ Valid: target flag only (no prompt)
ccw cli --tool codex --mode review --uncommitted
ccw cli --tool codex --mode review --base main
ccw cli --tool codex --mode review --commit abc123

# ✗ Invalid: target flag with prompt (will fail)
ccw cli -p "Review this" --tool codex --mode review --uncommitted
ccw cli -p "Review this" --tool codex --mode review --base main
ccw cli -p "Review this" --tool codex --mode review --commit abc123
```
