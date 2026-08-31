# Design: plan-review 交接的 AskUserQuestion 一次收口门

## 1. Boundary

只改 `skills/development-workflows/trellis-plan-review`、由其 `just docs-sync` 生成的 docs、以及本任务工件。

- 审阅者仍 compile-review → 写报告 → 发出交接围栏 → 停止。不提问、不改规划、不 start。
- 交接文本要求：**修订者**在用户粘贴/继续执行该 Prompt 之后调用宿主提问工具并写回。
- `08-31-goal-meta-ask-confirm` 仍拥有「修订后开工」的 `/goal` 路径。本包交接继续禁止 start。
- 不改 Pass 0–7、`plan_precheck.py`、`write_review_report.py` 行为，除非实施证明报告模板 version 字段必须由脚本写入（当前 version 在 `report-template.md`，脚本未硬编码 `0.4.0`）。

## 2. Change list

| Path | Planned change |
| --- | --- |
| `SKILL.md` | version `0.5.0`；交接节加最短指针：围栏合同含修订者确认门；审阅者仍不提问、不修规划 |
| `references/revision-question-gate.md` | **新建**权威：分类、正向调用、≤4 批次、写回、禁止 start、宿主表、dump-forbidden、负向门 |
| `references/handoff-prompt.md` | 中英文模板加入确认门语义簇（见 `research/target-handoff-clause.md`） |
| `references/finding-contract.md` | 如需要，注明 Route 仍给选项；提问与写回属于交接修订者，不属于报告 |
| `references/report-template.md` | YAML `version: 0.5.0` |
| `agents/interface.yaml` | short_description / default_prompt 点出交接含确认门；审阅者仍只读 |
| `evals/evals.json` | 现有 1–10 保留；追加 id 11 截图同构、id 12 近邻负例 |
| `tests/tree-review-contract.test.mjs` | 版本 `0.5.0`；交接模板关键词簇；evals id 长度 12 |
| generated `docs/` | 仅 `just docs-sync` |

不改：`scripts/plan_precheck.py`、`scripts/write_review_report.py`、`allowed-tools`、frontmatter `description`（默认）。

## 3. Authoritative ownership

| Concern | Owner |
| --- | --- |
| 修订者确认门（分类、批次、写回、dump-forbidden、宿主名） | `references/revision-question-gate.md` |
| 可复制 Prompt 正文 | `references/handoff-prompt.md` |
| 审阅者硬门与聊天契约 | `SKILL.md` |
| 报告 Route ≠ 产品决定 | `references/finding-contract.md` |
| fail-closed | `tests/tree-review-contract.test.mjs` |
| 行为 fixture | `evals/evals.json` |

## 4. Two roles

```text
REVIEWER (this skill)
  Pass 0-7 -> one report -> one fenced handoff -> STOP
  never AskUserQuestion, never edit plans, never task.py start

REVISER (handoff consumer, not this skill)
  READ report + artifacts
  CLASSIFY remaining items
  -> if user-owned blockers: QUESTION_BATCH (<=4, host tool) then WRITE_BACK
  APPLY all blocking + should-fix TPR (unique routes need no question)
  -> if new user-owned blockers appeared: QUESTION_BATCH again, never dump-and-wait
  STOP_REPORT (plan implementation-ready; no task.py start)
```

`CLASSIFY` 三类与 08-31 / review-remediation 相同。TPR `Route` 列出互斥产品选项时，选项属于第三类。仓库能核的技术事实不准问。

## 5. Host tool names

交接文本按修订者将运行的宿主书写，但模板必须同时点名 Claude `AskUserQuestion` 与「其他宿主使用实际可用等价 / 无工具则一个简短编号题」，以便合同测试与跨平台安装。

| Platform | Structured tool in generated text |
| --- | --- |
| Claude Code | `AskUserQuestion` |
| Oh My Pi | `ask` |
| Codex | `request_user_input` if that is the actual host tool, else the live equivalent; never invent |
| Grok / Kimi / unknown | actual available equivalent; if none, one concise numbered question |

修订者必须先确认实际工具名，不得把 Claude 工具名写进其他平台当可调用 API。

## 6. SKILL.md pointer (shortest)

在 §5 Persist / 交接成功契约附近加一句：

> The fenced handoff is the reviser's contract and includes a structured confirmation gate (`references/revision-question-gate.md`). This skill's agent still does not ask, edit planning artifacts, or start the task.

Routing §6 保持：写/修/执行规划不是本 skill。

## 7. Eval design

Deterministic tests:

- 交接中英文均含 AskUserQuestion、一次收口、dump-forbidden、写回、禁止 start、负向排除。
- 删除正向义务或恢复「清单写在聊天里等用户说请使用 AskUserQuestion」失败。
- version `0.5.0` 出现在 SKILL.md、report-template、测试。
- evals ids `1..12`。

`evals/evals.json`:

- id 11 截图同构：审阅规划后，交接要求修订者对剩余用户确认项用 AskUserQuestion 一次收口并写回，且不 start。
- id 12 近邻负例：当前会话「现在就用 AskUserQuestion 问我确认项然后开工」且无 Trellis 规划审阅对象 → 不触发本 skill。

不改 `description`，除非实施时证明路由漏审阅自然语言。

## 8. Compatibility and rollback

- 行为变化仅交接修订者合同与 version；Pass 逻辑、报告结构、审阅者权限不变。
- 回滚单位：目标包 + docs-sync 产物 + 本任务目录。
- 不触碰 `goal-meta-skill` 与 `08-31-goal-meta-ask-confirm`。

## 9. 已考虑不做

- 不给审阅者扩权或让审阅者改规划。
- 不把 brainstorm 的「每消息一题」写进交接。
- 不在交接里加入「批准规划并开工」授权 start。
- 不新增 README/manifest。
- 不把截图项目的 routing/ResiWatch 决策做成通用规则。
