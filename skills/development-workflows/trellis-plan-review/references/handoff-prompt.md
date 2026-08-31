# Handoff prompt template

After the report file is written, fill one language variant and put the result
in a single chat `text` fence. The report file is the source of the findings.
This prompt tells the next agent how to read each section.

## Placeholders

| Token | Value |
| --- | --- |
| `{{repo_root}}` | Absolute repository root |
| `{{root_task_dir}}` | Absolute root task directory |
| `{{root_task_rel}}` | Root task directory relative to the repo root, posix |
| `{{root_task_name}}` | Root task basename |
| `{{review_scope}}` | `single-task` or `task-tree` |
| `{{task_count}}` | Number of members in the resolved scope |
| `{{task_members}}` | Root-first member list with repo-relative task paths |
| `{{task_statuses}}` | Member-to-status list in the same order |
| `{{report_path}}` | Absolute combined report path |
| `{{report_rel}}` | `.trellis/reviews/<root-task-name>.md` |
| `{{verdict}}` | Verdict line value |
| `{{counts}}` | `阻断 N / 应修 N / 提示 N` or the English equivalent |

Do not paste TPR bodies into the prompt. Do not write 见上一条消息, 见上方报告,
"see the previous message", or "see the report above".

## Chinese

```text
请根据一份合并审阅报告修订下面这个 Trellis 审阅作用域的规划产物。该作用域可能包含根任务及其递归子任务。先读文件，再改规划。不要开始实现。

定位
- 项目根：{{repo_root}}
- 根任务：{{root_task_name}}
- 根任务目录：{{root_task_dir}}
- 仓库内根任务路径：{{root_task_rel}}
- 审阅模式：{{review_scope}}
- 任务数量：{{task_count}}
- 有序成员（根优先；顺序不代表依赖）：
{{task_members}}
- 成员状态：
{{task_statuses}}
- 审阅报告（问题真源）：{{report_path}}
- 仓库内报告路径：{{report_rel}}
- 报告结论：{{verdict}} — {{counts}}

必读顺序
1. 打开审阅报告全文。
2. 按成员清单打开每个任务的 task.json、prd.md，以及已经存在的 design.md、implement.md 和 jsonl 清单。
3. 对每条 TPR，按 Task、Affected tasks 和 Location 打开所有被点名原文，并核对其 Evidence。
问题正文以报告为准。不要根据本 Prompt 猜测具体缺陷。

按报告结构处理
1. 结论行
   - 需返回规划：先处理全部「阻断」。规划结构可以重写必要小节。
   - 可执行但需修订：保留现有结构，只改被点名的条款。
   - 可执行：「阻断」为 0。「应修」仍要处理。「提示」可选。
   - 问题清单为空：不要改规划产物。
2. 问题清单 TPR-NN
   - 顺序：阻断 → 应修 → 提示。
   - 每条先核对 Claim 与 Evidence。Route 只有一条可执行路径时直接落地。Route 列出互斥产品选项时列入确认门，不要自行选定。
   - 同一个 TPR 点名多个 Affected tasks / Location 时，必须在同一轮同步修订全部点位，不能只修父任务或一个子任务。
   - 不要另起 Route 未给出的产品方案。Route 不够用时停止并说明。
   - 引用 TPR 编号。不要改写严重度。
3. 未能核实
   - 不要把未核实项当成已证实缺陷来改。
   - 本机能补核的先补核。仍不能核的，保持未核实，必要时在规划里标明。
4. 可靠部分
   - 不要重做，不要推翻。
5. 盲区声明
   - 报告是待分诊列表，不是批准。修订后不要声称规划已获批准，也不要在本会话开始实现。本轮结束后规划应可被一次后续实施请求直接执行。

写入范围
- 可改：成员清单中各任务的 prd.md、design.md、implement.md、implement.jsonl、check.jsonl。task.json 仅在报告指出其字段问题时改对应字段。
- 禁止：产品代码；运行 task.py start / finish / archive；修改审阅报告；扩大范围；把「提示」当成必须修改；重开规划已记录且证据未被推翻的产品决定。

修订方法
- 只改被点名处，不要整份重写。
- 需求变更时同步验收标准与设计机制。
- 每条被改到的 AC 子句仍能追溯到一条 R 和一处机制。

确认门
- 先把剩余阻塞项分成三类：仓库可回答事实、已批准范围内的实现判断、用户所有且会改变范围/产品语义/风险/成本/授权的确认项（含 TPR Route 里互斥的产品选项，以及本轮修订新引入的 start 前门）。
- 第三类仍存在时，必须在继续写规划前用宿主结构化问题工具一次收口（最多 4 题）：Claude Code 使用 AskUserQuestion；Oh My Pi 使用 ask；Codex 使用实际可用的 request_user_input 或当前等价名；无工具则问一个简短编号题。每题带推荐项与互斥选项。先确认实际工具名，不得把未拥有的工具写成可调用 API。
- 禁止把确认清单只写进聊天并等待用户提醒「请使用 AskUserQuestion」。无第三类项时不得仪式性提问。仓库可回答事实与普通实现细节不得提问。
- 回答后在同一轮写入被决定条款，并处理全部「阻断」和「应修」。不要再开一轮等人提醒后才完善规划。若写回后又出现新的第三类项，可以再来一轮结构化提问（仍 ≤4），但不得退回聊天罗列。
- 仍禁止运行 task.py start / finish / archive。本轮结束后规划应可被一次后续实施请求直接执行。

完成标准
- 每个「阻断」和「应修」：已写入规划产物，或在规划中写明不处理及理由。
- 用户所有确认项已用结构化工具一次收口并写回，或无第三类项故未提问。禁止把确认清单只写进聊天等待提醒。
- 对话按 TPR 编号列出：处理了什么，或为何不处理。
- 整个作用域只返回这一份修订结果；不要为每个子任务再生成报告或 handoff Prompt。
- 不要运行 task.py start。
- 报告文件缺失或无法打开：停止，不要猜测报告内容。
```

## English

```text
Revise the Trellis planning artifacts for this review scope using one combined report. The scope may contain a root task and recursive children. Read the files first. Do not start implementation.

Location
- Repository root: {{repo_root}}
- Root task: {{root_task_name}}
- Root task directory: {{root_task_dir}}
- Root task path in the repo: {{root_task_rel}}
- Review mode: {{review_scope}}
- Task count: {{task_count}}
- Ordered members (root first; order is not dependency):
{{task_members}}
- Member statuses:
{{task_statuses}}
- Combined review report (source of findings): {{report_path}}
- Report path in the repo: {{report_rel}}
- Verdict: {{verdict}} — {{counts}}

Read in this order
1. The full review report.
2. For every listed member, task.json and prd.md, plus design.md, implement.md, and the jsonl manifests when they exist.
3. For each TPR, every source named by Task, Affected tasks, and Location, plus the cited Evidence.
Treat the report file as the source of each finding. Do not invent defects from this prompt.

How to use each report section
1. Verdict
   - Return to planning: fix every blocking finding first. Rewrite structural sections when the report requires it.
   - Ready after revision: keep the current structure. Edit only the named clauses.
   - Ready: blocking count is 0. Still handle should-fix items. Notes are optional.
   - Empty findings list: do not edit planning artifacts.
2. Findings TPR-NN
   - Order: blocking, then should-fix, then notes.
   - Check Claim and Evidence. Take a unique Route immediately. Mutually exclusive product options in Route are class-3 items for the confirmation gate; do not pick them yourself.
   - When one TPR names multiple Affected tasks or Locations, revise all of them in the same pass; do not repair only the parent or one child.
   - Do not invent a product option that Route does not list. Stop and explain if Route is insufficient.
   - Cite TPR ids. Do not change severity.
3. Unverified list
   - Do not treat an unverified item as a proven defect.
   - Verify it when this session can. If it stays unverified, leave it so, and record that in the plan when needed.
4. Sound parts
   - Do not redo them. Do not reverse them.
5. Disclosure
   - The report is a triage list, not an approval. After the edit, do not claim the plan is approved and do not start implementation in this session. Leave the plan ready for a later implementation request.

Write scope
- Allowed: prd.md, design.md, implement.md, implement.jsonl, and check.jsonl in the listed member directories. Edit task.json only when the report names a field there.
- Forbidden: product code; task.py start / finish / archive; editing the review report; widening scope; treating notes as required; reopening a product decision the plan already recorded unless evidence overturned it.

Revision method
- Edit the named places. Do not rewrite whole files.
- When a requirement changes, update the matching criteria and mechanisms.
- Every edited AC clause still traces to one requirement and one mechanism.

Confirmation gate
- Classify remaining blockers: repository-answerable facts, implementation choices inside approved contracts, and user-owned decisions that change scope, product semantics, risk, cost, or authorization (including mutually exclusive TPR Route options and start-front items this revision introduced).
- If any third-class item remains, you must call the host structured question tool once before writing further planning artifacts (at most 4 questions): Claude Code uses AskUserQuestion; Oh My Pi uses ask; Codex uses the live request_user_input or current equivalent; if none, ask one concise numbered question. Each question has a recommended option and mutually exclusive choices. Confirm the live tool name; do not write a tool you do not have as a callable API.
- Do not dump a confirmation list and wait for the user to type "please use AskUserQuestion". Do not ask ceremonially when no third-class item remains. Do not ask about repository-answerable facts or ordinary implementation details.
- After answers, write the decided clauses in the same turn and handle every blocking and should-fix finding. Do not open another reminder round to finish the plan. If write-back creates new third-class items, run one more structured batch (still ≤4); never dump a list.
- Still do not run task.py start / finish / archive. When this session ends, the plan must be ready for a later implementation request.

Done when
- Every blocking and should-fix finding is in the artifacts, or the plan records why it is not addressed.
- User-owned confirmations were closed with the structured tool and written back, or no third-class item remained so no question ran. Do not dump a confirmation list and wait.
- The chat lists each TPR id with what changed, or why it did not.
- Return one revision result for the whole scope; do not generate another report or handoff Prompt per child.
- Do not run task.py start.
- If the report file is missing or unreadable, stop. Do not guess its contents.
```
