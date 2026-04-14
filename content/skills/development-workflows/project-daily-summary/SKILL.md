---
name: project-daily-summary
description: Use when the user wants a same-day work summary grouped by project folder or repository, combining today's coding sessions, extracted plans, completed items, commits, and uncommitted changes, or says 项目日报, 今日工作总结, 按项目总结今天, 总结今天所有会话, 总结今天会话+提交+未提交改动. Use this instead of commit-daily-summary when the user explicitly wants multi-project aggregation or session-level evidence beyond pure git commits.
category: development-workflows
tags:
  - daily-report
  - project
  - session
  - multi-platform
  - summary
version: 2.0.0
---

# project-daily-summary

Summarize today's coding work by project. Combine session evidence with git commits and uncommitted changes. Prioritize plans and final outcomes over process chatter.

## Language Detection

Detect the user's language from their request:
- Chinese or mixed Chinese input → output in Chinese (default)
- English input → output in English
- Keep identifiers, paths, branch names, and commit hashes in their original form

## Core Rules

- Do not produce a chronological 流水账.
- Do not summarize reasoning noise or intermediate tool chatter.
- Always summarize by **project** first, then by **major workstream** within each project.
- If evidence is missing, say so explicitly. Do not fabricate sessions, commits, or validation results.

## Workflow

### Step 1: Determine today's local date

Use the local machine date, not UTC.

### Step 2: Detect environment and load platform reference

Check for available session sources in this order:

1. **Codex sessions** (`~/.codex/sessions/YYYY/MM/DD/`) → read `$SKILL_DIR/references/codex-sessions.md` for parsing details
2. **Claude Code context** (current conversation + OMC notepad) → read `$SKILL_DIR/references/claude-code-sessions.md`
3. **Git-only fallback** → skip session parsing, rely entirely on git evidence

If multiple sources are available, combine them. If none are available, report that clearly and proceed with git-only mode.

### Step 3: Collect evidence

For each project in scope:

**Session evidence** (platform-specific, see loaded reference):

Extract these signal types in priority order:
1. **Goal / intent** — what the user set out to do (from session start, plan files, or first prompt)
2. **Completed items** — tasks marked done, files written, tests passing
3. **Key decisions** — architecture choices, library selections, approach changes
4. **Changed files** — from session context or git diff
5. **Validation state** — tests run and their results, build status
6. **Open risks / blockers** — unresolved issues, known failures

If a session source is available but parsing fails or returns empty, fall back to git evidence for that project and note `(session data unavailable)` in the output. Do not silently drop a project because session parsing failed.

**Git evidence** (universal):
```bash
git -C <repo> log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD+1 00:00" --pretty=format:"%h %s"
git -C <repo> status --short
git -C <repo> diff --stat
```

**Pre-check:** Verify the directory is a git repository before running git commands. If not a repo, skip git evidence and rely on session evidence alone.

Read `$SKILL_DIR/references/session-parsing.md` for the universal signal extraction template and noise filtering rules.

### Step 4: Group by project

For each session or working directory:
1. Try `git -C <cwd> rev-parse --show-toplevel` to find the project root
2. If that fails, use the working directory as the project key

Output one section per project, not one per session.

### Step 5: Merge into major workstreams

Within each project, merge multiple sessions or commit groups into a few major workstreams using these signals:
- Same branch or worktree
- Same or similar user goal
- Overlapping changed files
- Same feature, bug, review, or topic

Target **1 to 5 workstreams per project**, not dozens of entries.

### Step 6: Output the report

Use the template below. Adjust section labels to match the output language.

### Step 7: Save (optional)

Save policy:
1. If the project's `AGENTS.md` defines a daily-summary output directory, follow it.
2. Otherwise ask the user for the output directory on first use.
3. Default filename: `YYYY-MM-DD-project-daily.md`
4. If the user says not to save, return the summary in chat only.

## Output Template

```markdown
# Project Daily Summary
日期：YYYY-MM-DD

## 总览
- 项目数：
- 会话数：
- 主要推进：
- 今日仍未收尾：

## 项目：<repo-or-folder>
- 分支 / 仓库：
- 今日目标：
- 今日计划提炼：
- 今日完成事项：
- 今日 commits：
- 当前未提交改动：
- 风险 / 未完成项：
- 建议下一步：

## 跨项目总结
- 今天最重要的推进
- 重复出现的问题
- 明天最值得先做的 1-3 件事
```

## Scope Rules

- **Default**: summarize all projects that appear in today's sessions or that the user has committed to today.
- **If the user provides specific folders**: summarize only those.

## When Not to Use

- User wants a current-session wrap-up only → use `session-wrap`
- User wants a pure commit-based report → use `commit-daily-summary`
- User says just "日报" without multi-project or session context → prefer `commit-daily-summary`

## Quality Checklist

Before responding, verify:

- [ ] Date scope is explicit
- [ ] Projects are grouped correctly
- [ ] Session evidence is distinguished from git evidence
- [ ] Completed vs uncommitted vs unfinished items are clearly separated
- [ ] No fabricated sessions, commits, or verification claims
- [ ] Output language matches the user's language
