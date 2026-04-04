---
name: session-wrap
description: Use when the user wants to wrap up the current coding session, summarize what happened in this session before ending work, document learnings and decisions, produce a handoff note for the next session, decide what to commit, or says 总结会话, 会话总结, 收尾, 会话收尾, 结束会话, 总结本次会话. Use proactively when the user signals they are done working or switching context, even if they don't explicitly say "wrap up".
category: work
tags:
  - session
  - wrap-up
  - handoff
  - summary
version: 3.1.0
---

# session-wrap

Close out the **current** coding session in a way that is easy to resume later. Focus on what was actually finished, what is still open, what was learned, and what should happen next.

## Language Detection

Detect the user's language from their request:
- Chinese or mixed Chinese input → output in Chinese (default)
- English input → output in English
- Keep identifiers, paths, branch names, and commit hashes in their original form

## Core Rules

- Scope is the **current session** unless the user explicitly asks for a broader range.
- Prioritize outcomes, decisions, learnings, and follow-up actions over process chatter.
- Do not output a chronological 流水账.
- Do not claim work is completed unless there is evidence in the session, git status, or validation output.
- If the user asks to write files, commit, or update docs, summarize first and then confirm the action.

## Workflow

### Step 1: Confirm scope

Default to the current session. If the user already gave a clear wrap-up request, do not ask extra questions.

Clarify only when needed:
- Current session only or also include earlier sessions
- Whether to include commit advice
- Whether to produce a handoff note or just a chat summary

### Step 2: Inspect the working tree

Collect the minimum evidence needed for an accurate summary:

```bash
git status --short
git diff --stat
git log --oneline -n 10
```

If the repository state is not available, say so explicitly and continue with session context.

### Step 3: Summarize completed work

Summarize by **workstream** instead of by timestamp.

Structure:
- 本次完成 / Completed this session
- 关键决策 / Key decisions
- 涉及文件 / 模块 / Files and modules touched
- 已做验证 / Verification performed

If there were no meaningful code changes, say that clearly instead of inventing results.

### Step 4: Extract learnings and open items

Capture what matters for the next session:
- New findings or insights
- Mistakes avoided or lessons learned
- Known risks
- Unfinished tasks
- Blockers or dependencies

Keep this section concise and operational.

### Step 5: Offer next actions and commit guidance

When relevant, finish with:
- Suggested next steps (prioritized)
- Whether a commit is appropriate now
- A possible commit message direction
- Whether additional verification is still needed

Do not auto-commit. Recommend commit timing only when there is enough evidence.

### Step 6: Generate handoff note (optional)

If the user asks for a handoff note, or if the session involves substantial unfinished work, generate a structured handoff using the template in `$SKILL_DIR/references/handoff-format.md`.

The handoff note captures context that would be lost between sessions — decisions made, approaches tried and rejected, environment state, and clear next steps.

### Step 7: Save / Export (optional)

Save policy:
1. If the user explicitly asks to save, write to a file.
2. If session persistence tools are available (OMC `notepad_write_working`, Claude Code `/export-summary`), suggest using them.
3. Default filename: `YYYY-MM-DD-session-wrap.md`
4. If the user does not ask to save, return the summary in chat only.

## Output Template

```markdown
## 本次会话总结

### 已完成
- ...

### 关键决策
- ...

### 涉及文件 / 模块
- ...

### 验证情况
- 已验证：...
- 未验证：...

### 经验与风险
- ...

### 下一步建议
- ...
```

## When Not to Use

- User wants all of today's sessions summarized → use `project-daily-summary`
- User wants a pure commit-based daily report → use `commit-daily-summary`
- Current session has almost no real work content, just simple Q&A

## Quality Checklist

Before responding, verify:

- [ ] Summary is scoped to the current session unless user asked otherwise
- [ ] Completed work is grouped by workstream, not by timeline
- [ ] Validation is reported honestly
- [ ] Risks and unfinished items are explicit
- [ ] No fake completion, fake commit readiness, or fake verification claims
- [ ] Output language matches the user's language
