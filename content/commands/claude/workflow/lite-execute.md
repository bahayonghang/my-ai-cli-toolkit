---
name: lite-execute
description: Execute tasks based on in-memory plan, prompt description, or file content
argument-hint: "[--in-memory] [\"task description\"|file-path]"
allowed-tools: TodoWrite(*), Task(*), Bash(*)
---

# Workflow Lite-Execute Command (/workflow:lite-execute)

## Overview

Flexible task execution command supporting three input modes: in-memory plan (from lite-plan), direct prompt description, or file content. Handles execution orchestration, progress tracking, and optional code review.

**Core capabilities:**
- Multi-mode input (in-memory plan, prompt description, or file path)
- Execution orchestration (Agent or Codex) with full context
- Live progress tracking via TodoWrite at execution call level
- Optional code review with selected tool (Gemini, Agent, or custom)
- Context continuity across multiple executions
- Intelligent format detection (Enhanced Task JSON vs plain text)

## Usage

### Command Syntax
```bash
/workflow:lite-execute [FLAGS] <INPUT>

# Flags
--in-memory                Use plan from memory (called by lite-plan)

# Arguments
<input>                    Task description string, or path to file (required)
```

## Input Modes

### Mode 1: In-Memory Plan

**Trigger**: Called by lite-plan after Phase 4 approval with `--in-memory` flag

**Input Source**: `executionContext` global variable set by lite-plan

**Content**: Complete execution context (see Data Structures section)

**Behavior**:
- Skip execution method selection (already set by lite-plan)
- Directly proceed to execution with full context
- All planning artifacts available (exploration, clarifications, plan)

### Mode 2: Prompt Description

**Trigger**: User calls with task description string

**Input**: Simple task description (e.g., "Add unit tests for auth module")

**Behavior**:
- Store prompt as `originalUserInput`
- Create simple execution plan from prompt
- AskUserQuestion: Select execution method (Agent/Codex/Auto)
- AskUserQuestion: Select code review tool (Skip/Gemini/Agent/Other)
- Proceed to execution with `originalUserInput` included

**User Interaction**:
```javascript
AskUserQuestion({
  questions: [
    {
      question: "Select execution method:",
      header: "Execution",
      multiSelect: false,
      options: [
        { label: "Agent", description: "@code-developer agent" },
        { label: "Codex", description: "codex CLI tool" },
        { label: "Auto", description: "Auto-select based on complexity" }
      ]
    },
    {
      question: "Enable code review after execution?",
      header: "Code Review",
      multiSelect: false,
      options: [
        { label: "Skip", description: "No review" },
        { label: "Gemini Review", description: "Gemini CLI tool" },
        { label: "Codex Review", description: "Git-aware review (prompt OR --uncommitted)" },
        { label: "Agent Review", description: "Current agent review" }
      ]
    }
  ]
})
```

### Mode 3: File Content

**Trigger**: User calls with file path

**Input**: Path to file containing task description or plan.json

**Step 1: Read and Detect Format**

```javascript
fileContent = Read(filePath)

// Attempt JSON parsing
try {
  jsonData = JSON.parse(fileContent)

  // Check if plan.json from lite-plan session
  if (jsonData.summary && jsonData.approach && jsonData.tasks) {
    planObject = jsonData
    originalUserInput = jsonData.summary
    isPlanJson = true
  } else {
    // Valid JSON but not plan.json - treat as plain text
    originalUserInput = fileContent
    isPlanJson = false
  }
} catch {
  // Not valid JSON - treat as plain text prompt
  originalUserInput = fileContent
  isPlanJson = false
}
```

**Step 2: Create Execution Plan**

If `isPlanJson === true`:
- Use `planObject` directly
- User selects execution method and code review

If `isPlanJson === false`:
- Treat file content as prompt (same behavior as Mode 2)
- Create simple execution plan from content

**Step 3: User Interaction**

- AskUserQuestion: Select execution method (Agent/Codex/Auto)
- AskUserQuestion: Select code review tool
- Proceed to execution with full context

## Execution Process

```
Input Parsing:
   └─ Decision (mode detection):
      ├─ --in-memory flag → Mode 1: Load executionContext → Skip user selection
      ├─ Ends with .md/.json/.txt → Mode 3: Read file → Detect format
      │   ├─ Valid plan.json → Use planObject → User selects method + review
      │   └─ Not plan.json → Treat as prompt → User selects method + review
      └─ Other → Mode 2: Prompt description → User selects method + review

Execution:
   ├─ Step 1: Initialize result tracking (previousExecutionResults = [])
   ├─ Step 2: Task grouping & batch creation
   │   ├─ Extract explicit depends_on (no file/keyword inference)
   │   ├─ Group: independent tasks → single parallel batch (maximize utilization)
   │   ├─ Group: dependent tasks → sequential phases (respect dependencies)
   │   └─ Create TodoWrite list for batches
   ├─ Step 3: Launch execution
   │   ├─ Phase 1: All independent tasks (⚡ single batch, concurrent)
   │   └─ Phase 2+: Dependent tasks by dependency order
   ├─ Step 4: Track progress (TodoWrite updates per batch)
   └─ Step 5: Code review (if codeReviewTool ≠ "Skip")

Output:
   └─ Execution complete with results in previousExecutionResults[]
```

## Detailed Execution Steps

### Step 1: Initialize Execution Tracking

**Operations**:
- Initialize result tracking for multi-execution scenarios
- Set up `previousExecutionResults` array for context continuity
- **In-Memory Mode**: Echo execution strategy from lite-plan for transparency

```javascript
// Initialize result tracking
previousExecutionResults = []

// In-Memory Mode: Echo execution strategy (transparency before execution)
if (executionContext) {
  console.log(`
📋 Execution Strategy (from lite-plan):
   Method: ${executionContext.executionMethod}
   Review: ${executionContext.codeReviewTool}
   Tasks: ${executionContext.planObject.tasks.length}
   Complexity: ${executionContext.planObject.complexity}
${executionContext.executorAssignments ? `   Assignments: ${JSON.stringify(executionContext.executorAssignments)}` : ''}
  `)
}
```

### Step 2: Task Grouping & Batch Creation

**Dependency Analysis & Grouping Algorithm**:
```javascript
// Use explicit depends_on from plan.json (no inference from file/keywords)
function extractDependencies(tasks) {
  const taskIdToIndex = {}
  tasks.forEach((t, i) => { taskIdToIndex[t.id] = i })

  return tasks.map((task, i) => {
    // Only use explicit depends_on from plan.json
    const deps = (task.depends_on || [])
      .map(depId => taskIdToIndex[depId])
      .filter(idx => idx !== undefined && idx < i)
    return { ...task, taskIndex: i, dependencies: deps }
  })
}

// Group into batches: maximize parallel execution
function createExecutionCalls(tasks, executionMethod) {
  const tasksWithDeps = extractDependencies(tasks)
  const processed = new Set()
  const calls = []

  // Phase 1: All independent tasks → single parallel batch (maximize utilization)
  const independentTasks = tasksWithDeps.filter(t => t.dependencies.length === 0)
  if (independentTasks.length > 0) {
    independentTasks.forEach(t => processed.add(t.taskIndex))
    calls.push({
      method: executionMethod,
      executionType: "parallel",
      groupId: "P1",
      taskSummary: independentTasks.map(t => t.title).join(' | '),
      tasks: independentTasks
    })
  }

  // Phase 2: Dependent tasks → sequential batches (respect dependencies)
  let sequentialIndex = 1
  let remaining = tasksWithDeps.filter(t => !processed.has(t.taskIndex))

  while (remaining.length > 0) {
    // Find tasks whose dependencies are all satisfied
    const ready = remaining.filter(t =>
      t.dependencies.every(d => processed.has(d))
    )

    if (ready.length === 0) {
      console.warn('Circular dependency detected, forcing remaining tasks')
      ready.push(...remaining)
    }

    // Group ready tasks (can run in parallel within this phase)
    ready.forEach(t => processed.add(t.taskIndex))
    calls.push({
      method: executionMethod,
      executionType: ready.length > 1 ? "parallel" : "sequential",
      groupId: ready.length > 1 ? `P${calls.length + 1}` : `S${sequentialIndex++}`,
      taskSummary: ready.map(t => t.title).join(ready.length > 1 ? ' | ' : ' → '),
      tasks: ready
    })

    remaining = remaining.filter(t => !processed.has(t.taskIndex))
  }

  return calls
}

executionCalls = createExecutionCalls(planObject.tasks, executionMethod).map(c => ({ ...c, id: `[${c.groupId}]` }))

TodoWrite({
  todos: executionCalls.map(c => ({
    content: `${c.executionType === "parallel" ? "⚡" : "→"} ${c.id} (${c.tasks.length} tasks)`,
    status: "pending",
    activeForm: `Executing ${c.id}`
  }))
})
```

### Step 3: Launch Execution

**Executor Resolution** (任务级 executor 优先于全局设置):
```javascript
// 获取任务的 executor（优先使用 executorAssignments，fallback 到全局 executionMethod）
function getTaskExecutor(task) {
  const assignments = executionContext?.executorAssignments || {}
  if (assignments[task.id]) {
    return assignments[task.id].executor  // 'gemini' | 'codex' | 'agent'
  }
  // Fallback: 全局 executionMethod 映射
  const method = executionContext?.executionMethod || 'Auto'
  if (method === 'Agent') return 'agent'
  if (method === 'Codex') return 'codex'
  // Auto: 根据复杂度
  return planObject.complexity === 'Low' ? 'agent' : 'codex'
}

// 按 executor 分组任务
function groupTasksByExecutor(tasks) {
  const groups = { gemini: [], codex: [], agent: [] }
  tasks.forEach(task => {
    const executor = getTaskExecutor(task)
    groups[executor].push(task)
  })
  return groups
}
```

**Execution Flow**: Parallel batches concurrently → Sequential batches in order
```javascript
const parallel = executionCalls.filter(c => c.executionType === "parallel")
const sequential = executionCalls.filter(c => c.executionType === "sequential")

// Phase 1: Launch all parallel batches (single message with multiple tool calls)
if (parallel.length > 0) {
  TodoWrite({ todos: executionCalls.map(c => ({ status: c.executionType === "parallel" ? "in_progress" : "pending" })) })
  parallelResults = await Promise.all(parallel.map(c => executeBatch(c)))
  previousExecutionResults.push(...parallelResults)
  TodoWrite({ todos: executionCalls.map(c => ({ status: parallel.includes(c) ? "completed" : "pending" })) })
}

// Phase 2: Execute sequential batches one by one
for (const call of sequential) {
  TodoWrite({ todos: executionCalls.map(c => ({ status: c === call ? "in_progress" : "..." })) })
  result = await executeBatch(call)
  previousExecutionResults.push(result)
  TodoWrite({ todos: executionCalls.map(c => ({ status: "completed" or "pending" })) })
}
```

### Unified Task Prompt Builder

**Task Formatting Principle**: Each task is a self-contained checklist. The executor only needs to know what THIS task requires. Same template for Agent and CLI.

```javascript
function buildExecutionPrompt(batch) {
  // Task template (6 parts: Modification Points → Why → How → Reference → Risks → Done)
  const formatTask = (t) => `
## ${t.title}

**Scope**: \`${t.scope}\`  |  **Action**: ${t.action}

### Modification Points
${t.modification_points.map(p => `- **${p.file}** → \`${p.target}\`: ${p.change}`).join('\n')}

${t.rationale ? `
### Why this approach (Medium/High)
${t.rationale.chosen_approach}
${t.rationale.decision_factors?.length > 0 ? `\nKey factors: ${t.rationale.decision_factors.join(', ')}` : ''}
${t.rationale.tradeoffs ? `\nTradeoffs: ${t.rationale.tradeoffs}` : ''}
` : ''}

### How to do it
${t.description}

${t.implementation.map(step => `- ${step}`).join('\n')}

${t.code_skeleton ? `
### Code skeleton (High)
${t.code_skeleton.interfaces?.length > 0 ? `**Interfaces**: ${t.code_skeleton.interfaces.map(i => `\`${i.name}\` - ${i.purpose}`).join(', ')}` : ''}
${t.code_skeleton.key_functions?.length > 0 ? `\n**Functions**: ${t.code_skeleton.key_functions.map(f => `\`${f.signature}\` - ${f.purpose}`).join(', ')}` : ''}
${t.code_skeleton.classes?.length > 0 ? `\n**Classes**: ${t.code_skeleton.classes.map(c => `\`${c.name}\` - ${c.purpose}`).join(', ')}` : ''}
` : ''}

### Reference
- Pattern: ${t.reference?.pattern || 'N/A'}
- Files: ${t.reference?.files?.join(', ') || 'N/A'}
${t.reference?.examples ? `- Notes: ${t.reference.examples}` : ''}

${t.risks?.length > 0 ? `
### Risk mitigations (High)
${t.risks.map(r => `- ${r.description} → **${r.mitigation}**`).join('\n')}
` : ''}

### Done when
${t.acceptance.map(c => `- [ ] ${c}`).join('\n')}
${t.verification?.success_metrics?.length > 0 ? `\n**Success metrics**: ${t.verification.success_metrics.join(', ')}` : ''}`

  // Build prompt
  const sections = []

  if (originalUserInput) sections.push(`## Goal\n${originalUserInput}`)

  sections.push(`## Tasks\n${batch.tasks.map(formatTask).join('\n\n---\n')}`)

  // Context (reference only)
  const context = []
  if (previousExecutionResults.length > 0) {
    context.push(`### Previous Work\n${previousExecutionResults.map(r => `- ${r.tasksSummary}: ${r.status}`).join('\n')}`)
  }
  if (clarificationContext) {
    context.push(`### Clarifications\n${Object.entries(clarificationContext).map(([q, a]) => `- ${q}: ${a}`).join('\n')}`)
  }
  if (executionContext?.planObject?.data_flow?.diagram) {
    context.push(`### Data Flow\n${executionContext.planObject.data_flow.diagram}`)
  }
  if (executionContext?.session?.artifacts?.plan) {
    context.push(`### Artifacts\nPlan: ${executionContext.session.artifacts.plan}`)
  }
  if (context.length > 0) sections.push(`## Context\n${context.join('\n\n')}`)

  sections.push(`Complete each task according to its "Done when" checklist.`)

  return sections.join('\n\n')
}
```

**Option A: Agent Execution**

When to use:
- `getTaskExecutor(task) === "agent"`
- 或 `executionMethod = "Agent"` (全局 fallback)
- 或 `executionMethod = "Auto" AND complexity = "Low"` (全局 fallback)

```javascript
Task(
  subagent_type="code-developer",
  run_in_background=false,
  description=batch.taskSummary,
  prompt=buildExecutionPrompt(batch)
)
```

**Result Collection**: After completion, collect result following `executionResult` structure (see Data Structures section)

**Option B: CLI Execution (Codex)**

When to use:
- `getTaskExecutor(task) === "codex"`
- 或 `executionMethod = "Codex"` (全局 fallback)
- 或 `executionMethod = "Auto" AND complexity = "Medium/High"` (全局 fallback)

```bash
ccw cli -p "${buildExecutionPrompt(batch)}" --tool codex --mode write
```

**Execution with fixed IDs** (predictable ID pattern):
```javascript
// Launch CLI in background, wait for task hook callback
// Generate fixed execution ID: ${sessionId}-${groupId}
const sessionId = executionContext?.session?.id || 'standalone'
const fixedExecutionId = `${sessionId}-${batch.groupId}`  // e.g., "implement-auth-2025-12-13-P1"

// Check if resuming from previous failed execution
const previousCliId = batch.resumeFromCliId || null

// Build command with fixed ID (and optional resume for continuation)
const cli_command = previousCliId
  ? `ccw cli -p "${buildExecutionPrompt(batch)}" --tool codex --mode write --id ${fixedExecutionId} --resume ${previousCliId}`
  : `ccw cli -p "${buildExecutionPrompt(batch)}" --tool codex --mode write --id ${fixedExecutionId}`

// Execute in background, stop output and wait for task hook callback
Bash(
  command=cli_command,
  run_in_background=true
)
// STOP HERE - CLI executes in background, task hook will notify on completion
```

**Resume on Failure** (with fixed ID):
```javascript
// If execution failed or timed out, offer resume option
if (bash_result.status === 'failed' || bash_result.status === 'timeout') {
  console.log(`
⚠️ Execution incomplete. Resume available:
   Fixed ID: ${fixedExecutionId}
   Lookup: ccw cli detail ${fixedExecutionId}
   Resume: ccw cli -p "Continue tasks" --resume ${fixedExecutionId} --tool codex --mode write --id ${fixedExecutionId}-retry
`)

  // Store for potential retry in same session
  batch.resumeFromCliId = fixedExecutionId
}
```

**Result Collection**: After completion, analyze output and collect result following `executionResult` structure (include `cliExecutionId` for resume capability)

**Option C: CLI Execution (Gemini)**

When to use: `getTaskExecutor(task) === "gemini"` (分析类任务)

```bash
# 使用统一的 buildExecutionPrompt，切换 tool 和 mode
ccw cli -p "${buildExecutionPrompt(batch)}" --tool gemini --mode analysis --id ${sessionId}-${batch.groupId}
```

### Step 4: Progress Tracking

Progress tracked at batch level (not individual task level). Icons: ⚡ (parallel, concurrent), → (sequential, one-by-one)

### Step 5: Code Review (Optional)

**Skip Condition**: Only run if `codeReviewTool ≠ "Skip"`

**Review Focus**: Verify implementation against plan acceptance criteria and verification requirements
- Read plan.json for task acceptance criteria and verification checklist
- Check each acceptance criterion is fulfilled
- Verify success metrics from verification field (Medium/High complexity)
- Run unit/integration tests specified in verification field
- Validate code quality and identify issues
- Ensure alignment with planned approach and risk mitigations

**Operations**:
- Agent Review: Current agent performs direct review
- Gemini Review: Execute gemini CLI with review prompt
- Codex Review: Two options - (A) with prompt for complex reviews, (B) `--uncommitted` flag only for quick reviews
- Custom tool: Execute specified CLI tool (qwen, etc.)

**Unified Review Template** (All tools use same standard):

**Review Criteria**:
- **Acceptance Criteria**: Verify each criterion from plan.tasks[].acceptance
- **Verification Checklist** (Medium/High): Check unit_tests, integration_tests, success_metrics from plan.tasks[].verification
- **Code Quality**: Analyze quality, identify issues, suggest improvements
- **Plan Alignment**: Validate implementation matches planned approach and risk mitigations

**Shared Prompt Template** (used by all CLI tools):
```
PURPOSE: Code review for implemented changes against plan acceptance criteria and verification requirements
TASK: • Verify plan acceptance criteria fulfillment • Check verification requirements (unit tests, success metrics) • Analyze code quality • Identify issues • Suggest improvements • Validate plan adherence and risk mitigations
MODE: analysis
CONTEXT: @**/* @{plan.json} [@{exploration.json}] | Memory: Review lite-execute changes against plan requirements including verification checklist
EXPECTED: Quality assessment with:
  - Acceptance criteria verification (all tasks)
  - Verification checklist validation (Medium/High: unit_tests, integration_tests, success_metrics)
  - Issue identification
  - Recommendations
  Explicitly check each acceptance criterion and verification item from plan.json tasks.
CONSTRAINTS: Focus on plan acceptance criteria, verification requirements, and plan adherence | analysis=READ-ONLY
```

**Tool-Specific Execution** (Apply shared prompt template above):

```bash
# Method 1: Agent Review (current agent)
# - Read plan.json: ${executionContext.session.artifacts.plan}
# - Apply unified review criteria (see Shared Prompt Template)
# - Report findings directly

# Method 2: Gemini Review (recommended)
ccw cli -p "[Shared Prompt Template with artifacts]" --tool gemini --mode analysis
# CONTEXT includes: @**/* @${plan.json} [@${exploration.json}]

# Method 3: Qwen Review (alternative)
ccw cli -p "[Shared Prompt Template with artifacts]" --tool qwen --mode analysis
# Same prompt as Gemini, different execution engine

# Method 4: Codex Review (git-aware) - Two mutually exclusive options:

# Option A: With custom prompt (reviews uncommitted by default)
ccw cli -p "[Shared Prompt Template with artifacts]" --tool codex --mode review
# Use for complex reviews with specific focus areas

# Option B: Target flag only (no prompt allowed)
ccw cli --tool codex --mode review --uncommitted
# Quick review of uncommitted changes without custom instructions

# ⚠️ IMPORTANT: -p prompt and target flags (--uncommitted/--base/--commit) are MUTUALLY EXCLUSIVE
```

**Multi-Round Review with Fixed IDs**:
```javascript
// Generate fixed review ID
const reviewId = `${sessionId}-review`

// First review pass with fixed ID
const reviewResult = Bash(`ccw cli -p "[Review prompt]" --tool gemini --mode analysis --id ${reviewId}`)

// If issues found, continue review dialog with fixed ID chain
if (hasUnresolvedIssues(reviewResult)) {
  // Resume with follow-up questions
  Bash(`ccw cli -p "Clarify the security concerns you mentioned" --resume ${reviewId} --tool gemini --mode analysis --id ${reviewId}-followup`)
}
```

**Implementation Note**: Replace `[Shared Prompt Template with artifacts]` placeholder with actual template content, substituting:
- `@{plan.json}` → `@${executionContext.session.artifacts.plan}`
- `[@{exploration.json}]` → exploration files from artifacts (if exists)

### Step 6: Update Development Index

**Trigger**: After all executions complete (regardless of code review)

**Skip Condition**: Skip if `.workflow/project-tech.json` does not exist

**Operations**:
```javascript
const projectJsonPath = '.workflow/project-tech.json'
if (!fileExists(projectJsonPath)) return  // Silent skip

const projectJson = JSON.parse(Read(projectJsonPath))

// Initialize if needed
if (!projectJson.development_index) {
  projectJson.development_index = { feature: [], enhancement: [], bugfix: [], refactor: [], docs: [] }
}

// Detect category from keywords
function detectCategory(text) {
  text = text.toLowerCase()
  if (/\b(fix|bug|error|issue|crash)\b/.test(text)) return 'bugfix'
  if (/\b(refactor|cleanup|reorganize)\b/.test(text)) return 'refactor'
  if (/\b(doc|readme|comment)\b/.test(text)) return 'docs'
  if (/\b(add|new|create|implement)\b/.test(text)) return 'feature'
  return 'enhancement'
}

// Detect sub_feature from task file paths
function detectSubFeature(tasks) {
  const dirs = tasks.map(t => t.file?.split('/').slice(-2, -1)[0]).filter(Boolean)
  const counts = dirs.reduce((a, d) => { a[d] = (a[d] || 0) + 1; return a }, {})
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'general'
}

const category = detectCategory(`${planObject.summary} ${planObject.approach}`)
const entry = {
  title: planObject.summary.slice(0, 60),
  sub_feature: detectSubFeature(planObject.tasks),
  date: new Date().toISOString().split('T')[0],
  description: planObject.approach.slice(0, 100),
  status: previousExecutionResults.every(r => r.status === 'completed') ? 'completed' : 'partial',
  session_id: executionContext?.session?.id || null
}

projectJson.development_index[category].push(entry)
projectJson.statistics.last_updated = new Date().toISOString()
Write(projectJsonPath, JSON.stringify(projectJson, null, 2))

console.log(`✓ Development index: [${category}] ${entry.title}`)
```

## Best Practices

**Input Modes**: In-memory (lite-plan), prompt (standalone), file (JSON/text)
**Task Grouping**: Based on explicit depends_on only; independent tasks run in single parallel batch
**Execution**: All independent tasks launch concurrently via single Claude message with multiple tool calls

## Error Handling

| Error | Cause | Resolution |
|-------|-------|------------|
| Missing executionContext | --in-memory without context | Error: "No execution context found. Only available when called by lite-plan." |
| File not found | File path doesn't exist | Error: "File not found: {path}. Check file path." |
| Empty file | File exists but no content | Error: "File is empty: {path}. Provide task description." |
| Invalid Enhanced Task JSON | JSON missing required fields | Warning: "Missing required fields. Treating as plain text." |
| Malformed JSON | JSON parsing fails | Treat as plain text (expected for non-JSON files) |
| Execution failure | Agent/Codex crashes | Display error, use fixed ID `${sessionId}-${groupId}` for resume: `ccw cli -p "Continue" --resume <fixed-id> --id <fixed-id>-retry` |
| Execution timeout | CLI exceeded timeout | Use fixed ID for resume with extended timeout |
| Codex unavailable | Codex not installed | Show installation instructions, offer Agent execution |
| Fixed ID not found | Custom ID lookup failed | Check `ccw cli history`, verify date directories |

## Data Structures

### executionContext (Input - Mode 1)

Passed from lite-plan via global variable:

```javascript
{
  planObject: {
    summary: string,
    approach: string,
    tasks: [...],
    estimated_time: string,
    recommended_execution: string,
    complexity: string
  },
  explorationsContext: {...} | null,       // Multi-angle explorations
  explorationAngles: string[],             // List of exploration angles
  explorationManifest: {...} | null,       // Exploration manifest
  clarificationContext: {...} | null,
  executionMethod: "Agent" | "Codex" | "Auto",  // 全局默认
  codeReviewTool: "Skip" | "Gemini Review" | "Agent Review" | string,
  originalUserInput: string,

  // 任务级 executor 分配（优先于 executionMethod）
  executorAssignments: {
    [taskId]: { executor: "gemini" | "codex" | "agent", reason: string }
  },

  // Session artifacts location (saved by lite-plan)
  session: {
    id: string,                        // Session identifier: {taskSlug}-{shortTimestamp}
    folder: string,                    // Session folder path: .workflow/.lite-plan/{session-id}
    artifacts: {
      explorations: [{angle, path}],   // exploration-{angle}.json paths
      explorations_manifest: string,   // explorations-manifest.json path
      plan: string                     // plan.json path (always present)
    }
  }
}
```

**Artifact Usage**:
- Artifact files contain detailed planning context
- Pass artifact paths to CLI tools and agents for enhanced context
- See execution options below for usage examples

### executionResult (Output)

Collected after each execution call completes:

```javascript
{
  executionId: string,                 // e.g., "[Agent-1]", "[Codex-1]"
  status: "completed" | "partial" | "failed",
  tasksSummary: string,                // Brief description of tasks handled
  completionSummary: string,           // What was completed
  keyOutputs: string,                  // Files created/modified, key changes
  notes: string,                       // Important context for next execution
  fixedCliId: string | null            // Fixed CLI execution ID (e.g., "implement-auth-2025-12-13-P1")
}
```

Appended to `previousExecutionResults` array for context continuity in multi-execution scenarios.

## Post-Completion Expansion

完成后询问用户是否扩展为issue(test/enhance/refactor/doc)，选中项调用 `/issue:new "{summary} - {dimension}"`

**Fixed ID Pattern**: `${sessionId}-${groupId}` enables predictable lookup without auto-generated timestamps.

**Resume Usage**: If `status` is "partial" or "failed", use `fixedCliId` to resume:
```bash
# Lookup previous execution
ccw cli detail ${fixedCliId}

# Resume with new fixed ID for retry
ccw cli -p "Continue from where we left off" --resume ${fixedCliId} --tool codex --mode write --id ${fixedCliId}-retry
```
