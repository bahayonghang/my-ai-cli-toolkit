# Agents Tutorial

A guide to using the specialized AI agents for development tasks.

## What are Agents?

Agents are specialized AI assistants that focus on specific domains. Instead of a single AI handling everything, different agents excel at what they do best:

- **Frontend Engineer** creates beautiful UIs
- **Document Writer** produces technical documentation

## Quick Start

Call agents directly for specific needs:

```
@frontend-engineer Create a subscription form with smooth animations

@document-writer Write comprehensive API documentation for the auth module
```

## Agent Reference

### Frontend Engineer - The UI Expert

**Best for**: Creating beautiful interfaces, animations, responsive design

**Principles**: Pixel-perfect, motion as soul, intuition-first

**Example**:
```
@frontend-engineer Create a dashboard card component with hover effects

@frontend-engineer Build a modal with smooth enter/exit animations
```

### Document Writer - The Technical Writer

**Best for**: README, API docs, architecture docs, JSDoc comments

**Document types**: README.md, API Reference, Architecture docs, User guides

**Example**:
```
@document-writer Write comprehensive API documentation for the auth module

@document-writer Add JSDoc comments to this service class
```

## Best Practices

### 1. Choose the Right Agent

| Need | Agent |
|------|-------|
| Build UI components | @frontend-engineer |
| Write documentation | @document-writer |

### 2. Provide Good Context

**Bad**:
```
@frontend-engineer make it pretty
```

**Good**:
```
@frontend-engineer Create a dashboard card component with glassmorphism style, hover depth effect, and responsive layout
```

## Troubleshooting

**Agent not responding as expected?**
- Provide more context about your project
- Be specific about what you need

**Results not accurate?**
- Verify the agent has access to relevant files
- Provide file paths or code snippets as context
