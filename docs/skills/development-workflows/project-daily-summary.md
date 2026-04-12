# Project Daily Summary

Summarize today's work by project, combining session evidence, commits, and uncommitted changes into a concise report.

## Overview

Use this skill when the user wants:

- a same-day summary across multiple repositories
- a project-by-project work report
- a report that includes both commits and uncommitted work

The default output is organized by project first and then by major workstream inside each project.

## Workflow

1. Determine today's local date.
2. Detect available evidence sources such as Codex sessions, Claude session context, and git history.
3. Collect per-project git data with `git log`, `git status`, and `git diff --stat`.
4. Merge related activity into 1-5 major workstreams per project.
5. Produce a report that separates completed work, open work, and next steps.

## When to Prefer Another Skill

- Use `commit-daily-summary` for a commit-only daily report.
- Use `session-wrap` for a summary of just the current coding session.
