# Commands / Prompts

平台内容位于 `platforms/<platform>/`。不同平台消费内容的方式不同：有的平台使用 command 文件，有的平台使用 prompts、agents 或 rules。

## 何时添加 command / prompt / agent / rule

- **Command**：用户显式调用的工作流入口，适合有参数、固定步骤和平台 command 语义的任务。
- **Prompt**：Codex 等平台上的命令式工作流提示，适合复用但不一定映射为 command 文件的流程。
- **Agent**：角色化执行面，适合长期保持独立职责、模型/工具边界或子任务分派。
- **Rule / AGENTS.md**：项目或平台的基础指导，适合默认约束、目录规则和安全边界。

## 平台目录

### Antigravity

`platforms/antigravity/`

#### Commands

- `platforms/antigravity/commands/export-summary.toml`
- `platforms/antigravity/commands/import- summary.toml`
- `platforms/antigravity/commands/import-summary.toml`
- `platforms/antigravity/commands/plan/impl.toml`
- `platforms/antigravity/commands/plan/new.toml`

### Claude

`platforms/claude/`

#### Agents

- `platforms/claude/agents/ccw/action-planning-agent.md`
- `platforms/claude/agents/ccw/cli-discuss-agent.md`
- `platforms/claude/agents/ccw/cli-execution-agent.md`
- `platforms/claude/agents/ccw/cli-explore-agent.md`
- `platforms/claude/agents/ccw/cli-lite-planning-agent.md`
- `platforms/claude/agents/ccw/cli-planning-agent.md`
- `platforms/claude/agents/ccw/code-developer.md`
- `platforms/claude/agents/ccw/conceptual-planning-agent.md`
- `platforms/claude/agents/ccw/context-search-agent.md`
- `platforms/claude/agents/ccw/debug-explore-agent.md`
- `platforms/claude/agents/ccw/doc-generator.md`
- `platforms/claude/agents/ccw/issue-plan-agent.md`
- `platforms/claude/agents/ccw/issue-queue-agent.md`
- `platforms/claude/agents/ccw/memory-bridge.md`
- `platforms/claude/agents/ccw/test-context-search-agent.md`
- `platforms/claude/agents/ccw/test-fix-agent.md`
- `platforms/claude/agents/ccw/ui-design-agent.md`
- `platforms/claude/agents/ccw/universal-executor.md`
- `platforms/claude/agents/specialist/code-simplifier.md`
- `platforms/claude/agents/specialist/css.md`
- `platforms/claude/agents/specialist/deployment-specialist.md`
- `platforms/claude/agents/specialist/performance-optimizer.md`
- `platforms/claude/agents/specialist/python.md`
- `platforms/claude/agents/specialist/spec-analyst.md`
- `platforms/claude/agents/specialist/spec-architect.md`
- `platforms/claude/agents/specialist/spec-developer.md`
- `platforms/claude/agents/specialist/spec-planner.md`
- `platforms/claude/agents/specialist/spec-reviewer.md`
- `platforms/claude/agents/specialist/spec-task-reviewer.md`
- `platforms/claude/agents/specialist/spec-tester.md`
- `platforms/claude/agents/specialist/spec-validator.md`
- `platforms/claude/agents/specialist/typescript-expert.md`
- `platforms/claude/agents/specialist/ui-ux-designer.md`

#### Commands

- `platforms/claude/commands/archive-planning.md`
- `platforms/claude/commands/implement-with-notes.md`
- `platforms/claude/commands/init-projects.md`

#### Hooks

- `platforms/claude/hooks/hooks.json`
- `platforms/claude/hooks/inject-spec.py`
- `platforms/claude/hooks/log-prompt.py`
- `platforms/claude/hooks/pre-bash.py`

### Codex

`platforms/codex/`

#### Agents

- `platforms/codex/agents/coder.toml`
- `platforms/codex/agents/frontend_ui.toml`
- `platforms/codex/agents/orchestrator.toml`
- `platforms/codex/agents/README.md`

#### Prompts

- `platforms/codex/prompts/archive-planning.md`
- `platforms/codex/prompts/codex-companion/adversarial-review.md`
- `platforms/codex/prompts/codex-companion/cancel.md`
- `platforms/codex/prompts/codex-companion/README.md`
- `platforms/codex/prompts/codex-companion/result.md`
- `platforms/codex/prompts/codex-companion/review.md`
- `platforms/codex/prompts/codex-companion/status.md`
- `platforms/codex/prompts/codex-companion/task.md`
- `platforms/codex/prompts/implement-with-notes.md`
- `platforms/codex/prompts/init-projects.md`

#### Rules

- `platforms/codex/rules/AGENTS.md`

Codex 当前主要使用 prompt / rule / agent 结构；添加“命令”前应先检查 `prompts/`、`agents/` 和 `rules/` 的既有约定。

## 修改后验证

```bash
just docs-check
just ci
```
