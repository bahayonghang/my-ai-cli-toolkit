---
name: goal-meta-skill
description: |
  Turn vague or complex Codex tasks into strong `/goal` commands with outcome, verification, constraints, boundaries, iteration policy, completion evidence, and pause/block conditions. Use when the user asks for Codex goal instructions, Goal 指令, 目标指令, `/goal` prompts, 中文 Goal 模板, plan-to-goal interviews, success criteria, verification commands, or bounded agent work definitions.
version: 0.1.0
category: developer-tools-integrations
tags:
  - codex
  - goal
  - prompt-engineering
  - agent-skills
  - verification
argument-hint: "[vague-task-or-goal]"
allowed-tools: Read, Bash(python *), Bash(py *)
---

# Goal Meta Skill

把一个模糊任务，收敛成 Codex 可以持续执行、可以验证、知道何时停止和何时暂停的 `/goal` 指令。

> In the commands below, `<skill-dir>` is this skill's base directory, announced
> when the skill loads. Substitute the literal path; it is not an environment
> variable. The script self-locates, so only the path to it must resolve.

## Operating Mode

Run as a production-lite meta skill.

Default assumptions:

- The user wants a paste-ready Codex `/goal` command, not a general prompt.
- The executable slash command stays `/goal`. Do not output `/目标` as the command unless the user's environment explicitly documents that alias.
- In current Codex, `/goal <text>` sets a persistent goal, `/goal` views the current goal, and `/goal pause`, `/goal resume`, and `/goal clear` manage it. If the user asks to inspect, pause, resume, or clear an existing goal, give the relevant management command instead of drafting a new objective.
- If `/goal` is missing from the slash command list, tell the user to enable `features.goals` in Codex config or run the equivalent Codex feature enable command for their environment.
- Goal objectives must be non-empty and at most 4,000 characters. For longer instructions, draft a compact `/goal` that points at a local instruction file and put the long contract in that file content or a separate copy block.
- The first goal block should be the best recommended executable version, not a half-filled template. Users often copy the first draft directly.
- For Chinese users, output Chinese content and Chinese field names by default while keeping the command prefix `/goal`.
- For Chinese users, include both `推荐执行版（中文，可直接复制）` and `Goal Draft (English-compatible)` unless the user asks for one language only.
- If the task is still vague but low-risk, choose the best conservative defaults and continue. Ask only when the answer changes cost, risk, ownership, or product direction.
- If the domain is unfamiliar or specialized, create a discovery-first goal that makes the agent inspect authoritative project/docs/runtime evidence before implementation instead of inventing domain rules.
- If the missing detail is low-risk, make an explicit assumption and continue.
- Do not start the work described by the goal unless the user explicitly asks. This skill creates the goal instruction.
- Prefer concrete verification commands and artifacts over vague confidence phrases.
- Prefer narrow write boundaries and explicit forbidden paths over broad permission.
- Treat `Stop when` and `Pause if` as part of the same completion/blocking contract.

## Workflow

1. Restate the task as an outcome, not an activity.
2. Classify the task using `references/default-goal-strategy.md`: familiar vs unknown domain, low vs high risk, new work vs existing project.
3. Choose best defaults for low-risk unknowns and write a one-sentence reason.
4. Identify missing information across the Goal contract:
   - success criteria
   - verification commands, artifacts, or evidence
   - constraints that must not change
   - allowed writes and forbidden paths
   - iteration policy
   - completion evidence
   - blocked stop conditions, human decisions, or budget caps
5. If the task is under-specified, prefer numbered multiple-choice adjustments with defaults. Use `references/interview-checklist.md`.
6. For Chinese-first users, produce the Chinese recommended execution goal first, then an English-compatible mirror that preserves the same meaning and keeps English field labels.
7. Check the command against `references/goal-command-playbook.md`.
8. If the task is about an existing active goal, use `/goal`, `/goal pause`, `/goal resume`, or `/goal clear` guidance rather than inventing a replacement goal.
9. Keep the executable `/goal` objective within the 4,000 character limit. When the contract is longer, use a file-pointer pattern such as `/goal Follow the task contract in .planning/<task>.md and stop only when its verification section is satisfied.`
10. For file deliverables, run `python "<skill-dir>/scripts/lint_goal_command.py" <file>` or `py -3 "<skill-dir>/scripts/lint_goal_command.py" <file>` before calling the goal done. Add `--require-chinese-companion` when validating Chinese-first output.

## Output Contract

When enough information is known, output the best recommended command first. Do not leave placeholders in real output.

```text
/goal Create a first-version local MVP for the requested task, inspect project-provided commands before changing code, implement the core user-visible workflow, and keep unrelated systems unchanged.
Verification: run the smallest project-provided checks, start the local app or relevant runtime, complete the core workflow once, and capture logs/screenshots or command output as evidence.
Constraints: do not add accounts, paid services, production changes, destructive operations, or unrelated features unless requested.
Boundaries: write only inside the new project directory or the directly related existing project files.
Iteration policy: implement one focused workflow at a time, rerun checks after meaningful changes, inspect logs before retrying, and make at most 3 focused improvement rounds before reporting remaining risks.
Stop when: the core workflow is proven by runtime evidence and checks pass or missing checks are explicitly reported.
Pause if: credentials, payments, production data, destructive changes, legal/medical/financial decisions, copyrighted assets, or unclear ownership is required.
```

For Chinese-first users, prefer this equivalent shape:

```text
/goal 基于用户需求创建第一版本地 MVP，先读取项目已有命令和约束，实现核心用户可见流程，并避免改动无关系统。
验证：运行项目提供的最小相关检查，启动本地应用或对应运行环境，完整走通一次核心流程，并用日志、截图或命令输出作为证据。
约束：不加入账号、付费服务、生产变更、破坏性操作或无关功能，除非用户明确要求。
边界：只写入新项目目录，或只修改现有项目中与该功能直接相关的文件。
迭代策略：一次实现一个聚焦工作流，每次有意义改动后重跑检查，重试前先读日志，最多做 3 轮聚焦改进后报告剩余风险。
完成条件：核心流程有运行证据证明可用，检查通过或明确说明缺少配置。
暂停条件：需要凭证、付费、生产数据、破坏性操作、法律/医疗/金融判断、版权素材或所有权不清时暂停。
```

When the task is vague, output:

1. `推荐执行版（中文，可直接复制）`: the best default `/goal`.
2. `默认选择理由`: one concise sentence.
3. `可选调整`: numbered choices with recommended defaults and short option labels.
4. `你可以直接回复`: an example such as `按默认` or `1B 2A 3C`.
5. `Goal Draft (English-compatible)`: a faithful English-compatible mirror with English field labels.

If the user writes in English, output only the English-compatible draft unless they ask for Chinese too.

If the user asks how to manage an existing Codex goal, answer with the minimal command:

- `/goal` to view the current goal.
- `/goal pause` to pause it.
- `/goal resume` to continue it.
- `/goal clear` to remove it.

Do not output long generic coaching unless the user asks for explanation.

## Quality Bar

A strong goal:

- has one concrete outcome
- names exact checks or evidence
- protects unrelated files, user data, secrets, and default branches
- defines the write boundary
- tells the agent how to iterate after failures
- says when to stop because completion is proven
- says when to pause because a human decision, credential, account state, budget, or repeated blocker is required
- fits inside Codex's 4,000 character objective limit, or points to a file that contains the longer contract

Reject or revise a goal that:

- says only `make it better`, `finish this`, or `fix bugs`
- lacks verification
- lets the agent edit the whole machine or repo without reason
- asks for repeated retries without a new source of evidence
- has no pause condition for external auth, secrets, payments, destructive actions, or ambiguous product decisions
- leaves placeholders such as `[Outcome]` in user-facing executable drafts
- treats vague words such as `高级`, `有质感`, or `professional` as verification instead of translating them into screenshots, runtime checks, review criteria, or iteration rules

## Reference Files

- `references/goal-command-playbook.md`: the core `/goal` template, when to use it, examples, and anti-patterns.
- `references/default-goal-strategy.md`: lazy-user defaults, unknown-domain discovery, risk classification, and direct-copy output rules.
- `references/interview-checklist.md`: question bank for turning vague tasks into strong goals.
- `scripts/lint_goal_command.py`: lightweight checker for required `/goal` labels, unresolved placeholders, and optional Chinese-first companion sections.
