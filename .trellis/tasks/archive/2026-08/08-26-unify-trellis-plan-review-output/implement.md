# 实施计划：树级审阅单一报告与 Prompt

## 1. 建立树级机械作用域（R1 / R2）

- 在 `plan_precheck.py` 中抽出单任务预检结果构造，避免树模式复制现有检查逻辑。
- 增加 `--include-descendants`：解析当前 `children`、legacy fallback、live/archive 精确命中、root-first 顺序和树完整性。
- 树模式聚合每个成员的现有检查结果与阻断项，只计算根报告的 Git visibility。
- 保留不带 flag 的 CLI/JSON/退出码兼容。
- 先扩展 `plan-precheck.test.mjs`：父+活动 child+归档 child、leaf、missing、ambiguous、cycle、duplicate edge、parent mismatch、path escape、legacy fallback。

完成门：目标 precheck 测试通过；树异常在任何报告写入前失败，且无临时残留。

## 2. 收敛根合同与判断规则（R3 / R6 / R7）

- 升级 `SKILL.md` 到 `0.4.0`，把 review scope 置于 locate 后、passes 前；统一使用树模式预检。
- 明确 Pass 1–7 per-task，Pass 5 额外做跨任务一致性；同根因在编号前去重。
- 更新 `trellis-artifact-map.md`、`review-passes.md`、`finding-contract.md`，记录 current `children`、deprecated `subtasks`、archive lookup、task-qualified evidence 和整体 verdict。
- 更新 `agents/interface.yaml`，锁定“一次 scope、一份报告、一条 Prompt”，不重复整段 root 指令。

完成门：root、interface 和 references 对 scope/membership/dedupe/verdict 的定义一致；无“每个 task 各写一份”的残留活动规则。

## 3. 统一报告与 handoff（R4 / R5）

- 更新 `report-template.md` 为 single/task-tree 共用 schema，加入审阅范围与 task-qualified finding 字段，并同步版本。
- 更新 `handoff-prompt.md`，让一条 Prompt 覆盖根与所有成员，按 TPR 同步修订 affected tasks。
- 保持 `write_review_report.py` 只接收根任务并写一个路径；仅在需要可观测 task count 时做最小 payload 扩展，不授予枚举/删除 child report 的能力。
- 扩展 writer tests：根报告单写、child path 未创建、既有 child report 字节不变、leaf path 兼容、UTF-8/LF/Git note 回归。

完成门：树级 fixture 的 `.trellis/reviews/` 新增/替换目标只有根报告；chat 合同只有一个 text fence。

## 4. 增加行为回归与 Qiaomu 证据（R3 / R5 / R7）

- 在 `evals/evals.json` 追加连续 id 的中文父+子反例同构 case；断言一个 report path、一个 Prompt、全成员覆盖和跨任务去重，禁止 child report/prompt。
- 增加英文或 leaf compatibility case，仅在现有 eval 未充分覆盖时添加，避免为凑数扩张。
- 人工审阅 eval 的 required/forbidden material behavior；不把 fixture 当 provider 证明。
- 更新本任务 `research/tree-review-evidence.md` 的 implemented/validated/missing-evidence 状态；不添加仓库未采用的 README/manifest。

完成门：删除根 scope 规则、interface 单一输出规则或新 eval 关键断言时，目标 Node 包合同会失败。

## 5. 验证与范围审计

按从小到大顺序运行：

1. `rtk node --test skills/development-workflows/trellis-plan-review/tests/plan-precheck.test.mjs`
2. `rtk node --test skills/development-workflows/trellis-plan-review/tests/write-review-report.test.mjs`
3. `rtk just node-test`
4. `rtk just skills-check`
5. `rtk just python-check`
6. `rtk just docs-sync`
7. `rtk just ci`
8. `rtk git diff --check`
9. `rtk git status --porcelain -uall`

人工验证：用临时 fixture 模拟 `08-26-intellectual-property-materials` 的一父两子结构，确认输出目录只有根报告且 handoff 只有一条。若不在真实 `quanergy_client_rs` 上重放，明确标记跨仓库真实反例重放为 `missing evidence`。

## 风险文件与回滚点

- `plan_precheck.py` 是兼容风险最高的文件；先加 flag，不改变旧默认。
- `finding-contract.md` 与两个模板共同拥有输出 schema，必须同一提交切换，不能半更新。
- `SKILL.md` 与 `agents/interface.yaml` 共同拥有行为硬门，任何一个不得保留 per-child 输出歧义。
- docs 只通过 `just docs-sync` 生成，不手写。
- 不触碰既有未跟踪任务 `.trellis/tasks/08-26-resume-interview-skill/`。

## 启动前检查

- `prd.md`、`design.md`、`implement.md` 已通过用户审阅。
- `implement.jsonl` / `check.jsonl` 各有真实 spec/research 条目。
- 用户在本规划摘要之后另行明确批准实施；再运行 `task.py start`。本轮不启动。
