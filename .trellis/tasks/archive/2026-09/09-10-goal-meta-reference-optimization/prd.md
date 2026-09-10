# Goal Meta Skill 参考对照与精简优化

## Goal
结合用户指定的本地参考包，修复 Goal 文本编译的输入/验证断点与示例漂移，减少重复指令，同时保留已有授权、安全写入和单 Prompt 修复闭环。

规划阶段用户授权分析与创建任务；2026-09-10 用户随后明确批准父任务及对应子任务实施。当前范围包括产品修改、独立检查和集成验收；Goal activation、commit、archive、push 和发布不在本次实施授权范围。

## Confirmed facts
- 本地为 0.8.1；参考包为 0.2.0，参考提交 f29e0189f2ea03392c50b4f1c7230886bd838a13（2026-06-11）。本地版本不是功能缺失的简单旧版。
- 审计基线的 64 项目标 Node 测试通过；最小探针仍能证明普通 lint 的全文借用和 fenced 长度误算。详见 research/comparison.md。
- 主入口已有合取完成门，但访谈的四个示例保留弱完成条件；evals 已使用 assertions，不需要 schema 迁移。
- 规划时父子任务均为 planning，以 dev 为实施基线分支；获准实施后依次激活，旧 session-fallback 指针仅作历史上下文，不修改旧任务。

## Requirements
- R1：每条可复制 Goal 独立满足验证契约；全文说明、另一条 Goal 和 fence 不能污染当前 payload 的验证或长度。问题依据：skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1133、skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:304。
- R2：聊天型 compile → lint → present 能通过 stdin 完成，不为 lint 创建文件；已授权保存继续由原 helper 负责。问题依据：skills/developer-tools-integrations/goal-meta-skill/SKILL.md:34、skills/developer-tools-integrations/goal-meta-skill/scripts/lint_goal_command.py:1445。
- R3：所有实际可复制示例把证据缺失与完成分开；只承诺现有 helper 支持的根目录直接子文件保存。问题依据：skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:167、skills/developer-tools-integrations/goal-meta-skill/references/default-goal-strategy.md:123、skills/developer-tools-integrations/goal-meta-skill/scripts/persist_goal_contract.py:107。
- R4：入口只保留路由、最小流程和必要授权边界；细节保留单一权威引用。不得删减能力来制造“精简”。
- R5：维护现有权限与证据边界，按参考包逐项记录 keep/adapt/reject/invent，明确设计优势与实测优势；本轮未运行的 provider、安装或线上平台行为不可称为验证通过。

## Task map
| Child | Ownership | Order |
|---|---|---|
| 09-10-goal-meta-lint-boundaries | R1/R2：stdin 和逐命令 lint、对应回归 | 先实施、独立验收 |
| 09-10-goal-meta-contract-consolidation | R3/R4/R5：完成/路径一致性、入口精简、证据同步 | 前一子任务通过后，消费稳定 CLI |

## Acceptance Criteria
- [x] AC1（R1/R2）：lint 子任务通过其逐块、字符边界、stdin 与持久化回归验收。
- [x] AC2（R3/R4）：contract 子任务通过示例审查、路由/能力覆盖和入口精简验收。
- [x] AC3（R5）：参考对照、当前验证与 missing evidence 分开记录；现有保存/替换保护、非 Git 基线、五平台渲染和 review-remediation 专项回归仍通过。
- [x] AC4（R1/R2/R3/R4/R5）：子任务依次验收后，生成文档与版本一致，just ci 通过，diff/status 只包含明确允许的路径；必要检查缺失意味着未完成。

## Out of scope
不启动/执行任何 Goal；不修改参考 checkout、平台运行时、全局配置、Trellis runtime 或旧任务指针；不扩展子目录写入，不增加兼容层、依赖、规则引擎、manifest、独立 README 或第二种 eval schema；不做平台最新命令研究或用户真实 GOAL.md 试写；不安排 publish/install/provider 实验。

## Decisions
采用 qiaomu-meta-skill 的轻入口、按需资源和证据分层方法，沿用现有 Governed 权限边界，不以补齐上游文件结构为目标。具体规划已获用户批准，按子任务顺序实施。
