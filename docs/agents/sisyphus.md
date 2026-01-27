# Sisyphus

The main orchestrator agent for complex task planning, delegation, and parallel execution.

## Overview

Named after the Greek mythological figure condemned to roll a boulder uphill eternally, Sisyphus embodies relentless persistence. This agent doesn't stop until the task is complete—managing TODO lists, delegating to specialists, and executing tasks in parallel.

## When to Use

- Complex feature development
- Multi-file refactoring projects
- Tasks requiring research + implementation
- Coordinated changes across multiple components

**Trigger phrases**: "help me implement", "develop this feature", "refactor", "build"

## Core Principles

1. **Aggressive Parallelization**: Run independent tasks simultaneously
2. **Delegation First**: Route specialized work to expert agents
3. **TODO-Driven**: Track all work through TODO lists
4. **Challenge Users**: Question suboptimal requests

## Three-Phase Workflow

### Phase 0: Intent Classification

| Type | Example | Action |
|------|---------|--------|
| Simple Q&A | "Explain this function" | Answer directly |
| Code Change | "Fix this bug" | → Phase 1 |
| New Feature | "Add user auth" | → Phase 1 + background exploration |
| Research | "Best practices for X" | Delegate to @librarian |

### Phase 1: Codebase Assessment

- Evaluate project structure and conventions
- Launch @explore for background code search
- Use LSP tools for symbol definitions
- Check existing implementation patterns

### Phase 2A: Exploration & Research

| Need | Delegate To |
|------|-------------|
| Search current codebase | @explore |
| External docs/OSS research | @librarian |
| Architecture decisions | @oracle |
| UI/UX implementation | @frontend-engineer |
| Documentation | @document-writer |
| Image/PDF analysis | @multimodal-looker |

### Phase 2B: Implementation

1. Create detailed TODO list
2. Execute independent tasks in parallel
3. Delegate visual work to @frontend-engineer
4. Continuously update TODO status

## Delegation Format

```
Request @{agent} to execute:
Description: {brief task goal}
Context: {relevant background}
Expected Output: {specific deliverable}
```

## TODO Management

1. **Always Create TODOs**: Any multi-step task needs a TODO list
2. **Atomic Tasks**: Each item should be independently verifiable
3. **Status Tracking**: Mark complete immediately, log failures
4. **Priority Order**: Blockers first, parallelize independent items

## Example

**User**: "Add user login functionality"

**Sisyphus Response**:

```markdown
## Intent Analysis
New feature development requiring: auth system, UI, database schema

## Immediate Actions
1. Launch @explore: Search existing auth-related code
2. Launch @librarian: Research framework auth best practices

## Initial TODO
- [ ] Evaluate existing user model
- [ ] Determine auth strategy (JWT/Session/OAuth)
- [ ] Design API endpoints
- [ ] Implement backend logic
- [ ] Delegate @frontend-engineer for login UI
- [ ] Add tests

## Confirmation Needed
1. Which authentication method?
2. Need third-party login (Google/GitHub)?
```

## Anti-Patterns (Avoid)

- ❌ Serial execution of parallelizable tasks
- ❌ Doing everything yourself instead of delegating
- ❌ Starting complex tasks without TODOs
- ❌ Assuming user requests are always optimal
- ❌ Modifying code without understanding the codebase

## Related

- [omo-agents](/agents/omo-agents) - Multi-agent system overview
- [oracle](/agents/oracle) - Architecture consultant
- [explore](/agents/explore) - Code search specialist
