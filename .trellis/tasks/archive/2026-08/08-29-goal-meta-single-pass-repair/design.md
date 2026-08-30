# Design: goal-meta-skill 单 Prompt 修复闭环

## 1. Boundary

本任务只修改 `goal-meta-skill` 包及其生成 docs/任务工件。核心新增能力是一个显式的 **review-remediation profile**，而不是把所有 fix Goal 都升级为扫描循环。

- 编译阶段：仍然只读侦察、生成、lint、展示、停止。
- 执行阶段：发生在用户于 skill 外启动生成的 Goal 后。
- Trellis 阶段：复用现有 dispatch 与 commit-then-archive adapter，在 archive 之前插入可收敛的 finding feedback loop。
- 平台事实与持久化 schema：现有 7 字段 inline Goal 和 11 节持久合同足以承载，不改平台生命周期事实或 writer。

## 2. Change list

| Path | Planned change |
| --- | --- |
| `SKILL.md` | route and validate review-remediation output; bump 0.8.0 |
| `references/review-remediation-contract.md` | canonical envelope, ledger, question and convergence contract |
| `references/default-goal-strategy.md` | narrow detection/default integration |
| `references/goal-command-playbook.md` | inline/persisted templates and examples |
| `references/interview-checklist.md` | user-owned decision gate |
| `references/trellis-goal-cadence.md` | post-remediation closeout seam only |
| `scripts/lint_goal_command.py` | opt-in fail-closed profile and Trellis intent detection |
| `tests/lint-goal-command.test.mjs` | positive/negative regression matrix |
| `evals/evals.json` | recorded behavior fixtures |
| task `research/trigger-cases.json`, `research/trigger-eval.json` | Qiaomu trigger boundary cases and report without adding a second package eval schema |
| `agents/interface.yaml` | host-facing contract sync |
| `reports/prior-art-research.md`, `reports/skill-ir.json`, `reports/creation-handoff.md` | generated/review evidence and limits |
| generated `docs/` catalog paths | only through `just docs-sync` after version/public metadata change |

## 3. Authoritative resource ownership

| Concern | Canonical owner |
| --- | --- |
| review-remediation 触发、状态机、envelope、ledger、提问门、收敛门 | `references/review-remediation-contract.md` |
| 根路由、最小流程、profile lint 命令、质量门 | `SKILL.md` |
| 默认生成策略与侦察 | `references/default-goal-strategy.md` |
| inline/持久 Prompt 模板与示例 | `references/goal-command-playbook.md` |
| 用户决策分类题库 | `references/interview-checklist.md` |
| Trellis dispatch/commit/archive 接缝 | `references/trellis-goal-cadence.md` |
| 确定性 fail-closed 检查 | `scripts/lint_goal_command.py --review-remediation` |
| deterministic regression | `tests/lint-goal-command.test.mjs` |
| 人工行为/路由 fixture | package `evals/evals.json`; task `research/trigger-cases.json` |
| Governed evidence | `reports/*`; task `research/trigger-eval.json` |

## 4. Detection and generation

review-remediation 只在 outcome 同时具备两类信号时进入：

1. 有一个扫描/审阅来源：scan、review、audit、report、finding、扫描、审阅、审计、报告或具名 finding ledger；
2. 用户要求修复/实施/收敛这些结果，而非只读分析。

仅有 Trellis 路径不触发；纯只读审阅不得触发。编译器在生成后显式用 `--review-remediation` lint，所以 linter 不需要猜测是否属于此 profile。

## 5. Scan envelope

生成 Goal 在首次产品写入前冻结：

```text
scanner: command or named entrypoint
scanner_identity: version, commit, or UNVERIFIED
config: path/hash and material flags
inputs: window/corpus/session IDs or stable enumeration source
targets: paths/modules/files
baseline_report: path or artifact ID
git_baseline: branch + HEAD + dirty-scope summary
```

若值可由仓库回答，执行者自行读取；若必须由用户决定且会改变范围/权限，进入问题门。无法稳定的输入标记 `UNVERIFIED`，不允许虚构 identity。

## 6. State machine

```text
PREPARE
  -> QUESTION_BLOCKED (only user-owned authority/product decision)
  -> IMPLEMENT
  -> CHECK_TARGETED
  -> RESCAN_SAME_ENVELOPE
       -> PASS -> FINAL_GATE -> CLOSEOUT -> COMPLETE
       -> FINDINGS -> LEDGER_MERGE -> IMPLEMENT
       -> BLOCKED -> STOP_REPORT
```

主会话持有 ledger 与状态转换；`trellis-implement` 持有产品写入；`trellis-check` 独立验证。若 checker 返回 `FINDINGS`，主会话验证 finding 是否同范围、去重并回灌现有 implementer；宿主不能复用 worker 时，可在同一 Goal 内派发新的 implementer，但必须注入同一任务工件、scan envelope 与完整 ledger，不得请求用户提供新 Prompt。

## 7. Finding ledger

最小结构：

```text
id, severity, path_or_scope, issue, fix_required,
test_required, status(open|fixed|wontfix|blocked), evidence
```

- ID 在轮次间稳定；同根因 findings 合并但保留来源。
- 同范围新增项直接进入 ledger。
- `wontfix` 需要代码/合同证据，不能用偏好性自述。
- `blocked` 只用于需要新权限、外部状态变化或规划级用户决策的 finding。
- complete 只允许 open actionable = 0，且最终重扫来自同一 envelope。

## 8. AskUserQuestion policy

生成的执行 Prompt 使用如下唯一门：

> 当前 finding 无法在已批准范围、行为合同、依赖政策和权限内确定性修复，且候选选择会实质改变范围、风险、成本、公开行为或授权。

满足才调用结构化问题工具。Claude 文本点名 `AskUserQuestion`；其他平台要求先确认实际工具名并使用等价工具，无工具则问一个简短问题。该规则属于生成内容，不给 `goal-meta-skill` 自身增加新 tool grant。

## 9. Linter profile

`--review-remediation` 是 opt-in 参数，可与 inline、`--contract`、`--platform` 组合。实现拆成可测试函数，不把所有规则堆进 `lint_text`：

- `lint_review_remediation_envelope`
- `lint_review_remediation_feedback_loop`
- `lint_review_remediation_question_gate`
- `lint_review_remediation_completion`

检查应使用多个短语义模式与顺序关系，不要求一条固定长句。profile 必须拒绝：

- 缺 envelope 任一核心簇；
- findings 没有稳定 ledger/status；
- checker findings 后没有回到实现、或要求用户另发 Prompt；
- 同范围新 finding 触发问题工具；
- 完成条件没有零 open、同参数最终重扫、回归/最终门、diff/status；
- 范围漂移被当作 clean；
- 超限仍 complete。

普通 lint 不因这些规则新增误报。Trellis dispatch/closeout detection 单独重构为“具名 task + implementation intent”，避免 archive 作为唯一触发条件，同时用 read-only intent 负例守住边界。

## 10. Eval design

### Deterministic tests

- 完整 inline 中文 Goal 和完整 persisted contract 通过。
- 每个语义簇删除一次均失败。
- default-on、explicit opt-out、capability fallback 三形状通过且 feedback edge 一致。
- 同范围 finding 触发 AskUserQuestion 失败；扩权 finding 在写入前提问通过。
- corpus drift 宣称 clean 失败；rebaseline/BLOCKED 通过。
- 非 remediation、纯 review、management、writer 测试保持通过。

### Qiaomu output evidence

`evals/evals.json` 仍是 `recorded_fixture`，只证明规则可复核。Qiaomu trigger cases 证明路由边界。没有 provider/model runner、blind reviewer 或 telemetry 时，`reports/creation-handoff.md` 与 Skill IR 必须保留 `missing evidence`。

## 11. Governed evidence gates under repository-native structure

保持仓库唯一包内 eval `evals/evals.json`，不新增局部规则禁止的 `README.md`、`manifest.json` 或 `evals/trigger_cases.json`。生成 Skill IR、prior-art report 与 creation handoff；Qiaomu trigger cases/report 放在任务 `research/`。SKILL/interface/IR/handoff 版本同步为 `0.8.0`。运行 Qiaomu helpers，但将与仓库契约冲突的 validator/release failures 原样记录为 `missing evidence`，不执行发布器。

## 12. Compatibility, dirty-scope proof, and rollback

- CLI 新 flag 默认关闭，现有调用保持兼容。
- 不改持久合同 schema；新增规则由 profile 施加。
- 回滚单位为本任务目标包 + 对应 docs；不回退范围外 dirty 文件。
- 启动时为背景事实 7 的范围外普通文件生成相对路径 + SHA-256 inventory；结束时用同一算法复核。该 inventory 只作为本任务保护证据，不写绝对主机路径、不改原文件。
- Qiaomu artifact 与仓库规范冲突已由 scoped `AGENTS.md` 定义：保留 source behavior 与 repo CI，记录具体 schema deviation，不新增冲突文件，也不把外部 gate 报告成通过。

## 13. 已考虑不做

- 不取消独立 checker：会把“无第二条 Prompt”错误实现成“无验证”。
- 不给 `goal-meta-skill` 自身新增 `AskUserQuestion` 权限：用户要求的是生成 Prompt 的执行门。
- 不修改 scanner/session collector：本任务通过冻结 envelope 解决输入全集，不扩展到扫描器实现。
- 不让 linter自动猜所有 remediation intent：显式 profile 更可控，普通 Goal 不受影响。
- 不使用无限 review loop：三轮和停滞门保留安全上限，残余只能 BLOCKED。
- 不发布或安装：Qiaomu 本地 Governed 对齐不等于远程授权。
- 不为 Qiaomu validator 新增 README/manifest/第二种包内 eval schema：仓库局部规则优先，差异保留为 `missing evidence`。
