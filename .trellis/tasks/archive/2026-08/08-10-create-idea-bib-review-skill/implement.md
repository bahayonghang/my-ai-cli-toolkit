# implement.md - idea-bib-review 实施计划

执行前提：只有用户在阅读本轮最终规划摘要后明确批准实施，才运行 `task.py start`。进入 Execute 后按 `implement.jsonl -> prd.md -> design.md -> implement.md` 注入上下文；每阶段先做最小验证，再进入下一阶段。

## P0 前置与范围审计

- [ ] 确认当前任务为 `.trellis/tasks/08-10-create-idea-bib-review-skill` 且状态已由明确批准切换为 `in_progress`。
- [ ] 记录 `rtk git status --short --untracked-files=all`；保护现有六个 `.trellis` 修改，不回退、不暂存。
- [ ] 读取 `skills/academic-research-tools/AGENTS.md`、`.trellis/spec/guides/skill-authoring-conventions.md` 和任务 research。
- [ ] 确认 `<qiaomu-meta-dir>` 实际路径和脚本清单；缺失脚本只记录，不安装替代依赖。

验证：任务状态、工作区基线和目标文件白名单记录在检查输出中。回滚点：尚无产品改动。

## P1 路由器与包骨架（R1-R3/R12-R16）

- [ ] 创建 D2 中有实际用途的目录和文件，不创建占位目录。
- [ ] 编写 `SKILL.md` frontmatter 与最小状态机；description 先通过任务内 trigger cases 再扩写 references。
- [ ] 编写 `agents/interface.yaml`，确保 prompt 与根路由一致。
- [ ] 编写面向安装者的 `README.md`，说明输入、自然示例、产物、网络/证据限制、验证和 Troubleshooting；不复制 SKILL 正文。
- [ ] 固化版本 `0.1.0` 与 Qiaomu 归属；不引入 `manifest.json` 版本副本。

验证：`just skills-check`；frontmatter description 长度/尖括号检查；人工核对近邻路由。回滚点：删除新增 skill 目录。

## P2 确定性 BibTeX 与正文审计（R4/R9/R15）

- [ ] 实现 `scripts/review_guard.py inventory` 的保守 BibTeX parser、宏解析、重复/缺失诊断与 JSON 输出。
- [ ] 实现 `audit` 的 Markdown/Pandoc 与 LaTeX citation 提取、approved corpus 隔离、所有 citation occurrence 到唯一 ledger span 的覆盖、draft span/hash、ledger/schema 和证据层级检查；不声称脚本能识别未标记句子的语义类型。
- [ ] 错误路径统一非零退出；JSON 写入由脚本使用 UTF-8 + LF 完成，不依赖 PowerShell 重定向。
- [ ] 新增 Node 测试和 synthetic fixtures，覆盖 D9 所列正常、边界、失败和 prompt-injection 数据用例。

验证：

```powershell
python -X utf8 "skills/academic-research-tools/idea-bib-review/scripts/review_guard.py" --help
node --test "skills/academic-research-tools/idea-bib-review/tests/review-guard.test.mjs"
just python-check
just node-test
```

回滚点：P2 只触及 `scripts/`、`tests/` 和 fixtures。

## P3 证据、写作与检索 references（R5-R13）

- [ ] `evidence-contract.md`：D5 状态、claim kind、证据最低门、语义判断限制。
- [ ] `review-workflow.md`：D4 状态机、idea decomposition、coverage matrix、跨文献写作与输出契约。
- [ ] `search-supplement.md`：D7 搜索顺序、日志、候选/批准状态、访问与降级规则。
- [ ] `quality-rubric.md`：SANRA 适配、narrative/systematic 边界、最终事实/引用/缺口检查。
- [ ] 确认 SKILL 只链接实际存在的 references，并按阶段最小加载。

验证：链接存在性、资源可达性、根入口唯一性；人工用 metadata-only、essential gap、approved supplement 三条状态路径 dry-run。回滚点：P3 references 可独立还原。

## P4 Evals 与证据报告（A1/A4-A10）

- [ ] 写房规 `evals/evals.json`，覆盖至少 5 正例、5 近邻/失败例，assertions 检查候选批准门和不得编造。
- [ ] 运行任务内 Qiaomu trigger cases，迭代 description 直至全通过；保存 `reports/trigger-eval.json`。
- [ ] 从任务研究转写 `reports/prior-art-research.md`，保留候选特定经验、指标语义、许可证和拒绝项。
- [ ] 尝试导出 `reports/skill-ir.json`；若工具受 manifest 冲突阻塞，保存真实失败证据并在 handoff 标记 `missing evidence`。
- [ ] 写 `reports/output-evidence.json`，只声明 `recorded_fixture`；不伪装 provider/human 证据。
- [ ] 写 `reports/creation-handoff.md`，逐项标注 design advantage / validated advantage / hypothesis。
- [ ] 运行 Qiaomu package/release audit；将结构冲突、缺失脚本或 Windows `python3` 失败如实记录，不通过临时文件伪造实际包 PASS。

验证命令：

```powershell
python -X utf8 "<qiaomu-meta-dir>/scripts/trigger_eval.py" `
  "skills/academic-research-tools/idea-bib-review" `
  --cases "../../../.trellis/tasks/08-10-create-idea-bib-review-skill/research/trigger-cases.json" `
  --output "reports/trigger-eval.json"

python -X utf8 "<qiaomu-meta-dir>/scripts/validate_skill.py" `
  "skills/academic-research-tools/idea-bib-review"
```

回滚点：生成报告可删除后重跑；不要手改生成 JSON 来制造通过。

## P5 仓库集成与完整验证（R17/A11）

- [ ] 只有 eval 证明近邻需要时，最小追加 `paper-workbench` 反向路由；否则不改现有 skill。
- [ ] 运行 `just docs-sync`，检查生成目录只反映新 skill/必要元数据。
- [ ] 依次运行 `just skills-check`、focused Node test、`just python-check`、`just node-test`，最后运行 `just ci`。
- [ ] 运行 `rtk git diff --check` 与 `rtk git status --short --untracked-files=all`。
- [ ] 审查最终 diff：不得包含预存 `.trellis` runtime 修改、私密/绝对本机路径、下载内容或无关格式化。

回滚点：若 docs 漂移，保留 skill 源文件，恢复本任务生成 docs 后重跑 `just docs-sync`；不还原用户已有变更。

## P6 最终检查与交付

- [ ] 使用 Trellis check 流程核对 R1-R17 与 A1-A11，重点检查证据层级、候选批准门、路由误触和测试非同义反复。
- [ ] 把无法运行的在线/provider/human/install 证据逐项标 `missing evidence`，不把 synthetic fixture 或 CI 当替代。
- [ ] 更新任务验收状态和 creation handoff，提交用户审阅。
- [ ] 仅在用户另行授权时执行 commit/archive；本计划不含 push、PR、发布或远程操作。

## 实施文件白名单

- `skills/academic-research-tools/idea-bib-review/**`
- `docs/**` 中由 `just docs-sync` 产生且只与新 skill 相关的文件
- 可选：`skills/research-learning-knowledge/paper-workbench/SKILL.md` 的单句反向路由，仅在 eval 证明必要时
- `.trellis/tasks/08-10-create-idea-bib-review-skill/**` 的任务进度与证据

任何超出白名单的必要改动都先回到规划并取得用户确认。
