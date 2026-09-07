# Commands / Prompts

平台内容位于 `platforms/<platform>/`。不同平台消费内容的方式不同：有的平台使用 command 文件，有的平台使用 agents、hooks 或 rules。本页只列出仓库里实际存在的文件。

## 何时添加 command / prompt / agent / rule

- **Command**：用户显式调用的工作流入口，适合有参数、固定步骤和平台 command 语义的任务。
- **Prompt**：仅当平台源目录里确实有 prompt 文件时使用。本仓库当前没有 `platforms/codex/prompts/`。
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

#### Root files

- `platforms/antigravity/AGENTS.md`
- `platforms/antigravity/code_map.md`

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

#### Hooks

- `platforms/claude/hooks/hooks.json`
- `platforms/claude/hooks/log-prompt.py`
- `platforms/claude/hooks/pre-bash.py`
- `platforms/claude/hooks/tests/test_hooks.py`

#### Root files

- `platforms/claude/AGENTS.md`
- `platforms/claude/code_map.md`

### Codex

`platforms/codex/`

#### Agents

- `platforms/codex/agents/coder.toml`
- `platforms/codex/agents/frontend_ui.toml`
- `platforms/codex/agents/orchestrator.toml`
- `platforms/codex/agents/README.md`

#### Root files

- `platforms/codex/AGENTS.md`
- `platforms/codex/code_map.md`

本仓库的 Codex 源目前只有 `platforms/codex/agents/`。可复用工作流放在 `skills/`（例如 `$git-commit`）。不要假定存在 `platforms/codex/prompts/` 或 `$archive-planning`。

## 修改后验证

```bash
just docs-check
just ci
```
