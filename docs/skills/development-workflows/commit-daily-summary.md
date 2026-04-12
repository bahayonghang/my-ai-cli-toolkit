# Commit Daily Summary

Turn one day of git commits into a readable daily report grouped by workstream instead of raw commit chronology.

## Overview

Use this skill when the user wants:

- a same-day summary of commits
- a commit-based daily report
- a quick answer to "what did I do today?"

Default to the current repository and today's local date unless the user specifies otherwise.

## Workflow

1. Resolve the date range in the user's local timezone.
2. Collect commits with `git log --since ... --until ...`.
3. Group related commits into a small number of workstreams.
4. Rewrite commit subjects into human-readable action summaries.
5. Optionally append raw commit lines when the user wants traceability.

## When to Prefer Another Skill

- Use `project-daily-summary` when the user wants multiple repositories or session evidence.
- Use `session-wrap` when the user wants only the current session summarized.
