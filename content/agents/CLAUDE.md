# `content/agents/`

This directory contains the repository's markdown agent definitions.

## Current families

```text
content/agents/
├── ccw/
└── specialist/
```

## `ccw/`

Workflow-facing agents used for planning, exploration, execution, testing, UI design, issue handling, and task coordination.

Representative entries include:

- `action-planning-agent.md`
- `cli-execution-agent.md`
- `context-search-agent.md`
- `doc-generator.md`
- `issue-plan-agent.md`
- `test-fix-agent.md`
- `ui-design-agent.md`
- `universal-executor.md`

## `specialist/`

Narrow domain experts used when a workflow needs focused knowledge rather than orchestration.

Representative entries include:

- `code-simplifier.md`
- `css.md`
- `deployment-specialist.md`
- `performance-optimizer.md`
- `python.md`
- `typescript-expert.md`
- the `spec-*` family

## Relationship to commands

These files are source assets for higher-level workflows. They are commonly referenced by repository commands or orchestration logic rather than installed as end-user skills.
