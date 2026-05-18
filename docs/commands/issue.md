# Issue Lifecycle Commands

> Historical / offline note: this page documents a removed command family. The matching source tree is not present in current `content/platforms/*/commands/`, and this page is intentionally kept outside the live sidebar.


GitHub issue lifecycle management -- discover, create, plan, queue, and execute issues through a structured workflow.

## Commands

### `discover`

**Description**: Multi-perspective issue discovery that scans code modules for potential bugs, UX issues, test gaps, security vulnerabilities, and more.
**Usage**: `/issue:discover <path-pattern> [--perspectives=bug,ux,...] [--external]`

#### How It Works

1. Parse target pattern and resolve matching files
2. Select perspectives interactively or via `--perspectives` flag
3. Launch parallel agents (one per perspective) to analyze code
4. Aggregate findings, deduplicate by file+line, calculate priority scores
5. Generate issue candidates and prompt for next action (export, dashboard, skip)

#### Available Perspectives

| Perspective | Focus | Exa Research |
|-------------|-------|:------------:|
| `bug` | Edge cases, null checks, resource leaks, race conditions | - |
| `ux` | Error messages, loading states, accessibility, consistency | - |
| `test` | Missing tests, coverage gaps, assertion quality | - |
| `quality` | Complexity, duplication, naming, code smells | - |
| `security` | Injection, auth, encryption, input validation | Yes |
| `performance` | N+1 queries, memory usage, caching, blocking ops | - |
| `maintainability` | Coupling, cohesion, tech debt, module boundaries | - |
| `best-practices` | Conventions, anti-patterns, framework usage | Yes |

When no `--perspectives` flag is provided, an interactive prompt offers preset combinations: quick scan (`bug,test,quality`), security audit (`security,bug,quality`), or full analysis (all perspectives).

Output is stored in `.workflow/issues/discoveries/{discovery-id}/`.

### `discover-by-prompt`

**Description**: Prompt-driven issue discovery with Gemini-planned iterative multi-agent exploration and cross-module comparison.
**Usage**: `/issue:discover-by-prompt "<prompt>" [--scope=src/**] [--depth=standard|deep] [--max-iterations=5]`

Unlike `discover` (fixed perspectives, parallel execution), this command accepts natural language prompts and dynamically generates exploration dimensions via Gemini planning. Supports cross-module comparison (e.g., frontend vs backend API contracts).

#### Options

| Flag | Default | Description |
|------|---------|-------------|
| `--scope` | `**/*` | File pattern to explore |
| `--depth` | `standard` | `standard` (3 iterations) or `deep` (5+) |
| `--max-iterations` | `5` | Maximum exploration iterations |
| `--plan-only` | `false` | Stop after planning phase for review |

#### How It Works

1. **Prompt Analysis** - Parse user prompt, detect intent type (comparison, search, verification, audit)
2. **ACE Context Gathering** - Semantic search to understand codebase structure and identify relevant modules
3. **Gemini Strategy Planning** - Gemini analyzes prompt + context to design exploration dimensions and comparison matrix
4. **Iterative Agent Exploration** - Multi-agent exploration with feedback loops; each iteration builds on previous findings using ACE for deeper search
5. **Cross-Analysis & Synthesis** - Compare findings across dimensions, identify discrepancies, calculate confidence scores
6. **Issue Generation** - Convert high-confidence findings to issue candidates

### `new`

**Description**: Create a new structured issue from a GitHub URL or text description.
**Usage**: `/issue:new <github-url | text-description> [--priority 1-5]`

Supports three input types based on clarity detection:

| Input Type | Clarity | Behavior |
|------------|---------|----------|
| GitHub URL or `#123` | High (3) | Fetch and parse directly via `gh` CLI |
| Structured text (`expected:`, `actual:`) | Medium (1-2) | Parse fields, optional ACE context hint |
| Vague description | Low (0) | Ask one clarifying question |

Non-GitHub issues can optionally be published to GitHub with automatic linking between local and remote issues.

### `plan`

**Description**: Batch plan issue resolution using unified explore + plan agents.
**Usage**: `/issue:plan [<issue-id>[,<issue-id>,...]] [--all-pending] [--batch-size 3]`

#### How It Works

1. **Issue Loading** - Parse input IDs or default to `--all-pending`; fetch brief metadata via CLI
2. **Semantic Grouping** - Group similar issues by title/tags (via Gemini) into batches of up to 3
3. **Unified Explore + Plan** - Launch parallel agents per batch; each agent performs ACE semantic search, codebase exploration, and solution generation with task breakdowns
4. **Solution Binding** - Single solution per issue is auto-bound; multiple candidates prompt user selection
5. **Summary** - Display bound solutions, task counts, and next steps

Failure-aware planning: if an issue has previous execution failures in its feedback history, the agent analyzes failure patterns and designs alternative approaches.

### `queue`

**Description**: Form execution queues from bound solutions with conflict analysis and dependency ordering.
**Usage**: `/issue:queue [--queues <n>] [--issue <id>] [--append <id>]`

Analyzes all bound solutions, resolves inter-solution conflicts, builds a dependency DAG, and creates ordered execution queues at solution level.

#### Options

| Flag | Description |
|------|-------------|
| `--queues <n>` | Number of parallel queues (default: 1) |
| `--issue <id>` | Form queue for specific issue only |
| `--append <id>` | Append issue to active queue |
| `--force` | Skip active queue check, always create new |

#### How It Works

1. **Solution Loading** - Load planned issues with bound solutions, extract files touched
2. **Agent-Driven Queue Formation** - Launch queue agents (parallel if multi-queue) for conflict analysis, dependency DAG construction, priority calculation, and execution group assignment
3. **Conflict Clarification** - High-severity conflicts prompt user decision via interactive selection
4. **Status Update** - Update issue statuses to `queued`
5. **Active Queue Check** - If an active queue exists, prompt to merge, switch, or cancel

Queue items are solutions (not individual tasks). Each executor receives a complete solution.

### `execute`

**Description**: Execute queued solutions using DAG-based parallel orchestration.
**Usage**: `/issue:execute --queue <queue-id> [--worktree [<existing-path>]]`

Dispatches solution IDs to executors. Each executor receives a complete solution with all tasks, implements them sequentially, and commits once per solution.

#### Options

| Flag | Description |
|------|-------------|
| `--queue <id>` | Queue to execute (required; interactive selection if omitted) |
| `--worktree` | Create one worktree for entire queue isolation |
| `--worktree <path>` | Resume in an existing worktree |

#### How It Works

1. **Validate Queue** - Require explicit queue ID or prompt user to select from active queues
2. **Get DAG** - Fetch dependency graph with parallel batches; user selects executor type (Codex, Gemini, or Claude agent) and execution mode
3. **Dispatch Batches** - Launch all solutions in a batch in parallel (DAG guarantees no file conflicts); each executor calls `ccw issue detail`, implements all tasks, commits once, then calls `ccw issue done`
4. **Next Batch** - Refresh DAG after batch completion, dispatch newly-ready solutions
5. **Worktree Completion** - When all batches complete, prompt for merge strategy (create PR, merge to main, or keep branch)

## Examples

```bash
# Discover issues in auth module with quick scan
/issue:discover src/auth/** --perspectives=bug,test,quality

# Prompt-driven discovery for API contract mismatches
/issue:discover-by-prompt "Check if frontend API calls match backend implementations"

# Deep exploration with more iterations
/issue:discover-by-prompt "Find inconsistent error handling" --depth=deep

# Create issue from GitHub URL
/issue:new https://github.com/org/repo/issues/42

# Create issue from text description
/issue:new "Login fails with special chars. Expected: success. Actual: 500 error"

# Plan all pending issues
/issue:plan

# Plan specific issues
/issue:plan GH-123,GH-124

# Form execution queue
/issue:queue

# Form 3 parallel queues
/issue:queue --queues 3

# Execute queue in isolated worktree
/issue:execute --queue QUE-xxx --worktree
```

## Notes

- The full pipeline is: `new` -> `plan` -> `queue` -> `execute`
- `discover` and `discover-by-prompt` are standalone discovery tools that feed into the pipeline via export
- All data is stored under `.workflow/issues/` (issues.jsonl, solutions/, queues/, discoveries/)
- Use CLI commands (`ccw issue ...`) for CRUD operations; never read large JSONL files directly
- `execute` requires the `gh` CLI for worktree PR creation
- Codex is the recommended executor for `execute` (2-hour timeout, full write access)
