# 优化 goal-meta-skill 单轮修复闭环

## Goal

让 `goal-meta-skill` 为“扫描/审阅报告驱动的 Trellis 修复”生成一条可批准、可执行、可收敛的 Prompt：执行者在同一 Goal、同一任务和同一授权边界内完成前置决策、实施、独立检查、同范围 findings 回灌、原参数重扫、最终门禁及提交归档，不再把仍可在范围内修复的问题包装成下一条修复 Prompt 交回用户。

“一次完成”指 **一次外部 Prompt / 一次用户启动动作**，不等于跳过独立验证，也不承诺一次代码编辑天然正确。内部可有证据驱动的有限修复轮次；用户不需要再发起第二次验证或提供第二条修复 Prompt。

## Background and Confirmed Facts

1. 当前 Trellis 适配器只有前向的 `trellis-implement` → `trellis-check` → commit → archive 契约，没有规定 checker 的同范围 actionable findings 必须回到同一任务内修复，也没有禁止生成后续修复 Prompt（`skills/developer-tools-integrations/goal-meta-skill/SKILL.md:86-92`；`skills/developer-tools-integrations/goal-meta-skill/SKILL.md:115-121`；`skills/developer-tools-integrations/goal-meta-skill/references/trellis-goal-cadence.md:92-112`）。
2. 当前通用策略只说“最多三轮聚焦改进后报告剩余风险”，没有冻结扫描输入、finding ledger、同参数重扫或“同范围 open findings = 0”完成门（`skills/developer-tools-integrations/goal-meta-skill/references/default-goal-strategy.md:147-149`；`skills/developer-tools-integrations/goal-meta-skill/references/default-goal-strategy.md:182-190`；`skills/developer-tools-integrations/goal-meta-skill/references/goal-command-playbook.md:202-217`）。
3. linter 只检查字段、dispatch 与 commit/archive 形状；inline Trellis 特检还依赖文本同时出现 `.trellis/tasks/` 和 `archive`，不能拒绝不闭环的 review-remediation Goal（`skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:12-20`；`skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:422-558`；`skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:581-629`）。
4. 现有 Trellis tests/evals 锁定 review-before-activation、subagents 开关和 closeout，却没有“原扫描 → 修复 → 同参数重扫 → 同范围 finding 回灌”的正反 fixture（`skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs:492-513`；`skills/developer-tools-integrations/goal-meta-skill/evals/evals.json:430-500`）。
5. 当前目标包的 focused baseline 已验证：50/50 Node tests 通过、`scripts/check.py` 通过、两个 Python helper 可 byte-compile。
6. Qiaomu package validator 当前失败于缺少 `README.md` 与 `manifest.json`，并警告缺少 `evals/trigger_cases.json`；但本目录 `AGENTS.md` 明确规定这些是与仓库契约冲突的外部包约定：包内 eval 唯一格式仍为 `evals/evals.json`，不得为外部门禁新增 README/manifest。该 skill 跨平台、生成关键执行合同且有受控文件写入能力，因此本任务采用 Qiaomu **Governed 证据与信任原则**，同时把这些 schema 差异记录为 `missing evidence`，不伪造全绿 package/release claim。
7. 当前工作树已有另一 planning task 及其来源改动：`.trellis/tasks/08-29-consolidate-skill-review/`、`.trellis/spec/backend/index.md`、`.trellis/spec/backend/governed-report-subtree-writing.md`、`skills/developer-tools-integrations/skill-doctor/`、`skills/developer-tools-integrations/update-skill/`。这些路径全部属于本任务范围外；实施、验证和提交必须保持其现状并排除，除非用户另行授权。
8. 先例研究已完成到“目录检索 + 源码短名单”层级；provider-backed 运行、人工盲评、fresh-Agent 真实接力、返工率 telemetry 均为 `missing evidence`。

## Key Decisions

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-08-29 | “一次完成”定义为一条外部 Prompt 内的完整闭环，内部验证/返修仍保留 | 用户要消除二次 Prompt，而不是取消质量门 |
| 2026-08-29 | 使用显式 `--review-remediation` profile，不对所有 fix Goal 做启发式强制 | 防止普通修复和只读审阅误触发 |
| 2026-08-29 | `AskUserQuestion` 只写入生成的执行合同，不给元技能自身扩权 | 用户要求 Prompt 前置询问，同时保留 compile-only 权限边界 |
| 2026-08-29 | 内部最多三轮、同一 signature 两轮无进展即 `BLOCKED` | 避免无限重试；耗尽不等于完成，也不生成下一条 Prompt |
| 2026-08-30 | 按 Qiaomu Governed 原则补强证据，但服从仓库原生包结构 | 局部 `AGENTS.md` 禁止为外部 validator 增加 README/manifest/第二种包内 eval schema |
| 2026-08-29 | 新任务保持独立根任务，不挂到 `consolidate-skill-review` | 两者交付物和验收边界独立 |

## Requirements

- R1: 扫描/审阅驱动修复必须由一条外部 Prompt 持有完整执行闭环，同时保持编译器 review-before-activation 边界。

  - R1.1: 新增明确的 `review-remediation` 生成模式，只在用户要求根据扫描、审阅、报告或 findings 实施修复时启用；普通 Goal、纯只读审阅、现有 Goal 管理和非扫描型 Trellis 实施保持原行为。
  - R1.2: 编译器仍遵循 compile → lint → present → stop；它只输出 DRAFT/APPROVED TEXT，不创建、不激活、不提交 `/goal`，也不实施修复。
  - R1.3: 生成的执行 Prompt 必须声明：可在批准范围内修复的 finding 留在同一 Goal 内处理，不创建或索取第二条修复 Prompt，不把下一次验证交给用户发起。

- R2: review-remediation Goal 必须冻结可复现的扫描全集并显式处理漂移。

  - R2.1: Prompt 必须绑定可复现的扫描 envelope：权威扫描命令或工具入口、工具版本/commit（可得时）、配置与关键 flags、输入 window/corpus/session 集合或稳定 ID、目标路径/文件集合、基线报告路径及执行时 Git 基线。
  - R2.2: 无法固定的非确定性输入必须标为 `UNVERIFIED`，采用有界复跑与第二证据源；不得把范围漂移后的前后结果直接宣称为“归零”。
  - R2.3: 扫描范围、配置、corpus 或目标集合发生实质漂移时，执行者必须重新建立基线或进入 `BLOCKED`，不能静默扩大全集。

- R3: 只有真正的用户所有决策才可在首次写入前触发 `AskUserQuestion` 或宿主等价工具。

  - R3.1: 在首次产品写入前，执行 Prompt 要求先区分：仓库可回答事实、已批准范围内的实现判断、以及真正由用户拥有的范围/产品/风险/权限决策。
  - R3.2: 只有第三类仍阻塞时才使用宿主的结构化提问工具；Claude Code 明确使用 `AskUserQuestion`，其他平台使用其实际可用等价工具，无结构化工具时退化为一个简短问题。
  - R3.3: 允许询问的典型事项：扩大写入范围、改变公开 API/兼容性/产品语义、新依赖、远程/生产/付费/凭证/发布/push/破坏性动作、覆盖文件或互斥产品策略。
  - R3.4: 禁止为普通实现细节、是否修复已批准 finding、是否运行原扫描、每批修复后的再次批准、或仅因出现同范围新 finding 而提问。元技能自身不新增 `AskUserQuestion` 权限；该工具要求属于生成的执行合同。

- R4: 初始和后续同范围 findings 必须在一个稳定 ledger 中原位返修并有界收敛。

  - R4.1: 初始 actionable findings 进入稳定 ledger，至少记录 `id / severity / path-or-scope / issue / fix_required / test_required / status / evidence`；同一 finding 的身份在内部轮次中稳定。
  - R4.2: checker 输出只允许 `PASS | FINDINGS | BLOCKED`。`FINDINGS` 中可在原授权内修复的项由主会话在同一任务内回灌 `trellis-implement`；实现者完成聚焦修复和回归证据后再次交给 `trellis-check`，不得生成新的用户交接 Prompt。
  - R4.3: 同参数重扫出现的同范围新 finding 自动追加到原 ledger。无违反合同、不可复现或纯偏好的 finding 可经源码核验后标记 `wontfix`，必须写理由与证据，不能为追求“零文本”盲改。
  - R4.4: 内部轮次必须有界且防停滞：最多三轮聚焦返修；同一 finding signature 连续两轮无进展，或第三轮后仍有 open actionable findings 时进入 `BLOCKED` 并报告残余 ledger。不得标记 complete，也不得自动生成下一条修复 Prompt。

- R5: 只有合取式验证全部通过后才可进入既有 Trellis 提交归档节奏。

  - R5.1: 完成必须同时满足：冻结范围内 open actionable findings 为 0；原参数最终扫描成功且对应同一 envelope；相关回归检查和最终 `just ci` 通过；diff/status 未越界；无伪造的外部证据。
  - R5.2: Trellis 默认 subagents 路径保持：实施由 `trellis-implement`、独立检查由 `trellis-check`；主会话负责 finding 去重、回灌和最终门。inline opt-out/技术降级使用既有 inline 形状，但必须保留相同闭环语义。
  - R5.3: 只有 R5.1 通过后才按既有 current-task product + planning commit → history confirmation → separate `task.py archive` 顺序收尾；范围外 dirty 文件和其他任务目录保持排除。

- R6: 显式 linter profile、确定性 tests 和行为/路由 eval 必须把闭环规则变成 fail-closed 回归门。

  - R6.1: `lint_goal_command.py` 新增显式 `--review-remediation` profile；不得只靠自然语言启发式自动误判所有 fix Goal。
  - R6.2: profile 对 inline `/goal` 与持久 `GOAL.md` 都 fail-closed 检查：扫描 envelope、稳定 ledger、原参数重扫/feedback edge、仅外部决策才提问、禁止后续修复 Prompt、零 open finding + 最终门。
  - R6.3: profile 与 Trellis detection 不依赖必须出现 `archive`；纯只读 Trellis 审阅仍是负例，不得被强制成实施闭环。
  - R6.4: Node tests 必须覆盖完整正例、每个关键语义簇的单缺陷负例、inline/default-on/opt-out/fallback、持久合同、范围漂移、同范围新 finding、错误的 AskUserQuestion 触发及非 review-remediation 回归。
  - R6.5: `evals/evals.json` 增加自然语言 should-behavior/near-neighbor fixtures；Qiaomu 专用 cases 放在本任务 `research/trigger-cases.json`，覆盖 should-trigger、should-not-trigger、near-neighbor，并在同目录生成可复核 trigger report，不引入第二种包内 eval schema。

- R7: Qiaomu Governed 证据、版本、接口和生成报告必须与仓库原生结构同步，且不扩大实施/远程权限。

  - R7.1: 新增长规则只放 `references/review-remediation-contract.md`；`SKILL.md` 只保留触发、核心流程、profile 命令和质量门，避免重复。
  - R7.2: 同步 `agents/interface.yaml`、playbook、default strategy、interview checklist、Trellis adapter、version、creation handoff、prior-art report 与 Skill IR；版本按行为能力新增从 `0.7.1` 升为 `0.8.0`。不新增仓库不采用的 README、manifest 或包内 trigger schema。
  - R7.3: 仓库原生 `scripts/check.py`、focused tests、docs-sync 与 `just ci` 是完成门；Qiaomu validate/trigger/IR/local release helper 仍须运行并记录，但 README/manifest/包内 trigger schema 冲突只能标为预期 `missing evidence`，不得声称 Qiaomu package/release 全绿，也不得声称 PR、发布、远程安装、provider-backed compliance、人工盲评或 telemetry 已完成。
  - R7.4: 不修改 `persist_goal_contract.py`、`platform-goal-facts.md`、Trellis runtime、扫描器实现或其他 skill，除非实施证据证明固定 schema/平台事实确实无法承载本合同并先返回规划说明。
  - R7.5: 不新增依赖，不执行 push/PR/release/安装或用户全局写入；不触碰背景事实 7 列出的范围外任务、spec 和 skill 来源。

## Acceptance Criteria

- [ ] AC1 (R1, R4): 一条 recorded fixture 中，初始 findings、同范围重扫新增 finding 和 checker findings 都在同一 Goal/ledger 内完成修复；输出明确禁止新建第二条修复 Prompt。
- [ ] AC2 (R2, R6): `--review-remediation` 对缺少 command/version-or-identity/config/input scope/target/baseline report 任一 envelope 语义的 fixture 非零退出，对完整 fixture 退出 0。
- [ ] AC3 (R2): 范围或 corpus 漂移 fixture 必须重新基线或 BLOCKED，不能被判定为 clean；非确定性扫描说明 `UNVERIFIED` 与有界佐证。
- [ ] AC4 (R3): Prompt 明确前置 `AskUserQuestion`/等价工具的唯一门；同范围新 finding 和普通实现细节的负例不得触发提问，扩权/产品语义正例必须提问并在回答前不写产品文件。
- [ ] AC5 (R4): ledger schema、`PASS | FINDINGS | BLOCKED`、最多三轮、同 signature 两轮停滞和残余 ledger stop-report 均由 reference + linter/tests 覆盖。
- [ ] AC6 (R5, R6): 完成 fixture 同时证明 open actionable findings = 0、原参数最终扫描、回归检查、`just ci`、diff/status 边界和证据标签；缺一项则 linter/test 失败。
- [ ] AC7 (R5): Trellis default-on、explicit opt-out、capability fallback 三条路径都保持闭环；default-on findings 回灌 implementer 后再由 checker 验证，不改变既有 commit/archive 权限边界。
- [ ] AC8 (R1, R6, R7): 纯只读审阅、普通非扫描修复、Goal 管理和持久化 writer fixtures 保持原行为；50 个现有 Node tests 不回归。
- [ ] AC9 (R7): Qiaomu trigger eval 与 Skill IR export 退出 0，SKILL/interface/IR/creation handoff 一致为 0.8.0；`validate_skill.py` 和 local release check 若非零，只允许出现仓库已声明的 README/manifest/包内 trigger schema 差异。provider-backed output、human blind review、fresh-Agent real execution、remote/clean install 和 telemetry 继续标为 `missing evidence`，不得把预期差异报告成通过。
- [ ] AC10 (R6, R7): focused Node tests、`scripts/check.py`、Python compile、`just docs-sync`、`just ci` 和 `git diff --check` 通过；输出区分 passed/failed/skipped/missing evidence。
- [ ] AC11 (R7): 本任务 attributable diff 仅含目标包、生成 docs 和本任务目录；背景事实 7 的既有范围外 dirty 路径通过启动/结束相对路径 + SHA-256 inventory 保持一致，且未被本任务暂存或提交。

## Out of Scope

- 修改实际 session/skill 扫描器、reviewer 或 Trellis runtime。
- 保证任意 provider、任意仓库或未来变化的 corpus 一次编辑就零 finding。
- 取消独立验证、取消安全暂停条件，或用“无 findings 文本”替代真实验证。
- 激活/运行本 skill 生成的 Goal，或执行 push、PR、发布、Release、全局安装。
- 把 `GOAL.md` 变成日志、memory vault 或可变进度账本。

## Risks and Deferred Evidence

- 正则 linter 可能奖励关键词堆叠；设计要求语义簇 + 顺序/禁止行为的正反 fixture，provider compliance 仍为 `missing evidence`。
- “三轮”是安全 backstop，不是平台预算；轮数耗尽不是完成。
- skills.sh 手工回退只在一个查询返回候选，SkillsMP 目录检索质量较低；先例结论只来自已打开的源码短名单。
- fresh-Agent 真实接力、人工盲评、返工率下降和跨五平台行为需后续独立证据，不阻断本地 deterministic contract 完成。

## Open Questions

无阻塞问题。用户已于 2026-08-30 明确批准在隔离 worktree 中开始实施，并要求不再追加规划审阅。
