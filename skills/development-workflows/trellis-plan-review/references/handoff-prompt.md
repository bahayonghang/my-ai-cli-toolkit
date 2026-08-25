# Handoff prompt template

After the report file is written, fill one language variant and put the result
in a single chat `text` fence. The report file is the source of the findings.
This prompt tells the next agent how to read each section.

## Placeholders

| Token | Value |
| --- | --- |
| `{{repo_root}}` | Absolute repository root |
| `{{task_dir}}` | Absolute task directory |
| `{{task_rel}}` | Task directory relative to the repo root, posix |
| `{{report_path}}` | Absolute report path |
| `{{report_rel}}` | `.trellis/reviews/<task-dir-name>.md` |
| `{{verdict}}` | Verdict line value |
| `{{counts}}` | `阻断 N / 应修 N / 提示 N` or the English equivalent |
| `{{task_status}}` | `task.json.status` |

Do not paste TPR bodies into the prompt. Do not write 见上一条消息, 见上方报告,
"see the previous message", or "see the report above".

## Chinese

```text
请根据审阅报告修订下面这个 Trellis 任务的规划产物。先读文件，再改规划。不要开始实现。

定位
- 项目根：{{repo_root}}
- 任务目录：{{task_dir}}
- 仓库内任务路径：{{task_rel}}
- 审阅报告（问题真源）：{{report_path}}
- 仓库内报告路径：{{report_rel}}
- 报告结论：{{verdict}} — {{counts}}
- 任务状态：{{task_status}}

必读顺序
1. 打开审阅报告全文。
2. 打开任务目录里的 prd.md，以及已经存在的 design.md、implement.md、task.json。
3. 对每条 TPR，打开其 Location 指出的原文，并核对其 Evidence。
问题正文以报告为准。不要根据本 Prompt 猜测具体缺陷。

按报告结构处理
1. 结论行
   - 需返回规划：先处理全部「阻断」。规划结构可以重写必要小节。
   - 可执行但需修订：保留现有结构，只改被点名的条款。
   - 可执行：「阻断」为 0。「应修」仍要处理。「提示」可选。
   - 问题清单为空：不要改规划产物。
2. 问题清单 TPR-NN
   - 顺序：阻断 → 应修 → 提示。
   - 每条先核对 Claim 与 Evidence，再在 Route 列出的路径中选一条落地。
   - 不要另起 Route 未给出的产品方案。Route 不够用时停止并说明。
   - 引用 TPR 编号。不要改写严重度。
3. 未能核实
   - 不要把未核实项当成已证实缺陷来改。
   - 本机能补核的先补核。仍不能核的，保持未核实，必要时在规划里标明。
4. 可靠部分
   - 不要重做，不要推翻。
5. 盲区声明
   - 报告是待分诊列表，不是批准。修订后不要声称规划已获批准或可以开始实现。

写入范围
- 可改：prd.md、design.md、implement.md、implement.jsonl、check.jsonl。task.json 仅在报告指出其字段问题时改对应字段。
- 禁止：产品代码；运行 task.py start / finish / archive；修改审阅报告；扩大范围；把「提示」当成必须修改；重开规划已记录且证据未被推翻的产品决定。

修订方法
- 只改被点名处，不要整份重写。
- 需求变更时同步验收标准与设计机制。
- 每条被改到的 AC 子句仍能追溯到一条 R 和一处机制。

完成标准
- 每个「阻断」和「应修」：已写入规划产物，或在规划中写明不处理及理由。
- 对话按 TPR 编号列出：处理了什么，或为何不处理。
- 不要运行 task.py start。
- 报告文件缺失或无法打开：停止，不要猜测报告内容。
```

## English

```text
Revise the Trellis planning artifacts for this task using the review report. Read the files first. Do not start implementation.

Location
- Repository root: {{repo_root}}
- Task directory: {{task_dir}}
- Task path in the repo: {{task_rel}}
- Review report (source of findings): {{report_path}}
- Report path in the repo: {{report_rel}}
- Verdict: {{verdict}} — {{counts}}
- Task status: {{task_status}}

Read in this order
1. The full review report.
2. prd.md in the task directory, plus design.md, implement.md, and task.json when they exist.
3. For each TPR, the Location text and the Evidence it cites.
Treat the report file as the source of each finding. Do not invent defects from this prompt.

How to use each report section
1. Verdict
   - Return to planning: fix every blocking finding first. Rewrite structural sections when the report requires it.
   - Ready after revision: keep the current structure. Edit only the named clauses.
   - Ready: blocking count is 0. Still handle should-fix items. Notes are optional.
   - Empty findings list: do not edit planning artifacts.
2. Findings TPR-NN
   - Order: blocking, then should-fix, then notes.
   - Check Claim and Evidence, then take one path from Route.
   - Do not invent a product option that Route does not list. Stop and explain if Route is insufficient.
   - Cite TPR ids. Do not change severity.
3. Unverified list
   - Do not treat an unverified item as a proven defect.
   - Verify it when this session can. If it stays unverified, leave it so, and record that in the plan when needed.
4. Sound parts
   - Do not redo them. Do not reverse them.
5. Disclosure
   - The report is a triage list, not an approval. After the edit, do not claim the plan is approved or ready to implement.

Write scope
- Allowed: prd.md, design.md, implement.md, implement.jsonl, check.jsonl. Edit task.json only when the report names a field there.
- Forbidden: product code; task.py start / finish / archive; editing the review report; widening scope; treating notes as required; reopening a product decision the plan already recorded unless evidence overturned it.

Revision method
- Edit the named places. Do not rewrite whole files.
- When a requirement changes, update the matching criteria and mechanisms.
- Every edited AC clause still traces to one requirement and one mechanism.

Done when
- Every blocking and should-fix finding is in the artifacts, or the plan records why it is not addressed.
- The chat lists each TPR id with what changed, or why it did not.
- Do not run task.py start.
- If the report file is missing or unreadable, stop. Do not guess its contents.
```
