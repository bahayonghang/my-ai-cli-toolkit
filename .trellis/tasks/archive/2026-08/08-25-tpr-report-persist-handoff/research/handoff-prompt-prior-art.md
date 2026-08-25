# 交接 Prompt 调研（2026-08-25）

## 问题

审阅报告落盘之后，对话里要给出一段可复制 Prompt，发给**另一个没有当前对话的 Agent**。该 Agent 根据报告修订 Trellis 规划产物。Prompt 需要和报告模板的四段结构对齐，并且可以比一句路径更长。

## 查询

1. LLM agent handoff：先读文件再行动，不要依赖上一条消息
2. Review comments triage：blocking / should-fix / nit 分别怎么处理
3. Anthropic context engineering：路径当索引，不要把长文塞进 Prompt
4. Spec 修订：按反馈精确改 PRD/design/tasks，不重写整份规划

## 来源

| 来源 | 机制 | 对本任务 |
| --- | --- | --- |
| Anthropic *Effective context engineering*（2025-09-29） | 上下文是有限注意力；用文件路径做 just-in-time 索引，不要把整份材料预装进 Prompt | **adapt**：Prompt 只给路径和读序，问题正文留在报告文件 |
| Anthropic prompting best practices | 编号步骤；先打开文件再下结论；约束写清楚 | **adapt**：Prompt 用编号步骤 |
| AI Tools Guidebook *Multi-Agent Handoff Prompts*（2026-05-19） | 交接合同四件：生产者产出形状、消费者必读、明确不做、形状不对就 STOP。文件交接优于消息交接 | **adapt**：必读报告+任务目录；禁止实现；报告缺失则停止 |
| davidondrej `agent-orchestration/handoff` | Reference, don't duplicate。交接写在一个 code fence 里。指向已有产物，不粘贴全文 | **adapt**：fence 可复制；不把 TPR 正文复制进 Prompt |
| formin/multi-model-review `apply-review.md` | 消费 `review-report.md`：按模板解析 verdict/severity/location/suggested_fix；先核对再改 | **adapt**：按 finding-contract 字段消费。**reject**：再向用户逐条确认（用户发这段 Prompt 就是授权修订规划） |
| ccmagic `pr-feedback` triage-guide | must-fix / should-fix / style；style 仅在约定一致时才改 | **adapt**：阻断必须改；应修必须处理；提示默认不改 |
| tollens `code-review-apply-feedback` | Issue/Blocker 要处理但不是盲改；Nit 单独权衡 | **adapt**：Route 里选一条落地，不另起产品方案 |
| longcipher pb-spec `pb-refine.prompt.md` | 精确改被点名处；需求→设计→任务级联；不改产品代码；不重跑整轮规划 | **adapt**：prd → design → implement 级联；禁止 `task.py start` |
| hatch3r product-spec | 审阅者不写规划；每条 AC 必须可测且能追溯 | **adapt**：修订后仍保持「AC 子句 → R → 机制」 |
| goal-meta-skill `GOAL.md` 启动句 | `First read and follow <file>`，合同在文件里，启动句很短 | **adapt**：启动句指向报告。**reject**：把交接做成项目根 `GOAL.md`（用户要的是 `.trellis/reviews/` 报告 + 对话 fence） |
| CellCog 16 字段交接包 | 身份、范围、决策、证据、停止条件、验收 | **adapt** 精简子集。**reject** 整包 16 字段（复制成本高，且报告文件已有证据） |

## 报告模板 → Prompt 条款对照

`references/finding-contract.md` 的四段加头部元数据，对应交接 Agent 的动作：

| 报告段落 | 字段 | 交接 Agent 应做 | 不应做 |
| --- | --- | --- | --- |
| 头部元数据 | 任务路径、status、结论、计数 | 先打开报告和任务目录 | 猜任务位置 |
| 1. 结论行 | 可执行 / 可执行但需修订 / 需返回规划 | 按结论选择修订深度 | 把「可执行」当成「可以开始写代码」 |
| 2. 问题 `TPR-NN` | Severity, Location, Claim, Evidence, Impact, Route | 按 阻断→应修→提示 处理；先核对 Claim/Evidence；在 Route 中选一条 | 把提示当必须改；改写严重度；无视 Route 另起方案 |
| 3. 未能核实 | 断言 + 未核原因 | 能补核则补核；仍不能核则保持未核实 | 把未核实项当成已证实缺陷 |
| 4. 可靠部分 | 已通过的检查 | 保留，不重做 | 为了「看起来改得多」而重写这些部分 |
| 盲区声明 | 待分诊，不是批准 | 改完后不声称规划已获批准 | 用干净报告当 `task.py start` 许可 |

## 合成

- **keep**：finding-contract 字段与三档严重度；审阅 skill 不自己改规划。
- **adapt**：文件真源 + 必读顺序 + 严重度动作表 + 级联精确修订 + 复制用 code fence。
- **reject**：消息内嵌全文；「见上一条消息」；逐条再确认；GOAL.md 根合同；16 字段企业交接包。
- **invent**：把上述条款收成一份填空模板，占位符只有路径、结论、计数、任务状态。

## 缺证据

- 没有在 Grok TUI 上实测「多段 text fence」的一键复制成功率（假设：无表格的 fence 可复制）。
- 没有跨 Agent 实测「只给路径、不给 TPR 摘要」是否导致漏改。缓解：Prompt 强制按 TPR 编号逐条处理，并要求完成时回列编号。
