# 执行计划：goal-meta-skill 注入 Trellis 子代理派发条款

共享约束：不改 `.trellis/.gitignore`（既有 dirt）。不改
`references/platform-goal-facts.md`。不改 `.trellis/workflow.md` /
`.trellis/config.yaml` / 钩子。不新增 README.md / manifest.json。
不改 `persist_goal_contract.py`。格式化只跑本步触及的文件。

## S1 — cadence 派发一节

触及：`skills/developer-tools-integrations/goal-meta-skill/references/trellis-goal-cadence.md`

在 `## Detection` 之后、`## Commit then archive` 之前插入派发一节，内容按
`design.md` 改动点 1：5 平台事实表、`Last verified: 2026-08-25`、证据标签、
侦察要求、内联例外、与 Detection 共用注入门。

**验证**：表含 5 行；无 `official` 标签；`Last verified: 2026-08-25` 存在；
`trellis-implement` 出现。

## S2 — playbook 范本与拒收项

触及：`skills/developer-tools-integrations/goal-meta-skill/references/goal-command-playbook.md`

- Drafting Rules `:229` 补 cadence 含派发与内联例外
- `:287-311` 两个 Trellis 范本只在 `迭代策略` / `约束` / `完成条件` 追加派发措辞；
  commit-then-archive 与父任务发布门逐字保留（diff 只增不改）
- Anti-Patterns 追加两条：派发组缺派发条款；内联平台注入派发

**验证**：两范本各 < 4000 字符；`git diff -U0` 对该段无删除行。

## S3 — linter

触及：`skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py`

- 新增 `DISPATCH_REQUIREMENT_PATTERNS` 与 `INLINE_MODE_PATTERNS`
- 共享辅助函数，判定顺序见 `design.md` 改动点 4
- 契约分支接在 `lint_persisted_contract` 的 `.trellis/tasks/` 块（约 `:577`）
- `lint_text` 双条件识别：含 `.trellis/tasks/` **且** 含归档节奏
- 缺失归 `errors`

**验证**：四种输入 (a)(b)(c)(d) 先用最小 fixture 手跑
`python skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py`。

## S4 — 测试与 evals

触及：

- `skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs`
- `skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs`
- `skills/developer-tools-integrations/goal-meta-skill/evals/evals.json`

- lint 测试：四种输入各一例；版本断言 `0.6.0`；eval id 断言扩到 1–35；
  派发表 `Last verified: 2026-08-25` 同步断言
- persist 测试 Trellis fixture（约 `:368-395`）补派发措辞
- evals id 15/16/29 加派发断言；id 17 加不注入派发的反向断言；新增 id 34、35

`evals.json` 用 Python 写入，避免格式化钩子压平数组。

**验证**：`just node-test` 覆盖本 skill 的两个 `.mjs`。

## S5 — 版本与 SKILL / interface

触及：

- `skills/developer-tools-integrations/goal-meta-skill/SKILL.md`
- `skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py`
  （`0.5.0` 字符串，约 `:478-479`）
- `skills/developer-tools-integrations/goal-meta-skill/references/persistent-goal-contract.md`
- `skills/developer-tools-integrations/goal-meta-skill/reports/creation-handoff.md`
- `skills/developer-tools-integrations/goal-meta-skill/agents/interface.yaml`

版本 7 处 `0.5.0` → `0.6.0`。`review_cadence` 扩到含 Trellis 派发协议变更。
Trellis adapter 与 Quality bar 各补一句/两条。`default_prompt` 末句补派发。
handoff 标明 design advantage / validated advantage / hypothesis；派发率标
hypothesis。

**验证**：
`rg "0\.5\.0" skills/developer-tools-integrations/goal-meta-skill --glob "!**/__pycache__/**"`
零命中。

## S6 — docs 与全量校验

- `just docs-sync`
- `python scripts/check.py skills`
- `just node-test`
- `just ci`

**验证**：prd.md 全部 Acceptance Criteria 勾完。

## 回滚

`git restore --source=HEAD -- skills/developer-tools-integrations/goal-meta-skill docs`
（仅本任务生成的 docs catalog）。不 restore `.trellis/.gitignore`。
