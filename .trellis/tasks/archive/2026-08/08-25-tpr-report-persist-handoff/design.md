# 技术设计：审阅报告落盘与交接 Prompt

## 边界

改动只在 `skills/development-workflows/trellis-plan-review/`，外加 `just docs-sync` 生成的 `docs/` 目录页。不改 Trellis runtime，不改其他 skill。

审阅 Pass 0–7 与严重度规则保持原状。新增的是：报告落盘、路径受限写入、对话输出改为结论 + 可复制交接 Prompt。

## 交付清单

| 路径（相对 skill 根） | 内容 | AC |
| --- | --- | --- |
| `SKILL.md` | 硬门改为「不改被审对象；报告文件除外」；步骤 4 改为落盘 + 对话输出；`version` 0.2.0；`description` 补「保存报告与可复制交接 Prompt」 | AC5 AC8 AC9 AC12 |
| `references/finding-contract.md` | 增加「落盘位置」与「对话输出」两小节，指向模板 | AC2 AC5 |
| `references/report-template.md` | 落盘 Markdown 骨架 | AC1 AC2 |
| `references/handoff-prompt.md` | 中英填空模板与占位符表 | AC5 AC6 AC10 |
| `scripts/write_review_report.py` | 路径受限写入 `.trellis/reviews/<task-dir-name>.md` | AC1 AC3 AC7 AC11 |
| `tests/write-review-report.test.mjs` | 路径、覆盖、拒绝逃逸、UTF-8 LF | AC3 AC11 |
| `evals/evals.json` | 正例与新增「只要结果仍落盘」；「Edits nothing」改为报告除外 | AC8 |
| `agents/interface.yaml` | `default_prompt` 补落盘与交接 Prompt | AC8 |

`docs/` 由 `just docs-sync` 再生成。

## 路径与根目录

复用 `plan_precheck.find_repo_root(task_dir)`：从任务目录向上找到含 `.trellis` 的目录，记为 `repo_root`。

```text
dest = repo_root / ".trellis" / "reviews" / (task_dir.name + ".md")
```

约束：

- `task_dir.name` 不得含路径分隔符、`.`、`..`。任务目录名由 Trellis `MM-DD-slug` 产生，已满足。
- `dest.resolve()` 必须位于 `(repo_root / ".trellis" / "reviews").resolve()` 之下。
- 目的地或其父目录若是 symlink / reparse point，拒绝。
- 创建缺失的 `reviews/` 目录。
- 覆盖已有同名文件。
- `--repo-root` 可覆盖自动探测，必须是含 `.trellis` 的目录。

归档任务示例：`task_dir` 为 `.trellis/tasks/archive/2026-08/08-20-foo` 时，`task_dir.name` 仍是 `08-20-foo`，报告仍写到 `.trellis/reviews/08-20-foo.md`。

`task_dir` 必须位于该 `repo_root` 的 `.trellis/tasks/` 之下（含 `archive/`）。否则拒绝写入，避免把报告写进更上层的 `.trellis`（例如用户主目录）。

## 写入脚本契约

```text
python "<skill-dir>/scripts/write_review_report.py" <task-dir> [--repo-root <root>] [--input <file>]
```

- 无 `--input` 时从 stdin 读。Windows：`sys.stdin.buffer.read()` 后 `utf-8-sig` 解码（quality-guidelines「Python Text Stdin On Windows」）。
- `--input` 用 `Path.read_text(encoding="utf-8-sig")`。
- 写出：`encoding="utf-8", newline="\n"`，临时文件同目录，写完后替换目的地。
- 空正文拒绝。
- 不写规划产物名（`prd.md` 等）——目的地算法不会指向它们；测试仍断言拒绝把 `--input` 路径误当成目的地。
- stdout 一行 JSON：`path`（posix）、`bytes`、`sha256`（小写 hex）。不回显正文。
- stderr 写失败原因。
- 退出码：`0` 成功；`1` 校验/策略失败；`2` 参数或路径不存在。与 `plan_precheck.py` 一致。

不套用 `governed-file-writing.md` 的根直接子文件与 SHA 替换门。覆盖是产品决定（稳定交接路径）。

Agent 调用方式：把填好的报告 Markdown 交给该脚本。Windows 上优先 `--input` 指向一份仅用于传输的临时文件，避免控制台代码页。临时文件写在 `reviews/` 下 `.<name>.tmp.md`，脚本成功后删除；失败则清理临时文件、保留旧报告。

`allowed-tools` 增加 `Write`，注释限制为：只用于报告文件或脚本 `--input` 临时文件。规划产物与产品代码仍禁止。git 白名单不变。

## 报告文件形状

`references/report-template.md` 骨架（中文标题；英文请求时用对等英文标题）：

```markdown
---
skill: trellis-plan-review
version: 0.2.0
task_dir: <absolute posix>
task_name: <dir name>
task_status: <status>
verdict: <可执行|可执行但需修订|需返回规划>
blocking: N
should_fix: N
notes: N
generated_at: <ISO-8601>
---

# Trellis 规划审阅报告

## 结论

<verdict> — 阻断 N / 应修 N / 提示 N

## 问题清单

### TPR-01 · <严重度> · <短标题>

- Location:
- Claim:
- Evidence:
- Impact:
- Route:

## 未能核实

- <断言> — <原因>

## 可靠部分

- <条目>

## 盲区

<finding-contract 规定的两句声明>
```

问题清单为空时保留小节，写「无」。未能核实为空时写「无」。正文字段与 finding-contract 一致。YAML 头便于下一个 Agent 扫描，不是第二真源；结论行仍以正文为准。

## 交接 Prompt 模板

真源：`references/handoff-prompt.md`。SKILL.md 只写「按该文件填充占位符，放入一个 `text` fence」。

占位符：`{{repo_root}}` `{{task_dir}}` `{{task_rel}}` `{{report_path}}` `{{report_rel}}` `{{verdict}}` `{{counts}}` `{{task_status}}`。

中文模板：

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

英文模板与上表条款一一对应，动词用祈使句。请求语言与报告语言一致。

填充规则：

- `{{task_dir}}` / `{{report_path}}` / `{{repo_root}}` 用绝对路径（Windows 保持盘符）。
- `{{task_rel}}` / `{{report_rel}}` 用相对 `repo_root` 的 posix 路径。
- `{{counts}}` 形如 `阻断 0 / 应修 4 / 提示 1`。
- Prompt 内禁止出现「见上一条消息」「见上方报告」；禁止粘贴 TPR 正文。

## 对话输出

审阅成功且写入成功：

```text
<结论行，含计数>
报告：{{report_rel}}
绝对路径：{{report_path}}

交接 Prompt（复制给修订规划的 Agent）：

```text
<填充后的模板>
```
```

外层对话可以用 Markdown。fence 语言标记为 `text`。fence 内只有填充后的 Prompt。

用户明确要求「把报告贴到对话」时，在 fence 之后追加全文。仍先落盘。

写入失败：说明原因与尝试路径；输出完整四段式报告；不输出带路径的交接 Prompt。

## 数据流

```text
定位 task_dir
  → Pass 0 plan_precheck.py
  → Pass 1–7 判断（现有）
  → 按 report-template 组装 Markdown
  → write_review_report.py 写入 .trellis/reviews/<name>.md
  → 按 handoff-prompt 填充
  → 对话：结论 + 路径 + text fence
```

失败点：找不到 repo_root、目的地逃逸、不可写、空正文。均走 R7。

## 兼容

- 旧调用「只要审一下」仍触发落盘。这是默认行为变化，写进 description。
- 已有 `precheck.json` 行为不变。
- 跨仓库审阅：写进被审仓库，不写当前工作区（若不同）。

## 回滚

删除新脚本、新 references、新测试，把 `SKILL.md` / finding-contract / evals / interface / version 恢复到 0.1.0 行为即可。已写入用户项目的 `.trellis/reviews/*.md` 不自动删除。
