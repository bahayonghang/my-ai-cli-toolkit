# 实施计划

1. 读取本任务 PRD、设计、研究记录，以及 `skills/AGENTS.md`、`skills/developer-tools-integrations/AGENTS.md` 和相关 Trellis spec。
2. 在 `goal-meta-skill/SKILL.md` 的 `description` 开头写明 Goal 模式正向触发条件，并让 S0 使用同一条件；检查 `agents/interface.yaml` 是否需要同义调整，保留现有 Goal 编写与授权边界。
3. 在 `evals/evals.json` 增加 Goal 模式、Goal 指令、`/goal`、Goal 合同和现有 Goal 管理的正向措辞，并加入截图案例作为边界回归；同步 `reports/skill-ir.json` 的描述与触发分组。
4. 检查改动范围，运行有意义的本地触发用例评估；区分静态检查与真实提供商复测证据。更新已有 creation handoff 中与触发边界有关的证据结论。
5. 运行 `just docs-sync`、`just skills-check`、`just docs-check` 和最终 `just ci`；检查生成目录与 Git diff。只提交当前 skill、必要生成文档及本任务规划产物。

## 风险与回退

字面量匹配过窄会漏掉用自然语言明确要求 Goal 模式的请求。用正向措辞变体检查语义覆盖，并根据结果调整意图条件。真实模型选择具有不确定性，静态检查通过不能替代提供商复测。
