# Commands / Prompts

Platform content lives under `platforms/<platform>/`. Each platform consumes content differently: some use command files, while others use prompts, agents, or rules.

## When to add a command, prompt, agent, or rule

- **Command**: user-invoked workflow entrypoint with arguments, fixed steps, and platform command semantics.
- **Prompt**: command-like workflow prompt for platforms such as Codex when no command directory is the native surface.
- **Agent**: role-specialized execution surface with stable responsibility, model/tool boundaries, or subtask routing.
- **Rule / AGENTS.md**: baseline project or platform guidance for default constraints, directory rules, and safety boundaries.

## Platform catalog

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

Codex currently uses prompt / rule / agent assets; before adding a “command”, check existing `prompts/`, `agents/`, and `rules/` conventions.

## Validation after changes

```bash
just docs-check
just ci
```
