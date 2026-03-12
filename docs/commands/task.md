# Task Management Commands

Commands for creating, decomposing, executing, and replanning workflow tasks. Tasks are stored as JSON files within workflow sessions and support dependency tracking, agent routing, and status management.

## Commands

### `breakdown`

Decompose a complex task into subtasks with dependency mapping.

```bash
/task:breakdown "task-id"
```

Creates child task JSONs with parent references and execution order. Analyzes the parent task to identify logical subtask boundaries and inter-task dependencies.

### `create`

Generate a task JSON from natural language description.

```bash
/task:create "task title"
```

Automatically detects file patterns, infers scope, and analyzes dependencies from the description. Produces a structured task JSON with context, flow control, and target files.

### `execute`

Execute a task JSON using the appropriate agent.

```bash
/task:execute "task-id"
```

Routes to the correct agent (@doc-generator, @implementation-agent, or @test-agent) based on task metadata. Loads pre-analysis context, executes the implementation approach, and tracks status throughout.

### `replan`

Update task JSON with new requirements or batch-update from a verification report.

```bash
/task:replan "task-id" ["text"|file.md] | --batch [verification-report.md]
```

Supports single-task updates with inline text or file input, and batch updates from verification reports. Tracks all changes in `task-changes.json`.

## Examples

```bash
# Create a task from description
/task:create "Add OAuth2 login flow with Google provider"

# Break down a complex task
/task:breakdown IMPL-001

# Execute a specific task
/task:execute IMPL-003

# Update a task with new requirements
/task:replan IMPL-002 "Add rate limiting to the endpoint"

# Batch update from review findings
/task:replan --batch review-findings.md
```

## Notes

- Tasks are stored as JSON files in `.workflow/active/{session-id}/.task/`.
- Task IDs follow the `IMPL-NNN` convention.
- Dependencies are tracked via `depends_on` arrays in task JSON.
- The `execute` command automatically discovers the active workflow session.
