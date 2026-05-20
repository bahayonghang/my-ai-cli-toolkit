# Commands / Prompts

平台内容位于 `content/platforms/<platform>/`。不同平台消费内容的方式不同：有的平台使用 command 文件，有的平台使用 prompts、agents 或 rules。

## 何时添加 command / prompt / agent / rule

- **Command**：用户显式调用的工作流入口，适合有参数、固定步骤和平台 command 语义的任务。
- **Prompt**：Codex 等平台上的命令式工作流提示，适合复用但不一定映射为 command 文件的流程。
- **Agent**：角色化执行面，适合长期保持独立职责、模型/工具边界或子任务分派。
- **Rule / AGENTS.md**：项目或平台的基础指导，适合默认约束、目录规则和安全边界。

## 平台目录

### Antigravity

`content/platforms/antigravity/`

#### Commands

- `content/platforms/antigravity/commands/export-summary.toml`
- `content/platforms/antigravity/commands/import- summary.toml`
- `content/platforms/antigravity/commands/import-summary.toml`
- `content/platforms/antigravity/commands/plan/impl.toml`
- `content/platforms/antigravity/commands/plan/new.toml`

### Claude

`content/platforms/claude/`

#### Agents

- `content/platforms/claude/agents/ccw/action-planning-agent.md`
- `content/platforms/claude/agents/ccw/cli-discuss-agent.md`
- `content/platforms/claude/agents/ccw/cli-execution-agent.md`
- `content/platforms/claude/agents/ccw/cli-explore-agent.md`
- `content/platforms/claude/agents/ccw/cli-lite-planning-agent.md`
- `content/platforms/claude/agents/ccw/cli-planning-agent.md`
- `content/platforms/claude/agents/ccw/code-developer.md`
- `content/platforms/claude/agents/ccw/conceptual-planning-agent.md`
- `content/platforms/claude/agents/ccw/context-search-agent.md`
- `content/platforms/claude/agents/ccw/debug-explore-agent.md`
- `content/platforms/claude/agents/ccw/doc-generator.md`
- `content/platforms/claude/agents/ccw/issue-plan-agent.md`
- `content/platforms/claude/agents/ccw/issue-queue-agent.md`
- `content/platforms/claude/agents/ccw/memory-bridge.md`
- `content/platforms/claude/agents/ccw/test-context-search-agent.md`
- `content/platforms/claude/agents/ccw/test-fix-agent.md`
- `content/platforms/claude/agents/ccw/ui-design-agent.md`
- `content/platforms/claude/agents/ccw/universal-executor.md`
- `content/platforms/claude/agents/specialist/code-simplifier.md`
- `content/platforms/claude/agents/specialist/css.md`
- `content/platforms/claude/agents/specialist/deployment-specialist.md`
- `content/platforms/claude/agents/specialist/performance-optimizer.md`
- `content/platforms/claude/agents/specialist/python.md`
- `content/platforms/claude/agents/specialist/spec-analyst.md`
- `content/platforms/claude/agents/specialist/spec-architect.md`
- `content/platforms/claude/agents/specialist/spec-developer.md`
- `content/platforms/claude/agents/specialist/spec-planner.md`
- `content/platforms/claude/agents/specialist/spec-reviewer.md`
- `content/platforms/claude/agents/specialist/spec-task-reviewer.md`
- `content/platforms/claude/agents/specialist/spec-tester.md`
- `content/platforms/claude/agents/specialist/spec-validator.md`
- `content/platforms/claude/agents/specialist/typescript-expert.md`
- `content/platforms/claude/agents/specialist/ui-ux-designer.md`

#### Commands

- `content/platforms/claude/commands/archive-planning.md`
- `content/platforms/claude/commands/implement-with-notes.md`
- `content/platforms/claude/commands/init-projects.md`

### Codex

`content/platforms/codex/`

#### Agents

- `content/platforms/codex/agents/coder.toml`
- `content/platforms/codex/agents/frontend_ui.toml`
- `content/platforms/codex/agents/orchestrator.toml`
- `content/platforms/codex/agents/README.md`

#### Prompts

- `content/platforms/codex/prompts/archive-planning.md`
- `content/platforms/codex/prompts/codex-companion/adversarial-review.md`
- `content/platforms/codex/prompts/codex-companion/cancel.md`
- `content/platforms/codex/prompts/codex-companion/README.md`
- `content/platforms/codex/prompts/codex-companion/result.md`
- `content/platforms/codex/prompts/codex-companion/review.md`
- `content/platforms/codex/prompts/codex-companion/status.md`
- `content/platforms/codex/prompts/codex-companion/task.md`
- `content/platforms/codex/prompts/implement-with-notes.md`
- `content/platforms/codex/prompts/init-projects.md`

#### Rules

- `content/platforms/codex/rules/AGENTS.md`

Codex 当前主要使用 prompt / rule / agent 结构；添加“命令”前应先检查 `prompts/`、`agents/` 和 `rules/` 的既有约定。

## 修改后验证

```bash
just docs-check
just ci
```
