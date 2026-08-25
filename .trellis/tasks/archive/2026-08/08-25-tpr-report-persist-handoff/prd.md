# trellis-plan-review 审阅报告落盘与交接 Prompt

## Goal

让 `trellis-plan-review` 在审阅结束后，把完整审阅报告按固定模板写入被审项目的 `.trellis/reviews/<task-dir-name>.md`；对话里只给出结论行、报告路径、以及一段可直接复制的交接 Prompt。用户把 Prompt 发给另一个 Agent，该 Agent 根据报告修订 Trellis 规划产物。

## Background

当前 skill 把四段式报告只写进对话。创建时的决定（`.trellis/tasks/archive/2026-08/08-20-trellis-plan-review/prd.md`）：叙述报告只进对话，以免授予写工具后改到被审对象。

现场问题：Grok TUI 的表格不好复制；临场交接句写成「见上一条消息」，下一个 Agent 拿不到报告。

本次改「叙述报告只进对话」，不改「不改写被审对象」。规划产物、产品代码、`task.py start` 仍然禁止。

用户已选定落盘目录：被审项目 `.trellis/reviews/<task-dir-name>.md`。交接 Prompt 允许比一句路径更长，但必须按报告模板结构写清读法和处理规则，正文仍以报告文件为真源。

## Confirmed facts

- skill 路径：`skills/development-workflows/trellis-plan-review/`。`SKILL.md:17` 写 `Change nothing.`；`:23-27` 硬门禁止改规划产物、代码、`task.py start`、产出修订稿；`:83-87` 规定四段式报告在对话中输出。
- `allowed-tools` 当前不含 `Write` / `Edit`。
- `evals/evals.json` 正例断言「Edits nothing」「Does not modify any file」；负例 #7 禁止本 skill 修订规划。本次改为「不改规划产物和代码；报告文件除外」。
- `references/finding-contract.md` 已规定结论行、`TPR-NN` 字段、未能核实、可靠部分、反通胀、盲区声明。落盘模板以该契约为正文，不另造严重度词汇。
- 被审任务可以在另一个仓库。`SKILL.md:35-42`。报告写进被审任务所属项目。
- `scripts/plan_precheck.py:68-72` 的 `find_repo_root()` 从任务目录向上找到含 `.trellis` 的目录。写报告复用该判定。
- 任务归档后目录变为 `.trellis/tasks/archive/YYYY-MM/<dir>`。任务目录名保持不变，因此 `.trellis/reviews/<dir>.md` 在归档后仍能对上。
- 本仓库 `.gitignore` 不忽略 `.trellis/`。skill 不改 `.gitignore`，不 `git add` / commit 报告。
- 相邻先例：`code-auditor` 的 `docs/audits/`（opt-in）；`code-quality-review` 的 `code_review/<feature>/`（opt-in）；`goal-meta-skill` 的 `GOAL.md` + 短启动句。本次默认落盘，启动句指向报告文件。
- `.trellis/spec/backend/governed-file-writing.md` 把目的地限制为仓库根的直接子文件。本次路径在 `.trellis/reviews/` 下，不套用该 SHA 替换合同。
- `.trellis/spec/backend/quality-guidelines.md`「Python Text Stdin On Windows」：skill helper 从 stdin 读文本时先读 raw bytes 再按 UTF-8 解码。
- `scripts/check.py` 校验 frontmatter；改 frontmatter 后必须 `just docs-sync`。
- 调研记录：`research/handoff-prompt-prior-art.md`。要点：文件真源优于消息粘贴；Prompt 规定读序和严重度动作，不复制 TPR 正文；提示项默认不改。

## Requirements

- R1：审阅完成后，完整报告落盘为被审项目内一份 UTF-8、LF 的 Markdown。对话不是报告真源。
- R2：报告正文遵循 finding-contract：结论行、`TPR-NN` 问题清单、未能核实、可靠部分、盲区声明。文件头部元数据：被审任务路径、任务目录名、`task.json.status`、结论、阻断/应修/提示计数、生成时间、skill 名与版本。
- R3：路径固定为被审项目 `<repo-root>/.trellis/reviews/<task-dir-name>.md`。由任务目录推导，不询问用户。同一任务再次审阅覆盖同一文件。
- R4：禁止写入 `prd.md`、`design.md`、`implement.md`、`implement.jsonl`、`check.jsonl`、`task.json`、产品代码。Pass 0 的 `precheck.json` 仍可由现有脚本写出。除此之外只写报告文件。
- R5：对话在审阅成功后只输出：(1) 结论行（含计数）；(2) 报告路径（仓库相对路径，并给出绝对路径）；(3) 一个 `text` code fence，内含完整交接 Prompt。不在对话里复述完整 `TPR-NN` 表。
- R6：交接 Prompt 必须让没有当前对话的 Agent 也能工作。禁止「见上一条消息」「见上方报告」这类指代。Prompt 是填空模板，填入项目根、任务目录、报告路径、结论、计数、任务状态。模板必须覆盖：
  1. 角色与目标：修订该 Trellis 任务的规划产物，不开始实现。
  2. 必读顺序：报告全文 → 任务目录产物 → 每条 TPR 的 Location 原文。问题正文以报告为准。
  3. 结论行动作：`需返回规划` 先处理全部阻断，必要小节可重写；`可执行但需修订` 保留结构，只改被点名条款；`可执行` 时阻断为 0，应修仍要处理，提示可选；问题清单为空则不改规划。
  4. 问题清单一 `TPR-NN`：按 阻断 → 应修 → 提示；先核对 Claim 与 Evidence；在 Route 中选一条落地；不改写严重度。
  5. 未能核实：不当成已证实缺陷；能补核则补核，否则保持未核实。
  6. 可靠部分：不重做、不推翻。
  7. 盲区声明：修订后不声称规划已获批准。
  8. 允许改的文件与禁止项：规划产物可改；产品代码、`task.py start`、审阅报告、范围外改动禁止。提示项默认不改。不重开证据未推翻的产品决定。
  9. 修订方法：精确改被点名处；需求变更则同步 AC 与机制；保持 AC 子句到 R 与机制的追溯。
  10. 完成标准：每个阻断和应修要么已写入产物，要么在规划中写明不处理及理由；对话按 TPR 编号回列处理结果；不运行 `task.py start`。
  11. 报告文件缺失或路径无效：停止，不猜测内容。
- R7：写失败时不落盘；对话说明失败原因与尝试路径；此时才把完整四段式报告输出到对话作为降级；不生成带路径的交接 Prompt。
- R8：更新 `SKILL.md`、finding-contract、交接模板、`agents/interface.yaml`、`evals/evals.json`。`version` 从 `0.1.0` 升到 `0.2.0`。
- R9：不改审阅 pass、不改严重度规则、不改其他 skill、不发布。

## Acceptance Criteria

- [ ] AC1（R1, R3）：对一个带 `prd.md` 的任务跑完 skill 流程后，被审项目存在 `.trellis/reviews/<task-dir-name>.md`，UTF-8 LF。
- [ ] AC2（R2）：该文件含 finding-contract 四段正文和 R2 元数据；结论行取值仍为 `可执行` / `可执行但需修订` / `需返回规划`（或英文对等）。
- [ ] AC3（R3）：对同一任务连续写两次报告，第二次覆盖同一路径，不另生成带时间戳的第二份文件。
- [ ] AC4（R4）：被审任务目录内的 `prd.md` / `design.md` / `implement.md` / `*.jsonl` / `task.json` 无本 skill 写入；产品代码无改动。
- [ ] AC5（R5, R6）：审阅成功后的对话含结论行、报告路径、一个 `text` fence；fence 内是完整交接 Prompt，同时出现任务路径和报告路径；Prompt 含 R6 的 11 条条款；对话主输出没有完整 `TPR-01` 表。
- [ ] AC6（R6）：交接 Prompt 不出现「见上一条消息」「见上方报告」；不把 TPR 正文复制进 Prompt。
- [ ] AC7（R7）：约定目录不可写或根目录无法解析时，不写报告文件，对话说明失败，输出完整四段式报告，且不给出带路径的交接 Prompt。
- [ ] AC8（R8）：`evals/evals.json` 正例改为「写报告文件、不改规划产物、输出可复制交接 Prompt」；保留路由否定（纯 diff → `code-auditor` / `code-quality-review`；写规划 → 非本 skill）。新增一条：用户只要审阅结果时，仍落盘并给出交接 Prompt。
- [ ] AC9（R4, R8）：写入通道不能把规划产物和产品代码列为可写目标。硬门正文为「不改被审对象；报告文件除外」。
- [ ] AC10（R6）：skill 内有交接 Prompt 填空模板（中英各一份）。用示例路径填充后，11 条条款都能在模板正文定位。
- [ ] AC11（R3）：写入 helper 的路径测试：合法任务目录写到 `.trellis/reviews/<name>.md`；`..` / 绝对名 / 规划产物路径被拒绝；覆盖写入成功。
- [ ] AC12（R8, R9）：`just docs-sync` 后 `just ci` 通过；改动范围限于本 skill 目录、本任务目录、以及 frontmatter 引起的 `docs/` 再生成文件。

## Out of scope

- 本 skill 自动修订规划产物。
- 改变 Pass 0–7 判据、严重度规则、或 `case-study-font-picker.md`。
- HTML / JSON 主真源、Basic Memory 笔记、报告索引页、批量审阅。
- 把报告提交进 git、写入 `.gitignore`、改 Trellis runtime。
- 套用 `governed-file-writing.md` 的根直接子文件 + SHA 替换合同。
- 公开发布该 skill。

## Key decisions

- D1：落盘路径为被审项目 `.trellis/reviews/<task-dir-name>.md`。用户 2026-08-25 选定。归档后文件名仍用任务目录名，路径不随 archive 前缀变化。
- D2：同一任务再次审阅覆盖同一文件，不保留历史副本。
- D3：对话默认不复述完整问题表。用户若明确要求贴到对话里，可以追加全文，但仍先落盘并给出交接 Prompt。
- D4：交接 Prompt 为多段填空模板，放在一个 `text` fence 里。报告文件是问题真源；Prompt 只规定怎么读各段、按哪档严重度行动。
- D5：提示项默认不改。阻断必须处理。应修必须处理或在规划中写明不处理及理由。
- D6：写入通道用 skill 自带脚本，目的地限制在 `.trellis/reviews/`。不把通用 `Write` 当作规划产物可写。stdin 按 Windows UTF-8 raw bytes 合同读取。覆盖写入，不做 SHA 替换门。

## Planning status

- artifacts: `prd.md` `design.md` `implement.md`
- 阻塞项：无
- implementation waits for the user to approve this planning summary, then `task.py start`
