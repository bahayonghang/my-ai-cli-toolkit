# 设计

复用 scripts/persist_goal_contract.py，不增加审批 token 或状态机。重点同步上述引用、agents/interface.yaml 和 evals/evals.json。必要时只在 skills/developer-tools-integrations/AGENTS.md 与 .trellis/spec/backend/governed-file-writing.md:7 补充 Goal 明确 create 授权例外，不改变其他 writer 的审批流程。

仅在后续获准实施后修改源码。回退只撤销本任务改动，保留用户已有修改。

实施中独立试运行发现既有非 Git 支持被 Baseline 的 Git HEAD 强制校验阻塞。该问题直接阻断明确根目录的同轮保存，因此在现有 Baseline 校验分支允许文档化的 `not-a-repository; source snapshot: 非空文件摘要`，保留 Git 格式检查与所有 writer 安全边界。修订既有非 Git 回归，使用实际 README 哈希，并验证空摘要拒绝及精确回读；不新增配置或审批状态。
