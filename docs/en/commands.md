# Commands / Prompts

Platform content lives under `content/platforms/<platform>/`. Each platform consumes content differently: some use command files, while others use prompts, agents, or rules.

## When to add a command, prompt, agent, or rule

- **Command**: user-invoked workflow entrypoint with arguments, fixed steps, and platform command semantics.
- **Prompt**: command-like workflow prompt for platforms such as Codex when no command directory is the native surface.
- **Agent**: role-specialized execution surface with stable responsibility, model/tool boundaries, or subtask routing.
- **Rule / AGENTS.md**: baseline project or platform guidance for default constraints, directory rules, and safety boundaries.

## Platform catalog

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

Codex currently uses prompt / rule / agent assets; before adding a “command”, check existing `prompts/`, `agents/`, and `rules/` conventions.

## Validation after changes

```bash
just docs-check
just ci
```
