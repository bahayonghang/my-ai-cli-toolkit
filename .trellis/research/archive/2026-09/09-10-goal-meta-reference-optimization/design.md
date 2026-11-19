# Design

## Architecture and boundaries
本任务修复文本编译器；不引入 Goal 执行器。采用现有包内函数、references、tests 和 reports，不增加共享框架。

| Requirement | Mechanism | Owner |
|---|---|---|
| R1 | 一处提取每条 raw/fenced Goal；普通和专项检查消费提取结果；长度仅计 payload | lint child |
| R2 | 现有 CLI 的 '-' stdin 输入；显式 UTF-8/BOM 解码，文件与 stdin 进入相同验证路径 | lint child |
| R3 | 修订 interview 示例完成门；删掉 legacy 子目录写入承诺，保留根目录直接子文件 | contract child |
| R4 | root 负责路由与步骤，interface 负责发现与简短调用提示；细节指向既有权威 references | contract child |
| R5 | 现有 reports/evals 记录版本、参考取舍与真实证据，复用仓库命令 | contract child + parent integration |

## Data flow
输入（文件或 stdin）→ 解码 → 选择 inline/contract → 提取各 inline payload 或解析合同 → 每条局部检查 → 输出错误/警告或通过。
聊天 output envelope 的中文章节顺序检查仍在全文层执行；字段完整性、长度和专项语义只在所属 payload 层执行。不得让 wrapper 补足复制命令的字段。

## Preserved contracts
保留 compile-only 与 activation 分离；明确生成并保存可在同轮完成；create-only/expected-hash replace/reparse 拒绝/回读与非 Git source snapshot；五平台隔离；Trellis 默认 subagent、可解释降级和当前任务提交后归档；review-remediation frozen envelope/ledger/反馈边/有界收敛。
现有四千字符技能预算不在本任务重新定义；实现仅修正计算对象，不宣称重新验证外部平台上限。

## File ownership and dependency
子任务各自列出产品文件。两者都会接触 SKILL.md 与 lint-goal-command.test.mjs，因此必须顺序执行：lint child 仅改 CLI 调用说明及对应输入/边界测试；contract child 随后精简和扩充示例覆盖。不得并发改这两个文件。
父任务拥有整合证据和规划，不拥有额外产品实现；按 Trellis Phase 3.3 在 .trellis/spec/backend/skill-helper-command-contracts.md 记录已实施的 stdin/逐 payload CLI 契约，属于本任务规范同步。

## Tradeoffs and rollback
用小型确定性分块逻辑识别当前已支持的 text fences/raw 命令，不引入 Markdown parser 依赖或可配置 DSL。保留必要安全检查，语义判断通过示例审阅与行为 fixtures 验证，不扩大自然语言正则规则库。
stdin 是补齐真实使用入口；保留已有文件调用。子目录保存承诺直接撤销，不放宽 writer。
按子任务 diff 回退；不 reset 用户工作，不恢复或删除真实 GOAL.md。

## Acceptance trace
AC1 由 lint child 的输入和独立验证机制提供；AC2 由 contract child 的示例修订和职责矩阵提供；AC3 由全套现有目标测试与证据分层提供；AC4 由顺序集成、docs 生成与 just ci 提供。
