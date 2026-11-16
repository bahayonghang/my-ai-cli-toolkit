# design.md — goal-meta-skill Trellis 节奏与终稿展示

## Architecture and boundaries

Change only `skills/developer-tools-integrations/goal-meta-skill/` plus catalog
refresh via `just docs-sync`. Do not edit Trellis runtime, git-commit, or
finish-work.

Split of concerns:

| Layer | Owner | Content |
| --- | --- | --- |
| Trigger + shortest flow | `SKILL.md` | When to inject Trellis cadence; S4/S6 display one-liners; pointer to references |
| Cadence judgment | new `references/trellis-goal-cadence.md` | Detection, commit-then-archive, parent/发布门, pause text |
| Display judgment | `references/default-goal-strategy.md` Finalization Rule + `references/goal-command-playbook.md` bilingual draft strategy | Dual-layer S4/S6 shape |
| Interview shape | `references/interview-checklist.md` Phase B / 中文输出形状 | Fence + 字段一览 |
| Deterministic checks | existing `scripts/lint_goal_command.py` | Keep blank-line terminator and companion titles. Do not hard-require 字段一览 |
| Regression | `evals/evals.json`, `tests/lint-goal-command.test.mjs` | New behavior fixtures; existing lint tests stay green |

Qiaomu generalization: Trellis cadence is an optional adapter. Display
dual-layer is a core output-contract change for S6 (and S4 copy fences).

## Detection

Inject the adapter when any of these hold:

1. The user names Trellis task implementation, a child task, or a
   `.trellis/tasks/<dir>` path.
2. Recon finds `.trellis/workflow.md` or `.trellis/tasks/` and the stated
   outcome is to execute that task tree.

Do not inject when `.trellis/` is merely present and the outcome is an
ordinary code/doc change.

If detection is uncertain, ask at most one numbered choice in 可选调整
(`注入 Trellis 提交归档节奏：A 是（默认，当 outcome 是实施任务时） / B 否`)
instead of a new interview round. Fast-path `直接给` still uses the
conservative default: inject only when the outcome text already says
Trellis task implementation.

## Contracts written into the `/goal`

When injected, encode in 迭代策略 and 完成条件 (English: Iteration policy
and Stop when):

1. Finish one independently verifiable Trellis task.
2. Commit that task's related product files (Conventional Commits, no
   push, no amend).
3. Then run `python ./.trellis/scripts/task.py archive <task-dir>`.
4. Repeat for the next child. Do not archive the parent until the 发布门
   in this same contract has passed and every child is archived.

Pause if / 暂停条件 must include: dirty files outside the task scope;
archive auto-commit failure; a parent still has active children.

Claude Code: keep stop-and-report wording and a turn/time bounding clause.
Do not recommend `/goal pause`.

File-pointer goals (`.planning/goal-<slug>.md`) put the cadence in the
file's Contract section; the short `/goal` points at Verification and
Stop/Pause in that file.

## Display dual-layer

S4 (Chinese-first). Skill docs that nest these examples use a four-backtick
outer fence (`skill-authoring-conventions.md`).

````markdown
推荐执行版（中文，可直接复制）

```text
/goal ...
验证：...
暂停条件：...
```

默认选择理由：...
可选调整
...
你可以直接回复：...

Goal Draft (English-compatible)

```text
/goal ...
```
````

The companion titles stay exact strings for `lint_chinese_companion`.

S6 after confirmation:

````markdown
最终可复制 /goal

```text
/goal ...
```

字段一览
1. 目标结果：...
2. 验证：...
3. 约束：...
4. 边界：...
5. 迭代策略：...
6. 完成条件：...
7. 暂停条件：...
8. Trellis 节奏：（仅注入时）先提交该任务相关改动，再 archive；父任务等到发布门。
````

Do not put blank lines inside the copy fence. Do not put 字段一览 inside
the `/goal` body. After S6, do not repeat the full 可选调整 questionnaire
unless the user asks.

## Compatibility

- Keep `allowed-tools` exactly as today. The skill still only drafts.
- Keep placeholder and 4,000-character lint behavior.
- `evals.json` id 1 still requires the output to start with
  `推荐执行版（中文，可直接复制）` before explanation. The new fence sits
  *after* that title, so id 1 remains valid.
- Version 0.4.0. `just docs-sync` if frontmatter/description changes.
  Add Trellis / 归档 / 终稿展示 trigger phrases to `description` only if
  they fit in 1024 characters without angle brackets.

## Tradeoffs

- Dual-layer vs packing headings into the `/goal` body: headings-in-body
  either add blank lines (truncate lint/paste) or remain unscannable.
  Dual-layer keeps the paste contract and gives humans a field map.
- Hard-linting 字段一览: presentation, not `/goal` grammar. Enforce via
  evals, not the linter, so English-only drafts stay valid.
- Encoding Trellis Phase 3.4's human commit-plan confirmation: unattended
  `/goal` cannot wait on `ok` / `行`. The contract requires task-scoped
  commits and a pause/stop-and-report on out-of-scope dirty files. Host
  confirmation, when the executing agent still uses it, remains allowed;
  it is not a required phrase in every goal.

## Rollback

Revert the skill-directory diff and any `docs/` catalog files produced by
`just docs-sync`. No runtime Trellis state is modified by this task.
