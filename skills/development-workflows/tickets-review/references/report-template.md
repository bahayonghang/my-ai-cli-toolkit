# Report File Template

将本地审阅报告以 UTF-8 LF（无 BOM、无行尾空格）写入 `reports/tickets-review/<scope-slug>.md`。保持 YAML 键名、仓库相对路径、`TKR-NN` 编号与章节标题准确，**严禁写入含本机用户名的绝对路径**。

```markdown
---
skill: tickets-review
version: 0.1.0
tracker: TRACKER_MODE
target: REPO_SLUG_OR_LOCAL_DIR
scope_mode: SCOPE_MODE
scope_slug: SCOPE_SLUG
ticket_count: N
tickets:
  - "#63"
  - "#64"
verdict: VERDICT
blocking: N
should_fix: N
notes: N
base_commit: HEAD_SHORT_SHA
generated_at: ISO-8601
---

# Tickets 审阅报告

## 审阅范围

- 追踪器：TRACKER_MODE（`TARGET`）
- 作用域模式：SCOPE_MODE（`SCOPE_SLUG`）
- 基线提交：`HEAD_SHORT_SHA`
- 票据总数：N（开放 PR：M）
- 成员总览：
  - `#63`（open · labels: ... · sub-issues: 5 · blocked-by: 0）— TITLE
  - `#64`（open · labels: ... · blocked-by: 0）— TITLE

## 结论

VERDICT — 阻断 N / 应修 N / 提示 N

## 问题清单

### TKR-01 · 阻断 · SHORT TITLE

- Owner:
- Affected tickets:
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

AI Agent 审阅由 Agent 或团队撰写的 tickets 并非独立的人类评审；审阅者与起草者可能共享相似盲区。零发现仅代表本轮代码核对未发现矛盾，不等于需求完备或已获批准。请将本报告作为修订分诊清单，而非最终签收。
```

## 填写规则

1. 若 `问题清单`、`未能核实` 或 `可靠部分` 为空，保留二级标题并在下方写 `无`（英文报告写 `None`）。
2. `verdict` 取值：`可执行` / `可执行但需修订` / `需返回规划`（英文：`Ready` / `Ready after revision` / `Return to planning`）。
3. `Evidence` 中的文件路径一律写仓库相对路径加行号（如 `scripts/build_catalog.py:946-960`），不写本机绝对路径。
4. 英文报告对应一级/二级标题：`# Tickets Review Report`、`## Review Scope`、`## Verdict`、`## Findings`、`## Unverified`、`## Sound Parts`、`## Blind Spots`。
