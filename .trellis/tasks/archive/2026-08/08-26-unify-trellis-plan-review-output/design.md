# 技术设计：树级 Trellis 规划审阅单一交付物

## 设计目标

把当前“一个 task 目录一次审阅”的隐式作用域改为显式 review scope：叶子 scope 含一个成员，父任务 scope 含根任务及其递归子任务。所有机械检查和判断仍逐任务执行，但聚合、去重、落盘和 handoff 只执行一次。

```text
根任务
  -> 解析 children 递归闭包并校验树
  -> 对每个成员运行机械预检
  -> 对每个成员运行 Pass 1-7 + 跨任务一致性核验
  -> 跨任务按根因去重、聚合 verdict/counts
  -> 生成一份根任务报告
  -> write_review_report.py 调用一次
  -> 返回一个统一 handoff Prompt
```

## 1. Review scope 解析

### 输入与权威字段

- 输入仍是一个显式/当前/slug 定位得到的根任务目录。
- `task.json.children` 是当前权威成员字段。
- 只有 `children` 键缺失时，才允许把非空 `subtasks` 当 legacy fallback；两字段同时非空且集合/顺序冲突时返回树阻断，不做 union。

### 查找规则

对每个 child basename，在同一仓库的以下位置查找精确目录名：

1. `.trellis/tasks/<child>`
2. `.trellis/tasks/archive/*/<child>`

零命中为 missing；多命中为 ambiguous。解析结果必须位于同一 `.trellis/tasks/` 下且不是 symlink/reparse escape。遍历采用 root-first DFS，并保持父 `children` 的声明顺序。

### 完整性检查

- 维护 visiting/visited 集合，拒绝 cycle 和同一 child 被多父/重复边引用。
- 子 `task.json.parent` 必须回指当前父 basename；不一致时阻断。
- 每个成员都必须有可解析 `task.json`，否则无法确定 scope/status，阻断整树审阅。
- 树只表达所有权，不推导执行依赖；依赖仍由 Pass 5 从 PRD/design/implement 核验。

## 2. `plan_precheck.py` 兼容扩展

保留现有命令的单任务 JSON 形状。新增显式 `--include-descendants` 模式：

```text
python "<skill-dir>/scripts/plan_precheck.py" <root-task-dir> --include-descendants [--repo-root <path>] [--output <json-path>]
```

树模式输出顶层：

- `review_scope`: mode、root、ordered members、edges、legacy fallback 标记；
- `tasks`: 每个成员现有 `artifacts/placeholders/citations/identifiers/status/drift_pass_required`；
- `reviews_git`: 只计算根报告 `.trellis/reviews/<root>.md`；
- `blocking`: 带 task basename 的树错误与成员预检错误；
- `drift_pass_required`: per-task 保留，不把一个已启动子任务错误套到全部成员。

不传 `--include-descendants` 时保持当前调用方兼容。skill 自身审阅命令统一传该 flag，因此叶子和父树都走同一代码路径。`--output` 若使用也只写一个聚合 JSON；默认直接读 stdout，避免额外持久化文件。

## 3. 判断与去重

Pass 1–7 对 ordered members 逐个执行。Pass 5 增加 tree consistency 子项：

- 父需求是否被子任务范围、机制和验收覆盖；
- 子任务是否引入父任务明确排除的内容；
- 跨子任务顺序是否写在产物中，而非仅靠树顺序；
- 共享接口、证据口径、交付路径和回滚边界是否一致。

候选 findings 在编号前按根因合并。合并键由 reviewer 基于“同一违反合同/同一纠正选择”判断，不用脆弱字符串哈希。合并后保留：

- `Task`：owning task 或 `cross-task`；
- `Affected tasks`：所有受影响成员；
- `Location`：task-qualified 的多位置列表；
- 一份 Claim/Evidence/Impact/Route。

整体 verdict 使用现有严重度规则对聚合 finding 集计算。不得把多个 task 的相同缺陷重复计数。

## 4. 合并报告合同

目标仍由现有 writer 从根任务推导：`.trellis/reviews/<root-task-name>.md`。writer 不需要获得删除/迁移 child report 的能力。

frontmatter 在现有字段上增加：

- `review_scope: task-tree | single-task`
- `task_count`
- `task_members`（有序 basename 列表）
- `task_statuses`（basename 到 status）

正文顺序：审阅范围、结论、问题清单、未能核实、可靠部分、盲区。问题仍用全局唯一 `TPR-01...`，按严重度后按 root-first task/artifact 顺序排列。

单任务报告使用同一 schema，`task_count: 1`，从而避免两套模板。版本字段同步到 `0.4.0`，不继续保留当前模板 `0.2.0` 与 skill `0.3.0` 的漂移。

## 5. 单一 handoff

`handoff-prompt.md` 从 singular task 语义改为 scope 语义，新增 `{{task_members}}` 或等价的有序成员块。Prompt 要求：

- 先读合并报告和范围内所有任务的现有规划产物；
- 按每个 TPR 的 Task/Affected tasks/Location 修改对应文件；
- 同一跨任务 TPR 必须同步修订所有点名产物；
- 只返回一个修订结果，不按 child 再生成 handoff；
- 保持现有不实现、不启动、不改报告的权限边界。

chat 成功形状仍是 verdict、一个 report path、一个 text fence。

## 6. 变更面

| 路径 | 设计职责 |
| --- | --- |
| `SKILL.md` | 定义 review scope、树级流程、一次落盘/一次 Prompt 硬门、版本 |
| `agents/interface.yaml` | 与根合同对齐的一次树级交付默认提示 |
| `references/trellis-artifact-map.md` | children/legacy/archive/树完整性与跨任务语义 |
| `references/review-passes.md` | per-task passes 与 Pass 5 tree consistency |
| `references/finding-contract.md` | 聚合 verdict、跨任务去重与 task-qualified finding |
| `references/report-template.md` | 单一统一 schema 与 scope 区段 |
| `references/handoff-prompt.md` | 一个覆盖全部成员的修订 Prompt |
| `scripts/plan_precheck.py` | 可选递归 scope 解析与聚合 JSON |
| `tests/plan-precheck.test.mjs` | 树解析、归档、错误和兼容回归 |
| `tests/write-review-report.test.mjs` | 根路径单写、leaf 兼容、旧 child 不触碰 |
| `evals/evals.json` | 父+子单报告/单 Prompt 行为 fixture |
| generated `docs/` | 由 `just docs-sync` 同步 0.4.0 公共元数据 |

不新增 runtime 依赖，不修改目标仓库之外的反例文件。

## 7. 风险与回滚

- **漏审归档 child**：精确查找 live + archive，并以 missing/ambiguous 阻断测试覆盖。
- **树循环或错误 back-reference 导致无限遍历**：DFS visiting/visited + parent 校验，失败早于写入。
- **过度合并 findings**：只合并同一违反合同和同一纠正选择；证据或 impact 不同则保持独立。
- **报告过长**：只合并重复根因，不压缩掉 task-qualified evidence；Prompt 不复制 TPR 正文。
- **单任务回归**：保留无 flag 的旧 precheck 形状，leaf scope 用同一模板和旧路径。
- **误删历史报告**：writer 继续只替换根目标；不枚举或删除 child report。

回滚以三层为界：先回滚模板/handoff；再回滚树级协议；最后回滚 precheck flag。writer 的既有路径限制和原子写入不回退。

## 8. Qiaomu 证据边界

本次属于共享 skill 的 Production+ 行为改进，但不改变触发路由，也不发布。先行检索、keep/adapt/reject/invent 与缺失证据保存在任务 research；实现阶段以 deterministic tests、recorded behavior fixture 和 repo CI 作为本地证据。真实 provider 是否始终只产出一份报告/一条 Prompt、人工对合并报告可用性的判断、旧反例跨仓库重放在实际执行前均不得宣称已验证。
