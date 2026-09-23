# 设计：Goal 模式正向触发条件

## 边界与机制

`SKILL.md` frontmatter 的 `description` 是加载前的路由入口。主条件是用户明确要求使用 Goal 模式，或请求 Goal 专用的编写、保存、管理操作。跨会话、Trellis、审阅修复是该条件成立后的任务场景。S0 在加载后复核同一条件，再选择对应的 Goal 工作流。

正向意图包括“使用 Codex Goal 模式”“写成 `/goal`”“编写 Claude Code Goal 指令”“将已确认的 Goal 合同保存为 `GOAL.md`”和“管理当前 Goal”。自然语言表达与命令字面量同等有效。显式调用 `$goal-meta-skill` 仍按用户指定的 skill 处理。

## 资料同步

只在必要处更新 `SKILL.md`、`reports/skill-ir.json`，以及存在冲突时的 `agents/interface.yaml`。公开目录由 `just docs-sync` 生成，不手改生成页。保留仓库唯一的 `evals/evals.json` 格式，不另建与仓库约定冲突的 per-skill 触发用例格式。

## 验证边界

先用多种 Goal 模式正向表达检查触发覆盖，再用截图中的普通重构交接 Prompt 检查边界。截图案例只用于回归验证，不作为触发规则的设计依据。静态用例和本地检查证明规则与资产一致；Claude Code 的真实选择行为需要单独复测。未运行真实复测时写明 `missing evidence`。

这是现有 skill 的小范围路由修复。已有 prior-art 报告可作为背景；不为这次边界修复重新做公开目录搜索。
