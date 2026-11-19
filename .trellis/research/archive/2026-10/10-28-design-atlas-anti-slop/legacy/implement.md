# 执行计划：Anti-slop

1. [ ] 写 `references/anti-slop.md`：分级规则、gate 表（保留编号，标 tier/class）、声明材质规则、豁免语法、J 清单、不编造原则、未采纳 gate 附录。
2. [ ] 改编 fixtures：从 `ref/repo/hallmark/skills/hallmark/scripts/fixtures/` 改写到 `tests/fixtures/slop/`，去掉 Hallmark 戳，并把豁免改为写在 DESIGN.md 中。
3. [ ] 先写 `tests/slop_check.test.mjs`：每个 gate 的触发与不触发用例、tier 一致性（解析 md 表格）、声明材质、Floor 豁免被拒、exit code。
4. [ ] 实现 `scripts/slop_check.mjs`：先移植解析器与颜色工具，再逐个移植 gate，每移植一个就跑一次对应测试。
5. [ ] 写 `references/review-prompt.md`。
6. [ ] 修改 `implementation.md` 与 `design-system-core.md` §7。
7. [ ] 准备 SKILL.md 片段与 evals 用例，交给父任务整合。若父任务已进入整合阶段，则直接合入。
8. [ ] 在 skill 自身目录和 fixtures 上冒烟运行，再运行 `just node-test` 和 `just skills-check`。
9. [ ] 提交：`feat(skills): ✨ add anti-AI-slop gates to design-atlas`。

回滚：revert 提交即可。脚本与 reference 都是新增文件，对现有行为只有 implementation.md 中的文字改动。
