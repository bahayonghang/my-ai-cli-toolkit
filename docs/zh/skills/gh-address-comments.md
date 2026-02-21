# GitHub PR Comment Handler

Interactively address review comments and issue threads on the current branch's open GitHub PR using `gh` CLI.

## Overview

This skill fetches all review comments from your PR, presents them as a numbered list with fix summaries, lets you choose which to address, and applies the fixes automatically.

## Prerequisites

- GitHub CLI (`gh`) installed and authenticated
- Repository with an open PR on the current branch

```bash
# Verify authentication
gh auth status
# If needed, authenticate with required scopes
gh auth login  # ensure repo + workflow scopes
```

## Workflow

1. **Fetch** — Retrieves all review threads and comments from the current branch's PR
2. **Summarize** — Numbers each comment with a short description of the required fix
3. **Select** — You choose which comments to address
4. **Fix** — Applies the selected fixes to your codebase

## Usage

```bash
# Address comments on current branch's PR
/gh-address-comments

# Or specify a PR number
/gh-address-comments --pr 42
```

## When to Use

- After receiving code review feedback on a PR
- When you want to batch-process multiple review comments
- To quickly triage and fix reviewer suggestions
