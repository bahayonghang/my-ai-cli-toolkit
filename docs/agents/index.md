# Agents Overview

OMO Agents is a multi-agent orchestration system inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode). Instead of a single AI handling everything, specialized agents work together—each excelling in their domain—to deliver better results.

## Agent Roster

| Agent | Role | Best For | Description |
|-------|------|----------|-------------|
| [@sisyphus](./sisyphus) | Orchestrator | Complex tasks | Main orchestrator for multi-step tasks, delegation, and parallel execution |
| [@oracle](./oracle) | Architect | Design decisions | Expert technical consultant for architecture, code review, and debugging |
| [@explore](./explore) | Scout | Code search | Fast code search agent for locating code, files, and patterns |
| [@librarian](./librarian) | Researcher | Documentation | External docs researcher and implementation reference specialist |
| [@frontend-engineer](./frontend-engineer) | UI Expert | Beautiful interfaces | UI/UX design and development expert for polished interfaces |
| [@document-writer](./document-writer) | Writer | Technical docs | Technical documentation expert for README, API docs, and guides |
| [@multimodal-looker](./multimodal-looker) | Analyst | Visual content | Visual content analysis expert for images, PDFs, and charts |

## Quick Start

### Direct Agent Calls

```
@oracle Should I use Redux or Zustand for state management?

@explore Find all authentication-related code

@librarian How does Next.js 14 handle Server Actions?

@frontend-engineer Create a subscription form with animations
```

### Orchestrated Workflow

For complex tasks, let Sisyphus coordinate:

```
@sisyphus Add user authentication to this e-commerce project
```

Sisyphus will automatically:
1. Analyze the task and break it into subtasks
2. Dispatch @explore to find existing auth code
3. Consult @oracle for architecture decisions
4. Send @librarian to research best practices
5. Delegate UI work to @frontend-engineer
6. Have @document-writer update documentation

## Choosing the Right Agent

| Need | Agent |
|------|-------|
| "Where is X in the codebase?" | @explore |
| "How should I design X?" | @oracle |
| "How do others implement X?" | @librarian |
| "Build this UI component" | @frontend-engineer |
| "Write documentation for X" | @document-writer |
| "What does this image show?" | @multimodal-looker |
| Complex multi-step task | @sisyphus |

## Core Philosophy

The oh-my-opencode project demonstrates that LLM agents work best when:

1. **Specialized**: Each agent focuses on what it does best
2. **Collaborative**: Agents delegate to each other based on expertise
3. **Parallel**: Independent tasks run simultaneously
4. **Context-aware**: Agents maintain lean context by delegating exploration

## See Also

- [Skills](/skills/) - Individual skill definitions
- [OMO Agents Tutorial](/guide/omo-agents-tutorial) - Detailed tutorial and examples
