# Gemini CLI Integration Skill

This skill helps Claude Code orchestrate Gemini CLI for code generation, review, architecture analysis, and web research. The skill now defaults to `gemini-3.1-pro-preview`, with a shared variable convention so future model swaps happen in one place instead of across many hard-coded examples.

## When to Use This Skill

Use this skill when you want Gemini CLI to provide:

1. A second engineering opinion on code, bugs, or security issues
2. Google Search-grounded answers for current docs, releases, or benchmarks
3. Codebase-wide analysis with `codebase_investigator`
4. Long-running or parallelizable side work while Claude continues locally
5. Specialized generation such as tests, docs, or code translations

Avoid it for tiny one-step tasks where CLI overhead is larger than the benefit.

## Default Model Convention

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

### Official Override Order

1. `--model`
2. `GEMINI_MODEL`
3. `settings.json` at `model.name`
4. Gemini CLI default `auto`

Compatibility fallback if 3.1 preview access is unavailable: `gemini-2.5-pro` or `auto`.

## Quick Start

### Verify Installation

```bash
command -v gemini
```

```powershell
Get-Command gemini
```

If Gemini CLI is missing, install it with:

```bash
npm install -g @google/gemini-cli
```

### Default Command Pattern

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[prompt]" -m "$GEMINI_MODEL" --approval-mode yolo -o text 2>&1
```

Key flags:

- `--approval-mode yolo`: auto-approve tool calls
- `-o text`: human-readable output
- `-o json`: structured output with stats
- `-m "$GEMINI_MODEL"`: primary default model for this skill
- `-m "$GEMINI_FAST_MODEL"`: lower-latency path for lighter tasks

## Core Behaviors

### Planning Still Happens

`--approval-mode yolo` does not skip Gemini's internal planning phase. If you want immediate action, say so explicitly:

- "Apply changes now"
- "Start immediately"
- "Do this without asking for confirmation"

### Validate Output

Always review Gemini-generated code for:

- Security issues
- Requirement mismatches
- Style and architectural consistency
- Dependency choices

### Rate Limits

Gemini CLI auto-retries with exponential backoff. When preview quotas are tight, shift lighter work to `GEMINI_FAST_MODEL`, or fall back to `gemini-2.5-pro` / `auto`.

## Quick Reference Commands

### Code Generation

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Create [description] with [features]. Output complete file content." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Code Review

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Review [file] for features, bugs, security issues, and improvements." -m "$GEMINI_MODEL" -o text
```

### Bug Fixing

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Fix these bugs in [file]: [list]. Apply fixes now." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Test Generation

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Generate [Jest/pytest] tests for [file]. Focus on [areas]." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Documentation

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Generate JSDoc for all functions in [file]. Output as markdown." -m "$GEMINI_MODEL" --approval-mode yolo -o text
```

### Architecture Analysis

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "Use codebase_investigator to analyze this project" -m "$GEMINI_MODEL" -o text
```

### Web Research

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "What are the latest [topic]? Use Google Search." -m "$GEMINI_MODEL" -o text
```

### Fast Model for Lightweight Tasks

```bash
GEMINI_FAST_MODEL="${GEMINI_FAST_MODEL:-gemini-3.1-flash-preview}"
gemini "[prompt]" -m "$GEMINI_FAST_MODEL" -o text
```

## Background Execution

### Bash / zsh

```bash
GEMINI_MODEL="${GEMINI_MODEL:-gemini-3.1-pro-preview}"
gemini "[long task]" -m "$GEMINI_MODEL" --approval-mode yolo -o text > gemini.log 2>&1 &
echo $!
```

### PowerShell

```powershell
if (-not $env:GEMINI_MODEL) { $env:GEMINI_MODEL = "gemini-3.1-pro-preview" }
Start-Process gemini -ArgumentList @("[long task]", "-m", $env:GEMINI_MODEL, "--approval-mode", "yolo", "-o", "text") -RedirectStandardOutput "gemini.log" -RedirectStandardError "gemini.err"
```

## Model Selection Guide

| Model | Use Case |
|-------|----------|
| `gemini-3.1-pro-preview` | Primary default for code generation, review, and analysis |
| `gemini-3.1-flash-preview` | Faster, lower-latency path for lighter work |
| `gemini-2.5-pro` | Compatibility fallback when 3.1 preview access is unavailable |
| `auto` | CLI-managed fallback when you want Gemini to choose |

## Persistent Configuration

### Environment Variables

```bash
export GEMINI_MODEL=gemini-3.1-pro-preview
export GEMINI_FAST_MODEL=gemini-3.1-flash-preview
```

### `settings.json`

```json
{
  "model": {
    "name": "gemini-3.1-pro-preview"
  },
  "general": {
    "previewFeatures": true
  }
}
```

## Unique Gemini Capabilities

Gemini CLI exposes several capabilities that are especially useful from Claude Code:

1. `google_web_search`
2. `codebase_investigator`
3. `save_memory`

## See Also

- `content/skills/developer-tools-integrations/gemini/SKILL.md`
- `content/skills/developer-tools-integrations/gemini/references/reference.md`
- `content/skills/developer-tools-integrations/gemini/references/patterns.md`
- `content/skills/developer-tools-integrations/gemini/references/tools.md`
