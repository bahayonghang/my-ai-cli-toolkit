# Agents Module

> 🏠 [← Back to Root](../CLAUDE.md) | 📁 `agents/`

AI agent definitions for Claude Code workflows and specialized tasks.

## Overview

This module contains markdown-based agent definitions that can be used as system prompts or skill references for AI-assisted development workflows.

## Structure

```
agents/
├── ccw/                    # Claude Code Workflow agents
│   ├── action-planning-agent.md
│   ├── cli-discuss-agent.md
│   ├── cli-execution-agent.md
│   ├── cli-explore-agent.md
│   ├── cli-lite-planning-agent.md
│   ├── cli-planning-agent.md
│   ├── code-developer.md
│   ├── conceptual-planning-agent.md
│   ├── context-search-agent.md
│   ├── debug-explore-agent.md
│   ├── doc-generator.md
│   ├── issue-plan-agent.md
│   ├── issue-queue-agent.md
│   ├── memory-bridge.md
│   ├── test-context-search-agent.md
│   ├── test-fix-agent.md
│   ├── ui-design-agent.md
│   └── universal-executor.md
└── specialist/             # Domain expert agents
    ├── code-simplifier.md
    ├── css.md
    ├── deployment-specialist.md
    ├── performance-optimizer.md
    ├── python.md
    ├── spec-analyst.md
    ├── spec-architect.md
    ├── spec-developer.md
    ├── spec-planner.md
    ├── spec-reviewer.md
    ├── spec-task-reviewer.md
    ├── spec-tester.md
    ├── spec-validator.md
    ├── typescript-expert.md
    └── ui-ux-designer.md
```

## Agent Categories

### CCW (Claude Code Workflow) Agents

Agents designed for orchestrating development workflows:

| Agent | Purpose |
|-------|---------|
| `action-planning-agent` | Plans concrete actions from high-level tasks |
| `cli-planning-agent` | Plans CLI-based development workflows |
| `cli-execution-agent` | Executes planned CLI commands |
| `cli-explore-agent` | Explores codebase via CLI |
| `context-search-agent` | Searches for relevant context |
| `debug-explore-agent` | Debugging and exploration |
| `code-developer` | Core code development |
| `doc-generator` | Documentation generation |
| `issue-plan-agent` | GitHub issue planning |
| `issue-queue-agent` | Issue queue management |
| `memory-bridge` | Context memory management |
| `test-fix-agent` | Test fixing and debugging |
| `ui-design-agent` | UI/UX design assistance |
| `universal-executor` | General task execution |

### Specialist Agents

Domain-specific expert agents:

| Agent | Expertise |
|-------|-----------|
| `python` | Python development best practices |
| `typescript-expert` | TypeScript/JavaScript expertise |
| `css` | CSS and styling |
| `code-simplifier` | Code simplification and refactoring |
| `performance-optimizer` | Performance optimization |
| `deployment-specialist` | Deployment and DevOps |
| `ui-ux-designer` | UI/UX design principles |
| `spec-*` | Specification-related agents (analyst, architect, developer, planner, reviewer, tester, validator) |

## Usage

These agents are typically used:

1. **As system prompts** - Load agent content as context for AI conversations
2. **In workflow commands** - Referenced by `/workflow/*` slash commands
3. **For task delegation** - Used by orchestrator agents to delegate subtasks

## Integration with Commands

Many agents are invoked by commands in `commands/claude/workflow/`:

```
commands/claude/workflow/
├── brainstorm/     # Uses specialist agents
├── tools/          # Uses CCW agents
└── session/        # Uses planning agents
```

## Agent Definition Format

Each agent is a markdown file with:
- Clear role definition
- Capabilities and constraints
- Input/output expectations
- Example interactions (optional)
