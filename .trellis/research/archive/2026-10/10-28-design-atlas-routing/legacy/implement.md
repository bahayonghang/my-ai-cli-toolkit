# 执行计划：自动路由

1. [ ] 先写 `tests/test_routing.py` 的 fixture 用例和断言（此时应失败）：路由集合、确定性、多样性、项目信号、overlay 校验。
2. [ ] 起草 `overlays/routing.json`：
   - style：根据各 style 文件的 Overview 与 tokens 编写 genre、keywords_en、keywords_zh、axes、cluster。
   - scene：bi 的中文关键词要覆盖“经营分析、数据看板、驾驶舱、报表、BI”。
   - theme：只写 keywords_zh 与 cluster，参考上游英文 keywords 意译，并补充中文需求中的常见说法。
3. [ ] `design_catalog.py`：加载并合并 overlay → `signals` → 文本归一 → 打分 → 选取 → 文本与 JSON 输出。每个阶段都是可单测的纯函数。
4. [ ] 跑测试并调关键词。只有在多个 fixture 都受益时才改打分权重，不为单个用例改常量（父 research §7 的 generalization gate）。
5. [ ] 写 `references/routing.md`（agent 决策规则、Picks 块模板）。
6. [ ] 修改 SKILL.md 第 3 步与命令表，加入 `signals` / `route`，并保持 `<skill-dir>` 占位。
7. [ ] 在 evals.json 中加入自动路由（中文、英文）与“要求比较”用例。
8. [ ] 运行 `just python-test`、`just skills-check`。
9. [ ] 提交：`feat(skills): ✨ add project-aware auto-routing to design-atlas`。

回滚：revert 提交即可。SKILL.md 中的旧行为（给候选并等待）随之恢复。
