---
name: workflow:lite-lite-lite
description: Ultra-lightweight multi-tool analysis and direct execution. No artifacts for simple tasks; auto-creates planning docs in .workflow/.scratchpad/ for complex tasks. Auto tool selection based on task analysis, user-driven iteration via AskUser.
argument-hint: "<task description>"
allowed-tools: TodoWrite(*), Task(*), AskUserQuestion(*), Read(*), Bash(*), Write(*), mcp__ace-tool__search_context(*), mcp__ccw-tools__write_file(*)
---

# Ultra-Lite Multi-Tool Workflow

## Quick Start

```bash
/workflow:lite-lite-lite "Fix the login bug"
/workflow:lite-lite-lite "Refactor payment module for multi-gateway support"
```

**Core Philosophy**: Minimal friction, maximum velocity. Simple tasks = no artifacts. Complex tasks = lightweight planning doc in `.workflow/.scratchpad/`.

## Overview

**Complexity-aware workflow**: Clarify → Assess Complexity → Select Tools → Multi-Mode Analysis → Decision → Direct Execution

**vs multi-cli-plan**: No IMPL_PLAN.md, plan.json, synthesis.json - state in memory or lightweight scratchpad doc for complex tasks.

## Execution Flow

```
Phase 1: Clarify Requirements → AskUser for missing details
Phase 1.5: Assess Complexity → Determine if planning doc needed
Phase 2: Select Tools (CLI → Mode → Agent) → 3-step selection
Phase 3: Multi-Mode Analysis → Execute with --resume chaining
Phase 4: User Decision → Execute / Refine / Change / Cancel
Phase 5: Direct Execution → No plan files (simple) or scratchpad doc (complex)
```

## Phase 1: Clarify Requirements

```javascript
const taskDescription = $ARGUMENTS

if (taskDescription.length < 20 || isAmbiguous(taskDescription)) {
  AskUserQuestion({
    questions: [{
      question: "Please provide more details: target files/modules, expected behavior, constraints?",
      header: "Details",
      options: [
        { label: "I'll provide more", description: "Add more context" },
        { label: "Continue analysis", description: "Let tools explore autonomously" }
      ],
      multiSelect: false
    }]
  })
}

// Optional: Quick ACE Context for complex tasks
mcp__ace-tool__search_context({
  project_root_path: process.cwd(),
  query: `${taskDescription} implementation patterns`
})
```

## Phase 1.5: Assess Complexity

| Level | Creates Plan Doc | Trigger Keywords |
|-------|------------------|------------------|
| **simple** | ❌ | (default) |
| **moderate** | ✅ | module, system, service, integration, multiple |
| **complex** | ✅ | refactor, migrate, security, auth, payment, database |

```javascript
// Complexity detection (after ACE query)
const isComplex = /refactor|migrate|security|auth|payment|database/i.test(taskDescription)
const isModerate = /module|system|service|integration|multiple/i.test(taskDescription) || aceContext?.relevant_files?.length > 2

if (isComplex || isModerate) {
  const planPath = `.workflow/.scratchpad/lite3-${taskSlug}-${dateStr}.md`
  // Create planning doc with: Task, Status, Complexity, Analysis Summary, Execution Plan, Progress Log
}
```

## Phase 2: Select Tools

### Tool Definitions

**CLI Tools** (from cli-tools.json):
```javascript
const cliConfig = JSON.parse(Read("~/.claude/cli-tools.json"))
const cliTools = Object.entries(cliConfig.tools)
  .filter(([_, config]) => config.enabled)
  .map(([name, config]) => ({
    name, type: 'cli',
    tags: config.tags || [],
    model: config.primaryModel,
    toolType: config.type  // builtin, cli-wrapper, api-endpoint
  }))
```

**Sub Agents**:

| Agent | Strengths | canExecute |
|-------|-----------|------------|
| **code-developer** | Code implementation, test writing | ✅ |
| **Explore** | Fast code exploration, pattern discovery | ❌ |
| **cli-explore-agent** | Dual-source analysis (Bash+CLI) | ❌ |
| **cli-discuss-agent** | Multi-CLI collaboration, cross-verification | ❌ |
| **debug-explore-agent** | Hypothesis-driven debugging | ❌ |
| **context-search-agent** | Multi-layer file discovery, dependency analysis | ❌ |
| **test-fix-agent** | Test execution, failure diagnosis, code fixing | ✅ |
| **universal-executor** | General execution, multi-domain adaptation | ✅ |

**Analysis Modes**:

| Mode | Pattern | Use Case | minCLIs |
|------|---------|----------|---------|
| **Parallel** | `A \|\| B \|\| C → Aggregate` | Fast multi-perspective | 1+ |
| **Sequential** | `A → B(resume) → C(resume)` | Incremental deepening | 2+ |
| **Collaborative** | `A → B → A → B → Synthesize` | Multi-round refinement | 2+ |
| **Debate** | `A(propose) → B(challenge) → A(defend)` | Adversarial validation | 2 |
| **Challenge** | `A(analyze) → B(challenge)` | Find flaws and risks | 2 |

### Three-Step Selection Flow

```javascript
// Step 1: Select CLIs (multiSelect)
AskUserQuestion({
  questions: [{
    question: "Select CLI tools for analysis (1-3 for collaboration modes)",
    header: "CLI Tools",
    options: cliTools.map(cli => ({
      label: cli.name,
      description: cli.tags.length > 0 ? cli.tags.join(', ') : cli.model || 'general'
    })),
    multiSelect: true
  }]
})

// Step 2: Select Mode (filtered by CLI count)
const availableModes = analysisModes.filter(m => selectedCLIs.length >= m.minCLIs)
AskUserQuestion({
  questions: [{
    question: "Select analysis mode",
    header: "Mode",
    options: availableModes.map(m => ({
      label: m.label,
      description: `${m.description} [${m.pattern}]`
    })),
    multiSelect: false
  }]
})

// Step 3: Select Agent for execution
AskUserQuestion({
  questions: [{
    question: "Select Sub Agent for execution",
    header: "Agent",
    options: agents.map(a => ({ label: a.name, description: a.strength })),
    multiSelect: false
  }]
})

// Confirm selection
AskUserQuestion({
  questions: [{
    question: "Confirm selection?",
    header: "Confirm",
    options: [
      { label: "Confirm and continue", description: `${selectedMode.label} with ${selectedCLIs.length} CLIs` },
      { label: "Re-select CLIs", description: "Choose different CLI tools" },
      { label: "Re-select Mode", description: "Choose different analysis mode" },
      { label: "Re-select Agent", description: "Choose different Sub Agent" }
    ],
    multiSelect: false
  }]
})
```

## Phase 3: Multi-Mode Analysis

### Universal CLI Prompt Template

```javascript
// Unified prompt builder - used by all modes
function buildPrompt({ purpose, tasks, expected, rules, taskDescription }) {
  return `
PURPOSE: ${purpose}: ${taskDescription}
TASK: ${tasks.map(t => `• ${t}`).join(' ')}
MODE: analysis
CONTEXT: @**/*
EXPECTED: ${expected}
CONSTRAINTS: ${rules}
`
}

// Execute CLI with prompt
function execCLI(cli, prompt, options = {}) {
  const { resume, background = false } = options
  const resumeFlag = resume ? `--resume ${resume}` : ''
  return Bash({
    command: `ccw cli -p "${prompt}" --tool ${cli.name} --mode analysis ${resumeFlag}`,
    run_in_background: background
  })
}
```

### Prompt Presets by Role

| Role | PURPOSE | TASKS | EXPECTED | RULES |
|------|---------|-------|----------|-------|
| **initial** | Initial analysis | Identify files, Analyze approach, List changes | Root cause, files, changes, risks | Focus on actionable insights |
| **extend** | Build on previous | Review previous, Extend, Add insights | Extended analysis building on findings | Build incrementally, avoid repetition |
| **synthesize** | Refine and synthesize | Review, Identify gaps, Synthesize | Refined synthesis with new perspectives | Add value not repetition |
| **propose** | Propose comprehensive analysis | Analyze thoroughly, Propose solution, State assumptions | Well-reasoned proposal with trade-offs | Be clear about assumptions |
| **challenge** | Challenge and stress-test | Identify weaknesses, Question assumptions, Suggest alternatives | Critique with counter-arguments | Be adversarial but constructive |
| **defend** | Respond to challenges | Address challenges, Defend valid aspects, Propose refined solution | Refined proposal incorporating feedback | Be open to criticism, synthesize |
| **criticize** | Find flaws ruthlessly | Find logical flaws, Identify edge cases, Rate criticisms | Critique with severity: [CRITICAL]/[HIGH]/[MEDIUM]/[LOW] | Be ruthlessly critical |

```javascript
const PROMPTS = {
  initial: { purpose: 'Initial analysis', tasks: ['Identify affected files', 'Analyze implementation approach', 'List specific changes'], expected: 'Root cause, files to modify, key changes, risks', rules: 'Focus on actionable insights' },
  extend: { purpose: 'Build on previous analysis', tasks: ['Review previous findings', 'Extend analysis', 'Add new insights'], expected: 'Extended analysis building on previous', rules: 'Build incrementally, avoid repetition' },
  synthesize: { purpose: 'Refine and synthesize', tasks: ['Review previous', 'Identify gaps', 'Add insights', 'Synthesize findings'], expected: 'Refined synthesis with new perspectives', rules: 'Build collaboratively, add value' },
  propose: { purpose: 'Propose comprehensive analysis', tasks: ['Analyze thoroughly', 'Propose solution', 'State assumptions clearly'], expected: 'Well-reasoned proposal with trade-offs', rules: 'Be clear about assumptions' },
  challenge: { purpose: 'Challenge and stress-test', tasks: ['Identify weaknesses', 'Question assumptions', 'Suggest alternatives', 'Highlight overlooked risks'], expected: 'Constructive critique with counter-arguments', rules: 'Be adversarial but constructive' },
  defend: { purpose: 'Respond to challenges', tasks: ['Address each challenge', 'Defend valid aspects', 'Acknowledge valid criticisms', 'Propose refined solution'], expected: 'Refined proposal incorporating alternatives', rules: 'Be open to criticism, synthesize best ideas' },
  criticize: { purpose: 'Stress-test and find weaknesses', tasks: ['Find logical flaws', 'Identify missed edge cases', 'Propose alternatives', 'Rate criticisms (High/Medium/Low)'], expected: 'Detailed critique with severity ratings', rules: 'Be ruthlessly critical, find every flaw' }
}
```

### Mode Implementations

```javascript
// Parallel: All CLIs run simultaneously
async function executeParallel(clis, task) {
  return await Promise.all(clis.map(cli =>
    execCLI(cli, buildPrompt({ ...PROMPTS.initial, taskDescription: task }), { background: true })
  ))
}

// Sequential: Each CLI builds on previous via --resume
async function executeSequential(clis, task) {
  const results = []
  let prevId = null
  for (const cli of clis) {
    const preset = prevId ? PROMPTS.extend : PROMPTS.initial
    const result = await execCLI(cli, buildPrompt({ ...preset, taskDescription: task }), { resume: prevId })
    results.push(result)
    prevId = extractSessionId(result)
  }
  return results
}

// Collaborative: Multi-round synthesis
async function executeCollaborative(clis, task, rounds = 2) {
  const results = []
  let prevId = null
  for (let r = 0; r < rounds; r++) {
    for (const cli of clis) {
      const preset = !prevId ? PROMPTS.initial : PROMPTS.synthesize
      const result = await execCLI(cli, buildPrompt({ ...preset, taskDescription: task }), { resume: prevId })
      results.push({ cli: cli.name, round: r, result })
      prevId = extractSessionId(result)
    }
  }
  return results
}

// Debate: Propose → Challenge → Defend
async function executeDebate(clis, task) {
  const [cliA, cliB] = clis
  const results = []

  const propose = await execCLI(cliA, buildPrompt({ ...PROMPTS.propose, taskDescription: task }))
  results.push({ phase: 'propose', cli: cliA.name, result: propose })

  const challenge = await execCLI(cliB, buildPrompt({ ...PROMPTS.challenge, taskDescription: task }), { resume: extractSessionId(propose) })
  results.push({ phase: 'challenge', cli: cliB.name, result: challenge })

  const defend = await execCLI(cliA, buildPrompt({ ...PROMPTS.defend, taskDescription: task }), { resume: extractSessionId(challenge) })
  results.push({ phase: 'defend', cli: cliA.name, result: defend })

  return results
}

// Challenge: Analyze → Criticize
async function executeChallenge(clis, task) {
  const [cliA, cliB] = clis
  const results = []

  const analyze = await execCLI(cliA, buildPrompt({ ...PROMPTS.initial, taskDescription: task }))
  results.push({ phase: 'analyze', cli: cliA.name, result: analyze })

  const criticize = await execCLI(cliB, buildPrompt({ ...PROMPTS.criticize, taskDescription: task }), { resume: extractSessionId(analyze) })
  results.push({ phase: 'challenge', cli: cliB.name, result: criticize })

  return results
}
```

### Mode Router & Result Aggregation

```javascript
async function executeAnalysis(mode, clis, taskDescription) {
  switch (mode.name) {
    case 'parallel': return await executeParallel(clis, taskDescription)
    case 'sequential': return await executeSequential(clis, taskDescription)
    case 'collaborative': return await executeCollaborative(clis, taskDescription)
    case 'debate': return await executeDebate(clis, taskDescription)
    case 'challenge': return await executeChallenge(clis, taskDescription)
  }
}

function aggregateResults(mode, results) {
  const base = { mode: mode.name, pattern: mode.pattern, tools_used: results.map(r => r.cli || 'unknown') }

  switch (mode.name) {
    case 'parallel':
      return { ...base, findings: results.map(parseOutput), consensus: findCommonPoints(results), divergences: findDifferences(results) }
    case 'sequential':
      return { ...base, evolution: results.map((r, i) => ({ step: i + 1, analysis: parseOutput(r) })), finalAnalysis: parseOutput(results.at(-1)) }
    case 'collaborative':
      return { ...base, rounds: groupByRound(results), synthesis: extractSynthesis(results.at(-1)) }
    case 'debate':
      return { ...base, proposal: parseOutput(results.find(r => r.phase === 'propose')?.result),
        challenges: parseOutput(results.find(r => r.phase === 'challenge')?.result),
        resolution: parseOutput(results.find(r => r.phase === 'defend')?.result), confidence: calculateDebateConfidence(results) }
    case 'challenge':
      return { ...base, originalAnalysis: parseOutput(results.find(r => r.phase === 'analyze')?.result),
        critiques: parseCritiques(results.find(r => r.phase === 'challenge')?.result), riskScore: calculateRiskScore(results) }
  }
}

// If planPath exists: update Analysis Summary & Execution Plan sections
```

## Phase 4: User Decision

```javascript
function presentSummary(analysis) {
  console.log(`## Analysis Result\n**Mode**: ${analysis.mode} (${analysis.pattern})\n**Tools**: ${analysis.tools_used.join(' → ')}`)

  switch (analysis.mode) {
    case 'parallel':
      console.log(`### Consensus\n${analysis.consensus.map(c => `- ${c}`).join('\n')}\n### Divergences\n${analysis.divergences.map(d => `- ${d}`).join('\n')}`)
      break
    case 'sequential':
      console.log(`### Evolution\n${analysis.evolution.map(e => `**Step ${e.step}**: ${e.analysis.summary}`).join('\n')}\n### Final\n${analysis.finalAnalysis.summary}`)
      break
    case 'collaborative':
      console.log(`### Rounds\n${Object.entries(analysis.rounds).map(([r, a]) => `**Round ${r}**: ${a.map(x => x.cli).join(' + ')}`).join('\n')}\n### Synthesis\n${analysis.synthesis}`)
      break
    case 'debate':
      console.log(`### Debate\n**Proposal**: ${analysis.proposal.summary}\n**Challenges**: ${analysis.challenges.points?.length || 0} points\n**Resolution**: ${analysis.resolution.summary}\n**Confidence**: ${analysis.confidence}%`)
      break
    case 'challenge':
      console.log(`### Challenge\n**Original**: ${analysis.originalAnalysis.summary}\n**Critiques**: ${analysis.critiques.length} issues\n${analysis.critiques.map(c => `- [${c.severity}] ${c.description}`).join('\n')}\n**Risk Score**: ${analysis.riskScore}/100`)
      break
  }
}

AskUserQuestion({
  questions: [{
    question: "How to proceed?",
    header: "Next Step",
    options: [
      { label: "Execute directly", description: "Implement immediately" },
      { label: "Refine analysis", description: "Add constraints, re-analyze" },
      { label: "Change tools", description: "Different tool combination" },
      { label: "Cancel", description: "End workflow" }
    ],
    multiSelect: false
  }]
})
// If planPath exists: record decision to Decisions Made table
// Routing: Execute → Phase 5 | Refine → Phase 3 | Change → Phase 2 | Cancel → End
```

## Phase 5: Direct Execution

```javascript
// Simple tasks: No artifacts | Complex tasks: Update scratchpad doc
const executionAgents = agents.filter(a => a.canExecute)
const executionTool = selectedAgent.canExecute ? selectedAgent : selectedCLIs[0]

if (executionTool.type === 'agent') {
  Task({
    subagent_type: executionTool.name,
    run_in_background: false,
    description: `Execute: ${taskDescription.slice(0, 30)}`,
    prompt: `## Task\n${taskDescription}\n\n## Analysis Results\n${JSON.stringify(aggregatedAnalysis, null, 2)}\n\n## Instructions\n1. Apply changes to identified files\n2. Follow recommended approach\n3. Handle identified risks\n4. Verify changes work correctly`
  })
} else {
  Bash({
    command: `ccw cli -p "
PURPOSE: Implement solution: ${taskDescription}
TASK: ${extractedTasks.join(' • ')}
MODE: write
CONTEXT: @${affectedFiles.join(' @')}
EXPECTED: Working implementation with all changes applied
CONSTRAINTS: Follow existing patterns
" --tool ${executionTool.name} --mode write`,
    run_in_background: false
  })
}
// If planPath exists: update Status to completed/failed, append to Progress Log
```

## TodoWrite Structure

```javascript
TodoWrite({ todos: [
  { content: "Phase 1: Clarify requirements", status: "in_progress", activeForm: "Clarifying requirements" },
  { content: "Phase 1.5: Assess complexity", status: "pending", activeForm: "Assessing complexity" },
  { content: "Phase 2: Select tools", status: "pending", activeForm: "Selecting tools" },
  { content: "Phase 3: Multi-mode analysis", status: "pending", activeForm: "Running analysis" },
  { content: "Phase 4: User decision", status: "pending", activeForm: "Awaiting decision" },
  { content: "Phase 5: Direct execution", status: "pending", activeForm: "Executing" }
]})
```

## Iteration Patterns

| Pattern | Flow |
|---------|------|
| **Direct** | Phase 1 → 2 → 3 → 4(execute) → 5 |
| **Refinement** | Phase 3 → 4(refine) → 3 → 4 → 5 |
| **Tool Adjust** | Phase 2(adjust) → 3 → 4 → 5 |

## Error Handling

| Error | Resolution |
|-------|------------|
| CLI timeout | Retry with secondary model |
| No enabled tools | Ask user to enable tools in cli-tools.json |
| Task unclear | Default to first CLI + code-developer |
| Ambiguous task | Force clarification via AskUser |
| Execution fails | Present error, ask user for direction |
| Plan doc write fails | Continue without doc (degrade to zero-artifact mode) |
| Scratchpad dir missing | Auto-create `.workflow/.scratchpad/` |

## Comparison with multi-cli-plan

| Aspect | lite-lite-lite | multi-cli-plan |
|--------|----------------|----------------|
| **Artifacts** | Conditional (scratchpad doc for complex tasks) | Always (IMPL_PLAN.md, plan.json, synthesis.json) |
| **Session** | Stateless (--resume chaining) | Persistent session folder |
| **Tool Selection** | 3-step (CLI → Mode → Agent) | Config-driven fixed tools |
| **Analysis Modes** | 5 modes with --resume | Fixed synthesis rounds |
| **Complexity** | Auto-detected (simple/moderate/complex) | Assumed complex |
| **Best For** | Quick analysis, simple-to-moderate tasks | Complex multi-step implementations |

## Post-Completion Expansion

完成后询问用户是否扩展为issue(test/enhance/refactor/doc)，选中项调用 `/issue:new "{summary} - {dimension}"`

## Related Commands

```bash
/workflow:multi-cli-plan "complex task"   # Full planning workflow
/workflow:lite-plan "task"                # Single CLI planning
/workflow:lite-execute --in-memory        # Direct execution
```
