# Implement: herdr-orchestra 运行时路由与检测恢复

## Checklist

1. 改 `references/delegation.md`：在启动段加入 surface 选择；写明 start 失败后检查已创建 pane（name 可已丢失）；写入 R4 禁止项与 wait needle 不变量。这是规则真源。
2. 改 `SKILL.md`：Compact Workflow 在创建 sibling 后、`agent start` 前选择 surface；agent 与 pane 两条执行各一步；失败检查指向 delegation。只改顺序，不把长规则抄进根文件。frontmatter `version: 0.2.0`。description 保持现有触发边界。
3. 改 `references/patterns-and-recovery.md`：增加 pane-surface POSIX/PowerShell 片段（split → 确认 shell → `pane run` → 非碰撞 wait）；增加 start 超时检查命令；写明禁止第二 pane / 禁止事后 CLI。omp 不写进此页正文。
4. 改 `agents/interface.yaml` `default_prompt`：先选 surface；未登记 identity 则 incomplete，不换 transport。
5. 扩 `evals/evals.json`（omp 仅 fixture）：
   - `H13-pane-cli`：调用 omp 查询 Google/Gemini 模型 → pane surface + kind 非交互命令，无 `agent start`。
   - `H13-agent-chat`：在 Herdr 让 omp 审查当前 diff → agent start/prompt。
   - `H14-start-undetected`：start timeout、TUI 可见、unknown、name 丢失 → 同一 pane 检查 + incomplete，无 prompt/raw/`report-agent`/第二 worker/事后 CLI。
   - `H15-marker-collision`：wait needle 是 `pane run` 命令子串 → 该次 wait 不表示命令结束。
6. 更新 `reports/output-eval.md`：为 H13–H15 做 source-guided 推演；保留 H01–H12 原记录。注明仍非 live Herdr 证明。
7. 更新 `reports/creation-handoff.md`：记录 0.2.0 契约收紧、qiaomu 泛化、Q1 严格 incomplete、live 检测仍为 missing evidence。
8. 可选：重跑本包 `export_skill_ir.py`，保留 exporter 对缺失 manifest 的 null 字段，不手改 IR。
9. `just docs-sync`（catalog 含版本），再 `just skills-check`。description 未改则不必为触发词改 `trigger_cases.json`；若跑 qiaomu `trigger_eval.py`，保留原 3 个词法误报，不加 veto 刷分。

## Validation

- `just skills-check`
- `just docs-check`（或至少确认 catalog 版本为 `0.2.0`）
- 手工对照 `evals/evals.json` H13–H15 与 Compact Workflow / delegation 文本
- 全量收尾用 `just ci`（Phase 3 前）

本包无 `tests/*.mjs`，不为此任务新增测试运行时。

## Risky files

- `SKILL.md`：写长会重复 delegation，违反 one-home。改完后通读根文件，确认 surface 规则只有指针加一句判定。
- `docs/**`：只允许 `just docs-sync` 生成，禁止手改。
- `evals/evals.json`：JSON 逗号；不要改 H01–H12 的 id/assertions。
- `codex-review`：不要改其 skill。若 orchestra compact 文本使 Codex adapter 找不到 start 路径，只在 orchestra 根流程保留 agent 分支。

## Rollback points

- 步骤 1–4 可单独回退文件。
- 步骤 5–7 与契约必须同提交，避免 eval 与正文分叉。
- `docs-sync` 与 version bump 同提交。

## Before `task.py start`

- jsonl 已有真实 spec/research 条目。
- 用户已批准本规划摘要。
- 不在本轮改产品文件。
