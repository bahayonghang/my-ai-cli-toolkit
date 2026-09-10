# Goal 指令精简与示例契约一致性

## Goal
消除可复制示例与核心契约的矛盾，减少重复入口，使已有能力易于正确加载和维护。

## Requirements
- R1：所有普通可复制示例均要求实际证据和必需检查同时成立；缺少检查只能进入未完成/停止报告。依据：skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:167、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:195、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:214、skills/developer-tools-integrations/goal-meta-skill/references/interview-checklist.md:234。
- R2：路径承诺与 writer 一致，移除 legacy 子目录可直接保存的声明，不放宽 writer。依据：skills/developer-tools-integrations/goal-meta-skill/references/default-goal-strategy.md:123、skills/developer-tools-integrations/goal-meta-skill/scripts/persist_goal_contract.py:107。
- R3：root 保留触发/排除、最小流程、调用和授权边界；interface 保留简短意图与能力/权限元数据；专门契约指向现有权威 references，不在入口复制全文。
- R4：保留全部已有能力与证据诚实性，更新现有 evals/reports/版本/生成 docs；父级陈旧的 expectations 现状说明只纠正 goal-meta 部分。

## Acceptance Criteria
- [x] AC1（R1）：四处 interview 示例修正，包内全部普通可复制完整 Goal 经审阅均满足合取完成门；扩展现有发布示例测试覆盖 interview 中英草稿与最终版，缺检查不被标 completed。
- [x] AC2（R2）：包内无 helper 支持 legacy 子目录写入的承诺；根目录 GOAL.md/受支持 alternate basename 行为仍清晰，保存/替换/路径安全现有测试通过。
- [x] AC3（R3/R4）：以 research 的保留契约矩阵逐项核对，无路由或授权缺失；SKILL.md 与 interface 总字符数低于审计基线 15049（LF 规范化），减少来自迁移/删除重复说明，不能以删除能力或信息压缩成难读长句达标。
- [x] AC4（R4）：仅使用已有 assertions eval schema；source/interface/reports 版本一致，报告区分当前验证与历史结果；just docs-sync 后 just ci 通过。provider/安装/人工效果未测则明确 missing evidence。

## Out of scope
不新增能力、子目录保存、框架、依赖、manifest、README 或第二种 eval schema；不重新实现平台命令或自然语言语义判定器，不删除既有安全不变量。

## Dependencies
必须在 09-10-goal-meta-lint-boundaries 验收后执行。首子任务的 SKILL.md stdin 指令与测试不得丢失。
