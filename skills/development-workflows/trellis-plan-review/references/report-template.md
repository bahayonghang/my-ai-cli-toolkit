# Report file template

Write the on-disk review as UTF-8 LF Markdown at
`<repo-root>/.trellis/reviews/<root-task-name>.md`. Match the request language.
Keep YAML keys, file paths, identifiers, and TPR ids exact.

```markdown
---
skill: trellis-plan-review
version: 0.5.0
task_dir: ROOT_TASK_DIR_ABSOLUTE
task_name: ROOT_TASK_NAME
task_status: ROOT_TASK_STATUS
review_scope: REVIEW_SCOPE_MODE
task_count: N
task_members:
  - ROOT_TASK_NAME
  - CHILD_TASK_NAME
task_statuses:
  ROOT_TASK_NAME: ROOT_TASK_STATUS
  CHILD_TASK_NAME: CHILD_TASK_STATUS
verdict: VERDICT
blocking: N
should_fix: N
notes: N
generated_at: ISO-8601
---

# Trellis 规划审阅报告

## 审阅范围

- 根任务：ROOT_TASK_NAME
- 模式：REVIEW_SCOPE_MODE
- 任务数量：N
- 有序成员（根优先；顺序不代表依赖）：
  - ROOT_TASK_NAME — ROOT_TASK_STATUS
  - CHILD_TASK_NAME — CHILD_TASK_STATUS

## 结论

VERDICT — 阻断 N / 应修 N / 提示 N

## 问题清单

### TPR-01 · SEVERITY · SHORT TITLE

- Task:
- Affected tasks:
- Location:
- Claim:
- Evidence:
- Impact:
- Route:

## 未能核实

- CLAIM — REASON

## 可靠部分

- ITEM

## 盲区

An agent reviewing an agent's plan is not an independent second opinion. The reviewer and the
author share most of the same blind spots. A clean report means "this pass found nothing", not
"the plan is complete". Treat the findings as a triage list, not as an approval.
```

Remove unused member placeholder rows; a leaf retains only its root row and uses
`review_scope: single-task`, `task_count: 1`. When a section has no entries, keep the heading and
write `无` (or `None` in English).
Verdict values: `可执行` / `可执行但需修订` / `需返回规划`, or `Ready` / `Ready after revision` / `Return to planning`.
Verdict counts are the deduplicated whole-scope counts. Finding fields and severity rules:
`finding-contract.md`.
