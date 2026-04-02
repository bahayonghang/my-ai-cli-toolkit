# agent-creator

用于创建、校验并评测 **OpenAI Codex 的自定义 agents（subagents）**，产物为 Codex 原生 `.toml` 文件。

## 能做什么

- 生成 `.codex/agents/` 或 `~/.codex/agents/` 下的 agent TOML
- 静态校验 agent TOML（必填字段、常见约束、风险提示）
- 运行一组行为评测（with-agent vs baseline），输出报告

## 关键文件

- `content/skills/meta-skills/agent-creator/SKILL.md`
- `content/skills/meta-skills/agent-creator/scripts/create_agent_toml.py`
- `content/skills/meta-skills/agent-creator/scripts/lint_agent_toml.py`
- `content/skills/meta-skills/agent-creator/scripts/run_agent_evals.py`

