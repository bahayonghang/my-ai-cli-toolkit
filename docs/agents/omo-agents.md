# OMO Agents

Multi-agent orchestration system inspired by [oh-my-opencode](https://github.com/code-yeongyu/oh-my-opencode).

## Overview

OMO Agents brings the power of multi-agent collaboration to your development workflow. Instead of a single AI handling everything, specialized agents work together—each excelling in their domain—to deliver better results.

## Core Philosophy

The oh-my-opencode project demonstrates that LLM agents work best when:

1. **Specialized**: Each agent focuses on what it does best
2. **Collaborative**: Agents delegate to each other based on expertise
3. **Parallel**: Independent tasks run simultaneously
4. **Context-aware**: Agents maintain lean context by delegating exploration

## Agent Roster

| Agent | Role | Best For |
|-------|------|----------|
| [@sisyphus](/agents/sisyphus) | Orchestrator | Complex multi-step tasks, coordination |
| [@oracle](/agents/oracle) | Architect | Design decisions, code review, debugging |
| [@librarian](/agents/librarian) | Researcher | Documentation, best practices, OSS research |
| [@explore](/agents/explore) | Scout | Code search, dependency tracking |
| [@frontend-engineer](/agents/frontend-engineer) | UI Expert | Beautiful interfaces, animations |
| [@document-writer](/agents/document-writer) | Writer | README, API docs, technical writing |
| [@multimodal-looker](/agents/multimodal-looker) | Analyst | Images, PDFs, diagrams |

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

## How It Works

```
┌─────────────────────────────────────────────────────────┐
│                    User Request                         │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                 @sisyphus (Orchestrator)                │
│  • Analyzes intent                                      │
│  • Creates TODO list                                    │
│  • Delegates to specialists                             │
│  • Tracks progress                                      │
└───────┬─────────┬─────────┬─────────┬─────────┬────────┘
        │         │         │         │         │
        ▼         ▼         ▼         ▼         ▼
   @explore   @oracle  @librarian  @frontend  @document
   (Search)   (Advise) (Research)  (Build UI) (Write)
```

## Best Practices

### 1. Choose the Right Agent

| Need | Agent |
|------|-------|
| "Where is X in the codebase?" | @explore |
| "How should I design X?" | @oracle |
| "How do others implement X?" | @librarian |
| "Build this UI component" | @frontend-engineer |
| "Write documentation for X" | @document-writer |
| "What does this image show?" | @multimodal-looker |

### 2. Provide Context

```
❌ "@explore find that function"
✅ "@explore find the payment processing function, likely in src/services/"

❌ "@oracle is this good?"
✅ "@oracle evaluate this authentication flow for a medium-scale SaaS app"
```

### 3. Use Sisyphus for Complex Tasks

- Simple query → Direct agent call
- Multi-step development → @sisyphus
- Unsure which agent? → @sisyphus will route it

## Example Workflows

### Feature Development

```
User: @sisyphus Add a user review system to this product page

Sisyphus:
1. @explore → Find existing product/review code
2. @oracle → Design review data model and API
3. @librarian → Research review system patterns
4. Execute backend implementation
5. @frontend-engineer → Build review UI components
6. @document-writer → Update API documentation
```

### Code Refactoring

```
User: @sisyphus Refactor the user module for better maintainability

Sisyphus:
1. @explore → Map all user-related files
2. @oracle → Identify issues and improvement plan
3. @librarian → Research similar project structures
4. Execute refactoring with TODO tracking
5. @document-writer → Update module documentation
```

### Bug Investigation

```
User: @sisyphus Users report login fails intermittently

Sisyphus:
1. @explore → Find auth/login code paths
2. @oracle → Analyze potential failure points
3. @librarian → Check for known issues in dependencies
4. Implement fix with proper error handling
```

## Related Skills

- [sisyphus](/agents/sisyphus) - Main orchestrator agent
- [oracle](/agents/oracle) - Architecture consultant
- [librarian](/agents/librarian) - Documentation researcher
- [explore](/agents/explore) - Code search specialist
- [frontend-engineer](/agents/frontend-engineer) - UI/UX expert
- [document-writer](/agents/document-writer) - Technical writer
- [multimodal-looker](/agents/multimodal-looker) - Visual content analyst
