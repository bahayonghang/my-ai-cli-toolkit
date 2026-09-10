# Implementation plan

- [x] 确认 lint child 已验收，读取其最新 CLI 说明和父级研究，复核 Git 范围。
- [x] 首先修订四处 interview 完成条件及 legacy 子目录写入承诺。
- [x] 扩展现有示例测试，核对全部可复制普通 Goal；保留安全与专项回归，不增加语义规则引擎。
- [x] 按 design 的能力矩阵精简 root/interface，必要细节移动到现有 reference；每项仍能从入口到达。
- [x] 修正 category AGENTS 关于 goal-meta expectations 的过时陈述；不做 eval schema 迁移。
- [x] 同步版本、现有 evals 和 reports；按 keep/adapt/reject/invent 记录参考取舍，并区分 design advantage/validated advantage/hypothesis。
- [x] 对比 LF 规范化 root/interface 字符数与 15049 基线；报告真实变化而非 token/provider 效果。
- [x] 运行 rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs。
- [x] 运行 just docs-sync，查看生成变更。
- [x] 主线程在最终集成树运行 just ci。
- [x] trellis-check 按能力矩阵及 AC1–AC4 独立复核，记录 passed/failed/skipped/missing evidence，交由主线程整合；AC4 的最终 CI 已由主线程验收（421 passed / 4 skipped / 0 failed）。

Owner：trellis-implement 只修改 design 所列文件，第二子任务期间不并发修改第一子任务共享文件；其他工作可能并发，禁止回退他人编辑。回退边界为本子任务 diff。
