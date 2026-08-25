---
name: skill-session-review
description: >
  Analyze how an existing agent skill was used in past Claude Code, Grok, Codex,
  and Oh My Pi conversations. Use when the user asks to 分析某 skill 的使用情况,
  这个 skill 用着有什么问题, 根据历史对话反馈改进 this skill, review skill sessions,
  or write a session-review report. Writes reports/skill-session-review and a
  copyable qiaomu-meta handoff prompt. Do not use for skill usage counts,
  unused-skill cleanup, resuming a session, optimizing CLAUDE.md, creating a
  new skill, or applying qiaomu-meta edits.
version: 0.1.0
category: developer-tools-integrations
tags:
  - skills
  - session-review
  - claude-code
  - grok
  - codex
  - oh-my-pi
  - feedback
argument-hint: "[skill-name-or-path]"
allowed-tools: Read, Glob, Grep, Write, Bash(python *), Bash(py *), Bash(git rev-parse *), Bash(git check-ignore *)
metadata:
  owner: lyh
  review_cadence: quarterly
---

# Skill Session Review

In the commands below, `<skill-dir>` is this skill's base directory, announced when the skill loads. Substitute the literal path. On Windows, `py -3` may replace `python`.

Review how a **named existing skill** was followed in real sessions. Persist a feedback report. Do not edit the target skill. Do not call qiaomu-meta to apply changes.

## Hard gates

- Do not write inside the target skill directory.
- Do not emit `diff.patch` or edit `SKILL.md` of the target.
- Do not run qiaomu-meta as part of this skill.
- Write only via the helpers below: the report file, the repo-root `.gitignore` exact line, and helper `--input` temp files.
- Do not print full private chats in the conversation. The report uses short excerpts only.

## Workflow

1. Resolve the target. Path → that instance. Name → if more than one `SKILL.md`, list paths and stop.
2. Resolve the current repo root: `git rev-parse --show-toplevel` or an explicit root the user gave.
3. Scan sessions:

```text
python "<skill-dir>/scripts/scan_invocations.py" --skill-name <name> [--skill-path <abs>] --scope global --repo-root <abs>
```

Use `--scope cwd` only when the user asked to limit to this repository. Read [invocation signals](references/invocation-signals.md). Treat `loaded` and `available` as coverage, not as required-change evidence.

4. Read the target `SKILL.md` (read-only) and `invoked` session slices. Fill findings per [finding contract](references/finding-contract.md). Promote a pattern only when at least two `invoked` sessions show it.
5. Write the report:

```text
python "<skill-dir>/scripts/write_session_review.py" --repo-root <abs> --skill-name <name> [--skill-path <abs>] --input <utf8-md>
```

Windows: prefer `--input` over stdin. Template: [report template](references/report-template.md). The helper appends `reports/skill-session-review/` to the repo-root `.gitignore` when that exact line is missing. Do not `git add`.

6. Chat output: one conclusion line, the report path, and one `text` fence with a filled [handoff prompt](references/handoff-prompt.md). Do not paste the SSR table. Do not write 见上一条消息.

## Routing

- Usage counts or unused-skill deletion: not this skill.
- Resume a previous chat: `resume-claude` / `resume-codex` / `resume-cursor`.
- Optimize CLAUDE.md or AGENTS.md: `claude-context-improver` / `agents-md-improver`.
- Create or rewrite a skill from materials: qiaomu-meta, in a later turn using the handoff prompt.
