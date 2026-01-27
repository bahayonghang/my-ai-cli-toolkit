---
name: execute
description: Execute queue with DAG-based parallel orchestration (one commit per solution)
argument-hint: "--queue <queue-id> [--worktree [<existing-path>]]"
allowed-tools: TodoWrite(*), Bash(*), Read(*), AskUserQuestion(*)
---

# Issue Execute Command (/issue:execute)

## Overview

Minimal orchestrator that dispatches **solution IDs** to executors. Each executor receives a complete solution with all its tasks.

**Design Principles:**
- `queue dag` → returns parallel batches with solution IDs (S-1, S-2, ...)
- `detail <id>` → READ-ONLY solution fetch (returns full solution with all tasks)
- `done <id>` → update solution completion status
- No race conditions: status changes only via `done`
- **Executor handles all tasks within a solution sequentially**
- **Single worktree for entire queue**: One worktree isolates ALL queue execution from main workspace

## Queue ID Requirement (MANDATORY)

**Queue ID is REQUIRED.** You MUST specify which queue to execute via `--queue <queue-id>`.

### If Queue ID Not Provided

When `--queue` parameter is missing, you MUST:

1. **List available queues** by running:
```javascript
const result = Bash('ccw issue queue list --brief --json');
const index = JSON.parse(result);
```

2. **Display available queues** to user:
```
Available Queues:
ID                    Status      Progress    Issues
-----------------------------------------------------------
→ QUE-20251215-001   active      3/10        ISS-001, ISS-002
  QUE-20251210-002   active      0/5         ISS-003
  QUE-20251205-003   completed   8/8         ISS-004
```

3. **Stop and ask user** to specify which queue to execute:
```javascript
AskUserQuestion({
  questions: [{
    question: "Which queue would you like to execute?",
    header: "Queue",
    multiSelect: false,
    options: index.queues
      .filter(q => q.status === 'active')
      .map(q => ({
        label: q.id,
        description: `${q.status}, ${q.completed_solutions || 0}/${q.total_solutions || 0} completed, Issues: ${q.issue_ids.join(', ')}`
      }))
  }]
})
```

4. **After user selection**, continue execution with the selected queue ID.

**DO NOT auto-select queues.** Explicit user confirmation is required to prevent accidental execution of wrong queue.

## Usage

```bash
/issue:execute --queue QUE-xxx           # Execute specific queue (REQUIRED)
/issue:execute --queue QUE-xxx --worktree  # Execute in isolated worktree
/issue:execute --queue QUE-xxx --worktree /path/to/existing/worktree  # Resume
```

**Parallelism**: Determined automatically by task dependency DAG (no manual control)
**Executor & Dry-run**: Selected via interactive prompt (AskUserQuestion)
**Worktree**: Creates ONE worktree for the entire queue execution (not per-solution)

**⭐ Recommended Executor**: **Codex** - Best for long-running autonomous work (2hr timeout), supports background execution and full write access

**Worktree Options**:
- `--worktree` - Create a new worktree with timestamp-based name
- `--worktree <existing-path>` - Resume in an existing worktree (for recovery/continuation)

**Resume**: Use `git worktree list` to find existing worktrees from interrupted executions

## Execution Flow

```
Phase 0: Validate Queue ID (REQUIRED)
   ├─ If --queue provided → use specified queue
   ├─ If --queue missing → list queues, prompt user to select
   └─ Store QUEUE_ID for all subsequent commands

Phase 0.5 (if --worktree): Setup Queue Worktree
   ├─ Create ONE worktree for entire queue: .ccw/worktrees/queue-<timestamp>
   ├─ All subsequent execution happens in this worktree
   └─ Main workspace remains clean and untouched

Phase 1: Get DAG & User Selection
   ├─ ccw issue queue dag --queue ${QUEUE_ID} → { parallel_batches: [["S-1","S-2"], ["S-3"]] }
   └─ AskUserQuestion → executor type (codex|gemini|agent), dry-run mode, worktree mode

Phase 2: Dispatch Parallel Batch (DAG-driven)
   ├─ Parallelism determined by DAG (no manual limit)
   ├─ All executors work in the SAME worktree (or main if no worktree)
   ├─ For each solution ID in batch (parallel - all at once):
   │   ├─ Executor calls: ccw issue detail <id>  (READ-ONLY)
   │   ├─ Executor gets FULL SOLUTION with all tasks
   │   ├─ Executor implements all tasks sequentially (T1 → T2 → T3)
   │   ├─ Executor tests + verifies each task
   │   ├─ Executor commits ONCE per solution (with formatted summary)
   │   └─ Executor calls: ccw issue done <id>
   └─ Wait for batch completion

Phase 3: Next Batch (repeat Phase 2)
   └─ ccw issue queue dag → check for newly-ready solutions

Phase 4 (if --worktree): Worktree Completion
   ├─ All batches complete → prompt for merge strategy
   └─ Options: Create PR / Merge to main / Keep branch
```

## Implementation

### Phase 0: Validate Queue ID

```javascript
// Check if --queue was provided
let QUEUE_ID = args.queue;

if (!QUEUE_ID) {
  // List available queues
  const listResult = Bash('ccw issue queue list --brief --json').trim();
  const index = JSON.parse(listResult);

  if (index.queues.length === 0) {
    console.log('No queues found. Use /issue:queue to create one first.');
    return;
  }

  // Filter active queues only
  const activeQueues = index.queues.filter(q => q.status === 'active');

  if (activeQueues.length === 0) {
    console.log('No active queues found.');
    console.log('Available queues:', index.queues.map(q => `${q.id} (${q.status})`).join(', '));
    return;
  }

  // Display and prompt user
  console.log('\nAvailable Queues:');
  console.log('ID'.padEnd(22) + 'Status'.padEnd(12) + 'Progress'.padEnd(12) + 'Issues');
  console.log('-'.repeat(70));
  for (const q of index.queues) {
    const marker = q.id === index.active_queue_id ? '→ ' : '  ';
    console.log(marker + q.id.padEnd(20) + q.status.padEnd(12) +
      `${q.completed_solutions || 0}/${q.total_solutions || 0}`.padEnd(12) +
      q.issue_ids.join(', '));
  }

  const answer = AskUserQuestion({
    questions: [{
      question: "Which queue would you like to execute?",
      header: "Queue",
      multiSelect: false,
      options: activeQueues.map(q => ({
        label: q.id,
        description: `${q.completed_solutions || 0}/${q.total_solutions || 0} completed, Issues: ${q.issue_ids.join(', ')}`
      }))
    }]
  });

  QUEUE_ID = answer['Queue'];
}

console.log(`\n## Executing Queue: ${QUEUE_ID}\n`);
```

### Phase 1: Get DAG & User Selection

```javascript
// Get dependency graph and parallel batches (QUEUE_ID required)
const dagJson = Bash(`ccw issue queue dag --queue ${QUEUE_ID}`).trim();
const dag = JSON.parse(dagJson);

if (dag.error || dag.ready_count === 0) {
  console.log(dag.error || 'No solutions ready for execution');
  console.log('Use /issue:queue to form a queue first');
  return;
}

console.log(`
## Queue DAG (Solution-Level)

- Total Solutions: ${dag.total}
- Ready: ${dag.ready_count}
- Completed: ${dag.completed_count}
- Parallel in batch 1: ${dag.parallel_batches[0]?.length || 0}
`);

// Interactive selection via AskUserQuestion
const answer = AskUserQuestion({
  questions: [
    {
      question: 'Select executor type:',
      header: 'Executor',
      multiSelect: false,
      options: [
        { label: 'Codex (Recommended)', description: 'Autonomous coding with full write access' },
        { label: 'Gemini', description: 'Large context analysis and implementation' },
        { label: 'Agent', description: 'Claude Code sub-agent for complex tasks' }
      ]
    },
    {
      question: 'Execution mode:',
      header: 'Mode',
      multiSelect: false,
      options: [
        { label: 'Execute (Recommended)', description: 'Run all ready solutions' },
        { label: 'Dry-run', description: 'Show DAG and batches without executing' }
      ]
    },
    {
      question: 'Use git worktree for queue isolation?',
      header: 'Worktree',
      multiSelect: false,
      options: [
        { label: 'Yes (Recommended)', description: 'Create ONE worktree for entire queue - main stays clean' },
        { label: 'No', description: 'Work directly in current directory' }
      ]
    }
  ]
});

const executor = answer['Executor'].toLowerCase().split(' ')[0];  // codex|gemini|agent
const isDryRun = answer['Mode'].includes('Dry-run');
const useWorktree = answer['Worktree'].includes('Yes');

// Dry run mode
if (isDryRun) {
  console.log('### Parallel Batches (Dry-run):\n');
  dag.parallel_batches.forEach((batch, i) => {
    console.log(`Batch ${i + 1}: ${batch.join(', ')}`);
  });
  return;
}
```

### Phase 0 & 2: Setup Queue Worktree & Dispatch

```javascript
// Parallelism determined by DAG - no manual limit
// All solutions in same batch have NO file conflicts and can run in parallel
const batch = dag.parallel_batches[0] || [];

// Initialize TodoWrite
TodoWrite({
  todos: batch.map(id => ({
    content: `Execute solution ${id}`,
    status: 'pending',
    activeForm: `Executing solution ${id}`
  }))
});

console.log(`\n### Executing Solutions (DAG batch 1): ${batch.join(', ')}`);

// Parse existing worktree path from args if provided
// Example: --worktree /path/to/existing/worktree
const existingWorktree = args.worktree && typeof args.worktree === 'string' ? args.worktree : null;

// Setup ONE worktree for entire queue (not per-solution)
let worktreePath = null;
let worktreeBranch = null;

if (useWorktree) {
  const repoRoot = Bash('git rev-parse --show-toplevel').trim();
  const worktreeBase = `${repoRoot}/.ccw/worktrees`;
  Bash(`mkdir -p "${worktreeBase}"`);
  Bash('git worktree prune');  // Cleanup stale worktrees

  if (existingWorktree) {
    // Resume mode: Use existing worktree
    worktreePath = existingWorktree;
    worktreeBranch = Bash(`git -C "${worktreePath}" branch --show-current`).trim();
    console.log(`Resuming in existing worktree: ${worktreePath} (branch: ${worktreeBranch})`);
  } else {
    // Create mode: ONE worktree for the entire queue
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    worktreeBranch = `queue-exec-${dag.queue_id || timestamp}`;
    worktreePath = `${worktreeBase}/${worktreeBranch}`;
    Bash(`git worktree add "${worktreePath}" -b "${worktreeBranch}"`);
    console.log(`Created queue worktree: ${worktreePath}`);
  }
}

// Launch ALL solutions in batch in parallel (DAG guarantees no conflicts)
// All executors work in the SAME worktree (or main if no worktree)
const executions = batch.map(solutionId => {
  updateTodo(solutionId, 'in_progress');
  return dispatchExecutor(solutionId, executor, worktreePath);
});

await Promise.all(executions);
batch.forEach(id => updateTodo(id, 'completed'));
```

### Executor Dispatch

```javascript
// worktreePath: path to shared worktree (null if not using worktree)
function dispatchExecutor(solutionId, executorType, worktreePath = null) {
  // If worktree is provided, executor works in that directory
  // No per-solution worktree creation - ONE worktree for entire queue
  const cdCommand = worktreePath ? `cd "${worktreePath}"` : '';

  const prompt = `
## Execute Solution ${solutionId}
${worktreePath ? `
### Step 0: Enter Queue Worktree
\`\`\`bash
cd "${worktreePath}"
\`\`\`
` : ''}
### Step 1: Get Solution (read-only)
\`\`\`bash
ccw issue detail ${solutionId}
\`\`\`

### Step 2: Execute All Tasks Sequentially
The detail command returns a FULL SOLUTION with all tasks.
Execute each task in order (T1 → T2 → T3 → ...):

For each task:
1. Follow task.implementation steps
2. Run task.test commands
3. Verify task.acceptance criteria
(Do NOT commit after each task)

### Step 3: Commit Solution (Once)
After ALL tasks pass, commit once with formatted summary:
\`\`\`bash
git add <all-modified-files>
git commit -m "[type](scope): [solution.description]

## Solution Summary
- Solution-ID: ${solutionId}
- Tasks: T1, T2, ...

## Tasks Completed
- [T1] task1.title: action
- [T2] task2.title: action

## Files Modified
- file1.ts
- file2.ts

## Verification
- All tests passed
- All acceptance criteria verified"
\`\`\`

### Step 4: Report Completion
\`\`\`bash
ccw issue done ${solutionId} --result '{"summary": "...", "files_modified": [...], "commit": {"hash": "...", "type": "feat"}, "tasks_completed": N}'
\`\`\`

If any task failed:
\`\`\`bash
ccw issue done ${solutionId} --fail --reason '{"task_id": "TX", "error_type": "test_failure", "message": "..."}'
\`\`\`

**Note**: Do NOT cleanup worktree after this solution. Worktree is shared by all solutions in the queue.
`;

  // For CLI tools, pass --cd to set working directory
  const cdOption = worktreePath ? ` --cd "${worktreePath}"` : '';

  if (executorType === 'codex') {
    return Bash(
      `ccw cli -p "${escapePrompt(prompt)}" --tool codex --mode write --id exec-${solutionId}${cdOption}`,
      { timeout: 7200000, run_in_background: true }  // 2hr for full solution
    );
  } else if (executorType === 'gemini') {
    return Bash(
      `ccw cli -p "${escapePrompt(prompt)}" --tool gemini --mode write --id exec-${solutionId}${cdOption}`,
      { timeout: 3600000, run_in_background: true }
    );
  } else {
    return Task({
      subagent_type: 'code-developer',
      run_in_background: false,
      description: `Execute solution ${solutionId}`,
      prompt: worktreePath ? `Working directory: ${worktreePath}\n\n${prompt}` : prompt
    });
  }
}
```

### Phase 3: Check Next Batch

```javascript
// Refresh DAG after batch completes (use same QUEUE_ID)
const refreshedDag = JSON.parse(Bash(`ccw issue queue dag --queue ${QUEUE_ID}`).trim());

console.log(`
## Batch Complete

- Solutions Completed: ${refreshedDag.completed_count}/${refreshedDag.total}
- Next ready: ${refreshedDag.ready_count}
`);

if (refreshedDag.ready_count > 0) {
  console.log(`Run \`/issue:execute --queue ${QUEUE_ID}\` again for next batch.`);
  // Note: If resuming, pass existing worktree path:
  // /issue:execute --queue ${QUEUE_ID} --worktree <worktreePath>
}
```

### Phase 4: Worktree Completion (after ALL batches)

```javascript
// Only run when ALL solutions completed AND using worktree
if (useWorktree && refreshedDag.ready_count === 0 && refreshedDag.completed_count === refreshedDag.total) {
  console.log('\n## All Solutions Completed - Worktree Cleanup');

  const answer = AskUserQuestion({
    questions: [{
      question: `Queue complete. What to do with worktree branch "${worktreeBranch}"?`,
      header: 'Merge',
      multiSelect: false,
      options: [
        { label: 'Create PR (Recommended)', description: 'Push branch and create pull request' },
        { label: 'Merge to main', description: 'Merge all commits and cleanup worktree' },
        { label: 'Keep branch', description: 'Cleanup worktree, keep branch for manual handling' }
      ]
    }]
  });

  const repoRoot = Bash('git rev-parse --show-toplevel').trim();

  if (answer['Merge'].includes('Create PR')) {
    Bash(`git -C "${worktreePath}" push -u origin "${worktreeBranch}"`);
    Bash(`gh pr create --title "Queue ${dag.queue_id}" --body "Issue queue execution - all solutions completed" --head "${worktreeBranch}"`);
    Bash(`git worktree remove "${worktreePath}"`);
    console.log(`PR created for branch: ${worktreeBranch}`);
  } else if (answer['Merge'].includes('Merge to main')) {
    // Check main is clean
    const mainDirty = Bash('git status --porcelain').trim();
    if (mainDirty) {
      console.log('Warning: Main has uncommitted changes. Falling back to PR.');
      Bash(`git -C "${worktreePath}" push -u origin "${worktreeBranch}"`);
      Bash(`gh pr create --title "Queue ${dag.queue_id}" --body "Issue queue execution (main had uncommitted changes)" --head "${worktreeBranch}"`);
    } else {
      Bash(`git merge --no-ff "${worktreeBranch}" -m "Merge queue ${dag.queue_id}"`);
      Bash(`git branch -d "${worktreeBranch}"`);
    }
    Bash(`git worktree remove "${worktreePath}"`);
  } else {
    Bash(`git worktree remove "${worktreePath}"`);
    console.log(`Branch ${worktreeBranch} kept for manual handling`);
  }
}
```

## Parallel Execution Model

```
┌─────────────────────────────────────────────────────────────────┐
│ Orchestrator                                                    │
├─────────────────────────────────────────────────────────────────┤
│ 0. Validate QUEUE_ID (required, or prompt user to select)       │
│                                                                 │
│ 0.5 (if --worktree) Create ONE worktree for entire queue        │
│    → .ccw/worktrees/queue-exec-<queue-id>                       │
│                                                                 │
│ 1. ccw issue queue dag --queue ${QUEUE_ID}                      │
│    → { parallel_batches: [["S-1","S-2"], ["S-3"]] }             │
│                                                                 │
│ 2. Dispatch batch 1 (parallel, SAME worktree):                  │
│    ┌──────────────────────────────────────────────────────┐     │
│    │        Shared Queue Worktree (or main)               │     │
│    │  ┌──────────────────┐ ┌──────────────────┐          │     │
│    │  │ Executor 1       │ │ Executor 2       │          │     │
│    │  │ detail S-1       │ │ detail S-2       │          │     │
│    │  │ [T1→T2→T3]       │ │ [T1→T2]          │          │     │
│    │  │ commit S-1       │ │ commit S-2       │          │     │
│    │  │ done S-1         │ │ done S-2         │          │     │
│    │  └──────────────────┘ └──────────────────┘          │     │
│    └──────────────────────────────────────────────────────┘     │
│                                                                 │
│ 3. ccw issue queue dag (refresh)                                │
│    → S-3 now ready → dispatch batch 2 (same worktree)           │
│                                                                 │
│ 4. (if --worktree) ALL batches complete → cleanup worktree      │
│    → Prompt: Create PR / Merge to main / Keep branch            │
└─────────────────────────────────────────────────────────────────┘
```

**Why this works for parallel:**
- **ONE worktree for entire queue** → all solutions share same isolated workspace
- `detail <id>` is READ-ONLY → no race conditions
- Each executor handles **all tasks within a solution** sequentially
- **One commit per solution** with formatted summary (not per-task)
- `done <id>` updates only its own solution status
- `queue dag` recalculates ready solutions after each batch
- Solutions in same batch have NO file conflicts (DAG guarantees)
- **Main workspace stays clean** until merge/PR decision

## CLI Endpoint Contract

### `ccw issue queue list --brief --json`
Returns queue index for selection (used when --queue not provided):
```json
{
  "active_queue_id": "QUE-20251215-001",
  "queues": [
    { "id": "QUE-20251215-001", "status": "active", "issue_ids": ["ISS-001"], "total_solutions": 5, "completed_solutions": 2 }
  ]
}
```

### `ccw issue queue dag --queue <queue-id>`
Returns dependency graph with parallel batches (solution-level, **--queue required**):
```json
{
  "queue_id": "QUE-...",
  "total": 3,
  "ready_count": 2,
  "completed_count": 0,
  "nodes": [
    { "id": "S-1", "issue_id": "ISS-xxx", "status": "pending", "ready": true, "task_count": 3 },
    { "id": "S-2", "issue_id": "ISS-yyy", "status": "pending", "ready": true, "task_count": 2 },
    { "id": "S-3", "issue_id": "ISS-zzz", "status": "pending", "ready": false, "depends_on": ["S-1"] }
  ],
  "parallel_batches": [["S-1", "S-2"], ["S-3"]]
}
```

### `ccw issue detail <item_id>`
Returns FULL SOLUTION with all tasks (READ-ONLY):
```json
{
  "item_id": "S-1",
  "issue_id": "ISS-xxx",
  "solution_id": "SOL-xxx",
  "status": "pending",
  "solution": {
    "id": "SOL-xxx",
    "approach": "...",
    "tasks": [
      { "id": "T1", "title": "...", "implementation": [...], "test": {...} },
      { "id": "T2", "title": "...", "implementation": [...], "test": {...} },
      { "id": "T3", "title": "...", "implementation": [...], "test": {...} }
    ],
    "exploration_context": { "relevant_files": [...] }
  },
  "execution_hints": { "executor": "codex", "estimated_minutes": 180 }
}
```

### `ccw issue done <item_id>`
Marks solution completed/failed, updates queue state, checks for queue completion.

## Error Handling

| Error | Resolution |
|-------|------------|
| No queue | Run /issue:queue first |
| No ready solutions | Dependencies blocked, check DAG |
| Executor timeout | Solution not marked done, can retry |
| Solution failure | Use `ccw issue retry` to reset |
| Partial task failure | Executor reports which task failed via `done --fail` |

## Related Commands

- `/issue:plan` - Plan issues with solutions
- `/issue:queue` - Form execution queue
- `ccw issue queue dag` - View dependency graph
- `ccw issue detail <id>` - View task details
- `ccw issue retry` - Reset failed tasks
