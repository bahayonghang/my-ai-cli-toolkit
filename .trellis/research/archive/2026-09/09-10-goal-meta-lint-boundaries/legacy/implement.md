# Implementation plan

- [x] 获准实施后读取注入的规范与父级研究；运行 task-local 探针确认当前症状。
- [x] 在现有 Node suite 增加 stdin、外部字段借用、第二条残缺 Goal、raw/fenced 4000/4001 字符回归，先证明原实现失败。
- [x] 最小实现 stdin 和统一分块；确保错误输出有来源与 Goal 序号，不包含完整合同。
- [x] 更新 SKILL.md 中聊天 lint 的实际可执行命令。
- [x] 运行 rtk node --test skills/developer-tools-integrations/goal-meta-skill/tests/lint-goal-command.test.mjs skills/developer-tools-integrations/goal-meta-skill/tests/persist-goal-contract.test.mjs。
- [x] 运行 just python-check 与 just skills-check；公共入口变化后 just docs-sync，生成差异交付下一子任务。
- [x] trellis-check 检查四个 AC 与 writer import 消费边界；记录失败、跳过与缺失证据。
- [x] 完成后再交接第二子任务；父级最终 just ci 不在无新变化时重复运行。

Owner：trellis-implement 只写 design 中列出的产品文件和生成器实际产生的 goal-meta 文档；其他工作可能并发，禁止回退他人编辑。rollback 为此子任务 diff，不操作真实 GOAL.md。
