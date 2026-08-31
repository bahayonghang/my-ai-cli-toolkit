# Implement: plan-review 交接确认门

Active task after start: `.trellis/tasks/08-31-plan-review-ask-confirm`

默认派发 `trellis-implement` / `trellis-check`。主会话不直接改产品文件。

## Ordered checklist

1. [x] 读根 `AGENTS.md`、`skills/development-workflows/AGENTS.md`、`.trellis/spec/guides/skill-authoring-conventions.md`、`.trellis/workflow.md` Phase 2.1/2.2、本任务 prd/design/implement、jsonl 列出的 spec/research。确认 `task.json` 为 `in_progress`。
2. [x] 新建 `references/revision-question-gate.md`：分类、正向调用、≤4 批次、写回、禁止 start、宿主表、dump-forbidden、负向门。日期 2026-08-31。
3. [x] 更新中英文 `references/handoff-prompt.md`：插入确认门语义簇（`research/target-handoff-clause.md`）。保留「报告是待分诊列表，不是批准」与禁止 start。
4. [x] `SKILL.md`：version `0.5.0`；交接节最短指针到 revision-question-gate；硬门与 `allowed-tools` 不动；`description` 默认不动。
5. [x] 如需要，更新 `references/finding-contract.md` 一句：提问/写回属于交接修订者。`report-template.md` YAML version `0.5.0`。
6. [x] `agents/interface.yaml`：short_description / default_prompt 与确认门对齐，审阅者仍只读。
7. [x] `tests/tree-review-contract.test.mjs`：version `0.5.0`；交接关键词簇覆盖 AC2–AC4；evals ids 1–12。
8. [x] `evals/evals.json` 追加 id 11（截图同构）与 id 12（AskUserQuestion 近邻负例）；#1–#10 只读断言保留。
9. [x] `just docs-sync`。
10. [x] 验证：focused `node --test skills/development-workflows/trellis-plan-review/tests/*.mjs`、`just skills-check`、`just node-test`、`just docs-sync`、`just ci`、`git diff --check`。Qiaomu validate 只记录预期 README/manifest 差异。
11. [x] 报告：passed/failed/skipped/missing evidence。不 push、不 archive、不把范围外 dirty 纳入提交。

## Validation commands

```text
node --test skills/development-workflows/trellis-plan-review/tests/*.mjs
just skills-check
just node-test
just docs-sync
just ci
git diff --check
```

可选（失败则记 missing evidence，不伪报通过）：

```text
python C:/Users/lyh/.claude/skills/qiaomu-meta/scripts/validate_skill.py skills/development-workflows/trellis-plan-review
```

## Risky files / rollback

- `references/handoff-prompt.md`：中英文必须同步；漏掉 dump-forbidden 会让截图失败复现。
- `tests/tree-review-contract.test.mjs`：关键词过宽会误伤「报告是待分诊」等合法句子；测语义簇而非整段。
- 不要改 `allowed-tools` 或 Pass 脚本。
- 回滚：还原目标包与 docs-sync 文件。

## Start-front already decided in planning

产品决策见 prd Key Decisions。实施时若发现必须给审阅者扩权、授权 start、或改 `description`，先用宿主结构化问题工具问，不要聊天罗列。
