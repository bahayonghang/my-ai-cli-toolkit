---
name: commit-daily-summary
description: Use when the user wants a same-day summary of git commits, a commit-based daily report, asks what they did today, wants to generate a work log from commits, or says 总结我今天做了什么, 总结我的提交, 提交总结, 今天提交总结, 日报. This is the default choice for any "日报" or "daily report" request unless the user explicitly asks for multi-project session aggregation. Use proactively whenever the user mentions commits, daily summary, work log, or end-of-day report.
category: development-workflows
tags:
  - daily-report
  - git
  - commit
  - summary
version: 1.0.0
---

# commit-daily-summary

Turn one day of git commits into a readable, grouped work summary. The goal is not to dump raw commit lines but to translate them into human-friendly task statements organized by workstream.

## Language Detection

Detect the user's language from their request:
- Chinese or mixed Chinese input → output in Chinese (default)
- English input → output in English
- Keep identifiers, branch names, and commit hashes in their original form regardless of output language

## Core Rules

- Default scope is **today** in the user's local timezone unless the user gives a specific date.
- Prefer **git evidence** over memory or assumptions.
- Group commits by **workstream / theme**, not by repository chronological order.
- Rewrite raw commit messages into concise action summaries.
- Do not inflate empty, noise-only, or clearly meaningless commits into standalone achievements.

## Workflow

### Step 1: Determine scope

Defaults:
- Date range: today
- Repository: current repository

Clarify only when necessary:
- Today vs a specific date
- Current repo vs multiple repos
- Whether the user wants only task summaries or task summaries + raw commit detail

### Step 2: Collect commits

Single repository:

```bash
git log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD+1 00:00" --pretty=format:"%h%x09%s"
```

Multiple repositories (when the user provides a list of paths):

```bash
for repo in /path/to/repo-a /path/to/repo-b; do
  echo "## $(basename $repo)"
  git -C "$repo" log --since="YYYY-MM-DD 00:00" --until="YYYY-MM-DD+1 00:00" --pretty=format:"%h%x09%s"
  echo ""
done
```

If no commits are found, state that clearly and stop.

### Step 3: Group into workstreams

Cluster related commits together:
- Same feature development
- Same bug fix
- Same config or toolchain adjustment
- Same documentation update

Do not create one summary line per commit when several commits are obviously part of the same workstream.

### Step 4: Rewrite into action summaries

Good summary lines:
- Start with a clear action verb
- Describe the actual business or engineering result
- Omit noisy implementation trivia unless it matters
- Are understandable to someone scanning a daily report quickly

Chinese examples:
- 实现了行情页的筛选条件持久化
- 修复了任务轮询在终态下未刷新概览的问题
- 重构了图表数据映射逻辑，降低了重复处理分支
- 补充了设置保存链路的回归测试

English examples:
- Implemented filter persistence on the market overview page
- Fixed task polling not refreshing overview when terminal state reached
- Refactored chart data mapping to reduce duplicate processing branches

### Step 5: Output the report

Preferred structure:
- Date range
- Today's work summary
- Workstream / repo detail
- Raw commits appendix (optional)

## Output Template

```markdown
## 提交总结

- 日期：YYYY-MM-DD
- 范围：today / current repo

### 今日工作摘要
- ...
- ...

### 分项明细
#### 仓库 A
- workstream 1: ...
- workstream 2: ...

### 原始提交（可选）
- abc123 feat(...)
```

## When Not to Use

- User wants a current-session wrap-up, not commit-based → use `session-wrap`
- User wants multi-project session aggregation → use `project-daily-summary`
- User has no git commits and needs working tree change summary

## Quality Checklist

Before responding, verify:

- [ ] Date scope is explicit
- [ ] Summary is based on actual commits, not guesses
- [ ] Related commits are grouped into workstreams
- [ ] Summary lines are human-readable and action-oriented
- [ ] Empty or noise commits are not treated as major work items
- [ ] Output language matches the user's language
